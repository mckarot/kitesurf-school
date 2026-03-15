// src/pages/Admin/Credits/StatsSummary.tsx

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { CourseCredit } from '../../../types';
import { Users, Gift, CheckCircle, Clock } from 'lucide-react';

interface StatsSummaryProps {
  credits: CourseCredit[];
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  delay?: number;
}

function StatCard({ title, value, icon, color, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br p-6 shadow-lg"
      style={{
        background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
        border: `2px solid ${color}30`,
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold" style={{ color }}>
            {value}
          </p>
        </div>
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-lg"
          style={{ background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)` }}
        >
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Composant d'affichage des statistiques globales des crédits.
 */
export function StatsSummary({ credits }: StatsSummaryProps) {
  const stats = useMemo(() => {
    const totalStudents = new Set(credits.map((c) => c.studentId)).size;
    const totalSessions = credits.reduce((sum, c) => sum + c.sessions, 0);
    const usedSessions = credits.reduce((sum, c) => sum + c.usedSessions, 0);
    const remainingSessions = totalSessions - usedSessions;

    return { totalStudents, totalSessions, usedSessions, remainingSessions };
  }, [credits]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total élèves"
        value={stats.totalStudents}
        icon={<Users className="w-7 h-7" />}
        color="#3b82f6"
        delay={0}
      />
      <StatCard
        title="Séances totales"
        value={stats.totalSessions}
        icon={<Gift className="w-7 h-7" />}
        color="#10b981"
        delay={0.1}
      />
      <StatCard
        title="Séances consommées"
        value={stats.usedSessions}
        icon={<CheckCircle className="w-7 h-7" />}
        color="#f59e0b"
        delay={0.2}
      />
      <StatCard
        title="Séances restantes"
        value={stats.remainingSessions}
        icon={<Clock className="w-7 h-7" />}
        color="#8b5cf6"
        delay={0.3}
      />
    </div>
  );
}
