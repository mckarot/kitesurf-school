// src/pages/Profile/ConfirmDeletionPage.tsx

import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLoaderData } from 'react-router-dom';
import { useDeleteAccount } from '../../hooks/useDeleteAccount';
import { getDeletionRequestByToken } from '../../utils/deleteAccountLogic';
import type { DeletionRequest } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';

export interface ConfirmDeletionLoaderData {
  request: DeletionRequest;
  token: string;
}

/**
 * Loader pour la page de confirmation de suppression
 * Route : /profil/confirmer-suppression/:token
 */
export async function confirmDeletionLoader({
  params,
}: {
  params: { token?: string };
}): Promise<ConfirmDeletionLoaderData> {
  const token = params.token;

  if (!token) {
    throw new Response('Token manquant', { status: 400 });
  }

  const request = await getDeletionRequestByToken(token);

  if (!request) {
    throw new Response('Demande invalide ou expirée', { status: 404 });
  }

  return { request, token };
}

/**
 * Page de confirmation de suppression de compte
 * Route : /profil/confirmer-suppression/:token
 */
export function ConfirmDeletionPage() {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const loaderData = useLoaderData() as ConfirmDeletionLoaderData | undefined;
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [request, setRequest] = useState<DeletionRequest | null>(null);

  // Charger la demande au montage du composant si pas de loaderData
  useEffect(() => {
    async function loadRequest() {
      if (loaderData?.request) {
        setRequest(loaderData.request);
      } else if (token) {
        const req = await getDeletionRequestByToken(token);
        if (req) {
          setRequest(req);
        }
      }
    }
    loadRequest();
  }, [token, loaderData]);

  const { confirmDeletion } = useDeleteAccount(request?.userId ?? 0);

  const handleConfirm = async () => {
    if (!token) {
      setError('Token invalide');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await confirmDeletion(token);

      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error ?? 'Une erreur est survenue');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card>
          <CardBody>
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-gray-400 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Chargement...
              </h2>
              <p className="text-sm text-gray-600">
                Vérification de votre demande de suppression
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">
              ✅ Demande confirmée
            </h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">
                  Suppression confirmée avec succès
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Votre compte sera définitivement supprimé dans 7 jours. Vous recevrez
                  un email de confirmation avant la suppression finale.
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                📧 Un email de confirmation vous a été envoyé.
              </p>
            </div>

            <Button
              variant="primary"
              onClick={() => navigate('/login')}
              className="w-full"
            >
              Retour à l'accueil
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  const scheduledDate = request.scheduledFor
    ? new Date(request.scheduledFor).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'non définie';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">
            Confirmer la suppression de compte
          </h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <p className="text-sm text-gray-600">
            Vous avez demandé la suppression de votre compte. Veuillez confirmer
            cette action pour lancer la procédure.
          </p>

          {/* Avertissement délai */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="text-sm text-yellow-800">
                  ⏰ Vous avez jusqu'au <span className="font-semibold">{scheduledDate}</span>{' '}
                  pour annuler cette demande.
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  Après cette date, la suppression deviendra définitive.
                </p>
              </div>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div
              role="alert"
              className="rounded-lg bg-red-50 border border-red-200 p-4"
            >
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-4">
            <Button
              variant="danger"
              onClick={handleConfirm}
              isLoading={isLoading}
              className="w-full"
            >
              Confirmer la suppression définitive
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate('/profil/mes-donnees')}
              disabled={isLoading}
              className="w-full"
            >
              Annuler
            </Button>
          </div>

          {/* Info RGPD */}
          <div className="text-xs text-gray-500 text-center pt-4 border-t border-gray-100">
            <p>
              Conformément au RGPD Article 17, vous disposez d'un droit à l'effacement
              de vos données personnelles.
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
