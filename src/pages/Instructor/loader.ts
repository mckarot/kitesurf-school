// src/pages/Instructor/loader.ts

import { db } from '../../db/db';
import type { CourseCredit, TimeSlot, User, Reservation, Course } from '../../types';

export interface InstructorLoaderData {
  credits: CourseCredit[];
  timeSlots: TimeSlot[];
  students: User[];
  reservations: Reservation[];
  courses: Course[];
  instructorId: number;
}

/**
 * Loader React Router pour la page Instructor.
 *
 * Charge en parallèle:
 * - Tous les crédits de cours (filtrage en mémoire pour les élèves du moniteur)
 * - Tous les créneaux horaires du moniteur connecté
 * - Tous les utilisateurs avec role='student'
 * - Toutes les réservations (pour afficher les noms dans l'emploi du temps)
 * - Tous les cours (pour filtrer ceux du moniteur)
 *
 * Ces données sont utilisées pour:
 * - Afficher la liste des élèves assignés avec leurs soldes
 * - Afficher l'emploi du temps avec les noms des élèves
 * - Calculer le nombre de séances à dispenser
 *
 * @returns Promise<InstructorLoaderData> - Données pour la page Instructor
 *
 * @throws {Error} - Si l'utilisateur n'est pas authentifié
 *
 * @example
 * ```typescript
 * // Dans Instructor/index.tsx
 * const { credits, timeSlots, students, reservations, courses } = useLoaderData() as InstructorLoaderData;
 * ```
 */
export async function instructorLoader(): Promise<InstructorLoaderData> {
  const currentUserId = localStorage.getItem('kitesurf_auth_userId');

  if (!currentUserId) {
    throw new Error('Not authenticated');
  }

  const instructorId = parseInt(currentUserId, 10);

  if (isNaN(instructorId)) {
    throw new Error('Invalid user ID');
  }

  const [credits, timeSlots, students, reservations, courses] = await Promise.all([
    db.courseCredits.toArray(), // Tous les crédits (filtrage en mémoire)
    db.timeSlots.where('instructorId').equals(instructorId).toArray(),
    db.users.where('role').equals('student').toArray(),
    db.reservations.toArray(),
    db.courses.toArray(),
  ]);

  return { credits, timeSlots, students, reservations, courses, instructorId };
}
