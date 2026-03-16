// src/pages/Admin/Credits/CreditsTable.tsx

import type { AdminCreditView } from '../../../types';
import { Button } from '../../../components/ui/Button';

interface CreditsTableProps {
  students: AdminCreditView[];
  onAddCredits: (studentId: number) => void;
  onViewHistory: (studentId: number) => void;
}

/**
 * Tableau d'affichage des portefeuilles élèves (en euros).
 *
 * Affiche pour chaque élève:
 * - Nom et email
 * - Solde en euros
 * - Nombre de transactions
 * - Boutons d'action (Ajouter des fonds, Historique)
 *
 * @param props - Props du composant
 * @returns JSX.Element - Tableau des portefeuilles
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
          aria-label="Tableau des portefeuilles élèves"
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
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Activité
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

                {/* Solde en euros */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col gap-1">
                    {/* Solde (en gros) */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-2xl font-bold ${
                          student.remainingSessions === 0
                            ? 'text-red-700'
                            : student.remainingSessions <= 20
                            ? 'text-yellow-700'
                            : 'text-green-700'
                        }`}
                        aria-label={`${student.remainingSessions.toFixed(2)} euros disponibles`}
                      >
                        {student.remainingSessions.toFixed(2)}€
                      </span>
                      <span className="text-xs text-gray-500">disponibles</span>
                    </div>

                    {/* Statut */}
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        student.remainingSessions >= 70
                          ? 'bg-green-100 text-green-800'
                          : student.remainingSessions > 0
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {student.remainingSessions >= 70
                          ? '✓ Peut réserver (70€)'
                          : student.remainingSessions > 0
                          ? `⚠ Solde insuffisant (${(70 - student.remainingSessions).toFixed(2)}€ manquants)`
                          : '✗ Solde vide'
                        }
                      </span>
                    </div>
                  </div>
                </td>

                {/* Activité */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium text-gray-900">{student.creditsCount}</span> transaction{student.creditsCount > 1 ? 's' : ''}
                    {student.lastCreditDate && (
                      <span className="text-gray-500 ml-2">
                        • {new Date(student.lastCreditDate).toLocaleDateString('fr-FR')}
                      </span>
                    )}
                  </div>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onAddCredits(student.studentId)}
                      aria-label={`Ajouter des fonds pour ${student.studentName}`}
                    >
                      Ajouter des fonds
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
