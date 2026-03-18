// src/test/setup.ts
// Configuration globale pour les tests Vitest

import '@testing-library/jest-dom';
import { indexedDB } from 'fake-indexeddb';
import { afterEach } from 'vitest';

// Mock indexedDB pour Dexie.js
globalThis.indexedDB = indexedDB;

// Nettoyer la base de données après chaque test
afterEach(async () => {
  if (indexedDB) {
    const req = indexedDB.deleteDatabase('KiteSurfSchoolDB');
    await new Promise<void>((resolve) => {
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    });
  }
});
