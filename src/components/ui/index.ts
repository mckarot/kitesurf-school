// src/components/ui/index.ts

/**
 * UI Components - Bibliothèque de composants d'interface
 *
 * Exporte tous les composants UI réutilisables avec animations.
 */

// Components de base
export { Button } from './Button';
export { Input } from './Input';
export { Card, CardHeader, CardBody, CardFooter } from './Card';
export { Badge } from './Badge';
export { Checkbox } from './Checkbox';
export { Select } from './Select';
export { Toggle } from './Toggle';

// Components avec animations
export { PageTransition } from './PageTransition';
export { AnimatedCard } from './AnimatedCard';
export { StaggerContainer, staggerContainerVariants, staggerItemVariants } from './StaggerContainer';
export { LoadingSpinner } from './LoadingSpinner';

// Components spécialisés
export { Calendar } from './Calendar';
export { DatePicker } from './DatePicker';
export { ImageUpload } from './ImageUpload';
export { PasswordStrength } from './PasswordStrength';
