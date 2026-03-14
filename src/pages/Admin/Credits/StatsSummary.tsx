// src/pages/Admin/Credits/StatsSummary.tsx

import { useMemo } from 'react';
import type { CourseCredit } from '../../../types';

interface StatsSummaryProps {
  credits: CourseCredit[];
}

/**
 * Composant d'affichage des statistiques globales des crédits.
 *
 * Affiche 4 cartes:
 * - Total des élèves avec des crédits
 * - Séances totales achetées
 * - Séances consommées
 * - Séances restantes
 *
 * @param props - Props du composant
 * @returns JSX.Element - Cartes de statistiques
 *
 * @example
 * ```tsx
 * <StatsSummary credits={credits} />
 * ```
 */
export function StatsSummary({ credits }: StatsSummaryProps) {
  const stats = useMemo(() => {
    // Nombre d'élèves uniques ayant des crédits
    const totalStudents = new Set(credits.map((c) => c.studentId)).size;

    // Total des séances achetées (tous crédits confondus)
    const totalSessions = credits.reduce((sum, c) => sum + c.sessions, 0);

    // Total des séances consommées
    const usedSessions = credits.reduce((sum, c) => sum + c.usedSessions, 0);

    // Séances restantes
    const remainingSessions = totalSessions - usedSessions;

    return { totalStudents, totalSessions, usedSessions, remainingSessions };
  }, [credits]);

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      role="region"
      aria-label="Statistiques des crédits"
    >
      {/* Total élèves */}
      <div
        className="bg-blue-50 border border-blue-200 rounded-xl p-4"
        role="status"
        aria-label={`Total élèves: ${stats.totalStudents}`}
      >
        <p className="text-sm text-gray-600 mb-1">Total élèves</p>
        <p className="text-2xl font-bold text-blue-700" aria-live="polite">
          {stats.totalStudents}
        </p>
      </div>

      {/* Séances totales */}
      <div
        className="bg-green-50 border border-green-200 rounded-xl p-4"
        role="status"
        aria-label={`Séances totales: ${stats.totalSessions}`}
      >
        <p className="text-sm text-gray-600 mb-1">Séances totales</p>
        <p className="text-2xl font-bold text-green-700" aria-live="polite">
          {stats.totalSessions}
        </p>
      </div>

      {/* Séances consommées */}
      <div
        className="bg-orange-50 border border-orange-200 rounded-xl p-4"
        role="status"
        aria-label={`Séances consommées: ${stats.usedSessions}`}
      >
        <p className="text-sm text-gray-600 mb-1">Séances consommées</p>
        <p className="text-2xl font-bold text-orange-700" aria-live="polite">
          {stats.usedSessions}
        </p>
      </div>

      {/* Séances restantes */}
      <div
        className="bg-purple-50 border border-purple-200 rounded-xl p-4"
        role="status"
        aria-label={`Séances restantes: ${stats.remainingSessions}`}
      >
        <p className="text-sm text-gray-600 mb-1">Séances restantes</p>
        <p className="text-2xl font-bold text-purple-700" aria-live="polite">
          {stats.remainingSessions}
        </p>
      </div>
    </div>
  );
}
