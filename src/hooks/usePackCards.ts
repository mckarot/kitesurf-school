// src/hooks/usePackCards.ts
// Hook de gestion des PackCards (cartes de packs pour /courses)

import { useState, useCallback, useEffect } from 'react';
import { db } from '../db/db';
import type { PackCard, PackCardInput, UpdatePackCardInput } from '../types';

/**
 * Interface de retour du hook usePackCards
 */
interface UsePackCardsReturn {
  /** Liste de toutes les PackCards */
  cards: PackCard[];
  /** État de chargement des données */
  isLoading: boolean;
  /** Erreur survenue lors du chargement ou des opérations */
  error: Error | null;
  /** Récupère une carte par son ID */
  getCardById: (id: number) => PackCard | undefined;
  /** Récupère une carte par son type */
  getCardByType: (packType: PackCard['packType']) => PackCard | undefined;
  /** Crée une nouvelle PackCard */
  createCard: (input: PackCardInput) => Promise<{ success: boolean; error?: string }>;
  /** Met à jour une PackCard existante */
  updateCard: (input: UpdatePackCardInput) => Promise<{ success: boolean; error?: string }>;
  /** Active ou désactive une PackCard */
  toggleCard: (id: number, isActive: boolean) => Promise<{ success: boolean; error?: string }>;
  /** Active ou désactive la surbrillance d'une PackCard */
  toggleHighlight: (id: number, isHighlighted: boolean) => Promise<{ success: boolean; error?: string }>;
  /** Supprime une PackCard */
  deleteCard: (id: number) => Promise<{ success: boolean; error?: string }>;
  /** Recharge manuellement les PackCards */
  refreshCards: () => Promise<void>;
}

/**
 * Hook de gestion des PackCards (cartes de packs affichées sur /courses).
 *
 * Fonctionnalités:
 * - CRUD complet sur les PackCards
 * - Activation/désactivation de cartes
 * - Gestion de la surbrillance (isHighlighted)
 * - Filtrage par type de pack
 * - Intégration avec Dexie.js pour la persistance
 *
 * Index Dexie utilisés:
 * - where('packType'): Récupération optimisée par type
 * - where('[packType+isActive]'): Filtrage combiné type + statut
 *
 * @returns UsePackCardsReturn - Interface complète de gestion des PackCards
 *
 * @example
 * ```typescript
 * function CoursesPage() {
 *   const { cards, createCard, updateCard, toggleHighlight } = usePackCards();
 *
 *   return (
 *     <div>
 *       {cards.map(card => (
 *         <PackCardComponent key={card.id} {...card} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function usePackCards(): UsePackCardsReturn {
  const [cards, setCards] = useState<PackCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Charge toutes les PackCards depuis la base de données.
   */
  const loadCards = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const allCards = await db.packCards.orderBy('packType').toArray();
      setCards(allCards);
    } catch (err) {
      const errorObj = err instanceof Error
        ? err
        : new Error('Failed to load pack cards');
      setError(errorObj);
      console.error('[usePackCards] loadCards error:', err);
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
   * Récupère une PackCard par son ID.
   * Version synchrone (depuis le state local).
   */
  const getCardById = useCallback((id: number): PackCard | undefined => {
    return cards.find(c => c.id === id);
  }, [cards]);

  /**
   * Récupère une PackCard par son type.
   * Retourne la première carte active pour ce type.
   */
  const getCardByType = useCallback((packType: PackCard['packType']): PackCard | undefined => {
    return cards.find(c => c.packType === packType && c.isActive === 1);
  }, [cards]);

  /**
   * Crée une nouvelle PackCard.
   *
   * @param input - Données de la PackCard à créer
   * @returns Promise<{ success: boolean; error?: string }>
   */
  const createCard = useCallback(async (input: PackCardInput): Promise<{ success: boolean; error?: string }> => {
    try {
      // Vérifier si une carte existe déjà pour ce type
      const existingCard = await db.packCards
        .where('packType')
        .equals(input.packType)
        .first();

      if (existingCard) {
        return {
          success: false,
          error: `Une carte existe déjà pour "${input.packType}"`
        };
      }

      const cardData: Omit<PackCard, 'id'> = {
        ...input,
        isActive: input.isActive ?? 1,
        createdAt: Date.now()
      };

      const id = await db.packCards.add(cardData as PackCard);

      // Recharger les cartes
      await loadCards();

      return {
        success: true
      };
    } catch (err) {
      const errorObj = err instanceof Error
        ? err
        : new Error('Failed to create pack card');
      console.error('[usePackCards] createCard error:', err);
      return {
        success: false,
        error: errorObj.message
      };
    }
  }, [loadCards]);

  /**
   * Met à jour une PackCard existante.
   *
   * @param input - Données de mise à jour (id requis)
   * @returns Promise<{ success: boolean; error?: string }>
   */
  const updateCard = useCallback(async (input: UpdatePackCardInput): Promise<{ success: boolean; error?: string }> => {
    try {
      const existingCard = await db.packCards.get(input.id);

      if (!existingCard) {
        return {
          success: false,
          error: 'PackCard non trouvée'
        };
      }

      const updatedData: Partial<PackCard> = {
        ...input,
        updatedAt: Date.now()
      };

      // Supprimer les champs qui ne doivent pas être mis à jour
      delete (updatedData as any).id;
      delete (updatedData as any).createdAt;

      await db.packCards.update(input.id, updatedData);

      // Recharger les cartes
      await loadCards();

      return {
        success: true
      };
    } catch (err) {
      const errorObj = err instanceof Error
        ? err
        : new Error('Failed to update pack card');
      console.error('[usePackCards] updateCard error:', err);
      return {
        success: false,
        error: errorObj.message
      };
    }
  }, [loadCards]);

  /**
   * Active ou désactive une PackCard.
   *
   * @param id - ID de la PackCard
   * @param isActive - Nouveau statut
   * @returns Promise<{ success: boolean; error?: string }>
   */
  const toggleCard = useCallback(async (id: number, isActive: boolean): Promise<{ success: boolean; error?: string }> => {
    try {
      await db.packCards.update(id, {
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
        : new Error('Failed to toggle pack card');
      console.error('[usePackCards] toggleCard error:', err);
      return {
        success: false,
        error: errorObj.message
      };
    }
  }, [loadCards]);

  /**
   * Active ou désactive la surbrillance d'une PackCard.
   *
   * @param id - ID de la PackCard
   * @param isHighlighted - Nouveau statut de surbrillance
   * @returns Promise<{ success: boolean; error?: string }>
   */
  const toggleHighlight = useCallback(async (id: number, isHighlighted: boolean): Promise<{ success: boolean; error?: string }> => {
    try {
      await db.packCards.update(id, {
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
      console.error('[usePackCards] toggleHighlight error:', err);
      return {
        success: false,
        error: errorObj.message
      };
    }
  }, [loadCards]);

  /**
   * Supprime une PackCard.
   *
   * @param id - ID de la PackCard à supprimer
   * @returns Promise<{ success: boolean; error?: string }>
   */
  const deleteCard = useCallback(async (id: number): Promise<{ success: boolean; error?: string }> => {
    try {
      await db.packCards.delete(id);

      // Recharger les cartes
      await loadCards();

      return {
        success: true
      };
    } catch (err) {
      const errorObj = err instanceof Error
        ? err
        : new Error('Failed to delete pack card');
      console.error('[usePackCards] deleteCard error:', err);
      return {
        success: false,
        error: errorObj.message
      };
    }
  }, [loadCards]);

  /**
   * Recharge manuellement les PackCards.
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
