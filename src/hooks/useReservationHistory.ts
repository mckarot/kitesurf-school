// src/hooks/useReservationHistory.ts

import { useState, useCallback, useEffect } from 'react';
import { db } from '../db/db';
import type { ReservationHistoryItem, Reservation, Course, User, CourseSession } from '../types';

interface UseReservationHistoryReturn {
  history: ReservationHistoryItem[];
  filteredHistory: ReservationHistoryItem[];
  isLoading: boolean;
  error: Error | null;
  filters: ReservationHistoryFilters;
  setFilters: (filters: ReservationHistoryFilters) => void;
  clearFilters: () => void;
  loadHistory: () => Promise<void>;
}

interface ReservationHistoryFilters {
  status?: string;
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
}

const defaultFilters: ReservationHistoryFilters = {
  status: undefined,
  startDate: undefined,
  endDate: undefined,
  searchQuery: '',
};

export function useReservationHistory(userId?: number): UseReservationHistoryReturn {
  const [history, setHistory] = useState<ReservationHistoryItem[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<ReservationHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFiltersState] = useState<ReservationHistoryFilters>(defaultFilters);

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const reservations = await db.reservations.orderBy('createdAt').reverse().toArray();
      const courses = await db.courses.toArray();
      const users = await db.users.toArray();
      const sessions = await db.courseSessions.toArray();

      const historyItems: ReservationHistoryItem[] = reservations.map((reservation) => {
        const course = courses.find((c) => c.id === reservation.courseId);
        const student = users.find((u) => u.id === reservation.studentId);
        const session = sessions.find((s) => s.courseId === reservation.courseId);

        return {
          id: reservation.id,
          reservationId: reservation.id,
          studentId: reservation.studentId,
          studentName: student
            ? `${student.firstName} ${student.lastName}`
            : `Étudiant #${reservation.studentId}`,
          courseId: reservation.courseId,
          courseTitle: course?.title || `Cours #${reservation.courseId}`,
          date: session?.date || new Date(reservation.createdAt).toISOString().split('T')[0],
          startTime: session?.startTime || 'N/A',
          endTime: session?.endTime || 'N/A',
          location: session?.location || 'Non défini',
          status: reservation.status,
          createdAt: reservation.createdAt,
        };
      });

      // Filter by userId if provided (for student view)
      const filtered = userId
        ? historyItems.filter((item) => item.studentId === userId)
        : historyItems;

      setHistory(filtered);
      setFilteredHistory(filtered);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to load reservation history');
      setError(errorObj);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Apply filters when they change
  useEffect(() => {
    let result = [...history];

    // Filter by status
    if (filters.status && filters.status !== 'all') {
      result = result.filter((item) => item.status === filters.status);
    }

    // Filter by date range
    if (filters.startDate) {
      result = result.filter((item) => item.date >= filters.startDate!);
    }
    if (filters.endDate) {
      result = result.filter((item) => item.date <= filters.endDate!);
    }

    // Filter by search query
    if (filters.searchQuery && filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.courseTitle.toLowerCase().includes(query) ||
          item.studentName.toLowerCase().includes(query) ||
          item.location.toLowerCase().includes(query)
      );
    }

    setFilteredHistory(result);
  }, [filters, history]);

  const setFilters = useCallback((newFilters: ReservationHistoryFilters) => {
    setFiltersState(newFilters);
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState(defaultFilters);
  }, []);

  return {
    history,
    filteredHistory,
    isLoading,
    error,
    filters,
    setFilters,
    clearFilters,
    loadHistory,
  };
}
