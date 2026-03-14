// src/hooks/useInstructorAvailability.ts
// Hook pour la gestion des indisponibilités des moniteurs

import { useState, useCallback } from 'react';
import { db } from '../db/db';
import type { InstructorAvailability, CreateInstructorAvailabilityInput } from '../types';

interface UseInstructorAvailabilityReturn {
  availabilities: InstructorAvailability[];
  isLoading: boolean;
  error: Error | null;
  setAvailability: (input: CreateInstructorAvailabilityInput) => Promise<void>;
  updateAvailability: (id: number, updates: Partial<InstructorAvailability>) => Promise<void>;
  deleteAvailability: (id: number) => Promise<void>;
  getAvailabilityForDate: (instructorId: number, date: string) => Promise<InstructorAvailability[]>;
  isSlotAvailable: (instructorId: number, date: string, scheduleId: number) => Promise<boolean>;
  getAvailableSlotsForDate: (instructorId: number, date: string) => Promise<number[]>;
}

export function useInstructorAvailability(): UseInstructorAvailabilityReturn {
  const [availabilities, setAvailabilities] = useState<InstructorAvailability[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadAvailabilities = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const loaded = await db.instructorAvailability.orderBy('createdAt').reverse().toArray();
      setAvailabilities(loaded);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Échec du chargement des indisponibilités');
      setError(errorObj);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setAvailability = useCallback(async (input: CreateInstructorAvailabilityInput) => {
    setIsLoading(true);
    setError(null);
    try {
      // Vérifier si une entrée existe déjà pour cette combinaison
      const existing = await db.instructorAvailability
        .where('[instructorId+date+scheduleId]')
        .equals([input.instructorId, input.date, input.scheduleId])
        .first();

      if (existing) {
        // Mettre à jour l'entrée existante
        await db.instructorAvailability.update(existing.id, {
          isAvailable: input.isAvailable,
          reason: input.reason,
        });
      } else {
        // Créer une nouvelle entrée
        const availabilityToAdd: Omit<InstructorAvailability, 'id'> = {
          instructorId: input.instructorId,
          date: input.date,
          scheduleId: input.scheduleId,
          isAvailable: input.isAvailable,
          reason: input.reason,
          createdAt: Date.now(),
        };
        await db.instructorAvailability.add(availabilityToAdd as InstructorAvailability);
      }
      await loadAvailabilities();
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Échec de la définition de l\'indisponibilité');
      setError(errorObj);
      throw errorObj;
    } finally {
      setIsLoading(false);
    }
  }, [loadAvailabilities]);

  const updateAvailability = useCallback(async (id: number, updates: Partial<InstructorAvailability>) => {
    setIsLoading(true);
    setError(null);
    try {
      await db.instructorAvailability.update(id, updates);
      await loadAvailabilities();
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Échec de la modification de l\'indisponibilité');
      setError(errorObj);
      throw errorObj;
    } finally {
      setIsLoading(false);
    }
  }, [loadAvailabilities]);

  const deleteAvailability = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await db.instructorAvailability.delete(id);
      await loadAvailabilities();
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Échec de la suppression de l\'indisponibilité');
      setError(errorObj);
      throw errorObj;
    } finally {
      setIsLoading(false);
    }
  }, [loadAvailabilities]);

  const getAvailabilityForDate = useCallback(async (instructorId: number, date: string): Promise<InstructorAvailability[]> => {
    try {
      return await db.instructorAvailability
        .where('date')
        .equals(date)
        .and((avail) => avail.instructorId === instructorId)
        .toArray();
    } catch {
      return [];
    }
  }, []);

  const isSlotAvailable = useCallback(async (instructorId: number, date: string, scheduleId: number): Promise<boolean> => {
    try {
      const availability = await db.instructorAvailability
        .where('[instructorId+date+scheduleId]')
        .equals([instructorId, date, scheduleId])
        .first();

      // Si aucune entrée n'existe, le créneau est disponible par défaut
      // Si une entrée existe, on vérifie isAvailable
      return !availability || availability.isAvailable === 1;
    } catch {
      return false;
    }
  }, []);

  const getAvailableSlotsForDate = useCallback(async (instructorId: number, date: string): Promise<number[]> => {
    try {
      // Récupérer tous les créneaux de l'école pour le jour de la semaine correspondant
      const dateObj = new Date(date);
      let dayOfWeek = dateObj.getDay();
      // Convertir Sunday (0) à 6, Monday (1) à 1, ..., Saturday (6) à 6
      // Notre système: 1=Lundi, 2=Mardi, ..., 6=Samedi
      if (dayOfWeek === 0) {
        dayOfWeek = 6; // Dimanche -> Samedi (pas de cours le dimanche)
      }

      const schoolSchedules = await db.schoolSchedule
        .where('dayOfWeek')
        .equals(dayOfWeek)
        .and((slot) => slot.isActive === 1)
        .toArray();

      // Filtrer les créneaux disponibles
      const availableSlotIds: number[] = [];
      for (const schedule of schoolSchedules) {
        const isAvailable = await isSlotAvailable(instructorId, date, schedule.id);
        if (isAvailable) {
          availableSlotIds.push(schedule.id);
        }
      }

      return availableSlotIds;
    } catch {
      return [];
    }
  }, [isSlotAvailable]);

  return {
    availabilities,
    isLoading,
    error,
    setAvailability,
    updateAvailability,
    deleteAvailability,
    getAvailabilityForDate,
    isSlotAvailable,
    getAvailableSlotsForDate,
  };
}
