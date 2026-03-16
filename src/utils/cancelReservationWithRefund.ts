// src/utils/cancelReservationWithRefund.ts
// Annule une réservation et recrédite les séances à l'élève

import { db } from '../db/db';
import { notifyReservationCancelled } from './notifications';

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
    return await db.transaction('rw', db.reservations, db.courseCredits, async () => {
      // Étape 1: Récupérer la réservation
      const reservation = await db.reservations.get(reservationId);

      if (!reservation) {
        return {
          success: false,
          error: 'Réservation introuvable'
        };
      }

      // Déjà annulée ?
      if (reservation.status === 'cancelled') {
        return {
          success: false,
          error: 'Cette réservation est déjà annulée'
        };
      }

      const sessionsConsumed = reservation.sessionsConsumed || 1;

      // Étape 2: Changer le statut
      await db.reservations.update(reservationId, {
        status: 'cancelled' as const,
      });

      console.log('[cancelReservationWithRefund] Réservation annulée:', reservationId);

      // Étape 3: Recréditer les séances (remboursement)
      // On utilise le même crédit que celui utilisé lors de la réservation
      // En retrouvant le crédit le plus ancien qui a été utilisé
      const activeCredits = await db.courseCredits
        .where('[studentId+status]')
        .equals([reservation.studentId, 'active'])
        .sortBy('createdAt');

      // Rembourser en décrémenteant usedSessions
      // On rembourse sur le premier crédit qui a des séances utilisées
      let sessionsRemainingToRefund = sessionsConsumed;

      for (const credit of activeCredits) {
        if (sessionsRemainingToRefund <= 0) break;
        if (credit.usedSessions <= 0) continue;

        // Calculer combien de séances rembourser sur ce crédit
        const sessionsToRefundFromThisCredit = Math.min(
          credit.usedSessions,
          sessionsRemainingToRefund
        );

        // Mettre à jour le crédit (remboursement)
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

      // Étape 4: Créer une notification pour l'élève
      try {
        const [student, course, session] = await Promise.all([
          db.users.get(reservation.studentId),
          db.courses.get(reservation.courseId),
          db.courseSessions.get(reservation.courseId)
        ]);

        if (student && course && session) {
          await notifyReservationCancelled(
            reservation.studentId,
            reservationId,
            course.title,
            `${sessionsConsumed} séance${sessionsConsumed > 1 ? 's' : ''} recréditée${sessionsConsumed > 1 ? 's' : ''}`
          );
        }
      } catch (notifError) {
        console.error('[cancelReservationWithRefund] Notification error:', notifError);
      }

      console.log('[cancelReservationWithRefund] Remboursement terminé:', {
        studentId: reservation.studentId,
        sessionsRefunded: sessionsConsumed,
      });

      return {
        success: true,
      };
    });
  } catch (error) {
    console.error('[cancelReservationWithRefund] Transaction error:', error);

    return {
      success: false,
      error: error instanceof Error
        ? `Erreur technique: ${error.message}`
        : 'Une erreur inattendue est survenue lors de l\'annulation'
    };
  }
}
