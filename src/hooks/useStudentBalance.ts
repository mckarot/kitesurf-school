// src/hooks/useStudentBalance.ts

import { useState, useCallback, useEffect } from 'react';
import { db } from '../db/db';
import type { CourseCredit, StudentBalance } from '../types';
import { calculateBalance } from '../utils/calculateBalance';
import { useAuth } from './useAuth';

/**
 * Interface de retour du hook useStudentBalance
 */
interface UseStudentBalanceReturn {
  /** Solde actuel de l'étudiant connecté */
  balance: StudentBalance | null;
  /** État de chargement des données */
  isLoading: boolean;
  /** Erreur survenue lors du chargement ou des opérations */
  error: Error | null;
  /** Vérifie si l'étudiant a suffisamment de séances disponibles */
  hasAvailableSessions: (sessions: number) => boolean;
  /** Consomme des séances du crédit (pour une réservation) */
  consumeSessions: (sessions: number) => Promise<{ success: boolean; error?: string }>;
  /** Recharge manuellement le solde */
  refreshBalance: () => Promise<void>;
}

/**
 * Hook de gestion du solde de séances de l'étudiant connecté.
 *
 * Fonctionnalités:
 * - Calcul automatique du solde (total, utilisé, restant)
 * - Vérification de disponibilité avant réservation
 * - Consommation de séances avec transaction atomique
 * - Intégration avec useAuth pour l'étudiant connecté
 *
 * Logique de calcul:
 * - totalSessions = somme des séances de tous les crédits actifs
 * - usedSessions = somme des séances déjà consommées
 * - remainingSessions = totalSessions - usedSessions
 *
 * Index Dexie utilisés:
 * - where('[studentId+status]'): Filtrage optimisé étudiant + statut actif
 *
 * @returns UseStudentBalanceReturn - Interface complète de gestion du solde
 *
 * @example
 * ```typescript
 * function StudentReservationForm() {
 *   const { balance, hasAvailableSessions, consumeSessions } = useStudentBalance();
 *
 *   const handleReserve = async () => {
 *     if (hasAvailableSessions(1)) {
 *       await consumeSessions(1);
 *     }
 *   };
 *
 *   return <div>Solde: {balance?.remainingSessions} séances</div>;
 * }
 * ```
 */
export function useStudentBalance(): UseStudentBalanceReturn {
  const { user } = useAuth();
  const [balance, setBalance] = useState<StudentBalance | null>(null);
  const [activeCredits, setActiveCredits] = useState<CourseCredit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Charge les crédits et calcule le solde de l'étudiant connecté.
   * Utilise l'index composite [studentId+status] pour une requête optimisée.
   */
  const loadBalance = useCallback(async () => {
    // Si aucun utilisateur connecté, on ne charge rien
    if (!user || user.role !== 'student') {
      setBalance(null);
      setActiveCredits([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // Récupération des crédits actifs uniquement
      // Index composite [studentId+status] pour une requête O(log n)
      const credits = await db.courseCredits
        .where('[studentId+status]')
        .equals([user.id, 'active'])
        .sortBy('createdAt');

      setActiveCredits(credits);

      // Calcul du solde
      const calculatedBalance = calculateBalance(credits);
      setBalance(calculatedBalance);
    } catch (err) {
      const errorObj = err instanceof Error
        ? err
        : new Error('Failed to load student balance');
      setError(errorObj);
      console.error('[useStudentBalance] loadBalance error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  /**
   * Effet de chargement initial et lors du changement d'utilisateur.
   * Recharge le solde lorsque l'utilisateur connecté change.
   */
  useEffect(() => {
    loadBalance();
  }, [loadBalance]);

  /**
   * Vérifie si l'étudiant a suffisamment de séances disponibles.
   *
   * @param sessions - Nombre de séances nécessaires
   * @returns boolean - true si le solde est suffisant
   *
   * @example
   * ```typescript
   * if (hasAvailableSessions(1)) {
   *   // L'étudiant peut réserver 1 séance
   * }
   * ```
   */
  const hasAvailableSessions = useCallback((sessions: number): boolean => {
    if (!balance) {
      return false;
    }
    return balance.remainingSessions >= sessions;
  }, [balance]);

  /**
   * Consomme des séances du crédit de l'étudiant.
   * Utilise une transaction atomique pour garantir la cohérence.
   *
   * Algorithme FIFO:
   * 1. Trie les crédits par date de création (plus ancien en premier)
   * 2. Consomme les séances du crédit le plus ancien en premier
   * 3. Passe au crédit suivant si le premier est épuisé
   *
   * @param sessions - Nombre de séances à consommer
   * @returns Promise<{ success: boolean; error?: string }> - Résultat de l'opération
   *
   * @example
   * ```typescript
   * const result = await consumeSessions(1);
   * if (result.success) {
   *   console.log('Séances consommées avec succès');
   * } else {
   *   console.error('Erreur:', result.error);
   * }
   * ```
   */
  const consumeSessions = useCallback(async (sessions: number): Promise<{ success: boolean; error?: string }> => {
    // Validation: utilisateur connecté requis
    if (!user || user.role !== 'student') {
      return {
        success: false,
        error: 'Utilisateur non connecté ou non étudiant'
      };
    }

    // Validation: séances positives
    if (sessions <= 0) {
      return {
        success: false,
        error: 'Le nombre de séances doit être supérieur à 0'
      };
    }

    // Validation: solde suffisant
    if (!balance || balance.remainingSessions < sessions) {
      return {
        success: false,
        error: `Solde insuffisant. Vous avez ${balance?.remainingSessions ?? 0} séance(s) disponible(s), ${sessions} séance(s) requise(s).`
      };
    }

    try {
      // Transaction atomique pour garantir la cohérence
      await db.transaction('rw', db.courseCredits, async () => {
        let sessionsRemainingToConsume = sessions;

        // Parcours des crédits en FIFO (déjà triés par createdAt dans activeCredits)
        for (const credit of activeCredits) {
          if (sessionsRemainingToConsume <= 0) {
            break;
          }

          // Calculer combien de séances prendre de ce crédit
          const availableInThisCredit = credit.sessions - credit.usedSessions;
          const sessionsToTakeFromThisCredit = Math.min(
            availableInThisCredit,
            sessionsRemainingToConsume
          );

          if (sessionsToTakeFromThisCredit > 0) {
            // Mettre à jour le crédit avec les séances consommées
            await db.courseCredits.update(credit.id, {
              usedSessions: credit.usedSessions + sessionsToTakeFromThisCredit,
              updatedAt: Date.now()
            });

            sessionsRemainingToConsume -= sessionsToTakeFromThisCredit;
          }
        }
      });

      // Recharger le solde après consommation
      await loadBalance();

      return { success: true };
    } catch (err) {
      const errorObj = err instanceof Error
        ? err
        : new Error('Failed to consume sessions');
      console.error('[useStudentBalance] consumeSessions error:', err);
      return {
        success: false,
        error: errorObj.message
      };
    }
  }, [user, balance, activeCredits, loadBalance]);

  /**
   * Recharge manuellement le solde.
   * Utile après une opération externe ou pour rafraîchir les données.
   */
  const refreshBalance = useCallback(async () => {
    await loadBalance();
  }, [loadBalance]);

  return {
    balance,
    isLoading,
    error,
    hasAvailableSessions,
    consumeSessions,
    refreshBalance
  };
}

/**
 * Hook utilitaire pour obtenir le solde d'un étudiant spécifique (par ID).
 * Utile pour les vues admin qui affichent le solde d'un autre étudiant.
 *
 * @param studentId - ID de l'étudiant dont on veut le solde
 * @returns UseStudentBalanceReturn - Interface complète (sans consumeSessions)
 */
export function useStudentBalanceById(studentId: number): Omit<UseStudentBalanceReturn, 'consumeSessions'> & {
  consumeSessions: undefined;
} {
  const [balance, setBalance] = useState<StudentBalance | null>(null);
  const [activeCredits, setActiveCredits] = useState<CourseCredit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadBalance = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const credits = await db.courseCredits
        .where('[studentId+status]')
        .equals([studentId, 'active'])
        .sortBy('createdAt');

      setActiveCredits(credits);
      setBalance(calculateBalance(credits));
    } catch (err) {
      const errorObj = err instanceof Error
        ? err
        : new Error('Failed to load student balance');
      setError(errorObj);
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    loadBalance();
  }, [loadBalance]);

  const hasAvailableSessions = useCallback((sessions: number): boolean => {
    if (!balance) {
      return false;
    }
    return balance.remainingSessions >= sessions;
  }, [balance]);

  const refreshBalance = useCallback(async () => {
    await loadBalance();
  }, [loadBalance]);

  return {
    balance,
    isLoading,
    error,
    hasAvailableSessions,
    consumeSessions: undefined, // Non disponible pour un autre étudiant
    refreshBalance
  };
}
