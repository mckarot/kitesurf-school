// src/pages/InstructorCalendar/loader.ts

import { db } from '../../db/db';
import type { Course, Reservation, CourseSession } from '../../types';

export interface InstructorCalendarLoaderData {
  courses: Course[];
  reservations: Reservation[];
  courseSessions: CourseSession[];
}

/**
 * Loader pour la page calendrier instructeur
 * Charge les cours, réservations et sessions du moniteur connecté
 * Basé sur le nouveau système SchoolSchedule (créneaux automatiques)
 */
export async function instructorCalendarLoader(
  instructorId: number
): Promise<InstructorCalendarLoaderData> {
  try {
    // Get all courses for this instructor
    const courses = await db.courses.where('instructorId').equals(instructorId).toArray();
    const courseIds = courses.map(c => c.id);
    
    // Get course sessions for the next 60 days for this instructor's courses
    const today = new Date();
    const sixtyDaysLater = new Date(today);
    sixtyDaysLater.setDate(today.getDate() + 60);
    
    const [courseSessions, allReservations] = await Promise.all([
      // Get all course sessions for this instructor's courses
      db.courseSessions.where('courseId').anyOf(courseIds).toArray(),
      db.reservations.toArray(),
    ]);

    // Filter reservations to only those for sessions that match this instructor's courses
    // and are not cancelled
    const reservations = allReservations.filter(r => 
      courseSessions.some(cs => cs.id === r.courseId) && r.status !== 'cancelled'
    );

    return { courses, reservations, courseSessions };
  } catch (err) {
    console.error('Failed to load instructor calendar data:', err);
    return { courses: [], reservations: [], courseSessions: [] };
  }
}

/**
 * Helper pour obtenir l'ID du moniteur connecté depuis le localStorage
 */
export function getCurrentInstructorId(): number {
  const stored = localStorage.getItem('kitesurf_auth_userId');
  if (!stored) return 0;
  const parsed = Number(stored);
  return Number.isNaN(parsed) ? 0 : parsed;
}
