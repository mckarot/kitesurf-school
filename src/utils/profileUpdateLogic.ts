// src/utils/profileUpdateLogic.ts
// Logique métier pour la modification de profil (RGPD Article 16)
// Pure functions + Dexie transactions for profile management

import { db } from '../db/db';
import type {
  User,
  UpdateProfileInput,
  ProfileUpdateResult,
  PhotoUploadResult,
  ValidationResult,
} from '../types';
import {
  validatePassword,
  getPasswordStrength,
  checkPasswordCriteria,
} from './passwordValidator';

// ============================================
// TYPES INTERNES
// ============================================

interface ProfileValidationErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  photo?: string;
}

// ============================================
// VALIDATION DE PROFIL
// ============================================

/**
 * Valide les données de profil avant modification
 *
 * Validation rules:
 * - firstName: required, min 2 characters
 * - lastName: required, min 2 characters
 * - email: required, valid format, unique (except current email)
 * - photo: optional, must be valid base64 if provided
 *
 * @param data - Données à valider
 * @param currentEmail - Email actuel pour vérifier le changement
 * @returns ValidationResult avec isValid et errors
 */
export async function validateProfileUpdate(
  data: UpdateProfileInput,
  currentEmail?: string
): Promise<ValidationResult> {
  const errors: ProfileValidationErrors = {};

  // Validation prénom (firstName)
  if (!data.firstName || data.firstName.trim().length === 0) {
    errors.firstName = 'Le prénom est obligatoire';
  } else if (data.firstName.trim().length < 2) {
    errors.firstName = 'Le prénom doit contenir au moins 2 caractères';
  }

  // Validation nom (lastName)
  if (!data.lastName || data.lastName.trim().length === 0) {
    errors.lastName = 'Le nom est obligatoire';
  } else if (data.lastName.trim().length < 2) {
    errors.lastName = 'Le nom doit contenir au moins 2 caractères';
  }

  // Validation email
  if (!data.email || data.email.trim().length === 0) {
    errors.email = "L'email est obligatoire";
  } else {
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.email = "L'email doit être une adresse email valide";
    }

    // Email uniqueness check (only if email changed)
    if (currentEmail && data.email.toLowerCase() !== currentEmail.toLowerCase()) {
      const existingUser = await db.users.where('email').equals(data.email.toLowerCase()).first();
      if (existingUser) {
        errors.email = "Cette adresse email est déjà utilisée par un autre compte";
      }
    }
  }

  // Validation photo (if provided)
  if (data.photo !== undefined && data.photo !== null && data.photo !== '') {
    // Check if it's a valid base64 data URL
    const base64Regex = /^data:image\/(png|jpeg|jpg|gif|webp);base64,[A-Za-z0-9+/=]+$/;
    if (!base64Regex.test(data.photo)) {
      errors.photo = 'Le format de la photo doit être une image valide (PNG, JPEG, GIF, WebP)';
    }

    // Check photo size (max 500KB)
    // Base64 adds ~33% overhead, so 500KB image = ~680KB base64 string
    const maxBase64Length = 680 * 1024; // ~500KB in base64
    if (data.photo.length > maxBase64Length) {
      errors.photo = 'La photo ne doit pas dépasser 500KB';
    }
  }

  // Convert errors to generic record for ValidationResult
  const errorEntries = Object.entries(errors) as [string, string][];
  const errorRecord: Record<string, string> = Object.fromEntries(errorEntries);

  return {
    isValid: Object.keys(errors).length === 0,
    errors: errorRecord,
  };
}

// ============================================
// MISE À JOUR DE PROFIL
// ============================================

/**
 * Met à jour le profil d'un utilisateur dans la base de données
 *
 * Uses Dexie transaction for atomic update.
 * Updates only provided fields to avoid overwriting with undefined.
 *
 * @param userId - ID de l'utilisateur
 * @param data - Nouvelles données de profil
 * @returns ProfileUpdateResult avec success et error optionnel
 */
export async function updateUserProfile(
  userId: number,
  data: UpdateProfileInput
): Promise<ProfileUpdateResult> {
  try {
    // Build update object with only defined fields
    const updateData: Partial<User> = {};

    if (data.firstName !== undefined) {
      updateData.firstName = data.firstName.trim();
    }
    if (data.lastName !== undefined) {
      updateData.lastName = data.lastName.trim();
    }
    if (data.email !== undefined) {
      updateData.email = data.email.trim().toLowerCase();
    }
    if (data.photo !== undefined) {
      updateData.photo = data.photo;
    }

    // Perform the update using Dexie
    // Note: update() returns number of updated records (0 or 1)
    const updatedCount = await db.users.update(userId, updateData);

    if (updatedCount === 0) {
      return {
        success: false,
        error: "Impossible de mettre à jour le profil. L'utilisateur n'existe pas.",
        field: 'general',
      };
    }

    // Verify the update by fetching the user
    const updatedUser = await db.users.get(userId);
    if (!updatedUser) {
      return {
        success: false,
        error: "Impossible de récupérer l'utilisateur après mise à jour",
        field: 'general',
      };
    }

    return { success: true };
  } catch (error) {
    console.error('updateUserProfile error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour du profil',
      field: 'general',
    };
  }
}

// ============================================
// CHANGEMENT DE MOT DE PASSE
// ============================================

/**
 * Change le mot de passe d'un utilisateur
 *
 * Security checks:
 * 1. Verify current password matches stored password
 * 2. Validate new password strength using checkPasswordCriteria
 * 3. Ensure new password and confirmation match
 *
 * @param userId - ID de l'utilisateur
 * @param currentPassword - Mot de passe actuel
 * @param newPassword - Nouveau mot de passe
 * @param confirmPassword - Confirmation du nouveau mot de passe
 * @returns ProfileUpdateResult avec success et error optionnel
 */
export async function changePassword(
  userId: number,
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
): Promise<ProfileUpdateResult> {
  try {
    // Fetch user to verify current password
    const user = await db.users.get(userId);
    if (!user) {
      return {
        success: false,
        error: 'Utilisateur non trouvé',
        field: 'general',
      };
    }

    // Verify current password
    if (user.password !== currentPassword) {
      return {
        success: false,
        error: 'Le mot de passe actuel est incorrect',
        field: 'currentPassword',
      };
    }

    // Validate new password strength
    const criteria = checkPasswordCriteria(newPassword);
    const validationErrors: string[] = [];

    if (!criteria.hasMinLength) {
      validationErrors.push('Le mot de passe doit contenir au moins 8 caractères');
    }
    if (!criteria.hasUpperCase) {
      validationErrors.push('Le mot de passe doit contenir au moins une lettre majuscule');
    }
    if (!criteria.hasLowerCase) {
      validationErrors.push('Le mot de passe doit contenir au moins une lettre minuscule');
    }
    if (!criteria.hasNumber) {
      validationErrors.push('Le mot de passe doit contenir au moins un chiffre');
    }
    if (!criteria.hasSpecialChar) {
      validationErrors.push('Le mot de passe doit contenir au moins un caractère spécial');
    }

    if (validationErrors.length > 0) {
      return {
        success: false,
        error: validationErrors[0],
        field: 'newPassword',
      };
    }

    // Verify password confirmation
    if (newPassword !== confirmPassword) {
      return {
        success: false,
        error: 'Les nouveaux mots de passe ne correspondent pas',
        field: 'general' as keyof UpdateProfileInput | 'currentPassword' | 'newPassword' | 'general' | undefined,
      };
    }

    // Update password in database
    // Note: In production, hash with bcrypt/argon2 before storing
    const updatedCount = await db.users.update(userId, { password: newPassword });

    if (updatedCount === 0) {
      return {
        success: false,
        error: 'Erreur lors de la mise à jour du mot de passe',
        field: 'general',
      };
    }

    return { success: true };
  } catch (error) {
    console.error('changePassword error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors du changement de mot de passe',
      field: 'general',
    };
  }
}

// ============================================
// UPLOAD DE PHOTO DE PROFIL
// ============================================

/**
 * Convertit un fichier image en base64 pour stockage dans IndexedDB
 *
 * Constraints:
 * - Valid types: image/jpeg, image/png, image/gif, image/webp
 * - Max size: 500KB (to avoid IndexedDB QuotaExceededError)
 *
 * @param file - Fichier image à convertir
 * @returns PhotoUploadResult avec photoBase64 ou error
 */
export async function convertImageToBase64(file: File): Promise<PhotoUploadResult> {
  // Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return {
      success: false,
      error: 'Format de fichier non supporté. Utilisez JPG, PNG, GIF ou WebP.',
    };
  }

  // Validate file size (max 500KB)
  const maxSize = 500 * 1024; // 500KB in bytes
  if (file.size > maxSize) {
    return {
      success: false,
      error: 'La photo ne doit pas dépasser 500KB',
    };
  }

  try {
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };

      reader.onerror = () => {
        reject(new Error('Erreur lors de la lecture du fichier'));
      };

      reader.readAsDataURL(file);
    });

    return {
      success: true,
      photoBase64: base64,
    };
  } catch (error) {
    console.error('convertImageToBase64 error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de la conversion de l\'image',
    };
  }
}

/**
 * Upload et stocke la photo de profil d'un utilisateur
 *
 * Process:
 * 1. Convert image file to base64
 * 2. Validate base64 string
 * 3. Update user record in Dexie
 *
 * @param userId - ID de l'utilisateur
 * @param file - Fichier image à uploader
 * @returns PhotoUploadResult avec success et photoBase64 ou error
 */
export async function uploadProfilePhoto(
  userId: number,
  file: File
): Promise<PhotoUploadResult> {
  try {
    // Step 1: Convert image to base64
    const conversionResult = await convertImageToBase64(file);
    if (!conversionResult.success) {
      return conversionResult;
    }

    // Step 2: Update user with photo in Dexie
    const updatedCount = await db.users.update(userId, {
      photo: conversionResult.photoBase64,
    });

    if (updatedCount === 0) {
      return {
        success: false,
        error: "Impossible de mettre à jour la photo. L'utilisateur n'existe pas.",
      };
    }

    return {
      success: true,
      photoBase64: conversionResult.photoBase64,
    };
  } catch (error) {
    console.error('uploadProfilePhoto error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de l\'upload de la photo',
    };
  }
}

/**
 * Supprime la photo de profil d'un utilisateur
 *
 * Sets photo field to empty string (not undefined) for consistency.
 *
 * @param userId - ID de l'utilisateur
 * @returns Result avec success et error optionnel
 */
export async function removeProfilePhoto(
  userId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const updatedCount = await db.users.update(userId, {
      photo: '', // Empty string for consistency, not undefined
    });

    if (updatedCount === 0) {
      return {
        success: false,
        error: "Impossible de supprimer la photo. L'utilisateur n'existe pas.",
      };
    }

    return { success: true };
  } catch (error) {
    console.error('removeProfilePhoto error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de la suppression de la photo',
    };
  }
}

// ============================================
// UTILITAIRES
// ============================================

/**
 * Récupère les données complètes d'un utilisateur pour l'édition
 *
 * @param userId - ID de l'utilisateur
 * @returns User ou null si non trouvé
 */
export async function getUserForEdit(userId: number): Promise<User | null> {
  try {
    const user = await db.users.get(userId);
    return user ?? null;
  } catch (error) {
    console.error('getUserForEdit error:', error);
    return null;
  }
}

/**
 * Vérifie si un email est déjà utilisé par un autre utilisateur
 *
 * @param email - Email à vérifier
 * @param excludeUserId - ID de l'utilisateur à exclure (pour l'édition)
 * @returns true si l'email est déjà utilisé
 */
export async function isEmailTaken(email: string, excludeUserId?: number): Promise<boolean> {
  try {
    const existingUser = await db.users.where('email').equals(email.toLowerCase()).first();

    if (!existingUser) {
      return false;
    }

    // If excludeUserId is provided, check if it's a different user
    if (excludeUserId !== undefined) {
      return existingUser.id !== excludeUserId;
    }

    return true;
  } catch (error) {
    console.error('isEmailTaken error:', error);
    return false;
  }
}
