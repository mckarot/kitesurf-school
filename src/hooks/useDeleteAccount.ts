// src/hooks/useDeleteAccount.ts

import { useState, useCallback } from 'react';
import type {
  DeletionRequest,
  DeletionConfirmationResult,
} from '../types';
import {
  createDeletionRequest,
  confirmDeletionRequest,
  cancelDeletionRequest,
  getDeletionRequestsByUser,
  getDeletionRequestByToken,
} from '../utils/deleteAccountLogic';

interface DeletionRequestResult {
  success: boolean;
  error?: string;
  request?: DeletionRequest | null;
}

interface UseDeleteAccountReturn {
  requestDeletion: (password: string, reason?: string) => Promise<DeletionRequestResult>;
  confirmDeletion: (token: string) => Promise<DeletionConfirmationResult>;
  cancelDeletion: () => Promise<DeletionConfirmationResult>;
  getDeletionStatus: () => Promise<DeletionRequest | null>;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook React pour la gestion de suppression de compte (RGPD Article 17)
 *
 * @param userId - ID de l'utilisateur connecté
 * @returns UseDeleteAccountReturn
 */
export function useDeleteAccount(userId: number): UseDeleteAccountReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Crée une demande de suppression de compte
   *
   * @param password - Mot de passe de l'utilisateur pour vérification
   * @param reason - Motif de suppression (optionnel)
   * @returns Promise<DeletionRequestResult>
   */
  const requestDeletion = useCallback(
    async (password: string, reason?: string): Promise<DeletionRequestResult> => {
      setIsLoading(true);
      setError(null);

      try {
        // Note: La vérification du mot de passe devrait être faite côté serveur
        // Dans cette implémentation client-side, on suppose que l'utilisateur est déjà authentifié
        if (!password) {
          throw new Error('Le mot de passe est requis');
        }

        const request = await createDeletionRequest(userId, reason);

        if (!request) {
          return {
            success: false,
            error: 'Impossible de créer la demande de suppression. Vérifiez que vous n\'avez pas de réservations actives ou de crédits de cours.',
          };
        }

        return {
          success: true,
          request,
        };
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error('Erreur lors de la demande de suppression');
        setError(errorObj);
        return {
          success: false,
          error: errorObj.message,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [userId]
  );

  /**
   * Confirme une demande de suppression via le token
   *
   * @param token - Token de confirmation reçu par email
   * @returns Promise<DeletionConfirmationResult>
   */
  const confirmDeletion = useCallback(
    async (token: string): Promise<DeletionConfirmationResult> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await confirmDeletionRequest(token);
        return result;
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error('Erreur lors de la confirmation');
        setError(errorObj);
        return {
          success: false,
          error: errorObj.message,
        };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Annule une demande de suppression en cours
   *
   * @returns Promise<DeletionConfirmationResult>
   */
  const cancelDeletion = useCallback(async (): Promise<DeletionConfirmationResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await cancelDeletionRequest(userId);
      return result;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Erreur lors de l\'annulation');
      setError(errorObj);
      return {
        success: false,
        error: errorObj.message,
      };
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  /**
   * Récupère le statut de la demande de suppression pour l'utilisateur
   *
   * @returns Promise<DeletionRequest | null>
   */
  const getDeletionStatus = useCallback(async (): Promise<DeletionRequest | null> => {
    try {
      const requests = await getDeletionRequestsByUser(userId);
      // Retourner la demande active la plus récente (pending ou confirmed)
      const activeRequest = requests.find(
        (req) => req.status === 'pending' || req.status === 'confirmed'
      );
      return activeRequest ?? null;
    } catch (err) {
      console.error('Error fetching deletion status:', err);
      return null;
    }
  }, [userId]);

  return {
    requestDeletion,
    confirmDeletion,
    cancelDeletion,
    getDeletionStatus,
    isLoading,
    error,
  };
}
