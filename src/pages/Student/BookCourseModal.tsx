// src/pages/Student/BookCourseModal.tsx

import { useState, useEffect, useRef } from 'react';
import type { CourseSession } from '../../types';
import { Button } from '../../components/ui/Button';

interface BookCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseSession: CourseSession | null;
  sessionsRequired: number;
  currentBalance: number;
  onConfirm: () => Promise<void>;
}

/**
 * Modal de confirmation de réservation avec décrémentation de crédits.
 *
 * Affiche:
 * - Détails de la session (date, heure, lieu)
 * - Nombre de séances requises (1 séance = 1 réservation)
 * - Solde actuel → Solde après réservation
 * - Boutons Annuler / Confirmer
 *
 * @param props - Props du composant
 * @returns JSX.Element | null - Modal ou null si fermé
 *
 * @example
 * ```tsx
 * <BookCourseModal
 *   isOpen={isModalOpen}
 *   onClose={() => setIsModalOpen(false)}
 *   courseSession={selectedSession}
 *   sessionsRequired={1}
 *   currentBalance={4}
 *   onConfirm={handleConfirmBooking}
 * />
 * ```
 */
export function BookCourseModal({
  isOpen,
  onClose,
  courseSession,
  sessionsRequired,
  currentBalance,
  onConfirm,
}: BookCourseModalProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  const newBalance = currentBalance - sessionsRequired;
  const hasSufficientBalance = currentBalance >= sessionsRequired;

  // Focus trap et gestion de la touche Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !modalRef.current) return;

      const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('keydown', handleTabKey);

    // Focus sur le bouton de confirmation
    setTimeout(() => {
      confirmButtonRef.current?.focus();
    }, 100);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [isOpen, onClose]);

  // Réinitialiser l'état quand le modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      setIsConfirming(false);
      setError(null);
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    if (!hasSufficientBalance) {
      setError('Solde insuffisant pour cette réservation');
      return;
    }

    setIsConfirming(true);
    setError(null);

    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la réservation');
    } finally {
      setIsConfirming(false);
    }
  };

  if (!isOpen || !courseSession) return null;

  // Formater la date
  const formattedDate = new Date(courseSession.date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="book-modal-title"
      aria-describedby="book-modal-description"
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          aria-hidden="true"
          onClick={onClose}
        />

        {/* Modal Panel */}
        <div
          ref={modalRef}
          className="inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2
              id="book-modal-title"
              className="text-lg font-semibold text-gray-900"
            >
              Confirmer la réservation
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
              aria-label="Fermer le modal"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Description */}
          <p
            id="book-modal-description"
            className="text-sm text-gray-600 mb-6"
          >
            Cette réservation consommera 1 séance de votre solde de crédits.
          </p>

          {/* Détails de la session */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Détails de la session
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="capitalize">{formattedDate}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{courseSession.startTime} - {courseSession.endTime}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                </svg>
                <span>{courseSession.location}</span>
              </div>
            </div>
          </div>

          {/* Impact sur le solde */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Impact sur votre solde
            </h3>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                {/* Solde actuel */}
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Solde actuel</p>
                  <p className={`text-2xl font-bold ${
                    currentBalance === 0
                      ? 'text-red-700'
                      : currentBalance <= 2
                      ? 'text-yellow-700'
                      : 'text-green-700'
                  }`}>
                    {currentBalance} séances
                  </p>
                </div>

                {/* Flèche */}
                <div className="flex-1 px-4">
                  <svg
                    className="w-6 h-6 text-gray-400 mx-auto"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </div>

                {/* Séances consommées */}
                <div className="text-center px-4">
                  <p className="text-xs text-gray-500 mb-1">Cette réservation</p>
                  <p className="text-2xl font-bold text-orange-700">
                    -{sessionsRequired} séance{sessionsRequired > 1 ? 's' : ''}
                  </p>
                </div>

                {/* Flèche */}
                <div className="flex-1 px-4">
                  <svg
                    className="w-6 h-6 text-gray-400 mx-auto"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </div>

                {/* Nouveau solde */}
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Nouveau solde</p>
                  <p className={`text-2xl font-bold ${
                    newBalance === 0
                      ? 'text-red-700'
                      : newBalance <= 2
                      ? 'text-yellow-700'
                      : 'text-green-700'
                  }`}>
                    {newBalance} séances
                  </p>
                </div>
              </div>

              {/* Avertissement si solde insuffisant */}
              {!hasSufficientBalance && (
                <div
                  role="alert"
                  className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3"
                >
                  <p className="text-sm text-red-700 font-medium">
                    Solde insuffisant
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    Vous avez {currentBalance} séance(s) disponibles, {sessionsRequired} séance(s) requise(s).
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div
              role="alert"
              className="mb-6 bg-red-50 border border-red-200 rounded-lg p-3"
            >
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isConfirming}
            >
              Annuler
            </Button>
            <Button
              ref={confirmButtonRef}
              type="button"
              variant="primary"
              onClick={handleConfirm}
              isLoading={isConfirming}
              disabled={isConfirming || !hasSufficientBalance}
              aria-disabled={!hasSufficientBalance}
            >
              {isConfirming ? 'Réservation en cours...' : 'Confirmer la réservation'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
