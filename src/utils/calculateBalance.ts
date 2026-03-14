// src/utils/calculateBalance.ts

import type { CourseCredit, StudentBalance } from '../types';

/**
 * Calcule le solde de séances d'un étudiant à partir de ses crédits.
 *
 * Algorithme:
 * - totalSessions: Somme de tous les crédits (séances achetées)
 * - usedSessions: Somme de toutes les séances consommées
 * - remainingSessions: Différence entre total et utilisé
 *
 * @param credits - Tableau de crédits de cours pour un étudiant
 * @returns StudentBalance - Objet contenant le solde détaillé
 *
 * @example
 * ```typescript
 * const credits: CourseCredit[] = [
 *   { id: 1, studentId: 1, sessions: 4, usedSessions: 1, status: 'active', createdAt: 1, updatedAt: 1 },
 *   { id: 2, studentId: 1, sessions: 2, usedSessions: 0, status: 'active', createdAt: 2, updatedAt: 2 }
 * ];
 * const balance = calculateBalance(credits);
 * // balance = { totalSessions: 6, usedSessions: 1, remainingSessions: 5 }
 * ```
 */
export function calculateBalance(credits: CourseCredit[]): StudentBalance {
  // Filtrer uniquement les crédits actifs pour le calcul
  // Les crédits expirés ou remboursés ne comptent pas dans le solde disponible
  const activeCredits = credits.filter(credit => credit.status === 'active');

  // Calcul du total des séances achetées (crédits actifs uniquement)
  const totalSessions = activeCredits.reduce((sum, credit) => sum + credit.sessions, 0);

  // Calcul du total des séances consommées (crédits actifs uniquement)
  const usedSessions = activeCredits.reduce((sum, credit) => sum + credit.usedSessions, 0);

  // Calcul du solde restant
  const remainingSessions = totalSessions - usedSessions;

  return {
    totalSessions,
    usedSessions,
    remainingSessions
  };
}

/**
 * Calcule le solde de séances restantes uniquement.
 * Version simplifiée pour les vérifications rapides.
 *
 * @param credits - Tableau de crédits de cours pour un étudiant
 * @returns number - Nombre de séances restantes
 */
export function calculateRemainingSessions(credits: CourseCredit[]): number {
  const balance = calculateBalance(credits);
  return balance.remainingSessions;
}

/**
 * Vérifie si un étudiant a suffisamment de séances pour une réservation.
 *
 * @param credits - Tableau de crédits de cours pour un étudiant
 * @param sessionsNeeded - Nombre de séances nécessaires pour la réservation
 * @returns boolean - true si le solde est suffisant
 */
export function hasSufficientBalance(credits: CourseCredit[], sessionsNeeded: number): boolean {
  const remainingSessions = calculateRemainingSessions(credits);
  return remainingSessions >= sessionsNeeded;
}
