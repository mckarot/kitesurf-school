// src/pages/Admin/Pricing/components/CourseCardModal.tsx
// Modal d'édition des CourseCards pour la page Admin Pricing

import { useState, useEffect } from 'react';
import type { CourseCard, CourseCardInput } from '../../../../types';
import { X, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CourseCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CourseCardInput) => Promise<void>;
  editingCard: CourseCard | null;
}

const AVAILABLE_ICONS = [
  'Users',
  'User',
  'UsersRound',
  'Star',
  'Award',
  'Wind',
  'Clock',
  'Calendar',
  'Check',
  'Heart',
  'Zap',
  'Target',
  'Trophy',
  'Medal',
  'Flame',
  'Droplet',
  'Sun',
  'Moon',
  'Cloud',
  'CloudRain',
];

const COLOR_OPTIONS = [
  { label: 'Blue/Cyan', value: 'from-blue-500 to-cyan-400' },
  { label: 'Purple/Pink', value: 'from-purple-500 to-pink-400' },
  { label: 'Orange/Yellow', value: 'from-orange-500 to-yellow-400' },
  { label: 'Green/Teal', value: 'from-green-500 to-teal-400' },
  { label: 'Red/Orange', value: 'from-red-500 to-orange-400' },
  { label: 'Indigo/Purple', value: 'from-indigo-500 to-purple-400' },
  { label: 'Pink/Rose', value: 'from-pink-500 to-rose-400' },
  { label: 'Sky/Blue', value: 'from-sky-500 to-blue-400' },
];

export function CourseCardModal({ isOpen, onClose, onSubmit, editingCard }: CourseCardModalProps) {
  const [formData, setFormData] = useState<CourseCardInput>({
    courseType: 'collectif',
    title: '',
    description: '',
    price: 70,
    duration: '2h30',
    maxStudents: 6,
    level: 'Tous niveaux',
    features: [],
    badge: '',
    isHighlighted: 0,
    color: 'from-blue-500 to-cyan-400',
    icon: 'Users',
    isActive: 1,
  });

  const [newFeature, setNewFeature] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingCard) {
      setFormData({
        courseType: editingCard.courseType,
        title: editingCard.title,
        description: editingCard.description,
        price: editingCard.price,
        duration: editingCard.duration,
        maxStudents: editingCard.maxStudents,
        level: editingCard.level,
        features: [...editingCard.features],
        badge: editingCard.badge || '',
        isHighlighted: editingCard.isHighlighted,
        color: editingCard.color,
        icon: editingCard.icon,
        isActive: editingCard.isActive,
      });
    } else {
      // Reset form for creation
      setFormData({
        courseType: 'collectif',
        title: '',
        description: '',
        price: 70,
        duration: '2h30',
        maxStudents: 6,
        level: 'Tous niveaux',
        features: [],
        badge: '',
        isHighlighted: 0,
        color: 'from-blue-500 to-cyan-400',
        icon: 'Users',
        isActive: 1,
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
      console.error('Error submitting CourseCard:', error);
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
                {editingCard ? 'Modifier CourseCard' : 'Nouvelle CourseCard'}
              </h2>
              <p className="text-purple-100 mt-1">
                {editingCard ? 'Modifiez les informations de la carte' : 'Créez une nouvelle carte de cours'}
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
            {/* Type de cours */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Type de cours *
              </label>
              <select
                value={formData.courseType}
                onChange={e => setFormData(prev => ({ ...prev, courseType: e.target.value as CourseCard['courseType'] }))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
                disabled={!!editingCard}
              >
                <option value="collectif">Collectif</option>
                <option value="particulier">Particulier</option>
                <option value="duo">Duo</option>
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
                  placeholder="Ex: Cours Collectif"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Niveau *
                </label>
                <input
                  type="text"
                  value={formData.level}
                  onChange={e => setFormData(prev => ({ ...prev, level: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
                  placeholder="Ex: Tous niveaux"
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
                placeholder="Décrivez le cours..."
                required
              />
            </div>

            {/* Prix, Durée, Max Students */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Prix (€) *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={e => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Durée *
                </label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={e => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
                  placeholder="Ex: 2h30"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Max élèves *
                </label>
                <input
                  type="number"
                  value={formData.maxStudents}
                  onChange={e => setFormData(prev => ({ ...prev, maxStudents: parseInt(e.target.value) || 1 }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
                  min="1"
                  required
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
                placeholder="Ex: Plus populaire"
              />
              <p className="text-xs text-gray-500 mt-1">Laissez vide pour aucun badge</p>
            </div>

            {/* Couleur et Icône */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Couleur (dégradé) *
                </label>
                <select
                  value={formData.color}
                  onChange={e => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
                >
                  {COLOR_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
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
                  {AVAILABLE_ICONS.map(icon => (
                    <option key={icon} value={icon}>
                      {icon}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="font-bold text-gray-700">Carte active</span>
                  <input
                    type="checkbox"
                    checked={formData.isActive === 1}
                    onChange={e => setFormData(prev => ({ ...prev, isActive: e.target.checked ? 1 : 0 }))}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-1">Si désactivée, la carte ne sera pas affichée</p>
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
