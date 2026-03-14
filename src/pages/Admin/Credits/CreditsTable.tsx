// src/pages/Admin/Credits/CreditsTable.tsx

import type { AdminCreditView } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';

interface CreditsTableProps {
  students: AdminCreditView[];
  onAddCredits: (studentId: number) => void;
  onViewHistory: (studentId: number) => void;
}

/**
 * Tableau d'affichage des crédits élèves pour la page Admin.
 *
 * Affiche pour chaque élève:
 * - Nom et email
 * - Solde détaillé (total / utilisé / restant)
 * - Nombre de crédits
 * - Boutons d'action (Ajouter, Historique)
 *
 * @param props - Props du composant
 * @returns JSX.Element - Tableau des crédits
 *
 * @example
 * ```tsx
 * <CreditsTable
 *   students={adminCreditViews}
 *   onAddCredits={(id) => setSelectedStudentId(id)}
 *   onViewHistory={(id) => setExpandedHistoryId(id)}
 * />
 * ```
 */
export function CreditsTable({ students, onAddCredits, onViewHistory }: CreditsTableProps) {
  if (students.length === 0) {
    return (
      <div
        role="alert"
        className="bg-white rounded-xl border border-gray-200 p-8 text-center"
      >
        <svg
          className="w-16 h-16 text-gray-300 mx-auto mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
        <p className="text-gray-600 font-medium">Aucun élève inscrit</p>
        <p className="text-sm text-gray-500 mt-1">
          Les élèves apparaîtront ici dès qu'ils seront inscrits
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table
          className="min-w-full divide-y divide-gray-200"
          role="table"
          aria-label="Tableau des crédits élèves"
        >
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Élève
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Solde
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map((student) => (
              <tr
                key={student.studentId}
                className="hover:bg-gray-50 transition-colors"
              >
                {/* Nom et Email */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">
                      {student.studentName}
                    </span>
                    <span className="text-sm text-gray-500">{student.studentEmail}</span>
                  </div>
                </td>

                {/* Solde */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col gap-1">
                    {/* Séances restantes (en gros) */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-lg font-bold ${
                          student.remainingSessions === 0
                            ? 'text-red-700'
                            : student.remainingSessions <= 2
                            ? 'text-yellow-700'
                            : 'text-green-700'
                        }`}
                        aria-label={`${student.remainingSessions} séances restantes`}
                      >
                        {student.remainingSessions} séances
                      </span>
                      <span className="text-xs text-gray-500">disponibles</span>
                    </div>

                    {/* Détail du solde */}
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>Total: {student.totalSessions} séances</span>
                      <span>•</span>
                      <span>Utilisé: {student.usedSessions} séances</span>
                    </div>
                  </div>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onAddCredits(student.studentId)}
                      aria-label={`Ajouter des crédits pour ${student.studentName}`}
                    >
                      Ajouter
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onViewHistory(student.studentId)}
                      aria-label={`Voir l'historique de ${student.studentName}`}
                    >
                      Historique
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
