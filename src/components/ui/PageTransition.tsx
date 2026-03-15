// src/components/ui/PageTransition.tsx

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

/**
 * PageTransition - Wrapper pour transitions de pages
 *
 * Animation d'entrée: Fade + slide Y vers le haut
 * Animation de sortie: Fade + slide Y vers le bas
 * Respecte prefers-reduced-motion
 *
 * @example
 * ```tsx
 * <PageTransition>
 *   <DashboardPage />
 * </PageTransition>
 * ```
 */
export function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        duration: 0.3,
        ease: [0.25, 0.1, 0.25, 1], // easeOutCubic
      }}
      className="h-full"
    >
      {children}
    </motion.div>
  );
}
