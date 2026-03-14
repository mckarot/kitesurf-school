// src/pages/Profile/EditProfilePage.tsx
// Page d'édition de profil (RGPD Article 16 - Droit de rectification)

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useProfileEdit } from '../../hooks/useProfileEdit';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ImageUpload } from '../../components/ui/ImageUpload';
import { PasswordStrength } from '../../components/ui/PasswordStrength';
import type { EditProfileFormState, EditProfileFormErrors } from '../../types';

export function EditProfilePage() {
  const { user: authUser } = useAuth();
  const navigate = useNavigate();

  const {
    user,
    isLoading,
    error: hookError,
    updateProfile,
    updatePassword,
    uploadPhoto,
  } = useProfileEdit(authUser?.id ?? null);

  // État du formulaire identité
  const [identityForm, setIdentityForm] = useState<EditProfileFormState>({
    firstName: '',
    lastName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    photo: null,
  });

  const [identityErrors, setIdentityErrors] = useState<EditProfileFormErrors>({});
  const [isIdentitySaving, setIsIdentitySaving] = useState(false);
  const [identitySuccess, setIdentitySuccess] = useState(false);

  // État du formulaire mot de passe
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const [photoError, setPhotoError] = useState<string | undefined>();

  // Initialiser le formulaire avec les données utilisateur
  useEffect(() => {
    if (user) {
      setIdentityForm((prev) => ({
        ...prev,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        photo: user.photo ?? null,
      }));
    }
  }, [user]);

  // Gestion des champs identité
  const handleIdentityChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setIdentityForm((prev) => ({ ...prev, [name]: value }));
    // Effacer l'erreur quand l'utilisateur commence à modifier
    if (identityErrors[name as keyof EditProfileFormErrors]) {
      setIdentityErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    setIdentitySuccess(false);
  };

  // Gestion du champ photo
  const handlePhotoSelect = async (file: File) => {
    setPhotoError(undefined);
    const result = await uploadPhoto(file);
    if (!result.success) {
      setPhotoError(result.error);
    }
  };

  const handlePhotoRemove = async () => {
    // Pour supprimer, on upload une photo vide ou on gère dans le hook
    // Ici, on laisse la photo actuelle et on ne fait rien
    setIdentityForm((prev) => ({ ...prev, photo: null }));
  };

  // Soumission du formulaire identité
  const handleIdentitySubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsIdentitySaving(true);
    setIdentityErrors({});
    setIdentitySuccess(false);

    try {
      const result = await updateProfile({
        firstName: identityForm.firstName,
        lastName: identityForm.lastName,
        email: identityForm.email,
        photo: identityForm.photo ?? undefined,
      });

      if (!result.success) {
        if (result.field) {
          setIdentityErrors((prev) => ({ ...prev, [result.field!]: result.error! }));
        } else {
          setIdentityErrors((prev) => ({ ...prev, general: result.error! }));
        }
      } else {
        setIdentitySuccess(true);
      }
    } catch {
      setIdentityErrors({ general: 'Une erreur inattendue est survenue' });
    } finally {
      setIsIdentitySaving(false);
    }
  };

  // Gestion des champs mot de passe
  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    if (passwordErrors[name]) {
      const newErrors = { ...passwordErrors };
      delete newErrors[name];
      setPasswordErrors(newErrors);
    }
    setPasswordSuccess(false);
  };

  // Soumission du formulaire mot de passe
  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsPasswordSaving(true);
    setPasswordErrors({});
    setPasswordSuccess(false);

    try {
      const result = await updatePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });

      if (!result.success) {
        // Déterminer quel champ a l'erreur
        const fieldMap: Record<string, keyof typeof passwordForm> = {
          currentPassword: 'currentPassword',
          newPassword: 'newPassword',
          confirmPassword: 'confirmPassword',
          general: 'currentPassword',
        };
        const field = result.field ? fieldMap[result.field] || 'currentPassword' : 'currentPassword';
        setPasswordErrors((prev) => ({ ...prev, [field]: result.error ?? 'Erreur inconnue' }));
      } else {
        setPasswordSuccess(true);
        // Réinitialiser le formulaire
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }
    } catch {
      setPasswordErrors({ general: 'Une erreur inattendue est survenue' });
    } finally {
      setIsPasswordSaving(false);
    }
  };

  // Affichage état de chargement
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement de vos données...</p>
        </div>
      </div>
    );
  }

  // Affichage erreur critique
  if (hookError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl border border-gray-200 p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur de chargement</h2>
          <p className="text-sm text-gray-600 mb-4">{hookError.message}</p>
          <Button onClick={() => navigate('/profil/mes-donnees')}>
            Retour au profil
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/profil/mes-donnees')}
              className="text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="Retour à mon profil"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-gray-900">Modifier mon profil</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Section 1: Informations personnelles */}
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Informations personnelles
            </h2>

            <form onSubmit={handleIdentitySubmit} className="space-y-4" noValidate>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Prénom"
                  name="firstName"
                  value={identityForm.firstName}
                  onChange={handleIdentityChange}
                  error={identityErrors.firstName}
                  required
                  autoComplete="given-name"
                />
                <Input
                  label="Nom"
                  name="lastName"
                  value={identityForm.lastName}
                  onChange={handleIdentityChange}
                  error={identityErrors.lastName}
                  required
                  autoComplete="family-name"
                />
              </div>

              <Input
                label="Email"
                name="email"
                type="email"
                value={identityForm.email}
                onChange={handleIdentityChange}
                error={identityErrors.email}
                required
                autoComplete="email"
              />

              {/* Photo de profil */}
              <ImageUpload
                label="Photo de profil"
                currentPhoto={identityForm.photo ?? user?.photo}
                onFileSelect={handlePhotoSelect}
                onRemove={handlePhotoRemove}
                error={photoError}
                maxSizeMB={0.5}
              />

              {/* Messages de feedback */}
              {identityErrors.general && (
                <div
                  role="alert"
                  className="bg-red-50 border border-red-200 rounded-lg p-3"
                >
                  <p className="text-sm text-red-800">{identityErrors.general}</p>
                </div>
              )}

              {identitySuccess && (
                <div
                  role="status"
                  className="bg-green-50 border border-green-200 rounded-lg p-3"
                >
                  <p className="text-sm text-green-800">
                    ✓ Vos informations ont été mises à jour avec succès
                  </p>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isIdentitySaving}
                  aria-label="Enregistrer les modifications"
                >
                  Enregistrer les modifications
                </Button>
              </div>
            </form>
          </section>

          {/* Section 2: Changer le mot de passe */}
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Changer le mot de passe
            </h2>

            <form onSubmit={handlePasswordSubmit} className="space-y-4" noValidate>
              <Input
                label="Mot de passe actuel"
                name="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                error={passwordErrors.currentPassword}
                required
                autoComplete="current-password"
              />

              <Input
                label="Nouveau mot de passe"
                name="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                error={passwordErrors.newPassword}
                required
                autoComplete="new-password"
              />

              <PasswordStrength password={passwordForm.newPassword} />

              <Input
                label="Confirmer le nouveau mot de passe"
                name="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                error={passwordErrors.confirmPassword}
                required
                autoComplete="new-password"
              />

              {/* Messages de feedback */}
              {passwordErrors.general && (
                <div
                  role="alert"
                  className="bg-red-50 border border-red-200 rounded-lg p-3"
                >
                  <p className="text-sm text-red-800">{passwordErrors.general}</p>
                </div>
              )}

              {passwordSuccess && (
                <div
                  role="status"
                  className="bg-green-50 border border-green-200 rounded-lg p-3"
                >
                  <p className="text-sm text-green-800">
                    ✓ Votre mot de passe a été changé avec succès
                  </p>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isPasswordSaving}
                  aria-label="Changer le mot de passe"
                >
                  Changer le mot de passe
                </Button>
              </div>
            </form>
          </section>

          {/* Section 3: Informations RGPD */}
          <section className="bg-blue-50 rounded-xl border border-blue-200 p-6">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">
              📋 Vos droits RGPD (Article 16)
            </h3>
            <p className="text-sm text-blue-800">
              Conformément au Règlement Général sur la Protection des Données (RGPD),
              vous disposez d'un droit de rectification sur vos données personnelles.
              Les modifications apportées sur cette page sont enregistrées immédiatement
              et visibles dans la section{' '}
              <a
                href="/profil/mes-donnees"
                className="text-blue-700 hover:underline font-medium"
              >
                Mes Données Personnelles
              </a>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
