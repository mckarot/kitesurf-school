// src/types/profile.ts
// Types spécifiques pour la modification de profil (RGPD Article 16)
// Ce fichier ré-exporte les types depuis index.ts pour la compatibilité

// Ré-export de tous les types depuis index.ts
// Ce fichier existe pour la compatibilité avec les imports existants
export type {
  UpdateProfileInput,
  UpdatePasswordInput,
  ProfileUpdateResult,
  ValidationResult,
  PasswordValidationResult,
  PasswordStrengthCriteria,
  PhotoUploadResult,
  ProfileModificationHistory,
  UseProfileEditReturn,
  EditProfileFormState,
  EditProfileFormErrors,
  User,
} from './index';
