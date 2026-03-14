// src/hooks/useStats.ts

import { useState, useCallback, useEffect } from 'react';
import { db } from '../db/db';
import type { StatsData, StatsFilter } from '../types';
import { buildStatsData, filterReservationsByDateRange } from '../utils/statsUtils';

interface UseStatsReturn {
  stats: StatsData | null;
  isLoading: boolean;
  error: Error | null;
  filters: StatsFilter;
  setFilters: (filters: StatsFilter) => void;
  refreshStats: () => Promise<void>;
}

const defaultFilters: StatsFilter = {
  startDate: undefined,
  endDate: undefined,
};

export function useStats(): UseStatsReturn {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFiltersState] = useState<StatsFilter>(defaultFilters);

  const calculateStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const reservations = await db.reservations.toArray();
      const courses = await db.courses.toArray();
      const users = await db.users.toArray();

      // Apply date filters
      const filteredReservations = filterReservationsByDateRange(
        reservations,
        filters.startDate,
        filters.endDate
      );

      const statsData = buildStatsData(filteredReservations, courses, users);
      setStats(statsData);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to calculate statistics');
      setError(errorObj);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Calculate stats on mount and when filters change
  useEffect(() => {
    calculateStats();
  }, [calculateStats]);

  const setFilters = useCallback((newFilters: StatsFilter) => {
    setFiltersState(newFilters);
  }, []);

  const refreshStats = useCallback(async () => {
    await calculateStats();
  }, [calculateStats]);

  return {
    stats,
    isLoading,
    error,
    filters,
    setFilters,
    refreshStats,
  };
}
