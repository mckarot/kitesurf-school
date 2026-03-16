// src/pages/Admin/Pricing/components/PricingModal.tsx
// Modal de création/édition des tarifs

import { useEffect, useRef, useState } from 'react';
import type { CoursePricing, CoursePricingInput } from '../../../../types';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CoursePricingInput) => Promise<void>;
  editingPrice?: CoursePricing | null;
}

export function PricingModal({ isOpen, onClose, onSubmit, editingPrice }: PricingModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CoursePricingInput>({
    courseType: 'collectif',
    price: 70,
    duration: '2h30',
    maxStudents: 6,
    description: '',
    isActive: 1,
  });

  // Focus sur le bouton de fermeture à l'ouverture
  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
      // Pré-remplir le formulaire si on édite
      if (editingPrice) {
        setFormData({
          courseType: editingPrice.courseType,
          price: editingPrice.price,
          duration: editingPrice.duration,
          maxStudents: editingPrice.maxStudents,
          sessions: editingPrice.sessions,
          description: editingPrice.description || '',
          isActive: editingPrice.isActive,
        });
      } else {
        // Reset du formulaire si on crée
        setFormData({
          courseType: 'collectif',
          price: 70,
          duration: '2h30',
          maxStudents: 6,
          description: '',
          isActive: 1,
        });
      }
    }
  }, [isOpen, editingPrice]);

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
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
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
            {editingPrice ? 'Modifier le tarif' : 'Nouveau tarif'}
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type de cours */}
          <div>
            <label htmlFor="courseType" className="block text-sm font-medium text-gray-700 mb-1">
              Type de cours
            </label>
            <select
              id="courseType"
              value={formData.courseType}
              onChange={(e) => setFormData({ ...formData, courseType: e.target.value as CoursePricingInput['courseType'] })}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
              required
              disabled={!!editingPrice} // Ne pas modifier le type en mode édition
            >
              <option value="collectif">Cours collectif</option>
              <option value="particulier">Cours particulier</option>
              <option value="duo">Cours duo</option>
              <option value="pack_3">Pack 3 séances</option>
              <option value="pack_6">Pack 6 séances</option>
              <option value="pack_10">Pack 10 séances</option>
            </select>
          </div>

          {/* Prix */}
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              Prix (€)
            </label>
            <input
              id="price"
              type="number"
              min="0"
              step="1"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          {/* Durée */}
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
              Durée
            </label>
            <input
              id="duration"
              type="text"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="2h30"
              required
            />
          </div>

          {/* Max élèves */}
          <div>
            <label htmlFor="maxStudents" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre max d'élèves
            </label>
            <input
              id="maxStudents"
              type="number"
              min="1"
              value={formData.maxStudents}
              onChange={(e) => setFormData({ ...formData, maxStudents: Number(e.target.value) })}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          {/* Nombre de séances (pour les packs) */}
          {(formData.courseType === 'pack_3' || formData.courseType === 'pack_6' || formData.courseType === 'pack_10') && (
            <div>
              <label htmlFor="sessions" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de séances
              </label>
              <input
                id="sessions"
                type="number"
                min="1"
                value={formData.sessions || 1}
                onChange={(e) => setFormData({ ...formData, sessions: Number(e.target.value) })}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          )}

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
              rows={3}
              placeholder="Décrivez ce tarif..."
            />
          </div>

          {/* Statut actif/inactif */}
          <div className="flex items-center gap-2">
            <input
              id="isActive"
              type="checkbox"
              checked={formData.isActive === 1}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked ? 1 : 0 })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">
              Tarif actif (affiché sur /courses)
            </label>
          </div>

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
              disabled={isSubmitting}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Enregistrement...' : (editingPrice ? 'Modifier' : 'Créer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
