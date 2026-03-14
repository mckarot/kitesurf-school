// src/pages/Admin/Credits/AddCreditsModal.tsx

import { useState, useEffect, useRef } from 'react';
import type { User, AddCreditsFormInput } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

interface AddCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddCreditsFormInput) => Promise<void>;
  students: User[];
  instructors: User[];
  initialStudentId?: number;
}

/**
 * Modal d'ajout de crédits pour un élève.
 *
 * Champs du formulaire:
 * - Dropdown: Sélectionner un élève (obligatoire)
 * - Dropdown: Sélectionner un moniteur (optionnel)
 * - Input: Nombre de séances (obligatoire, min 1)
 * - Input: Date d'expiration (optionnel)
 *
 * @param props - Props du composant
 * @returns JSX.Element | null - Modal ou null si fermé
 *
 * @example
 * ```tsx
 * <AddCreditsModal
 *   isOpen={isModalOpen}
 *   onClose={() => setIsModalOpen(false)}
 *   onSubmit={handleAddCredits}
 *   students={students}
 *   instructors={instructors}
 *   initialStudentId={selectedStudentId}
 * />
 * ```
 */
export function AddCreditsModal({
  isOpen,
  onClose,
  onSubmit,
  students,
  instructors,
  initialStudentId,
}: AddCreditsModalProps) {
  const [studentId, setStudentId] = useState<number>(initialStudentId || 0);
  const [instructorId, setInstructorId] = useState<number | ''>('');
  const [sessions, setSessions] = useState<number>(1);
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLSelectElement>(null);

  // Réinitialiser le formulaire quand le modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      setStudentId(initialStudentId || 0);
      setInstructorId('');
      setSessions(1);
      setExpiresAt('');
      setError(null);
      setIsSubmitting(false);

      // Focus trap: focus sur le premier input
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, initialStudentId]);

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

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (studentId <= 0) {
      setError('Veuillez sélectionner un élève');
      return;
    }

    if (sessions <= 0) {
      setError('Le nombre de séances doit être supérieur à 0');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData: AddCreditsFormInput = {
        studentId,
        instructorId: instructorId === '' ? undefined : instructorId,
        sessions,
        expiresAt: expiresAt ? new Date(expiresAt).getTime() : undefined,
      };

      await onSubmit(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'ajout des crédits');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Format date min pour l'input date (aujourd'hui)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-credits-modal-title"
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
          className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2
              id="add-credits-modal-title"
              className="text-lg font-semibold text-gray-900"
            >
              Ajouter des crédits
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Sélection de l'élève */}
            <div>
              <label
                htmlFor="student-select"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Élève <span className="text-red-500">*</span>
              </label>
              <select
                id="student-select"
                ref={firstInputRef}
                value={studentId}
                onChange={(e) => setStudentId(Number(e.target.value))}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                required
                aria-required="true"
              >
                <option value={0}>Sélectionner un élève...</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.firstName} {student.lastName} ({student.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Sélection du moniteur (optionnel) */}
            <div>
              <label
                htmlFor="instructor-select"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Moniteur assigné <span className="text-gray-400">(optionnel)</span>
              </label>
              <select
                id="instructor-select"
                value={instructorId}
                onChange={(e) => setInstructorId(e.target.value === '' ? '' : Number(e.target.value))}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Aucun moniteur spécifique</option>
                {instructors.map((instructor) => (
                  <option key={instructor.id} value={instructor.id}>
                    {instructor.firstName} {instructor.lastName}
                  </option>
                ))}
              </select>
            </div>

            {/* Nombre de séances */}
            <Input
              id="sessions-input"
              label="Nombre de séances"
              type="number"
              value={sessions}
              onChange={(e) => setSessions(Number(e.target.value))}
              min="1"
              required
              aria-required="true"
            />
            <p className="text-xs text-gray-500 -mt-3">
              1 séance = 2h30 de cours
            </p>

            {/* Date d'expiration (optionnel) */}
            <div>
              <label
                htmlFor="expires-input"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Date d'expiration <span className="text-gray-400">(optionnel)</span>
              </label>
              <input
                type="date"
                id="expires-input"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                min={today}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {expiresAt && (
                <p className="mt-1 text-xs text-gray-500">
                  Expire le {new Date(expiresAt).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              )}
            </div>

            {/* Message d'erreur */}
            {error && (
              <div
                role="alert"
                className="bg-red-50 border border-red-200 rounded-lg p-3"
              >
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                disabled={isSubmitting || studentId <= 0 || sessions <= 0}
              >
                {isSubmitting ? 'Ajout en cours...' : 'Valider'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
