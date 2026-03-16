// src/pages/Student/BookCourseModal.tsx
// Modal de réservation de cours avec calendrier et créneaux

import { useState, useEffect, useRef } from 'react';
import { db } from '../../db/db';
import { Button } from '../../components/ui/Button';
import { DatePicker } from '../../components/ui/DatePicker';
import { TimeSlotPicker } from '../../components/TimeSlotPicker';
import type { CourseSession } from '../../types';

interface BookCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseTitle: string;
  coursePrice: number;
  sessionsRequired: number;
  currentBalance: number;
  onConfirm: (session: CourseSession) => Promise<void>;
}

export function BookCourseModal({
  isOpen,
  onClose,
  courseTitle,
  coursePrice,
  sessionsRequired,
  currentBalance,
  onConfirm,
}: BookCourseModalProps) {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState<{ startTime: string; endTime: string } | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string>('');

  const modalRef = useRef<HTMLDivElement>(null);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedDate(new Date().toISOString().split('T')[0]);
      setSelectedSlot(null);
      setError('');
      setIsConfirming(false);
    }
  }, [isOpen]);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleSlotSelect = (slot: { startTime: string; endTime: string }) => {
    setSelectedSlot(slot);
    setError('');
  };

  const handleConfirm = async () => {
    if (!selectedSlot) {
      setError('Veuillez sélectionner un créneau horaire');
      return;
    }

    if (currentBalance < coursePrice) {
      setError('Solde insuffisant pour réserver ce cours');
      return;
    }

    setIsConfirming(true);

    try {
      // TROUVER la vraie session dans la BDD
      const allSessions = await db.courseSessions.toArray();

      const matchingSession = allSessions.find(s =>
        s.date === selectedDate &&
        s.startTime === selectedSlot.startTime &&
        s.endTime === selectedSlot.endTime &&
        s.isActive === 1
      );

      if (!matchingSession) {
        throw new Error('Créneau non disponible');
      }

      await onConfirm(matchingSession);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la réservation');
    } finally {
      setIsConfirming(false);
    }
  };

  if (!isOpen) return null;

  const hasSufficientBalance = currentBalance >= coursePrice;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal Panel */}
        <div
          ref={modalRef}
          className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl"
        >
          {/* Header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Réserver un cours</h2>
                <p className="text-sm text-gray-600 mt-1">{courseTitle}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition"
                aria-label="Fermer"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: Calendar */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">1. Sélectionnez une date</h3>
                <DatePicker
                  value={selectedDate}
                  onChange={setSelectedDate}
                  minDate={new Date().toISOString().split('T')[0]}
                  maxDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                />
              </div>

              {/* Right: Time Slots */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">2. Choisissez un créneau</h3>
                <TimeSlotPicker
                  date={selectedDate}
                  timeSlots={[]}
                  onSelect={handleSlotSelect}
                  isLoading={isConfirming}
                />
              </div>
            </div>

            {/* Summary */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">Récapitulatif</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedSlot ? (
                      <>
                        {new Date(selectedDate).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long'
                        })}{' '}
                        à {selectedSlot.startTime}
                      </>
                    ) : (
                      'Aucun créneau sélectionné'
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{coursePrice}€</p>
                  <p className="text-xs text-gray-500">
                    Prix de la séance
                  </p>
                </div>
              </div>

              {/* Balance Info */}
              <div className={`mb-4 p-3 rounded-lg ${
                hasSufficientBalance ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}>
                <p className="text-sm font-medium">
                  {hasSufficientBalance ? '✓' : '✗'} Solde actuel : {currentBalance.toFixed(2)}€
                </p>
                <p className="text-xs mt-1">
                  {hasSufficientBalance 
                    ? `Après réservation: ${(currentBalance - coursePrice).toFixed(2)}€`
                    : `Il vous manque ${(coursePrice - currentBalance).toFixed(2)}€`
                  }
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                  disabled={isConfirming}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleConfirm}
                  disabled={isConfirming || !selectedSlot || !hasSufficientBalance}
                  isLoading={isConfirming}
                  className="flex-1"
                >
                  {isConfirming ? 'Réservation en cours...' : 'Confirmer la réservation'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
