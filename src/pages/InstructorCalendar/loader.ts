// src/pages/InstructorCalendar/loader.ts

import { db } from '../../db/db';
import type { TimeSlot, Course, Reservation } from '../../types';

export interface InstructorCalendarLoaderData {
  timeSlots: TimeSlot[];
  courses: Course[];
  reservations: Reservation[];
}

/**
 * Loader pour la page calendrier instructeur
 * Charge les créneaux, cours et réservations du moniteur connecté
 */
export async function instructorCalendarLoader(
  instructorId: number
): Promise<InstructorCalendarLoaderData> {
  try {
    const [timeSlots, courses, reservations] = await Promise.all([
      db.timeSlots.where('instructorId').equals(instructorId).sortBy('date'),
      db.courses.where('instructorId').equals(instructorId).toArray(),
      db.reservations.toArray(),
    ]);

    return { timeSlots, courses, reservations };
  } catch (err) {
    console.error('Failed to load instructor calendar data:', err);
    return { timeSlots: [], courses: [], reservations: [] };
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
