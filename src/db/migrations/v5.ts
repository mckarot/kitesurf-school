// src/db/migrations/v5.ts
// Migration v5 : Ajout de la table deletionRequests pour le RGPD Article 17 (Droit à l'oubli)

import type { Table } from 'dexie';
import type { KiteSurfDB } from '../db';
import type { DeletionRequest } from '../../types';

/**
 * Configuration de la migration v5
 * 
 * Cette migration ajoute la table deletionRequests sans modifier les tables existantes.
 * Aucun .upgrade() avec migration de données n'est nécessaire car :
 * - La table est nouvelle (pas de données existantes à migrer)
 * - Les autres tables ne sont pas modifiées
 * 
 * Index Dexie pour deletionRequests :
 * - ++id : Clé primaire auto-increment
 * - userId : Optimise findRequestsByUserId(userId) - O(log n)
 * - status : Optimise cleanup queries filtering by status - O(log n)
 * - requestedAt : Optimise time-based queries for cleanup scheduling - O(log n)
 * - confirmationToken : Index unique pour email confirmation validation - O(log n)
 */
export function configureV5Migration(db: KiteSurfDB): void {
  db.version(5).stores({
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
    // Nouvelle table : deletionRequests
    deletionRequests: '++id, userId, status, requestedAt, confirmationToken',
  }).upgrade(async (tx) => {
    // Migration v5 : Initialisation de la table deletionRequests
    // Aucun données à migrer car c'est une nouvelle table
    // Ce .upgrade() est présent pour respecter la règle : toute version doit avoir un upgrade
    console.log('Database migrated to version 5: deletionRequests table added for RGPD Article 17');
    
    // Typage explicite de la nouvelle table pour TypeScript
    const deletionRequestsTable = tx.table('deletionRequests') as Table<DeletionRequest, number>;
    
    // Vérification que la table est bien créée (log de débogage)
    const count = await deletionRequestsTable.count();
    console.log(`deletionRequests table initialized with ${count} records`);
  });
}

/**
 * Helper pour accéder à la table deletionRequests avec typage fort
 * @param db - Instance de KiteSurfDB
 * @returns Table typée DeletionRequest
 */
export function getDeletionRequestsTable(db: KiteSurfDB): Table<DeletionRequest, number> {
  return db.table('deletionRequests') as Table<DeletionRequest, number>;
}
