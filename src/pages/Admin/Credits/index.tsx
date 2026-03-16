// src/pages/Admin/Credits/index.tsx
// Page Admin de gestion des crédits (maintenant en euros - système v13)

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUserWallet } from '../../../hooks/useUserWallet';
import { useCoursePricing } from '../../../hooks/useCoursePricing';
import { CreditsTable } from './CreditsTable';
import { CreditHistory } from './CreditHistory';
import { CreditsErrorBoundary } from './CreditsErrorBoundary';
import { StatsSummary } from './StatsSummary';
import { WalletsModal } from './WalletsModal';
import type { UserWallet, WalletTransaction } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { Wallet, Users, TrendingUp } from 'lucide-react';
import { db } from '../../../db/db';

/**
 * Page Admin - Gestion des Portefeuilles (Euros)
 * Design Metalab harmonisé
 */
export function CreditsPage() {
  const navigate = useNavigate();
  const { prices } = useCoursePricing();

  // États locaux
  const [selectedStudent, setSelectedStudent] = useState<{ id: number; name: string; balance: number } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedHistoryId, setExpandedHistoryId] = useState<number | null>(null);
  const [studentWallets, setStudentWallets] = useState<Array<{
    user: { id: number; firstName: string; lastName: string; email: string };
    wallet: UserWallet;
    transactions: WalletTransaction[];
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0); // Clé de rafraîchissement

  // Charger tous les étudiants avec leur wallet
  useEffect(() => {
    const loadStudentWallets = async () => {
      setIsLoading(true);
      try {
        const students = await db.users.where('role').equals('student').toArray();
        const wallets = await db.userWallets.toArray();
        const allTransactions = await db.transactions.toArray();

        const data = students.map((student) => {
          const wallet = wallets.find((w) => w.userId === student.id);
          const transactions = allTransactions
            .filter((t) => t.userId === student.id)
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, 50);

          return {
            user: student,
            wallet: wallet || { id: 0, userId: student.id, balance: 0, createdAt: Date.now() },
            transactions: transactions as unknown as WalletTransaction[],
          };
        });

        setStudentWallets(data);
      } catch (error) {
        console.error('[CreditsPage] Error loading student wallets:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStudentWallets();
  }, [refreshKey]); // Recharge quand refreshKey change

  // Construire les vues pour le tableau
  const adminCreditViews = studentWallets?.map((sw) => ({
    studentId: sw.user.id,
    studentName: `${sw.user.firstName} ${sw.user.lastName}`,
    studentEmail: sw.user.email,
    totalSessions: sw.wallet.balance, // Utilisé comme balance en euros
    usedSessions: 0,
    remainingSessions: sw.wallet.balance,
    creditsCount: sw.transactions.length,
    lastCreditDate: sw.transactions[0]?.createdAt,
  })) || [];

  // Stats pour le résumé
  const stats = {
    totalStudents: studentWallets?.length || 0,
    totalBalance: studentWallets?.reduce((sum, sw) => sum + sw.wallet.balance, 0) || 0,
    totalTransactions: studentWallets?.reduce((sum, sw) => sum + sw.transactions.length, 0) || 0,
    studentsWithBalance: studentWallets?.filter((sw) => sw.wallet.balance > 0).length || 0,
  };

  // Gérer l'ouverture du modal d'ajout
  const handleOpenAddModal = (studentId: number) => {
    const student = studentWallets?.find((sw) => sw.user.id === studentId);
    if (student) {
      setSelectedStudent({
        id: student.user.id,
        name: `${student.user.firstName} ${student.user.lastName}`,
        balance: student.wallet.balance,
      });
      setIsModalOpen(true);
    }
  };

  // Gérer la visualisation de l'historique
  const handleViewHistory = (studentId: number) => {
    if (expandedHistoryId === studentId) {
      setExpandedHistoryId(null);
    } else {
      setExpandedHistoryId(studentId);
    }
  };

  // Rafraîchir après ajout
  const handleAddFundsComplete = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
    setRefreshKey(prev => prev + 1); // Force le rafraîchissement des données
  };

  return (
    <CreditsErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50">
        {isLoading ? (
          <div className="min-h-screen flex items-center justify-center">
            <div aria-busy="true" aria-live="polite" className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4" />
              <p className="text-gray-600">Chargement des portefeuilles...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Hero Header */}
            <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-green-600 via-emerald-600 to-blue-600 text-white"
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
                    Gérer les Portefeuilles
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="text-green-100 text-lg mt-2"
                  >
                    Ajoutez des fonds et suivez les soldes en euros
                  </motion.p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => navigate('/admin/wallets')}
                  className="flex items-center space-x-2"
                >
                  <Wallet className="w-5 h-5" />
                  <span>Vue complète</span>
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => navigate('/admin/pricing')}
                  className="flex items-center space-x-2"
                >
                  <TrendingUp className="w-5 h-5" />
                  <span>Tarifs</span>
                </Button>
              </div>
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
            <div className="bg-white rounded-3xl shadow-xl p-6 border border-green-100">
              <StatsSummary stats={stats} />
            </div>
          </motion.div>

          {/* Info banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="mb-6 rounded-xl bg-blue-50 border border-blue-200 p-4"
          >
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Système de paiement en euros</p>
                <p>
                  Les élèves utilisent leur solde en euros pour réserver des cours. 
                  Pour gérer les tarifs, allez dans{' '}
                  <a href="/admin/pricing" className="underline hover:text-blue-900 font-medium">
                    Gestion des tarifs
                  </a>
                  .
                </p>
              </div>
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
              <Users className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">Élèves inscrits</h2>
            </div>
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-green-100">
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
                  <Wallet className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Historique des transactions</h2>
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
              <div className="bg-white rounded-3xl shadow-xl p-6 border border-blue-100">
                <CreditHistory
                  studentId={expandedHistoryId}
                  studentName={
                    adminCreditViews.find((s) => s.studentId === expandedHistoryId)
                      ?.studentName || `Élève #${expandedHistoryId}`
                  }
                  transactions={studentWallets?.find((sw) => sw.user.id === expandedHistoryId)?.transactions || []}
                  onClose={() => setExpandedHistoryId(null)}
                />
              </div>
            </motion.div>
          )}
        </main>

        {/* Add Credits Modal */}
        <WalletsModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedStudent(null);
          }}
          student={selectedStudent}
          onComplete={handleAddFundsComplete}
        />
          </>
        )}
      </div>
    </CreditsErrorBoundary>
  );
}

export default CreditsPage;
