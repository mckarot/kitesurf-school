// src/pages/Student/index.tsx

import { useState, useEffect } from 'react';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCourses } from '../../hooks/useCourses';
import { useReservations } from '../../hooks/useReservations';
import { useStudentBalance } from '../../hooks/useStudentBalance';
import { createReservationWithCredit } from '../../utils/createReservationWithCredit';
import { Button } from '../../components/ui/Button';
import { Card, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Navigate } from 'react-router-dom';
import { StudentBalance } from './StudentBalance';
import { BookCourseModal } from './BookCourseModal';
import { StudentErrorBoundary } from './StudentErrorBoundary';
import type { CourseSession } from '../../types';
import type { StudentLoaderData } from './loader';

/**
 * Page Étudiant - Réserver un Cours
 *
 * Route: /student
 *
 * Fonctionnalités:
 * - Affichage du solde de crédits en en-tête
 * - Liste des cours disponibles
 * - Réservation avec décrémentation automatique des crédits
 * - Modal de confirmation avec impact sur le solde
 *
 * Business Logic:
 * - 1 réservation = 1 séance consommée
 *
 * Données chargées par loader:
 * - credits: Crédits de l'étudiant
 * - reservations: Réservations de l'étudiant
 * - sessions: Sessions de cours disponibles
 *
 * @returns JSX.Element - Page de réservation étudiant
 */
export function StudentPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { courses, isLoading: coursesLoading } = useCourses();
  const { createReservation, reservations, isLoading: reservationLoading } = useReservations();
  const { credits, reservations: loaderReservations } = useLoaderData() as StudentLoaderData;
  const { balance, refreshBalance } = useStudentBalance();
  const navigate = useNavigate();

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<{ id: number; title: string; price: number } | null>(null);
  const [sessionsRequired] = useState<number>(1); // 1 séance par réservation

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div aria-busy="true" aria-live="polite" className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'student') {
    return <Navigate to="/dashboard" replace />;
  }

  const handleReserveClick = (course: { id: number; title: string; price: number }) => {
    setSelectedCourse(course);
    setIsBookingModalOpen(true);
  };

  const handleConfirmBooking = async (session: CourseSession) => {
    if (!selectedCourse || !user) {
      throw new Error('Données de réservation invalides');
    }

    // Créer la réservation avec décrémentation des crédits (1 séance par réservation)
    const result = await createReservationWithCredit(
      user.id,
      session.id,
      sessionsRequired
    );

    if (!result.success) {
      throw new Error(result.error || 'Échec de la réservation');
    }

    // Rafraîchir le solde et les réservations
    await refreshBalance();
    navigate(0); // Recharger pour mettre à jour les données du loader
  };

  const isReserved = (courseId: number): boolean => {
    return reservations.some(
      (r) => r.courseId === courseId && r.studentId === user.id && r.status !== 'cancelled'
    );
  };

  const activeCourses = courses.filter((c) => c.isActive === 1);
  const hasSufficientBalance = (balance?.remainingSessions || 0) >= sessionsRequired;

  return (
    <StudentErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <a href="/dashboard" className="text-gray-600 hover:text-gray-900">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </a>
                <h1 className="text-xl font-bold text-gray-900">Réserver un cours</h1>
              </div>
              <a
                href="/reservations"
                className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Mon historique
              </a>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Solde de l'étudiant */}
          {balance && (
            <div className="mb-8">
              <StudentBalance balance={balance} />
            </div>
          )}

          {coursesLoading ? (
            <div aria-busy="true" className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
              <p className="text-gray-600">Chargement des cours...</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <p className="text-gray-600">
                  {activeCourses.length} cours disponible{activeCourses.length > 1 ? 's' : ''}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeCourses.map((course) => (
                  <Card key={course.id} variant="elevated" className="flex flex-col">
                    <CardBody className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <Badge
                          variant={
                            course.level === 'beginner'
                              ? 'success'
                              : course.level === 'intermediate'
                              ? 'warning'
                              : 'danger'
                          }
                        >
                          {course.level === 'beginner'
                            ? 'Débutant'
                            : course.level === 'intermediate'
                            ? 'Intermédiaire'
                            : 'Avancé'}
                        </Badge>
                        {isReserved(course.id) && (
                          <Badge variant="info">Réservé</Badge>
                        )}
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {course.title}
                      </h3>

                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {course.description}
                      </p>

                      <div className="space-y-2 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          <span>Max {course.maxStudents} élèves</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-medium text-gray-900">{course.price}€</span>
                        </div>
                      </div>
                    </CardBody>

                    <div className="border-t border-gray-100 p-4">
                      {isReserved(course.id) ? (
                        <Button
                          variant="secondary"
                          className="w-full"
                          disabled
                          aria-label={`Cours ${course.title} déjà réservé`}
                        >
                          Déjà réservé
                        </Button>
                      ) : (
                        <Button
                          variant={hasSufficientBalance ? 'primary' : 'secondary'}
                          className="w-full"
                          onClick={() => handleReserveClick(course)}
                          disabled={!hasSufficientBalance}
                          isLoading={reservationLoading}
                          aria-label={
                            hasSufficientBalance
                              ? `Réserver le cours ${course.title}`
                              : `Solde insuffisant pour ${course.title}`
                          }
                        >
                          {hasSufficientBalance ? 'Réserver' : 'Solde insuffisant'}
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>

              {activeCourses.length === 0 && (
                <div className="text-center py-12">
                  <svg
                    className="w-16 h-16 text-gray-300 mx-auto mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-gray-600">Aucun cours disponible pour le moment</p>
                </div>
              )}
            </>
          )}
        </main>

        {/* Modal de confirmation de réservation */}
        <BookCourseModal
          isOpen={isBookingModalOpen}
          onClose={() => {
            setIsBookingModalOpen(false);
            setSelectedCourse(null);
          }}
          courseTitle={selectedCourse?.title || ''}
          coursePrice={selectedCourse?.price || 0}
          sessionsRequired={sessionsRequired}
          currentBalance={balance?.remainingSessions || 0}
          onConfirm={handleConfirmBooking}
        />
      </div>
    </StudentErrorBoundary>
  );
}

export default StudentPage;
