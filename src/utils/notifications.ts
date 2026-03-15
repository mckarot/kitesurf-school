// src/utils/notifications.ts

import { db } from '../db/db';
import type { Notification } from '../types';

/**
 * Crée une notification pour un utilisateur
 */
export async function createNotification(
  userId: number,
  type: Notification['type'],
  title: string,
  message: string,
  reservationId?: number
): Promise<number> {
  return await db.notifications.add({
    userId,
    type,
    title,
    message,
    read: 0,
    reservationId,
    createdAt: Date.now(),
  });
}

/**
 * Récupère les notifications d'un utilisateur
 */
export async function getUserNotifications(userId: number, unreadOnly = false): Promise<Notification[]> {
  let query = db.notifications.where('userId').equals(userId);
  
  if (unreadOnly) {
    return await query.and(n => n.read === 0).sortBy('createdAt');
  }
  
  return await query.reverse().sortBy('createdAt');
}

/**
 * Marque une notification comme lue
 */
export async function markNotificationAsRead(notificationId: number): Promise<void> {
  await db.notifications.update(notificationId, { read: 1 as 0 | 1 });
}

/**
 * Marque toutes les notifications d'un utilisateur comme lues
 */
export async function markAllNotificationsAsRead(userId: number): Promise<void> {
  const notifications = await getUserNotifications(userId, true);
  
  await Promise.all(
    notifications
      .filter((n): n is Notification & { id: number } => n.id !== undefined)
      .map(n => markNotificationAsRead(n.id))
  );
}

/**
 * Supprime une notification
 */
export async function deleteNotification(notificationId: number): Promise<void> {
  await db.notifications.delete(notificationId);
}

/**
 * Supprime toutes les notifications lues d'un utilisateur
 */
export async function deleteReadNotifications(userId: number): Promise<void> {
  const notifications = await getUserNotifications(userId);
  
  await Promise.all(
    notifications
      .filter((n): n is Notification & { id: number } => n.read === 1 && n.id !== undefined)
      .map(n => deleteNotification(n.id))
  );
}

/**
 * Crée une notification de réservation en attente
 */
export async function notifyReservationPending(
  studentId: number,
  reservationId: number,
  courseName: string,
  sessionDate: string
): Promise<void> {
  await createNotification(
    studentId,
    'reservation_pending',
    'Réservation en attente',
    `Votre réservation pour "${courseName}" le ${sessionDate} est en attente de confirmation par l'administrateur.`,
    reservationId
  );
}

/**
 * Crée une notification de réservation confirmée
 */
export async function notifyReservationConfirmed(
  studentId: number,
  reservationId: number,
  courseName: string,
  sessionDate: string,
  instructorName?: string
): Promise<void> {
  const instructorMsg = instructorName ? ` avec ${instructorName}` : '';
  
  await createNotification(
    studentId,
    'reservation_confirmed',
    'Réservation confirmée',
    `Votre réservation pour "${courseName}" le ${sessionDate} a été confirmée${instructorMsg}.`,
    reservationId
  );
}

/**
 * Crée une notification de réservation annulée
 */
export async function notifyReservationCancelled(
  studentId: number,
  reservationId: number,
  courseName: string,
  reason: string
): Promise<void> {
  await createNotification(
    studentId,
    'reservation_cancelled',
    'Réservation annulée',
    `Votre réservation pour "${courseName}" a été annulée. Raison : ${reason}`,
    reservationId
  );
}

/**
 * Crée une notification de crédit ajouté
 */
export async function notifyCreditAdded(
  studentId: number,
  sessionsAdded: number
): Promise<void> {
  await createNotification(
    studentId,
    'credit_added',
    'Crédits ajoutés',
    `${sessionsAdded} séance(s) ont été ajoutées à votre compte.`,
    undefined
  );
}
