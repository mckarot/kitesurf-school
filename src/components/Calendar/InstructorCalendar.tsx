// src/components/Calendar/InstructorCalendar.tsx
// Calendrier instructeur basé sur les CourseSessions (SchoolSchedule)

import { useState, useMemo } from 'react';
import { Calendar } from '../ui/Calendar';
import type { Course, Reservation, CourseSession } from '../../types';
import { formatDateFr, formatTime } from '../../utils/dateUtils';

interface InstructorCalendarProps {
  courses: Course[];
  reservations: Reservation[];
  courseSessions: CourseSession[];
  onSessionClick?: (session: CourseSession) => void;
}

export function InstructorCalendar({
  courses,
  reservations,
  courseSessions,
  onSessionClick,
}: InstructorCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);
  const [view, setView] = useState<'week' | 'month'>('month');
  const [selectedSession, setSelectedSession] = useState<CourseSession | null>(null);

  // Build events for calendar visualization from course sessions
  const events: { date: string; label: string; color: string }[] = useMemo(() => {
    // Group sessions by date and show unique time slots
    const sessionsByDate = new Map<string, Set<string>>();
    
    courseSessions.forEach((session) => {
      if (!session.isActive) return;
      
      const timeLabel = `${formatTime(session.startTime)}-${formatTime(session.endTime)}`;
      if (!sessionsByDate.has(session.date)) {
        sessionsByDate.set(session.date, new Set());
      }
      sessionsByDate.get(session.date)!.add(timeLabel);
    });

    const result: { date: string; label: string; color: string }[] = [];
    sessionsByDate.forEach((times, date) => {
      times.forEach((timeLabel) => {
        result.push({
          date,
          label: timeLabel,
          color: '#10b981', // Green for available sessions
        });
      });
    });

    return result;
  }, [courseSessions]);

  // Get course sessions for selected date
  const selectedDateSessions = useMemo(() => {
    if (!selectedDate) return [];
    return courseSessions
      .filter((session) => {
        if (!session.isActive) return false;
        return session.date === selectedDate;
      })
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [courseSessions, selectedDate]);

  // Get unique sessions by time (group sessions with same time)
  const getUniqueSessionsByTime = (sessions: CourseSession[]) => {
    const timeMap = new Map<string, CourseSession[]>();
    sessions.forEach((session) => {
      const key = `${session.startTime}-${session.endTime}`;
      if (!timeMap.has(key)) {
        timeMap.set(key, []);
      }
      timeMap.get(key)!.push(session);
    });
    return Array.from(timeMap.entries()).map(([timeLabel, sessions]) => ({
      timeLabel,
      sessions,
      startTime: sessions[0].startTime,
      endTime: sessions[0].endTime,
    }));
  };

  // Get reservation count for a course session
  const getReservationCount = (session: CourseSession): number => {
    return reservations.filter((r) => r.courseId === session.id).length;
  };

  // Get total capacity for a time slot (sum of all sessions at that time)
  const getTotalCapacity = (sessions: CourseSession[]): number => {
    return sessions.reduce((sum, s) => sum + s.maxStudents, 0);
  };

  const handleSessionClick = (session: CourseSession) => {
    setSelectedSession(session);
    onSessionClick?.(session);
  };

  const handleCloseModal = () => {
    setSelectedSession(null);
  };

  // Calculate stats
  const totalSessions = courseSessions.filter(s => s.isActive).length;
  const totalReservations = reservations.length;

  return (
    <div className="space-y-6">
      {/* View toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView('week')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
              view === 'week'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            aria-pressed={view === 'week'}
          >
            Semaine
          </button>
          <button
            onClick={() => setView('month')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
              view === 'month'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            aria-pressed={view === 'month'}
          >
            Mois
          </button>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-gray-600">Sessions de cours</span>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <Calendar
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
        view={view}
        events={events}
      />

      {/* Selected date sessions */}
      {selectedDate && selectedDateSessions.length > 0 && (
        <section aria-label={`Sessions du ${formatDateFr(selectedDate)}`}>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Sessions du {formatDateFr(selectedDate)}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getUniqueSessionsByTime(selectedDateSessions).map(({ timeLabel, sessions, startTime, endTime }) => {
              const totalReservationsForSlot = sessions.reduce(
                (sum, s) => sum + getReservationCount(s),
                0
              );
              const totalCapacity = getTotalCapacity(sessions);

              return (
                <button
                  key={timeLabel}
                  onClick={() => handleSessionClick(sessions[0])}
                  className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md hover:border-blue-300 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                  aria-label={`Session ${timeLabel}`}
                >
                  <div className="flex items-start justify-between mb-2">
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
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatTime(startTime)} - {formatTime(endTime)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {sessions.length} session{sessions.length > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                      Actif
                    </span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-600">
                      {totalReservationsForSlot} réservation{totalReservationsForSlot > 1 ? 's' : ''} / {totalCapacity} places
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {selectedDate && selectedDateSessions.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200">
          <svg
            className="w-12 h-12 text-gray-300 mx-auto mb-3"
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
          <p className="text-gray-600">Aucune session pour cette date</p>
          <p className="text-sm text-gray-500 mt-1">
            Les sessions sont générées automatiquement selon l'emploi du temps de l'école
          </p>
        </div>
      )}

      {/* Session detail modal */}
      {selectedSession && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          role="dialog"
          aria-modal="true"
          aria-label="Détails de la session"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Détails de la session
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
                aria-label="Fermer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Date</p>
                <p className="text-base font-medium text-gray-900">
                  {formatDateFr(selectedSession.date)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Horaire</p>
                <p className="text-base font-medium text-gray-900">
                  {formatTime(selectedSession.startTime)} - {formatTime(selectedSession.endTime)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Lieu</p>
                <p className="text-base font-medium text-gray-900">
                  {selectedSession.location || 'Non défini'}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Capacité</p>
                <p className="text-base font-medium text-gray-900">
                  {selectedSession.maxStudents} élèves maximum
                </p>
              </div>

              {getReservationCount(selectedSession) > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Réservations</p>
                  <p className="text-base font-medium text-gray-900">
                    {getReservationCount(selectedSession)} réservation(s)
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={handleCloseModal}
                className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
