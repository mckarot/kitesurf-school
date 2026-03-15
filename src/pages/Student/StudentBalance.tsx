// src/pages/Student/StudentBalance.tsx

import { motion } from 'framer-motion';
import type { StudentBalance as StudentBalanceType } from '../../types';
import { AnimatedCard } from '../../components/ui/AnimatedCard';

interface StudentBalanceProps {
  balance: StudentBalanceType;
  className?: string;
}

interface BalanceStyle {
  container: string;
  text: string;
  label: string;
  icon: React.ReactNode;
  statusText: string;
  progressColor: string;
}

/**
 * Composant d'affichage du solde de séances pour l'étudiant.
 *
 * Affiche:
 * - Séances restantes en gros (avec code couleur)
 * - Détail du solde (total / utilisé)
 * - Indicateur visuel selon le niveau du solde
 * - Barre de progression animée
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
  const getBalanceStyle = (): BalanceStyle => {
    if (remainingSessions === 0) {
      return {
        container: 'bg-red-50 border-red-200',
        text: 'text-red-700',
        label: 'text-red-600',
        icon: (
          <motion.svg
            className="w-6 h-6 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.3, type: 'spring' }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </motion.svg>
        ),
        statusText: 'Solde épuisé',
        progressColor: 'bg-red-500',
      };
    }

    if (remainingSessions <= 2) {
      return {
        container: 'bg-yellow-50 border-yellow-200',
        text: 'text-yellow-700',
        label: 'text-yellow-600',
        icon: (
          <motion.svg
            className="w-6 h-6 text-yellow-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.3, type: 'spring' }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </motion.svg>
        ),
        statusText: 'Solde faible',
        progressColor: 'bg-yellow-500',
      };
    }

    return {
      container: 'bg-green-50 border-green-200',
      text: 'text-green-700',
      label: 'text-green-600',
      icon: (
        <motion.svg
          className="w-6 h-6 text-green-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          initial={{ scale: 0.8, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.3, type: 'spring' }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </motion.svg>
      ),
      statusText: 'Solde disponible',
      progressColor: 'bg-green-500',
    };
  };

  const style = getBalanceStyle();
  const progressPercentage = totalSessions > 0 ? (usedSessions / totalSessions) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <AnimatedCard variant="elevated" className={`${style.container} ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {style.icon}
            <div>
              <div className="flex items-baseline gap-2">
                <motion.span
                  className={`text-3xl font-bold ${style.text}`}
                  key={remainingSessions}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, type: 'spring' }}
                >
                  {remainingSessions} séances
                </motion.span>
                <span className={`text-sm font-medium ${style.label}`}>
                  {remainingSessions === 0 ? 'Solde épuisé' : 'disponibles'}
                </span>
              </div>
              {remainingSessions > 0 && (
                <motion.p
                  className={`text-xs ${style.label} mt-0.5`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {style.statusText}
                </motion.p>
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

        {/* Barre de progression visuelle animée */}
        {totalSessions > 0 && (
          <motion.div
            className="mt-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Progression</span>
              <span>{Math.round(progressPercentage)}% utilisé</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <motion.div
                className={`h-2 rounded-full ${style.progressColor}`}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{
                  duration: 0.8,
                  delay: 0.4,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                aria-hidden="true"
              />
            </div>
          </motion.div>
        )}
      </AnimatedCard>
    </motion.div>
  );
}
