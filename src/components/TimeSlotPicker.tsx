// src/components/TimeSlotPicker.tsx
// Sélecteur de créneaux horaires pour une date donnée

import { Button } from './ui/Button';

interface TimeSlot {
  id: number;
  startTime: string;
  endTime: string;
  available: boolean;
}

interface TimeSlotPickerProps {
  date: string;
  timeSlots: TimeSlot[];
  onSelect: (timeSlot: TimeSlot) => void;
  isLoading: boolean;
}

const DEFAULT_TIME_SLOTS = [
  { startTime: '08:30', endTime: '11:00', label: 'Matin 1' },
  { startTime: '11:30', endTime: '14:00', label: 'Matin 2' },
  { startTime: '14:30', endTime: '17:00', label: 'Après-midi' },
];

export function TimeSlotPicker({ date, timeSlots, onSelect, isLoading }: TimeSlotPickerProps) {
  if (!date) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Sélectionnez une date pour voir les créneaux disponibles</p>
      </div>
    );
  }

  // Parser la date correctement en évitant les problèmes de fuseau horaire
  const [year, month, day] = date.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day); // month - 1 car Janvier = 0
  
  const dayName = dateObj.toLocaleDateString('fr-FR', { weekday: 'long' });
  const dayNumber = dateObj.getDate();
  const monthName = dateObj.toLocaleDateString('fr-FR', { month: 'long' });
  
  const formattedDate = `${dayName.charAt(0).toUpperCase() + dayName.slice(1)} ${dayNumber} ${monthName.charAt(0).toUpperCase() + monthName.slice(1)}`;

  // Check if Sunday (closed)
  if (dateObj.getDay() === 0) {
    return (
      <div className="text-center py-8 text-red-600 bg-red-50 rounded-lg">
        <p className="font-medium">⚠️ Fermé le dimanche</p>
        <p className="text-sm mt-1">Veuillez sélectionner un autre jour</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Date Header */}
      <div className="text-center">
        <p className="text-sm font-medium text-gray-600 capitalize">{formattedDate}</p>
      </div>

      {/* Time Slots Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {DEFAULT_TIME_SLOTS.map((slot, index) => {
          const slotInfo = timeSlots.find(s => s.startTime === slot.startTime);
          const isAvailable = slotInfo?.available ?? true;

          return (
            <Button
              key={index}
              type="button"
              variant={isAvailable ? 'primary' : 'secondary'}
              size="lg"
              onClick={() => isAvailable && onSelect({ ...slot, id: index, available: isAvailable })}
              disabled={isLoading || !isAvailable}
              className="w-full py-4 text-lg"
            >
              {slot.startTime}
              {!isAvailable && (
                <span className="block text-xs opacity-75">Complet</span>
              )}
            </Button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-600 rounded" />
          <span>Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 rounded" />
          <span>Complet</span>
        </div>
      </div>
    </div>
  );
}
