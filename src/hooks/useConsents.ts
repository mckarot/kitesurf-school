// src/hooks/useConsents.ts

import { useState, useCallback, useEffect } from 'react';
import { db } from '../db/db';
import {
  hasValidConsent,
  getLatestConsent,
  createConsent,
  updateConsentPayload,
} from '../utils/consentManager';
import type { UserConsent, ConsentType, ConsentStatus } from '../types';

interface UseConsentsReturn {
  consents: UserConsent[];
  isLoading: boolean;
  error: Error | null;
  getConsent: (type: ConsentType) => UserConsent | undefined;
  hasConsent: (type: ConsentType) => boolean;
  updateConsent: (type: ConsentType, status: ConsentStatus) => Promise<void>;
  updateAllConsents: (consents: Record<ConsentType, ConsentStatus>) => Promise<void>;
  refreshConsents: () => Promise<void>;
}

/**
 * Hook React pour la gestion des consentements RGPD
 *
 * @param userId - ID de l'utilisateur dont on gère les consentements
 * @returns Objet avec les consentements et les méthodes de gestion
 *
 * @example
 * ```typescript
 * const { consents, hasConsent, updateConsent } = useConsents(userId);
 *
 * // Vérifier un consentement
 * if (hasConsent('marketing_emails')) {
 *   // Afficher contenu marketing
 * }
 *
 * // Mettre à jour un consentement
 * await updateConsent('marketing_emails', 'accepted');
 * ```
 */
export function useConsents(userId: number): UseConsentsReturn {
  const [consents, setConsents] = useState<UserConsent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Charge les consentements depuis la base de données
   */
  const loadConsents = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const userConsents = await db.userConsents
        .where('userId')
        .equals(userId)
        .toArray();

      setConsents(userConsents);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to load consents');
      setError(errorObj);
      console.error('[useConsents] Error loading consents:', errorObj);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Charge les consentements au montage ou quand userId change
  useEffect(() => {
    loadConsents();
  }, [loadConsents]);

  /**
   * Récupère le consentement le plus récent pour un type donné
   *
   * @param type - Type de consentement à rechercher
   * @returns Le consentement ou undefined si aucun n'existe
   */
  const getConsent = useCallback(
    (type: ConsentType): UserConsent | undefined => {
      return getLatestConsent(consents, type) ?? undefined;
    },
    [consents]
  );

  /**
   * Vérifie si l'utilisateur a un consentement accepté pour un type donné
   *
   * @param type - Type de consentement à vérifier
   * @returns true si un consentement accepté existe, false sinon
   */
  const hasConsent = useCallback(
    (type: ConsentType): boolean => {
      return hasValidConsent(consents, type);
    },
    [consents]
  );

  /**
   * Met à jour un consentement pour un type donné
   *
   * Crée un nouvel enregistrement si aucun n'existe,
   * ou met à jour l'existant avec un nouveau timestamp.
   *
   * @param type - Type de consentement à mettre à jour
   * @param status - Nouveau statut ('accepted' ou 'refused')
   * @throws Error en cas d'échec de l'opération
   */
  const updateConsent = useCallback(
    async (type: ConsentType, status: ConsentStatus): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        const existingConsent = getConsent(type);
        const version = '1.0'; // Version des CGU/Politique de confidentialité

        if (existingConsent !== undefined) {
          // Mettre à jour le consentement existant
          const updatePayload = updateConsentPayload(status, version);
          await db.userConsents.update(existingConsent.id, updatePayload);
        } else {
          // Créer un nouveau consentement
          const newConsent = createConsent(userId, type, status, version);
          await db.userConsents.add(newConsent as any); // Dexie ajoute l'id automatiquement
        }

        // Recharger les consentements pour mettre à jour l'état
        await loadConsents();
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error('Failed to update consent');
        setError(errorObj);
        console.error('[useConsents] Error updating consent:', errorObj);
        throw errorObj;
      } finally {
        setIsLoading(false);
      }
    },
    [userId, getConsent, loadConsents]
  );

  /**
   * Met à jour tous les consentements en une seule opération
   *
   * @param consentsToUpdate - Objet avec les statuts pour chaque type
   * @throws Error en cas d'échec de l'opération
   */
  const updateAllConsents = useCallback(
    async (consentsToUpdate: Record<ConsentType, ConsentStatus>): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        const consentTypes: ConsentType[] = [
          'marketing_emails',
          'photos_marketing',
          'analytics_cookies',
        ];

        // Utiliser une transaction Dexie pour assurer l'atomicité
        await db.transaction('rw', db.userConsents, async () => {
          for (const type of consentTypes) {
            const status = consentsToUpdate[type];
            const existingConsent = getConsent(type);
            const version = '1.0';

            if (existingConsent !== undefined) {
              const updatePayload = updateConsentPayload(status, version);
              await db.userConsents.update(existingConsent.id, updatePayload);
            } else {
              const newConsent = createConsent(userId, type, status, version);
              await db.userConsents.add(newConsent as any); // Dexie ajoute l'id automatiquement
            }
          }
        });

        // Recharger les consentements pour mettre à jour l'état
        await loadConsents();
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error('Failed to update all consents');
        setError(errorObj);
        console.error('[useConsents] Error updating all consents:', errorObj);
        throw errorObj;
      } finally {
        setIsLoading(false);
      }
    },
    [userId, getConsent, loadConsents]
  );

  /**
   * Rafraîchit manuellement les consentements depuis la base de données
   *
   * Utile après une action externe qui pourrait modifier les consentements.
   */
  const refreshConsents = useCallback(async (): Promise<void> => {
    await loadConsents();
  }, [loadConsents]);

  return {
    consents,
    isLoading,
    error,
    getConsent,
    hasConsent,
    updateConsent,
    updateAllConsents,
    refreshConsents,
  };
}
