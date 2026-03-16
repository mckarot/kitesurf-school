// src/pages/Admin/Pricing/index.tsx
// Page Admin de gestion des tarifs (système v13)

import { useState } from 'react';
import { useCoursePricing } from '../../../hooks/useCoursePricing';
import type { CoursePricing, CoursePricingInput } from '../../../types';
import { PricingModal } from './components/PricingModal';

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div aria-busy="true" aria-live="polite" className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
          <p className="text-gray-600">Chargement des tarifs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a href="/admin" className="text-gray-600 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </a>
              <h1 className="text-xl font-bold text-gray-900">Gestion des tarifs</h1>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="/admin/wallets"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition"
                aria-label="Gérer les portefeuilles élèves"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2.5S10.343 13 12 13s3-1.395 3-2.5S13.657 8 12 8zm0 6c-1.105 0-2 .895-2 2s.895 2 2 2 2-.895 2-2-.895-2-2-2zm0-10C6.477 4 2 8.477 2 14s4.477 10 10 10 10-4.477 10-10S17.523 4 12 4z" />
                </svg>
                Portefeuilles
              </a>
              <a
                href="/admin/credits"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition"
                aria-label="Gérer les crédits (système legacy)"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Crédits (legacy)
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Info banner */}
        <div className="mb-6 rounded-lg bg-blue-50 border border-blue-200 p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Système de tarifs en euros</p>
              <p>
                Les tarifs que vous créez ici sont affichés sur la page{' '}
                <a href="/courses" className="underline hover:text-blue-900" target="_blank" rel="noopener noreferrer">
                  /courses
                </a>{' '}
                et utilisés pour les réservations. Les élèves doivent avoir le montant correspondant dans leur portefeuille pour réserver.
              </p>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div role="alert" className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-800 font-semibold">Une erreur est survenue</p>
            <p className="text-sm text-red-700 mt-1">{error.message}</p>
          </div>
        )}

        {/* Action bar */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-600">
            {prices.filter(p => p.isActive === 1).length} tarif(s) actif(s) sur {prices.length} au total
          </p>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nouveau tarif
          </button>
        </div>

        {/* Pricing list */}
        {prices.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-gray-600 font-medium">Aucun tarif configuré</p>
            <p className="text-gray-500 text-sm mt-1">Créez votre premier tarif pour commencer</p>
            <button
              onClick={handleCreate}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Créer un tarif
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {prices.map((price) => (
              <div
                key={price.id}
                className={`rounded-xl border p-4 transition-all ${
                  price.isActive === 1
                    ? 'bg-white border-gray-200 shadow-sm hover:shadow-md'
                    : 'bg-gray-50 border-gray-200 opacity-75'
                }`}
              >
                {/* Header with badge and price */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        price.isActive === 1
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {price.isActive === 1 ? 'Actif' : 'Inactif'}
                    </span>
                    {price.sessions && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Pack {price.sessions} séances
                      </span>
                    )}
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{price.price}€</span>
                </div>

                {/* Course type */}
                <h3 className="font-semibold text-gray-900 mb-1 capitalize">
                  {price.courseType.replace('_', ' ')}
                </h3>

                {/* Details */}
                <div className="space-y-1 mb-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {price.duration}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Max {price.maxStudents} élève{price.maxStudents > 1 ? 's' : ''}
                  </div>
                </div>

                {/* Description */}
                {price.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{price.description}</p>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => handleToggle(price.id, price.isActive)}
                    className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                      price.isActive === 1
                        ? 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {price.isActive === 1 ? 'Désactiver' : 'Activer'}
                  </button>
                  <button
                    onClick={() => handleEdit(price)}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(price.id)}
                    className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
                    aria-label={`Supprimer le tarif ${price.courseType}`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
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
