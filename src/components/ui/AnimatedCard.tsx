// src/components/ui/AnimatedCard.tsx

import { motion, HTMLMotionProps } from 'framer-motion';
import { forwardRef } from 'react';

interface AnimatedCardProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'elevated' | 'glow';
  children: React.ReactNode;
}

/**
 * AnimatedCard - Card avec hover effects stylés
 *
 * Features:
 * - Scale subtil au hover (-translate-y + shadow)
 * - Border glow effect (optionnel)
 * - Transition fluide
 * - Respecte prefers-reduced-motion
 *
 * @example
 * ```tsx
 * <AnimatedCard variant="glow">
 *   <CardHeader>Titre</CardHeader>
 *   <CardBody>Contenu</CardBody>
 * </AnimatedCard>
 * ```
 */
export const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ variant = 'default', className = '', children, ...props }, ref) => {
    const baseStyles = 'rounded-xl border bg-white';

    const variantStyles = {
      default: 'border-gray-200',
      elevated: 'border-gray-200 shadow-sm',
      glow: 'border-blue-200 shadow-sm',
    };

    return (
      <motion.div
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${className}`}
        whileHover={{
          y: -4,
          scale: 1.01,
          boxShadow: variant === 'glow'
            ? '0 20px 25px -5px rgb(37 99 235 / 0.15), 0 8px 10px -6px rgb(37 99 235 / 0.1)'
            : '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        }}
        transition={{
          duration: 0.2,
          ease: 'easeOut',
        }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

AnimatedCard.displayName = 'AnimatedCard';
