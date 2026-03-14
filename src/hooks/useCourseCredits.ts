// src/hooks/useCourseCredits.ts

import { useState, useCallback, useEffect } from 'react';
import { db } from '../db/db';
import type { CourseCredit, AddCourseCreditInput, StudentBalance } from '../types';
import { calculateBalance } from '../utils/calculateBalance';

/**
 * Interface de retour du hook useCourseCredits
 */
interface UseCourseCreditsReturn {
  /** Tous les crédits de cours (tous étudiants confondus) */
  credits: CourseCredit[];
  /** État de chargement des données */
  isLoading: boolean;
  /** Erreur survenue lors du chargement ou des opérations */
  error: Error | null;
  /** Ajoute un crédit de cours pour un étudiant (admin uniquement) */
  addCredit: (input: AddCourseCreditInput) => Promise<CourseCredit>;
  /** Récupère les crédits d'un étudiant spécifique */
  getStudentCredits: (studentId: number) => Promise<CourseCredit[]>;
  /** Récupère les crédits associés aux cours d'un moniteur */
  getInstructorCredits: (instructorId: number) => Promise<CourseCredit[]>;
  /** Calcule le solde total d'un étudiant (séances restantes) */
  getTotalBalance: (studentId: number) => Promise<StudentBalance>;
  /** Recharge manuellement la liste des crédits */
  refreshCredits: () => Promise<void>;
}

/**
 * Hook de gestion des crédits de cours.
 *
 * Fonctionnalités:
 * - Liste de tous les crédits (pour l'admin)
 * - Ajout de crédit (admin)
 * - Filtrage par étudiant ou moniteur
 * - Calcul du solde de séances
 *
 * Index Dexie utilisés:
 * - where('studentId'): Récupération rapide des crédits d'un étudiant
 * - where('[studentId+status]'): Filtrage combiné étudiant + statut
 *
 * @returns UseCourseCreditsReturn - Interface complète de gestion des crédits
 *
 * @example
 * ```typescript
 * function AdminCreditPanel() {
 *   const { credits, addCredit, getTotalBalance } = useCourseCredits();
 *   const balance = getTotalBalance(studentId);
 *
 *   const handleAddCredit = async () => {
 *     await addCredit({ studentId: 1, sessions: 4 });
 *   };
 *
 *   return <div>...</div>;
 * }
 * ```
 */
export function useCourseCredits(): UseCourseCreditsReturn {
  const [credits, setCredits] = useState<CourseCredit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Charge tous les crédits depuis la base de données.
   * Utilise orderBy('createdAt') pour un tri chronologique.
   */
  const loadCredits = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Chargement de tous les crédits, triés par date de création
      const loadedCredits = await db.courseCredits.orderBy('createdAt').toArray();
      setCredits(loadedCredits);
    } catch (err) {
      const errorObj = err instanceof Error
        ? err
        : new Error('Failed to load course credits');
      setError(errorObj);
      console.error('[useCourseCredits] loadCredits error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Effet de chargement initial au montage du composant.
   * Recharge lorsque loadCredits change (référence stable grâce à useCallback).
   */
  useEffect(() => {
    loadCredits();
  }, [loadCredits]);

  /**
   * Ajoute un crédit de cours pour un étudiant.
   * Réservé aux administrateurs.
   *
   * @param input - Données du crédit à créer
   * @returns Promise<CourseCredit> - Le crédit créé avec son ID généré
   *
   * @throws {Error} - En cas d'échec de l'opération
   */
  const addCredit = useCallback(async (input: AddCourseCreditInput): Promise<CourseCredit> => {
    setIsLoading(true);
    setError(null);
    try {
      const now = Date.now();

      // Création du crédit avec valeurs par défaut
      const creditToAdd: Omit<CourseCredit, 'id'> = {
        studentId: input.studentId,
        sessions: input.sessions,
        usedSessions: 0, // Nouveau crédit: aucune séance consommée
        status: 'active', // Statut initial: actif
        expiresAt: input.expiresAt, // Optionnel: date d'expiration
        createdAt: now,
        updatedAt: now
      };

      // Ajout à la base de données (l'ID est généré automatiquement par ++id)
      const creditId = await db.courseCredits.add(creditToAdd as any);

      // Création de l'objet complet avec l'ID généré
      const newCredit: CourseCredit = {
        id: creditId,
        ...creditToAdd
      };

      // Mise à jour de l'état local
      setCredits(prev => [...prev, newCredit]);

      return newCredit;
    } catch (err) {
      const errorObj = err instanceof Error
        ? err
        : new Error('Failed to add course credit');
      setError(errorObj);
      console.error('[useCourseCredits] addCredit error:', err);
      throw errorObj;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Récupère les crédits d'un étudiant spécifique.
   * Utilise l'index 'studentId' pour une requête optimisée.
   *
   * @param studentId - ID de l'étudiant
   * @returns Promise<CourseCredit[]> - Tableau des crédits de l'étudiant
   */
  const getStudentCredits = useCallback(async (studentId: number): Promise<CourseCredit[]> => {
    try {
      // Utilisation de l'index studentId pour une recherche rapide O(log n)
      const studentCredits = await db.courseCredits
        .where('studentId')
        .equals(studentId)
        .sortBy('createdAt');

      return studentCredits;
    } catch (err) {
      console.error('[useCourseCredits] getStudentCredits error:', err);
      return [];
    }
  }, []);

  /**
   * Récupère les crédits des étudiants inscrits aux cours d'un moniteur.
   * Nécessite une jointure entre courses et courseCredits.
   *
   * @param instructorId - ID du moniteur
   * @returns Promise<CourseCredit[]> - Crédits des étudiants du moniteur
   */
  const getInstructorCredits = useCallback(async (instructorId: number): Promise<CourseCredit[]> => {
    try {
      // Étape 1: Récupérer tous les cours du moniteur
      const instructorCourses = await db.courses
        .where('instructorId')
        .equals(instructorId)
        .toArray();

      if (instructorCourses.length === 0) {
        return [];
      }

      const courseIds = instructorCourses.map(c => c.id);

      // Étape 2: Récupérer toutes les réservations pour ces cours
      // Note: Cette implémentation suppose qu'on peut lier studentId aux cours
      // Dans une implémentation réelle, on pourrait filtrer par les réservations
      const allCredits = await db.courseCredits.toArray();

      // Étape 3: Filtrer les crédits des étudiants ayant des réservations dans ces cours
      // (Cette logique peut être optimisée selon la structure des données)
      const instructorCredits: CourseCredit[] = [];

      for (const credit of allCredits) {
        // Vérifier si l'étudiant a des réservations dans les cours du moniteur
        const hasReservation = await db.reservations
          .where('[studentId+courseId]')
          .anyOf(courseIds.map(courseId => [credit.studentId, courseId]))
          .first();

        if (hasReservation) {
          instructorCredits.push(credit);
        }
      }

      return instructorCredits;
    } catch (err) {
      console.error('[useCourseCredits] getInstructorCredits error:', err);
      return [];
    }
  }, []);

  /**
   * Calcule le solde total de séances d'un étudiant.
   *
   * @param studentId - ID de l'étudiant
   * @returns Promise<StudentBalance> - Objet contenant total, utilisé et restant
   */
  const getTotalBalance = useCallback(async (studentId: number): Promise<StudentBalance> => {
    try {
      const studentCredits = await getStudentCredits(studentId);
      return calculateBalance(studentCredits);
    } catch (err) {
      console.error('[useCourseCredits] getTotalBalance error:', err);
      return { totalSessions: 0, usedSessions: 0, remainingSessions: 0 };
    }
  }, [getStudentCredits]);

  /**
   * Recharge manuellement la liste des crédits.
   * Utile après une opération externe ou pour rafraîchir les données.
   */
  const refreshCredits = useCallback(async () => {
    await loadCredits();
  }, [loadCredits]);

  return {
    credits,
    isLoading,
    error,
    addCredit,
    getStudentCredits,
    getInstructorCredits,
    getTotalBalance,
    refreshCredits
  };
}
