// src/utils/passwordValidator.ts
// Utilitaire de validation de mot de passe (sécurité RGPD)
// Pure functions for password validation and strength assessment

import type { PasswordValidationResult, PasswordStrengthCriteria } from '../types';

// ============================================
// CONSTANTES DE VALIDATION
// ============================================

/**
 * Minimum password length required
 */
const MIN_PASSWORD_LENGTH = 8;

/**
 * Regex patterns for password criteria
 */
const PATTERNS = {
  upperCase: /[A-Z]/,
  lowerCase: /[a-z]/,
  number: /[0-9]/,
  specialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
  repeatedChars: /(.)\1{2,}/, // Detects 3+ repeated characters
} as const;

// ============================================
// VALIDATION PRINCIPALE
// ============================================

/**
 * Valide la force d'un mot de passe selon les critères de sécurité
 *
 * Security criteria (all required):
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 digit
 * - At least 1 special character
 *
 * @param password - Le mot de passe à valider
 * @returns PasswordValidationResult avec isValid, errors, strength, et criteria
 */
export function validatePassword(password: string): PasswordValidationResult {
  // Check each criterion
  const criteria: PasswordStrengthCriteria = {
    hasMinLength: password.length >= MIN_PASSWORD_LENGTH,
    hasUpperCase: PATTERNS.upperCase.test(password),
    hasLowerCase: PATTERNS.lowerCase.test(password),
    hasNumber: PATTERNS.number.test(password),
    hasSpecialChar: PATTERNS.specialChar.test(password),
  };

  // Build error messages for failed criteria
  const errors: string[] = [];

  if (!criteria.hasMinLength) {
    errors.push(`Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères`);
  }
  if (!criteria.hasUpperCase) {
    errors.push('Le mot de passe doit contenir au moins une lettre majuscule');
  }
  if (!criteria.hasLowerCase) {
    errors.push('Le mot de passe doit contenir au moins une lettre minuscule');
  }
  if (!criteria.hasNumber) {
    errors.push('Le mot de passe doit contenir au moins un chiffre');
  }
  if (!criteria.hasSpecialChar) {
    errors.push('Le mot de passe doit contenir au moins un caractère spécial');
  }

  // Calculate strength based on criteria met
  const validCriteriaCount = Object.values(criteria).filter(Boolean).length;
  const strength = getPasswordStrength(password);

  return {
    isValid: errors.length === 0,
    errors,
    strength,
    criteria,
  };
}

// ============================================
// FORCE DU MOT DE PASSE
// ============================================

/**
 * Évalue la force globale d'un mot de passe
 *
 * Strength levels:
 * - 'weak': Less than 3 criteria met OR has repeated characters
 * - 'medium': 3-4 criteria met
 * - 'strong': All 5 criteria met AND no repeated characters
 *
 * @param password - Le mot de passe à évaluer
 * @returns 'weak' | 'medium' | 'strong'
 */
export function getPasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
  if (password.length === 0) {
    return 'weak';
  }

  // Get criteria
  const criteria = checkPasswordCriteria(password);
  const validCriteriaCount = Object.values(criteria).filter(Boolean).length;

  // Check for repeated characters (penalty)
  const hasRepeatedChars = PATTERNS.repeatedChars.test(password);

  // Determine strength
  if (validCriteriaCount >= 5 && !hasRepeatedChars) {
    return 'strong';
  }

  if (validCriteriaCount >= 3) {
    return 'medium';
  }

  return 'weak';
}

/**
 * Vérifie les critères individuels d'un mot de passe
 *
 * Returns detailed criteria breakdown for UI feedback.
 *
 * @param password - Le mot de passe à analyser
 * @returns PasswordStrengthCriteria avec chaque critère détaillé
 */
export function checkPasswordCriteria(password: string): PasswordStrengthCriteria {
  return {
    hasMinLength: password.length >= MIN_PASSWORD_LENGTH,
    hasUpperCase: PATTERNS.upperCase.test(password),
    hasLowerCase: PATTERNS.lowerCase.test(password),
    hasNumber: PATTERNS.number.test(password),
    hasSpecialChar: PATTERNS.specialChar.test(password),
  };
}

// ============================================
// UTILITAIRES SUPPLÉMENTAIRES
// ============================================

/**
 * Calcule un score numérique de force de mot de passe (0-100)
 *
 * Scoring breakdown:
 * - Length: up to 30 points (3 points per character, max at 10 chars)
 * - Character diversity: up to 40 points (10 points per type)
 * - Bonus for length > 12: up to 20 points
 * - Penalty for repeated characters: -10 points
 * - Penalty for common patterns: -10 points
 *
 * @param password - Le mot de passe à évaluer
 * @returns Score de 0 à 100
 */
export function getPasswordStrengthScore(password: string): number {
  if (password.length === 0) {
    return 0;
  }

  let score = 0;

  // Length score (max 30 points)
  // 3 points per character, capped at 30
  score += Math.min(password.length * 3, 30);

  // Character diversity score (max 40 points)
  const hasLower = PATTERNS.lowerCase.test(password);
  const hasUpper = PATTERNS.upperCase.test(password);
  const hasNumber = PATTERNS.number.test(password);
  const hasSpecial = PATTERNS.specialChar.test(password);

  const diversityCount = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
  score += diversityCount * 10;

  // Bonus for extra length (max 20 points)
  if (password.length > 12) {
    score += 20;
  }

  // Penalty for repeated characters (e.g., "aaa", "111")
  if (PATTERNS.repeatedChars.test(password)) {
    score -= 10;
  }

  // Penalty for common patterns (e.g., "123", "abc")
  const commonPatterns = [
    /123/,
    /abc/,
    /qwerty/,
    /password/i,
    /admin/i,
    /(.)\1{3,}/, // 4+ repeated characters
  ];
  const hasCommonPattern = commonPatterns.some((pattern) => pattern.test(password));
  if (hasCommonPattern) {
    score -= 10;
  }

  // Ensure score is within bounds
  return Math.max(0, Math.min(100, score));
}

/**
 * Vérifie si deux mots de passe correspondent
 *
 * @param password1 - Premier mot de passe
 * @param password2 - Deuxième mot de passe
 * @returns true si identiques et non vides
 */
export function passwordsMatch(password1: string, password2: string): boolean {
  return password1 === password2 && password1.length > 0;
}

/**
 * Génère des suggestions pour améliorer un mot de passe faible
 *
 * @param password - Le mot de passe actuel
 * @returns Array de suggestions en français
 */
export function getPasswordImprovementSuggestions(password: string): string[] {
  const suggestions: string[] = [];
  const criteria = checkPasswordCriteria(password);

  if (!criteria.hasMinLength) {
    suggestions.push(`Ajoutez des caractères pour atteindre au moins ${MIN_PASSWORD_LENGTH} caractères`);
  }
  if (!criteria.hasUpperCase) {
    suggestions.push('Ajoutez au moins une lettre majuscule (A-Z)');
  }
  if (!criteria.hasLowerCase) {
    suggestions.push('Ajoutez au moins une lettre minuscule (a-z)');
  }
  if (!criteria.hasNumber) {
    suggestions.push('Ajoutez au moins un chiffre (0-9)');
  }
  if (!criteria.hasSpecialChar) {
    suggestions.push('Ajoutez au moins un caractère spécial (!@#$%^&*)');
  }

  // Check for repeated characters
  if (PATTERNS.repeatedChars.test(password)) {
    suggestions.push('Évitez les caractères répétés (ex: aaa, 111)');
  }

  // Check length bonus
  if (password.length > 0 && password.length <= 12 && criteria.hasMinLength) {
    suggestions.push('Pour plus de sécurité, utilisez plus de 12 caractères');
  }

  return suggestions;
}

/**
 * Vérifie si un mot de passe contient des motifs courants faibles
 *
 * @param password - Le mot de passe à vérifier
 * @returns true si des motifs faibles sont détectés
 */
export function hasWeakPatterns(password: string): boolean {
  const weakPatterns = [
    /^password$/i,
    /^admin$/i,
    /^12345678$/,
    /^qwerty$/i,
    /^azerty$/i,
    /(.)\1{3,}/, // 4+ repeated characters
    /12345678/,
    /abcdefgh/,
  ];

  return weakPatterns.some((pattern) => pattern.test(password));
}
