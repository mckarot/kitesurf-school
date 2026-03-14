// src/pages/Stats/index.tsx

import { useAuth } from '../../hooks/useAuth';
import { useStats } from '../../hooks/useStats';
import { StatsCard } from '../../components/Stats/StatsCard';
import { BarChart } from '../../components/Stats/BarChart';
import { PieChart } from '../../components/Stats/PieChart';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Navigate } from 'react-router-dom';

export function StatsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { stats, isLoading, filters, setFilters, refreshStats } = useStats();

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

  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a href="/admin" className="text-gray-600 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </a>
              <h1 className="text-xl font-bold text-gray-900">Statistiques</h1>
            </div>
            <Button variant="secondary" onClick={refreshStats} isLoading={isLoading}>
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualiser
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Date Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Date de début"
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value || undefined })}
            />
            <Input
              label="Date de fin"
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value || undefined })}
            />
            <div className="flex items-end">
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setFilters({ startDate: undefined, endDate: undefined })}
              >
                Réinitialiser
              </Button>
            </div>
          </div>
        </div>

        {isLoading && !stats ? (
          <div aria-busy="true" className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
            <p className="text-gray-600">Calcul des statistiques...</p>
          </div>
        ) : stats ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatsCard
                title="Réservations totales"
                value={stats.totalReservations}
                color="blue"
                icon={
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                }
              />
              <StatsCard
                title="Revenu total"
                value={`${stats.totalRevenue}€`}
                color="green"
                icon={
                  <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
              <StatsCard
                title="Étudiants actifs"
                value={stats.activeStudents}
                color="purple"
                icon={
                  <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                }
              />
              <StatsCard
                title="Cours actifs"
                value={stats.activeCourses}
                color="orange"
                icon={
                  <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                }
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Revenue by Month */}
              <BarChart
                title="Revenu par mois"
                data={stats.revenueByMonth.map((item) => ({
                  label: item.month,
                  value: item.revenue,
                }))}
                color="#3b82f6"
                formatValue={(v) => `${v}€`}
              />

              {/* Reservations by Level */}
              <PieChart
                title="Réservations par niveau"
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

            {/* Reservations by Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PieChart
                title="Réservations par statut"
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
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">Impossible de charger les statistiques</p>
          </div>
        )}
      </main>
    </div>
  );
}
