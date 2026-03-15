// src/pages/Admin/Credits/StatsSummary.tsx

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { CourseCredit } from '../../../types';
import { AnimatedCard } from '../../../components/ui/AnimatedCard';

interface StatsSummaryProps {
  credits: CourseCredit[];
}

interface StatCardProps {
  title: string;
  value: number;
  color: 'blue' | 'green' | 'orange' | 'purple';
  delay?: number;
}

const colorVariants = {
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    gradient: 'from-blue-500/10 to-blue-600/5',
  },
  green: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-700',
    gradient: 'from-green-500/10 to-green-600/5',
  },
  orange: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-700',
    gradient: 'from-orange-500/10 to-orange-600/5',
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-700',
    gradient: 'from-purple-500/10 to-purple-600/5',
  },
};

/**
 * StatCard - Carte de statistique individuelle avec animation
 */
function StatCard({ title, value, color, delay = 0 }: StatCardProps) {
  const variant = colorVariants[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      <AnimatedCard variant="elevated" className={`${variant.bg} ${variant.border} overflow-hidden relative`}>
        {/* Gradient overlay */}
        <div className={`absolute inset-0 bg-gradient-to-br ${variant.gradient} pointer-events-none`} />
        
        <div className="relative z-10">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p
            className={`text-2xl font-bold ${variant.text}`}
            aria-live="polite"
          >
            {value}
          </p>
        </div>
      </AnimatedCard>
    </motion.div>
  );
}

/**
 * Composant d'affichage des statistiques globales des crédits.
 *
 * Affiche 4 cartes:
 * - Total des élèves avec des crédits
 * - Séances totales achetées
 * - Séances consommées
 * - Séances restantes
 *
 * @param props - Props du composant
 * @returns JSX.Element - Cartes de statistiques
 *
 * @example
 * ```tsx
 * <StatsSummary credits={credits} />
 * ```
 */
export function StatsSummary({ credits }: StatsSummaryProps) {
  const stats = useMemo(() => {
    // Nombre d'élèves uniques ayant des crédits
    const totalStudents = new Set(credits.map((c) => c.studentId)).size;

    // Total des séances achetées (tous crédits confondus)
    const totalSessions = credits.reduce((sum, c) => sum + c.sessions, 0);

    // Total des séances consommées
    const usedSessions = credits.reduce((sum, c) => sum + c.usedSessions, 0);

    // Séances restantes
    const remainingSessions = totalSessions - usedSessions;

    return { totalStudents, totalSessions, usedSessions, remainingSessions };
  }, [credits]);

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      role="region"
      aria-label="Statistiques des crédits"
    >
      <StatCard
        title="Total élèves"
        value={stats.totalStudents}
        color="blue"
        delay={0}
      />
      <StatCard
        title="Séances totales"
        value={stats.totalSessions}
        color="green"
        delay={0.1}
      />
      <StatCard
        title="Séances consommées"
        value={stats.usedSessions}
        color="orange"
        delay={0.2}
      />
      <StatCard
        title="Séances restantes"
        value={stats.remainingSessions}
        color="purple"
        delay={0.3}
      />
    </div>
  );
}
