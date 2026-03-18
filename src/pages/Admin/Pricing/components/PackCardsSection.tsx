// src/pages/Admin/Pricing/components/PackCardsSection.tsx
// Section d'affichage et gestion des PackCards dans la page Admin Pricing

import { useState } from 'react';
import type { PackCard } from '../../../../types';
import { PackCardModal } from './PackCardModal';
import { motion } from 'framer-motion';
import { Edit2, Trash2, ToggleLeft, ToggleRight, Star, Highlighter, Package } from 'lucide-react';

interface PackCardsSectionProps {
  cards: PackCard[];
  isLoading: boolean;
  onUpdateCard: (data: any) => Promise<void>;
  onToggleCard: (id: number, isActive: boolean) => Promise<void>;
  onToggleHighlight: (id: number, isHighlighted: boolean) => Promise<void>;
  onDeleteCard: (id: number) => Promise<void>;
}

export function PackCardsSection({
  cards,
  isLoading,
  onUpdateCard,
  onToggleCard,
  onToggleHighlight,
  onDeleteCard,
}: PackCardsSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<PackCard | null>(null);

  const handleEdit = (card: PackCard) => {
    setEditingCard(card);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingCard(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: any) => {
    // Ajouter l'id si on édite une carte existante
    if (editingCard) {
      await onUpdateCard({ ...data, id: editingCard.id });
    } else {
      await onUpdateCard(data);
    }
  };

  const handleToggle = async (id: number, currentIsActive: 0 | 1) => {
    await onToggleCard(id, currentIsActive === 1);
  };

  const handleHighlight = async (id: number, currentIsHighlighted: 0 | 1) => {
    await onToggleHighlight(id, currentIsHighlighted === 1);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette PackCard ?')) {
      await onDeleteCard(id);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600 mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Chargement des PackCards...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">PackCards</h3>
          <p className="text-gray-600 mt-1">Gérez les cartes de packs (3, 6, 10 séances)</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCreate}
          className="flex items-center gap-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-white font-bold shadow-lg hover:shadow-xl transition-all"
        >
          <Package className="w-5 h-5" />
          Nouveau PackCard
        </motion.button>
      </div>

      {/* Cards Grid */}
      {cards.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl shadow-xl border-2 border-purple-100">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10 text-gray-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-3">Aucune PackCard</p>
          <p className="text-gray-500 mb-6">Créez votre premier pack de séances</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCreate}
            className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 text-white font-bold shadow-lg hover:shadow-xl transition-all"
          >
            <Package className="w-6 h-6" />
            Créer une PackCard
          </motion.button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className={`rounded-3xl p-6 shadow-xl border-2 transition-all relative ${
                card.isActive === 1
                  ? card.isHighlighted === 1
                    ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-500 shadow-2xl ring-4 ring-purple-200'
                    : 'bg-white border-purple-100 hover:shadow-2xl'
                  : 'bg-gray-50 border-gray-200 opacity-75'
              }`}
            >
              {/* Badge */}
              {card.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                    {card.badge}
                  </div>
                </div>
              )}

              {/* Header with highlight badge */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                    <Package className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">{card.title}</h4>
                    <p className="text-sm text-gray-600">{card.sessions} séances</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {card.isHighlighted === 1 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                      <Star className="w-3 h-3 mr-1" />
                      En avant
                    </span>
                  )}
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                      card.isActive === 1
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {card.isActive === 1 ? '✓' : '✗'}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-600 mb-4 text-sm">{card.description}</p>

              {/* Pricing */}
              <div className="mb-4">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {card.price}€
                  </span>
                  {card.originalPrice && (
                    <span className="text-lg text-gray-500 line-through">
                      {card.originalPrice}€
                    </span>
                  )}
                </div>
                {card.discount !== undefined && card.discount > 0 && (
                  <div className="mt-2 inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">
                    <Star className="w-4 h-4 mr-1" />
                    Économisez {card.discount}€
                  </div>
                )}
              </div>

              {/* Features preview */}
              {card.features.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-bold text-gray-500 mb-2">
                    {card.features.length} avantage{card.features.length > 1 ? 's' : ''}
                  </p>
                  <ul className="space-y-1">
                    {card.features.slice(0, 3).map((feature, i) => (
                      <li key={i} className="text-xs text-gray-600 flex items-start">
                        <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2 mt-1 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                    {card.features.length > 3 && (
                      <li className="text-xs text-purple-600 font-semibold">
                        +{card.features.length - 3} autres...
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t-2 border-gray-100">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleHighlight(card.id, card.isHighlighted)}
                  className={`flex-1 rounded-xl px-3 py-2 font-bold text-xs transition-all ${
                    card.isHighlighted === 1
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1">
                    <Highlighter className="w-4 h-4" />
                    {card.isHighlighted === 1 ? 'Retirer' : 'Mettre en avant'}
                  </div>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleEdit(card)}
                  className="flex-1 rounded-xl border-2 border-purple-200 px-3 py-2 font-bold text-xs text-purple-700 hover:bg-purple-50 transition-all"
                >
                  <div className="flex items-center justify-center gap-1">
                    <Edit2 className="w-4 h-4" />
                    Modifier
                  </div>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDelete(card.id)}
                  className="rounded-xl bg-gradient-to-r from-red-500 to-pink-600 px-3 py-2 font-bold text-xs text-white hover:shadow-lg transition-all"
                  aria-label={`Supprimer ${card.title}`}
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <PackCardModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCard(null);
        }}
        onSubmit={handleSubmit}
        editingCard={editingCard}
      />
    </div>
  );
}
