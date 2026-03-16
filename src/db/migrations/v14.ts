// src/db/migrations/v14.ts
// Migration v14 : Ajout de la table sessionExceptions pour gérer les annulations de sessions

import type { KiteSurfDB } from '../db';

/**
 * Configure la migration v14 de la base de données
 * 
 * Ajoute :
 * - Table sessionExceptions pour gérer les annulations et modifications de sessions
 * - Index sessionId pour filtrer par session
 * - Index composite [sessionId+type] pour requêtes combinées
 * 
 * Cas d'usage :
 * - Annuler des sessions pour congés, fériés, météo
 * - Garder l'historique des annulations
 * - Rembourser automatiquement les élèves affectés
 */
export function configureV14Migration(db: KiteSurfDB): void {
  // La configuration du schéma est faite dans db.ts version(14).stores()
  // Cette fonction est gardée pour la cohérence avec les autres migrations
  console.log('Database migrated to version 14: sessionExceptions table added');
}
