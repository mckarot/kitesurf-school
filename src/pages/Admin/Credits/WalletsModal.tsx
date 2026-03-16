// src/pages/Admin/Credits/WalletsModal.tsx
// Modal d'ajout de fonds pour la page Credits (système euros v13)

import { useState, useEffect, useRef } from 'react';
import { addFundsToWallet } from '../../../utils/createReservationWithPayment';

interface WalletsModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: { id: number; name: string; balance: number } | null;
  onComplete: () => void;
}

export function WalletsModal({ isOpen, onClose, student, onComplete }: WalletsModalProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  // Reset when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setDescription('');
      setError('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Focus trap & Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!student) return;

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Le montant doit être supérieur à 0');
      return;
    }

    if (!description.trim()) {
      setError('Veuillez saisir un motif');
      return;
    }

    setIsSubmitting(true);
    setError('');

    console.log('[WalletsModal] Ajout de fonds:', {
      userId: student.id,
      amount: numAmount,
      description
    });

    try {
      const result = await addFundsToWallet(student.id, numAmount, description);
      console.log('[WalletsModal] Résultat:', result);
      
      if (result.success) {
        onComplete();
      } else {
        setError(result.error || 'Erreur lors de l\'ajout des fonds');
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('[WalletsModal] Erreur:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'ajout des fonds');
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal Panel */}
        <div
          ref={modalRef}
          className="inline-block w-full max-w-md my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl"
        >
          {/* Header */}
          <div className="bg-gradient-to-br from-green-600 to-emerald-600 px-6 py-4">
            <h2 className="text-lg font-semibold text-white">Ajouter des fonds</h2>
            <p className="text-green-100 text-sm mt-1">{student.name}</p>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-6">
            {/* Current Balance */}
            <div className="mb-6 p-4 bg-green-50 rounded-xl border border-green-200">
              <p className="text-sm text-green-700 font-medium mb-1">Solde actuel</p>
              <p className="text-3xl font-bold text-green-900">{student.balance.toFixed(2)}€</p>
            </div>

            {/* Amount */}
            <div className="mb-4">
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                Montant à ajouter (€)
              </label>
              <input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-4 py-2 text-lg focus:border-green-500 focus:ring-green-500"
                placeholder="0.00"
                required
                autoFocus
              />
            </div>

            {/* Description */}
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Motif
              </label>
              <input
                id="description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:ring-green-500"
                placeholder="Ex: Virement, Espèces, Chèque..."
                required
              />
            </div>

            {/* Info */}
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 Le nouveau solde sera de <span className="font-bold">{(student.balance + Number(amount || 0)).toFixed(2)}€</span>
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !amount || !description}
                className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Ajout en cours...' : 'Ajouter les fonds'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
