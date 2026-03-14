// src/pages/Profile/DeleteConfirmationModal.tsx

import { useState, useEffect, useRef } from 'react';
import { Button } from '../../components/ui/Button';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  confirmationToken: string;
  scheduledFor: number;
  onCancelDeletion: () => Promise<void>;
}

/**
 * Modale de confirmation affichée après la demande de suppression de compte
 *
 * Affiche :
 * - ✅ "Demande créée avec succès"
 * - 📧 "Email de confirmation envoyé" (simulation)
 * - 🔗 Lien de confirmation (affiché pour test)
 * - ⏰ Countdown "Suppression dans X jours"
 * - ❌ Bouton "Annuler la suppression"
 */
export function DeleteConfirmationModal({
  isOpen,
  onClose,
  confirmationToken,
  scheduledFor,
  onCancelDeletion,
}: DeleteConfirmationModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Focus au premier élément à l'ouverture
  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
    }
  }, [isOpen]);

  // Fermeture sur Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Empêcher le scroll du body quand la modale est ouverte
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      await onCancelDeletion();
      onClose();
    } catch (error) {
      console.error('Error cancelling deletion:', error);
    } finally {
      setIsCancelling(false);
    }
  };

  // Calcul du temps restant avant suppression
  const now = Date.now();
  const timeRemaining = scheduledFor - now;
  const daysRemaining = Math.max(0, Math.floor(timeRemaining / (1000 * 60 * 60 * 24)));
  const hoursRemaining = Math.max(0, Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      role="dialog"
      aria-modal="true"
      aria-label="Confirmation de suppression de compte"
    >
      <div className="bg-white rounded-xl border border-gray-200 shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Demande de suppression créée
            </h2>
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 rounded-lg p-1"
              aria-label="Fermer la modale"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4">
          {/* Success message */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Demande créée avec succès</h3>
              <p className="text-sm text-gray-600 mt-1">
                Votre demande de suppression de compte a été enregistrée.
              </p>
            </div>
          </div>

          {/* Email info */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Email de confirmation envoyé</h3>
              <p className="text-sm text-gray-600 mt-1">
                Un email avec un lien de confirmation vous a été envoyé (simulé).
              </p>
            </div>
          </div>

          {/* Countdown */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="font-medium text-yellow-800">Période de rétractation</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Vous avez <span className="font-semibold">{daysRemaining} jour(s)</span> et{' '}
                  <span className="font-semibold">{hoursRemaining} heure(s)</span> pour annuler.
                </p>
                <p className="text-xs text-yellow-600 mt-2">
                  Suppression prévue le :{' '}
                  <span className="font-mono">
                    {new Date(scheduledFor).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Confirmation link (for testing) */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              🔗 Lien de confirmation (pour test)
            </h4>
            <p className="text-xs text-gray-600 mb-2">
              Copiez ce lien dans votre navigateur pour confirmer la suppression :
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-white border border-gray-200 rounded px-2 py-1.5 text-xs font-mono text-gray-700 truncate">
                /profil/confirmer-suppression/{confirmationToken}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`/profil/confirmer-suppression/${confirmationToken}`);
                }}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 rounded px-2 py-1"
                aria-label="Copier le lien de confirmation"
              >
                Copier
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-6 py-4 flex flex-col sm:flex-row gap-3">
          <Button
            variant="secondary"
            onClick={handleCancel}
            isLoading={isCancelling}
            className="flex-1"
          >
            ❌ Annuler la suppression
          </Button>
          <Button
            variant="ghost"
            onClick={onClose}
            className="flex-1"
          >
            Fermer
          </Button>
        </div>
      </div>
    </div>
  );
}
