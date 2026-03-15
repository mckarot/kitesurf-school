// src/components/ui/Button.tsx

import { motion, HTMLMotionProps } from 'framer-motion';
import { forwardRef, useState, useCallback } from 'react';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
  enableRipple?: boolean;
}

const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 relative overflow-hidden';

const variantStyles = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:outline-blue-500',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:outline-gray-500',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-500',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus-visible:outline-gray-500',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

interface Ripple {
  id: number;
  x: number;
  y: number;
}

/**
 * Button - Bouton avec animations modernes
 *
 * Features:
 * - Hover scale + glow
 * - Active scale down
 * - Ripple effect au click (optionnel)
 * - Accessible (focus-visible, aria-disabled)
 *
 * @example
 * ```tsx
 * <Button variant="primary" enableRipple>
 *   Click me
 * </Button>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading,
      className = '',
      children,
      disabled,
      enableRipple = true,
      onClick,
      ...props
    },
    ref
  ) => {
    const [ripples, setRipples] = useState<Ripple[]>([]);

    const createRipple = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        if (!enableRipple || isLoading || disabled) return;

        const button = event.currentTarget;
        const rect = button.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const ripple = {
          id: Date.now(),
          x,
          y,
        };

        setRipples((prev) => [...prev, ripple]);

        // Nettoyer le ripple après animation
        setTimeout(() => {
          setRipples((prev) => prev.filter((r) => r.id !== ripple.id));
        }, 600);
      },
      [enableRipple, isLoading, disabled]
    );

    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        createRipple(event);
        onClick?.(event);
      },
      [createRipple, onClick]
    );

    return (
      <motion.button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        disabled={disabled || isLoading}
        aria-disabled={disabled || isLoading}
        whileHover={!disabled && !isLoading ? { scale: 1.02 } : undefined}
        whileTap={!disabled && !isLoading ? { scale: 0.98 } : undefined}
        transition={{
          duration: 0.15,
          ease: 'easeOut',
        }}
        onClick={handleClick}
        {...props}
      >
        {/* Ripple effects */}
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            className="absolute rounded-full bg-white/30"
            style={{
              left: ripple.x,
              top: ripple.y,
              transform: 'translate(-50%, -50%)',
            }}
            initial={{
              width: 0,
              height: 0,
              opacity: 1,
            }}
            animate={{
              width: 200,
              height: 200,
              opacity: 0,
            }}
            transition={{
              duration: 0.6,
              ease: 'easeOut',
            }}
          />
        ))}

        {/* Loading spinner */}
        {isLoading && (
          <motion.svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </motion.svg>
        )}

        {/* Children avec glow effect au hover */}
        <span className="relative z-10 flex items-center gap-2">
          {children}
        </span>

        {/* Glow overlay au hover */}
        {!disabled && !isLoading && variant === 'primary' && (
          <motion.div
            className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-400/0 via-blue-400/10 to-blue-400/0"
            initial={{ x: '-100%' }}
            whileHover={{ x: '100%' }}
            transition={{
              duration: 0.6,
              ease: 'easeOut',
            }}
            style={{ pointerEvents: 'none' }}
          />
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
