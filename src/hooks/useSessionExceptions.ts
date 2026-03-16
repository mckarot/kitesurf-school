// src/hooks/useSessionExceptions.ts
// Hook pour gérer les exceptions aux sessions (annulations, modifications)

import { useState, useCallback } from 'react';
import { db } from '../db/db';
import type { SessionException, CreateSessionExceptionInput, SessionExceptionWithDetails } from '../types';

interface UseSessionExceptionsReturn {
  exceptions: SessionException[];
  isLoading: boolean;
  error: Error | null;
  createException: (input: CreateSessionExceptionInput) => Promise<void>;
  createExceptionsForPeriod: (
    sessionId: number,
    startDate: string,
    endDate: string,
    type: 'cancelled' | 'modified',
    reason: string
  ) => Promise<number>;
  deleteException: (id: number) => Promise<void>;
  getExceptionsForSession: (sessionId: number) => Promise<SessionException[]>;
  getExceptionsForDate: (date: string) => Promise<SessionException[]>;
}

/**
 * Hook pour gérer les exceptions aux sessions de cours
 * 
 * Cas d'usage :
 * - Annuler des sessions pour congés, fériés, météo
 * - Garder l'historique des annulations
 * - Déclencher les remboursements automatiques
 */
export function useSessionExceptions(): UseSessionExceptionsReturn {
  const [exceptions, setExceptions] = useState<SessionException[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Crée une exception pour une session spécifique
   */
  const createException = useCallback(async (input: CreateSessionExceptionInput) => {
    setIsLoading(true);
    setError(null);
    try {
      await db.sessionExceptions.add({
        ...input,
        createdAt: Date.now(),
      } as SessionException);
      
      // Rafraîchir la liste
      const updated = await db.sessionExceptions.toArray();
      setExceptions(updated);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur inconnue');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Crée des exceptions pour une période donnée
   * Utile pour annuler toutes les sessions d'une période (congés d'été par exemple)
   * 
   * @returns Nombre d'exceptions créées
   */
  const createExceptionsForPeriod = useCallback(async (
    sessionId: number,
    startDate: string,
    endDate: string,
    type: 'cancelled' | 'modified',
    reason: string
  ): Promise<number> => {
    setIsLoading(true);
    setError(null);
    try {
      // Récupérer toutes les sessions dans la période
      const allSessions = await db.courseSessions.toArray();
      const sessionsInPeriod = allSessions.filter(session => {
        if (!session.isActive) return false;
        if (session.courseId !== sessionId) return false;
        
        const sessionDate = session.date;
        return sessionDate >= startDate && sessionDate <= endDate;
      });

      // Créer une exception pour chaque session
      const exceptionsToCreate = sessionsInPeriod.map(session => ({
        sessionId: session.id,
        type,
        reason,
        date: session.date,
        createdAt: Date.now(),
      }));

      if (exceptionsToCreate.length === 0) {
        setIsLoading(false);
        return 0;
      }

      await db.sessionExceptions.bulkAdd(exceptionsToCreate as SessionException[]);
      
      // Rafraîchir la liste
      const updated = await db.sessionExceptions.toArray();
      setExceptions(updated);
      
      return exceptionsToCreate.length;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur inconnue');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Supprime une exception
   */
  const deleteException = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await db.sessionExceptions.delete(id);
      
      // Rafraîchir la liste
      const updated = await db.sessionExceptions.toArray();
      setExceptions(updated);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur inconnue');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Récupère les exceptions pour une session spécifique
   */
  const getExceptionsForSession = useCallback(async (sessionId: number): Promise<SessionException[]> => {
    try {
      const result = await db.sessionExceptions
        .where('sessionId')
        .equals(sessionId)
        .toArray();
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur inconnue');
      setError(error);
      return [];
    }
  }, []);

  /**
   * Récupère les exceptions pour une date spécifique
   */
  const getExceptionsForDate = useCallback(async (date: string): Promise<SessionException[]> => {
    try {
      const result = await db.sessionExceptions
        .where('date')
        .equals(date)
        .toArray();
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur inconnue');
      setError(error);
      return [];
    }
  }, []);

  return {
    exceptions,
    isLoading,
    error,
    createException,
    createExceptionsForPeriod,
    deleteException,
    getExceptionsForSession,
    getExceptionsForDate,
  };
}
