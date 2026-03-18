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
import { Calendar, Users, DollarSign, CheckCircle, XCircle, AlertCircle, Wallet, Star, Zap, UsersRound, Award, Check } from 'lucide-react';

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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                      whileHover={{ y: -12, scale: 1.02 }}
                      className={`relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 ${
                        card.isHighlighted === 1 ? 'ring-2 ring-purple-500 ring-offset-4' : ''
                      }`}
                    >
                      {/* Badge */}
                      {card.badge && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                            {card.badge}
                          </div>
                        </div>
                      )}

                      {/* Icon */}
                      <div
                        className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${card.color} mb-6`}
                      >
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>

                      {/* Title */}
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {card.title}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-600 mb-6">
                        {card.description}
                      </p>

                      {/* Price */}
                      <div className="flex items-baseline mb-6">
                        <span className="text-5xl font-bold text-gray-900">{card.price}€</span>
                        <span className="text-gray-600 ml-2">/séance</span>
                      </div>

                      {/* Details */}
                      <div className="space-y-3 mb-8">
                        <div className="flex items-center space-x-2 text-gray-700">
                          <Users className="w-5 h-5 text-blue-500" />
                          <span>Max {card.maxStudents} {card.maxStudents === 1 ? 'élève' : 'élèves'}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-700">
                          <Award className="w-5 h-5 text-blue-500" />
                          <span>{card.level}</span>
                        </div>
                      </div>

                      {/* Features */}
                      <ul className="space-y-3 mb-8">
                        {card.features.map((feature) => (
                          <li key={feature} className="flex items-start space-x-2">
                            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Button */}
                      {isCardReserved ? (
                        <Button
                          variant="secondary"
                          className="w-full py-4 text-lg"
                          disabled
                        >
                          <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                          Déjà réservé
                        </Button>
                      ) : (
                        <Button
                          variant={hasSufficientBalance ? 'primary' : 'secondary'}
                          className={`w-full py-4 text-lg transition-all ${
                            hasSufficientBalance && card.badge
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg'
                              : ''
                          }`}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {activePackCards.map((pack, index) => {
                  const IconComponent = ICON_MAP[pack.icon] || Star;
                  const hasSufficientBalance = canAffordCourse(pack.price);

                  return (
                    <motion.div
                      key={pack.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      whileHover={{ y: -12, scale: 1.02 }}
                      className={`relative bg-gradient-to-br from-gray-50 to-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 ${
                        pack.isHighlighted === 1 ? 'border-purple-500' : 'border-transparent'
                      }`}
                    >
                      {/* Badge */}
                      {pack.badge && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                            {pack.badge}
                          </div>
                        </div>
                      )}

                      {/* Title & Description */}
                      <div className="text-center mb-6">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{pack.title}</h3>
                        <p className="text-gray-600">{pack.description}</p>
                      </div>

                      {/* Price */}
                      <div className="text-center mb-6">
                        <div className="flex items-center justify-center space-x-3">
                          <span className="text-5xl font-bold text-gray-900">{pack.price}€</span>
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

                      {/* Features */}
                      <ul className="space-y-3 mb-8">
                        {pack.features.map((feature) => (
                          <li key={feature} className="flex items-start space-x-2">
                            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Button */}
                      <Button
                        variant={hasSufficientBalance ? 'primary' : 'secondary'}
                        className={`w-full py-4 text-lg transition-all ${
                          hasSufficientBalance && pack.badge
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg'
                            : ''
                        }`}
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
