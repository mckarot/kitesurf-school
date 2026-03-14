// src/hooks/useReservations.ts

import { useState, useCallback } from 'react';
import { db } from '../db/db';
import type { Reservation, CreateReservationInput } from '../types';

interface UseReservationsReturn {
  reservations: Reservation[];
  isLoading: boolean;
  error: Error | null;
  createReservation: (input: CreateReservationInput) => Promise<void>;
  updateReservationStatus: (id: number, status: Reservation['status']) => Promise<void>;
  getReservationCount: (courseId: number) => Promise<number>;
}

export function useReservations(): UseReservationsReturn {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadReservations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const loaded = await db.reservations.orderBy('createdAt').reverse().toArray();
      setReservations(loaded);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to load reservations');
      setError(errorObj);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createReservation = useCallback(async (input: CreateReservationInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const reservationToAdd = {
        studentId: input.studentId,
        courseId: input.courseId,
        status: 'pending' as 'pending' | 'confirmed' | 'cancelled',
        createdAt: Date.now(),
      };
      // Dexie ajoute l'id automatiquement grâce à ++id dans le schema
      await db.reservations.add(reservationToAdd as any);
      await loadReservations();
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to create reservation');
      setError(errorObj);
      throw errorObj;
    } finally {
      setIsLoading(false);
    }
  }, [loadReservations]);

  const updateReservationStatus = useCallback(async (id: number, status: Reservation['status']) => {
    setIsLoading(true);
    setError(null);
    try {
      await db.reservations.update(id, { status });
      await loadReservations();
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to update reservation');
      setError(errorObj);
      throw errorObj;
    } finally {
      setIsLoading(false);
    }
  }, [loadReservations]);

  const getReservationCount = useCallback(async (courseId: number): Promise<number> => {
    try {
      const count = await db.reservations
        .where('courseId')
        .equals(courseId)
        .filter((r) => r.status !== 'cancelled')
        .count();
      return count;
    } catch (err) {
      return 0;
    }
  }, []);

  return { reservations, isLoading, error, createReservation, updateReservationStatus, getReservationCount };
}
