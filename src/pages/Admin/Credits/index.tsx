// src/pages/Admin/Credits/index.tsx

import { useState } from 'react';
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

/**
 * Page Admin - Gestion des Crédits
 *
 * Route: /admin/credits
 *
 * Fonctionnalités:
 * - Tableau des élèves avec soldes de crédits
 * - Modal d'ajout de crédits pour un élève
 * - Historique des crédits par élève (expandable)
 * - Statistiques globales des crédits
 *
 * Données chargées par loader:
 * - students: Tous les utilisateurs avec role='student'
 * - credits: Tous les crédits de cours
 * - instructors: Tous les utilisateurs avec role='instructor'
 *
 * @returns JSX.Element - Page de gestion des crédits
 *
 * @example
 * ```tsx
 * // Dans router.tsx
 * {
 *   path: 'credits',
 *   element: <CreditsPage />,
 *   loader: creditsLoader,
 *   errorElement: <DbErrorBoundary><CreditsErrorBoundary /></DbErrorBoundary>,
 * }
 * ```
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
    // Le loader sera re-exécuté automatiquement par React Router après navigation
    navigate(0); // Recharger la page pour rafraîchir les données
  };

  return (
    <CreditsErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <a
                  href="/admin"
                  className="text-gray-600 hover:text-gray-900 transition"
                  aria-label="Retour au dashboard admin"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </a>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Gérer les Crédits</h1>
                  <p className="text-sm text-gray-600 mt-0.5">
                    Ajouter et suivre les crédits de cours des élèves
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href="/admin"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition"
                >
                  Retour à l'admin
                </a>
                <Button
                  variant="primary"
                  onClick={() => {
                    setSelectedStudentId(null);
                    setIsModalOpen(true);
                  }}
                >
                  Ajouter des crédits
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Résumé global des statistiques */}
          <StatsSummary credits={credits} />

          {/* Tableau des élèves */}
          <section aria-labelledby="students-table-heading">
            <h2 id="students-table-heading" className="text-lg font-semibold text-gray-900 mb-4">
              Élèves inscrits
            </h2>
            <CreditsTable
              students={adminCreditViews}
              onAddCredits={handleOpenAddModal}
              onViewHistory={handleViewHistory}
            />
          </section>

          {/* Historique des crédits (si un élève est sélectionné) */}
          {expandedHistoryId !== null && (
            <section className="mt-8" aria-labelledby="history-heading">
              <h2 id="history-heading" className="sr-only">
                Historique des crédits
              </h2>
              <CreditHistory
                studentId={expandedHistoryId}
                studentName={
                  adminCreditViews.find((s) => s.studentId === expandedHistoryId)
                    ?.studentName || `Élève #${expandedHistoryId}`
                }
                credits={credits.filter((c) => c.studentId === expandedHistoryId)}
                onClose={() => setExpandedHistoryId(null)}
              />
            </section>
          )}
        </main>

        {/* Modal d'ajout de crédits */}
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
