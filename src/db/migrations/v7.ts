// src/db/migrations/v7.ts
// Migration V7 : Ajout du champ photo pour les utilisateurs (RGPD Article 16)

import type { KiteSurfDB } from '../db';

/**
 * Configure la migration V7 de la base de données
 *
 * Changements :
 * - Ajout du champ `photo` (string, base64) dans la table users
 * - Le champ photo n'est PAS indexé car il n'est jamais utilisé dans des WHERE/FILTER
 * - On accède toujours par userId (déjà indexé par ++id primary key)
 *
 * Index justification :
 * - photo field is NOT indexed because:
 *   - Never used in WHERE/FILTER queries
 *   - Always accessed by userId (already indexed by ++id)
 *   - Indexing base64 strings would be wasteful (large data)
 *
 * RGPD Article 16 compliance :
 * - Right to rectification: users can update their profile photo
 * - Photo stored as base64 string in IndexedDB
 * - Max size: 500KB to avoid QuotaExceededError
 */
export function configureV7Migration(db: KiteSurfDB): void {
  db.version(7).stores({
    // Users table: photo field added but NOT indexed
    // Schema only lists indexed fields - photo exists but is not listed
    users: '++id, email, role, isActive, createdAt',
    // Other tables unchanged
    courses: '++id, instructorId, level, isActive, createdAt',
    reservations: '++id, studentId, courseId, status, createdAt',
    courseSessions: '++id, courseId, isActive, createdAt',
    timeSlots: '++id, instructorId, date, isAvailable, createdAt',
    userPhysicalData: '++id, userId',
    userHealthData: '++id, userId',
    userProgression: '++id, userId',
    transactions: '++id, userId, reservationId, status, createdAt',
    courseCredits: '++id, studentId, [studentId+status], status, createdAt',
    deletionRequests: '++id, userId, status, requestedAt, confirmationToken',
    userConsents: '++id, userId, consentType, status, [userId+consentType]',
  }).upgrade(async (tx) => {
    // Migration: Initialize photo field to empty string for all existing users
    // This ensures the field exists for all users before any profile update
    //
    // Why empty string ('') instead of undefined?
    // - Consistency: all users have the same field type
    // - UI simplicity: no need to check for undefined
    // - Dexie stores undefined fields inconsistently across browsers
    //
    // Performance note: Using toCollection().modify() is efficient
    // because it operates within the transaction and uses the primary key index
    const usersTable = tx.table('users');

    await usersTable.toCollection().modify((user: { photo?: string }) => {
      // Initialize photo to empty string for users without a photo
      // This is safe because:
      // - If photo is undefined, we set it to ''
      // - If photo already exists (edge case), we don't overwrite it
      if (user.photo === undefined) {
        user.photo = '';
      }
    });

    console.log('Database migrated to version 7: photo field added to users table');
  });
}
