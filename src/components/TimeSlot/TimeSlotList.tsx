// src/components/TimeSlot/TimeSlotList.tsx

import type { TimeSlot } from '../../types';
import { formatDateFr, formatTime } from '../../utils/dateUtils';
import { TimeSlotCard } from './TimeSlotCard';

interface TimeSlotListProps {
  timeSlots: TimeSlot[];
  onDelete?: (id: number) => Promise<void>;
  onToggleAvailability?: (id: number, isAvailable: boolean) => Promise<void>;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function TimeSlotList({
  timeSlots,
  onDelete,
  onToggleAvailability,
  isLoading = false,
  emptyMessage = 'Aucun créneau horaire',
}: TimeSlotListProps) {
  if (isLoading) {
    return (
      <div aria-busy="true" aria-live="polite" className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
        <p className="text-gray-600">Chargement des créneaux...</p>
      </div>
    );
  }

  if (timeSlots.length === 0) {
    return (
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
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-gray-600">{emptyMessage}</p>
      </div>
    );
  }

  // Group by date
  const slotsByDate = timeSlots.reduce((acc, slot) => {
    if (!acc[slot.date]) {
      acc[slot.date] = [];
    }
    acc[slot.date].push(slot);
    return acc;
  }, {} as Record<string, TimeSlot[]>);

  const sortedDates = Object.keys(slotsByDate).sort();

  return (
    <div className="space-y-6">
      {sortedDates.map((date) => (
        <div key={date}>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 capitalize">
            {formatDateFr(date)}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {slotsByDate[date].map((slot) => (
              <TimeSlotCard
                key={slot.id}
                timeSlot={slot}
                onDelete={onDelete}
                onToggleAvailability={onToggleAvailability}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
