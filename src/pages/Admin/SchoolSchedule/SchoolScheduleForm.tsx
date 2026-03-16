// src/pages/Admin/SchoolSchedule/SchoolScheduleForm.tsx
// Formulaire de création/modification des créneaux horaires
// Design Metalab harmonisé

import { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/Button';
import { Clock, Calendar } from 'lucide-react';

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
  '🌙 Lundi',
  '⭐ Mardi',
  '☀️ Mercredi',
  '🌤️ Jeudi',
  '🌅 Vendredi',
  '🏖️ Samedi',
];

const DEFAULT_TIME_SLOTS = [
  { startTime: '08:30', endTime: '11:00', label: 'Matin 1' },
  { startTime: '11:30', endTime: '14:00', label: 'Matin 2' },
  { startTime: '14:30', endTime: '17:00', label: 'Après-midi' },
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Day Selection */}
      <div>
        <label htmlFor="dayOfWeek" className="block text-sm font-medium text-gray-700 mb-2">
          Jour de la semaine
        </label>
        <div className="relative">
          <select
            id="dayOfWeek"
            value={dayOfWeek}
            onChange={(e) => setDayOfWeek(Number(e.target.value))}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 pl-11 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 appearance-none bg-white"
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
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Time Selection */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">
            Heure de début
          </label>
          <div className="relative">
            <input
              type="time"
              id="startTime"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 pl-11 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
              disabled={isLoading}
            />
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>
        <div>
          <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">
            Heure de fin
          </label>
          <div className="relative">
            <input
              type="time"
              id="endTime"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 pl-11 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
              disabled={isLoading}
            />
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Preset Buttons */}
      <div>
        <p className="text-sm text-gray-600 mb-3 font-medium">Créneaux prédéfinis :</p>
        <div className="flex flex-wrap gap-2">
          {DEFAULT_TIME_SLOTS.map((preset, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handlePresetSelect(preset)}
              className="px-4 py-2.5 text-sm bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 text-purple-700 font-medium rounded-xl border border-purple-200 transition-all hover:shadow-md disabled:opacity-50"
              disabled={isLoading}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div role="alert" className="rounded-xl bg-red-50 border border-red-200 p-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-red-600 text-sm">!</span>
            </div>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1"
        >
          Annuler
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? 'Enregistrement...' : (initialData ? 'Modifier' : 'Créer')}
        </Button>
      </div>
    </form>
  );
}
