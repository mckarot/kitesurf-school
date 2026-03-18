// src/pages/Admin/Pricing/components/PackCardModal.tsx
// Modal d'édition des PackCards pour la page Admin Pricing

import { useState, useEffect } from 'react';
import type { PackCard, PackCardInput } from '../../../../types';
import { X, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PackCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PackCardInput) => Promise<void>;
  editingCard: PackCard | null;
}

export function PackCardModal({ isOpen, onClose, onSubmit, editingCard }: PackCardModalProps) {
  const [formData, setFormData] = useState<PackCardInput>({
    packType: 'pack_3',
    title: '',
    description: '',
    sessions: 3,
    price: 180,
    originalPrice: 210,
    discount: 30,
    features: [],
    badge: '',
    isHighlighted: 0,
    isActive: 1,
    color: 'from-purple-500 to-pink-500',
    icon: 'Star',
  });

  const [newFeature, setNewFeature] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingCard) {
      setFormData({
        packType: editingCard.packType,
        title: editingCard.title,
        description: editingCard.description,
        sessions: editingCard.sessions,
        price: editingCard.price,
        originalPrice: editingCard.originalPrice,
        discount: editingCard.discount,
        features: [...editingCard.features],
        badge: editingCard.badge || '',
        isHighlighted: editingCard.isHighlighted,
        isActive: editingCard.isActive,
        color: editingCard.color,
        icon: editingCard.icon,
      });
    } else {
      // Reset form for creation
      setFormData({
        packType: 'pack_3',
        title: '',
        description: '',
        sessions: 3,
        price: 180,
        originalPrice: 210,
        discount: 30,
        features: [],
        badge: '',
        isHighlighted: 0,
        isActive: 1,
        color: 'from-purple-500 to-pink-500',
        icon: 'Star',
      });
    }
    setNewFeature('');
  }, [editingCard, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting PackCard:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    }
  };

  // Calcul automatique du prix original et de la réduction si non définis
  const handlePriceChange = (newPrice: number) => {
    setFormData(prev => ({
      ...prev,
      price: newPrice,
      // Optionnel: recalcul automatique si desired
      // originalPrice: prev.sessions * 70, // basé sur le prix collectif par défaut
      // discount: (prev.sessions * 70) - newPrice
    }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', duration: 0.4 }}
          className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 text-white px-8 py-6 rounded-t-3xl flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">
                {editingCard ? 'Modifier PackCard' : 'Nouveau PackCard'}
              </h2>
              <p className="text-purple-100 mt-1">
                {editingCard ? 'Modifiez les informations du pack' : 'Créez un nouveau pack de séances'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/30 transition-all"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Type de pack */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Type de pack *
              </label>
              <select
                value={formData.packType}
                onChange={e => setFormData(prev => ({ ...prev, packType: e.target.value as PackCard['packType'] }))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
                disabled={!!editingCard}
              >
                <option value="pack_3">Pack 3 séances</option>
                <option value="pack_6">Pack 6 séances</option>
                <option value="pack_10">Pack 10 séances</option>
              </select>
            </div>

            {/* Titre et Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Titre *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
                  placeholder="Ex: Pack Découverte"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Nombre de séances *
                </label>
                <input
                  type="number"
                  value={formData.sessions}
                  onChange={e => setFormData(prev => ({ ...prev, sessions: parseInt(e.target.value) || 1 }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
                  min="1"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
                rows={3}
                placeholder="Décrivez le pack..."
                required
              />
            </div>

            {/* Prix, Prix original, Réduction */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Prix actuel (€) *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={e => handlePriceChange(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Prix original barré (€)
                </label>
                <input
                  type="number"
                  value={formData.originalPrice}
                  onChange={e => setFormData(prev => ({ ...prev, originalPrice: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Économie (€)
                </label>
                <input
                  type="number"
                  value={formData.discount}
                  onChange={e => setFormData(prev => ({ ...prev, discount: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 border-2 border-green-200 bg-green-50 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all"
                  min="0"
                  readOnly
                />
              </div>
            </div>

            {/* Features */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Avantages (Features)
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newFeature}
                  onChange={e => setNewFeature(e.target.value)}
                  onKeyPress={e => handleKeyPress(e, handleAddFeature)}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
                  placeholder="Ajouter un avantage..."
                />
                <button
                  type="button"
                  onClick={handleAddFeature}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-2">
                {formData.features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-xl border-2 border-gray-100"
                  >
                    <span className="text-gray-700">{feature}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Badge */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Badge (optionnel)
              </label>
              <input
                type="text"
                value={formData.badge}
                onChange={e => setFormData(prev => ({ ...prev, badge: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
                placeholder="Ex: Meilleure offre"
              />
              <p className="text-xs text-gray-500 mt-1">Laissez vide pour aucun badge</p>
            </div>

            {/* Color and Icon */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Couleur (dégradé Tailwind) *
                </label>
                <select
                  value={formData.color}
                  onChange={e => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
                >
                  <option value="from-purple-500 to-pink-500">Purple → Pink</option>
                  <option value="from-blue-500 to-cyan-400">Blue → Cyan</option>
                  <option value="from-green-500 to-emerald-400">Green → Emerald</option>
                  <option value="from-orange-500 to-yellow-400">Orange → Yellow</option>
                  <option value="from-red-500 to-rose-400">Red → Rose</option>
                  <option value="from-indigo-500 to-purple-400">Indigo → Purple</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Icône *
                </label>
                <select
                  value={formData.icon}
                  onChange={e => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
                >
                  <option value="Star">Star</option>
                  <option value="Award">Award</option>
                  <option value="Trophy">Trophy</option>
                  <option value="Medal">Medal</option>
                  <option value="Target">Target</option>
                  <option value="Zap">Zap</option>
                  <option value="Heart">Heart</option>
                  <option value="Users">Users</option>
                </select>
              </div>
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="font-bold text-gray-700">Pack actif</span>
                  <input
                    type="checkbox"
                    checked={formData.isActive === 1}
                    onChange={e => setFormData(prev => ({ ...prev, isActive: e.target.checked ? 1 : 0 }))}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-1">Si désactivé, le pack ne sera pas affiché</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="font-bold text-purple-700">Surbrillance</span>
                  <input
                    type="checkbox"
                    checked={formData.isHighlighted === 1}
                    onChange={e => setFormData(prev => ({ ...prev, isHighlighted: e.target.checked ? 1 : 0 }))}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                </label>
                <p className="text-xs text-purple-600 mt-1">Ajoute une bordure colorée et une ombre renforcée</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-6 border-t-2 border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Enregistrement...' : (editingCard ? 'Mettre à jour' : 'Créer')}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
