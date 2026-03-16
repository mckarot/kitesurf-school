// src/pages/Dashboard/index.tsx
// Tableau de bord utilisateur avec design Metalab

import { useAuth } from '../../hooks/useAuth';
import { useCourses } from '../../hooks/useCourses';
import { useReservations } from '../../hooks/useReservations';
import { db } from '../../db/db';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Navigate, Link } from 'react-router-dom';
import { DebugDBReset } from '../../components/DebugDBReset';
import {
  Users,
  Calendar,
  Award,
  Settings,
  BookOpen,
  Clock,
  TrendingUp,
  CheckCircle,
  UserCheck,
  Gift,
  XCircle
} from 'lucide-react';

export function DashboardPage() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const { courses } = useCourses();
  const { reservations } = useReservations();
  const [pendingReservationsCount, setPendingReservationsCount] = useState(0);

  // Charger le nombre de réservations en attente (admin seulement)
  useEffect(() => {
    if (user?.role === 'admin') {
      db.reservations
        .where('status')
        .equals('pending')
        .count()
        .then(count => setPendingReservationsCount(count))
        .catch(err => console.error('Error counting pending reservations:', err));
    }
  }, [user?.role]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const activeCourses = courses.filter((c) => c.isActive === 1);
  const activeReservations = reservations.filter((r) => r.status !== 'cancelled');

  const roleColors = {
    admin: 'from-red-500 to-pink-500',
    instructor: 'from-purple-500 to-indigo-500',
    student: 'from-blue-500 to-cyan-500',
  };

  const roleLabels = {
    admin: 'Administrateur',
    instructor: 'Moniteur',
    student: 'Élève',
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
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className={`w-16 h-16 bg-gradient-to-br ${roleColors[user.role]} rounded-2xl flex items-center justify-center shadow-xl`}
              >
                <span className="text-2xl font-bold text-white">
                  {user.firstName[0]}{user.lastName[0]}
                </span>
              </motion.div>
              <div>
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="text-4xl md:text-5xl font-bold"
                >
                  Bonjour {user.firstName} !
                </motion.h1>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="flex items-center space-x-3 mt-2"
                >
                  <Badge
                    variant={user.role === 'admin' ? 'danger' : user.role === 'instructor' ? 'info' : 'default'}
                    className="text-sm px-4 py-1.5"
                  >
                    {roleLabels[user.role]}
                  </Badge>
                  <span className="text-blue-100">
                    {user.email}
                  </span>
                </motion.div>
              </div>
            </div>
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={logout}
              className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full hover:bg-white/30 transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="font-medium">Déconnexion</span>
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-8">
        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          {/* Cours disponibles */}
          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-white rounded-3xl shadow-xl p-6 border border-blue-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Cours disponibles</p>
                <p className="text-4xl font-bold text-blue-600">{activeCourses.length}</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
            </div>
          </motion.div>

          {/* Réservations actives */}
          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-white rounded-3xl shadow-xl p-6 border border-green-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Réservations actives</p>
                <p className="text-4xl font-bold text-green-600">{activeReservations.length}</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-400 rounded-2xl flex items-center justify-center">
                <Calendar className="w-8 h-8 text-white" />
              </div>
            </div>
          </motion.div>

          {/* Niveau */}
          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-white rounded-3xl shadow-xl p-6 border border-purple-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Niveau</p>
                <p className="text-2xl font-bold text-purple-600 capitalize">
                  {user.role === 'student' ? 'Débutant' : 'Expert'}
                </p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-400 rounded-2xl flex items-center justify-center">
                <Award className="w-8 h-8 text-white" />
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Admin Section */}
        {user.role === 'admin' && (
          <>
            {/* Réservations en attente */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mb-6"
            >
              <div className="flex items-center space-x-2">
                <Settings className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Administration</h2>
              </div>
            </motion.div>

            {/* Admin Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
            >
              {/* Réservations en attente */}
              <Link to="/admin/reservations-validation" className="block">
                <motion.div
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="bg-white rounded-3xl shadow-xl p-6 border border-orange-100 cursor-pointer hover:shadow-2xl transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-400 rounded-2xl flex items-center justify-center">
                      <Clock className="w-8 h-8 text-white" />
                    </div>
                    {pendingReservationsCount > 0 && (
                      <Badge variant="danger" className="text-sm px-3 py-1">
                        {pendingReservationsCount} en attente
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Réservations</h3>
                  <p className="text-sm text-gray-600">Valider et assigner</p>
                </motion.div>
              </Link>

              {/* Gestion des crédits */}
              <Link to="/admin/credits">
                <motion.div
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="bg-white rounded-3xl shadow-xl p-6 border border-purple-100 cursor-pointer hover:shadow-2xl transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-400 rounded-2xl flex items-center justify-center">
                      <Gift className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Crédits</h3>
                  <p className="text-sm text-gray-600">Gérer les séances</p>
                </motion.div>
              </Link>

              {/* Gestion des utilisateurs */}
              <Link to="/admin">
                <motion.div
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="bg-white rounded-3xl shadow-xl p-6 border border-blue-100 cursor-pointer hover:shadow-2xl transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Utilisateurs</h3>
                  <p className="text-sm text-gray-600">Administrer les comptes</p>
                </motion.div>
              </Link>

              {/* Gestion des cours */}
              <Link to="/admin">
                <motion.div
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="bg-white rounded-3xl shadow-xl p-6 border border-green-100 cursor-pointer hover:shadow-2xl transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-400 rounded-2xl flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Cours</h3>
                  <p className="text-sm text-gray-600">Créer et modifier</p>
                </motion.div>
              </Link>

              {/* Emploi du temps */}
              <Link to="/admin/school-schedule">
                <motion.div
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="bg-white rounded-3xl shadow-xl p-6 border border-indigo-100 cursor-pointer hover:shadow-2xl transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-blue-400 rounded-2xl flex items-center justify-center">
                      <Calendar className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Emploi du temps</h3>
                  <p className="text-sm text-gray-600">Planning de l'école</p>
                </motion.div>
              </Link>

              {/* Annulations */}
              <Link to="/admin/session-exceptions">
                <motion.div
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="bg-white rounded-3xl shadow-xl p-6 border border-red-100 cursor-pointer hover:shadow-2xl transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-pink-400 rounded-2xl flex items-center justify-center">
                      <XCircle className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Annulations</h3>
                  <p className="text-sm text-gray-600">Gérer les exceptions</p>
                </motion.div>
              </Link>

              {/* Statistiques */}
              <Link to="/admin/stats">
                <motion.div
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="bg-white rounded-3xl shadow-xl p-6 border border-cyan-100 cursor-pointer hover:shadow-2xl transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-teal-400 rounded-2xl flex items-center justify-center">
                      <TrendingUp className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Statistiques</h3>
                  <p className="text-sm text-gray-600">Analyser les données</p>
                </motion.div>
              </Link>
            </motion.div>
          </>
        )}

        {/* Student Section */}
        {user.role === 'student' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="flex items-center space-x-2 mb-6">
              <UserCheck className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Espace Élève</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link to="/student">
                <motion.div
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="bg-white rounded-3xl shadow-xl p-6 border border-blue-100 cursor-pointer hover:shadow-2xl transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center">
                      <Calendar className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Réserver un cours</h3>
                  <p className="text-sm text-gray-600">Choisis ton créneau</p>
                </motion.div>
              </Link>
              <Link to="/reservations">
                <motion.div
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="bg-white rounded-3xl shadow-xl p-6 border border-green-100 cursor-pointer hover:shadow-2xl transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-400 rounded-2xl flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Mon historique</h3>
                  <p className="text-sm text-gray-600">Voir mes réservations</p>
                </motion.div>
              </Link>
            </div>
          </motion.div>
        )}

        {/* Instructor Section */}
        {user.role === 'instructor' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="flex items-center space-x-2 mb-6">
              <Award className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">Espace Moniteur</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link to="/instructor">
                <motion.div
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="bg-white rounded-3xl shadow-xl p-6 border border-purple-100 cursor-pointer hover:shadow-2xl transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-400 rounded-2xl flex items-center justify-center">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Mes élèves</h3>
                  <p className="text-sm text-gray-600">Gérer les cours</p>
                </motion.div>
              </Link>
              <Link to="/instructor/calendar">
                <motion.div
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="bg-white rounded-3xl shadow-xl p-6 border border-indigo-100 cursor-pointer hover:shadow-2xl transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-blue-400 rounded-2xl flex items-center justify-center">
                      <Calendar className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Calendrier</h3>
                  <p className="text-sm text-gray-600">Mon emploi du temps</p>
                </motion.div>
              </Link>
            </div>
          </motion.div>
        )}
      </main>

      {/* Debug DB Reset - Only visible in development */}
      {import.meta.env.DEV && <DebugDBReset />}
    </div>
  );
}

export default DashboardPage;