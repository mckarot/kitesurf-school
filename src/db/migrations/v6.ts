// src/db/migrations/v6.ts
// Migration v6 : Ajout de la table userConsents pour la gestion des consentements RGPD

import type { Table } from 'dexie';
import type { KiteSurfDB } from '../db';
import type { UserConsent } from '../../types';

/**
 * Configuration de la migration v6
 *
 * Cette migration ajoute la table userConsents pour stocker les consentements RGPD des utilisateurs.
 * Conformément au RGPD, chaque consentement doit tracer :
 * - Le type de consentement (marketing_emails, photos_marketing, analytics_cookies)
 * - Le statut (accepted/refused)
 * - La version des CGU/Politique de confidentialité acceptée
 * - Les timestamps (acceptedAt, updatedAt) pour preuve légale
 * - Optionnellement : IP et User-Agent pour traçabilité renforcée
 *
 * Index Dexie pour userConsents :
 * - ++id : Clé primaire auto-increment
 * - userId : Optimise getUserConsents(userId) - O(log n)
 * - consentType : Optimise les requêtes par type de consentement - O(log n)
 * - status : Optimise les filtres par statut (accepted/refused) - O(log n)
 * - [userId+consentType] : Index composite pour getUserConsent(userId, type) - O(log n)
 *
 * Aucun .upgrade() avec migration de données n'est nécessaire car :
 * - La table est nouvelle (pas de données existantes à migrer)
 * - Les autres tables ne sont pas modifiées
 */
export function configureV6Migration(db: KiteSurfDB): void {
  db.version(6).stores({
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
    // Nouvelle table : userConsents
    userConsents: '++id, userId, consentType, status, [userId+consentType]',
  }).upgrade(async (tx) => {
    // Migration v6 : Initialisation de la table userConsents
    // Aucune donnée à migrer car c'est une nouvelle table
    // Ce .upgrade() est présent pour respecter la règle : toute version doit avoir un upgrade
    console.log('Database migrated to version 6: userConsents table added for RGPD consent management');

    // Typage explicite de la nouvelle table pour TypeScript
    const userConsentsTable = tx.table('userConsents') as Table<UserConsent, number>;

    // Vérification que la table est bien créée (log de débogage)
    const count = await userConsentsTable.count();
    console.log(`userConsents table initialized with ${count} records`);
  });
}

/**
 * Helper pour accéder à la table userConsents avec typage fort
 * @param db - Instance de KiteSurfDB
 * @returns Table typée UserConsent
 */
export function getUserConsentsTable(db: KiteSurfDB): Table<UserConsent, number> {
  return db.table('userConsents') as Table<UserConsent, number>;
}
