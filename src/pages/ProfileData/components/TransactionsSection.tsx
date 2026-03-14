// src/pages/ProfileData/components/TransactionsSection.tsx

import type { UserTransactionExport } from '../../../types';

interface TransactionsSectionProps {
  transactions: UserTransactionExport[];
}

const typeLabels: Record<UserTransactionExport['type'], string> = {
  payment: 'Paiement',
  refund: 'Remboursement',
  credit_purchase: 'Achat crédit',
};

const statusLabels: Record<UserTransactionExport['status'], string> = {
  pending: 'En attente',
  completed: 'Complété',
  failed: 'Échoué',
  refunded: 'Remboursé',
};

const typeStyles: Record<UserTransactionExport['type'], string> = {
  payment: 'bg-blue-100 text-blue-800',
  refund: 'bg-orange-100 text-orange-800',
  credit_purchase: 'bg-green-100 text-green-800',
};

const statusStyles: Record<UserTransactionExport['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-purple-100 text-purple-800',
};

export function TransactionsSection({ transactions }: TransactionsSectionProps) {
  if (transactions.length === 0) {
    return (
      <p className="text-sm text-gray-500 italic">
        Aucune transaction
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Type
            </th>
            <th
              scope="col"
              className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Montant
            </th>
            <th
              scope="col"
              className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Statut
            </th>
            <th
              scope="col"
              className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Date
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="hover:bg-gray-50">
              <td className="px-3 py-3 text-sm whitespace-nowrap">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    typeStyles[transaction.type]
                  }`}
                >
                  {typeLabels[transaction.type]}
                </span>
              </td>
              <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap font-medium">
                {transaction.type === 'refund' ? '-' : ''}
                {transaction.amount.toFixed(2)} {transaction.currency}
              </td>
              <td className="px-3 py-3 text-sm whitespace-nowrap">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    statusStyles[transaction.status]
                  }`}
                >
                  {statusLabels[transaction.status]}
                </span>
              </td>
              <td className="px-3 py-3 text-sm text-gray-500 whitespace-nowrap">
                {new Date(transaction.createdAt).toLocaleDateString('fr-FR')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
