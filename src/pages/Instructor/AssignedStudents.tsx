// src/pages/Instructor/AssignedStudents.tsx

import type { User, CourseCredit, AdminCreditView } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { buildAdminCreditView } from '../../utils/buildAdminCreditView';

interface AssignedStudentsProps {
  students: User[];
  allCredits: CourseCredit[];
  instructorId: number;
}

/**
 * Composant d'affichage des élèves assignés à un moniteur.
 *
 * Affiche:
 * - Liste des élèves avec leurs soldes de crédits
 * - Nombre de séances restantes par élève
 * - Total des séances à dispenser
 *
 * @param props - Props du composant
 * @returns JSX.Element - Liste des élèves assignés
 *
 * @example
 * ```tsx
 * <AssignedStudents
 *   students={students}
 *   allCredits={credits}
 *   instructorId={instructorId}
 * />
 * ```
 */
export function AssignedStudents({ students, allCredits, instructorId }: AssignedStudentsProps) {
  // Construire les vues AdminCreditView pour tous les élèves
  // Note: Dans une implémentation réelle, on filtrerait par les élèves assignés à ce moniteur
  const adminCreditViews: AdminCreditView[] = students.map((student) => {
    const studentCredits = allCredits.filter((c) => c.studentId === student.id);
    return buildAdminCreditView(student, studentCredits);
  });

  // Calculer le total des séances à dispenser (somme des séances restantes de tous les élèves)
  const totalSessionsToTeach = adminCreditViews.reduce((sum, s) => sum + s.remainingSessions, 0);

  // Filtrer les élèves qui ont des crédits restants (pour affichage prioritaire)
  const studentsWithBalance = adminCreditViews.filter((s) => s.remainingSessions > 0);
  const studentsWithoutBalance = adminCreditViews.filter((s) => s.remainingSessions === 0);

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
      {/* Header avec résumé */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Mes élèves assignés
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {students.length} élève{students.length > 1 ? 's' : ''} au total
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Séances à dispenser</p>
            <p className="text-2xl font-bold text-blue-600">{totalSessionsToTeach}</p>
          </div>
        </div>
      </div>

      {/* Liste des élèves */}
      <div className="divide-y divide-gray-200">
        {/* Élèves avec solde positif (en premier) */}
        {studentsWithBalance.map((student) => (
          <div
            key={student.studentId}
            className="px-6 py-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {student.studentName}
                    </p>
                    <p className="text-xs text-gray-500">{student.studentEmail}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Solde */}
                <div className="text-right">
                  <p
                    className={`text-lg font-bold ${
                      student.remainingSessions <= 2
                        ? 'text-yellow-700'
                        : 'text-green-700'
                    }`}
                  >
                    {student.remainingSessions} séances
                  </p>
                  <p className="text-xs text-gray-500">disponibles</p>
                </div>

                {/* Badge de statut */}
                <Badge variant={student.remainingSessions > 0 ? 'success' : 'secondary'}>
                  {student.remainingSessions > 0 ? 'Actif' : 'Épuisé'}
                </Badge>
              </div>
            </div>
          </div>
        ))}

        {/* Élèves sans solde (section séparée si nécessaire) */}
        {studentsWithoutBalance.length > 0 && (
          <>
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Élèves sans solde restant ({studentsWithoutBalance.length})
              </p>
            </div>
            {studentsWithoutBalance.map((student) => (
              <div
                key={student.studentId}
                className="px-6 py-4 hover:bg-gray-50 transition-colors opacity-60"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {student.studentName}
                    </p>
                    <p className="text-xs text-gray-500">{student.studentEmail}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold text-red-700">0 séance</p>
                    <p className="text-xs text-gray-500">Solde épuisé</p>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
