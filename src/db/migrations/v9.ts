// src/db/migrations/v9.ts
// Migration v9 : Ajout des tables SchoolSchedule et InstructorAvailability
// Nouveau système de gestion des emplois du temps

import type { KiteSurfDB } from '../db';

/**
 * Configure la migration V9 de la base de données
 *
 * Changements :
 * - Ajout de la table schoolSchedule (emploi du temps de base de l'école)
 * - Ajout de la table instructorAvailability (indisponibilités des moniteurs)
 *
 * SchoolSchedule :
 * - Géré par l'admin
 * - Définit les créneaux de cours standards (Lundi à Samedi)
 * - 3 créneaux par jour : 08:30-11:00, 11:30-14:00, 14:30-17:00
 *
 * InstructorAvailability :
 * - Géré par les moniteurs
 * - Permet de bloquer des créneaux spécifiques (maladie, congés, etc.)
 * - Référence un SchoolSchedule pour une date donnée
 *
 * Index :
 * - schoolSchedule : ++id, dayOfWeek, isActive
 * - instructorAvailability : ++id, [instructorId+date+scheduleId], instructorId, date
 */
export function configureV9Migration(db: KiteSurfDB): void {
  db.version(9).stores({
    // Tables existantes (inchangées)
    users: '++id, email, role, isActive, createdAt',
    courses: '++id, instructorId, level, isActive, createdAt',
    reservations: '++id, studentId, courseId, status, createdAt',
    courseSessions: '++id, courseId, isActive, createdAt',
    timeSlots: '++id, instructorId, date, isAvailable, createdAt',
    userPhysicalData: '++id, userId',
    userHealthData: '++id, userId',
    userProgression: '++id, userId',
    transactions: '++id, userId, reservationId, status, createdAt',
    courseCredits: '++id, studentId, [studentId+status], status, createdAt',
    deletionRequests: '++id, userId, status, requestedAt, confirmationToken',
    userConsents: '++id, userId, consentType, status, [userId+consentType]',
    // Nouvelles tables
    schoolSchedule: '++id, dayOfWeek, isActive, createdAt',
    instructorAvailability: '++id, [instructorId+date+scheduleId], instructorId, date, isAvailable, createdAt',
  }).upgrade(async (tx) => {
    // Initialisation des créneaux par défaut (18 entrées : 3 créneaux × 6 jours)
    // Cette migration initialise les données par défaut pour schoolSchedule
    const schoolScheduleTable = tx.table('schoolSchedule');

    const defaultSchedules = [
      // Lundi (dayOfWeek = 1)
      { dayOfWeek: 1, startTime: '08:30', endTime: '11:00', createdAt: Date.now() },
      { dayOfWeek: 1, startTime: '11:30', endTime: '14:00', createdAt: Date.now() },
      { dayOfWeek: 1, startTime: '14:30', endTime: '17:00', createdAt: Date.now() },
      // Mardi (dayOfWeek = 2)
      { dayOfWeek: 2, startTime: '08:30', endTime: '11:00', createdAt: Date.now() },
      { dayOfWeek: 2, startTime: '11:30', endTime: '14:00', createdAt: Date.now() },
      { dayOfWeek: 2, startTime: '14:30', endTime: '17:00', createdAt: Date.now() },
      // Mercredi (dayOfWeek = 3)
      { dayOfWeek: 3, startTime: '08:30', endTime: '11:00', createdAt: Date.now() },
      { dayOfWeek: 3, startTime: '11:30', endTime: '14:00', createdAt: Date.now() },
      { dayOfWeek: 3, startTime: '14:30', endTime: '17:00', createdAt: Date.now() },
      // Jeudi (dayOfWeek = 4)
      { dayOfWeek: 4, startTime: '08:30', endTime: '11:00', createdAt: Date.now() },
      { dayOfWeek: 4, startTime: '11:30', endTime: '14:00', createdAt: Date.now() },
      { dayOfWeek: 4, startTime: '14:30', endTime: '17:00', createdAt: Date.now() },
      // Vendredi (dayOfWeek = 5)
      { dayOfWeek: 5, startTime: '08:30', endTime: '11:00', createdAt: Date.now() },
      { dayOfWeek: 5, startTime: '11:30', endTime: '14:00', createdAt: Date.now() },
      { dayOfWeek: 5, startTime: '14:30', endTime: '17:00', createdAt: Date.now() },
      // Samedi (dayOfWeek = 6)
      { dayOfWeek: 6, startTime: '08:30', endTime: '11:00', createdAt: Date.now() },
      { dayOfWeek: 6, startTime: '11:30', endTime: '14:00', createdAt: Date.now() },
      { dayOfWeek: 6, startTime: '14:30', endTime: '17:00', createdAt: Date.now() },
    ];

    // Ajouter isActive: 1 à chaque entrée
    const schedulesWithActiveState = defaultSchedules.map((schedule) => ({
      ...schedule,
      isActive: 1 as 0 | 1,
    }));

    await schoolScheduleTable.bulkAdd(schedulesWithActiveState);

    console.log('Database migrated to version 9: schoolSchedule and instructorAvailability tables added');
    console.log(`Initialized ${defaultSchedules.length} default school schedules`);
  });
}

/**
 * Helper pour accéder à la table schoolSchedule avec typage fort
 * @param db - Instance de KiteSurfDB
 * @returns Table typée SchoolSchedule
 */
export function getSchoolScheduleTable(db: KiteSurfDB) {
  return db.table('schoolSchedule');
}

/**
 * Helper pour accéder à la table instructorAvailability avec typage fort
 * @param db - Instance de KiteSurfDB
 * @returns Table typée InstructorAvailability
 */
export function getInstructorAvailabilityTable(db: KiteSurfDB) {
  return db.table('instructorAvailability');
}
