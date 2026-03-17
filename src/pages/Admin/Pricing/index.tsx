// src/pages/Admin/Pricing/index.tsx
// Page Admin de gestion des tarifs (système v13) - Design Metalab

import { useState } from 'react';
import { useCoursePricing } from '../../../hooks/useCoursePricing';
import type { CoursePricing, CoursePricingInput } from '../../../types';
import { PricingModal } from './components/PricingModal';
import { motion } from 'framer-motion';
import { Wallet, Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Users, Clock, Info } from 'lucide-react';

export function PricingPage() {
  const { prices, isLoading, error, createPrice, updatePrice, togglePrice, deletePrice } = useCoursePricing();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrice, setEditingPrice] = useState<CoursePricing | null>(null);

  const handleCreate = () => {
    setEditingPrice(null);
    setIsModalOpen(true);
  };

  const handleEdit = (price: CoursePricing) => {
    setEditingPrice(price);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: CoursePricingInput) => {
    if (editingPrice) {
      await updatePrice({ ...data, id: editingPrice.id });
    } else {
      await createPrice(data);
    }
  };

  const handleToggle = async (id: number, currentIsActive: 0 | 1) => {
    await togglePrice(id, currentIsActive === 1);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce tarif ?')) {
      await deletePrice(id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Chargement des tarifs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Hero Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 text-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => window.history.back()}
                className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/30 transition-all"
                aria-label="Retour"
              >
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </motion.button>
              <div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="flex items-center space-x-3 mb-3"
                >
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold">Gestion des Tarifs</h1>
                </motion.div>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-purple-100 text-lg"
                >
                  Configurez les prix des cours en euros
                </motion.p>
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="flex items-center space-x-3"
            >
              <a
                href="/admin/wallets"
                className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full font-semibold hover:bg-white/30 transition-all"
              >
                <Wallet className="w-5 h-5" />
                <span>Portefeuilles</span>
              </a>
              <a
                href="/admin/credits"
                className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full font-semibold hover:bg-white/30 transition-all"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Crédits</span>
              </a>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-8">
        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 p-6 shadow-xl"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
              <Info className="w-6 h-6 text-white" />
            </div>
            <div className="text-white">
              <p className="font-bold text-lg mb-2">Système de tarifs en euros</p>
              <p className="text-blue-100">
                Les tarifs que vous créez ici sont affichés sur la page{' '}
                <a href="/courses" className="underline hover:text-white font-semibold" target="_blank" rel="noopener noreferrer">
                  /courses
                </a>{' '}
                et utilisés pour les réservations. Les élèves doivent avoir le montant correspondant dans leur portefeuille pour réserver.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 rounded-2xl bg-red-50 border-2 border-red-200 p-6 shadow-lg"
          >
            <p className="text-red-800 font-bold text-lg">Une erreur est survenue</p>
            <p className="text-red-700 mt-2">{error.message}</p>
          </motion.div>
        )}

        {/* Action Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="bg-white rounded-2xl shadow-lg px-6 py-4 border border-purple-100">
            <p className="text-gray-600">
              <span className="text-3xl font-bold text-purple-600">{prices.filter(p => p.isActive === 1).length}</span>
              <span className="ml-2">tarif(s) actif(s) sur </span>
              <span className="text-3xl font-bold text-purple-600">{prices.length}</span>
              <span className="ml-2">au total</span>
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCreate}
            className="flex items-center gap-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 text-white font-bold shadow-lg hover:shadow-xl transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-500"
          >
            <Plus className="w-6 h-6" />
            Nouveau tarif
          </motion.button>
        </motion.div>

        {/* Pricing Grid */}
        {prices.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-center py-16 bg-white rounded-3xl shadow-xl border-2 border-purple-100"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
              <Wallet className="w-10 h-10 text-gray-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-3">Aucun tarif configuré</p>
            <p className="text-gray-500 mb-6">Créez votre premier tarif pour commencer</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCreate}
              className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 text-white font-bold shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="w-6 h-6" />
              Créer un tarif
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {prices.map((price, index) => (
              <motion.div
                key={price.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className={`rounded-3xl p-6 shadow-xl border-2 transition-all ${
                  price.isActive === 1
                    ? 'bg-white border-purple-100 hover:shadow-2xl'
                    : 'bg-gray-50 border-gray-200 opacity-75'
                }`}
              >
                {/* Header with badge and price */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                        price.isActive === 1
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                          : 'bg-gray-300 text-gray-600'
                      }`}
                    >
                      {price.isActive === 1 ? '✓ Actif' : '✗ Inactif'}
                    </span>
                    {price.sessions && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                        Pack {price.sessions} séances
                      </span>
                    )}
                  </div>
                  <span className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {price.price}€
                  </span>
                </div>

                {/* Course type */}
                <h3 className="text-xl font-bold text-gray-900 mb-4 capitalize">
                  {price.courseType.replace('_', ' ')}
                </h3>

                {/* Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-gray-700">
                    <Clock className="w-5 h-5 mr-3 text-purple-600" />
                    <span className="font-medium">{price.duration}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Users className="w-5 h-5 mr-3 text-pink-600" />
                    <span className="font-medium">Max {price.maxStudents} élève{price.maxStudents > 1 ? 's' : ''}</span>
                  </div>
                </div>

                {/* Description */}
                {price.description && (
                  <p className="text-gray-600 mb-6 line-clamp-2 italic">"{price.description}"</p>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t-2 border-purple-100">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleToggle(price.id, price.isActive)}
                    className={`flex-1 rounded-xl px-4 py-3 font-bold transition-all ${
                      price.isActive === 1
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {price.isActive === 1 ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                      {price.isActive === 1 ? 'Désactiver' : 'Activer'}
                    </div>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleEdit(price)}
                    className="flex-1 rounded-xl border-2 border-purple-200 px-4 py-3 font-bold text-purple-700 hover:bg-purple-50 transition-all"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Edit2 className="w-5 h-5" />
                      Modifier
                    </div>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDelete(price.id)}
                    className="rounded-xl bg-gradient-to-r from-red-500 to-pink-600 px-4 py-3 font-bold text-white hover:shadow-lg transition-all"
                    aria-label={`Supprimer le tarif ${price.courseType}`}
                  >
                    <Trash2 className="w-5 h-5" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      {/* Modal */}
      <PricingModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPrice(null);
        }}
        onSubmit={handleSubmit}
        editingPrice={editingPrice}
      />
    </div>
  );
}
