// src/pages/Instructor/index.tsx

import { useLoaderData } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCourses } from '../../hooks/useCourses';
import { useReservations } from '../../hooks/useReservations';
import { Card, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Navigate } from 'react-router-dom';
import { AssignedStudents } from './AssignedStudents';
import { ScheduleWithStudents } from './ScheduleWithStudents';
import { InstructorErrorBoundary } from './InstructorErrorBoundary';
import type { InstructorLoaderData } from './loader';

/**
 * Page Moniteur - Espace de Gestion
 * 
 * Route: /instructor
 * 
 * Fonctionnalités:
 * - Vue d'ensemble des cours assignés
 * - Liste des élèves assignés avec leurs soldes de crédits
 * - Emploi du temps avec les noms des élèves réservés
 * - Statistiques personnelles
 * 
 * Données chargées par loader:
 * - credits: Tous les crédits de cours (filtrage en mémoire)
 * - timeSlots: Créneaux horaires du moniteur
 * - students: Tous les élèves
 * - reservations: Toutes les réservations
 * 
 * @returns JSX.Element - Page moniteur
 */
export function InstructorPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { credits, timeSlots, students, reservations, courses, instructorId } = useLoaderData() as InstructorLoaderData;

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

  if (!user || user.role !== 'instructor') {
    return <Navigate to="/dashboard" replace />;
  }

  const myCourses = courses.filter((c) => c.instructorId === instructorId && c.isActive === 1);

  const getReservationCount = (courseId: number): number => {
    return reservations.filter(
      (r) => r.courseId === courseId && r.status !== 'cancelled'
    ).length;
  };

  return (
    <InstructorErrorBoundary>
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
                <h1 className="text-xl font-bold text-gray-900">Espace Moniteur</h1>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href="/instructor/calendar"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Calendrier
                </a>
                <a
                  href="/instructor/timeslots"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Créneaux
                </a>
                <a
                  href="/reservations"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Historique
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* Stats */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Statistiques globales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card variant="elevated">
              <CardBody>
                <p className="text-sm text-gray-600 mb-1">Mes cours</p>
                <p className="text-3xl font-bold text-blue-600">{myCourses.length}</p>
              </CardBody>
            </Card>
            <Card variant="elevated">
              <CardBody>
                <p className="text-sm text-gray-600 mb-1">Réservations totales</p>
                <p className="text-3xl font-bold text-green-600">
                  {myCourses.reduce((acc, c) => acc + getReservationCount(c.id), 0)}
                </p>
              </CardBody>
            </Card>
            <Card variant="elevated">
              <CardBody>
                <p className="text-sm text-gray-600 mb-1">Élèves inscrits</p>
                <p className="text-3xl font-bold text-purple-600">{students.length}</p>
              </CardBody>
            </Card>
            <Card variant="elevated">
              <CardBody>
                <p className="text-sm text-gray-600 mb-1">Créneaux horaires</p>
                <p className="text-3xl font-bold text-orange-600">{timeSlots.length}</p>
              </CardBody>
            </Card>
          </div>

          {/* Section: Mes élèves assignés */}
          <section className="mb-8" aria-labelledby="assigned-students-heading">
            <h2 id="assigned-students-heading" className="sr-only">
              Mes élèves assignés
            </h2>
            <AssignedStudents
              students={students}
              allCredits={credits}
              instructorId={user.id}
            />
          </section>

          {/* Section: Emploi du temps avec élèves */}
          <section className="mb-8" aria-labelledby="schedule-heading">
            <h2 id="schedule-heading" className="sr-only">
              Emploi du temps
            </h2>
            <ScheduleWithStudents
              timeSlots={timeSlots}
              reservations={reservations}
              students={students}
              courses={courses}
            />
          </section>

          {/* My Courses */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Mes cours</h2>
            {myCourses.length === 0 ? (
              <Card variant="elevated">
                <CardBody className="text-center py-12">
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
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  <p className="text-gray-600 mb-2">Aucun cours assigné</p>
                  <p className="text-sm text-gray-500">
                    Contactez l'administrateur pour être assigné à des cours
                  </p>
                </CardBody>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myCourses.map((course) => {
                  const reservationCount = getReservationCount(course.id);
                  return (
                    <Card key={course.id} variant="elevated">
                      <CardBody>
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
                          <span className="text-sm text-gray-500">
                            {reservationCount}/{course.maxStudents} élèves
                          </span>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {course.title}
                        </h3>

                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {course.description}
                        </p>

                        <div className="pt-4 border-t border-gray-100">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Prix</span>
                            <span className="font-medium text-gray-900">{course.price}€</span>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>

          {/* Recent Reservations */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Réservations récentes
            </h2>
            {reservations.filter((r) => myCourses.some((c) => c.id === r.courseId)).length === 0 ? (
              <p className="text-gray-600 text-center py-8">Aucune réservation récente</p>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Cours
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Statut
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {reservations
                      .filter((r) => myCourses.some((c) => c.id === r.courseId))
                      .map((reservation) => {
                        const course = myCourses.find((c) => c.id === reservation.courseId);
                        return (
                          <tr key={reservation.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">#{reservation.id}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {course?.title || `Cours #${reservation.courseId}`}
                            </td>
                            <td className="px-4 py-3">
                              <Badge
                                variant={
                                  reservation.status === 'confirmed'
                                    ? 'success'
                                    : reservation.status === 'cancelled'
                                    ? 'danger'
                                    : reservation.status === 'completed'
                                    ? 'info'
                                    : 'warning'
                                }
                              >
                                {reservation.status === 'confirmed'
                                  ? 'Confirmé'
                                  : reservation.status === 'cancelled'
                                  ? 'Annulé'
                                  : reservation.status === 'completed'
                                  ? 'Terminé'
                                  : 'En attente'}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>
      </div>
    </InstructorErrorBoundary>
  );
}

export default InstructorPage;
