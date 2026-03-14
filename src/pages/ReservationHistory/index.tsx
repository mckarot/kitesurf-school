// src/pages/ReservationHistory/index.tsx

import { useState, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useReservationHistory } from '../../hooks/useReservationHistory';
import { ReservationFilters } from '../../components/ReservationHistory/ReservationFilters';
import { ReservationItem } from '../../components/ReservationHistory/ReservationItem';
import { markReservationAsCompleted } from '../../utils/reservationUtils';
import { Navigate } from 'react-router-dom';

export function ReservationHistoryPage() {
  const { user, isLoading: authLoading } = useAuth();
  const {
    filteredHistory,
    isLoading,
    filters,
    setFilters,
    clearFilters,
    loadHistory,
  } = useReservationHistory(user?.role === 'student' ? user.id : undefined);
  
  const [showCompleted, setShowCompleted] = useState(true);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div aria-busy="true" aria-live="polite" className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/dashboard" replace />;
  }

  const isStudent = user.role === 'student';
  const isAdmin = user.role === 'admin';
  const isInstructor = user.role === 'instructor';
  const canComplete = isAdmin || isInstructor;

  // Filter out completed if toggle is off
  const displayedHistory = showCompleted
    ? filteredHistory
    : filteredHistory.filter((r) => r.status !== 'completed');

  const handleMarkCompleted = useCallback(async (reservationId: number) => {
    try {
      await markReservationAsCompleted(reservationId);
      await loadHistory(); // Reload to show updated status
    } catch (err) {
      console.error('Failed to mark reservation as completed:', err);
      alert('Échec de la mise à jour. Veuillez réessayer.');
    }
  }, [loadHistory]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a href={isStudent ? '/student' : isAdmin ? '/admin' : '/instructor'} className="text-gray-600 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </a>
              <h1 className="text-xl font-bold text-gray-900">
                {isStudent ? 'Mon historique' : 'Historique des réservations'}
              </h1>
            </div>
            {!isStudent && (
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showCompleted}
                  onChange={(e) => setShowCompleted(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">Afficher les réservations terminées</span>
              </label>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters - only for admin/instructor */}
        {!isStudent && (
          <ReservationFilters
            filters={filters}
            onChange={setFilters}
            onClear={clearFilters}
          />
        )}

        {/* Loading state */}
        {isLoading ? (
          <div aria-busy="true" className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
            <p className="text-gray-600">Chargement de l'historique...</p>
          </div>
        ) : (
          <>
            {/* Results count */}
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                {displayedHistory.length} réservation{displayedHistory.length > 1 ? 's' : ''}
                {filters.searchQuery || filters.status || filters.startDate || filters.endDate
                  ? ' (filtrée' + (displayedHistory.length > 1 ? 's' : '') + ')'
                  : ''}
              </p>
            </div>

            {/* List */}
            {displayedHistory.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <svg
                  className="w-16 h-16 text-gray-300 mx-auto mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <p className="text-gray-600 mb-2">Aucune réservation trouvée</p>
                {filters.searchQuery || filters.status || filters.startDate || filters.endDate ? (
                  <p className="text-sm text-gray-500">
                    Essayez de modifier vos filtres
                  </p>
                ) : isStudent ? (
                  <p className="text-sm text-gray-500">
                    Réservez votre premier cours pour voir l'historique
                  </p>
                ) : !showCompleted ? (
                  <p className="text-sm text-gray-500">
                    Activez l'option pour afficher les réservations terminées
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="space-y-4">
                {displayedHistory.map((reservation) => (
                  <ReservationItem
                    key={reservation.id}
                    reservation={reservation}
                    showStudentName={!isStudent}
                    onMarkCompleted={canComplete ? handleMarkCompleted : undefined}
                    canComplete={canComplete}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
