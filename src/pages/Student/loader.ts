// src/pages/Student/loader.ts

import { db } from '../../db/db';
import type { CourseCredit, Reservation } from '../../types';

export interface StudentLoaderData {
  credits: CourseCredit[];
  reservations: Reservation[];
}

/**
 * Loader React Router pour la page Student.
 *
 * Charge en parallèle:
 * - Tous les crédits de l'étudiant connecté
 * - Toutes les réservations de l'étudiant connecté
 *
 * Ces données sont utilisées pour:
 * - Calculer et afficher le solde de séances
 * - Afficher l'historique des réservations
 * - Déterminer si l'étudiant peut réserver (solde > 0)
 *
 * Note: Les sessions sont chargées dynamiquement par le hook useAvailableSessions
 *       en fonction des SchoolSchedule et InstructorAvailability
 *
 * @returns Promise<StudentLoaderData> - Données pour la page Student
 *
 * @throws {Error} - Si l'utilisateur n'est pas authentifié
 *
 * @example
 * ```typescript
 * // Dans Student/index.tsx
 * const { credits, reservations } = useLoaderData() as StudentLoaderData;
 * const balance = calculateBalance(credits);
 * ```
 */
export async function studentLoader(): Promise<StudentLoaderData> {
  const currentUserId = localStorage.getItem('kitesurf_auth_userId');

  if (!currentUserId) {
    throw new Error('Not authenticated');
  }

  const userId = parseInt(currentUserId, 10);

  if (isNaN(userId)) {
    throw new Error('Invalid user ID');
  }

  const [credits, reservations] = await Promise.all([
    db.courseCredits.where('studentId').equals(userId).toArray(),
    db.reservations.where('studentId').equals(userId).toArray(),
  ]);

  return { credits, reservations };
}
