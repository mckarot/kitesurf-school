// src/utils/cancelReservationWithRefund.ts
// Annule une réservation et recrédite le wallet de l'élève (système v13 euros)

import { db } from '../db/db';
import { notifyReservationCancelled } from './notifications';

/**
 * Annule une réservation et recrédite le wallet de l'élève
 * Système v13 : remboursement en euros, pas en séances
 *
 * @param reservationId - ID de la réservation à annuler
 * @returns Promise<{ success: boolean; error?: string }>
 */
export async function cancelReservationWithRefund(
  reservationId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    // Étape 0: Récupérer les données HORS transaction (évite NotFoundError)
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

    // IMPORTANT: reservation.courseId pointe vers une CourseSession, pas un Course !
    const session = await db.courseSessions.get(reservation.courseId);
    if (!session) {
      return {
        success: false,
        error: 'Session non trouvée'
      };
    }

    // Récupérer le cours pour avoir le titre
    const course = await db.courses.get(session.courseId);
    if (!course) {
      return {
        success: false,
        error: 'Cours non trouvé'
      };
    }

    // Étape 1-3: Transaction pour annulation + remboursement
    const result = await db.transaction('rw', db.reservations, db.userWallets, async () => {
      // Étape 1: Changer le statut de la réservation
      await db.reservations.update(reservationId, {
        status: 'cancelled' as const,
      });

      console.log('[cancelReservationWithRefund] Réservation annulée:', reservationId);

      // Étape 2: Rembourser le wallet de l'élève
      const wallet = await db.userWallets.where('userId').equals(reservation.studentId).first();
      
      if (!wallet) {
        console.error('[cancelReservationWithRefund] Wallet non trouvé pour userId:', reservation.studentId);
        throw new Error('Portefeuille non trouvé');
      }

      // Rembourser le prix du cours
      const newBalance = wallet.balance + course.price;
      await db.userWallets.update(wallet.id, {
        balance: newBalance,
        updatedAt: Date.now()
      });

      console.log('[cancelReservationWithRefund] Remboursement:', {
        walletId: wallet.id,
        amountRefunded: course.price,
        oldBalance: wallet.balance,
        newBalance: newBalance
      });

      return {
        success: true,
        error: undefined,
        coursePrice: course.price,
        courseTitle: course.title
      };
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    // Étape 3: Notification (HORS transaction)
    try {
      await notifyReservationCancelled(
        reservation.studentId,
        reservation.id,
        course.title,
        `${course.price}€ remboursés`
      );
    } catch (notifError) {
      console.error('[cancelReservationWithRefund] Notification error:', notifError);
    }

    console.log('[cancelReservationWithRefund] Remboursement terminé:', {
      studentId: reservation.studentId,
      amountRefunded: course.price
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
