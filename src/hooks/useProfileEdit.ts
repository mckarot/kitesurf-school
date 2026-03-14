// src/hooks/useProfileEdit.ts
// Hook personnalisé pour l'édition de profil (RGPD Article 16)

import { useState, useCallback, useEffect } from 'react';
import { db } from '../db/db';
import type { User, UseProfileEditReturn, UpdateProfileInput, UpdatePasswordInput, ProfileUpdateResult, PhotoUploadResult } from '../types';
import {
  validateProfileUpdate as validateProfileUpdateUtil,
  updateUserProfile as updateUserProfileUtil,
  changePassword as changePasswordUtil,
  uploadProfilePhoto as uploadProfilePhotoUtil,
} from '../utils/profileUpdateLogic';

export function useProfileEdit(userId: number | null): UseProfileEditReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Charger les données utilisateur au montage
  useEffect(() => {
    async function loadUser() {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const userData = await db.users.get(userId);
        setUser(userData || null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load user data'));
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, [userId]);

  // Mettre à jour le profil (identité + email)
  const updateProfile = useCallback(async (data: UpdateProfileInput): Promise<ProfileUpdateResult> => {
    if (!userId) {
      return {
        success: false,
        error: 'Utilisateur non connecté',
      };
    }

    setError(null);

    // Valider les données
    const currentUser = await db.users.get(userId);
    if (!currentUser) {
      return {
        success: false,
        error: 'Utilisateur non trouvé',
      };
    }

    const validation = await validateProfileUpdateUtil(data, currentUser.email);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      return {
        success: false,
        error: firstError,
        field: Object.keys(validation.errors)[0] as keyof UpdateProfileInput,
      };
    }

    // Mettre à jour dans la base de données
    const result = await updateUserProfileUtil(userId, data);

    if (result.success) {
      // Mettre à jour l'état local
      setUser((prev) => prev ? { ...prev, ...data } : null);
    } else {
      setError(new Error(result.error));
    }

    return result;
  }, [userId]);

  // Changer le mot de passe
  const updatePassword = useCallback(async (input: UpdatePasswordInput): Promise<ProfileUpdateResult> => {
    if (!userId) {
      return {
        success: false,
        error: 'Utilisateur non connecté',
      };
    }

    setError(null);

    const result = await changePasswordUtil(
      userId,
      input.currentPassword,
      input.newPassword,
      input.confirmPassword
    );

    if (!result.success) {
      setError(new Error(result.error));
    }

    return result;
  }, [userId]);

  // Upload de photo
  const uploadPhoto = useCallback(async (file: File): Promise<PhotoUploadResult> => {
    if (!userId) {
      return {
        success: false,
        error: 'Utilisateur non connecté',
      };
    }

    setError(null);

    const result = await uploadProfilePhotoUtil(userId, file);

    if (result.success && result.photoBase64) {
      // Mettre à jour l'état local
      setUser((prev) => prev ? { ...prev, photo: result.photoBase64 } : null);
    } else if (result.error) {
      setError(new Error(result.error));
    }

    return result;
  }, [userId]);

  // Rafraîchir les données utilisateur
  const refreshUser = useCallback(async () => {
    if (!userId) return;

    try {
      const userData = await db.users.get(userId);
      setUser(userData || null);
    } catch (err) {
      console.error('refreshUser error:', err);
    }
  }, [userId]);

  // Effacer l'erreur
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    isLoading,
    error,
    updateProfile,
    updatePassword,
    uploadPhoto,
    refreshUser,
    clearError,
  };
}
