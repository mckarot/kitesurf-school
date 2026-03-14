// src/components/TimeSlot/TimeSlotForm.tsx

import { useState, FormEvent } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface TimeSlotFormProps {
  instructorId: number;
  onSubmit: (data: { date: string; startTime: string; endTime: string }) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function TimeSlotForm({
  instructorId,
  onSubmit,
  onCancel,
  isLoading = false,
}: TimeSlotFormProps) {
  const [date, setDate] = useState<string>(() => {
    // Default to today
    return new Date().toISOString().split('T')[0];
  });
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('12:00');
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (startTime >= endTime) {
      setError('L\'heure de fin doit être après l\'heure de début');
      return;
    }

    try {
      await onSubmit({ date, startTime, endTime });
      // Reset form on success
      setDate(new Date().toISOString().split('T')[0]);
      setStartTime('09:00');
      setEndTime('12:00');
    } catch {
      // Error handled by parent
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Input
        label="Date"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        min={new Date().toISOString().split('T')[0]}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Heure de début"
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
        />
        <Input
          label="Heure de fin"
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          required
        />
      </div>

      <div className="flex gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Annuler
          </Button>
        )}
        <Button type="submit" variant="primary" isLoading={isLoading}>
          Ajouter le créneau
        </Button>
      </div>
    </form>
  );
}
