// src/pages/ProfileData/loader.ts

import { db } from '../../db/db';
import type {
  User,
  UserPhysicalData,
  UserHealthData,
  UserProgression,
  UserReservationExport,
  UserTransactionExport
} from '../../types';

export interface ProfileDataLoaderReturn {
  user: User;
  physicalData?: UserPhysicalData;
  healthData?: UserHealthData;
  progression?: UserProgression;
  reservations: UserReservationExport[];
  transactions: UserTransactionExport[];
}

/**
 * Récupère TOUTES les données d'un utilisateur pour l'export
 * Optimisé avec des requêtes parallèles
 */
export async function profileDataLoader(userId: number): Promise<ProfileDataLoaderReturn> {
  // Récupération parallèle de toutes les données
  const [
    user,
    physicalData,
    healthData,
    progression,
    reservations,
    transactions
  ] = await Promise.all([
    // 1. User data
    db.users.get(userId),

    // 2. Physical data (index: userId)
    db.userPhysicalData.where('userId').equals(userId).first(),

    // 3. Health data (index: userId)
    db.userHealthData.where('userId').equals(userId).first(),

    // 4. Progression (index: userId)
    db.userProgression.where('userId').equals(userId).first(),

    // 5. Reservations with course details (index: studentId)
    (async () => {
      const userReservations = await db.reservations
        .where('studentId')
        .equals(userId)
        .toArray();

      // Enrichir avec les détails des cours
      const enrichedReservations: UserReservationExport[] = await Promise.all(
        userReservations.map(async (reservation) => {
          const course = await db.courses.get(reservation.courseId);
          const session = await db.courseSessions
            .where('courseId')
            .equals(reservation.courseId)
            .first();

          return {
            id: reservation.id,
            courseId: reservation.courseId,
            courseTitle: course?.title || 'Cours inconnu',
            date: session?.date || '',
            startTime: session?.startTime || '',
            endTime: session?.endTime || '',
            location: session?.location || '',
            status: reservation.status,
            createdAt: reservation.createdAt,
          };
        })
      );

      return enrichedReservations;
    })(),

    // 6. Transactions (index: userId)
    (async () => {
      const userTransactions = await db.transactions
        .where('userId')
        .equals(userId)
        .toArray();

      return userTransactions.map((t) => ({
        id: t.id,
        reservationId: t.reservationId,
        amount: t.amount,
        currency: t.currency ?? 'EUR',
        type: t.type,
        status: t.status,
        createdAt: t.createdAt,
      }));
    })(),
  ]);

  if (!user) {
    throw new Error(`Utilisateur non trouvé: ${userId}`);
  }

  return {
    user,
    physicalData,
    healthData,
    progression,
    reservations,
    transactions,
  };
}

/**
 * Récupère l'ID de l'utilisateur connecté depuis le localStorage
 * (Même méthode que useAuth pour la cohérence)
 */
export function getCurrentUserId(): number {
  const AUTH_STORAGE_KEY = 'kitesurf_auth_userId';
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!stored) {
    throw new Error('Utilisateur non connecté');
  }
  const parsed = Number(stored);
  if (Number.isNaN(parsed)) {
    throw new Error('ID utilisateur invalide');
  }
  return parsed;
}
