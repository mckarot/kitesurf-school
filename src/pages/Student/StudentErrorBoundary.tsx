// src/pages/Student/StudentErrorBoundary.tsx

import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

interface StudentErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface StudentErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  isBalanceError: boolean;
}

/**
 * Error Boundary spécifique pour la page Student.
 * 
 * Intercepte les erreurs lors de:
 * - Chargement du solde
 * - Réservation de cours
 * - Consommation d'heures
 * 
 * Affiche un message utilisateur adapté.
 */
export class StudentErrorBoundary extends Component<StudentErrorBoundaryProps, StudentErrorBoundaryState> {
  constructor(props: StudentErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      isBalanceError: false,
    };
  }

  static getDerivedStateFromError(error: Error): StudentErrorBoundaryState {
    const isBalanceError = 
      error.message.includes('balance') || 
      error.message.includes('crédit') ||
      error.message.includes('solde');

    return {
      hasError: true,
      error,
      isBalanceError,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[StudentErrorBoundary] Caught error:', error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      isBalanceError: false,
    });
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      let title = 'Une erreur est survenue';
      let message = "Une erreur inattendue s'est produite lors du chargement de vos données.";

      if (this.state.isBalanceError) {
        title = 'Erreur de solde';
        message = "Impossible de charger votre solde de crédits. Veuillez réessayer.";
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

              {this.state.error && (
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
                Réessayer
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
