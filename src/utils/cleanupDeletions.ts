// src/utils/cleanupDeletions.ts
// Script de nettoyage des suppressions de compte - Exécuté au démarrage de l'application
//
// Ce script recherche les demandes de suppression confirmées depuis >= 7 jours
// et exécute la suppression effective des comptes concernés.

import { db } from '../db/db';
import type { DeletionRequest } from '../types';
import { executeAccountDeletion } from './deleteAccountLogic';

/**
 * Délai de rétractation RGPD : 7 jours (en millisecondes)
 * Après confirmation, l'utilisateur a 7 jours pour annuler sa demande
 */
const RETRACTION_PERIOD_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Trouve les demandes de suppression prêtes à être exécutées
 * Critères :
 * - Statut : 'confirmed'
 * - confirmedAt + 7 jours <= now (délai de rétractation écoulé)
 * 
 * @returns Promise<DeletionRequest[]> - Liste des demandes à traiter
 */
export async function findReadyDeletions(): Promise<DeletionRequest[]> {
  try {
    const now = Date.now();
    const thresholdTime = now - RETRACTION_PERIOD_MS;

    // Utiliser l'index 'status' pour filtrer efficacement
    const confirmedRequests = await db
      .deletionRequests
      .where('status')
      .equals('confirmed')
      .toArray();

    // Filtrer celles dont le délai de 7 jours est écoulé
    const readyDeletions = confirmedRequests.filter((request) => {
      // Si confirmedAt n'est pas défini, utiliser requestedAt
      const confirmationTime = request.confirmedAt || request.requestedAt;
      const scheduledTime = request.scheduledFor || (confirmationTime + RETRACTION_PERIOD_MS);
      
      return now >= scheduledTime;
    });

    console.log(`Found ${readyDeletions.length} deletion requests ready for execution`);
    
    return readyDeletions;
  } catch (error) {
    console.error('Error finding ready deletions:', error);
    return [];
  }
}

/**
 * Exécute le nettoyage des suppressions de compte
 * 
 * Pour chaque demande prête :
 * 1. Exécute executeAccountDeletion()
 * 2. Marque la demande comme 'completed'
 * 3. Log le résultat
 * 
 * @returns Promise<{ processed: number; successes: number; failures: number }>
 */
export async function executeCleanupDeletions(): Promise<{
  processed: number;
  successes: number;
  failures: number;
}> {
  const readyDeletions = await findReadyDeletions();
  
  if (readyDeletions.length === 0) {
    console.log('No deletion requests to process');
    return { processed: 0, successes: 0, failures: 0 };
  }

  let successes = 0;
  let failures = 0;

  for (const request of readyDeletions) {
    try {
      console.log(`Processing deletion for user ${request.userId} (request #${request.id})`);

      // Exécuter la suppression du compte
      const result = await executeAccountDeletion(request.userId);

      if (result.success) {
        // Marquer la demande comme complétée
        await db.deletionRequests.update(request.id, {
          status: 'completed',
        });
        
        successes++;
        console.log(`✓ Successfully deleted account for user ${request.userId}`);
      } else {
        // Échec de la suppression
        await db.deletionRequests.update(request.id, {
          status: 'pending', // Revenir à pending pour réessai
        });
        
        failures++;
        console.error(`✗ Failed to delete account for user ${request.userId}: ${result.error}`);
      }
    } catch (error) {
      failures++;
      console.error(`✗ Error processing deletion request #${request.id}:`, error);
      
      // Tenter de marquer comme erreur pour investigation
      try {
        await db.deletionRequests.update(request.id, {
          status: 'cancelled',
        });
      } catch (updateError) {
        console.error(`Failed to update request status:`, updateError);
      }
    }
  }

  console.log(`Cleanup completed: ${successes} successes, ${failures} failures`);
  
  return {
    processed: readyDeletions.length,
    successes,
    failures,
  };
}

/**
 * Nettoie les anciennes demandes de suppression (archivage)
 * 
 * Supprime les demandes 'completed' ou 'cancelled' datant de plus de 1 an
 * Conformément au RGPD, on conserve les logs de suppression pendant 1 an maximum
 * 
 * @returns Promise<number> - Nombre de demandes archivées
 */
export async function archiveOldDeletionRequests(): Promise<number> {
  try {
    const now = Date.now();
    const oneYearMs = 365 * 24 * 60 * 60 * 1000;
    const thresholdTime = now - oneYearMs;

    // Trouver les demandes anciennes
    const oldRequests = await db
      .deletionRequests
      .filter((req) => {
        if (req.status !== 'completed' && req.status !== 'cancelled') {
          return false;
        }
        // Utiliser completedAt ou requestedAt comme référence
        const referenceTime = req.confirmedAt || req.requestedAt;
        return referenceTime < thresholdTime;
      })
      .toArray();

    if (oldRequests.length === 0) {
      console.log('No old deletion requests to archive');
      return 0;
    }

    // Supprimer les demandes anciennes
    const idsToDelete = oldRequests.map((req) => req.id);
    
    // Utiliser bulkDelete pour la performance
    await db.deletionRequests.bulkDelete(idsToDelete);

    console.log(`Archived ${oldRequests.length} old deletion requests`);
    
    return oldRequests.length;
  } catch (error) {
    console.error('Error archiving old deletion requests:', error);
    return 0;
  }
}

/**
 * Fonction principale exécutée au démarrage de l'application
 * 
 * Exécute :
 * 1. Le nettoyage des suppressions prêtes (confirmed depuis >= 7 jours)
 * 2. L'archivage des anciennes demandes (optionnel, peut être exécuté moins fréquemment)
 * 
 * @param options - Options de configuration
 * @param options.skipArchive - Skip l'archivage des anciennes demandes (défaut: false)
 * @returns Promise<{ cleanup: { processed: number; successes: number; failures: number }; archived?: number }>
 */
export async function runStartupCleanup(
  options: { skipArchive?: boolean } = {}
): Promise<{
  cleanup: { processed: number; successes: number; failures: number };
  archived?: number;
}> {
  console.log('=== Starting RGPD deletion cleanup ===');
  
  try {
    // Étape 1: Exécuter les suppressions prêtes
    const cleanupResult = await executeCleanupDeletions();

    // Étape 2: Archiver les anciennes demandes (optionnel)
    let archivedCount: number | undefined;
    if (!options.skipArchive) {
      archivedCount = await archiveOldDeletionRequests();
    }

    console.log('=== RGPD deletion cleanup completed ===');
    
    return {
      cleanup: cleanupResult,
      archived: archivedCount,
    };
  } catch (error) {
    console.error('=== RGPD deletion cleanup failed ===', error);
    return {
      cleanup: { processed: 0, successes: 0, failures: 1 },
    };
  }
}

/**
 * Wrapper pour exécution automatique au démarrage
 * 
 * À appeler dans le point d'entrée principal de l'application :
 * 
 * ```typescript
 * // src/main.tsx ou src/index.ts
 * import { runStartupCleanup } from './utils/cleanupDeletions';
 * 
 * // Exécuter le cleanup au démarrage (sans bloquer le rendu)
 * runStartupCleanup({ skipArchive: true }); // Archive moins fréquent (hebdomadaire)
 * 
 * // Continuer avec le rendu de l'application...
 * ```
 */
export function initializeDeletionCleanup(): void {
  // Exécuter de manière asynchrone sans bloquer le démarrage
  // skipArchive: true car l'archivage peut être fait moins fréquemment (cron hebdo)
  runStartupCleanup({ skipArchive: true })
    .then((result) => {
      console.log('Deletion cleanup initialized:', result);
    })
    .catch((error) => {
      console.error('Deletion cleanup initialization failed:', error);
    });
}
