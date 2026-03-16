// src/pages/Admin/Wallets/components/WalletModal.tsx
// Modal d'ajout/retrait de fonds

import { useEffect, useRef, useState } from 'react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number, description: string, type: 'deposit' | 'withdraw') => Promise<void>;
  studentName: string;
  currentBalance: number;
}

export function WalletModal({ isOpen, onClose, onSubmit, studentName, currentBalance }: WalletModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'deposit' | 'withdraw'>('deposit');

  // Focus et reset à l'ouverture
  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
      setAmount('');
      setDescription('');
      setType('deposit');
    }
  }, [isOpen]);

  // Fermeture sur Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit(numAmount, description, type);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="modal-title" className="text-lg font-semibold text-gray-900">
            Gérer le solde de {studentName}
          </h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Fermer la fenêtre"
            className="rounded-md p-1 hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Balance info */}
        <div className="mb-4 rounded-lg bg-gray-50 p-3">
          <p className="text-sm text-gray-600">Solde actuel</p>
          <p className="text-2xl font-bold text-gray-900">{currentBalance.toFixed(2)}€</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type d'opération */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setType('deposit')}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition ${
                type === 'deposit'
                  ? 'bg-green-600 text-white'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg className="w-4 h-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Ajouter
            </button>
            <button
              type="button"
              onClick={() => setType('withdraw')}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition ${
                type === 'withdraw'
                  ? 'bg-red-600 text-white'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg className="w-4 h-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
              Retirer
            </button>
          </div>

          {/* Montant */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Montant (€)
            </label>
            <input
              id="amount"
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="0.00"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Motif
            </label>
            <input
              id="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder={type === 'deposit' ? 'Ex: Ajout par virement, Espèces...' : 'Ex: Remboursement cours...'}
              required
            />
          </div>

          {/* Info warning pour retrait */}
          {type === 'withdraw' && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3">
              <p className="text-sm text-red-800">
                ⚠️ Le solde ne doit pas devenir négatif. Assurez-vous que le montant est inférieur ou égal au solde actuel.
              </p>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !amount || !description}
              className={`rounded-lg px-4 py-2 text-sm font-medium text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                type === 'deposit' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {isSubmitting ? 'Traitement...' : (type === 'deposit' ? 'Ajouter' : 'Retirer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
