// src/db/migrations/v8.ts
// Migration v8 : Conversion du système de crédits de "heures" vers "séances"
// 1 séance = 2h30 de cours

import type { KiteSurfDB } from '../db';

/**
 * Configure la migration V8 de la base de données
 *
 * Changements :
 * - Renommage des champs dans courseCredits : hours → sessions, usedHours → usedSessions
 * - Les données existantes sont converties : sessions = hours / 2.5 (arrondi à l'entier inférieur)
 *
 * Note : Cette migration convertit les heures en séances en divisant par 2.5
 * Exemple : 10 heures → 4 séances (10 / 2.5 = 4)
 *
 * RGPD compliance :
 * - Les données sont transformées mais conservées
 * - Aucune perte de données, seulement une unité de mesure différente
 */
export function configureV8Migration(db: KiteSurfDB): void {
  db.version(8).stores({
    // Tables existantes (inchangées)
    users: '++id, email, role, isActive, createdAt',
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
    // Migration : Convertir hours → sessions et usedHours → usedSessions
    // 1 séance = 2.5 heures, donc sessions = hours / 2.5 (arrondi à l'entier inférieur)
    const courseCreditsTable = tx.table('courseCredits');

    await courseCreditsTable.toCollection().modify((credit: {
      hours?: number;
      usedHours?: number;
      sessions?: number;
      usedSessions?: number;
    }) => {
      // Convertir hours en sessions (1 séance = 2.5h)
      if (credit.hours !== undefined) {
        // Arrondir à l'entier inférieur pour éviter de donner des séances partielles
        credit.sessions = Math.floor(credit.hours / 2.5);
        delete credit.hours;
      }

      // Convertir usedHours en usedSessions
      if (credit.usedHours !== undefined) {
        // Utiliser le même ratio pour les heures utilisées
        credit.usedSessions = Math.floor(credit.usedHours / 2.5);
        delete credit.usedHours;
      }
    });

    console.log('Database migrated to version 8: hours converted to sessions (1 session = 2.5h)');
  });
}

/**
 * Helper pour accéder à la table courseCredits avec typage fort
 * @param db - Instance de KiteSurfDB
 * @returns Table typée CourseCredit
 */
export function getCourseCreditsTable(db: KiteSurfDB) {
  return db.table('courseCredits');
}
