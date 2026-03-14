// src/components/ui/PasswordStrength.tsx
// Composant d'affichage de la force du mot de passe

import { useMemo } from 'react';
import { validatePassword, getPasswordStrengthScore } from '../../utils/passwordValidator';

interface PasswordStrengthProps {
  password: string;
  showCriteria?: boolean;
  label?: string;
}

export function PasswordStrength({
  password,
  showCriteria = true,
  label = 'Force du mot de passe',
}: PasswordStrengthProps) {
  const validation = useMemo(() => validatePassword(password), [password]);
  const score = useMemo(() => getPasswordStrengthScore(password), [password]);

  const getStrengthColor = () => {
    if (password.length === 0) return 'bg-gray-200';
    switch (validation.strength) {
      case 'weak':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'strong':
        return 'bg-green-500';
    }
  };

  const getStrengthLabel = () => {
    if (password.length === 0) return 'Aucun';
    switch (validation.strength) {
      case 'weak':
        return 'Faible';
      case 'medium':
        return 'Moyen';
      case 'strong':
        return 'Fort';
    }
  };

  const criteria = [
    { label: 'Au moins 8 caractères', met: validation.criteria?.hasMinLength ?? false },
    { label: 'Une majuscule', met: validation.criteria?.hasUpperCase ?? false },
    { label: 'Une minuscule', met: validation.criteria?.hasLowerCase ?? false },
    { label: 'Un chiffre', met: validation.criteria?.hasNumber ?? false },
    { label: 'Un caractère spécial', met: validation.criteria?.hasSpecialChar ?? false },
  ];

  return (
    <div className="w-full mt-2" aria-live="polite">
      {/* Barre de progression */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-gray-600 whitespace-nowrap">{label} :</span>
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${getStrengthColor()}`}
            style={{ width: `${score}%` }}
            role="progressbar"
            aria-valuenow={score}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Force du mot de passe : ${getStrengthLabel()} (${score}%)`}
          />
        </div>
        <span className="text-xs font-medium text-gray-700 w-12 text-right">
          {getStrengthLabel()}
        </span>
      </div>

      {/* Critères détaillés */}
      {showCriteria && password.length > 0 && (
        <ul className="space-y-1" role="list">
          {criteria.map((criterion) => (
            <li
              key={criterion.label}
              className={`flex items-center gap-2 text-xs ${
                criterion.met ? 'text-green-700' : 'text-gray-500'
              }`}
            >
              <svg
                className={`w-4 h-4 ${criterion.met ? 'text-green-600' : 'text-gray-400'}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                {criterion.met ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                )}
              </svg>
              <span>{criterion.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
