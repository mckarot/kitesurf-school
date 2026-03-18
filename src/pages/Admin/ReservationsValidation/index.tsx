// src/pages/Admin/ReservationsValidation/index.tsx
// Page Admin - Validation des réservations
// Design Metalab harmonisé avec le reste du site

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { db } from '../../../db/db';
import { useAuth } from '../../../hooks/useAuth';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import type { Reservation, User, Course, CourseSession } from '../../../types';
import { notifyReservationConfirmed } from '../../../utils/notifications';
import { cancelReservationWithRefund } from '../../../utils/cancelReservationWithRefund';
import {
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Users,
  TrendingUp,
  AlertCircle,
  UserCheck,
  RefreshCcw
} from 'lucide-react';

interface EnrichedReservation extends Reservation {
  student?: User;
  course?: Course;
  session?: CourseSession;
}

export function AdminReservationsValidationPage() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [pendingReservations, setPendingReservations] = useState<EnrichedReservation[]>([]);
  const [instructors, setInstructors] = useState<User[]>([]);
  const [selectedInstructor, setSelectedInstructor] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<number | null>(null);
  const [expandedReservationId, setExpandedReservationId] = useState<number | null>(null);
  const [isMigrating, setIsMigrating] = useState(false);

  // Script de migration pour ajouter pricePaid aux anciennes réservations
  const handleMigratePricePaid = async () => {
    if (!confirm('⚠️ Migration des prix\n\nCe script va ajouter le champ pricePaid à toutes les réservations qui ne l\'ont pas.\n\nContinuer ?')) {
      return;
    }

    setIsMigrating(true);
    let migrated = 0;
    let errors = 0;

    try {
      const allReservations = await db.reservations.toArray();
      
      for (const reservation of allReservations) {
        if (reservation.pricePaid !== undefined && reservation.pricePaid !== null) {
          continue; // Déjà migré
        }

        try {
          // Récupérer la session pour trouver le cours
          const session = await db.courseSessions.get(reservation.courseId);
          if (!session) {
            console.error('Session non trouvée pour reservation:', reservation.id);
            errors++;
            continue;
          }

          // Récupérer le cours pour avoir le prix
          const course = await db.courses.get(session.courseId);
          if (!course) {
            console.error('Cours non trouvé pour session:', session.id);
            errors++;
            continue;
          }

          // Mettre à jour la réservation avec le prix
          await db.reservations.update(reservation.id, {
            pricePaid: course.price
          });

          migrated++;
          console.log(`[Migration] Reservation ${reservation.id}: ${course.price}€`);
        } catch (err) {
          console.error('[Migration] Erreur:', err);
          errors++;
        }
      }

      alert(`✅ Migration terminée !\n\n${migrated} réservation(s) migrée(s)\n${errors} erreur(s)`);
      
      // Recharger les réservations
      window.location.reload();
    } catch (error) {
      console.error('[Migration] Error:', error);
      alert('❌ Erreur lors de la migration');
    } finally {
      setIsMigrating(false);
    }
  };

  // Vérifier l'authentification
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Charger les réservations en attente et les moniteurs
  useEffect(() => {
    async function loadData() {
      try {
        const [reservations, users] = await Promise.all([
          db.reservations.where('status').equals('pending').toArray(),
          db.users.toArray(),
        ]);

        const instructorsList = users.filter(u => u.role === 'instructor');
        setInstructors(instructorsList);

        // Enrichir les réservations avec les données utilisateur et cours
        const enriched = await Promise.all(
          reservations.map(async (r) => {
            // IMPORTANT: r.courseId pointe vers une CourseSession, pas un Course !
            const [student, session, course] = await Promise.all([
              db.users.get(r.studentId),
              r.sessionId ? db.courseSessions.get(r.sessionId) : db.courseSessions.get(r.courseId),
              // D'abord récupérer la session, puis le cours via session.courseId
              (async () => {
                const sess = r.sessionId ? await db.courseSessions.get(r.sessionId) : await db.courseSessions.get(r.courseId);
                return sess ? await db.courses.get(sess.courseId) : null;
              })(),
            ]);

            return { ...r, student, course: course || undefined, session };
          })
        );

        setPendingReservations(enriched);
      } catch (error) {
        console.error('Error loading pending reservations:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  // Confirmer une réservation avec assignation de moniteur
  const handleConfirm = async (reservationId: number) => {
    const instructorId = selectedInstructor[reservationId];

    if (!instructorId) {
      alert('Veuillez sélectionner un moniteur pour cette réservation');
      return;
    }

    setIsProcessing(reservationId);

    try {
      // Mettre à jour la réservation
      await db.reservations.update(reservationId, {
        instructorId,
        status: 'confirmed' as const,
      });

      // Récupérer les données pour la notification
      const reservation = await db.reservations.get(reservationId);
      if (reservation) {
        // IMPORTANT: reservation.courseId pointe vers une CourseSession
        const [student, session, course, instructor] = await Promise.all([
          db.users.get(reservation.studentId),
          reservation.sessionId ? db.courseSessions.get(reservation.sessionId) : db.courseSessions.get(reservation.courseId),
          (async () => {
            const sess = reservation.sessionId ? await db.courseSessions.get(reservation.sessionId) : await db.courseSessions.get(reservation.courseId);
            return sess ? await db.courses.get(sess.courseId) : null;
          })(),
          db.users.get(instructorId),
        ]);

        // Créer la notification
        if (student && course && session) {
          await notifyReservationConfirmed(
            reservation.studentId,
            reservationId,
            course.title,
            (() => {
              const [year, month, day] = session.date.split('-').map(Number);
              return new Date(year, month - 1, day).toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              });
            })(),
            instructor?.firstName && instructor.lastName
              ? `${instructor.firstName} ${instructor.lastName}`
              : undefined
          );
        }
      }

      // Retirer de la liste
      setPendingReservations(prev => prev.filter(r => r.id !== reservationId));
      setExpandedReservationId(null);
    } catch (error) {
      console.error('Error confirming reservation:', error);
      alert('Erreur lors de la confirmation');
    } finally {
      setIsProcessing(null);
    }
  };

  // Annuler une réservation
  const handleCancel = async (reservationId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette réservation ?\n\nLes séances consommées seront recréditées à l\'élève.')) {
      return;
    }

    setIsProcessing(reservationId);

    try {
      // Utiliser la fonction d'annulation avec remboursement
      const result = await cancelReservationWithRefund(reservationId);

      if (!result.success) {
        throw new Error(result.error);
      }

      // Retirer de la liste
      setPendingReservations(prev => prev.filter(r => r.id !== reservationId));
      setExpandedReservationId(null);

      alert('✅ Réservation annulée et séances recréditées');
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      alert('Erreur lors de l\'annulation: ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
    } finally {
      setIsProcessing(null);
    }
  };

  // Toggle expand/collapse
  const toggleExpand = (reservationId: number) => {
    setExpandedReservationId(expandedReservationId === reservationId ? null : reservationId);
  };

  if (authLoading || (isLoading && pendingReservations.length === 0)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-100 flex items-center justify-center">
        <div aria-busy="true" aria-live="polite" className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-orange-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Chargement des réservations...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  const stats = {
    total: pendingReservations.length,
    today: pendingReservations.filter(r => {
      const today = new Date().toDateString();
      return r.session?.date && (() => {
        const [year, month, day] = r.session.date.split('-').map(Number);
        return new Date(year, month - 1, day).toDateString() === today;
      })();
    }).length,
    thisWeek: pendingReservations.filter(r => {
      if (!r.session?.date) return false;
      const now = new Date();
      const [year, month, day] = r.session.date.split('-').map(Number);
      const reservationDate = new Date(year, month - 1, day);
      const diffTime = Math.abs(reservationDate.getTime() - now.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    }).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-100">
      {/* Hero Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 text-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => window.history.back()}
                className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/30 transition-all"
                aria-label="Retour"
              >
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </motion.button>
              <div>
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="text-4xl md:text-5xl font-bold"
                >
                  Réservations
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-orange-100 text-lg mt-2"
                >
                  Validez et assignez les moniteurs
                </motion.p>
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="text-right"
            >
              <div className="text-5xl font-bold">{stats.total}</div>
              <div className="text-orange-100">en attente</div>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-8">
        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <div className="bg-white rounded-3xl shadow-xl p-6 border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total en attente</p>
                <p className="text-4xl font-bold text-orange-600">{stats.total}</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-400 rounded-2xl flex items-center justify-center">
                <Clock className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-6 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Aujourd'hui</p>
                <p className="text-4xl font-bold text-blue-600">{stats.today}</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center">
                <Calendar className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-6 border border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Cette semaine</p>
                <p className="text-4xl font-bold text-purple-600">{stats.thisWeek}</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-400 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-6 rounded-2xl bg-blue-50 border border-blue-200 p-4"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Validation requise</p>
              <p>
                Chaque réservation doit être validée et un moniteur doit être assigné avant confirmation.
                Une notification sera envoyée à l'élève après validation.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Debug Button - TEMPORAIRE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mb-6"
        >
          <button
            onClick={handleMigratePricePaid}
            disabled={isMigrating}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCcw className={`w-5 h-5 ${isMigrating ? 'animate-spin' : ''}`} />
            {isMigrating ? 'Migration en cours...' : '🔧 MIGRER pricePaid (DEBUG)'}
          </button>
          <p className="text-xs text-gray-500 mt-2">
            ⚠️ Ce bouton est temporaire - à supprimer après usage
          </p>
        </motion.div>

        {/* Reservations List */}
        {pendingReservations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-xl p-12 text-center"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-green-200 to-green-300 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Aucune réservation en attente</h3>
            <p className="text-gray-600">Toutes les réservations ont été traitées</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {pendingReservations.map((reservation, index) => (
              <motion.div
                key={reservation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
              >
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all">
                  {/* Header de la carte */}
                  <div
                    className="p-6 cursor-pointer"
                    onClick={() => toggleExpand(reservation.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-400 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                          {reservation.student?.firstName?.[0] || '?'}{reservation.student?.lastName?.[0] || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-gray-900 truncate">
                            {reservation.student?.firstName} {reservation.student?.lastName}
                          </h3>
                          <p className="text-sm text-gray-600 truncate">{reservation.student?.email}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant="warning" className="flex items-center space-x-1 text-xs">
                              <Clock className="w-3 h-3" />
                              <span>En attente</span>
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {new Date(reservation.createdAt).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-orange-600">{reservation.course?.price || 0}€</div>
                          <div className="text-gray-600 text-sm">1 séance</div>
                        </div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform ${
                          expandedReservationId === reservation.id ? 'rotate-180' : ''
                        }`}>
                          <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contenu détaillé (expandable) */}
                  {expandedReservationId === reservation.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-gray-100"
                    >
                      <div className="p-6 space-y-6">
                        {/* Détails du cours */}
                        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-4">
                          <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                            <Calendar className="w-5 h-5 text-orange-600 mr-2" />
                            Détails de la réservation
                          </h4>
                          <div className="grid md:grid-cols-3 gap-4">
                            <div>
                              <div className="text-sm text-gray-600">Cours</div>
                              <div className="font-semibold text-gray-900">{reservation.course?.title || 'N/A'}</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600">Date</div>
                              <div className="font-semibold text-gray-900">
                                {reservation.session?.date
                                  ? (() => {
                                      const [year, month, day] = reservation.session.date.split('-').map(Number);
                                      return new Date(year, month - 1, day).toLocaleDateString('fr-FR', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                      });
                                    })()
                                  : 'N/A'}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600">Horaires</div>
                              <div className="font-semibold text-gray-900">
                                {reservation.session?.startTime || 'N/A'} - {reservation.session?.endTime || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Sélection du moniteur */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <UserCheck className="w-4 h-4 mr-2" />
                            Assigner un moniteur
                          </label>
                          <select
                            value={selectedInstructor[reservation.id] || ''}
                            onChange={(e) => setSelectedInstructor(prev => ({
                              ...prev,
                              [reservation.id]: parseInt(e.target.value, 10)
                            }))}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all bg-white"
                          >
                            <option value="">Sélectionner un moniteur...</option>
                            {instructors.map(instructor => (
                              <option key={instructor.id} value={instructor.id}>
                                {instructor.firstName} {instructor.lastName}
                              </option>
                            ))}
                          </select>
                          {!selectedInstructor[reservation.id] && (
                            <p className="text-xs text-orange-600 mt-2 flex items-center">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              <span>La sélection d'un moniteur est requise pour confirmer</span>
                            </p>
                          )}
                        </div>

                        {/* Boutons d'action */}
                        <div className="flex space-x-4 pt-4 border-t border-gray-200">
                          <Button
                            variant="primary"
                            onClick={() => handleConfirm(reservation.id)}
                            isLoading={isProcessing === reservation.id}
                            disabled={!selectedInstructor[reservation.id]}
                            className="flex-1 flex items-center justify-center space-x-2"
                          >
                            <CheckCircle className="w-5 h-5" />
                            <span>Confirmer</span>
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={() => handleCancel(reservation.id)}
                            isLoading={isProcessing === reservation.id}
                            className="flex-1 flex items-center justify-center space-x-2 bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
                          >
                            <XCircle className="w-5 h-5" />
                            <span>Annuler</span>
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminReservationsValidationPage;
