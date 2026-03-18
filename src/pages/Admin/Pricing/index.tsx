// src/pages/Admin/Pricing/index.tsx
// Page Admin de gestion des CourseCards & PackCards - Design Metalab

import { useState } from 'react';
import { useCourseCards } from '../../../hooks/useCourseCards';
import { usePackCards } from '../../../hooks/usePackCards';
import type { CourseCard, CourseCardInput, PackCard, PackCardInput } from '../../../types';
import { CourseCardsSection } from './components/CourseCardsSection';
import { PackCardsSection } from './components/PackCardsSection';
import { motion } from 'framer-motion';
import { Users, Package } from 'lucide-react';

export function PricingPage() {
  // CourseCards (Section A)
  const { cards: courseCards, isLoading: courseCardsLoading, createCard: createCourseCard, updateCard: updateCourseCard, toggleCard: toggleCourseCard, toggleHighlight: toggleCourseCardHighlight, deleteCard: deleteCourseCard } = useCourseCards();
  const [editingCourseCard, setEditingCourseCard] = useState<CourseCard | null>(null);

  // PackCards (Section B)
  const { cards: packCards, isLoading: packCardsLoading, createCard: createPackCard, updateCard: updatePackCard, toggleCard: togglePackCard, toggleHighlight: togglePackCardHighlight, deleteCard: deletePackCard } = usePackCards();
  const [editingPackCard, setEditingPackCard] = useState<PackCard | null>(null);

  // ── Section A: CourseCards ─────────────────────────────────────────────────
  const handleCreateCourseCard = () => {
    setEditingCourseCard(null);
  };

  const handleEditCourseCard = (card: CourseCard) => {
    setEditingCourseCard(card);
  };

  const handleUpdateCourseCard = async (data: CourseCardInput) => {
    if (editingCourseCard) {
      await updateCourseCard({ ...data, id: editingCourseCard.id });
    } else {
      await createCourseCard(data);
    }
  };

  // ── Section B: PackCards ───────────────────────────────────────────────────
  const handleCreatePackCard = () => {
    setEditingPackCard(null);
  };

  const handleEditPackCard = (card: PackCard) => {
    setEditingPackCard(card);
  };

  const handleUpdatePackCard = async (data: PackCardInput) => {
    if (editingPackCard) {
      await updatePackCard({ ...data, id: editingPackCard.id });
    } else {
      await createPackCard(data);
    }
  };

  // Wrapper functions to match expected void return types
  const handleToggleCourseCard = async (id: number, isActive: boolean) => {
    await toggleCourseCard(id, isActive);
  };

  const handleToggleCourseCardHighlight = async (id: number, isHighlighted: boolean) => {
    await toggleCourseCardHighlight(id, isHighlighted);
  };

  const handleDeleteCourseCard = async (id: number) => {
    await deleteCourseCard(id);
  };

  const handleTogglePackCard = async (id: number, isActive: boolean) => {
    await togglePackCard(id, isActive);
  };

  const handleTogglePackCardHighlight = async (id: number, isHighlighted: boolean) => {
    await togglePackCardHighlight(id, isHighlighted);
  };

  const handleDeletePackCard = async (id: number) => {
    await deletePackCard(id);
  };

  const isLoading = courseCardsLoading || packCardsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Chargement des données...</p>
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
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold">Gestion des Cours & Packs</h1>
                </motion.div>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-purple-100 text-lg"
                >
                  Créez et gérez les cartes de cours et packs affichés sur /courses
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
                href="/courses"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full font-semibold hover:bg-white/30 transition-all"
              >
                <Users className="w-5 h-5" />
                <span>Voir /courses</span>
              </a>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-8 space-y-12">
        {/* ── SECTION A: CourseCards ─────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white rounded-3xl shadow-xl border-2 border-purple-100 p-8"
        >
          <CourseCardsSection
            cards={courseCards}
            isLoading={courseCardsLoading}
            onUpdateCard={handleUpdateCourseCard}
            onToggleCard={handleToggleCourseCard}
            onToggleHighlight={handleToggleCourseCardHighlight}
            onDeleteCard={handleDeleteCourseCard}
          />
        </motion.section>

        {/* ── SECTION B: PackCards ─────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="bg-white rounded-3xl shadow-xl border-2 border-purple-100 p-8"
        >
          <PackCardsSection
            cards={packCards}
            isLoading={packCardsLoading}
            onUpdateCard={handleUpdatePackCard}
            onToggleCard={handleTogglePackCard}
            onToggleHighlight={handleTogglePackCardHighlight}
            onDeleteCard={handleDeletePackCard}
          />
        </motion.section>
      </main>
    </div>
  );
}
