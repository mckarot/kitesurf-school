// src/pages/Admin/SessionExceptions/loader.ts
// Loader pour la page de gestion des exceptions de sessions

import { db } from '../../../db/db';
import type { SessionException, CourseSession, Course } from '../../../types';

export interface SessionExceptionsLoaderData {
  exceptions: SessionException[];
  courseSessions: CourseSession[];
  courses: Course[];
}

/**
 * Loader React Router pour la page SessionExceptions
 * 
 * Charge :
 * - Toutes les exceptions de sessions
 * - Toutes les sessions de cours (pour affichage dans le formulaire)
 * - Tous les cours (pour filtrer par cours)
 */
export async function sessionExceptionsLoader(): Promise<SessionExceptionsLoaderData> {
  try {
    const [exceptions, courseSessions, courses] = await Promise.all([
      db.sessionExceptions.toArray(),
      db.courseSessions.toArray(),
      db.courses.toArray(),
    ]);

    return { exceptions, courseSessions, courses };
  } catch (err) {
    console.error('Failed to load session exceptions data:', err);
    return { exceptions: [], courseSessions: [], courses: [] };
  }
}
