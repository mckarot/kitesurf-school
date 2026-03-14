// src/components/TimeSlot/TimeSlotCard.tsx

import { useState } from 'react';
import type { TimeSlot } from '../../types';
import { formatTime, isPast } from '../../utils/dateUtils';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface TimeSlotCardProps {
  timeSlot: TimeSlot;
  onDelete?: (id: number) => Promise<void>;
  onToggleAvailability?: (id: number, isAvailable: boolean) => Promise<void>;
  onMarkCompleted?: (id: number) => Promise<void>;
}

export function TimeSlotCard({
  timeSlot,
  onDelete,
  onToggleAvailability,
  onMarkCompleted,
}: TimeSlotCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [isMarkingCompleted, setIsMarkingCompleted] = useState(false);

  const isPastSlot = isPast(timeSlot.date);

  const handleDelete = async () => {
    if (!onDelete) return;
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce créneau ?')) return;

    setIsDeleting(true);
    try {
      await onDelete(timeSlot.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleAvailability = async () => {
    if (!onToggleAvailability) return;

    setIsToggling(true);
    try {
      await onToggleAvailability(timeSlot.id, !timeSlot.isAvailable);
    } finally {
      setIsToggling(false);
    }
  };

  const handleMarkCompleted = async () => {
    if (!onMarkCompleted) return;

    setIsMarkingCompleted(true);
    try {
      await onMarkCompleted(timeSlot.id);
    } finally {
      setIsMarkingCompleted(false);
    }
  };

  return (
    <article
      className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
      aria-label={`Créneau horaire ${formatTime(timeSlot.startTime)} - ${formatTime(timeSlot.endTime)}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {formatTime(timeSlot.startTime)} - {formatTime(timeSlot.endTime)}
            </p>
            <p className="text-xs text-gray-500">
              {Math.round((parseInt(timeSlot.endTime.split(':')[0]) * 60 + parseInt(timeSlot.endTime.split(':')[1]) -
                parseInt(timeSlot.startTime.split(':')[0]) * 60 - parseInt(timeSlot.startTime.split(':')[1])) / 60 * 10) / 10}h
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={timeSlot.isAvailable ? 'success' : 'info'}>
            {timeSlot.isAvailable ? 'Disponible' : 'Indisponible'}
          </Badge>
          {isPastSlot && (
            <Badge variant="secondary">Passé</Badge>
          )}
        </div>
      </div>

      <div className="flex gap-2 pt-3 border-t border-gray-100">
        {onToggleAvailability && (
          <Button
            variant="secondary"
            size="sm"
            className="flex-1"
            onClick={handleToggleAvailability}
            isLoading={isToggling}
            aria-label={timeSlot.isAvailable ? 'Rendre indisponible' : 'Rendre disponible'}
          >
            {timeSlot.isAvailable ? 'Bloquer' : 'Débloquer'}
          </Button>
        )}
        {onDelete && (
          <Button
            variant="danger"
            size="sm"
            className="flex-1"
            onClick={handleDelete}
            isLoading={isDeleting}
            aria-label="Supprimer le créneau"
          >
            Supprimer
          </Button>
        )}
      </div>
    </article>
  );
}
