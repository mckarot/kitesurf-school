// src/App.tsx

import { RouterProvider } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { router } from './router';

/**
 * App - Composant racine avec AnimatePresence
 *
 * AnimatePresence est requis pour que les animations de sortie
 * (exit animations) fonctionnent correctement avec React Router.
 *
 * @see https://www.framer.com/motion/animate-presence/
 */
export function App() {
  return (
    <AnimatePresence mode="wait">
      <RouterProvider router={router} />
    </AnimatePresence>
  );
}
