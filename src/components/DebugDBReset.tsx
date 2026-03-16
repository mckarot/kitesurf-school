// src/components/DebugDBReset.tsx
// Composant de debug pour réinitialiser la base de données

import { useState } from 'react';
import { db } from '../db/db';
import { Button } from './ui/Button';
import { Card, CardBody } from './ui/Card';

export function DebugDBReset() {
  const [isResetting, setIsResetting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [dbVersion, setDbVersion] = useState<number>(db.verno);
  const [tables, setTables] = useState<string[]>([]);
  const [codeVersion, setCodeVersion] = useState<string>('v13-seed-wallets');

  const loadTables = async () => {
    const tableNames = db.tables.map(t => t.name);
    setTables(tableNames);
  };

  const handleReset = async () => {
    if (!confirm('⚠️ Attention : Cela va supprimer TOUTES les données de la base de données. Êtes-vous sûr ?')) {
      return;
    }

    setIsResetting(true);
    setMessage(null);

    try {
      // Fermer la connexion
      await db.close();

      // Supprimer la base de données
      await new Promise<void>((resolve, reject) => {
        const request = indexedDB.deleteDatabase('KiteSurfSchoolDB');
        request.onsuccess = () => {
          console.log('✅ Base de données supprimée');
          resolve();
        };
        request.onerror = () => {
          console.error('❌ Erreur lors de la suppression:', request.error);
          reject(request.error);
        };
        request.onblocked = () => {
          console.warn('⚠️ Suppression bloquée');
          reject(new Error('Database deletion blocked - please close all tabs'));
        };
      });

      setMessage({
        type: 'success',
        text: '✅ Base de données supprimée avec succès. Rechargement...'
      });

      // Recharger la page après 1 seconde
      setTimeout(() => {
        location.reload();
      }, 1000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: `❌ Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      });
      setIsResetting(false);
    }
  };

  const handleRefreshInfo = async () => {
    setDbVersion(db.verno);
    await loadTables();
    setMessage({
      type: 'success',
      text: `ℹ️ Version DB: ${db.verno} | Tables: ${tables.join(', ')}`
    });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 border-2 border-red-200 shadow-2xl">
        <CardBody className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900">🔧 Debug DB</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">{codeVersion}</span>
              <button
                onClick={handleRefreshInfo}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                🔄 Refresh
              </button>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Version:</span>
              <span className="font-mono font-bold text-blue-600">{dbVersion}</span>
            </div>
            <div>
              <span className="text-gray-600">Tables ({tables.length}):</span>
              <div className="mt-1 p-2 bg-gray-50 rounded max-h-32 overflow-y-auto">
                {tables.length > 0 ? (
                  <ul className="text-xs space-y-1">
                    {tables.map(table => (
                      <li key={table} className="text-gray-700">• {table}</li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-gray-400 italic">Cliquez sur Refresh</span>
                )}
              </div>
            </div>
          </div>

          {message && (
            <div className={`mt-3 p-2 rounded text-xs ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            }`}>
              {message.text}
            </div>
          )}

          <Button
            variant="danger"
            onClick={handleReset}
            disabled={isResetting}
            className="w-full mt-3"
          >
            {isResetting ? '🔄 Suppression...' : '⚠️ Reset Complete DB'}
          </Button>

          <p className="mt-2 text-xs text-gray-500 text-center">
            Utile pour résoudre les erreurs de migration
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
