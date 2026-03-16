// src/hooks/useUserWallet.ts
// Hook de gestion du portefeuille en euros (système v13)

import { useState, useCallback, useEffect } from 'react';
import { db } from '../db/db';
import type { UserWallet, WalletTransaction } from '../types';
import { useAuth } from './useAuth';

/**
 * Interface de retour du hook useUserWallet
 */
interface UseUserWalletReturn {
  /** Wallet actuel de l'utilisateur connecté */
  wallet: UserWallet | null;
  /** Solde en euros */
  balance: number;
  /** État de chargement des données */
  isLoading: boolean;
  /** Erreur survenue lors du chargement ou des opérations */
  error: Error | null;
  /** Vérifie si l'utilisateur a un solde suffisant */
  hasSufficientBalance: (amount: number) => boolean;
  /** Recharge manuellement le solde */
  refreshWallet: () => Promise<void>;
  /** Historique des transactions */
  transactions: WalletTransaction[];
}

/**
 * Hook de gestion du portefeuille en euros de l'utilisateur connecté.
 *
 * Fonctionnalités:
 * - Affichage du solde en euros
 * - Vérification de solde avant réservation
 * - Historique des transactions
 * - Intégration avec useAuth pour l'utilisateur connecté
 *
 * Index Dexie utilisés:
 * - where('userId'): Récupération optimisée du wallet
 * - where('userId').orderBy('createdAt'): Transactions triées par date
 *
 * @returns UseUserWalletReturn - Interface complète de gestion du wallet
 *
 * @example
 * ```typescript
 * function StudentReservationForm() {
 *   const { wallet, balance, hasSufficientBalance } = useUserWallet();
 *
 *   const coursePrice = 70;
 *   if (hasSufficientBalance(coursePrice)) {
 *     // L'utilisateur peut réserver
 *   }
 *
 *   return <div>Solde: {balance.toFixed(2)}€</div>;
 * }
 * ```
 */
export function useUserWallet(): UseUserWalletReturn {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<UserWallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Charge le wallet et l'historique des transactions de l'utilisateur connecté.
   */
  const loadWallet = useCallback(async () => {
    // Si aucun utilisateur connecté, on ne charge rien
    if (!user) {
      setWallet(null);
      setTransactions([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // Récupération du wallet utilisateur
      const userWallet = await db.userWallets.where('userId').equals(user.id).first();
      setWallet(userWallet || null);

      // Récupération des transactions (50 dernières)
      const userTransactions = await db.transactions
        .where('userId')
        .equals(user.id)
        .reverse()
        .limit(50)
        .toArray();

      setTransactions(userTransactions as unknown as WalletTransaction[]);
    } catch (err) {
      const errorObj = err instanceof Error
        ? err
        : new Error('Failed to load user wallet');
      setError(errorObj);
      console.error('[useUserWallet] loadWallet error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  /**
   * Effet de chargement initial et lors du changement d'utilisateur.
   */
  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  /**
   * Vérifie si l'utilisateur a un solde suffisant.
   *
   * @param amount - Montant requis en euros
   * @returns boolean - true si le solde est suffisant
   *
   * @example
   * ```typescript
   * if (hasSufficientBalance(70)) {
   *   // L'utilisateur peut réserver ce cours à 70€
   * }
   * ```
   */
  const hasSufficientBalance = useCallback((amount: number): boolean => {
    if (!wallet) {
      return false;
    }
    return wallet.balance >= amount;
  }, [wallet]);

  /**
   * Recharge manuellement le wallet.
   * Utile après une opération externe ou pour rafraîchir les données.
   */
  const refreshWallet = useCallback(async () => {
    await loadWallet();
  }, [loadWallet]);

  return {
    wallet,
    balance: wallet?.balance ?? 0,
    isLoading,
    error,
    hasSufficientBalance,
    refreshWallet,
    transactions
  };
}

/**
 * Hook utilitaire pour obtenir le wallet d'un utilisateur spécifique (par ID).
 * Utile pour les vues admin qui consultent le solde d'un étudiant.
 *
 * @param userId - ID de l'utilisateur dont on veut le wallet
 * @returns Interface complète (sans refreshWallet)
 */
export function useUserWalletById(userId: number): Omit<UseUserWalletReturn, 'refreshWallet'> & {
  refreshWallet: () => Promise<void>;
} {
  const [wallet, setWallet] = useState<UserWallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadWallet = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const userWallet = await db.userWallets.where('userId').equals(userId).first();
      setWallet(userWallet || null);

      const userTransactions = await db.transactions
        .where('userId')
        .equals(userId)
        .reverse()
        .limit(50)
        .toArray();

      setTransactions(userTransactions as unknown as WalletTransaction[]);
    } catch (err) {
      const errorObj = err instanceof Error
        ? err
        : new Error('Failed to load user wallet');
      setError(errorObj);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  const hasSufficientBalance = useCallback((amount: number): boolean => {
    if (!wallet) {
      return false;
    }
    return wallet.balance >= amount;
  }, [wallet]);

  const refreshWallet = useCallback(async () => {
    await loadWallet();
  }, [loadWallet]);

  return {
    wallet,
    balance: wallet?.balance ?? 0,
    isLoading,
    error,
    hasSufficientBalance,
    refreshWallet,
    transactions
  };
}
