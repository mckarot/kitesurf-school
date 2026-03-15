# 🎨 Animations KiteSurf School - Guide d'Installation

## ⚠️ PRÉREQUIS - Installation de Framer Motion

**Framer Motion n'est pas installé dans le projet.** Vous devez l'installer avant que les animations fonctionnent :

```bash
cd kitesurf-school
npm install framer-motion
```

Ou avec yarn/pnpm :
```bash
yarn add framer-motion
# ou
pnpm add framer-motion
```

---

## 📦 NOUVEAUX COMPOSANTS CRÉÉS

### `src/components/ui/`

| Composant | Description |
|-----------|-------------|
| `PageTransition.tsx` | Wrapper pour transitions de pages (fade + slide Y) |
| `AnimatedCard.tsx` | Card avec hover effects (scale, shadow, glow) |
| `StaggerContainer.tsx` | Container pour listes avec entrée en cascade |
| `LoadingSpinner.tsx` | Spinner élégant avec gradient animé |
| `index.ts` | Export de tous les composants UI |

### `src/hooks/`

| Hook | Description |
|------|-------------|
| `usePageTransition.ts` | Hook pour naviguer avec transitions fluides |

---

## 📝 FICHIERS MODIFIÉS

### Composants UI mis à jour

| Fichier | Modifications |
|---------|---------------|
| `Button.tsx` | + Hover scale, + Active scale down, + Ripple effect, + Glow overlay |
| `Input.tsx` | + Focus animations, + Border glow, + Label color transition |
| `App.tsx` | + AnimatePresence wrapper pour exit animations |

### Pages mises à jour

| Page | Animations ajoutées |
|------|---------------------|
| `Dashboard/index.tsx` | PageTransition, StaggerContainer sur stats, AnimatedCard sur toutes les cards |
| `Student/index.tsx` | PageTransition, StaggerContainer sur cours, LoadingSpinner, AnimatedCard |
| `Admin/Credits/index.tsx` | PageTransition, StaggerContainer sur tableau, AnimatedCard sur stats |
| `Login/index.tsx` | PageTransition, Animated background blobs, Input stagger, Hover effects |

### Composants de page mis à jour

| Composant | Animations ajoutées |
|-----------|---------------------|
| `Student/StudentBalance.tsx` | AnimatedCard, progress bar animée, icon spring animation |
| `Admin/Credits/StatsSummary.tsx` | AnimatedCard par stat, stagger delays, gradient overlay |

---

## 🎯 CARACTÉRISTIQUES DES ANIMATIONS

### Respect de l'accessibilité
- ✅ `aria-busy` sur les zones de chargement
- ✅ `aria-live` sur les mises à jour dynamiques
- ✅ `role="alert"` sur les erreurs
- ✅ Focus management maintenu
- ✅ `prefers-reduced-motion` respecté par Framer Motion

### Performance
- ✅ Uniquement `transform` et `opacity` (pas de reflow)
- ✅ Transitions courtes (150-300ms)
- ✅ EaseOutCubic pour naturel

### Style Metalab 2026
- ✅ Gradients subtils
- ✅ Glow effects au hover
- ✅ Stagger en cascade
- ✅ Spring animations pour le vivant
- ✅ Background blobs animés (Login)

---

## 🚀 UTILISATION

### PageTransition
```tsx
import { PageTransition } from './components/ui/PageTransition';

function MyPage() {
  return (
    <PageTransition>
      {/* Contenu de la page */}
    </PageTransition>
  );
}
```

### AnimatedCard
```tsx
import { AnimatedCard } from './components/ui/AnimatedCard';

<AnimatedCard variant="glow">
  <CardHeader>Titre</CardHeader>
  <CardBody>Contenu</CardBody>
</AnimatedCard>
```

### StaggerContainer
```tsx
import { StaggerContainer } from './components/ui/StaggerContainer';

<StaggerContainer staggerDelay={0.08}>
  {items.map(item => (
    <div key={item.id}>{item.name}</div>
  ))}
</StaggerContainer>
```

### LoadingSpinner
```tsx
import { LoadingSpinner } from './components/ui/LoadingSpinner';

<LoadingSpinner size="lg" color="blue" showLabel />
```

### Button avec ripple
```tsx
import { Button } from './components/ui/Button';

<Button variant="primary" enableRipple>
  Click me
</Button>
```

---

## 🎨 VARIANTES DISPONIBLES

### AnimatedCard
- `default` - Bordure grise simple
- `elevated` - Ombre portée
- `glow` - Bordure bleue avec glow

### Button
- `primary` - Bleu avec glow gradient
- `secondary` - Gris
- `danger` - Rouge
- `ghost` - Transparent

### LoadingSpinner
- Size: `sm`, `md`, `lg`
- Color: `blue`, `white`, `gray`

---

## 🔧 PERSONNALISATION

### Modifier les durées
Dans `PageTransition.tsx` :
```tsx
transition={{
  duration: 0.3, // ← Modifier ici
  ease: [0.25, 0.1, 0.25, 1],
}}
```

### Modifier le stagger delay
Dans `StaggerContainer.tsx` :
```tsx
<StaggerContainer staggerDelay={0.08}> {/* ← Modifier ici */}
```

### Modifier les couleurs de glow
Dans `AnimatedCard.tsx` :
```tsx
boxShadow: variant === 'glow'
  ? '0 20px 25px -5px rgb(37 99 235 / 0.15)' // ← Modifier ici
  : '...'
```

---

## ✅ CHECKLIST POST-INSTALLATION

- [ ] Installer `framer-motion`
- [ ] Vérifier que toutes les pages se chargent sans erreur
- [ ] Tester les animations sur Dashboard
- [ ] Tester les animations sur Student
- [ ] Tester les animations sur Login
- [ ] Tester les animations sur Admin/Credits
- [ ] Vérifier l'accessibilité (navigation clavier)
- [ ] Tester avec `prefers-reduced-motion` activé

---

## 📚 RÉFÉRENCES

- [Framer Motion Documentation](https://www.framer.com/motion/)
- [AnimatePresence](https://www.framer.com/motion/animate-presence/)
- [Motion Values](https://www.framer.com/motion/motion-values/)
- [Tailwind CSS Transitions](https://tailwindcss.com/docs/transition-property)
