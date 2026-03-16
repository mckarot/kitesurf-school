// src/pages/Stats/index.tsx
// Page Admin - Statistiques et analytiques
// Design Metalab harmonisé avec le reste du site

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useStats } from '../../hooks/useStats';
import { StatsCard } from '../../components/Stats/StatsCard';
import { BarChart } from '../../components/Stats/BarChart';
import { PieChart } from '../../components/Stats/PieChart';
import { Button } from '../../components/ui/Button';
import { Navigate } from 'react-router-dom';
import {
  TrendingUp,
  Calendar,
  Users,
  BookOpen,
  RefreshCcw,
  Euro,
  ChartBar,
  ChartPie
} from 'lucide-react';

export function StatsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { stats, isLoading, filters, setFilters, refreshStats } = useStats();
  const [showFilters, setShowFilters] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 flex items-center justify-center">
        <div aria-busy="true" aria-live="polite" className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100">
      {/* Hero Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 text-white"
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
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </motion.button>
              <div>
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="text-4xl md:text-5xl font-bold"
                >
                  Statistiques
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-orange-100 text-lg mt-2"
                >
                  Analysez les performances de l'école
                </motion.p>
              </div>
            </div>
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm text-white px-5 py-3 rounded-full font-semibold hover:bg-white/30 transition-all"
            >
              <Calendar className="w-5 h-5" />
              <span className="hidden sm:inline">Filtres</span>
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-8">
        {/* Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-8"
          >
            <div className="bg-white rounded-3xl shadow-xl p-6 border border-orange-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-400 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Période</h2>
                </div>
                <button
                  onClick={() => setFilters({ startDate: undefined, endDate: undefined })}
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                >
                  Réinitialiser
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de début
                  </label>
                  <input
                    type="date"
                    value={filters.startDate || ''}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value || undefined })}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de fin
                  </label>
                  <input
                    type="date"
                    value={filters.endDate || ''}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value || undefined })}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    variant="secondary"
                    onClick={() => setShowFilters(false)}
                    className="w-full"
                  >
                    Appliquer
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading && !stats ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-orange-600 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Calcul des statistiques...</p>
          </motion.div>
        ) : stats ? (
          <>
            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
              <div className="bg-white rounded-3xl shadow-xl p-6 border border-blue-100 hover:shadow-2xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Réservations totales</p>
                    <p className="text-4xl font-bold text-blue-600">{stats.totalReservations}</p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center">
                    <Calendar className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">Toutes périodes</p>
                  <button
                    onClick={refreshStats}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    aria-label="Actualiser"
                  >
                    <RefreshCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-xl p-6 border border-green-100 hover:shadow-2xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Revenu total</p>
                    <p className="text-4xl font-bold text-green-600">{stats.totalRevenue}€</p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-400 rounded-2xl flex items-center justify-center">
                    <Euro className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">Cumulé</p>
                  <button
                    onClick={refreshStats}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    aria-label="Actualiser"
                  >
                    <RefreshCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-xl p-6 border border-purple-100 hover:shadow-2xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Étudiants actifs</p>
                    <p className="text-4xl font-bold text-purple-600">{stats.activeStudents}</p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-400 rounded-2xl flex items-center justify-center">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">Inscrits</p>
                  <button
                    onClick={refreshStats}
                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    aria-label="Actualiser"
                  >
                    <RefreshCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-xl p-6 border border-orange-100 hover:shadow-2xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Cours actifs</p>
                    <p className="text-4xl font-bold text-orange-600">{stats.activeCourses}</p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-400 rounded-2xl flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">Disponibles</p>
                  <button
                    onClick={refreshStats}
                    className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                    aria-label="Actualiser"
                  >
                    <RefreshCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Charts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
            >
              {/* Revenue by Month */}
              <div className="bg-white rounded-3xl shadow-xl p-6 border border-blue-100">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center">
                      <ChartBar className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Revenu par mois</h3>
                  </div>
                </div>
                <BarChart
                  data={stats.revenueByMonth.map((item) => ({
                    label: item.month,
                    value: item.revenue,
                  }))}
                  color="#3b82f6"
                  formatValue={(v) => `${v}€`}
                  height={250}
                />
              </div>

              {/* Reservations by Level */}
              <div className="bg-white rounded-3xl shadow-xl p-6 border border-purple-100">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-400 rounded-xl flex items-center justify-center">
                      <ChartPie className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Réservations par niveau</h3>
                  </div>
                </div>
                <PieChart
                  data={stats.reservationsByLevel.map((item, index) => {
                    const colors = ['#3b82f6', '#10b981', '#f59e0b'];
                    return {
                      label: item.level,
                      value: item.count,
                      color: colors[index % colors.length],
                    };
                  })}
                  size={220}
                />
              </div>
            </motion.div>

            {/* Reservations by Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <div className="bg-white rounded-3xl shadow-xl p-6 border border-green-100">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-400 rounded-xl flex items-center justify-center">
                      <ChartPie className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Réservations par statut</h3>
                  </div>
                </div>
                <div className="flex justify-center">
                  <PieChart
                    data={stats.reservationsByStatus.map((item, index) => {
                      const colors = ['#f59e0b', '#10b981', '#ef4444', '#6b7280'];
                      return {
                        label: item.status,
                        value: item.count,
                        color: colors[index % colors.length],
                      };
                    })}
                    size={220}
                  />
                </div>
              </div>
            </motion.div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-10 h-10 text-white" />
            </div>
            <p className="text-gray-600 font-medium">Impossible de charger les statistiques</p>
            <button
              onClick={refreshStats}
              className="mt-4 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-full hover:shadow-lg transition-all"
            >
              Réessayer
            </button>
          </motion.div>
        )}
      </main>
    </div>
  );
}

export default StatsPage;
