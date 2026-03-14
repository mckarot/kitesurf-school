// src/hooks/useTimeSlots.ts

import { useState, useCallback } from 'react';
import { db } from '../db/db';
import type { TimeSlot, CreateTimeSlotInput } from '../types';

interface UseTimeSlotsReturn {
  timeSlots: TimeSlot[];
  isLoading: boolean;
  error: Error | null;
  createTimeSlot: (input: CreateTimeSlotInput) => Promise<void>;
  updateTimeSlot: (id: number, updates: Partial<TimeSlot>) => Promise<void>;
  deleteTimeSlot: (id: number) => Promise<void>;
  getTimeSlotsByInstructor: (instructorId: number) => Promise<TimeSlot[]>;
  getTimeSlotsByDate: (date: string) => Promise<TimeSlot[]>;
  isSlotAvailable: (instructorId: number, date: string, startTime: string, endTime: string) => Promise<boolean>;
}

export function useTimeSlots(): UseTimeSlotsReturn {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadTimeSlots = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const loaded = await db.timeSlots.orderBy('createdAt').reverse().toArray();
      setTimeSlots(loaded);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to load time slots');
      setError(errorObj);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createTimeSlot = useCallback(async (input: CreateTimeSlotInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const timeSlotToAdd = {
        instructorId: input.instructorId,
        date: input.date,
        startTime: input.startTime,
        endTime: input.endTime,
        isAvailable: 1 as 0 | 1,
        createdAt: Date.now(),
      };
      // Dexie ajoute l'id automatiquement grâce à ++id dans le schema
      await db.timeSlots.add(timeSlotToAdd as any);
      await loadTimeSlots();
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to create time slot');
      setError(errorObj);
      throw errorObj;
    } finally {
      setIsLoading(false);
    }
  }, [loadTimeSlots]);

  const updateTimeSlot = useCallback(async (id: number, updates: Partial<TimeSlot>) => {
    setIsLoading(true);
    setError(null);
    try {
      await db.timeSlots.update(id, updates);
      await loadTimeSlots();
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to update time slot');
      setError(errorObj);
      throw errorObj;
    } finally {
      setIsLoading(false);
    }
  }, [loadTimeSlots]);

  const deleteTimeSlot = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await db.timeSlots.delete(id);
      await loadTimeSlots();
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to delete time slot');
      setError(errorObj);
      throw errorObj;
    } finally {
      setIsLoading(false);
    }
  }, [loadTimeSlots]);

  const getTimeSlotsByInstructor = useCallback(async (instructorId: number): Promise<TimeSlot[]> => {
    try {
      return await db.timeSlots
        .where('instructorId')
        .equals(instructorId)
        .sortBy('date');
    } catch {
      return [];
    }
  }, []);

  const getTimeSlotsByDate = useCallback(async (date: string): Promise<TimeSlot[]> => {
    try {
      return await db.timeSlots
        .where('date')
        .equals(date)
        .filter((slot) => slot.isAvailable === 1)
        .sortBy('startTime');
    } catch {
      return [];
    }
  }, []);

  const isSlotAvailable = useCallback(async (
    instructorId: number,
    date: string,
    startTime: string,
    endTime: string
  ): Promise<boolean> => {
    try {
      const slots = await db.timeSlots
        .where('instructorId')
        .equals(instructorId)
        .filter((slot) => {
          if (slot.date !== date) return false;
          if (slot.isAvailable !== 1) return false;
          
          // Check for overlap
          const existingStart = slot.startTime;
          const existingEnd = slot.endTime;
          
          // No overlap if new slot ends before existing starts OR new slot starts after existing ends
          return !(endTime <= existingStart || startTime >= existingEnd);
        })
        .toArray();
      
      return slots.length === 0;
    } catch {
      return false;
    }
  }, []);

  return {
    timeSlots,
    isLoading,
    error,
    createTimeSlot,
    updateTimeSlot,
    deleteTimeSlot,
    getTimeSlotsByInstructor,
    getTimeSlotsByDate,
    isSlotAvailable,
  };
}
