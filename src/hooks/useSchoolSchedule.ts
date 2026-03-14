// src/hooks/useSchoolSchedule.ts
// Hook pour la gestion des emplois du temps de l'école (Admin)

import { useState, useCallback } from 'react';
import { db } from '../db/db';
import type { SchoolSchedule, CreateSchoolScheduleInput } from '../types';

interface UseSchoolScheduleReturn {
  schedules: SchoolSchedule[];
  isLoading: boolean;
  error: Error | null;
  loadSchedules: () => Promise<void>;
  createSchedule: (input: CreateSchoolScheduleInput) => Promise<void>;
  updateSchedule: (id: number, updates: Partial<SchoolSchedule>) => Promise<void>;
  deleteSchedule: (id: number) => Promise<void>;
  getSchedulesByDay: (dayOfWeek: number) => Promise<SchoolSchedule[]>;
  getActiveSchedules: () => Promise<SchoolSchedule[]>;
  resetToDefaults: () => Promise<void>;
}

export function useSchoolSchedule(): UseSchoolScheduleReturn {
  const [schedules, setSchedules] = useState<SchoolSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadSchedules = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const loaded = await db.schoolSchedule.orderBy('createdAt').reverse().toArray();
      setSchedules(loaded);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Échec du chargement des emplois du temps');
      setError(errorObj);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createSchedule = useCallback(async (input: CreateSchoolScheduleInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const scheduleToAdd: Omit<SchoolSchedule, 'id'> = {
        dayOfWeek: input.dayOfWeek,
        startTime: input.startTime,
        endTime: input.endTime,
        isActive: 1,
        createdAt: Date.now(),
      };
      await db.schoolSchedule.add(scheduleToAdd as SchoolSchedule);
      await loadSchedules();
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Échec de la création du créneau');
      setError(errorObj);
      throw errorObj;
    } finally {
      setIsLoading(false);
    }
  }, [loadSchedules]);

  const updateSchedule = useCallback(async (id: number, updates: Partial<SchoolSchedule>) => {
    setIsLoading(true);
    setError(null);
    try {
      await db.schoolSchedule.update(id, updates);
      await loadSchedules();
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Échec de la modification du créneau');
      setError(errorObj);
      throw errorObj;
    } finally {
      setIsLoading(false);
    }
  }, [loadSchedules]);

  const deleteSchedule = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await db.schoolSchedule.delete(id);
      await loadSchedules();
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Échec de la suppression du créneau');
      setError(errorObj);
      throw errorObj;
    } finally {
      setIsLoading(false);
    }
  }, [loadSchedules]);

  const getSchedulesByDay = useCallback(async (dayOfWeek: number): Promise<SchoolSchedule[]> => {
    try {
      return await db.schoolSchedule
        .where('dayOfWeek')
        .equals(dayOfWeek)
        .and((slot) => slot.isActive === 1)
        .sortBy('startTime');
    } catch {
      return [];
    }
  }, []);

  const getActiveSchedules = useCallback(async (): Promise<SchoolSchedule[]> => {
    try {
      return await db.schoolSchedule
        .where('isActive')
        .equals(1)
        .sortBy('dayOfWeek');
    } catch {
      return [];
    }
  }, []);

  const resetToDefaults = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Supprimer tous les créneaux existants
      await db.schoolSchedule.clear();

      // Recréer les 18 créneaux par défaut (3 créneaux × 6 jours)
      const defaultSchedules: Omit<SchoolSchedule, 'id'>[] = [
        // Lundi (dayOfWeek = 1)
        { dayOfWeek: 1, startTime: '08:30', endTime: '11:00', isActive: 1, createdAt: Date.now() },
        { dayOfWeek: 1, startTime: '11:30', endTime: '14:00', isActive: 1, createdAt: Date.now() },
        { dayOfWeek: 1, startTime: '14:30', endTime: '17:00', isActive: 1, createdAt: Date.now() },
        // Mardi (dayOfWeek = 2)
        { dayOfWeek: 2, startTime: '08:30', endTime: '11:00', isActive: 1, createdAt: Date.now() },
        { dayOfWeek: 2, startTime: '11:30', endTime: '14:00', isActive: 1, createdAt: Date.now() },
        { dayOfWeek: 2, startTime: '14:30', endTime: '17:00', isActive: 1, createdAt: Date.now() },
        // Mercredi (dayOfWeek = 3)
        { dayOfWeek: 3, startTime: '08:30', endTime: '11:00', isActive: 1, createdAt: Date.now() },
        { dayOfWeek: 3, startTime: '11:30', endTime: '14:00', isActive: 1, createdAt: Date.now() },
        { dayOfWeek: 3, startTime: '14:30', endTime: '17:00', isActive: 1, createdAt: Date.now() },
        // Jeudi (dayOfWeek = 4)
        { dayOfWeek: 4, startTime: '08:30', endTime: '11:00', isActive: 1, createdAt: Date.now() },
        { dayOfWeek: 4, startTime: '11:30', endTime: '14:00', isActive: 1, createdAt: Date.now() },
        { dayOfWeek: 4, startTime: '14:30', endTime: '17:00', isActive: 1, createdAt: Date.now() },
        // Vendredi (dayOfWeek = 5)
        { dayOfWeek: 5, startTime: '08:30', endTime: '11:00', isActive: 1, createdAt: Date.now() },
        { dayOfWeek: 5, startTime: '11:30', endTime: '14:00', isActive: 1, createdAt: Date.now() },
        { dayOfWeek: 5, startTime: '14:30', endTime: '17:00', isActive: 1, createdAt: Date.now() },
        // Samedi (dayOfWeek = 6)
        { dayOfWeek: 6, startTime: '08:30', endTime: '11:00', isActive: 1, createdAt: Date.now() },
        { dayOfWeek: 6, startTime: '11:30', endTime: '14:00', isActive: 1, createdAt: Date.now() },
        { dayOfWeek: 6, startTime: '14:30', endTime: '17:00', isActive: 1, createdAt: Date.now() },
      ];

      await db.schoolSchedule.bulkAdd(defaultSchedules as SchoolSchedule[]);
      await loadSchedules();
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Échec de la réinitialisation des créneaux par défaut');
      setError(errorObj);
      throw errorObj;
    } finally {
      setIsLoading(false);
    }
  }, [loadSchedules]);

  return {
    schedules,
    isLoading,
    error,
    loadSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    getSchedulesByDay,
    getActiveSchedules,
    resetToDefaults,
  };
}
