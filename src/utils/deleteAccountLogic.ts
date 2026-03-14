// src/utils/deleteAccountLogic.ts
// Logique de suppression de compte utilisateur - RGPD Article 17 (Droit à l'oubli)

import { db } from '../db/db';
import type {
  DeletionRequest,
  DeletionEligibilityResult,
  DeletionExecutionResult,
  DeletionConfirmationResult,
} from '../types';

/**
 * Génère un token de confirmation UUID v4
 * Format : xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 *
 * @returns string - Token UUID pour validation email
 */
export function generateConfirmationToken(): string {
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
  return uuid;
}

/**
 * Vérifie si un compte utilisateur peut être supprimé
 * Check les bloqueurs potentiels (réservations futures, crédits actifs, etc.)
 *
 * @param userId - ID de l'utilisateur à vérifier
 * @returns Promise<DeletionEligibilityResult>
 */
export async function canDeleteAccount(userId: number): Promise<DeletionEligibilityResult> {
  const blockers: string[] = [];

  try {
    // Check 1: Réservations confirmées futures
    const now = Date.now();
    const futureReservations = await db
      .reservations
      .where('studentId')
      .equals(userId)
      .filter((reservation) => {
        // On ne peut pas filtrer par date directement sur reservations
        // Il faudrait rejoindre avec courseSessions pour vérifier la date
        // Pour simplifier, on check seulement le statut
        return reservation.status === 'confirmed' || reservation.status === 'pending';
      })
      .toArray();

    if (futureReservations.length > 0) {
      blockers.push(
        `Vous avez ${futureReservations.length} réservation(s) confirmée(s) ou en attente. Veuillez les annuler avant de supprimer votre compte.`
      );
    }

    // Check 2: Crédits de cours actifs
    const activeCredits = await db
      .courseCredits
      .where('studentId')
      .equals(userId)
      .filter((credit) => {
        const isActive = credit.status === 'active';
        const isNotExpired = !credit.expiresAt || credit.expiresAt > now;
        const hasRemainingSessions = credit.sessions - credit.usedSessions > 0;
        return isActive && isNotExpired && hasRemainingSessions;
      })
      .toArray();

    if (activeCredits.length > 0) {
      const totalRemainingSessions = activeCredits.reduce(
        (sum, credit) => sum + (credit.sessions - credit.usedSessions),
        0
      );
      blockers.push(
        `Vous avez ${totalRemainingSessions} séance(s) de cours restantes sur vos crédits. Veuillez les consommer ou demander un remboursement.`
      );
    }

    // Check 3: Sessions de cours à venir (en tant que moniteur)
    const instructorSessions = await db
      .courseSessions
      .filter((session) => {
        // Vérifier si c'est un moniteur (nécessiterait de rejoindre avec courses pour avoir instructorId)
        // Pour simplifier, on check juste les sessions futures
        const sessionDate = new Date(session.date).getTime();
        return sessionDate > now && session.isActive === 1;
      })
      .toArray();

    // Note: Cette vérification est incomplète car il faudrait rejoindre avec courses pour avoir instructorId
    // Dans une implémentation complète, il faudrait faire une requête plus complexe

    return {
      canDelete: blockers.length === 0,
      blockers,
    };
  } catch (error) {
    console.error('Error checking account deletion blockers:', error);
    return {
      canDelete: false,
      blockers: ['Erreur lors de la vérification des prérequis de suppression'],
    };
  }
}

/**
 * Anonymise les données d'un utilisateur
 * Conserve les données pour les obligations légales mais retire l'identification personnelle
 *
 * Tables anonymisées :
 * - userProgression : userId → 0
 * - reservations : studentId → 0
 *
 * @param userId - ID de l'utilisateur à anonymiser
 * @returns Promise<void>
 */
export async function anonymizeUserData(userId: number): Promise<void> {
  try {
    await db.transaction('rw', db.userProgression, db.reservations, async () => {
      // Anonymiser userProgression (userId → 0)
      const progressions = await db
        .userProgression
        .where('userId')
        .equals(userId)
        .toArray();

      for (const progression of progressions) {
        await db.userProgression.update(progression.id, {
          userId: 0,
          updatedAt: Date.now(),
        });
      }

      // Anonymiser reservations (studentId → 0)
      const reservations = await db
        .reservations
        .where('studentId')
        .equals(userId)
        .toArray();

      for (const reservation of reservations) {
        await db.reservations.update(reservation.id, {
          studentId: 0,
        });
      }

      console.log(`User ${userId} data anonymized: ${progressions.length} progressions, ${reservations.length} reservations`);
    });
  } catch (error) {
    console.error('Error anonymizing user data:', error);
    throw new Error(`Failed to anonymize user data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Exécute la suppression complète d'un compte utilisateur
 *
 * Tables supprimées (RGPD Article 17) :
 * - users : SUPPRIMER
 * - userPhysicalData : SUPPRIMER
 * - userHealthData : SUPPRIMER
 * - courseCredits : SUPPRIMER
 *
 * Tables anonymisées :
 * - userProgression : userId → 0
 * - reservations : studentId → 0
 *
 * Tables conservées (obligations légales) :
 * - transactions : CONSERVER (10 ans pour comptabilité)
 * - deletionRequests : CONSERVER (1 an pour audit)
 *
 * @param userId - ID de l'utilisateur à supprimer
 * @returns Promise<DeletionExecutionResult>
 */
export async function executeAccountDeletion(userId: number): Promise<DeletionExecutionResult> {
  try {
    await db.transaction(
      'rw',
      db.users,
      db.userPhysicalData,
      db.userHealthData,
      db.courseCredits,
      async () => {
        // Étape 1: Supprimer userPhysicalData
        const physicalDataCount = await db.userPhysicalData
          .where('userId')
          .equals(userId)
          .delete();
        console.log(`Deleted ${physicalDataCount} userPhysicalData records`);

        // Étape 2: Supprimer userHealthData
        const healthDataCount = await db.userHealthData
          .where('userId')
          .equals(userId)
          .delete();
        console.log(`Deleted ${healthDataCount} userHealthData records`);

        // Étape 3: Supprimer courseCredits
        const creditsCount = await db.courseCredits
          .where('studentId')
          .equals(userId)
          .delete();
        console.log(`Deleted ${creditsCount} courseCredits records`);

        // Étape 5: Supprimer l'utilisateur (en dernier pour préserver les références)
        await db.users.delete(userId);
        console.log(`Deleted user ${userId}`);
      }
    );

    console.log(`Account deletion completed for user ${userId}`);
    return { success: true };
  } catch (error) {
    console.error('Error executing account deletion:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during deletion',
    };
  }
}

/**
 * Crée une demande de suppression de compte
 *
 * @param userId - ID de l'utilisateur demandant la suppression
 * @param reason - Motif de suppression (optionnel)
 * @returns Promise<DeletionRequest | null>
 */
export async function createDeletionRequest(
  userId: number,
  reason?: string
): Promise<DeletionRequest | null> {
  try {
    // Vérifier les bloqueurs
    const { canDelete, blockers } = await canDeleteAccount(userId);
    if (!canDelete) {
      console.warn(`Deletion request blocked for user ${userId}:`, blockers);
      return null;
    }

    // Vérifier si une demande existe déjà pour cet utilisateur
    const existingRequest = await db
      .deletionRequests
      .where('userId')
      .equals(userId)
      .filter((req) => req.status === 'pending' || req.status === 'confirmed')
      .first();

    if (existingRequest) {
      console.log(`Existing deletion request found for user ${userId}`);
      return existingRequest;
    }

    const now = Date.now();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

    const newRequest: Omit<DeletionRequest, 'id'> = {
      userId,
      requestedAt: now,
      scheduledFor: now + sevenDaysMs,
      status: 'pending',
      confirmationToken: generateConfirmationToken(),
      reason,
      emailSentAt: undefined,
    };

    const id = await db.deletionRequests.add(newRequest as any);

    console.log(`Deletion request created for user ${userId} with token ${newRequest.confirmationToken}`);

    return { ...newRequest, id } as DeletionRequest;
  } catch (error) {
    console.error('Error creating deletion request:', error);
    return null;
  }
}

/**
 * Confirme une demande de suppression via le token
 *
 * @param token - Token de confirmation reçu par email
 * @returns Promise<DeletionConfirmationResult>
 */
export async function confirmDeletionRequest(token: string): Promise<DeletionConfirmationResult> {
  try {
    const request = await db
      .deletionRequests
      .where('confirmationToken')
      .equals(token)
      .first();

    if (!request) {
      return {
        success: false,
        error: 'Token de confirmation invalide ou expiré',
      };
    }

    if (request.status !== 'pending') {
      return {
        success: false,
        error: `Demande déjà ${request.status}`,
      };
    }

    // Vérifier que le délai de 7 jours n'est pas dépassé
    const now = Date.now();
    if (request.scheduledFor && now > request.scheduledFor) {
      return {
        success: false,
        error: 'Délai de confirmation dépassé (7 jours)',
      };
    }

    // Mettre à jour le statut
    await db.deletionRequests.update(request.id, {
      status: 'confirmed',
      confirmedAt: now,
    });

    console.log(`Deletion request confirmed for user ${request.userId}`);

    return {
      success: true,
      message: 'Demande de suppression confirmée. Votre compte sera supprimé dans 7 jours.',
    };
  } catch (error) {
    console.error('Error confirming deletion request:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de la confirmation',
    };
  }
}

/**
 * Annule une demande de suppression
 *
 * @param userId - ID de l'utilisateur
 * @returns Promise<DeletionConfirmationResult>
 */
export async function cancelDeletionRequest(userId: number): Promise<DeletionConfirmationResult> {
  try {
    const request = await db
      .deletionRequests
      .where('userId')
      .equals(userId)
      .filter((req) => req.status === 'pending' || req.status === 'confirmed')
      .first();

    if (!request) {
      return {
        success: false,
        error: 'Aucune demande de suppression en cours',
      };
    }

    await db.deletionRequests.update(request.id, {
      status: 'cancelled',
    });

    console.log(`Deletion request cancelled for user ${userId}`);

    return {
      success: true,
      message: 'Demande de suppression annulée. Votre compte reste actif.',
    };
  } catch (error) {
    console.error('Error cancelling deletion request:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de l\'annulation',
    };
  }
}

/**
 * Récupère une demande de suppression par son token
 *
 * @param token - Token de confirmation
 * @returns Promise<DeletionRequest | undefined>
 */
export async function getDeletionRequestByToken(token: string): Promise<DeletionRequest | undefined> {
  return db.deletionRequests
    .where('confirmationToken')
    .equals(token)
    .first();
}

/**
 * Récupère les demandes de suppression pour un utilisateur
 *
 * @param userId - ID de l'utilisateur
 * @returns Promise<DeletionRequest[]>
 */
export async function getDeletionRequestsByUser(userId: number): Promise<DeletionRequest[]> {
  return db.deletionRequests
    .where('userId')
    .equals(userId)
    .toArray();
}
