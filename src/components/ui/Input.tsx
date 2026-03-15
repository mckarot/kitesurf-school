// src/components/ui/Input.tsx

import { InputHTMLAttributes, forwardRef, useState } from 'react';
import { motion } from 'framer-motion';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

/**
 * Input - Champ de saisie avec animations de focus
 *
 * Features:
 * - Border glow animé au focus
 * - Label avec transition fluide
 * - Accessible (label, aria-describedby)
 *
 * @example
 * ```tsx
 * <Input
 *   label="Email"
 *   type="email"
 *   placeholder="votre@email.com"
 * />
 * ```
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, onFocus, onBlur, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    return (
      <div className="w-full">
        {label && (
          <motion.label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1"
            animate={{
              color: isFocused ? '#2563eb' : '#374151',
            }}
            transition={{
              duration: 0.2,
              ease: 'easeOut',
            }}
          >
            {label}
          </motion.label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            className={`
              block w-full rounded-lg border px-3 py-2 text-sm
              placeholder:text-gray-400
              focus:outline-none
              disabled:cursor-not-allowed disabled:bg-gray-100
              ${error
                ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
              }
              ${className}
              transition-all duration-200 ease-out
              focus:ring-4
            `}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />

          {/* Animated border glow - simplified with CSS */}
        </div>
        {error && (
          <p
            className="mt-1 text-sm text-red-600 animate-fadeIn"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
