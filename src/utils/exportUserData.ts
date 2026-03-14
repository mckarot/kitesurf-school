// src/utils/exportUserData.ts

import type { 
  UserProfileExport, 
  UserPhysicalData, 
  UserHealthData, 
  UserProgression,
  UserProgressionExport
} from '../types';
import type { ProfileDataLoaderReturn } from '../pages/ProfileData/loader';
import { db } from '../db/db';

/**
 * Génère le nom de fichier pour l'export JSON
 * Format: mes-donnees-kitesurf-YYYY-MM-DD.json
 */
export function generateUserDataFilename(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `mes-donnees-kitesurf-${year}-${month}-${day}.json`;
}

/**
 * Formate les données du loader pour l'export JSON
 */
export function formatExportData(data: ProfileDataLoaderReturn): UserProfileExport {
  return {
    exportedAt: new Date().toISOString(),
    user: {
      id: data.user.id,
      email: data.user.email,
      firstName: data.user.firstName,
      lastName: data.user.lastName,
      role: data.user.role,
      createdAt: data.user.createdAt,
    },
    physicalData: data.physicalData ? {
      weight: data.physicalData.weight,
      height: data.physicalData.height,
    } : undefined,
    healthData: data.healthData ? {
      medicalConditions: data.healthData.medicalConditions,
      allergies: data.healthData.allergies,
      swimmingLevel: data.healthData.swimmingLevel,
      medicalCertificateValidUntil: data.healthData.medicalCertificateValidUntil,
    } : undefined,
    progression: data.progression ? {
      currentIkoLevel: data.progression.currentIkoLevel,
      validatedSkills: data.progression.validatedSkills,
      sessionHistory: [], // Sera rempli si nécessaire
    } : undefined,
    reservations: data.reservations,
    transactions: data.transactions,
  };
}

/**
 * Télécharge un fichier JSON dans le navigateur
 */
export function downloadJsonFile(data: UserProfileExport, filename: string): void {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.setAttribute('aria-hidden', 'true');
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Nettoyer l'URL object
  URL.revokeObjectURL(url);
}

/**
 * Fonction principale d'export des données utilisateur
 */
export async function exportUserData(data: ProfileDataLoaderReturn): Promise<void> {
  const formattedData = formatExportData(data);
  const filename = generateUserDataFilename();
  downloadJsonFile(formattedData, filename);
}

/**
 * Récupère l'historique des sessions pour la progression
 */
export async function getSessionHistory(userId: number): Promise<
  Array<{
    id: number;
    date: string;
    location: string;
    instructorName: string;
    courseTitle: string;
    level: string;
  }>
> {
  const reservations = await db.reservations
    .where('studentId')
    .equals(userId)
    .toArray();
  
  const sessions = await Promise.all(
    reservations.map(async (reservation) => {
      const course = await db.courses.get(reservation.courseId);
      const session = await db.courseSessions
        .where('courseId')
        .equals(reservation.courseId)
        .first();
      
      if (!session) return null;
      
      const instructor = await db.users.get(course?.instructorId || 0);
      
      return {
        id: reservation.id,
        date: session.date,
        location: session.location,
        instructorName: instructor 
          ? `${instructor.firstName} ${instructor.lastName}` 
          : 'Inconnu',
        courseTitle: course?.title || 'Cours inconnu',
        level: course?.level || 'unknown',
      };
    })
  );
  
  return sessions.filter((s): s is NonNullable<typeof s> => s !== null);
}
