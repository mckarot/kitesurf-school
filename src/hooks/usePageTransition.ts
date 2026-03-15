// src/hooks/usePageTransition.ts

import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface UsePageTransitionOptions {
  /** Durée de la transition en ms (défaut: 300) */
  duration?: number;
  /** Fonction de rappel après la transition */
  onTransitionComplete?: () => void;
}

interface UsePageTransitionReturn {
  /** Naviguer avec transition */
  navigateWithTransition: (to: string, options?: NavigateOptions) => Promise<void>;
  /** Revenir en arrière avec transition */
  backWithTransition: () => Promise<void>;
  /** Rafraîchir la page avec transition */
  refreshWithTransition: () => Promise<void>;
  /** Indique si une transition est en cours */
  isTransitioning: boolean;
}

interface NavigateOptions {
  replace?: boolean;
  state?: unknown;
}

/**
 * usePageTransition - Hook pour faciliter les transitions de pages
 *
 * Features:
 * - Navigation avec animation fluide
 * - Gestion du état de transition
 * - Callback après transition
 * - Compatible React Router v6.4+
 *
 * @example
 * ```tsx
 * const { navigateWithTransition, backWithTransition } = usePageTransition();
 *
 * const handleNavigate = async () => {
 *   await navigateWithTransition('/dashboard');
 * };
 * ```
 */
export function usePageTransition({
  duration = 300,
  onTransitionComplete,
}: UsePageTransitionOptions = {}): UsePageTransitionReturn {
  const navigate = useNavigate();
  const location = useLocation();
  const isTransitioning = false; // Géré par Framer Motion au niveau du layout

  const wait = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const navigateWithTransition = useCallback(
    async (to: string, options?: NavigateOptions) => {
      // La transition est gérée par PageTransition wrapper
      // On navigue directement, Framer Motion s'occupe de l'animation
      navigate(to, {
        replace: options?.replace,
        state: options?.state,
      });

      // Attendre la fin de l'animation
      await wait(duration);
      onTransitionComplete?.();
    },
    [navigate, duration, onTransitionComplete]
  );

  const backWithTransition = useCallback(async () => {
    navigate(-1);
    await wait(duration);
    onTransitionComplete?.();
  }, [navigate, duration, onTransitionComplete]);

  const refreshWithTransition = useCallback(async () => {
    // Navigation vers la même route pour déclencher le loader
    navigate(location.pathname, { replace: true, state: { refresh: true } });
    await wait(duration);
    onTransitionComplete?.();
  }, [navigate, location.pathname, duration, onTransitionComplete]);

  return {
    navigateWithTransition,
    backWithTransition,
    refreshWithTransition,
    isTransitioning,
  };
}
