// src/hooks/useCoursePricing.ts
// Hook de gestion des tarifs des cours (système v13)

import { useState, useCallback, useEffect } from 'react';
import { db } from '../db/db';
import type { CoursePricing, CoursePricingInput, UpdateCoursePricingInput } from '../types';

/**
 * Interface de retour du hook useCoursePricing
 */
interface UseCoursePricingReturn {
  /** Liste de tous les tarifs */
  prices: CoursePricing[];
  /** État de chargement des données */
  isLoading: boolean;
  /** Erreur survenue lors du chargement ou des opérations */
  error: Error | null;
  /** Récupère un tarif par son ID */
  getPriceById: (id: number) => CoursePricing | undefined;
  /** Récupère un tarif par son type */
  getPriceByType: (courseType: CoursePricing['courseType']) => CoursePricing | undefined;
  /** Crée un nouveau tarif */
  createPrice: (input: CoursePricingInput) => Promise<{ success: boolean; error?: string }>;
  /** Met à jour un tarif existant */
  updatePrice: (input: UpdateCoursePricingInput) => Promise<{ success: boolean; error?: string }>;
  /** Active ou désactive un tarif */
  togglePrice: (id: number, isActive: boolean) => Promise<{ success: boolean; error?: string }>;
  /** Supprime un tarif */
  deletePrice: (id: number) => Promise<{ success: boolean; error?: string }>;
  /** Recharge manuellement les tarifs */
  refreshPrices: () => Promise<void>;
}

/**
 * Hook de gestion des tarifs des cours.
 *
 * Fonctionnalités:
 * - CRUD complet sur les tarifs
 * - Activation/désactivation de tarifs
 * - Filtrage par type de cours
 * - Intégration avec Dexie.js pour la persistance
 *
 * Index Dexie utilisés:
 * - where('courseType'): Récupération optimisée par type
 * - where('[courseType+isActive]'): Filtrage combiné type + statut
 *
 * @returns UseCoursePricingReturn - Interface complète de gestion des tarifs
 *
 * @example
 * ```typescript
 * function AdminPricingPage() {
 *   const { prices, createPrice, updatePrice, deletePrice } = useCoursePricing();
 *
 *   const handleCreate = async () => {
 *     await createPrice({
 *       courseType: 'collectif',
 *       price: 70,
 *       duration: '2h30',
 *       maxStudents: 6
 *     });
 *   };
 *
 *   return (
 *     <ul>
 *       {prices.map(price => (
 *         <li key={price.id}>{price.courseType}: {price.price}€</li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 */
export function useCoursePricing(): UseCoursePricingReturn {
  const [prices, setPrices] = useState<CoursePricing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Charge tous les tarifs depuis la base de données.
   */
  const loadPrices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const allPrices = await db.coursePricing.orderBy('courseType').toArray();
      setPrices(allPrices);
    } catch (err) {
      const errorObj = err instanceof Error
        ? err
        : new Error('Failed to load course pricing');
      setError(errorObj);
      console.error('[useCoursePricing] loadPrices error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Effet de chargement initial.
   */
  useEffect(() => {
    loadPrices();
  }, [loadPrices]);

  /**
   * Récupère un tarif par son ID.
   * Version synchrone (depuis le state local).
   */
  const getPriceById = useCallback((id: number): CoursePricing | undefined => {
    return prices.find(p => p.id === id);
  }, [prices]);

  /**
   * Récupère un tarif par son type.
   * Retourne le premier tarif actif pour ce type.
   */
  const getPriceByType = useCallback((courseType: CoursePricing['courseType']): CoursePricing | undefined => {
    return prices.find(p => p.courseType === courseType && p.isActive === 1);
  }, [prices]);

  /**
   * Crée un nouveau tarif.
   *
   * @param input - Données du tarif à créer
   * @returns Promise<{ success: boolean; error?: string }>
   */
  const createPrice = useCallback(async (input: CoursePricingInput): Promise<{ success: boolean; error?: string }> => {
    try {
      // Vérifier si un tarif existe déjà pour ce type
      const existingPrice = await db.coursePricing
        .where('[courseType+isActive]')
        .equals([input.courseType, 1])
        .first();

      if (existingPrice) {
        return {
          success: false,
          error: `Un tarif actif existe déjà pour "${input.courseType}"`
        };
      }

      const priceData: Omit<CoursePricing, 'id'> = {
        ...input,
        isActive: input.isActive ?? 1,
        createdAt: Date.now()
      };

      const id = await db.coursePricing.add(priceData as CoursePricing);
      
      // Recharger les tarifs
      await loadPrices();

      return {
        success: true
      };
    } catch (err) {
      const errorObj = err instanceof Error
        ? err
        : new Error('Failed to create course pricing');
      console.error('[useCoursePricing] createPrice error:', err);
      return {
        success: false,
        error: errorObj.message
      };
    }
  }, [loadPrices]);

  /**
   * Met à jour un tarif existant.
   *
   * @param input - Données de mise à jour (id requis)
   * @returns Promise<{ success: boolean; error?: string }>
   */
  const updatePrice = useCallback(async (input: UpdateCoursePricingInput): Promise<{ success: boolean; error?: string }> => {
    try {
      const existingPrice = await db.coursePricing.get(input.id);

      if (!existingPrice) {
        return {
          success: false,
          error: 'Tarif non trouvé'
        };
      }

      const updatedData: Partial<CoursePricing> = {
        ...input,
        updatedAt: Date.now()
      };

      // Supprimer les champs qui ne doivent pas être mis à jour
      delete (updatedData as any).id;
      delete (updatedData as any).createdAt;

      await db.coursePricing.update(input.id, updatedData);

      // Recharger les tarifs
      await loadPrices();

      return {
        success: true
      };
    } catch (err) {
      const errorObj = err instanceof Error
        ? err
        : new Error('Failed to update course pricing');
      console.error('[useCoursePricing] updatePrice error:', err);
      return {
        success: false,
        error: errorObj.message
      };
    }
  }, [loadPrices]);

  /**
   * Active ou désactive un tarif.
   *
   * @param id - ID du tarif
   * @param isActive - Nouveau statut
   * @returns Promise<{ success: boolean; error?: string }>
   */
  const togglePrice = useCallback(async (id: number, isActive: boolean): Promise<{ success: boolean; error?: string }> => {
    try {
      await db.coursePricing.update(id, {
        isActive: isActive ? 1 : 0,
        updatedAt: Date.now()
      });

      // Recharger les tarifs
      await loadPrices();

      return {
        success: true
      };
    } catch (err) {
      const errorObj = err instanceof Error
        ? err
        : new Error('Failed to toggle course pricing');
      console.error('[useCoursePricing] togglePrice error:', err);
      return {
        success: false,
        error: errorObj.message
      };
    }
  }, [loadPrices]);

  /**
   * Supprime un tarif.
   *
   * @param id - ID du tarif à supprimer
   * @returns Promise<{ success: boolean; error?: string }>
   */
  const deletePrice = useCallback(async (id: number): Promise<{ success: boolean; error?: string }> => {
    try {
      await db.coursePricing.delete(id);

      // Recharger les tarifs
      await loadPrices();

      return {
        success: true
      };
    } catch (err) {
      const errorObj = err instanceof Error
        ? err
        : new Error('Failed to delete course pricing');
      console.error('[useCoursePricing] deletePrice error:', err);
      return {
        success: false,
        error: errorObj.message
      };
    }
  }, [loadPrices]);

  /**
   * Recharge manuellement les tarifs.
   * Utile après une opération externe ou pour rafraîchir les données.
   */
  const refreshPrices = useCallback(async () => {
    await loadPrices();
  }, [loadPrices]);

  return {
    prices,
    isLoading,
    error,
    getPriceById,
    getPriceByType,
    createPrice,
    updatePrice,
    togglePrice,
    deletePrice,
    refreshPrices
  };
}
