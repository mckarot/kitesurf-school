// src/pages/Student/StudentBalance.tsx

import type { StudentBalance } from '../../types';

interface StudentBalanceProps {
  balance: StudentBalance;
  className?: string;
}

/**
 * Composant d'affichage du solde de séances pour l'étudiant.
 *
 * Affiche:
 * - Séances restantes en gros (avec code couleur)
 * - Détail du solde (total / utilisé)
 * - Indicateur visuel selon le niveau du solde
 *
 * Codes couleur:
 * - Vert: Solde > 2 séances
 * - Orange: Solde 1-2 séances
 * - Rouge: Solde = 0 séances
 *
 * @param props - Props du composant
 * @returns JSX.Element - Affichage du solde
 *
 * @example
 * ```tsx
 * <StudentBalance
 *   balance={{ totalSessions: 4, usedSessions: 1, remainingSessions: 3 }}
 *   className="mb-6"
 * />
 * ```
 */
export function StudentBalance({ balance, className = '' }: StudentBalanceProps) {
  const { totalSessions, usedSessions, remainingSessions } = balance;

  // Déterminer le style selon le solde
  const getBalanceStyle = () => {
    if (remainingSessions === 0) {
      return {
        container: 'bg-red-50 border border-red-200',
        text: 'text-red-700',
        label: 'text-red-600',
        icon: (
          <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ),
        statusText: 'Solde épuisé',
      };
    }

    if (remainingSessions <= 2) {
      return {
        container: 'bg-yellow-50 border border-yellow-200',
        text: 'text-yellow-700',
        label: 'text-yellow-600',
        icon: (
          <svg className="w-6 h-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        ),
        statusText: 'Solde faible',
      };
    }

    return {
      container: 'bg-green-50 border border-green-200',
      text: 'text-green-700',
      label: 'text-green-600',
      icon: (
        <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      statusText: 'Solde disponible',
    };
  };

  const style = getBalanceStyle();

  return (
    <div
      className={`rounded-lg p-4 ${style.container} ${className}`}
      role="status"
      aria-live="polite"
      aria-label={`Solde de crédits: ${remainingSessions} séances disponibles`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {style.icon}
          <div>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-bold ${style.text}`}>
                {remainingSessions} séances
              </span>
              <span className={`text-sm font-medium ${style.label}`}>
                {remainingSessions === 0 ? 'Solde épuisé' : 'disponibles'}
              </span>
            </div>
            {remainingSessions > 0 && (
              <p className={`text-xs ${style.label} mt-0.5`}>{style.statusText}</p>
            )}
          </div>
        </div>

        {/* Détail du solde */}
        <div className="text-right">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Total:</span> {totalSessions} séances
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">Utilisé:</span> {usedSessions} séances
          </div>
        </div>
      </div>

      {/* Barre de progression visuelle */}
      {totalSessions > 0 && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Progression</span>
            <span>{Math.round((usedSessions / totalSessions) * 100)}% utilisé</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                remainingSessions === 0
                  ? 'bg-red-500'
                  : remainingSessions <= 2
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${(usedSessions / totalSessions) * 100}%` }}
              aria-hidden="true"
            />
          </div>
        </div>
      )}
    </div>
  );
}
