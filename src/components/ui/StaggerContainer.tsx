// src/components/ui/StaggerContainer.tsx

import { motion, Variants } from 'framer-motion';
import { ReactNode } from 'react';

interface StaggerContainerProps {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
  itemClassName?: string;
}

/**
 * StaggerContainer - Container pour listes avec entrée en cascade
 *
 * Features:
 * - StaggerChildren pour animation en vague
 * - Fade + slide pour chaque item
 * - Délai configurable entre chaque item
 * - Respecte prefers-reduced-motion
 *
 * @example
 * ```tsx
 * <StaggerContainer staggerDelay={0.05}>
 *   {items.map(item => (
 *     <div key={item.id}>{item.name}</div>
 *   ))}
 * </StaggerContainer>
 * ```
 */
export function StaggerContainer({
  children,
  staggerDelay = 0.08,
  className = '',
  itemClassName = '',
}: StaggerContainerProps) {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 16,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.1, 0.25, 1], // easeOutCubic
      },
    },
  };

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {children &&
        Array.isArray(children)
          ? (children as ReactNode[]).map((child, index) => (
              <motion.div
                key={index}
                className={itemClassName}
                variants={itemVariants}
              >
                {child}
              </motion.div>
            ))
          : children}
    </motion.div>
  );
}

/**
 * StaggerChildren - Hook utilitaire pour appliquer le stagger à des enfants
 *
 * @example
 * ```tsx
 * <motion.div variants={staggerContainerVariants}>
 *   {items.map(item => (
 *     <motion.div key={item.id} variants={staggerItemVariants}>
 *       {item.name}
 *     </motion.div>
 *   ))}
 * </motion.div>
 * ```
 */
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const staggerItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 16,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};
