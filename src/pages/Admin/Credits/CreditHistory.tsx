// src/pages/Admin/Credits/CreditHistory.tsx
// Historique des transactions en euros (système v13)

import { useRef, useEffect } from 'react';
import type { WalletTransaction } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';

interface CreditHistoryProps {
  studentId: number;
  studentName: string;
  transactions: WalletTransaction[];
  onClose: () => void;
}

/**
 * Composant d'affichage de l'historique des transactions pour un élève.
 */
export function CreditHistory({
  studentId,
  studentName,
  transactions,
  onClose,
}: CreditHistoryProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Focus sur le panneau quand il s'ouvre
  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  // Tri des transactions du plus récent au plus ancien
  const sortedTransactions = [...transactions].sort((a, b) => b.createdAt - a.createdAt);

  // Calcul du solde total
  const totalBalance = transactions.reduce((sum, t) => sum + t.amount, 0);

  // Type badges
  const getTypeBadge = (type: WalletTransaction['type']) => {
    switch (type) {
      case 'deposit':
        return <Badge variant="success">+ Dépôt</Badge>;
      case 'reservation':
        return <Badge variant="danger">- Réservation</Badge>;
      case 'refund':
        return <Badge variant="info">Remboursement</Badge>;
      case 'admin_adjustment':
        return <Badge variant="warning">Ajustement</Badge>;
      default:
        return <Badge variant="info">{type}</Badge>;
    }
  };

  return (
    <div
      ref={panelRef}
      tabIndex={-1}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden"
      aria-label={`Historique des transactions de ${studentName}`}
    >
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Historique des transactions
            </h3>
            <p className="text-sm text-gray-600 mt-1">{studentName}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Fermer l'historique"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </Button>
        </div>
      </div>

      {/* Résumé du solde */}
      <div className="px-6 py-4 bg-green-50 border-b border-green-100">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-600 uppercase tracking-wide">Solde actuel</p>
            <p className={`text-2xl font-bold ${
              totalBalance >= 70
                ? 'text-green-700'
                : totalBalance > 0
                ? 'text-yellow-700'
                : 'text-red-700'
            }`}>
              {totalBalance.toFixed(2)}€
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 uppercase tracking-wide">Transactions</p>
            <p className="text-2xl font-bold text-gray-700">{transactions.length}</p>
          </div>
        </div>
      </div>

      {/* Liste des transactions */}
      <div className="divide-y divide-gray-200">
        {sortedTransactions.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <svg
              className="w-12 h-12 text-gray-300 mx-auto mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-gray-600 font-medium">Aucune transaction</p>
            <p className="text-sm text-gray-500 mt-1">
              Les transactions apparaîtront ici après les premiers ajouts de fonds
            </p>
          </div>
        ) : (
          sortedTransactions.map((transaction) => (
            <div key={transaction.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.amount > 0
                      ? 'bg-green-100 text-green-600'
                      : 'bg-red-100 text-red-600'
                  }`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={transaction.amount > 0
                          ? "M12 4v16m8-8H4"
                          : "M20 12H4"
                        }
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(transaction.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getTypeBadge(transaction.type)}
                  <p className={`text-lg font-bold ${
                    transaction.amount > 0 ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {transaction.amount > 0 ? '+' : ''}{transaction.amount.toFixed(2)}€
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
