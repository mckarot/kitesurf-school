// src/components/Calendar/InstructorCalendar.tsx

import { useState, useMemo } from 'react';
import { Calendar } from '../ui/Calendar';
import type { TimeSlot, Course, Reservation } from '../../types';
import { formatDateFr, formatTime } from '../../utils/dateUtils';

interface InstructorCalendarProps {
  timeSlots: TimeSlot[];
  courses: Course[];
  reservations: Reservation[];
  onSlotClick?: (timeSlot: TimeSlot) => void;
}

interface TimeSlotDetail {
  date: string;
  label: string;
  color: string;
  slot: TimeSlot;
}

export function InstructorCalendar({
  timeSlots,
  courses,
  reservations,
  onSlotClick,
}: InstructorCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);
  const [view, setView] = useState<'week' | 'month'>('week');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  // Build events for calendar visualization
  const events: { date: string; label: string; color: string }[] = useMemo(() => {
    return timeSlots
      .filter((slot) => slot.isAvailable === 1)
      .map((slot) => ({
        date: slot.date,
        label: `${formatTime(slot.startTime)}-${formatTime(slot.endTime)}`,
        color: slot.isAvailable ? '#10b981' : '#6b7280',
      }));
  }, [timeSlots]);

  // Get time slots for selected date
  const selectedDateSlots = useMemo(() => {
    if (!selectedDate) return [];
    return timeSlots
      .filter((slot) => slot.date === selectedDate)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [timeSlots, selectedDate]);

  // Get reservation count for a time slot
  const getReservationCount = (slot: TimeSlot): number => {
    const course = courses.find((c) => c.instructorId === slot.instructorId);
    if (!course) return 0;

    return reservations.filter(
      (r) => r.courseId === course.id && r.status !== 'cancelled'
    ).length;
  };

  const handleSlotClick = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    onSlotClick?.(slot);
  };

  const handleCloseModal = () => {
    setSelectedSlot(null);
  };

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
            <span className="text-gray-600">Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-500" />
            <span className="text-gray-600">Indisponible</span>
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

      {/* Selected date slots */}
      {selectedDate && selectedDateSlots.length > 0 && (
        <section aria-label={`Créneaux du ${formatDateFr(selectedDate)}`}>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Créneaux du {formatDateFr(selectedDate)}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedDateSlots.map((slot) => {
              const reservationCount = getReservationCount(slot);
              return (
                <button
                  key={slot.id}
                  onClick={() => handleSlotClick(slot)}
                  className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md hover:border-blue-300 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                  aria-label={`Créneau ${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}, ${slot.isAvailable ? 'disponible' : 'indisponible'}`}
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
                          {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {Math.round(
                            ((parseInt(slot.endTime.split(':')[0]) * 60 +
                              parseInt(slot.endTime.split(':')[1]) -
                              parseInt(slot.startTime.split(':')[0]) * 60 -
                              parseInt(slot.startTime.split(':')[1])) /
                              60) *
                              10
                          ) / 10}
                          h
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        slot.isAvailable
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {slot.isAvailable ? 'Disponible' : 'Indisponible'}
                    </span>
                  </div>
                  {reservationCount > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-600">
                        {reservationCount} réservation{reservationCount > 1 ? 's' : ''}
                      </p>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {selectedDate && selectedDateSlots.length === 0 && (
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
          <p className="text-gray-600">Aucun créneau pour cette date</p>
        </div>
      )}

      {/* Slot detail modal */}
      {selectedSlot && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          role="dialog"
          aria-modal="true"
          aria-label="Détails du créneau"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Détails du créneau
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
                  {formatDateFr(selectedSlot.date)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Horaire</p>
                <p className="text-base font-medium text-gray-900">
                  {formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Statut</p>
                <span
                  className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                    selectedSlot.isAvailable
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {selectedSlot.isAvailable ? 'Disponible' : 'Indisponible'}
                </span>
              </div>

              {getReservationCount(selectedSlot) > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Réservations</p>
                  <p className="text-base font-medium text-gray-900">
                    {getReservationCount(selectedSlot)} réservation(s) associée(s)
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
