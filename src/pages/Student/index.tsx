// src/pages/Student/index.tsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useCourses } from '../../hooks/useCourses';
import { useReservations } from '../../hooks/useReservations';
import { useUserWallet } from '../../hooks/useUserWallet';
import { useCoursePricing } from '../../hooks/useCoursePricing';
import { createReservationWithPayment } from '../../utils/createReservationWithPayment';
import { refreshCourseSessions } from '../../utils/generateCourseSessions';
import { Button } from '../../components/ui/Button';
import { Card, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { BookCourseModal } from './BookCourseModal';
import { StudentErrorBoundary } from './StudentErrorBoundary';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import type { CourseSession, CoursePricing } from '../../types';
import { Calendar, Users, DollarSign, CheckCircle, XCircle, AlertCircle, Wallet } from 'lucide-react';

/**
 * Page Étudiant - Réserver un Cours
 * Design Metalab harmonisé avec le reste du site
 */
export function StudentPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { courses, isLoading: coursesLoading } = useCourses();
  const { createReservation, reservations, isLoading: reservationLoading } = useReservations();
  const { wallet, balance, refreshWallet, hasSufficientBalance } = useUserWallet();
  const { prices } = useCoursePricing();
  const navigate = useNavigate();

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<{ id: number; title: string; price: number; pricingId: number } | null>(null);
  const [sessionsRequired] = useState<number>(1);

  // Redirect if not authenticated or not a student
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'student')) {
      navigate('/dashboard');
    }
  }, [user, authLoading, navigate]);

  // Générer les sessions pour les 30 prochains jours au chargement
  useEffect(() => {
    if (!authLoading && user) {
      console.log('[StudentPage] Génération des sessions...');
      refreshCourseSessions();
    }
  }, [authLoading, user]);

  const handleReserveClick = (course: { id: number; title: string; price: number; pricingId: number }) => {
    setSelectedCourse(course);
    setIsBookingModalOpen(true);
  };

  const handleConfirmBooking = async (session: CourseSession) => {
    if (!selectedCourse || !user) {
      throw new Error('Données de réservation invalides');
    }

    console.log('[StudentPage] Confirmation réservation:', {
      userId: user.id,
      sessionId: session.id,
      pricingId: selectedCourse.pricingId,
      course: selectedCourse.title,
      price: selectedCourse.price,
    });

    const result = await createReservationWithPayment(user.id, session.id, selectedCourse.pricingId);

    console.log('[StudentPage] Résultat:', result);

    if (!result.success) {
      throw new Error(result.error || 'Échec de la réservation');
    }

    // Fermer le modal
    setIsBookingModalOpen(false);
    setSelectedCourse(null);

    // Rafraîchir le wallet
    await refreshWallet();

    // Message de succès
    alert(`✅ Réservation confirmée ! ${result.pricePaid}€ débités. Solde restant: ${result.newBalance?.toFixed(2)}€`);
  };

  const isReserved = (courseId: number): boolean => {
    return reservations.some(
      (r) => r.courseId === courseId && r.studentId === user?.id && r.status !== 'cancelled'
    );
  };

  const activeCourses = courses.filter((c) => c.isActive === 1);
  
  // Helper pour vérifier si le solde est suffisant pour un cours donné
  const canAffordCourse = (price: number): boolean => {
    return balance >= price;
  };

  // Show loading while auth is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 flex items-center justify-center">
        <LoadingSpinner size="lg" color="blue" showLabel label="Chargement..." />
      </div>
    );
  }

  // Redirect if not authorized
  if (!user || user.role !== 'student') {
    return null;
  }

  return (
    <StudentErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100">
        {/* Hero Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 text-white"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center justify-between">
              <div>
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="text-4xl md:text-5xl font-bold mb-3"
                >
                  Réserver un Cours
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="text-blue-100 text-lg"
                >
                  Choisissez votre session et réservez en un clic
                </motion.p>
              </div>
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/reservations')}
                className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full hover:bg-white/30 transition-all"
              >
                <Calendar className="w-5 h-5" />
                <span className="font-medium">Historique</span>
              </motion.button>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-8">
          {/* Wallet Balance Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-8"
          >
            <div className="bg-white rounded-3xl shadow-xl p-6 border border-blue-100">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-400 rounded-2xl flex items-center justify-center">
                    <Wallet className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Votre Portefeuille</h2>
                    <p className="text-gray-600">Solde disponible</p>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-green-600">{balance.toFixed(2)}€</div>
                    <div className="text-sm text-gray-600">Solde actuel</div>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-600">
                  💡 <span className="font-medium">Conseil :</span> Demandez à l'admin d'ajouter des fonds pour réserver des cours.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Courses Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Cours Disponibles</h2>
              <Badge variant={activeCourses.length > 0 ? 'success' : 'danger'}>
                {activeCourses.length} cours{activeCourses.length > 1 ? 's' : ''}
              </Badge>
            </div>

            {activeCourses.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl p-12 text-center shadow-lg"
              >
                <AlertCircle className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Aucun cours disponible</h3>
                <p className="text-gray-600 mb-6">Revenez plus tard pour de nouvelles sessions</p>
                <Button
                  variant="primary"
                  onClick={() => navigate('/home')}
                  className="inline-flex items-center space-x-2"
                >
                  <span>Retour à l'accueil</span>
                </Button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeCourses.map((course, index) => {
                  // Trouver le tarif correspondant au type de cours
                  const courseTypeMap: Record<string, CoursePricing['courseType']> = {
                    'collectif': 'collectif',
                    'particulier': 'particulier',
                    'duo': 'duo',
                  };

                  // Déterminer le type de cours basé sur le titre ou le prix
                  let pricingType: CoursePricing['courseType'] = 'collectif';
                  if (course.title.toLowerCase().includes('particulier')) {
                    pricingType = 'particulier';
                  } else if (course.title.toLowerCase().includes('duo')) {
                    pricingType = 'duo';
                  }

                  // Récupérer le tarif depuis la DB
                  const pricing = prices.find(p => p.courseType === pricingType && p.isActive === 1);
                  const price = pricing?.price ?? course.price;
                  const pricingId = pricing?.id;

                  // Skip this course if pricing is not found
                  if (!pricingId) {
                    console.warn('[StudentPage] Pricing not found for course:', course.id, pricingType);
                    return null;
                  }
                  
                  const hasSufficientBalance = canAffordCourse(price);
                  
                  return (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      whileHover={{ y: -8, scale: 1.02 }}
                    >
                      <Card variant="elevated" className="h-full flex flex-col overflow-hidden rounded-3xl">
                        {/* Card Header */}
                        <div className={`h-3 bg-gradient-to-r ${
                          course.level === 'beginner'
                            ? 'from-green-400 to-green-500'
                            : course.level === 'intermediate'
                            ? 'from-orange-400 to-orange-500'
                            : 'from-red-400 to-red-500'
                        }`} />

                        <CardBody className="flex-1 p-6">
                          <div className="flex items-start justify-between mb-4">
                            <Badge
                              variant={
                                course.level === 'beginner'
                                  ? 'success'
                                  : course.level === 'intermediate'
                                  ? 'warning'
                                  : 'danger'
                              }
                              className="text-sm"
                            >
                              {course.level === 'beginner'
                                ? '🌱 Débutant'
                                : course.level === 'intermediate'
                                ? '⚡ Intermédiaire'
                                : '🔥 Avancé'}
                            </Badge>
                            {isReserved(course.id) && (
                              <Badge variant="info" className="flex items-center space-x-1">
                                <CheckCircle className="w-3 h-3" />
                                <span>Réservé</span>
                              </Badge>
                            )}
                          </div>

                          <h3 className="text-xl font-bold text-gray-900 mb-3">
                            {course.title}
                          </h3>

                          <p className="text-gray-600 mb-6 line-clamp-2">
                            {course.description}
                          </p>

                          <div className="space-y-3">
                            <div className="flex items-center space-x-3 text-gray-600">
                              <Users className="w-5 h-5 text-blue-500" />
                              <span className="text-sm">Max {course.maxStudents} élèves</span>
                            </div>
                            <div className="flex items-center space-x-3 text-gray-600">
                              <DollarSign className="w-5 h-5 text-cyan-500" />
                              <span className="font-semibold text-gray-900">{price}€ / séance</span>
                            </div>
                          </div>
                        </CardBody>

                        {/* Card Footer */}
                        <div className="border-t border-gray-100 p-6 bg-gray-50">
                          {isReserved(course.id) ? (
                            <Button
                              variant="secondary"
                              className="w-full"
                              disabled
                            >
                              <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                              Déjà réservé
                            </Button>
                          ) : (
                            <Button
                              variant={hasSufficientBalance ? 'primary' : 'secondary'}
                              className="w-full"
                              onClick={() => handleReserveClick({ 
                                id: course.id, 
                                title: course.title, 
                                price,
                                pricingId: pricingId ?? 0
                              })}
                              disabled={!hasSufficientBalance}
                              isLoading={reservationLoading}
                            >
                              {hasSufficientBalance ? (
                                <>
                                  <Calendar className="w-5 h-5 mr-2" />
                                  Réserver
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-5 h-5 mr-2 text-red-500" />
                                  Solde insuffisant
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </main>

        {/* Booking Modal */}
        <BookCourseModal
          isOpen={isBookingModalOpen}
          onClose={() => {
            setIsBookingModalOpen(false);
            setSelectedCourse(null);
          }}
          courseTitle={selectedCourse?.title || ''}
          coursePrice={selectedCourse?.price || 0}
          sessionsRequired={sessionsRequired}
          currentBalance={balance || 0}
          onConfirm={handleConfirmBooking}
        />
      </div>
    </StudentErrorBoundary>
  );
}

export default StudentPage;
