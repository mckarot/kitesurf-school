// src/pages/InstructorCalendar/index.tsx
// Calendrier des sessions moniteur avec design Metalab
// Basé sur le nouveau système SchoolSchedule (créneaux automatiques)

import { useLoaderData, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { InstructorCalendar } from '../../components/Calendar/InstructorCalendar';
import type { InstructorCalendarLoaderData } from './loader';
import { Calendar, Clock, ArrowLeft, Users, RefreshCw } from 'lucide-react';
import { refreshCourseSessions } from '../../utils/generateCourseSessions';

export function InstructorCalendarPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { courses, reservations, courseSessions, exceptions } = useLoaderData() as InstructorCalendarLoaderData;

  const handleRefreshSessions = async () => {
    if (!confirm('Générer les sessions de cours pour les 90 prochains jours ?')) {
      return;
    }
    
    try {
      await refreshCourseSessions();
      alert('✅ Sessions générées avec succès !');
      window.location.reload(); // Recharger pour afficher les nouvelles sessions
    } catch (error) {
      alert('❌ Erreur lors de la génération des sessions');
      console.error(error);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'instructor') {
    return <Navigate to="/dashboard" replace />;
  }

  // Calculate stats from course sessions
  const activeSessions = courseSessions.filter(s => s.isActive).length;
  const totalReservations = reservations.length;
  const totalCapacity = courseSessions.reduce((sum, s) => sum + s.maxStudents, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Hero Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 text-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => window.history.back()}
                className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/30 transition-all"
                aria-label="Retour"
              >
                <ArrowLeft className="w-6 h-6 text-white" />
              </motion.button>
              <div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="flex items-center space-x-3 mb-3"
                >
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold">Calendrier des Sessions</h1>
                </motion.div>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-purple-100 text-lg"
                >
                  Visualisez les sessions générées automatiquement
                </motion.p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefreshSessions}
                className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full font-semibold hover:bg-white/30 transition-all"
                title="Générer les sessions pour les 90 prochains jours"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Mettre à jour</span>
              </motion.button>
              <motion.a
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.4 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="/admin/school-schedule"
                className="flex items-center space-x-2 bg-white text-purple-600 px-6 py-3 rounded-full font-semibold hover:bg-purple-50 transition-all shadow-lg"
              >
                <Clock className="w-5 h-5" />
                <span>Gérer l'emploi du temps</span>
              </motion.a>
            </div>
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
          {/* Total sessions */}
          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-white rounded-3xl shadow-xl p-6 border border-purple-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total sessions</p>
                <p className="text-4xl font-bold text-purple-600">{activeSessions}</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-400 rounded-2xl flex items-center justify-center">
                <Calendar className="w-8 h-8 text-white" />
              </div>
            </div>
          </motion.div>

          {/* Réservations */}
          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-white rounded-3xl shadow-xl p-6 border border-green-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Réservations</p>
                <p className="text-4xl font-bold text-green-600">{totalReservations}</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-400 rounded-2xl flex items-center justify-center">
                <Users className="w-8 h-8 text-white" />
              </div>
            </div>
          </motion.div>

          {/* Capacité totale */}
          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-white rounded-3xl shadow-xl p-6 border border-blue-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Capacité totale</p>
                <p className="text-4xl font-bold text-blue-600">{totalCapacity}</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center">
                <Clock className="w-8 h-8 text-white" />
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Calendar Component */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white rounded-3xl shadow-xl p-6 border border-purple-100"
        >
          <InstructorCalendar
            courses={courses}
            reservations={reservations}
            courseSessions={courseSessions}
            exceptions={exceptions}
          />
        </motion.div>
      </main>
    </div>
  );
}

export default InstructorCalendarPage;
