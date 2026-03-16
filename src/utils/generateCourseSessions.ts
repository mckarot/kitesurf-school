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
 * Génère les sessions pour les 365 prochains jours (1 an)
 * À appeler au chargement de la page Student
 * 
 * Génère automatiquement une nouvelle année de sessions au 1er janvier
 */
export async function refreshCourseSessions(): Promise<void> {
  try {
    const today = new Date();
    
    // Vérifier si c'est le 1er janvier - si oui, générer toute l'année
    const isFirstDayOfYear = today.getMonth() === 0 && today.getDate() === 1;
    const daysToGenerate = isFirstDayOfYear ? 365 : 90;
    
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + daysToGenerate);

    // Générer pour la période spécifiée
    await generateCourseSessionsForPeriod(today, endDate);

    console.log(`[refreshCourseSessions] Sessions mises à jour pour les ${daysToGenerate} prochains jours`);
    
    if (isFirstDayOfYear) {
      console.log('[refreshCourseSessions] 🎉 Génération automatique de l\'année complète (1er janvier détecté)');
    }
  } catch (error) {
    console.error('[refreshCourseSessions] Erreur:', error);
  }
}

/**
 * Génère les sessions pour 365 jours (1 an complet)
 * Utilisé pour la génération initiale ou manuelle
 */
export async function generateFullYearSessions(year?: number): Promise<number> {
  try {
    const targetYear = year || new Date().getFullYear();
    const startDate = new Date(targetYear, 0, 1); // 1er janvier
    const endDate = new Date(targetYear, 11, 31); // 31 décembre
    
    console.log(`[generateFullYearSessions] Génération des sessions pour l'année ${targetYear}`);
    
    return await generateCourseSessionsForPeriod(startDate, endDate);
  } catch (error) {
    console.error('[generateFullYearSessions] Erreur:', error);
    return 0;
  }
}
