// src/hooks/useNotifications.ts
// Hook personnalisé pour la gestion des notifications utilisateur
// Utilise Dexie.js pour IndexedDB et suit le pattern strict TypeScript

import { useState, useCallback, useEffect } from 'react';
import { db } from '../db/db';
import type { Notification } from '../types';

interface UseNotificationsReturn {
  notifications: Notification[];
  isLoading: boolean;
  error: Error | null;
  unreadCount: number;
  markAsRead: (notificationId: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: number) => Promise<void>;
  deleteReadNotifications: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

/**
 * Hook useNotifications
 * 
 * Gère les notifications d'un utilisateur :
 * - Récupération des notifications (avec option unreadOnly)
 * - Marquer comme lu (individuel ou tous)
 * - Suppression (individuelle ou notifications lues)
 * - Compteur de notifications non lues
 * 
 * @param userId - ID de l'utilisateur connecté
 * @param unreadOnly - Si true, ne charge que les notifications non lues
 * @returns Objet avec notifications, états et actions
 */
export function useNotifications(userId: number | null, unreadOnly = false): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Charger les notifications au montage ou quand userId/unreadOnly change
  useEffect(() => {
    async function loadNotifications() {
      if (!userId) {
        setNotifications([]);
        setUnreadCount(0);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Récupérer toutes les notifications de l'utilisateur
        const allNotifications = await db.notifications
          .where('userId')
          .equals(userId)
          .reverse()
          .sortBy('createdAt');

        // Filtrer si unreadOnly est true
        const filtered = unreadOnly
          ? allNotifications.filter((n): n is Notification => n.read === 0)
          : allNotifications;

        setNotifications(filtered);

        // Calculer le nombre de notifications non lues
        const unread = allNotifications.filter((n): n is Notification => n.read === 0);
        setUnreadCount(unread.length);
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error('Failed to load notifications');
        setError(errorObj);
        throw errorObj;
      } finally {
        setIsLoading(false);
      }
    }

    loadNotifications();
  }, [userId, unreadOnly]);

  // Marquer une notification comme lue
  const markAsRead = useCallback(async (notificationId: number) => {
    setError(null);
    try {
      await db.notifications.update(notificationId, { read: 1 as 0 | 1 });
      
      // Mettre à jour l'état local
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, read: 1 as 0 | 1 } : n
        )
      );
      
      // Mettre à jour le compteur
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to mark notification as read');
      setError(errorObj);
      throw errorObj;
    }
  }, []);

  // Marquer toutes les notifications comme lues
  const markAllAsRead = useCallback(async () => {
    setError(null);
    try {
      // Récupérer toutes les notifications non lues de l'utilisateur
      const unreadNotifications = notifications.filter((n): n is Notification & { id: number } => 
        n.read === 0 && n.id !== undefined
      );

      // Mettre à jour chaque notification
      await Promise.all(
        unreadNotifications.map(n =>
          db.notifications.update(n.id, { read: 1 as 0 | 1 })
        )
      );

      // Mettre à jour l'état local
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: 1 as 0 | 1 }))
      );

      // Mettre à jour le compteur
      setUnreadCount(0);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to mark all notifications as read');
      setError(errorObj);
      throw errorObj;
    }
  }, [notifications]);

  // Supprimer une notification
  const deleteNotification = useCallback(async (notificationId: number) => {
    setError(null);
    try {
      // Vérifier si la notification est lue pour mettre à jour le compteur
      const notification = notifications.find(n => n.id === notificationId);
      const isUnread = notification?.read === 0;

      await db.notifications.delete(notificationId);

      // Mettre à jour l'état local
      setNotifications(prev => prev.filter(n => n.id !== notificationId));

      // Mettre à jour le compteur si nécessaire
      if (isUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to delete notification');
      setError(errorObj);
      throw errorObj;
    }
  }, [notifications]);

  // Supprimer toutes les notifications lues
  const deleteReadNotifications = useCallback(async () => {
    setError(null);
    try {
      const readNotifications = notifications.filter(
        (n): n is Notification & { id: number } => n.read === 1 && n.id !== undefined
      );

      await Promise.all(
        readNotifications.map(n => db.notifications.delete(n.id))
      );

      // Mettre à jour l'état local (garder seulement les non lues)
      setNotifications(prev => prev.filter(n => n.read === 0));
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to delete read notifications');
      setError(errorObj);
      throw errorObj;
    }
  }, [notifications]);

  // Rafraîchir manuellement les notifications
  const refreshNotifications = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const allNotifications = await db.notifications
        .where('userId')
        .equals(userId)
        .reverse()
        .sortBy('createdAt');

      const filtered = unreadOnly
        ? allNotifications.filter((n): n is Notification => n.read === 0)
        : allNotifications;

      setNotifications(filtered);

      const unread = allNotifications.filter((n): n is Notification => n.read === 0);
      setUnreadCount(unread.length);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to refresh notifications');
      setError(errorObj);
      throw errorObj;
    } finally {
      setIsLoading(false);
    }
  }, [userId, unreadOnly]);

  return {
    notifications,
    isLoading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteReadNotifications,
    refreshNotifications,
  };
}
