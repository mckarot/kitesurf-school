// src/hooks/useAvailableSessions.ts
// Hook pour récupérer les sessions disponibles pour un cours donné

import { useState, useEffect, useCallback } from 'react';
import { db } from '../db/db';
import type { CourseSession, SchoolSchedule, InstructorAvailability } from '../types';

interface UseAvailableSessionsReturn {
  sessions: CourseSession[];
  isLoading: boolean;
  error: Error | null;
  loadSessionsForCourse: (courseId: number, instructorId: number, startDate: string, endDate: string) => Promise<void>;
}

/**
 * Hook pour récupérer les sessions disponibles pour un cours
 * 
 * Logique :
 * 1. Récupère les SchoolSchedule (créneaux de l'école)
 * 2. Vérifie les InstructorAvailability (blocages moniteur)
 * 3. Génère les CourseSession pour la période demandée
 * 
 * @returns UseAvailableSessionsReturn
 */
export function useAvailableSessions(): UseAvailableSessionsReturn {
  const [sessions, setSessions] = useState<CourseSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadSessionsForCourse = useCallback(async (
    courseId: number,
    instructorId: number,
    startDate: string,
    endDate: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('[useAvailableSessions] Chargement des sessions pour le cours', courseId);

      // 1. Récupérer tous les créneaux de l'école (Lundi-Samedi)
      const schoolSchedules = await db.schoolSchedule
        .where('isActive')
        .equals(1)
        .toArray();

      console.log('[useAvailableSessions] SchoolSchedule trouvés:', schoolSchedules.length);

      if (schoolSchedules.length === 0) {
        setError(new Error('Aucun créneau horaire configuré par l\'école. Contactez l\'administrateur.'));
        setIsLoading(false);
        return;
      }

      // 2. Pour chaque jour entre startDate et endDate
      const generatedSessions: CourseSession[] = [];
      const start = new Date(startDate);
      const end = new Date(endDate);

      console.log('[useAvailableSessions] Période:', startDate, '→', endDate);

      for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        const dayOfWeek = date.getDay(); // 0=Dimanche, 1=Lundi, ..., 6=Samedi

        // Skip Dimanche (dayOfWeek = 0)
        if (dayOfWeek === 0) continue;

        const dateStr = date.toISOString().split('T')[0];

        // 3. Récupérer les créneaux de l'école pour ce jour
        const daySchedules = schoolSchedules.filter(s => s.dayOfWeek === dayOfWeek);

        console.log(`[useAvailableSessions] Jour ${dayOfWeek}, ${dateStr}: ${daySchedules.length} créneaux`);

        // 4. Récupérer les indisponibilités du moniteur pour cette date
        const instructorAvailabilities = await db.instructorAvailability
          .where('[instructorId+date]')
          .equals([instructorId, dateStr])
          .toArray();

        // 5. Pour chaque créneau, vérifier si le moniteur est disponible
        for (const schedule of daySchedules) {
          const availability = instructorAvailabilities.find(
            a => a.scheduleId === schedule.id
          );

          // Si le moniteur a bloqué ce créneau (isAvailable = 0), on skip
          if (availability && availability.isAvailable === 0) {
            console.log('[useAvailableSessions] Créneau bloqué:', schedule.startTime, '-', schedule.endTime, 'Raison:', availability.reason);
            continue;
          }

          // 6. Vérifier si une session existe déjà pour ce créneau
          const existingSession = await db.courseSessions
            .where('[courseId+date+startTime]')
            .equals([courseId, dateStr, schedule.startTime])
            .first();

          if (existingSession) {
            generatedSessions.push(existingSession);
          } else {
            // 7. Créer une nouvelle session
            const newSession: Omit<CourseSession, 'id'> = {
              courseId,
              date: dateStr,
              startTime: schedule.startTime,
              endTime: schedule.endTime,
              location: 'À définir',
              maxStudents: 10,
              isActive: 1,
              createdAt: Date.now(),
            };

            const id = await db.courseSessions.add(newSession as CourseSession);
            generatedSessions.push({ ...newSession, id } as CourseSession);
          }
        }
      }

      console.log('[useAvailableSessions] Sessions générées:', generatedSessions.length);
      setSessions(generatedSessions);
    } catch (err) {
      console.error('[useAvailableSessions] Erreur:', err);
      const errorObj = err instanceof Error ? err : new Error('Échec du chargement des sessions');
      setError(errorObj);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    sessions,
    isLoading,
    error,
    loadSessionsForCourse,
  };
}
