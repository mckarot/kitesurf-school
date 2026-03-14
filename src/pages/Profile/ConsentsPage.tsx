// src/pages/Profile/ConsentsPage.tsx

import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useConsents } from '../../hooks/useConsents';
import { Toggle } from '../../components/ui/Toggle';
import { Card, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { formatConsentDate } from '../../utils/consentManager';
import type { ConsentType, ConsentStatus, UserConsent } from '../../types';

/**
 * Configuration des versions des politiques de confidentialité
 * Chaque type de consentement a sa propre version
 */
const CONSENT_VERSIONS: Record<ConsentType, string> = {
  marketing_emails: '2.0',
  photos_marketing: '1.5',
  analytics_cookies: '1.0',
};

/**
 * Labels affichés pour chaque type de consentement
 */
const CONSENT_LABELS: Record<ConsentType, string> = {
  marketing_emails: 'Emails marketing',
  photos_marketing: 'Photos marketing',
  analytics_cookies: 'Cookies analytics',
};

/**
 * Sections de consentements avec titres et descriptions
 */
interface ConsentSection {
  type: ConsentType;
  title: string;
  description: string;
}

const CONSENT_SECTIONS: ConsentSection[] = [
  {
    type: 'marketing_emails',
    title: 'Emails marketing',
    description:
      "Recevez nos offres promotionnelles, nouveautés et conseils kitesurf par email. Vous pouvez vous désinscrire à tout moment.",
  },
  {
    type: 'photos_marketing',
    title: 'Utilisation de photos',
    description:
      "Autorisez-nous à utiliser vos photos de cours sur nos réseaux sociaux, site web et supports marketing.",
  },
  {
    type: 'analytics_cookies',
    title: "Cookies d'analyse",
    description:
      "Acceptez les cookies pour nous aider à améliorer notre site en mesurant l'audience et les performances.",
  },
];

/**
 * Page de gestion des consentements RGPD
 *
 * Route : /profil/consentements
 *
 * Fonctionnalités :
 * - Affichage de tous les types de consentements
 * - Toggle pour accepter/refuser chaque consentement
 * - Historique des consentements avec dates et versions
 * - Conformité RGPD avec traçabilité
 *
 * @example
 * ```tsx
 * // Dans le router
 * {
 *   path: '/profil/consentements',
 *   element: <ConsentsPage />,
 * }
 * ```
 */
export function ConsentsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { consents, isLoading, error, hasConsent, updateConsent } = useConsents(user?.id ?? 0);
  const [isUpdating, setIsUpdating] = useState<ConsentType | null>(null);

  // Ref pour le bouton de retour (focus management)
  const backButtonRef = useRef<HTMLButtonElement>(null);

  // Focus sur le bouton de retour au montage
  useEffect(() => {
    backButtonRef.current?.focus();
  }, []);

  /**
   * Gère le toggle d'un consentement
   */
  const handleToggleConsent = useCallback(
    async (type: ConsentType, checked: boolean) => {
      const status: ConsentStatus = checked ? 'accepted' : 'refused';
      setIsUpdating(type);

      try {
        await updateConsent(type, status);
      } catch (err) {
        // L'erreur est déjà gérée dans le hook, on pourrait afficher un toast ici
        console.error('[ConsentsPage] Failed to update consent:', err);
      } finally {
        setIsUpdating(null);
      }
    },
    [updateConsent]
  );

  /**
   * Récupère le consentement le plus récent pour un type
   */
  const getLatestConsentForType = useCallback(
    (type: ConsentType): UserConsent | undefined => {
      const filtered = consents.filter((c) => c.consentType === type);
      if (filtered.length === 0) return undefined;
      return filtered.sort((a, b) => b.updatedAt - a.updatedAt)[0];
    },
    [consents]
  );

  // Si l'utilisateur n'est pas connecté, retourner à la page de login
  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header avec retour */}
      <header className="flex items-center gap-4">
        <Button
          ref={backButtonRef}
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard')}
          aria-label="Retour au tableau de bord"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Mes consentements</h1>
      </header>

      {/* Introduction RGPD */}
      <Card>
        <CardBody>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Vos droits RGPD
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Conformément au Règlement Général sur la Protection des Données (RGPD),
                vous pouvez gérer vos consentements à tout moment. Chaque modification
                est enregistrée avec sa date et la version des conditions applicables.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Message d'erreur */}
      {error && (
        <div
          role="alert"
          className="rounded-lg bg-red-50 border border-red-200 p-4"
        >
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm font-medium text-red-800">
              Une erreur est survenue lors du chargement de vos consentements.
            </p>
          </div>
          <p className="mt-1 text-xs text-red-600">{error.message}</p>
        </div>
      )}

      {/* État de chargement */}
      {isLoading && (
        <div
          aria-busy="true"
          aria-live="polite"
          className="text-center py-8"
        >
          <div className="inline-flex items-center gap-2 text-gray-600">
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
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
            <span>Chargement de vos consentements...</span>
          </div>
        </div>
      )}

      {/* Sections de consentements */}
      {!isLoading && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Gérer vos préférences
          </h2>

          {CONSENT_SECTIONS.map((section) => {
            const consent = getLatestConsentForType(section.type);
            const isChecked = hasConsent(section.type);
            const isDisabled = isUpdating !== null && isUpdating !== section.type;

            return (
              <Card key={section.type}>
                <CardBody>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900">
                        {section.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600">
                        {section.description}
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                        <span>Version {CONSENT_VERSIONS[section.type]}</span>
                        {consent && (
                          <>
                            <span aria-hidden="true">•</span>
                            <span>
                              {consent.status === 'accepted' ? 'Accepté' : 'Refusé'}{' '}
                              le {formatConsentDate(consent.acceptedAt)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <Toggle
                      checked={isChecked}
                      onChange={(checked) =>
                        handleToggleConsent(section.type, checked)
                      }
                      disabled={isUpdating !== null && isUpdating !== section.type}
                      label={section.title}
                      size="md"
                    />
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      {/* Historique */}
      {!isLoading && consents.length > 0 && (
        <Card>
          <CardBody>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Historique de vos consentements
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Type
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Statut
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Date
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Version
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {consents
                    .sort((a, b) => b.acceptedAt - a.acceptedAt)
                    .map((consent) => (
                      <tr key={consent.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {CONSENT_LABELS[consent.consentType]}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Badge
                            variant={
                              consent.status === 'accepted' ? 'success' : 'danger'
                            }
                            size="sm"
                          >
                            {consent.status === 'accepted' ? 'Accepté' : 'Refusé'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {formatConsentDate(consent.acceptedAt)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          v{consent.version}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Aucun consentement */}
      {!isLoading && consents.length === 0 && (
        <Card>
          <CardBody>
            <div className="text-center py-6">
              <svg
                className="w-12 h-12 text-gray-400 mx-auto mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-sm text-gray-600">
                Vous n'avez pas encore défini de consentements.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Utilisez les toggles ci-dessus pour gérer vos préférences.
              </p>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
