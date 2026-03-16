// src/utils/reset-db.ts
// Utilitaire pour réinitialiser complètement la base de données

import { db } from '../db/db';

/**
 * Supprime complètement la base de données IndexedDB
 * À utiliser pour résoudre les problèmes de version/migration
 */
export async function resetDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase('KiteSurfSchoolDB');
    
    request.onsuccess = () => {
      console.log('✅ Base de données supprimée avec succès');
      console.log('🔄 Rechargez la page pour recréer la base de données avec la dernière version');
      resolve();
    };
    
    request.onerror = () => {
      console.error('❌ Erreur lors de la suppression de la base de données:', request.error);
      reject(request.error);
    };
    
    request.onblocked = () => {
      console.warn('⚠️ Suppression bloquée. Fermez tous les onglets utilisant ce site et réessayez.');
      reject(new Error('Database deletion blocked'));
    };
  });
}

/**
 * Vérifie la version actuelle de la base de données
 */
export function checkDatabaseVersion(): number {
  return db.verno;
}

/**
 * Affiche les tables disponibles dans la base de données
 */
export async function listDatabaseTables(): Promise<string[]> {
  const tables = await db.tables.map(t => t.name);
  console.log('📊 Tables disponibles:', tables);
  return tables;
}
