// src/pages/Admin/SchoolSchedule/SchoolScheduleForm.tsx
// Formulaire de création/modification des créneaux horaires

import { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/Button';

interface SchoolScheduleFormProps {
  initialData?: {
    id: number;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  };
  onSubmit: (data: { dayOfWeek: number; startTime: string; endTime: string }) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

const DAYS_OF_WEEK = [
  '', // Index 0 unused
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
];

const DEFAULT_TIME_SLOTS = [
  { startTime: '08:30', endTime: '11:00', label: 'Matin 1 (08:30 - 11:00)' },
  { startTime: '11:30', endTime: '14:00', label: 'Matin 2 (11:30 - 14:00)' },
  { startTime: '14:30', endTime: '17:00', label: 'Après-midi (14:30 - 17:00)' },
];

export function SchoolScheduleForm({ initialData, onSubmit, onCancel, isLoading }: SchoolScheduleFormProps) {
  const [dayOfWeek, setDayOfWeek] = useState<number>(initialData?.dayOfWeek || 1);
  const [startTime, setStartTime] = useState<string>(initialData?.startTime || '08:30');
  const [endTime, setEndTime] = useState<string>(initialData?.endTime || '11:00');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (initialData) {
      setDayOfWeek(initialData.dayOfWeek);
      setStartTime(initialData.startTime);
      setEndTime(initialData.endTime);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!dayOfWeek || dayOfWeek < 1 || dayOfWeek > 6) {
      setError('Veuillez sélectionner un jour valide');
      return;
    }

    if (startTime >= endTime) {
      setError('L\'heure de fin doit être après l\'heure de début');
      return;
    }

    try {
      await onSubmit({ dayOfWeek, startTime, endTime });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  const handlePresetSelect = (preset: { startTime: string; endTime: string }) => {
    setStartTime(preset.startTime);
    setEndTime(preset.endTime);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Day Selection */}
      <div>
        <label htmlFor="dayOfWeek" className="block text-sm font-medium text-gray-700 mb-1">
          Jour de la semaine
        </label>
        <select
          id="dayOfWeek"
          value={dayOfWeek}
          onChange={(e) => setDayOfWeek(Number(e.target.value))}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          disabled={isLoading}
        >
          {DAYS_OF_WEEK.map((day, index) => (
            index > 0 && (
              <option key={index} value={index}>
                {day}
              </option>
            )
          ))}
        </select>
      </div>

      {/* Time Selection */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
            Heure de début
          </label>
          <input
            type="time"
            id="startTime"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
            Heure de fin
          </label>
          <input
            type="time"
            id="endTime"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Preset Buttons */}
      <div>
        <p className="text-sm text-gray-600 mb-2">Créneaux prédéfinis :</p>
        <div className="flex flex-wrap gap-2">
          {DEFAULT_TIME_SLOTS.map((preset, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handlePresetSelect(preset)}
              className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              disabled={isLoading}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div role="alert" className="rounded-lg bg-red-50 p-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading}
        >
          {isLoading ? 'Enregistrement...' : (initialData ? 'Modifier' : 'Créer')}
        </Button>
      </div>
    </form>
  );
}
