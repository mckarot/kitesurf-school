// src/pages/Student/loader.ts

import { db } from '../../db/db';
import type { CourseCredit, Reservation, Course, User } from '../../types';

export interface StudentLoaderData {
  user: User;
  credits: CourseCredit[];
  reservations: Reservation[];
  courses: Course[];
}

/**
 * Loader React Router pour la page Student.
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

  const [user, credits, reservations, courses] = await Promise.all([
    db.users.get(userId),
    db.courseCredits.where('studentId').equals(userId).toArray(),
    db.reservations.where('studentId').equals(userId).toArray(),
    db.courses.toArray(),
  ]);

  if (!user) {
    throw new Error('User not found');
  }

  return { user, credits, reservations, courses };
}
