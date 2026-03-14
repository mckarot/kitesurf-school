// src/components/ui/Toggle.tsx

import { useRef, useEffect, KeyboardEvent, useCallback } from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  id?: string;
  size?: 'sm' | 'md' | 'lg';
}

const baseStyles = 'relative inline-flex items-center cursor-pointer transition-colors duration-200 ease-in-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500';

const sizeStyles = {
  sm: 'h-4 w-7',
  md: 'h-5 w-9',
  lg: 'h-6 w-11',
};

const checkedStyles = 'bg-blue-600';
const uncheckedStyles = 'bg-gray-200';

const knobBaseStyles = 'inline-block rounded-full transition-transform duration-200 ease-in-out bg-white shadow-sm';

const knobSizeStyles = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

const knobTransformChecked = {
  sm: 'translate-x-3',
  md: 'translate-x-4',
  lg: 'translate-x-5',
};

const knobTransformUnchecked = 'translate-x-0.5';

/**
 * Composant Toggle accessible pour les consentements RGPD
 *
 * Implémente un switch avec :
 * - Rôle ARIA "switch" pour l'accessibilité
 * - Navigation clavier (Enter, Space, ArrowLeft, ArrowRight)
 * - Focus visible pour la navigation au clavier
 * - États disabled et loading
 *
 * @example
 * ```tsx
 * <Toggle
 *   checked={hasConsent}
 *   onChange={(checked) => handleToggle(checked)}
 *   label="Emails marketing"
 *   size="md"
 * />
 * ```
 */
export function Toggle({
  checked,
  onChange,
  disabled = false,
  label,
  id,
  size = 'md',
}: ToggleProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  /**
   * Gère le changement d'état du toggle
   */
  const handleChange = useCallback(() => {
    if (!disabled) {
      onChange(!checked);
    }
  }, [checked, onChange, disabled]);

  /**
   * Gère les événements clavier pour l'accessibilité
   * - Enter/Space : active/désactive le toggle
   * - ArrowRight : active le toggle
   * - ArrowLeft : désactive le toggle
   */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>) => {
      if (disabled) return;

      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault();
          handleChange();
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (!checked) {
            onChange(true);
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (checked) {
            onChange(false);
          }
          break;
      }
    },
    [disabled, checked, onChange, handleChange]
  );

  return (
    <div className="inline-flex items-center">
      <button
        ref={buttonRef}
        type="button"
        role="switch"
        id={id}
        aria-checked={checked}
        aria-label={label}
        aria-disabled={disabled}
        disabled={disabled}
        onClick={handleChange}
        onKeyDown={handleKeyDown}
        className={`${baseStyles} ${sizeStyles[size]} ${
          checked ? checkedStyles : uncheckedStyles
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span className="sr-only">{label}</span>
        <span
          className={`${knobBaseStyles} ${knobSizeStyles[size]} ${
            checked ? knobTransformChecked[size] : knobTransformUnchecked
          }`}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}
