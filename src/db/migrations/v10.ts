// src/db/migrations/v10.ts
// Migration v10: Ajout d'index composites sur courseSessions pour la recherche par date et horaire

import type { KiteSurfDB } from '../db';

export function configureV10Migration(db: KiteSurfDB): void {
  db.version(10).stores({
    users: '++id, email, role, isActive, createdAt',
    courses: '++id, instructorId, level, isActive, createdAt',
    reservations: '++id, studentId, courseId, status, createdAt',
    courseSessions: '++id, courseId, isActive, createdAt, [courseId+date+startTime]',
    timeSlots: '++id, instructorId, date, isAvailable, createdAt',
    userPhysicalData: '++id, userId',
    userHealthData: '++id, userId',
    userProgression: '++id, userId',
    transactions: '++id, userId, reservationId, status, createdAt',
    courseCredits: '++id, studentId, [studentId+status], status, createdAt',
    deletionRequests: '++id, userId, status, requestedAt, confirmationToken',
    userConsents: '++id, userId, consentType, status, [userId+consentType]',
    schoolSchedule: '++id, dayOfWeek, isActive, createdAt',
    instructorAvailability: '++id, [instructorId+date+scheduleId], instructorId, date, isAvailable, createdAt',
  }).upgrade(async (tx) => {
    console.log('Database migrated to version 10: Added composite index [courseId+date+startTime] on courseSessions');
    
    // Optionnel: Recréer les sessions pour tous les cours existants
    const courses = await tx.table('courses').toArray();
    console.log(`Found ${courses.length} courses, sessions will be generated on-demand`);
  });
}
