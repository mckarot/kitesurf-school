// src/pages/Profile/DeleteAccountPage.tsx

import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useDeleteAccount } from '../../hooks/useDeleteAccount';
import type { DeletionRequest } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Checkbox } from '../../components/ui/Checkbox';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';

interface DeletionReason {
  value: string;
  label: string;
}

const DELETION_REASONS: DeletionReason[] = [
  { value: '', label: 'Sélectionner...' },
  { value: 'too_expensive', label: 'Trop cher' },
  { value: 'not_available', label: 'Pas assez de disponibilités' },
  { value: 'found_alternative', label: "J'ai trouvé une autre école" },
  { value: 'other', label: 'Autre' },
];

/**
 * Page de demande de suppression de compte (RGPD Article 17)
 * Route : /profil/supprimer-compte
 */
export function DeleteAccountPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { requestDeletion, cancelDeletion, isLoading, error } = useDeleteAccount(user?.id ?? 0);

  // État local
  const [password, setPassword] = useState('');
  const [reason, setReason] = useState('');
  const [understands, setUnderstands] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [createdRequest, setCreatedRequest] = useState<DeletionRequest | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Vérifier que l'utilisateur est connecté
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Vous devez être connecté pour accéder à cette page
          </p>
          <a
            href="/login"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Se connecter
          </a>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    if (!understands) {
      setFormError('Vous devez cocher la case de compréhension');
      return;
    }

    if (!password) {
      setFormError('Veuillez confirmer votre mot de passe');
      return;
    }

    const result = await requestDeletion(password, reason || undefined);

    if (result.success && result.request) {
      setCreatedRequest(result.request);
      setShowModal(true);
    } else {
      setFormError(result.error ?? 'Une erreur est survenue');
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    // Rediriger vers le profil après fermeture
    navigate('/profil/mes-donnees');
  };

  const handleCancelFromModal = async () => {
    const result = await cancelDeletion();
    if (result.success) {
      setCreatedRequest(null);
      setShowModal(false);
      navigate('/profil/mes-donnees');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <a
              href="/profil/mes-donnees"
              className="text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="Retour aux données personnelles"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </a>
            <h1 className="text-xl font-bold text-gray-900">Supprimer mon compte</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Avertissement solennel */}
        <Card variant="default">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg
                className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div>
                <h2 className="text-red-800 font-semibold">⚠️ Attention</h2>
                <p className="text-red-700 text-sm mt-1">
                  Cette action est irréversible. Votre compte sera définitivement supprimé
                  après la période de rétractation de 7 jours.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Données supprimées */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">
              🗑️ Données supprimées (RGPD Article 17)
            </h2>
          </CardHeader>
          <CardBody>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Identité (nom, email, photo)
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Données physiques (poids, taille)
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Données de santé (conditions médicales, allergies)
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Crédits de cours
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Progression pédagogique (anonymisée)
              </li>
            </ul>
          </CardBody>
        </Card>

        {/* Données conservées */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">
              📁 Données conservées (obligations légales)
            </h2>
          </CardHeader>
          <CardBody>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Transactions (10 ans, obligation comptable)
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Réservations anonymisées (historique)
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Demande de suppression (1 an, audit)
              </li>
            </ul>
          </CardBody>
        </Card>

        {/* Formulaire */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">
              Confirmer la suppression
            </h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Error message */}
              {(formError || error) && (
                <div
                  role="alert"
                  className="rounded-lg bg-red-50 border border-red-200 p-4"
                >
                  <p className="text-sm text-red-800">
                    {formError || error?.message}
                  </p>
                </div>
              )}

              <Input
                type="password"
                label="Confirmer votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isLoading}
                autoComplete="current-password"
              />

              <Select
                label="Raison (optionnel)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={isLoading}
              >
                {DELETION_REASONS.map((reasonOption) => (
                  <option key={reasonOption.value} value={reasonOption.value}>
                    {reasonOption.label}
                  </option>
                ))}
              </Select>

              <Checkbox
                label="Je comprends que la suppression est irréversible et que je dispose de 7 jours pour annuler"
                checked={understands}
                onChange={(e) => setUnderstands(e.target.checked)}
                disabled={isLoading}
                required
              />

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  variant="danger"
                  isLoading={isLoading}
                  disabled={!understands || !password}
                >
                  Demander la suppression
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate('/profil/mes-donnees')}
                  disabled={isLoading}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>

        {/* Footer info */}
        <div className="text-center text-xs text-gray-500">
          <p>
            Conformément au RGPD Article 17, vous disposez d'un droit à l'effacement.
          </p>
          <p className="mt-1">
            Pour toute question, contactez{' '}
            <a
              href="mailto:privacy@kitesurf-school.com"
              className="text-blue-600 hover:underline"
            >
              privacy@kitesurf-school.com
            </a>
          </p>
        </div>
      </main>

      {/* Modal de confirmation */}
      {showModal && createdRequest && (
        <DeleteConfirmationModal
          isOpen={showModal}
          onClose={handleModalClose}
          confirmationToken={createdRequest.confirmationToken}
          scheduledFor={createdRequest.scheduledFor!}
          onCancelDeletion={handleCancelFromModal}
        />
      )}
    </div>
  );
}
