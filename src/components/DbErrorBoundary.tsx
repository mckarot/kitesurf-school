// src/components/DbErrorBoundary.tsx

import { Component, ErrorInfo, ReactNode } from 'react';

interface DbErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface DbErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class DbErrorBoundary extends Component<DbErrorBoundaryProps, DbErrorBoundaryState> {
  constructor(props: DbErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): DbErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to monitoring service in production
    console.error('Database error caught by boundary:', error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
    // Reload the page to reset state
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          role="alert"
          className="min-h-screen bg-gray-50 flex items-center justify-center p-4"
        >
          <div className="max-w-md w-full bg-white rounded-xl border border-gray-200 p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Erreur de base de données
            </h2>

            <p className="text-sm text-gray-600 mb-4">
              Une erreur est survenue lors de l'accès aux données. Veuillez réessayer.
            </p>

            {this.state.error && (
              <div className="bg-gray-50 rounded-lg p-3 mb-4 text-left">
                <p className="text-xs font-mono text-gray-700 break-words">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <button
              onClick={this.handleRetry}
              className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
            >
              Réessayer
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
