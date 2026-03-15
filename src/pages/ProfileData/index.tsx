// src/pages/ProfileData/index.tsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useUserDataExport } from '../../hooks/useUserDataExport';
import { formatExportData } from '../../utils/exportUserData';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { DataSection } from './components/DataSection';
import { IdentitySection } from './components/IdentitySection';
import { PhysicalDataSection } from './components/PhysicalDataSection';
import { HealthDataSection } from './components/HealthDataSection';
import { ProgressionSection } from './components/ProgressionSection';
import { ReservationsSection } from './components/ReservationsSection';
import { TransactionsSection } from './components/TransactionsSection';
import { db } from '../../db/db';
import { Download, User, Activity, Heart, TrendingUp, Calendar, DollarSign } from 'lucide-react';

export function ProfileDataPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { isExporting, exportError, triggerExport } = useUserDataExport();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les données utilisateur
  useEffect(() => {
    async function loadData() {
      if (!user) return;

      try {
        const [userData, physicalData, healthData, progression, reservations, transactions] = await Promise.all([
          db.users.get(user.id),
          db.userPhysicalData.where('userId').equals(user.id).first(),
          db.userHealthData.where('userId').equals(user.id).first(),
          db.userProgression.where('userId').equals(user.id).first(),
          db.reservations.where('studentId').equals(user.id).toArray(),
          db.transactions.where('userId').equals(user.id).toArray(),
        ]);

        setData({
          user: userData,
          physicalData,
          healthData,
          progression,
          reservations,
          transactions,
        });
      } catch (error) {
        console.error('Error loading profile data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [user]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { state: { from: '/profil/mes-donnees' } });
    }
  }, [user, authLoading, navigate]);

  const handleExport = async () => {
    if (!data) return;
    try {
      const exportData = formatExportData(data);
      await triggerExport(exportData);
    } catch {
      // Error handled by hook
    }
  };

  // Show loading while auth is being checked
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 flex items-center justify-center">
        <LoadingSpinner size="lg" color="blue" showLabel label="Chargement des données..." />
      </div>
    );
  }

  // Redirect if not authorized
  if (!user) {
    return null;
  }

  const sections = [
    {
      title: 'Identité',
      icon: User,
      color: 'from-blue-500 to-cyan-400',
      component: <IdentitySection user={data.user} />,
    },
    {
      title: 'Données Physiques',
      icon: Activity,
      color: 'from-purple-500 to-pink-400',
      component: <PhysicalDataSection data={data.physicalData} />,
    },
    {
      title: 'Données de Santé',
      icon: Heart,
      color: 'from-red-500 to-rose-400',
      component: <HealthDataSection data={data.healthData} />,
    },
    {
      title: 'Progression Pédagogique',
      icon: TrendingUp,
      color: 'from-orange-500 to-yellow-400',
      component: <ProgressionSection progression={data.progression} />,
    },
    {
      title: 'Réservations',
      icon: Calendar,
      color: 'from-green-500 to-emerald-400',
      component: <ReservationsSection reservations={data.reservations} />,
    },
    {
      title: 'Transactions',
      icon: DollarSign,
      color: 'from-indigo-500 to-blue-400',
      component: <TransactionsSection transactions={data.transactions} />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100">
      {/* Hero Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 text-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="flex items-center space-x-3 mb-3"
              >
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold">Mes Données Personnelles</h1>
              </motion.div>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-blue-100 text-lg"
              >
                Consultez et gérez toutes vos informations personnelles
              </motion.p>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <Button
                variant="secondary"
                onClick={handleExport}
                isLoading={isExporting}
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30"
              >
                <Download className="w-5 h-5 mr-2" />
                Télécharger (JSON)
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-8">
        {/* Error Message */}
        {exportError && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4"
          >
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-600" />
              <p className="text-sm text-red-800">{exportError.message}</p>
            </div>
          </motion.div>
        )}

        {/* Data Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <DataSection
                title={section.title}
                icon={<section.icon className="w-5 h-5 text-gray-500" />}
              >
                {section.component}
              </DataSection>
            </motion.div>
          ))}
        </div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-8 text-center text-xs text-gray-500 bg-white rounded-2xl p-6 shadow-lg"
        >
          <p className="mb-2">
            Conformément au RGPD, vous avez droit à l'accès, à la rectification et à la suppression de vos données.
          </p>
          <p>
            Pour toute demande, contactez-nous à{' '}
            <a href="mailto:privacy@kiteschool.com" className="text-blue-600 hover:underline">
              privacy@kiteschool.com
            </a>
          </p>
        </motion.div>
      </main>
    </div>
  );
}
