// src/pages/Admin/Credits/CreditsErrorBoundary.tsx

import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';

interface CreditsErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface CreditsErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  isQuotaExceeded: boolean;
  isVersionError: boolean;
  isDatabaseClosed: boolean;
}

/**
 * Error Boundary spécifique pour la page Admin Credits.
 * 
 * Intercepte les erreurs Dexie.js spécifiques:
 * - QuotaExceededError: Stockage IndexedDB plein
 * - VersionError: Problème de migration de schéma
 * - DatabaseClosedError: DB fermée (tab en arrière-plan)
 * - InvalidStateError: Private browsing Safari
 * 
 * Affiche un message utilisateur adapté selon le type d'erreur.
 */
export class CreditsErrorBoundary extends Component<CreditsErrorBoundaryProps, CreditsErrorBoundaryState> {
  constructor(props: CreditsErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      isQuotaExceeded: false,
      isVersionError: false,
      isDatabaseClosed: false,
    };
  }

  static getDerivedStateFromError(error: Error): CreditsErrorBoundaryState {
    const isQuota = error.name === 'QuotaExceededError';
    const isVersion = error.name === 'VersionError' || error.message.includes('version');
    const isClosed = error.name === 'DatabaseClosedError' || error.message.includes('closed');

    return {
      hasError: true,
      error,
      isQuotaExceeded: isQuota,
      isVersionError: isVersion,
      isDatabaseClosed: isClosed,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[CreditsErrorBoundary] Caught error:', error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      isQuotaExceeded: false,
      isVersionError: false,
      isDatabaseClosed: false,
    });
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Message adapté selon le type d'erreur
      let title = 'Une erreur est survenue';
      let message = "Une erreur inattendue s'est produite lors du chargement des crédits.";
      let actionLabel = 'Réessayer';

      if (this.state.isQuotaExceeded) {
        title = 'Stockage saturé';
        message = "L'espace de stockage de votre navigateur est plein. Veuillez libérer de l'espace ou contacter l'administrateur.";
        actionLabel = 'Actualiser la page';
      } else if (this.state.isVersionError) {
        title = 'Problème de version';
        message = "La base de données nécessite une mise à jour. Veuillez actualiser la page.";
        actionLabel = 'Actualiser';
      } else if (this.state.isDatabaseClosed) {
        title = 'Base de données indisponible';
        message = "La base de données est temporairement indisponible. Veuillez réessayer.";
        actionLabel = 'Réessayer';
      }

      return (
        <div
          role="alert"
          className="min-h-screen bg-gray-50 flex items-center justify-center p-4"
        >
          <Card variant="elevated" className="max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <svg
                  className="h-6 w-6 text-red-600"
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
                <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
              </div>

              <p className="text-sm text-gray-600 mb-4">{message}</p>

              {this.state.error && !this.state.isQuotaExceeded && (
                <details className="mb-4">
                  <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                    Détails techniques
                  </summary>
                  <div className="mt-2 bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-mono text-gray-700 break-words">
                      {this.state.error.message}
                    </p>
                  </div>
                </details>
              )}

              <Button onClick={this.handleRetry} variant="primary" className="w-full">
                {actionLabel}
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
