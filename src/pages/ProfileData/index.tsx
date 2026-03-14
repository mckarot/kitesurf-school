// src/pages/ProfileData/index.tsx

import { useLoaderData } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { DataSection } from './components/DataSection';
import { IdentitySection } from './components/IdentitySection';
import { PhysicalDataSection } from './components/PhysicalDataSection';
import { HealthDataSection } from './components/HealthDataSection';
import { ProgressionSection } from './components/ProgressionSection';
import { ReservationsSection } from './components/ReservationsSection';
import { TransactionsSection } from './components/TransactionsSection';
import { useUserDataExport } from '../../hooks/useUserDataExport';
import { formatExportData } from '../../utils/exportUserData';
import type { ProfileDataLoaderReturn } from './loader';

export function ProfileDataPage() {
  const data = useLoaderData() as ProfileDataLoaderReturn;
  const { user: authUser } = useAuth();
  const { isExporting, exportError, triggerExport } = useUserDataExport();

  const handleExport = async () => {
    try {
      const exportData = formatExportData(data);
      await triggerExport(exportData);
    } catch {
      // Error handled by hook
    }
  };

  // Vérifier que l'utilisateur est connecté
  if (!authUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Vous devez être connecté pour accéder à cette page</p>
          <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
            Se connecter
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 transition-colors"
                aria-label="Retour au tableau de bord"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </a>
              <h1 className="text-xl font-bold text-gray-900">Mes Données Personnelles</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Export Button */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Consultez et téléchargez toutes vos données personnelles stockées dans l'application.
          </p>
          <Button
            variant="primary"
            onClick={handleExport}
            isLoading={isExporting}
            aria-label="Télécharger mes données au format JSON"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Télécharger mes données (JSON)
          </Button>
        </div>

        {/* Error Message */}
        {exportError && (
          <div
            role="alert"
            className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-800">{exportError.message}</p>
            </div>
          </div>
        )}

        {/* Data Sections */}
        <div className="space-y-6">
          {/* Section 1: Identité */}
          <DataSection
            title="Identité"
            icon={
              <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
          >
            <IdentitySection user={data.user} />
          </DataSection>

          {/* Section 2: Données Physiques */}
          <DataSection
            title="Données Physiques"
            icon={
              <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
          >
            <PhysicalDataSection data={data.physicalData} />
          </DataSection>

          {/* Section 3: Données de Santé */}
          <DataSection
            title="Données de Santé"
            icon={
              <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            }
          >
            <HealthDataSection data={data.healthData} />
          </DataSection>

          {/* Section 4: Progression Pédagogique */}
          <DataSection
            title="Progression Pédagogique"
            icon={
              <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
          >
            <ProgressionSection progression={data.progression} />
          </DataSection>

          {/* Section 5: Réservations */}
          <DataSection
            title="Réservations"
            icon={
              <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          >
            <ReservationsSection reservations={data.reservations} />
          </DataSection>

          {/* Section 6: Transactions */}
          <DataSection
            title="Transactions"
            icon={
              <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          >
            <TransactionsSection transactions={data.transactions} />
          </DataSection>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>
            Conformément au RGPD, vous avez droit à l'accès, à la rectification et à la suppression de vos données.
          </p>
          <p className="mt-1">
            Pour toute demande, contactez-nous à{' '}
            <a href="mailto:privacy@kitesurf-school.com" className="text-blue-600 hover:underline">
              privacy@kitesurf-school.com
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
