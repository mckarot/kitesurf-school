// src/utils/createReservationWithCredit.ts

import { db } from '../db/db';
import type { CourseCredit, CreateReservationWithCreditResult, StudentBalance } from '../types';
import { calculateBalance } from './calculateBalance';
import { notifyReservationPending } from './notifications';

/**
 * Crée une réservation en consommant des séances de crédit.
 *
 * Algorithme FIFO (First In, First Out):
 * 1. Récupère tous les crédits actifs de l'étudiant, triés par date de création
 * 2. Vérifie que le solde total est suffisant
 * 3. Consomme les séances en commençant par le crédit le plus ancien
 * 4. Crée la réservation dans la même transaction
 *
 * VALIDATIONS:
 * - Vérifie que le cours n'est pas complet (maxStudents)
 * - Vérifie que l'élève n'a pas déjà réservé cette session
 *
 * Business Logic:
 * - 1 réservation = 1 séance consommée
 * - Transaction atomique: si une étape échoue, tout est annulé
 *
 * @param studentId - ID de l'étudiant qui réserve
 * @param courseSessionId - ID de la session de cours (courseSession)
 * @param sessionsToConsume - Nombre de séances à consommer pour cette réservation (par défaut: 1)
 * @returns Promise<CreateReservationWithCreditResult> - Résultat de l'opération
 *
 * @throws {Error} - En cas d'erreur technique (transaction échouée)
 *
 * @example
 * ```typescript
 * const result = await createReservationWithCredit(1, 5, 1);
 * if (result.success) {
 *   console.log('Réservation créée, séances restantes:', result.remainingBalance);
 * } else {
 *   console.error('Erreur:', result.error);
 * }
 * ```
 */
export async function createReservationWithCredit(
  studentId: number,
  courseSessionId: number,
  sessionsToConsume: number = 1
): Promise<CreateReservationWithCreditResult> {
  // Validation des paramètres d'entrée
  if (sessionsToConsume <= 0) {
    return {
      success: false,
      error: 'Le nombre de séances doit être supérieur à 0'
    };
  }

  try {
    // Transaction atomique pour garantir la cohérence des données
    // 'rw' = read-write sur les tables courseCredits, reservations, courseSessions, courses
    return await db.transaction('rw', db.courseCredits, db.reservations, db.courseSessions, db.courses, async () => {
      // Étape 0: Récupérer la session et le cours pour vérifications
      const session = await db.courseSessions.get(courseSessionId);
      const course = await db.courses.get(courseSessionId);

      if (!session || !course) {
        return {
          success: false,
          error: 'Session de cours introuvable'
        };
      }

      // Étape 1: Vérifier si le cours est complet
      const existingReservations = await db.reservations
        .where('[courseId+status]')
        .equals([courseSessionId, 'confirmed'])
        .toArray();

      // Compter aussi les pending pour éviter les doubles réservations
      const allReservations = await db.reservations
        .where('courseId')
        .equals(courseSessionId)
        .toArray();

      if (allReservations.length >= course.maxStudents) {
        return {
          success: false,
          error: `Cours complet ! Maximum ${course.maxStudents} élèves atteints.`
        };
      }

      // Étape 2: Vérifier si l'élève a déjà réservé cette session
      const existingReservation = await db.reservations
        .where('[studentId+courseId]')
        .equals([studentId, courseSessionId])
        .first();

      if (existingReservation) {
        const statusText = existingReservation.status === 'pending' 
          ? 'en attente de confirmation'
          : existingReservation.status === 'confirmed'
          ? 'déjà confirmée'
          : existingReservation.status;
        
        return {
          success: false,
          error: `Vous avez déjà une réservation ${statusText} pour ce cours.`
        };
      }

      // Étape 3: Récupérer tous les crédits actifs de l'étudiant
      // Utilisation de l'index 'studentId' pour une requête optimisée O(log n)
      // Tri par createdAt pour appliquer la logique FIFO (plus ancien en premier)
      const activeCredits = await db.courseCredits
        .where('[studentId+status]')
        .equals([studentId, 'active'])
        .sortBy('createdAt');

      // Étape 4: Calculer le solde actuel
      const currentBalance = calculateBalance(activeCredits);

      // Étape 5: Vérifier si le solde est suffisant
      if (currentBalance.remainingSessions < sessionsToConsume) {
        // Annulation automatique de la transaction par Dexie
        // Retourner un résultat d'erreur sans lever d'exception
        return {
          success: false,
          error: `Solde insuffisant. Vous avez ${currentBalance.remainingSessions} séance(s) disponible(s), ${sessionsToConsume} séance(s) requise(s).`
        };
      }

      // Étape 6: Consommer les séances en FIFO (First In, First Out)
      // Les crédits sont déjà triés par createdAt (du plus ancien au plus récent)
      let sessionsRemainingToConsume = sessionsToConsume;

      for (const credit of activeCredits) {
        if (sessionsRemainingToConsume <= 0) {
          break; // Toutes les séances ont été consommées
        }

        // Calculer combien de séances prendre de ce crédit
        const availableInThisCredit = credit.sessions - credit.usedSessions;
        const sessionsToTakeFromThisCredit = Math.min(
          availableInThisCredit,
          sessionsRemainingToConsume
        );

        // Mettre à jour le crédit avec les séances consommées
        await db.courseCredits.update(credit.id, {
          usedSessions: credit.usedSessions + sessionsToTakeFromThisCredit,
          updatedAt: Date.now()
        });

        // Mettre à jour le compteur de séances restantes à consommer
        sessionsRemainingToConsume -= sessionsToTakeFromThisCredit;
      }

      // Étape 7: Créer la réservation avec statut 'pending'
      // L'admin devra confirmer et assigner un moniteur
      const reservationId = await db.reservations.add({
        studentId,
        courseId: courseSessionId,
        courseSessionId: courseSessionId,
        instructorId: null, // Sera assigné par l'admin
        status: 'pending', // En attente de confirmation admin
        sessionsConsumed: sessionsToConsume,
        createdAt: Date.now(),
      } as any);

      // Étape 8: Recalculer le nouveau solde après consommation
      // Relecture des crédits mis à jour dans la transaction
      const updatedCredits = await db.courseCredits
        .where('[studentId+status]')
        .equals([studentId, 'active'])
        .sortBy('createdAt');

      const newBalance = calculateBalance(updatedCredits);

      // Étape 9: Créer une notification pour l'élève
      // (en dehors de la transaction car les notifications ne sont pas critiques)
      try {
        if (session && course) {
          await notifyReservationPending(
            studentId,
            reservationId,
            course.title,
            new Date(session.date).toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })
          );
        }
      } catch (notifError) {
        console.error('[createReservationWithCredit] Notification error:', notifError);
        // On ne bloque pas le succès de la réservation si la notification échoue
      }

      // Succès: retour du résultat avec le nouveau solde
      return {
        success: true,
        reservationId,
        remainingBalance: newBalance
      };
    });
  } catch (error) {
    // Gestion des erreurs techniques (transaction échouée, DB indisponible, etc.)
    console.error('[createReservationWithCredit] Transaction error:', error);

    return {
      success: false,
      error: error instanceof Error
        ? `Erreur technique: ${error.message}`
        : 'Une erreur inattendue est survenue lors de la réservation'
    };
  }
}

/**
 * Vérifie si une réservation peut être créée avec les crédits disponibles.
 * Version "dry-run" sans modifier les données.
 *
 * @param studentId - ID de l'étudiant
 * @param sessionsToConsume - Nombre de séances nécessaires (par défaut: 1)
 * @returns Promise<{ canReserve: boolean; balance: StudentBalance; error?: string }>
 */
export async function canReserveWithCredit(
  studentId: number,
  sessionsToConsume: number = 1
): Promise<{ canReserve: boolean; balance: StudentBalance; error?: string }> {
  try {
    // Lecture seule: pas besoin de transaction
    const activeCredits = await db.courseCredits
      .where('[studentId+status]')
      .equals([studentId, 'active'])
      .sortBy('createdAt');

    const balance = calculateBalance(activeCredits);

    if (balance.remainingSessions < sessionsToConsume) {
      return {
        canReserve: false,
        balance,
        error: `Solde insuffisant. Vous avez ${balance.remainingSessions} séance(s) disponible(s), ${sessionsToConsume} séance(s) requise(s).`
      };
    }

    return {
      canReserve: true,
      balance
    };
  } catch (error) {
    console.error('[canReserveWithCredit] Error:', error);
    return {
      canReserve: false,
      balance: { totalSessions: 0, usedSessions: 0, remainingSessions: 0 },
      error: error instanceof Error ? error.message : 'Erreur lors de la vérification du solde'
    };
  }
}
