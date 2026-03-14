// src/components/ReservationHistory/ReservationItem.tsx

import { useState } from 'react';
import type { ReservationHistoryItem } from '../../types';
import { formatDateFr, formatTime } from '../../utils/dateUtils';
import { Badge } from '../ui/Badge';
import { canMarkAsCompleted } from '../../utils/reservationUtils';

interface ReservationItemProps {
  reservation: ReservationHistoryItem;
  showStudentName?: boolean;
  onMarkCompleted?: (id: number) => Promise<void>;
  canComplete?: boolean;
}

export function ReservationItem({
  reservation,
  showStudentName = false,
  onMarkCompleted,
  canComplete = false,
}: ReservationItemProps) {
  const [isMarkingCompleted, setIsMarkingCompleted] = useState(false);

  const statusConfig = {
    pending: { variant: 'warning' as const, label: 'En attente' },
    confirmed: { variant: 'success' as const, label: 'Confirmé' },
    cancelled: { variant: 'danger' as const, label: 'Annulé' },
    completed: { variant: 'info' as const, label: 'Terminé' },
  };

  const status = statusConfig[reservation.status];
  const canBeCompleted = canComplete && canMarkAsCompleted(reservation.date, reservation.status);

  const handleMarkCompleted = async () => {
    if (!onMarkCompleted) return;

    setIsMarkingCompleted(true);
    try {
      await onMarkCompleted(reservation.id);
    } finally {
      setIsMarkingCompleted(false);
    }
  };

  return (
    <article
      className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition"
      aria-label={`Réservation pour ${reservation.courseTitle}`}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Main info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-base font-semibold text-gray-900">
              {reservation.courseTitle}
            </h3>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{formatDateFr(reservation.date)}</span>
            </div>

            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{formatTime(reservation.startTime)} - {formatTime(reservation.endTime)}</span>
            </div>

            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 0111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{reservation.location}</span>
            </div>

            {showStudentName && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>{reservation.studentName}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <div className="text-xs text-gray-400 md:text-right">
            #{reservation.id}
          </div>
          {canComplete && canBeCompleted && (
            <button
              onClick={handleMarkCompleted}
              disabled={isMarkingCompleted}
              className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-green-500"
              aria-label="Marquer comme terminé"
            >
              {isMarkingCompleted ? '...' : 'Marquer comme terminé'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
