// src/components/Layout/MainLayout.tsx
// Layout principal avec navigation et notifications
// Ajout de la cloche de notifications avec dropdown

import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import {
  Menu,
  X,
  Waves,
  Calendar,
  Users,
  Phone,
  Info,
  Home,
  Shield,
  LogOut,
  User,
  Bell,
  CheckCircle,
  AlertCircle,
  XCircle,
  CheckCircle2,
  Gift,
  Clock,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import type { Notification } from '../../types';

interface MainLayoutProps {
  requireAuth?: boolean;
  allowedRoles?: ('student' | 'instructor' | 'admin')[];
}

const navItems = [
  { path: '/home', label: 'Accueil', icon: Home },
  { path: '/about', label: 'À Propos', icon: Info },
  { path: '/courses', label: 'Cours & Tarifs', icon: Users },
  { path: '/equipment', label: 'Équipement', icon: Waves },
  { path: '/student', label: 'Réserver', icon: Calendar },
  { path: '/contact', label: 'Contact', icon: Phone },
];

// Icônes par type de notification
const notificationIcons: Record<Notification['type'], React.ReactNode> = {
  reservation_pending: <AlertCircle className="w-4 h-4" />,
  reservation_confirmed: <CheckCircle2 className="w-4 h-4" />,
  reservation_cancelled: <XCircle className="w-4 h-4" />,
  reservation_completed: <CheckCircle className="w-4 h-4" />,
  credit_added: <Gift className="w-4 h-4" />,
  general: <Info className="w-4 h-4" />,
};

const notificationColors: Record<Notification['type'], string> = {
  reservation_pending: 'bg-yellow-500',
  reservation_confirmed: 'bg-green-500',
  reservation_cancelled: 'bg-red-500',
  reservation_completed: 'bg-blue-500',
  credit_added: 'bg-purple-500',
  general: 'bg-gray-500',
};

export function MainLayout({ requireAuth = false, allowedRoles }: MainLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  const [pendingReservationsCount, setPendingReservationsCount] = useState(0);

  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Hook notifications - seulement pour les utilisateurs connectés
  const {
    notifications,
    unreadCount,
    markAsRead,
    isLoading: notificationsLoading,
  } = useNotifications(user?.id ?? null, false);

  // Récupérer les 5 dernières notifications pour le dropdown
  const recentNotifications = notifications.slice(0, 5);

  // Charger le nombre de réservations en attente (admin seulement)
  useEffect(() => {
    if (user?.role === 'admin') {
      // Import dynamique pour éviter les cycles de dépendance
      import('../../db/db').then(({ db }) => {
        db.reservations
          .where('status')
          .equals('pending')
          .count()
          .then(count => setPendingReservationsCount(count))
          .catch(err => console.error('Error counting pending reservations:', err));
      }).catch(err => console.error('Error importing db:', err));
    }
  }, [user?.role]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Fermer le dropdown notifications quand on clique ailleurs
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsNotificationDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Redirect to login if auth required and user not connected
  useEffect(() => {
    if (requireAuth && !user && !isRedirecting) {
      setIsRedirecting(true);
      navigate('/login', { state: { from: location.pathname }, replace: true });
    } else if (requireAuth && user && allowedRoles && !allowedRoles.includes(user.role)) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, requireAuth, allowedRoles, navigate, location.pathname, isRedirecting]);

  const handleLogout = () => {
    logout();
    navigate('/home');
  };

  const handleNotificationClick = async (notificationId: number) => {
    // Marquer comme lu
    await markAsRead(notificationId);
    // Naviguer vers la page des notifications
    navigate('/notifications');
    setIsNotificationDropdownOpen(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/90 backdrop-blur-md shadow-lg'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/home" className="flex items-center space-x-3">
              <motion.div
                whileHover={{ rotate: 10, scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Waves className="w-10 h-10 text-blue-600" />
              </motion.div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                KiteSchool
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => (
                <motion.div
                  key={item.path}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to={item.path}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      location.pathname === item.path
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* User Actions */}
            <div className="hidden lg:flex items-center space-x-4">
              {user && (
                <div className="flex items-center space-x-4">
                  {/* Admin - Dashboard + Réservations + Crédits */}
                  {user.role === 'admin' && (
                    <>
                      <Link
                        to="/dashboard"
                        className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                        title="Tableau de bord"
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/admin/reservations-validation"
                        className="text-sm text-gray-600 hover:text-blue-600 transition-colors flex items-center space-x-1 relative"
                      >
                        <span>Réservations</span>
                        {pendingReservationsCount > 0 && (
                          <span className="absolute -top-2 -right-3 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                            {pendingReservationsCount > 9 ? '9+' : pendingReservationsCount}
                          </span>
                        )}
                      </Link>
                      <Link
                        to="/admin/credits"
                        className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        Crédits
                      </Link>
                    </>
                  )}

                  {/* Instructor - Calendar */}
                  {user.role === 'instructor' && (
                    <Link
                      to="/instructor"
                      className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      Moniteur
                    </Link>
                  )}

                  {/* Student - History */}
                  {user.role === 'student' && (
                    <Link
                      to="/reservations"
                      className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      Historique
                    </Link>
                  )}

                  {/* Notification Bell */}
                  <div className="relative" ref={dropdownRef}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsNotificationDropdownOpen(!isNotificationDropdownOpen)}
                      className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
                      aria-label="Notifications"
                      aria-expanded={isNotificationDropdownOpen}
                    >
                      <Bell className="w-6 h-6" />
                      {unreadCount > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
                        >
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </motion.span>
                      )}
                    </motion.button>

                    {/* Notification Dropdown */}
                    <AnimatePresence>
                      {isNotificationDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                        >
                          {/* Header */}
                          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4">
                            <div className="flex items-center justify-between">
                              <h3 className="text-white font-bold text-lg">Notifications</h3>
                              <Link
                                to="/notifications"
                                className="text-blue-100 text-sm hover:text-white transition-colors"
                                onClick={() => setIsNotificationDropdownOpen(false)}
                              >
                                Voir tout
                              </Link>
                            </div>
                            {unreadCount > 0 && (
                              <p className="text-blue-100 text-sm mt-1">
                                {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                              </p>
                            )}
                          </div>

                          {/* Notification List */}
                          <div className="max-h-96 overflow-y-auto">
                            {notificationsLoading ? (
                              <div className="px-6 py-8 text-center text-gray-500">
                                Chargement...
                              </div>
                            ) : recentNotifications.length === 0 ? (
                              <div className="px-6 py-8 text-center text-gray-500">
                                <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p className="text-sm">Aucune notification</p>
                              </div>
                            ) : (
                              <div className="py-2">
                                {recentNotifications.map((notification) => (
                                  <button
                                    key={notification.id}
                                    onClick={() =>
                                      notification.id && handleNotificationClick(notification.id)
                                    }
                                    className={`w-full px-6 py-4 flex items-start space-x-3 hover:bg-gray-50 transition-colors ${
                                      notification.read === 0 ? 'bg-blue-50' : ''
                                    }`}
                                  >
                                    {/* Icon */}
                                    <div
                                      className={`w-10 h-10 rounded-xl ${notificationColors[notification.type]} flex items-center justify-center text-white flex-shrink-0`}
                                    >
                                      {notificationIcons[notification.type]}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 text-left">
                                      <div className="flex items-center justify-between">
                                        <h4
                                          className={`font-semibold text-sm ${
                                            notification.read === 0
                                              ? 'text-gray-900'
                                              : 'text-gray-600'
                                          }`}
                                        >
                                          {notification.title}
                                        </h4>
                                        {notification.read === 0 && (
                                          <span className="w-2 h-2 bg-blue-500 rounded-full" />
                                        )}
                                      </div>
                                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                        {notification.message}
                                      </p>
                                      <p className="text-xs text-gray-400 mt-2">
                                        {new Date(notification.createdAt).toLocaleDateString(
                                          'fr-FR',
                                          {
                                            day: 'numeric',
                                            month: 'short',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                          }
                                        )}
                                      </p>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Footer */}
                          <div className="border-t border-gray-100 px-6 py-3 bg-gray-50">
                            <Link
                              to="/notifications"
                              className="text-center text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors block"
                              onClick={() => setIsNotificationDropdownOpen(false)}
                            >
                              Voir toutes les notifications
                            </Link>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <Link
                    to="/profil/mes-donnees"
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {user.firstName} {user.lastName}
                    </span>
                  </Link>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                  </motion.button>
                </div>
              )}
              {!user && (
                <Link
                  to="/login"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Connexion
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-gray-700"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-20 left-0 right-0 z-40 bg-white shadow-lg lg:hidden"
          >
            <div className="px-4 py-6 space-y-2">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${
                      location.pathname === item.path
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </motion.div>
              ))}
              {user && (
                <>
                  <div className="border-t border-gray-200 my-4" />

                  {/* Notifications for mobile */}
                  <Link
                    to="/notifications"
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg relative"
                  >
                    <Bell className="w-5 h-5" />
                    <span className="font-medium">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="absolute right-4 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </Link>

                  {/* Admin Links */}
                  {user.role === 'admin' && (
                    <>
                      <Link
                        to="/dashboard"
                        className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg"
                      >
                        <Shield className="w-5 h-5" />
                        <span className="font-medium">Dashboard</span>
                      </Link>
                      <Link
                        to="/admin/reservations-validation"
                        className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg relative"
                      >
                        <Clock className="w-5 h-5" />
                        <span className="font-medium">Réservations</span>
                        {pendingReservationsCount > 0 && (
                          <span className="absolute right-4 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                            {pendingReservationsCount > 9 ? '9+' : pendingReservationsCount}
                          </span>
                        )}
                      </Link>
                      <Link
                        to="/admin/credits"
                        className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg"
                      >
                        <Calendar className="w-5 h-5" />
                        <span className="font-medium">Crédits</span>
                      </Link>
                    </>
                  )}

                  {/* Instructor Links */}
                  {user.role === 'instructor' && (
                    <Link
                      to="/instructor"
                      className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg"
                    >
                      <Calendar className="w-5 h-5" />
                      <span className="font-medium">Moniteur</span>
                    </Link>
                  )}

                  {/* Student Links */}
                  {user.role === 'student' && (
                    <Link
                      to="/reservations"
                      className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg"
                    >
                      <Calendar className="w-5 h-5" />
                      <span className="font-medium">Historique</span>
                    </Link>
                  )}

                  <Link
                    to="/profil/mes-donnees"
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    <Shield className="w-5 h-5" />
                    <span className="font-medium">Mon Profil</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Déconnexion</span>
                  </button>
                </>
              )}
              {!user && (
                <>
                  <div className="border-t border-gray-200 my-4" />
                  <Link
                    to="/login"
                    className="flex items-center space-x-3 px-4 py-3 text-blue-600 hover:bg-blue-50 rounded-lg font-medium"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Connexion</span>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="pt-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Waves className="w-8 h-8 text-blue-500" />
                <span className="text-xl font-bold">KiteSchool</span>
              </div>
              <p className="text-gray-400 text-sm">
                École de kitesurf professionnelle. Apprenez en toute sécurité avec des moniteurs certifiés.
              </p>
              <div className="flex space-x-4">
                {['facebook', 'instagram', 'youtube'].map((social) => (
                  <motion.a
                    key={social}
                    href="#"
                    whileHover={{ scale: 1.2, y: -2 }}
                    className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                  >
                    <span className="sr-only">{social}</span>
                    <div className="w-5 h-5 bg-gray-400 rounded" />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Liens Rapides</h3>
              <ul className="space-y-2">
                {navItems.slice(0, 4).map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Légal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/rgpd" className="text-gray-400 hover:text-white transition-colors">
                    Politique RGPD
                  </Link>
                </li>
                <li>
                  <Link to="/mentions-legales" className="text-gray-400 hover:text-white transition-colors">
                    Mentions Légales
                  </Link>
                </li>
                <li>
                  <Link to="/cgv" className="text-gray-400 hover:text-white transition-colors">
                    CGV
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Plage de la Baule</li>
                <li>Loire-Atlantique, France</li>
                <li>+33 6 12 34 56 78</li>
                <li>contact@kiteschool.fr</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; {new Date().getFullYear()} KiteSchool. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
