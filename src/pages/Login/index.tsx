// src/pages/Login/index.tsx

import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    if (!email || !password) {
      setFormError('Veuillez remplir tous les champs');
      return;
    }

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch {
      // Error is handled by the hook
    }
  };

  const displayError = formError || error?.message || null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <Card variant="elevated" className="w-full max-w-md">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 15l4-4m0 0l4 4m-4-4v12"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">KiteSurf School</h1>
            <p className="text-gray-600 mt-2">Connectez-vous à votre espace</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {displayError && (
              <div
                role="alert"
                className="rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200"
              >
                {displayError}
              </div>
            )}

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              autoComplete="email"
              disabled={isLoading}
            />

            <Input
              label="Mot de passe"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={isLoading}
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              size="lg"
              isLoading={isLoading}
            >
              Se connecter
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              Comptes de test :
            </p>
            <div className="mt-2 space-y-1 text-xs text-gray-600">
              <p>Admin: admin@kiteschool.com / admin123</p>
              <p>Moniteur: instructor@kiteschool.com / instructor123</p>
              <p>Élève: student@kiteschool.com / student123</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
