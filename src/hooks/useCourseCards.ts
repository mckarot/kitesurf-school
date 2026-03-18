// src/hooks/useCourseCards.ts
// Hook de gestion des CourseCards (cartes de cours pour /courses)

import { useState, useCallback, useEffect } from 'react';
import { db } from '../db/db';
import type { CourseCard, CourseCardInput, UpdateCourseCardInput } from '../types';

/**
 * Interface de retour du hook useCourseCards
 */
interface UseCourseCardsReturn {
  /** Liste de toutes les CourseCards */
  cards: CourseCard[];
  /** État de chargement des données */
  isLoading: boolean;
  /** Erreur survenue lors du chargement ou des opérations */
  error: Error | null;
  /** Récupère une carte par son ID */
  getCardById: (id: number) => CourseCard | undefined;
  /** Récupère une carte par son type */
  getCardByType: (courseType: CourseCard['courseType']) => CourseCard | undefined;
  /** Crée une nouvelle CourseCard */
  createCard: (input: CourseCardInput) => Promise<{ success: boolean; error?: string }>;
  /** Met à jour une CourseCard existante */
  updateCard: (input: UpdateCourseCardInput) => Promise<{ success: boolean; error?: string }>;
  /** Active ou désactive une CourseCard */
  toggleCard: (id: number, isActive: boolean) => Promise<{ success: boolean; error?: string }>;
  /** Active ou désactive la surbrillance d'une CourseCard */
  toggleHighlight: (id: number, isHighlighted: boolean) => Promise<{ success: boolean; error?: string }>;
  /** Supprime une CourseCard */
  deleteCard: (id: number) => Promise<{ success: boolean; error?: string }>;
  /** Recharge manuellement les CourseCards */
  refreshCards: () => Promise<void>;
}

/**
 * Hook de gestion des CourseCards (cartes de cours affichées sur /courses).
 *
 * Fonctionnalités:
 * - CRUD complet sur les CourseCards
 * - Activation/désactivation de cartes
 * - Gestion de la surbrillance (isHighlighted)
 * - Filtrage par type de cours
 * - Intégration avec Dexie.js pour la persistance
 *
 * Index Dexie utilisés:
 * - where('courseType'): Récupération optimisée par type
 * - where('[courseType+isActive]'): Filtrage combiné type + statut
 *
 * @returns UseCourseCardsReturn - Interface complète de gestion des CourseCards
 *
 * @example
 * ```typescript
 * function CoursesPage() {
 *   const { cards, createCard, updateCard, toggleHighlight } = useCourseCards();
 *
 *   return (
 *     <div>
 *       {cards.map(card => (
 *         <CourseCardComponent key={card.id} {...card} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useCourseCards(): UseCourseCardsReturn {
  const [cards, setCards] = useState<CourseCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Charge toutes les CourseCards depuis la base de données.
   */
  const loadCards = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const allCards = await db.courseCards.orderBy('courseType').toArray();
      setCards(allCards);
    } catch (err) {
      const errorObj = err instanceof Error
        ? err
        : new Error('Failed to load course cards');
      setError(errorObj);
      console.error('[useCourseCards] loadCards error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Effet de chargement initial.
   */
  useEffect(() => {
    loadCards();
  }, [loadCards]);

  /**
   * Récupère une CourseCard par son ID.
   * Version synchrone (depuis le state local).
   */
  const getCardById = useCallback((id: number): CourseCard | undefined => {
    return cards.find(c => c.id === id);
  }, [cards]);

  /**
   * Récupère une CourseCard par son type.
   * Retourne la première carte active pour ce type.
   */
  const getCardByType = useCallback((courseType: CourseCard['courseType']): CourseCard | undefined => {
    return cards.find(c => c.courseType === courseType && c.isActive === 1);
  }, [cards]);

  /**
   * Crée une nouvelle CourseCard.
   *
   * @param input - Données de la CourseCard à créer
   * @returns Promise<{ success: boolean; error?: string }>
   */
  const createCard = useCallback(async (input: CourseCardInput): Promise<{ success: boolean; error?: string }> => {
    try {
      // Vérifier si une carte existe déjà pour ce type
      const existingCard = await db.courseCards
        .where('courseType')
        .equals(input.courseType)
        .first();

      if (existingCard) {
        return {
          success: false,
          error: `Une carte existe déjà pour "${input.courseType}"`
        };
      }

      const cardData: Omit<CourseCard, 'id'> = {
        ...input,
        isActive: input.isActive ?? 1,
        createdAt: Date.now()
      };

      const id = await db.courseCards.add(cardData as CourseCard);

      // Recharger les cartes
      await loadCards();

      return {
        success: true
      };
    } catch (err) {
      const errorObj = err instanceof Error
        ? err
        : new Error('Failed to create course card');
      console.error('[useCourseCards] createCard error:', err);
      return {
        success: false,
        error: errorObj.message
      };
    }
  }, [loadCards]);

  /**
   * Met à jour une CourseCard existante.
   *
   * @param input - Données de mise à jour (id requis)
   * @returns Promise<{ success: boolean; error?: string }>
   */
  const updateCard = useCallback(async (input: UpdateCourseCardInput): Promise<{ success: boolean; error?: string }> => {
    try {
      const existingCard = await db.courseCards.get(input.id);

      if (!existingCard) {
        return {
          success: false,
          error: 'CourseCard non trouvée'
        };
      }

      const updatedData: Partial<CourseCard> = {
        ...input,
        updatedAt: Date.now()
      };

      // Supprimer les champs qui ne doivent pas être mis à jour
      delete (updatedData as any).id;
      delete (updatedData as any).createdAt;

      await db.courseCards.update(input.id, updatedData);

      // Recharger les cartes
      await loadCards();

      return {
        success: true
      };
    } catch (err) {
      const errorObj = err instanceof Error
        ? err
        : new Error('Failed to update course card');
      console.error('[useCourseCards] updateCard error:', err);
      return {
        success: false,
        error: errorObj.message
      };
    }
  }, [loadCards]);

  /**
   * Active ou désactive une CourseCard.
   *
   * @param id - ID de la CourseCard
   * @param isActive - Nouveau statut
   * @returns Promise<{ success: boolean; error?: string }>
   */
  const toggleCard = useCallback(async (id: number, isActive: boolean): Promise<{ success: boolean; error?: string }> => {
    try {
      await db.courseCards.update(id, {
        isActive: isActive ? 1 : 0,
        updatedAt: Date.now()
      });

      // Recharger les cartes
      await loadCards();

      return {
        success: true
      };
    } catch (err) {
      const errorObj = err instanceof Error
        ? err
        : new Error('Failed to toggle course card');
      console.error('[useCourseCards] toggleCard error:', err);
      return {
        success: false,
        error: errorObj.message
      };
    }
  }, [loadCards]);

  /**
   * Active ou désactive la surbrillance d'une CourseCard.
   *
   * @param id - ID de la CourseCard
   * @param isHighlighted - Nouveau statut de surbrillance
   * @returns Promise<{ success: boolean; error?: string }>
   */
  const toggleHighlight = useCallback(async (id: number, isHighlighted: boolean): Promise<{ success: boolean; error?: string }> => {
    try {
      await db.courseCards.update(id, {
        isHighlighted: isHighlighted ? 1 : 0,
        updatedAt: Date.now()
      });

      // Recharger les cartes
      await loadCards();

      return {
        success: true
      };
    } catch (err) {
      const errorObj = err instanceof Error
        ? err
        : new Error('Failed to toggle highlight');
      console.error('[useCourseCards] toggleHighlight error:', err);
      return {
        success: false,
        error: errorObj.message
      };
    }
  }, [loadCards]);

  /**
   * Supprime une CourseCard.
   *
   * @param id - ID de la CourseCard à supprimer
   * @returns Promise<{ success: boolean; error?: string }>
   */
  const deleteCard = useCallback(async (id: number): Promise<{ success: boolean; error?: string }> => {
    try {
      await db.courseCards.delete(id);

      // Recharger les cartes
      await loadCards();

      return {
        success: true
      };
    } catch (err) {
      const errorObj = err instanceof Error
        ? err
        : new Error('Failed to delete course card');
      console.error('[useCourseCards] deleteCard error:', err);
      return {
        success: false,
        error: errorObj.message
      };
    }
  }, [loadCards]);

  /**
   * Recharge manuellement les CourseCards.
   * Utile après une opération externe ou pour rafraîchir les données.
   */
  const refreshCards = useCallback(async () => {
    await loadCards();
  }, [loadCards]);

  return {
    cards,
    isLoading,
    error,
    getCardById,
    getCardByType,
    createCard,
    updateCard,
    toggleCard,
    toggleHighlight,
    deleteCard,
    refreshCards
  };
}
