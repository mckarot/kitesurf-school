// src/utils/buildAdminCreditView.ts

import type { User, CourseCredit, AdminCreditView } from '../types';
import { calculateBalance } from './calculateBalance';

/**
 * Construit une vue AdminCreditView à partir des données brutes.
 *
 * Cette fonction agrège:
 * - Les informations de l'élève (nom, email)
 * - Tous ses crédits pour calculer le solde
 * - Le nombre de crédits et la date du dernier
 *
 * @param student - L'utilisateur élève
 * @param credits - Tous les crédits de cet élève
 * @returns AdminCreditView - Vue consolidée pour affichage
 *
 * @example
 * ```typescript
 * const view = buildAdminCreditView(student, [
 *   { id: 1, studentId: 1, sessions: 4, usedSessions: 1, status: 'active', ... },
 *   { id: 2, studentId: 1, sessions: 2, usedSessions: 0, status: 'active', ... }
 * ]);
 * // view = {
 * //   studentId: 1,
 * //   studentName: "John Doe",
 * //   studentEmail: "john@example.com",
 * //   totalSessions: 6,
 * //   usedSessions: 1,
 * //   remainingSessions: 5,
 * //   creditsCount: 2,
 * //   lastCreditDate: ...
 * // }
 * ```
 */
export function buildAdminCreditView(
  student: User,
  credits: CourseCredit[]
): AdminCreditView {
  // Calcul du solde à partir de tous les crédits (actifs et non actifs)
  const balance = calculateBalance(credits);

  // Tri des crédits par date pour trouver le plus récent
  const sortedCredits = [...credits].sort((a, b) => b.createdAt - a.createdAt);
  const lastCreditDate = sortedCredits.length > 0 ? sortedCredits[0].createdAt : undefined;

  return {
    studentId: student.id,
    studentName: `${student.firstName} ${student.lastName}`.trim() || `Élève #${student.id}`,
    studentEmail: student.email,
    totalSessions: balance.totalSessions,
    usedSessions: balance.usedSessions,
    remainingSessions: balance.remainingSessions,
    creditsCount: credits.length,
    lastCreditDate,
  };
}

/**
 * Construit un tableau de AdminCreditView pour tous les élèves.
 *
 * @param students - Tableau de tous les élèves
 * @param allCredits - Tableau de tous les crédits (tous étudiants confondus)
 * @returns AdminCreditView[] - Tableau des vues consolidées
 *
 * @example
 * ```typescript
 * const views = buildAllAdminCreditViews(students, credits);
 * // views = [
 * //   { studentId: 1, studentName: "John Doe", ... },
 * //   { studentId: 2, studentName: "Jane Smith", ... }
 * // ]
 * ```
 */
export function buildAllAdminCreditViews(
  students: User[],
  allCredits: CourseCredit[]
): AdminCreditView[] {
  return students.map((student) => {
    // Filtrer les crédits pour cet élève uniquement
    const studentCredits = allCredits.filter((credit) => credit.studentId === student.id);
    return buildAdminCreditView(student, studentCredits);
  });
}
