// src/pages/Login/index.tsx

import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { PageTransition } from '../../components/ui/PageTransition';
import { motion } from 'framer-motion';

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
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-cyan-50 flex items-center justify-center p-4">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 30, 0],
              y: [0, -20, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-200/30 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              x: [0, -30, 0],
              y: [0, 20, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1,
            }}
          />
        </div>

        <motion.div
          className="relative w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            delay: 0.1,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        >
          <Card variant="elevated" className="backdrop-blur-sm bg-white/90">
            <div className="p-8">
              <motion.div
                className="text-center mb-8"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                <motion.div
                  className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center mb-4 shadow-lg"
                  whileHover={{
                    scale: 1.05,
                    rotate: 5,
                  }}
                  transition={{
                    duration: 0.2,
                    ease: 'easeOut',
                  }}
                >
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
                </motion.div>
                <h1 className="text-2xl font-bold text-gray-900">KiteSurf School</h1>
                <p className="text-gray-600 mt-2">Connectez-vous à votre espace</p>
              </motion.div>

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {displayError && (
                  <motion.div
                    role="alert"
                    className="rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {displayError}
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                >
                  <Input
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    autoComplete="email"
                    disabled={isLoading}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                >
                  <Input
                    label="Mot de passe"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    disabled={isLoading}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                >
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    size="lg"
                    isLoading={isLoading}
                    enableRipple
                  >
                    Se connecter
                  </Button>
                </motion.div>
              </form>

              <motion.div
                className="mt-6 pt-6 border-t border-gray-100"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.3 }}
              >
                <p className="text-xs text-gray-500 text-center">
                  Comptes de test :
                </p>
                <div className="mt-2 space-y-1 text-xs text-gray-600">
                  <motion.p
                    className="hover:text-gray-900 transition cursor-pointer"
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => {
                      setEmail('admin@kiteschool.com');
                      setPassword('admin123');
                    }}
                  >
                    Admin: admin@kiteschool.com / admin123
                  </motion.p>
                  <motion.p
                    className="hover:text-gray-900 transition cursor-pointer"
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => {
                      setEmail('instructor@kiteschool.com');
                      setPassword('instructor123');
                    }}
                  >
                    Moniteur: instructor@kiteschool.com / instructor123
                  </motion.p>
                  <motion.p
                    className="hover:text-gray-900 transition cursor-pointer"
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => {
                      setEmail('student@kiteschool.com');
                      setPassword('student123');
                    }}
                  >
                    Élève: student@kiteschool.com / student123
                  </motion.p>
                </div>
              </motion.div>
            </div>
          </Card>
        </motion.div>
      </div>
    </PageTransition>
  );
}
