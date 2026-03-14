// src/pages/Instructor/ScheduleWithStudents.tsx

import type { TimeSlot, Reservation, User, Course } from '../../types';

interface ScheduleWithStudentsProps {
  timeSlots: TimeSlot[];
  reservations: Reservation[];
  students: User[];
  courses: Course[];
}

/**
 * Composant d'affichage de l'emploi du temps avec les noms des élèves.
 * 
 * Affiche:
 * - Créneaux horaires du moniteur
 * - Noms des élèves réservés sur chaque créneau
 * - Statut des réservations
 * - Indicateurs de remplissage
 * 
 * @param props - Props du composant
 * @returns JSX.Element - Emploi du temps avec noms
 * 
 * @example
 * ```tsx
 * <ScheduleWithStudents
 *   timeSlots={timeSlots}
 *   reservations={reservations}
 *   students={students}
 *   courses={courses}
 * />
 * ```
 */
export function ScheduleWithStudents({
  timeSlots,
  reservations,
  students,
  courses,
}: ScheduleWithStudentsProps) {
  // Trier les créneaux par date et heure
  const sortedTimeSlots = [...timeSlots].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.startTime}`).getTime();
    const dateB = new Date(`${b.date}T${b.startTime}`).getTime();
    return dateA - dateB;
  });

  // Mapper les réservations par timeSlotId (si disponible) ou par courseId
  const getStudentsForTimeSlot = (timeSlot: TimeSlot): User[] => {
    // Cette logique dépend de la structure des données
    // Ici, on suppose qu'on peut lier les réservations aux timeSlots via courseId
    const courseForTimeSlot = courses.find((c) => c.instructorId === timeSlot.instructorId);
    
    if (!courseForTimeSlot) {
      return [];
    }

    // Trouver les réservations pour ce cours
    const courseReservations = reservations.filter(
      (r) => r.courseId === courseForTimeSlot.id && r.status !== 'cancelled'
    );

    // Mapper les IDs d'étudiants vers les objets User
    return courseReservations
      .map((r) => students.find((s) => s.id === r.studentId))
      .filter((s): s is User => s !== undefined);
  };

  // Formater la date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  if (sortedTimeSlots.length === 0) {
    return (
      <div
        role="alert"
        className="bg-white rounded-xl border border-gray-200 p-8 text-center"
      >
        <svg
          className="w-16 h-16 text-gray-300 mx-auto mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <p className="text-gray-600 font-medium">Aucun créneau horaire</p>
        <p className="text-sm text-gray-500 mt-1">
          Ajoutez des créneaux pour afficher votre emploi du temps
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Emploi du temps
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {sortedTimeSlots.length} créneau{sortedTimeSlots.length > 1 ? 'x' : ''} programmé
          {sortedTimeSlots.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Liste des créneaux */}
      <div className="divide-y divide-gray-200">
        {sortedTimeSlots.map((timeSlot) => {
          const studentsInSlot = getStudentsForTimeSlot(timeSlot);
          const isAvailable = timeSlot.isAvailable === 1;
          const hasStudents = studentsInSlot.length > 0;

          return (
            <div
              key={timeSlot.id}
              className="px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                {/* Date et heure */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-gray-400"
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
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {formatDate(timeSlot.date)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-sm text-gray-700">
                        {timeSlot.startTime} - {timeSlot.endTime}
                      </span>
                    </div>
                  </div>

                  {/* Élèves réservés */}
                  {hasStudents ? (
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 mb-2">
                        Élèves réservés ({studentsInSlot.length}):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {studentsInSlot.map((student) => (
                          <span
                            key={student.id}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                          >
                            {student.firstName} {student.lastName}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3">
                      <p className="text-sm text-gray-500 italic">
                        Aucun élève réservé
                      </p>
                    </div>
                  )}
                </div>

                {/* Statut du créneau */}
                <div className="ml-4">
                  {isAvailable ? (
                    hasStudents ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 8 8">
                          <circle cx="4" cy="4" r="3" />
                        </svg>
                        Disponible
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 8 8">
                          <circle cx="4" cy="4" r="3" />
                        </svg>
                        En attente
                      </span>
                    )
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 8 8">
                        <circle cx="4" cy="4" r="3" />
                      </svg>
                      Indisponible
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
