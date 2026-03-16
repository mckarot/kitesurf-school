// src/pages/Admin/ReservationsValidation/index.tsx

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '../../../db/db';
import { useAuth } from '../../../hooks/useAuth';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Card, CardBody } from '../../../components/ui/Card';
import type { Reservation, User, Course, CourseSession } from '../../../types';
import { notifyReservationConfirmed } from '../../../utils/notifications';
import { cancelReservationWithRefund } from '../../../utils/cancelReservationWithRefund';
import { CheckCircle, XCircle, Clock, User as UserIcon, Calendar, AlertCircle } from 'lucide-react';

export function AdminReservationsValidationPage() {
  const { user } = useAuth();
  const [pendingReservations, setPendingReservations] = useState<Array<Reservation & {
    student?: User;
    course?: Course;
    session?: CourseSession;
  }>>([]);
  const [instructors, setInstructors] = useState<User[]>([]);
  const [selectedInstructor, setSelectedInstructor] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<number | null>(null);

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
            const [student, course, session] = await Promise.all([
              db.users.get(r.studentId),
              db.courses.get(r.courseId),
              r.sessionId ? db.courseSessions.get(r.sessionId) : undefined,
            ]);

            return { ...r, student, course, session };
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
        const [student, course, session, instructor] = await Promise.all([
          db.users.get(reservation.studentId),
          db.courses.get(reservation.courseId),
          reservation.sessionId ? db.courseSessions.get(reservation.sessionId) : null,
          db.users.get(instructorId),
        ]);

        // Créer la notification
        if (student && course && session) {
          await notifyReservationConfirmed(
            reservation.studentId,
            reservationId,
            course.title,
            new Date(session.date).toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            instructor?.firstName && instructor.lastName 
              ? `${instructor.firstName} ${instructor.lastName}`
              : undefined
          );
        }
      }

      // Retirer de la liste
      setPendingReservations(prev => prev.filter(r => r.id !== reservationId));
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
      
      alert('✅ Réservation annulée et séances recréditées');
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      alert('Erreur lors de l\'annulation: ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
    } finally {
      setIsProcessing(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 flex items-center justify-center">
        <LoadingSpinner size="lg" color="blue" showLabel label="Chargement des réservations..." />
      </div>
    );
  }

  return (
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
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="flex items-center space-x-3 mb-3"
              >
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold">Réservations en Attente</h1>
              </motion.div>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-blue-100 text-lg"
              >
                Confirmez les réservations et assignez les moniteurs
              </motion.p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold">{pendingReservations.length}</div>
              <div className="text-blue-100">en attente</div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-8">
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
          <div className="space-y-6">
            {pendingReservations.map((reservation, index) => (
              <motion.div
                key={reservation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card variant="elevated" className="overflow-hidden rounded-3xl">
                  <CardBody className="p-6">
                    {/* Header de la carte */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                          {reservation.student?.firstName?.[0]}{reservation.student?.lastName?.[0]}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            {reservation.student?.firstName} {reservation.student?.lastName}
                          </h3>
                          <p className="text-gray-600">{reservation.student?.email}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant="warning" className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>En attente</span>
                            </Badge>
                            <Badge variant="info">
                              {new Date(reservation.createdAt).toLocaleDateString('fr-FR')}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{reservation.course?.price || 0}€</div>
                        <div className="text-gray-600 text-sm">1 séance</div>
                      </div>
                    </div>

                    {/* Détails du cours */}
                    <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                      <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                        <Calendar className="w-5 h-5 text-blue-600 mr-2" />
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
                              ? new Date(reservation.session.date).toLocaleDateString('fr-FR', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })
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
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <UserIcon className="w-4 h-4 mr-2" />
                        Assigner un moniteur
                      </label>
                      <select
                        value={selectedInstructor[reservation.id] || ''}
                        onChange={(e) => setSelectedInstructor(prev => ({
                          ...prev,
                          [reservation.id]: parseInt(e.target.value, 10)
                        }))}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        <option value="">Sélectionner un moniteur...</option>
                        {instructors.map(instructor => (
                          <option key={instructor.id} value={instructor.id}>
                            {instructor.firstName} {instructor.lastName}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Boutons d'action */}
                    <div className="flex space-x-4">
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
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
