// src/pages/ReservationHistory/index.tsx

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useReservationHistory } from '../../hooks/useReservationHistory';
import { ReservationFilters } from '../../components/ReservationHistory/ReservationFilters';
import { ReservationItem } from '../../components/ReservationHistory/ReservationItem';
import { markReservationAsCompleted } from '../../utils/reservationUtils';
import { Navigate } from 'react-router-dom';
import { Calendar, Clock, Filter, XCircle, CheckCircle, History } from 'lucide-react';

export function ReservationHistoryPage() {
  // TOUS LES HOOKS EN PREMIER - AVANT TOUT RETURN
  const { user, isLoading: authLoading } = useAuth();
  const [showCompleted, setShowCompleted] = useState(true);
  const {
    filteredHistory,
    isLoading,
    filters,
    setFilters,
    clearFilters,
    loadHistory,
  } = useReservationHistory(
    user?.role === 'student' ? user.id : undefined,
    user?.role === 'instructor' ? user.id : undefined
  );

  // RETURNS CONDITIONNELS APRÈS TOUS LES HOOKS
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

  // CALCULS APRÈS LES HOOKS
  const isStudent = user.role === 'student';
  const isAdmin = user.role === 'admin';
  const isInstructor = user.role === 'instructor';
  const canComplete = isAdmin || isInstructor;

  const displayedHistory = showCompleted
    ? filteredHistory
    : filteredHistory.filter((r) => r.status !== 'completed');

  // FONCTION SIMPLE (PAS DE USECALLBACK)
  const handleMarkCompleted = async (reservationId: number) => {
    try {
      await markReservationAsCompleted(reservationId);
      await loadHistory();
    } catch (err) {
      console.error('Failed to mark reservation as completed:', err);
      alert('Échec de la mise à jour. Veuillez réessayer.');
    }
  };

  // RENDER
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
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="flex items-center space-x-3 mb-3"
              >
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <History className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold">
                  {isStudent ? 'Mon Historique' : 'Historique des Réservations'}
                </h1>
              </motion.div>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-blue-100 text-lg"
              >
                {isStudent 
                  ? 'Retrouvez toutes vos réservations de cours' 
                  : 'Gérez les réservations de tous les élèves'}
              </motion.p>
            </div>
            {!isStudent && (
              <motion.label
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="flex items-center space-x-3 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full cursor-pointer hover:bg-white/30 transition-all"
              >
                <input
                  type="checkbox"
                  checked={showCompleted}
                  onChange={(e) => setShowCompleted(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium">Terminées</span>
              </motion.label>
            )}
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-8">
        {/* Filters - only for admin/instructor */}
        {!isStudent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-8"
          >
            <div className="bg-white rounded-3xl shadow-xl p-6 border border-blue-100">
              <div className="flex items-center space-x-2 mb-4">
                <Filter className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-gray-900">Filtres</h2>
              </div>
              <ReservationFilters
                filters={filters}
                onChange={setFilters}
                onClear={clearFilters}
              />
            </div>
          </motion.div>
        )}

        {/* Loading state */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Chargement de l'historique...</p>
          </div>
        ) : (
          <>
            {/* Results count */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mb-6"
            >
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{displayedHistory.length}</h2>
                      <p className="text-gray-600">
                        réservation{displayedHistory.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  {(filters.searchQuery || filters.status || filters.startDate || filters.endDate) && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>Résultats filtrés</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* List */}
            {displayedHistory.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="bg-white rounded-3xl shadow-xl p-12 text-center border border-blue-100"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                  {filters.searchQuery || filters.status || filters.startDate || filters.endDate ? (
                    <XCircle className="w-10 h-10 text-gray-500" />
                  ) : isStudent ? (
                    <Calendar className="w-10 h-10 text-gray-500" />
                  ) : (
                    <History className="w-10 h-10 text-gray-500" />
                  )}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {filters.searchQuery || filters.status || filters.startDate || filters.endDate
                    ? 'Aucun résultat trouvé'
                    : isStudent
                    ? 'Aucune réservation'
                    : !showCompleted
                    ? 'Aucune réservation active'
                    : 'Aucune réservation'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {filters.searchQuery || filters.status || filters.startDate || filters.endDate ? (
                    <>
                      Essayez de <button onClick={clearFilters} className="text-blue-600 font-semibold hover:underline">modifier vos filtres</button>
                    </>
                  ) : isStudent ? (
                    "Réservez votre premier cours pour voir l'historique"
                  ) : !showCompleted ? (
                    "Activez l'option pour afficher les réservations terminées"
                  ) : (
                    "Les réservations apparaîtront ici"
                  )}
                </p>
                {isStudent && (
                  <a
                    href="/student"
                    className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all"
                  >
                    <Calendar className="w-5 h-5" />
                    <span>Réserver un cours</span>
                  </a>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="space-y-4"
              >
                {displayedHistory.map((reservation, index) => (
                  <motion.div
                    key={reservation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                  >
                    <ReservationItem
                      reservation={reservation}
                      showStudentName={!isStudent}
                      onMarkCompleted={canComplete ? handleMarkCompleted : undefined}
                      canComplete={canComplete}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
