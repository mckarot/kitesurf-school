// src/pages/InstructorCalendar/index.tsx
// Calendrier des créneaux moniteur avec design Metalab

import { useLoaderData, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { InstructorCalendar } from '../../components/Calendar/InstructorCalendar';
import type { InstructorCalendarLoaderData } from './loader';
import { Calendar, Clock, Plus, ArrowLeft } from 'lucide-react';

export function InstructorCalendarPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { timeSlots, courses, reservations } = useLoaderData() as InstructorCalendarLoaderData;

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
                  <h1 className="text-4xl md:text-5xl font-bold">Calendrier des Créneaux</h1>
                </motion.div>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-purple-100 text-lg"
                >
                  Visualisez et gérez vos créneaux horaires
                </motion.p>
              </div>
            </div>
            <motion.a
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="/instructor/timeslots"
              className="flex items-center space-x-2 bg-white text-purple-600 px-6 py-3 rounded-full font-semibold hover:bg-purple-50 transition-all shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span>Gérer les créneaux</span>
            </motion.a>
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
          {/* Total créneaux */}
          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-white rounded-3xl shadow-xl p-6 border border-purple-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total créneaux</p>
                <p className="text-4xl font-bold text-purple-600">{timeSlots.length}</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-400 rounded-2xl flex items-center justify-center">
                <Clock className="w-8 h-8 text-white" />
              </div>
            </div>
          </motion.div>

          {/* Créneaux disponibles */}
          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-white rounded-3xl shadow-xl p-6 border border-green-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Disponibles</p>
                <p className="text-4xl font-bold text-green-600">
                  {timeSlots.filter(slot => slot.isAvailable === 1).length}
                </p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-400 rounded-2xl flex items-center justify-center">
                <Calendar className="w-8 h-8 text-white" />
              </div>
            </div>
          </motion.div>

          {/* Créneaux indisponibles */}
          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-white rounded-3xl shadow-xl p-6 border border-red-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Indisponibles</p>
                <p className="text-4xl font-bold text-red-600">
                  {timeSlots.filter(slot => slot.isAvailable === 0).length}
                </p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-400 rounded-2xl flex items-center justify-center">
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
            timeSlots={timeSlots}
            courses={courses}
            reservations={reservations}
          />
        </motion.div>
      </main>
    </div>
  );
}

export default InstructorCalendarPage;
