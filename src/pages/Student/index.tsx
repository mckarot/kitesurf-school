// src/pages/Student/index.tsx
// Page Étudiant - Synchronisée avec CourseCards et PackCards

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useCourseCards } from '../../hooks/useCourseCards';
import { usePackCards } from '../../hooks/usePackCards';
import { useReservations } from '../../hooks/useReservations';
import { useUserWallet } from '../../hooks/useUserWallet';
import { createReservationWithPayment } from '../../utils/createReservationWithPayment';
import { refreshCourseSessions } from '../../utils/generateCourseSessions';
import { Button } from '../../components/ui/Button';
import { Card, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { BookCourseModal } from './BookCourseModal';
import { StudentErrorBoundary } from './StudentErrorBoundary';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import type { CourseSession, CourseCard, PackCard } from '../../types';
import { Calendar, Users, DollarSign, CheckCircle, XCircle, AlertCircle, Wallet, Star, Zap, UsersRound } from 'lucide-react';

// Map icon names to actual components
const ICON_MAP: Record<string, any> = {
  Users,
  UsersRound,
  Star,
  Zap,
};

/**
 * Page Étudiant - Réserver un Cours
 * Design Metalab harmonisé avec le reste du site
 * Utilise les CourseCards et PackCards depuis la base de données
 */
export function StudentPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { cards: courseCards, isLoading: courseCardsLoading } = useCourseCards();
  const { cards: packCards, isLoading: packCardsLoading } = usePackCards();
  const { createReservation, reservations, isLoading: reservationLoading } = useReservations();
  const { wallet, balance, refreshWallet, hasSufficientBalance } = useUserWallet();
  const navigate = useNavigate();

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedCourseCard, setSelectedCourseCard] = useState<{ id: number; title: string; price: number; courseType: CourseCard['courseType'] } | null>(null);
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

  const handleReserveClick = (courseCard: { id: number; title: string; price: number; courseType: CourseCard['courseType'] }) => {
    setSelectedCourseCard(courseCard);
    setIsBookingModalOpen(true);
  };

  const handleConfirmBooking = async (session: CourseSession) => {
    if (!selectedCourseCard || !user) {
      throw new Error('Données de réservation invalides');
    }

    console.log('[StudentPage] Confirmation réservation:', {
      userId: user.id,
      sessionId: session.id,
      courseType: selectedCourseCard.courseType,
      course: selectedCourseCard.title,
      price: selectedCourseCard.price,
    });

    // Passer le prix directement depuis la CourseCard
    const result = await createReservationWithPayment(user.id, session.id, selectedCourseCard.courseType, selectedCourseCard.price);

    console.log('[StudentPage] Résultat:', result);

    if (!result.success) {
      throw new Error(result.error || 'Échec de la réservation');
    }

    // Fermer le modal
    setIsBookingModalOpen(false);
    setSelectedCourseCard(null);

    // Rafraîchir le wallet
    await refreshWallet();

    // Message de succès
    alert(`✅ Réservation confirmée ! ${result.pricePaid}€ débités. Solde restant: ${result.newBalance?.toFixed(2)}€`);
  };

  const isReserved = (courseType: CourseCard['courseType']): boolean => {
    // Check if user has active reservations for this course type
    // Note: We check by courseType since CourseCards represent course types, not specific courses
    return reservations.some(
      (r) => r.courseType === courseType && r.studentId === user?.id && r.status !== 'cancelled'
    );
  };

  // Filtrer les cartes actives
  const activeCourseCards = courseCards.filter(card => card.isActive === 1);
  const activePackCards = packCards.filter(card => card.isActive === 1);

  // Helper pour vérifier si le solde est suffisant pour un cours donné
  const canAffordCourse = (price: number): boolean => {
    return balance >= price;
  };

  // Show loading while auth or data is being checked
  if (authLoading || courseCardsLoading || packCardsLoading) {
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
                  Choisissez votre formule et réservez en un clic
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

          {/* CourseCards Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Formules de Cours</h2>
              <Badge variant={activeCourseCards.length > 0 ? 'success' : 'danger'}>
                {activeCourseCards.length} formule{activeCourseCards.length > 1 ? 's' : ''}
              </Badge>
            </div>

            {activeCourseCards.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl p-12 text-center shadow-lg"
              >
                <AlertCircle className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Aucune formule disponible</h3>
                <p className="text-gray-600 mb-6">Revenez plus tard pour de nouvelles formules</p>
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
                {activeCourseCards.map((card, index) => {
                  const IconComponent = ICON_MAP[card.icon] || Users;
                  const hasSufficientBalance = canAffordCourse(card.price);
                  const isCardReserved = isReserved(card.courseType);

                  return (
                    <motion.div
                      key={card.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      whileHover={{ y: -8, scale: 1.02 }}
                    >
                      <Card variant="elevated" className="h-full flex flex-col overflow-hidden rounded-3xl">
                        {/* Card Header */}
                        <div className={`h-3 bg-gradient-to-r ${card.color}`} />

                        <CardBody className="flex-1 p-6">
                          <div className="flex items-start justify-between mb-4">
                            <Badge
                              variant={
                                card.courseType === 'collectif'
                                  ? 'success'
                                  : card.courseType === 'particulier'
                                  ? 'warning'
                                  : 'danger'
                              }
                              className="text-sm"
                            >
                              {card.courseType === 'collectif'
                                ? '👥 Collectif'
                                : card.courseType === 'particulier'
                                ? '🎯 Particulier'
                                : '👥 Duo'}
                            </Badge>
                            {isCardReserved && (
                              <Badge variant="info" className="flex items-center space-x-1">
                                <CheckCircle className="w-3 h-3" />
                                <span>Réservé</span>
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center space-x-3 mb-4">
                            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${card.color}`}>
                              <IconComponent className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">
                              {card.title}
                            </h3>
                          </div>

                          <p className="text-gray-600 mb-6 line-clamp-2">
                            {card.description}
                          </p>

                          <div className="space-y-3">
                            <div className="flex items-center space-x-3 text-gray-600">
                              <Users className="w-5 h-5 text-blue-500" />
                              <span className="text-sm">Max {card.maxStudents} {card.maxStudents === 1 ? 'élève' : 'élèves'}</span>
                            </div>
                            <div className="flex items-center space-x-3 text-gray-600">
                              <DollarSign className="w-5 h-5 text-cyan-500" />
                              <span className="font-semibold text-gray-900">{card.price}€ / séance</span>
                            </div>
                          </div>

                          <ul className="space-y-2 mt-4">
                            {card.features.slice(0, 3).map((feature) => (
                              <li key={feature} className="flex items-start space-x-2 text-sm text-gray-600">
                                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </CardBody>

                        {/* Card Footer */}
                        <div className="border-t border-gray-100 p-6 bg-gray-50">
                          {isCardReserved ? (
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
                                id: card.id,
                                title: card.title,
                                price: card.price,
                                courseType: card.courseType
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

          {/* PackCards Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-12"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Packs Économiques</h2>
              <Badge variant={activePackCards.length > 0 ? 'success' : 'danger'}>
                {activePackCards.length} pack{activePackCards.length > 1 ? 's' : ''}
              </Badge>
            </div>

            {activePackCards.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl p-12 text-center shadow-lg"
              >
                <AlertCircle className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Aucun pack disponible</h3>
                <p className="text-gray-600 mb-6">Revenez plus tard pour de nouveaux packs</p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activePackCards.map((pack, index) => {
                  const IconComponent = ICON_MAP[pack.icon] || Star;
                  const hasSufficientBalance = canAffordCourse(pack.price);

                  return (
                    <motion.div
                      key={pack.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      whileHover={{ y: -8, scale: 1.02 }}
                    >
                      <Card variant="elevated" className="h-full flex flex-col overflow-hidden rounded-3xl">
                        {/* Card Header */}
                        {pack.badge && (
                          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                              {pack.badge}
                            </div>
                          </div>
                        )}

                        <div className={`h-3 bg-gradient-to-r ${pack.color}`} />

                        <CardBody className="flex-1 p-6">
                          <div className="flex items-center space-x-3 mb-4">
                            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${pack.color}`}>
                              <IconComponent className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">
                              {pack.title}
                            </h3>
                          </div>

                          <p className="text-gray-600 mb-6 line-clamp-2">
                            {pack.description}
                          </p>

                          <div className="text-center mb-6">
                            <div className="flex items-center justify-center space-x-3">
                              <span className="text-4xl font-bold text-gray-900">{pack.price}€</span>
                              {pack.originalPrice && (
                                <div className="text-left">
                                  <div className="text-sm text-gray-500 line-through">{pack.originalPrice}€</div>
                                  {pack.discount !== undefined && pack.discount > 0 && (
                                    <div className="text-sm text-green-600 font-semibold">-{pack.discount}€</div>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="text-gray-600 mt-2">{pack.sessions} séances</div>
                          </div>

                          <ul className="space-y-2">
                            {pack.features.slice(0, 4).map((feature) => (
                              <li key={feature} className="flex items-start space-x-2 text-sm text-gray-600">
                                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </CardBody>

                        {/* Card Footer */}
                        <div className="border-t border-gray-100 p-6 bg-gray-50">
                          <Button
                            variant={hasSufficientBalance ? 'primary' : 'secondary'}
                            className="w-full"
                            disabled={!hasSufficientBalance}
                            isLoading={reservationLoading}
                          >
                            {hasSufficientBalance ? (
                              <>
                                <Calendar className="w-5 h-5 mr-2" />
                                Choisir ce pack
                              </>
                            ) : (
                              <>
                                <XCircle className="w-5 h-5 mr-2 text-red-500" />
                                Solde insuffisant
                              </>
                            )}
                          </Button>
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
            setSelectedCourseCard(null);
          }}
          courseTitle={selectedCourseCard?.title || ''}
          coursePrice={selectedCourseCard?.price || 0}
          sessionsRequired={sessionsRequired}
          currentBalance={balance || 0}
          onConfirm={handleConfirmBooking}
        />
      </div>
    </StudentErrorBoundary>
  );
}

export default StudentPage;
