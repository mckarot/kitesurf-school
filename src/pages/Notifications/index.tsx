// src/pages/Notifications/index.tsx
// Page de gestion des notifications pour les élèves
// Design Metalab : Hero header gradient, cards rounded-3xl, animations framer-motion

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { db } from '../../db/db';
import { useAuth } from '../../hooks/useAuth';
import type { Notification, User } from '../../types';
import {
  Bell,
  CheckCircle,
  Trash2,
  Info,
  Calendar,
  XCircle,
  CheckCircle2,
  AlertCircle,
  Gift,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

// Types pour le loader
interface NotificationsLoaderData {
  notifications: Notification[];
  user: User | null;
}

// Icônes par type de notification
const notificationIcons: Record<Notification['type'], React.ReactNode> = {
  reservation_pending: <AlertCircle className="w-6 h-6" />,
  reservation_confirmed: <CheckCircle2 className="w-6 h-6" />,
  reservation_cancelled: <XCircle className="w-6 h-6" />,
  reservation_completed: <CheckCircle className="w-6 h-6" />,
  credit_added: <Gift className="w-6 h-6" />,
  general: <Info className="w-6 h-6" />,
};

const notificationColors: Record<Notification['type'], string> = {
  reservation_pending: 'from-yellow-500 to-orange-500',
  reservation_confirmed: 'from-green-500 to-emerald-500',
  reservation_cancelled: 'from-red-500 to-rose-500',
  reservation_completed: 'from-blue-500 to-cyan-500',
  credit_added: 'from-purple-500 to-pink-500',
  general: 'from-gray-500 to-slate-500',
};

const notificationTitles: Record<Notification['type'], string> = {
  reservation_pending: 'Réservation en attente',
  reservation_confirmed: 'Réservation confirmée',
  reservation_cancelled: 'Réservation annulée',
  reservation_completed: 'Cours terminé',
  credit_added: 'Crédits ajoutés',
  general: 'Information',
};

/**
 * Loader pour React Router v6.4+
 * Charge les notifications AVANT le rendu de la page
 */
export async function notificationsLoader(): Promise<NotificationsLoaderData> {
  // Récupérer l'ID utilisateur depuis le localStorage
  const storedUserId = localStorage.getItem('kitesurf_auth_userId');
  
  if (!storedUserId) {
    return { notifications: [], user: null };
  }

  const userId = Number(storedUserId);
  
  if (Number.isNaN(userId)) {
    return { notifications: [], user: null };
  }

  try {
    const [notifications, user] = await Promise.all([
      db.notifications
        .where('userId')
        .equals(userId)
        .reverse()
        .sortBy('createdAt'),
      db.users.get(userId),
    ]);

    return { notifications: notifications as Notification[], user: user || null };
  } catch (error) {
    console.error('Error loading notifications:', error);
    return { notifications: [], user: null };
  }
}

/**
 * Composant de carte de notification individuelle
 */
interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead: (id: number) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  index: number;
}

function NotificationCard({ notification, onMarkAsRead, onDelete, index }: NotificationCardProps) {
  const isUnread = notification.read === 0;
  const icon = notificationIcons[notification.type];
  const colors = notificationColors[notification.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className={`relative overflow-hidden rounded-3xl bg-white shadow-lg transition-all duration-300 hover:shadow-xl ${
        isUnread ? 'ring-2 ring-blue-500 ring-offset-2' : ''
      }`}
    >
      {/* Gradient stripe on the left */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${colors}`} />
      
      <div className="p-6 pl-8">
        {/* Header de la carte */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            {/* Icon with gradient background */}
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colors} flex items-center justify-center text-white shadow-lg`}>
              {icon}
            </div>
            
            <div>
              <h3 className={`text-lg font-bold ${isUnread ? 'text-gray-900' : 'text-gray-600'}`}>
                {notification.title}
              </h3>
              <p className="text-sm text-gray-500 flex items-center space-x-2 mt-1">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(notification.createdAt).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </p>
            </div>
          </div>

          {/* Badge non lu */}
          {isUnread && (
            <Badge variant="info" size="md" className="animate-pulse">
              Nouveau
            </Badge>
          )}
        </div>

        {/* Message */}
        <p className={`text-base mb-6 ${isUnread ? 'text-gray-700' : 'text-gray-500'}`}>
          {notification.message}
        </p>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3">
          {isUnread && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMarkAsRead(notification.id!)}
              className="flex items-center space-x-2 text-green-600 hover:bg-green-50"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Marquer comme lu</span>
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(notification.id!)}
            className="flex items-center space-x-2 text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
            <span>Supprimer</span>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Page principale des notifications
 */
export function NotificationsPage() {
  const { user } = useAuth();
  const { notifications: initialNotifications } = useLoaderData() as NotificationsLoaderData;
  const navigate = useNavigate();
  
  // État local pour les notifications (après les actions utilisateur)
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [isProcessing, setIsProcessing] = useState<number | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // Calculer le nombre de notifications non lues
  const unreadCount = notifications.filter(n => n.read === 0).length;

  // Gérer le marquage comme lu
  const handleMarkAsRead = async (notificationId: number) => {
    setIsProcessing(notificationId);
    try {
      await db.notifications.update(notificationId, { read: 1 as 0 | 1 });
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, read: 1 as 0 | 1 } : n))
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    } finally {
      setIsProcessing(null);
    }
  };

  // Gérer la suppression d'une notification
  const handleDelete = async (notificationId: number) => {
    setIsProcessing(notificationId);
    try {
      await db.notifications.delete(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    } finally {
      setIsProcessing(null);
    }
  };

  // Tout marquer comme lu
  const handleMarkAllAsRead = async () => {
    try {
      const unreadIds = notifications
        .filter(n => n.read === 0 && n.id !== undefined)
        .map(n => n.id!);

      await Promise.all(
        unreadIds.map(id => db.notifications.update(id, { read: 1 as 0 | 1 }))
      );

      setNotifications(prev => prev.map(n => ({ ...n, read: 1 as 0 | 1 })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Supprimer les notifications lues
  const handleDeleteRead = async () => {
    try {
      const readIds = notifications
        .filter(n => n.read === 1 && n.id !== undefined)
        .map(n => n.id!);

      await Promise.all(readIds.map(id => db.notifications.delete(id)));
      setNotifications(prev => prev.filter(n => n.read === 0));
      setShowConfirmDelete(false);
    } catch (error) {
      console.error('Error deleting read notifications:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100">
      {/* Hero Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 text-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Back button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate(-1)}
                className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors"
                aria-label="Retour"
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>

              <div className="flex items-center space-x-3">
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
                  className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center"
                >
                  <Bell className="w-8 h-8 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold">Notifications</h1>
                  <p className="text-blue-100 text-lg mt-1">
                    Restez informé de l'actualité de vos réservations
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="text-right"
            >
              <div className="text-5xl font-bold">{unreadCount}</div>
              <div className="text-blue-100">non lue{unreadCount > 1 ? 's' : ''}</div>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-8">
        {/* Actions Bar */}
        {unreadCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex justify-end"
          >
            <Button
              variant="secondary"
              size="md"
              onClick={handleMarkAllAsRead}
              className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm"
            >
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Tout marquer comme lu</span>
            </Button>
          </motion.div>
        )}

        {notifications.filter(n => n.read === 1).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 flex justify-end"
          >
            <Button
              variant="ghost"
              size="md"
              onClick={() => setShowConfirmDelete(true)}
              className="flex items-center space-x-2 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-5 h-5" />
              <span>Supprimer les notifications lues</span>
            </Button>
          </motion.div>
        )}

        {/* Notification List */}
        {notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-xl p-12 text-center"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-blue-200 to-cyan-300 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bell className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Aucune notification
            </h3>
            <p className="text-gray-600">
              Vous n'avez pas encore de notifications. Elles apparaîtront ici lorsque vous aurez des mises à jour sur vos réservations.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {notifications.map((notification, index) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDelete}
                  index={index}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Confirmation Modal for Delete Read */}
      <AnimatePresence>
        {showConfirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowConfirmDelete(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Confirmer la suppression"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Supprimer les notifications lues ?
                </h3>
                <p className="text-gray-600">
                  Cette action est irréversible. Toutes les notifications marquées comme lues seront définitivement supprimées.
                </p>
              </div>

              <div className="flex space-x-4">
                <Button
                  variant="secondary"
                  onClick={() => setShowConfirmDelete(false)}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDeleteRead}
                  className="flex-1"
                >
                  Supprimer
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
