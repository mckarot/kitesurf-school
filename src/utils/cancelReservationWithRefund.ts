// src/utils/cancelReservationWithRefund.ts
// Annule une réservation et recrédite les séances à l'élève

import { db } from '../db/db';
import { notifyReservationCancelled } from './notifications';

interface CancelResult {
  success: boolean;
  error?: string;
  reservation?: any;
  sessionsConsumed?: number;
}

/**
 * Annule une réservation et recrédite les séances consommées
 *
 * @param reservationId - ID de la réservation à annuler
 * @returns Promise<{ success: boolean; error?: string }>
 */
export async function cancelReservationWithRefund(
  reservationId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    // Étape 1-3: Transaction pour annulation + remboursement
    const result: CancelResult = await db.transaction('rw', db.reservations, db.courseCredits, async () => {
      // Étape 1: Récupérer la réservation
      const reservation = await db.reservations.get(reservationId);

      if (!reservation) {
        return {
          success: false,
          error: 'Réservation introuvable',
          reservation: null,
          sessionsConsumed: 0
        };
      }

      // Déjà annulée ?
      if (reservation.status === 'cancelled') {
        return {
          success: false,
          error: 'Cette réservation est déjà annulée',
          reservation: null,
          sessionsConsumed: 0
        };
      }

      const sessionsConsumed = reservation.sessionsConsumed || 1;

      // Étape 2: Changer le statut
      await db.reservations.update(reservationId, {
        status: 'cancelled' as const,
      });

      console.log('[cancelReservationWithRefund] Réservation annulée:', reservationId);

      // Étape 3: Recréditer les séances (remboursement)
      const activeCredits = await db.courseCredits
        .where('[studentId+status]')
        .equals([reservation.studentId, 'active'])
        .sortBy('createdAt');

      let sessionsRemainingToRefund = sessionsConsumed;

      for (const credit of activeCredits) {
        if (sessionsRemainingToRefund <= 0) break;
        if (credit.usedSessions <= 0) continue;

        const sessionsToRefundFromThisCredit = Math.min(
          credit.usedSessions,
          sessionsRemainingToRefund
        );

        await db.courseCredits.update(credit.id, {
          usedSessions: credit.usedSessions - sessionsToRefundFromThisCredit,
          updatedAt: Date.now()
        });

        sessionsRemainingToRefund -= sessionsToRefundFromThisCredit;

        console.log('[cancelReservationWithRefund] Remboursement:', {
          creditId: credit.id,
          sessionsRefunded: sessionsToRefundFromThisCredit,
        });
      }

      return {
        success: true,
        error: undefined,
        reservation,
        sessionsConsumed
      };
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    // Étape 4: Notification (HORS transaction - évite les erreurs NotFoundError)
    try {
      const student = await db.users.get(result.reservation!.studentId);
      const course = await db.courses.get(result.reservation!.courseId);
      
      if (student && course) {
        await notifyReservationCancelled(
          result.reservation!.studentId,
          reservationId,
          course.title,
          `${result.sessionsConsumed!} séance${result.sessionsConsumed! > 1 ? 's' : ''} recréditée${result.sessionsConsumed! > 1 ? 's' : ''}`
        );
      }
    } catch (notifError) {
      console.error('[cancelReservationWithRefund] Notification error:', notifError);
    }

    console.log('[cancelReservationWithRefund] Remboursement terminé:', {
      studentId: result.reservation!.studentId,
      sessionsRefunded: result.sessionsConsumed!
    });

    return { success: true };
  } catch (error) {
    console.error('[cancelReservationWithRefund] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de l\'annulation'
    };
  }
}
