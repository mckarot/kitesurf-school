// src/db/migrations/v16.ts
// Migration v16: Add courseType field to reservations table

import type { KiteSurfDB } from '../db';

/**
 * Configure la migration v16
 * 
 * Changements:
 * - Ajout du champ courseType sur la table reservations
 * - Permet de filtrer les réservations par type de cours (collectif, particulier, duo)
 * - Nécessaire pour la synchronisation avec CourseCards
 */
export function configureV16Migration(db: KiteSurfDB) {
  db.version(16).stores({
    users: '++id, email, role, isActive, createdAt',
    courses: '++id, instructorId, level, isActive, createdAt',
    reservations: '++id, studentId, courseId, courseType, status, createdAt',
    courseSessions: '++id, courseId, isActive, createdAt, [courseId+date+startTime]',
    timeSlots: '++id, instructorId, date, isAvailable, createdAt',
    userPhysicalData: '++id, userId',
    userHealthData: '++id, userId',
    userProgression: '++id, userId',
    transactions: '++id, userId, reservationId, status, createdAt',
    courseCredits: '++id, studentId, [studentId+status], status, createdAt',
    notifications: '++id, userId, [userId+read], type, createdAt',
    deletionRequests: '++id, userId, status, requestedAt, confirmationToken',
    userConsents: '++id, userId, consentType, status, [userId+consentType]',
    schoolSchedule: '++id, dayOfWeek, isActive, createdAt',
    instructorAvailability: '++id, [instructorId+date+scheduleId], instructorId, date, isAvailable, createdAt',
    userWallets: '++id, userId, balance, createdAt',
    coursePricing: '++id, courseType, [courseType+isActive], isActive, createdAt',
    sessionExceptions: '++id, sessionId, [sessionId+type], date, createdAt',
    courseCards: '++id, courseType, [courseType+isActive], isActive, createdAt',
    packCards: '++id, packType, [packType+isActive], isActive, createdAt',
  }).upgrade(async (tx) => {
    console.log('Database migrated to version 16: courseType field added to reservations');
    
    // Note: courseType is optional and will be undefined for existing reservations
    // New reservations will have courseType set automatically
    const reservationsTable = tx.table('reservations');
    const count = await reservationsTable.count();
    console.log(`[v16 Migration] Existing reservations: ${count} (courseType will be undefined for these)`);
  });
}
