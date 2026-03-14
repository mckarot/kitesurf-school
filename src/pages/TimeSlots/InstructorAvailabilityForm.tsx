// src/pages/TimeSlots/InstructorAvailabilityForm.tsx
// Formulaire pour ajouter une raison d'indisponibilité

import { useState } from 'react';
import { Button } from '../../components/ui/Button';

interface InstructorAvailabilityFormProps {
  scheduleId: number;
  onSubmit: (scheduleId: number, reason: string) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

const PREDEFINED_REASONS = [
  'Maladie',
  'Congés',
  'Formation',
  'Rendez-vous médical',
  'Empêchement personnel',
  'Autre',
];

export function InstructorAvailabilityForm({ scheduleId, onSubmit, onCancel, isLoading }: InstructorAvailabilityFormProps) {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const reason = selectedReason === 'Autre' ? customReason : selectedReason;

    if (!reason) {
      setError('Veuillez sélectionner ou saisir un motif');
      return;
    }

    try {
      await onSubmit(scheduleId, reason);
      setSelectedReason('');
      setCustomReason('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Predefined Reasons */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Motif de l'indisponibilité
        </label>
        <div className="grid grid-cols-2 gap-2">
          {PREDEFINED_REASONS.map((reason) => (
            <button
              key={reason}
              type="button"
              onClick={() => setSelectedReason(reason)}
              className={`px-3 py-2 text-sm rounded-lg border transition ${
                selectedReason === reason
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
              disabled={isLoading}
            >
              {reason}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Reason */}
      {selectedReason === 'Autre' && (
        <div>
          <label htmlFor="customReason" className="block text-sm font-medium text-gray-700 mb-1">
            Précisez le motif
          </label>
          <input
            type="text"
            id="customReason"
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Saisissez le motif..."
            disabled={isLoading}
          />
        </div>
      )}

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
          disabled={isLoading || (!selectedReason && !customReason)}
        >
          {isLoading ? 'Enregistrement...' : 'Confirmer l\'indisponibilité'}
        </Button>
      </div>
    </form>
  );
}
