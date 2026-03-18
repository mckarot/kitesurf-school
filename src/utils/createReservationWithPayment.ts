// src/utils/createReservationWithPayment.ts
// Réservation de cours avec paiement en euros (système v13)

import { db } from '../db/db';
import type { UserWallet, CoursePricing, WalletTransaction, Reservation, User, CourseCard } from '../types';

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
 * @param coursePricingIdOrType - ID du tarif du cours OU type de cours ('collectif' | 'particulier' | 'duo')
 * @param price - Prix du cours (depuis CourseCard)
 * @returns Promise<CheckBalanceResult>
 */
export async function checkBalanceForReservation(
  userId: number,
  coursePricingIdOrType: number | CourseCard['courseType'],
  price?: number
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

    // Si le prix est fourni directement (depuis CourseCard), on l'utilise
    let requiredAmount: number;

    if (price !== undefined) {
      requiredAmount = price;
    } else {
      // Sinon, on cherche le tarif dans coursePricing (rétro-compatibilité)
      let pricing: CoursePricing | undefined;

      if (typeof coursePricingIdOrType === 'number') {
        pricing = await db.coursePricing.get(coursePricingIdOrType);
      } else {
        pricing = await db.coursePricing
          .where('courseType')
          .equals(coursePricingIdOrType)
          .first();
      }

      if (!pricing || !pricing.isActive) {
        return {
          canReserve: false,
          balance: wallet.balance,
          requiredAmount: 0,
          error: 'Tarif non disponible'
        };
      }

      requiredAmount = pricing.price;
    }

    // Vérifier si le solde est suffisant
    if (wallet.balance < requiredAmount) {
      return {
        canReserve: false,
        balance: wallet.balance,
        requiredAmount: requiredAmount,
        error: `Solde insuffisant. Vous avez ${wallet.balance.toFixed(2)}€, ${requiredAmount.toFixed(2)}€ requis.`
      };
    }

    return {
      canReserve: true,
      balance: wallet.balance,
      requiredAmount: requiredAmount
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
 * Version simplifiée qui utilise directement le prix depuis une CourseCard.
 *
 * @param userId - ID de l'utilisateur qui réserve
 * @param courseSessionId - ID de la session de cours
 * @param courseType - Type de cours ('collectif' | 'particulier' | 'duo')
 * @param price - Prix du cours (depuis CourseCard.price)
 * @returns Promise<CreateReservationWithPaymentResult>
 */
export async function createReservationWithPayment(
  userId: number,
  courseSessionId: number,
  courseType: CourseCard['courseType'],
  price: number
): Promise<CreateReservationWithPaymentResult> {
  try {
    return await db.transaction('rw', [db.userWallets, db.reservations, db.transactions, db.courseSessions], async () => {
      // Étape 1: Récupérer le wallet de l'utilisateur
      const wallet = await db.userWallets.where('userId').equals(userId).first();

      if (!wallet) {
        return {
          success: false,
          error: 'Portefeuille non trouvé'
        };
      }

      // Étape 2: Vérifier si le solde est suffisant
      if (wallet.balance < price) {
        return {
          success: false,
          error: `Solde insuffisant. Vous avez ${wallet.balance.toFixed(2)}€, ${price.toFixed(2)}€ requis.`
        };
      }

      // Étape 3: Vérifier si l'élève n'a pas déjà réservé cette session
      const allReservations = await db.reservations
        .where('studentId')
        .equals(userId)
        .toArray();

      const hasDuplicate = allReservations.some(r =>
        r.courseId === courseSessionId &&
        (r.status === 'pending' || r.status === 'confirmed')
      );

      if (hasDuplicate) {
        return {
          success: false,
          error: 'Vous avez déjà réservé cette session. Une réservation ne peut être faite qu\'une seule fois par session.'
        };
      }

      // Étape 4: Vérifier si la session n'est pas complète
      const session = await db.courseSessions.get(courseSessionId);
      
      if (!session) {
        return {
          success: false,
          error: 'Session non trouvée'
        };
      }

      // Compter le nombre de réservations confirmées pour cette session
      const sessionReservations = allReservations.filter(r =>
        r.courseId === courseSessionId &&
        (r.status === 'pending' || r.status === 'confirmed')
      );

      if (sessionReservations.length >= session.maxStudents) {
        return {
          success: false,
          error: `Session complète. Maximum ${session.maxStudents} élèves.`
        };
      }

      // Étape 5: Débiter le montant du wallet
      const newBalance = wallet.balance - price;
      await db.userWallets.update(wallet.id, {
        balance: newBalance,
        updatedAt: Date.now()
      });

      // Étape 6: Créer la réservation avec statut 'pending'
      const reservationData: Omit<Reservation, 'id'> = {
        studentId: userId,
        courseId: courseSessionId,
        sessionId: courseSessionId,
        instructorId: null,
        courseType: courseType,
        status: 'pending',
        pricePaid: price, // ← Stocker le prix payé
        createdAt: Date.now(),
      };
      const reservationId = await db.reservations.add(reservationData as Reservation);

      // Étape 7: Enregistrer la transaction dans l'historique
      const transaction: Omit<WalletTransaction, 'id'> = {
        userId,
        amount: -price, // Négatif = débit
        type: 'reservation',
        description: `Réservation cours - ${courseType}`,
        reservationId,
        createdAt: Date.now()
      };

      await db.transactions.add(transaction as any);

      // Succès: retour du résultat
      return {
        success: true,
        reservationId,
        newBalance,
        pricePaid: price
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
