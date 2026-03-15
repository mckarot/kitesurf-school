// src/components/ui/LoadingSpinner.tsx

import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'white' | 'gray';
  label?: string;
  showLabel?: boolean;
}

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

const colorMap = {
  blue: {
    border: 'border-blue-200',
    accent: 'border-blue-600',
    gradient: ['#3b82f6', '#2563eb', '#1d4ed8'],
  },
  white: {
    border: 'border-white/30',
    accent: 'border-white',
    gradient: ['#ffffff', '#f0f0f0', '#e0e0e0'],
  },
  gray: {
    border: 'border-gray-200',
    accent: 'border-gray-600',
    gradient: ['#6b7280', '#4b5563', '#374151'],
  },
};

/**
 * LoadingSpinner - Spinner élégant avec animation gradient
 *
 * Features:
 * - Gradient animation fluide
 * - Smooth rotation
 * - Tailles configurables
 * - Accessible (aria-busy, aria-label)
 *
 * @example
 * ```tsx
 * <LoadingSpinner size="lg" color="blue" showLabel />
 * ```
 */
export function LoadingSpinner({
  size = 'md',
  color = 'blue',
  label = 'Chargement en cours...',
  showLabel = false,
}: LoadingSpinnerProps) {
  const colors = colorMap[color];

  return (
    <div
      className="flex flex-col items-center justify-center"
      role="status"
      aria-busy="true"
      aria-label={label}
    >
      <motion.div
        className={`relative ${sizeMap[size]}`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        {/* Cercle de fond */}
        <div
          className={`absolute inset-0 rounded-full border-2 ${colors.border}`}
        />

        {/* Cercle animé avec gradient */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-transparent"
          style={{
            borderTopColor: colors.accent,
            borderRightColor: colors.accent,
          }}
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Gradient overlay animé */}
        <motion.svg
          className="absolute inset-0"
          viewBox="0 0 100 100"
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <defs>
            <linearGradient
              id={`gradient-${color}-${size}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <motion.stop
                offset="0%"
                stopColor={colors.gradient[0]}
                animate={{
                  stopColor: [colors.gradient[0], colors.gradient[1], colors.gradient[0]],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              <motion.stop
                offset="50%"
                stopColor={colors.gradient[1]}
                animate={{
                  stopColor: [colors.gradient[1], colors.gradient[2], colors.gradient[1]],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.5,
                }}
              />
              <motion.stop
                offset="100%"
                stopColor={colors.gradient[2]}
                animate={{
                  stopColor: [colors.gradient[2], colors.gradient[0], colors.gradient[2]],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 1,
                }}
              />
            </linearGradient>
          </defs>
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={`url(#gradient-${color}-${size})`}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="283"
            strokeDashoffset="200"
            animate={{
              strokeDashoffset: [200, 100, 200],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </motion.svg>
      </motion.div>

      {showLabel && (
        <motion.p
          className="mt-3 text-sm text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {label}
        </motion.p>
      )}
    </div>
  );
}
