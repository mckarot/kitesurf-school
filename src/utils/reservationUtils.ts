// src/utils/reservationUtils.ts

import { db } from '../db/db';
import type { Reservation, CourseSession } from '../types';

/**
 * Met à jour le statut des réservations passées à 'completed'
 * Une réservation est considérée comme terminée si:
 * - La date de la session est passée (strictement avant aujourd'hui)
 * - Le statut actuel n'est pas 'cancelled'
 */
export async function updateCompletedReservations(): Promise<number> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const reservations = await db.reservations.toArray();
    const sessions = await db.courseSessions.toArray();

    let updatedCount = 0;

    for (const reservation of reservations) {
      // Skip if already completed or cancelled
      if (reservation.status === 'completed' || reservation.status === 'cancelled') {
        continue;
      }

      // Find the session for this reservation
      const session = sessions.find((s) => s.courseId === reservation.courseId);

      if (!session) {
        continue;
      }

      // Check if the session date is in the past
      if (session.date < today) {
        await db.reservations.update(reservation.id, { status: 'completed' as const });
        updatedCount++;
      }
    }

    return updatedCount;
  } catch (err) {
    console.error('Failed to update completed reservations:', err);
    return 0;
  }
}

/**
 * Vérifie si une réservation peut être marquée comme terminée
 * (utilisé pour afficher/masquer le bouton)
 */
export function canMarkAsCompleted(sessionDate: string, status: string): boolean {
  const today = new Date().toISOString().split('T')[0];
  return sessionDate < today && status !== 'cancelled' && status !== 'completed';
}

/**
 * Marque une réservation spécifique comme terminée
 */
export async function markReservationAsCompleted(reservationId: number): Promise<void> {
  try {
    const reservation = await db.reservations.get(reservationId);

    if (!reservation) {
      throw new Error(`Réservation #${reservationId} non trouvée`);
    }

    if (reservation.status === 'cancelled') {
      throw new Error('Impossible de terminer une réservation annulée');
    }

    await db.reservations.update(reservationId, { status: 'completed' as const });
  } catch (err) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error('Échec de la mise à jour de la réservation');
  }
}
