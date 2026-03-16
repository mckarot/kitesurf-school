// src/db/migrations/v13.ts
// Migration v13 : Remplacement du système de crédits par un système monétaire en euros
// + Module de gestion des tarifs pour les cours

import type { KiteSurfDB } from '../db';

/**
 * Configure la migration V13 de la base de données
 *
 * Changements :
 * - Ajout de la table userWallets (solde en euros pour chaque utilisateur)
 * - Ajout de la table coursePricing (gestion dynamique des tarifs)
 * - Marquage des anciens crédits comme 'legacy'
 *
 * userWallets :
 * - Stocke le solde en euros pour chaque utilisateur
 * - Permet les transactions financières (ajout/retrait)
 * - Remplace le système de crédits (1 crédit = 1 séance)
 *
 * coursePricing :
 * - Géré par l'admin via /admin/pricing
 * - Permet de modifier les tarifs affichés sur /courses
 * - Supporte différents types de cours (collectif, particulier, duo, packs)
 *
 * Index :
 * - userWallets : ++id, userId (unique), balance
 * - coursePricing : ++id, courseType, [courseType+isActive], isActive, createdAt
 */
export function configureV13Migration(db: KiteSurfDB): void {
  db.version(13).stores({
    // Tables existantes (inchangées)
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
    notifications: '++id, userId, [userId+read], type, createdAt',
    deletionRequests: '++id, userId, status, requestedAt, confirmationToken',
    userConsents: '++id, userId, consentType, status, [userId+consentType]',
    schoolSchedule: '++id, dayOfWeek, isActive, createdAt',
    instructorAvailability: '++id, [instructorId+date+scheduleId], instructorId, date, isAvailable, createdAt',
    // NOUVELLES TABLES
    userWallets: '++id, userId, balance, createdAt',
    coursePricing: '++id, courseType, [courseType+isActive], isActive, createdAt',
  }).upgrade(async (tx) => {
    // ── 1. Initialiser les wallets pour tous les utilisateurs existants ──────────
    const users = await tx.table('users').toArray();
    const walletsToCreate = users.map((user) => ({
      userId: user.id,
      balance: 0, // Solde initial à 0€
      createdAt: Date.now(),
    }));

    await tx.table('userWallets').bulkAdd(walletsToCreate);

    console.log(`[v13] Initialized ${walletsToCreate.length} user wallets with 0€ balance`);

    // ── 2. Marquer les anciens crédits comme 'legacy' ───────────────────────────
    // On conserve les crédits existants pour l'historique, mais on les marque comme legacy
    await tx
      .table('courseCredits')
      .toCollection()
      .modify((credit) => {
        // @ts-ignore - isLegacy n'existe pas encore dans le type CourseCredit
        credit.isLegacy = 1;
      });

    const creditsCount = await tx.table('courseCredits').count();
    console.log(`[v13] Marked ${creditsCount} existing credits as legacy`);

    // ── 3. Initialiser les tarifs par défaut ────────────────────────────────────
    // Ces tarifs pourront être modifiés par l'admin via /admin/pricing
    const defaultPricing = [
      {
        courseType: 'collectif' as const,
        price: 70,
        duration: '2h30',
        maxStudents: 6,
        description: 'Cours collectif en groupe (max 6 personnes)',
        isActive: 1 as 0 | 1,
        createdAt: Date.now(),
      },
      {
        courseType: 'particulier' as const,
        price: 120,
        duration: '2h30',
        maxStudents: 1,
        description: 'Cours particulier avec moniteur dédié',
        isActive: 1 as 0 | 1,
        createdAt: Date.now(),
      },
      {
        courseType: 'duo' as const,
        price: 95,
        duration: '2h30',
        maxStudents: 2,
        description: 'Cours en duo (2 personnes maximum)',
        isActive: 1 as 0 | 1,
        createdAt: Date.now(),
      },
      {
        courseType: 'pack_3' as const,
        price: 180,
        sessions: 3,
        duration: '2h30',
        maxStudents: 6,
        description: 'Pack de 3 séances (économisez 30€)',
        isActive: 1 as 0 | 1,
        createdAt: Date.now(),
      },
      {
        courseType: 'pack_6' as const,
        price: 330,
        sessions: 6,
        duration: '2h30',
        maxStudents: 6,
        description: 'Pack de 6 séances (économisez 90€)',
        isActive: 1 as 0 | 1,
        createdAt: Date.now(),
      },
      {
        courseType: 'pack_10' as const,
        price: 500,
        sessions: 10,
        duration: '2h30',
        maxStudents: 6,
        description: 'Pack de 10 séances (économisez 200€)',
        isActive: 1 as 0 | 1,
        createdAt: Date.now(),
      },
    ];

    await tx.table('coursePricing').bulkAdd(defaultPricing);

    console.log(`[v13] Initialized ${defaultPricing.length} default course pricing options`);
    console.log('[v13] Migration completed: euros system + pricing management enabled');
  });
}

/**
 * Helper pour accéder à la table userWallets avec typage fort
 * @param db - Instance de KiteSurfDB
 * @returns Table typée UserWallet
 */
export function getUserWalletTable(db: KiteSurfDB) {
  return db.table('userWallets');
}

/**
 * Helper pour accéder à la table coursePricing avec typage fort
 * @param db - Instance de KiteSurfDB
 * @returns Table typée CoursePricing
 */
export function getCoursePricingTable(db: KiteSurfDB) {
  return db.table('coursePricing');
}
