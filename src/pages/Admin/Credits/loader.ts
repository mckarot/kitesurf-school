// src/pages/Admin/Credits/loader.ts

import { db } from '../../../db/db';
import type { User, CourseCredit } from '../../../types';

export interface AdminCreditsLoaderData {
  students: User[];
  credits: CourseCredit[];
  instructors: User[];
}

/**
 * Loader React Router pour la page Admin Credits.
 * 
 * Charge en parallèle:
 * - Tous les utilisateurs avec role='student'
 * - Tous les crédits de cours
 * - Tous les utilisateurs avec role='instructor'
 * 
 * Ces données sont utilisées pour:
 * - Afficher le tableau des élèves avec soldes
 * - Peupler le dropdown de sélection d'élève dans le modal
 * - Peupler le dropdown de sélection de moniteur (optionnel)
 * 
 * @returns Promise<AdminCreditsLoaderData> - Données pour la page Admin Credits
 * 
 * @throws {Error} - En cas d'erreur Dexie (propagé vers ErrorBoundary)
 * 
 * @example
 * ```typescript
 * // Dans CreditsPage/index.tsx
 * const { students, credits, instructors } = useLoaderData() as AdminCreditsLoaderData;
 * ```
 */
export async function creditsLoader(): Promise<AdminCreditsLoaderData> {
  const [students, credits, instructors] = await Promise.all([
    db.users.where('role').equals('student').toArray(),
    db.courseCredits.toArray(),
    db.users.where('role').equals('instructor').toArray(),
  ]);

  return { students, credits, instructors };
}
