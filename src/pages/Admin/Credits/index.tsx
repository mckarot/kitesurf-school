// src/pages/Admin/Credits/index.tsx

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { useCourseCredits } from '../../../hooks/useCourseCredits';
import { CreditsTable } from './CreditsTable';
import { AddCreditsModal } from './AddCreditsModal';
import { CreditHistory } from './CreditHistory';
import { CreditsErrorBoundary } from './CreditsErrorBoundary';
import { StatsSummary } from './StatsSummary';
import { buildAllAdminCreditViews } from '../../../utils/buildAdminCreditView';
import type { AdminCreditsLoaderData, AddCreditsFormInput } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { Gift, Users, TrendingUp, Clock, Plus } from 'lucide-react';

/**
 * Page Admin - Gestion des Crédits
 * Design Metalab harmonisé
 */
export function CreditsPage() {
  const { students, credits, instructors } = useLoaderData() as AdminCreditsLoaderData;
  const navigate = useNavigate();
  const { addCredit } = useCourseCredits();

  // États locaux
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedHistoryId, setExpandedHistoryId] = useState<number | null>(null);

  // Construire les vues AdminCreditView
  const adminCreditViews = buildAllAdminCreditViews(students, credits);

  // Gérer l'ouverture du modal d'ajout
  const handleOpenAddModal = (studentId: number) => {
    setSelectedStudentId(studentId);
    setIsModalOpen(true);
  };

  // Gérer la visualisation de l'historique
  const handleViewHistory = (studentId: number) => {
    if (expandedHistoryId === studentId) {
      setExpandedHistoryId(null);
    } else {
      setExpandedHistoryId(studentId);
    }
  };

  // Soumettre l'ajout de crédits
  const handleAddCredits = async (data: AddCreditsFormInput) => {
    await addCredit({
      studentId: data.studentId,
      sessions: data.sessions,
      expiresAt: data.expiresAt,
    });
    navigate(0);
  };

  return (
    <CreditsErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        {/* Hero Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 text-white"
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
                  onClick={() => navigate('/dashboard')}
                  className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/30 transition-all"
                  aria-label="Retour au dashboard"
                >
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </motion.button>
                <div>
                  <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="text-4xl md:text-5xl font-bold"
                  >
                    Gérer les Crédits
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="text-purple-100 text-lg mt-2"
                  >
                    Ajoutez et suivez les crédits de cours des élèves
                  </motion.p>
                </div>
              </div>
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSelectedStudentId(null);
                  setIsModalOpen(true);
                }}
                className="flex items-center space-x-2 bg-white text-purple-600 px-6 py-3 rounded-full font-semibold hover:bg-purple-50 transition-all shadow-lg"
              >
                <Plus className="w-5 h-5" />
                <span>Ajouter des crédits</span>
              </motion.button>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-8">
          {/* Stats Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-8"
          >
            <div className="bg-white rounded-3xl shadow-xl p-6 border border-purple-100">
              <StatsSummary credits={credits} />
            </div>
          </motion.div>

          {/* Students Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center space-x-2 mb-6">
              <Users className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">Élèves inscrits</h2>
            </div>
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-purple-100">
              <CreditsTable
                students={adminCreditViews}
                onAddCredits={handleOpenAddModal}
                onViewHistory={handleViewHistory}
              />
            </div>
          </motion.div>

          {/* Credit History */}
          {expandedHistoryId !== null && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mb-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <Clock className="w-6 h-6 text-pink-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Historique des crédits</h2>
                </div>
                <button
                  onClick={() => setExpandedHistoryId(null)}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="bg-white rounded-3xl shadow-xl p-6 border border-pink-100">
                <CreditHistory
                  studentId={expandedHistoryId}
                  studentName={
                    adminCreditViews.find((s) => s.studentId === expandedHistoryId)
                      ?.studentName || `Élève #${expandedHistoryId}`
                  }
                  credits={credits.filter((c) => c.studentId === expandedHistoryId)}
                  onClose={() => setExpandedHistoryId(null)}
                />
              </div>
            </motion.div>
          )}
        </main>

        {/* Add Credits Modal */}
        <AddCreditsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddCredits}
          students={students}
          instructors={instructors}
          initialStudentId={selectedStudentId || undefined}
        />
      </div>
    </CreditsErrorBoundary>
  );
}

export default CreditsPage;
