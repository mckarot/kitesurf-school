// src/utils/generateCourseSessions.ts
// Génère automatiquement les courseSessions à partir du schoolSchedule

import { db } from '../db/db';
import type { CourseSession, SchoolSchedule } from '../types';

/**
 * Génère les sessions de cours pour une période donnée
 * Basé sur les créneaux horaires de l'école (schoolSchedule)
 */
export async function generateCourseSessionsForPeriod(
  startDate: Date,
  endDate: Date,
  courseId?: number
): Promise<number> {
  let sessionsCreated = 0;

  // Récupérer tous les créneaux de l'école
  const schedules = await db.schoolSchedule
    .where('isActive')
    .equals(1)
    .toArray();

  // Récupérer tous les cours actifs
  const courses = courseId
    ? (await db.courses.where('id').equals(courseId).toArray()).filter(c => c.isActive === 1)
    : await db.courses.where('isActive').equals(1).toArray();

  if (courses.length === 0) {
    console.log('[generateCourseSessions] Aucun cours actif trouvé');
    return 0;
  }

  // Pour chaque jour dans la période
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay(); // 0 = Dimanche, 1 = Lundi, etc.
    
    if (dayOfWeek === 0) {
      // Dimanche fermé
      currentDate.setDate(currentDate.getDate() + 1);
      continue;
    }

    const dateStr = currentDate.toISOString().split('T')[0];

    // Pour chaque créneau horaire de ce jour
    const daySchedules = schedules.filter(s => s.dayOfWeek === dayOfWeek);
    
    for (const schedule of daySchedules) {
      // Pour chaque cours, créer une session
      for (const course of courses) {
        // Vérifier si la session existe déjà
        const existingSession = await db.courseSessions
          .where('[courseId+date+startTime]')
          .equals([course.id, dateStr, schedule.startTime])
          .first();

        if (!existingSession) {
          // Créer la session
          await db.courseSessions.add({
            courseId: course.id,
            date: dateStr,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            location: 'Plage de la Baule', // Default location
            maxStudents: 6, // Par défaut
            isActive: 1,
            createdAt: Date.now(),
          } as CourseSession);

          sessionsCreated++;
        }
      }
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  console.log(`[generateCourseSessions] ${sessionsCreated} sessions créées`);
  return sessionsCreated;
}

/**
 * Génère les sessions pour les 30 prochains jours
 * À appeler au chargement de la page Student
 */
export async function refreshCourseSessions(): Promise<void> {
  try {
    const today = new Date();
    const thirtyDaysLater = new Date(today);
    thirtyDaysLater.setDate(today.getDate() + 30);

    // Générer pour les 30 prochains jours
    await generateCourseSessionsForPeriod(today, thirtyDaysLater);

    console.log('[refreshCourseSessions] Sessions mises à jour pour les 30 prochains jours');
  } catch (error) {
    console.error('[refreshCourseSessions] Erreur:', error);
  }
}
