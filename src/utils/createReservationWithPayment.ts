// src/utils/createReservationWithPayment.ts
// Réservation de cours avec paiement en euros (système v13)

import { db } from '../db/db';
import type { UserWallet, CoursePricing, WalletTransaction, Reservation, User } from '../types';

export interface CreateReservationWithPaymentResult {
  success: boolean;
  error?: string;
  reservationId?: number;
  newBalance?: number;
  pricePaid?: number;
}

export interface CheckBalanceResult {
  canReserve: boolean;
  balance: number;
  requiredAmount: number;
  error?: string;
}

/**
 * Vérifie si l'utilisateur a un solde suffisant pour réserver un cours.
 * 
 * @param userId - ID de l'utilisateur
 * @param coursePricingId - ID du tarif du cours
 * @returns Promise<CheckBalanceResult>
 */
export async function checkBalanceForReservation(
  userId: number,
  coursePricingId: number
): Promise<CheckBalanceResult> {
  try {
    // Récupérer le wallet de l'utilisateur
    const wallet = await db.userWallets.where('userId').equals(userId).first();
    
    if (!wallet) {
      return {
        canReserve: false,
        balance: 0,
        requiredAmount: 0,
        error: 'Portefeuille non trouvé'
      };
    }

    // Récupérer le tarif du cours
    const pricing = await db.coursePricing.get(coursePricingId);
    
    if (!pricing || !pricing.isActive) {
      return {
        canReserve: false,
        balance: wallet.balance,
        requiredAmount: 0,
        error: 'Tarif non disponible'
      };
    }

    // Vérifier si le solde est suffisant
    if (wallet.balance < pricing.price) {
      return {
        canReserve: false,
        balance: wallet.balance,
        requiredAmount: pricing.price,
        error: `Solde insuffisant. Vous avez ${wallet.balance.toFixed(2)}€, ${pricing.price.toFixed(2)}€ requis.`
      };
    }

    return {
      canReserve: true,
      balance: wallet.balance,
      requiredAmount: pricing.price
    };
  } catch (error) {
    console.error('[checkBalanceForReservation] Error:', error);
    return {
      canReserve: false,
      balance: 0,
      requiredAmount: 0,
      error: error instanceof Error ? error.message : 'Erreur lors de la vérification du solde'
    };
  }
}

/**
 * Crée une réservation en débitant le montant du portefeuille de l'utilisateur.
 * 
 * Algorithme:
 * 1. Vérifie le solde du wallet utilisateur
 * 2. Vérifie que le tarif est actif
 * 3. Débite le montant du wallet
 * 4. Crée la réservation avec statut 'pending'
 * 5. Enregistre la transaction dans l'historique
 * 
 * Transaction atomique: si une étape échoue, tout est annulé.
 * 
 * @param userId - ID de l'utilisateur qui réserve
 * @param courseSessionId - ID de la session de cours
 * @param coursePricingId - ID du tarif du cours
 * @returns Promise<CreateReservationWithPaymentResult>
 */
export async function createReservationWithPayment(
  userId: number,
  courseSessionId: number,
  coursePricingId: number
): Promise<CreateReservationWithPaymentResult> {
  try {
    return await db.transaction('rw', db.userWallets, db.reservations, db.coursePricing, db.transactions, async () => {
      // Étape 1: Récupérer le wallet de l'utilisateur
      const wallet = await db.userWallets.where('userId').equals(userId).first();
      
      if (!wallet) {
        return {
          success: false,
          error: 'Portefeuille non trouvé'
        };
      }

      // Étape 2: Récupérer le tarif du cours
      const pricing = await db.coursePricing.get(coursePricingId);
      
      if (!pricing || !pricing.isActive) {
        return {
          success: false,
          error: 'Tarif non disponible'
        };
      }

      // Étape 3: Vérifier si le solde est suffisant
      if (wallet.balance < pricing.price) {
        return {
          success: false,
          error: `Solde insuffisant. Vous avez ${wallet.balance.toFixed(2)}€, ${pricing.price.toFixed(2)}€ requis.`
        };
      }

      // Étape 4: Débiter le montant du wallet
      const newBalance = wallet.balance - pricing.price;
      await db.userWallets.update(wallet.id, {
        balance: newBalance,
        updatedAt: Date.now()
      });

      // Étape 5: Créer la réservation avec statut 'pending'
      const reservationData: Omit<Reservation, 'id'> = {
        studentId: userId,
        courseId: courseSessionId,
        sessionId: courseSessionId,
        instructorId: null,
        status: 'pending',
        createdAt: Date.now(),
      };
      const reservationId = await db.reservations.add(reservationData as Reservation);

      // Étape 6: Enregistrer la transaction dans l'historique
      const transaction: Omit<WalletTransaction, 'id'> = {
        userId,
        amount: -pricing.price, // Négatif = débit
        type: 'reservation',
        description: `Réservation cours - ${pricing.courseType} (${pricing.duration})`,
        reservationId,
        createdAt: Date.now()
      };

      await db.transactions.add(transaction as any);

      // Succès: retour du résultat
      return {
        success: true,
        reservationId,
        newBalance,
        pricePaid: pricing.price
      };
    });
  } catch (error) {
    console.error('[createReservationWithPayment] Transaction error:', error);
    
    return {
      success: false,
      error: error instanceof Error
        ? `Erreur technique: ${error.message}`
        : 'Une erreur inattendue est survenue lors de la réservation'
    };
  }
}

/**
 * Ajoute des fonds au portefeuille d'un utilisateur.
 * Utilisé par l'admin pour créditer un compte.
 * 
 * @param userId - ID de l'utilisateur
 * @param amount - Montant à ajouter en euros
 * @param description - Description de la transaction
 * @returns Promise<{ success: boolean; newBalance?: number; error?: string }>
 */
export async function addFundsToWallet(
  userId: number,
  amount: number,
  description: string
): Promise<{ success: boolean; newBalance?: number; error?: string }> {
  if (amount <= 0) {
    return {
      success: false,
      error: 'Le montant doit être positif'
    };
  }

  console.log('[addFundsToWallet] Tables disponibles:', Array.from(db.tables.map(t => t.name)));

  try {
    // Utiliser db.table() au lieu de db.userWallets pour éviter les problèmes de migration
    const userWalletsTable = db.table('userWallets');
    const transactionsTable = db.table('transactions');

    return await db.transaction('rw', userWalletsTable, transactionsTable, async () => {
      const wallet = await userWalletsTable.where('userId').equals(userId).first();

      if (!wallet) {
        // Créer le wallet s'il n'existe pas (cas d'un nouvel utilisateur ou migration non faite)
        console.log('[addFundsToWallet] Wallet non trouvé, création pour userId:', userId);
        const newWallet = {
          userId,
          balance: amount,
          createdAt: Date.now()
        };
        await userWalletsTable.add(newWallet as UserWallet);

        // Enregistrer la transaction
        const transaction: Omit<WalletTransaction, 'id'> = {
          userId,
          amount,
          type: 'deposit',
          description: description + ' (premier versement)',
          createdAt: Date.now()
        };

        await transactionsTable.add(transaction as any);

        return {
          success: true,
          newBalance: amount
        };
      }

      const newBalance = wallet.balance + amount;
      await userWalletsTable.update(wallet.id, {
        balance: newBalance,
        updatedAt: Date.now()
      });

      // Enregistrer la transaction
      const transaction: Omit<WalletTransaction, 'id'> = {
        userId,
        amount, // Positif = crédit
        type: 'deposit',
        description,
        createdAt: Date.now()
      };

      await transactionsTable.add(transaction as any);

      return {
        success: true,
        newBalance
      };
    });
  } catch (error) {
    console.error('[addFundsToWallet] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de l\'ajout des fonds'
    };
  }
}

/**
 * Rembourse une réservation en créditant le portefeuille de l'utilisateur.
 * 
 * @param userId - ID de l'utilisateur
 * @param amount - Montant à rembourser en euros
 * @param reservationId - ID de la réservation annulée
 * @param description - Description du remboursement
 * @returns Promise<{ success: boolean; newBalance?: number; error?: string }>
 */
export async function refundReservation(
  userId: number,
  amount: number,
  reservationId: number,
  description: string
): Promise<{ success: boolean; newBalance?: number; error?: string }> {
  if (amount <= 0) {
    return {
      success: false,
      error: 'Le montant doit être positif'
    };
  }

  try {
    return await db.transaction('rw', db.userWallets, async () => {
      const wallet = await db.userWallets.where('userId').equals(userId).first();
      
      if (!wallet) {
        return {
          success: false,
          error: 'Portefeuille non trouvé'
        };
      }

      const newBalance = wallet.balance + amount;
      await db.userWallets.update(wallet.id, {
        balance: newBalance,
        updatedAt: Date.now()
      });

      // Enregistrer la transaction de remboursement
      const transaction: Omit<WalletTransaction, 'id'> = {
        userId,
        amount, // Positif = crédit
        type: 'refund',
        description,
        reservationId,
        createdAt: Date.now()
      };

      await db.transactions.add(transaction as any);

      return {
        success: true,
        newBalance
      };
    });
  } catch (error) {
    console.error('[refundReservation] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors du remboursement'
    };
  }
}
