# Agents IA — KiteSurf School

> Système multi-agents pour le développement de l'application KiteSurf School.
> Stack : React 18 + Vite + TypeScript strict + Tailwind CSS + Dexie.js + React Router v6.4+

---

## 🚀 Stack Technique — Versions Fixées

| Composant | Technologie | Version minimale | Note critique |
|-----------|-------------|-----------------|---------------|
| **UI** | React | `^18.2` | `createRoot`, Suspense natif |
| **Build** | Vite | `^5.0` | HMR + ESM natif |
| **Langage** | TypeScript | `^5.3` | `"strict": true` obligatoire |
| **Styling** | Tailwind CSS | `^3.4` | JIT, pas de config custom sans raison |
| **Animations** | Framer Motion | `^11.0` | Pour les animations complexes (mount/unmount, séquences) |
| **Database** | Dexie.js | `^3.2` | IndexedDB, supporte les indexes composites |
| **Router** | React Router DOM | `^6.21` | **Data router** (`createBrowserRouter`) requis |
| **Tests unit.** | Vitest | `^1.2` | Remplace Jest — config jsdom |
| **Tests compo.** | React Testing Library | `^14.1` | + `@testing-library/user-event ^14` |
| **Tests E2E** | Playwright | `^1.41` | Seed via `page.evaluate()` |
| **IndexedDB mock** | fake-indexeddb | `^5.0` | Obligatoire dans `setup.ts` |

---

## 📁 Agents Disponibles

| Agent | Rôle | Appel direct ? |
|-------|------|----------------|
| **orchestrator** | Point d'entrée unique — analyse, délègue, contrôle, rapporte | ✅ Toujours lui en premier |
| **architect** | Architecture React, types, routing, Error Boundaries | ❌ Appelé par l'orchestrateur |
| **database** | Schéma Dexie.js, migrations, requêtes optimisées | ❌ Appelé par l'orchestrateur |
| **developer** | Implémentation fonctionnelle (composants, hooks, loaders) | ❌ Appelé par l'orchestrateur |
| **ui-animator** | Animations sur le code existant (Tailwind + Framer Motion) | ❌ Appelé par l'orchestrateur |
| **reviewer** | Audit qualité → rapport JSON parseable | ❌ Appelé par l'orchestrateur |
| **tester** | Vitest + RTL + Playwright avec seed Dexie | ❌ Appelé par l'orchestrateur |

> **Règle d'or** : tu ne parles qu'à l'`orchestrator`.
> Appeler un agent directement bypass les contrôles qualité et la boucle review.

---

## 🔄 Comment utiliser le système

### Ce que tu fais

Donne une instruction en langage naturel à l'orchestrateur :

```
"Ajouter un écran de profil avec modification du display_name"
"Le filtre par niveau sur la page des cours ne retourne aucun résultat"
"CoursesPage.tsx fait 230 lignes, c'est trop long"
"Ajouter un champ archivedAt sur les cours"
"Ajouter des transitions d'entrée sur les cards de la page courses"
```

### Ce que l'orchestrateur fait

Il qualifie la tâche, choisit le pipeline, délègue dans le bon ordre :

```
feature       →  architect → [database] → developer → [ui-animator] → reviewer ↺ → tester
bugfix        →  developer → reviewer ↺ → tester
refactor      →  architect → developer → [ui-animator] → reviewer ↺ → tester
schema-change →  database → architect → developer → reviewer ↺ → tester
```

`[ui-animator]` entre crochets = appelé uniquement si des composants UI sont créés ou modifiés.
Skippé sur bugfix et schema-change.

### Séparation des responsabilités developer / ui-animator

| developer | ui-animator |
|---|---|
| Logique métier, hooks, Dexie | Animations uniquement |
| Structure JSX, props, types | Jamais de logique ni de types |
| Classes Tailwind fonctionnelles | Classes Tailwind `transition-*`, `hover:`, `animate-*` |
| — | Framer Motion (`motion.*`, `AnimatePresence`) |

### Ce que tu fais à la fin

```
⚠️  npm install      — si framer-motion a été ajouté
⚠️  npm run build    — vérifier zéro erreur TypeScript
⚠️  npm test         — vérifier coverage > 80%
⚠️  Test navigateur  — vérifier les animations manuellement
⚠️  git add / commit / push
```

---

## 🏗️ Architecture du Projet

```
kitesurf-school/
├── src/
│   ├── db/
│   │   ├── db.ts              # AppDatabase class + schéma Dexie + export db
│   │   └── migrations/        # v2.ts, v3.ts… (un fichier par version)
│   ├── types/
│   │   └── index.ts           # Toutes les interfaces du domaine
│   ├── components/
│   │   ├── ui/                # Button, Input, Badge, Modal… (atomiques)
│   │   └── [Feature]/         # Composants d'une feature spécifique
│   ├── pages/
│   │   └── [PageName]/
│   │       ├── index.tsx      # Page + export de la fonction loader
│   │       └── components/    # Composants privés à cette page
│   ├── hooks/
│   │   └── use[Name].ts       # Logique métier + accès Dexie
│   ├── utils/
│   │   └── [name].ts          # Fonctions pures (zéro effet de bord)
│   ├── test/
│   │   └── setup.ts           # fake-indexeddb/auto + beforeEach clear DB
│   └── router.tsx             # createBrowserRouter + toutes les routes
├── playwright/
│   ├── fixtures/
│   │   └── db-fixture.ts      # Fixture seedDb pour Playwright
│   └── tests/                 # Tests E2E par flux
├── vitest.config.ts
├── playwright.config.ts
└── tsconfig.json              # strict: true obligatoire
```

---

## 📋 Règles Globales — Non Négociables

### TypeScript
- `"strict": true` dans `tsconfig.json` — toujours
- Zéro `any`, zéro `as Type` sans type guard
- Types du domaine centralisés dans `src/types/index.ts`
- `id: number` (jamais `id?: number`) pour les entités stockées en DB

### Dexie.js
- Schéma dans `db.ts` = source de vérité — jamais de champ inventé en dehors
- Booléens indexés : `0 | 1` (pas `boolean`)
- Chaque `version(N > 1)` avec `.upgrade()` si données à migrer
- Zéro `.filter()` JS sur des collections (utiliser les indexes)
- `liveQuery` avec `unsubscribe()` dans le cleanup — sinon fuite mémoire

### React Router v6.4+
- `createBrowserRouter` uniquement (pas `BrowserRouter`)
- Données initiales via `loader` (pas `useEffect`)
- `useLoaderData()` dans les composants de page
- `errorElement` sur chaque route principale

### Tailwind CSS
- Zéro `style={}`, zéro fichier `.css` custom
- `focus-visible:` sur tous les éléments interactifs
- Responsive systématique sur les layouts (`sm:`, `md:`, `lg:`)

### Animations
- Tailwind pour les états statiques (hover, focus, spinner)
- Framer Motion pour les animations liées à un état React (mount/unmount, conditionnel)
- `prefers-reduced-motion` obligatoire sur toutes les animations Framer Motion
- Uniquement `transform` et `opacity` animés (pas de reflow)

### Accessibilité
- `aria-label` sur tous les boutons sans texte visible
- `role="alert"` + `aria-live` sur les erreurs
- Focus management sur les modales
- Navigation clavier complète

### Git
- ❌ Aucun commit automatique — l'humain gère toujours les commits

---

## 🎯 Projet : KiteSurf School

Application de gestion d'école de kitesurf, 100% offline-first via IndexedDB.

**3 profils utilisateur :**
- **Admin** : validation des réservations, gestion des moniteurs/cours
- **Moniteur** : visualisation de son planning, gestion de ses créneaux
- **Élève** : consultation des cours disponibles, réservation de créneaux

**Flux principaux :**
1. Inscription / connexion (profil stocké en Dexie)
2. Consultation des cours disponibles (filtrés par niveau, date)
3. Réservation d'un créneau (transaction Dexie : réservation + décrémentation places)
4. Validation admin (changement de statut via transaction)
5. Planning moniteur (vue calendrier de ses créneaux)

---

## 🔑 Décisions d'Architecture — Pourquoi

| Décision | Raison |
|----------|--------|
| **Dexie.js** plutôt que localStorage | Requêtes indexées, transactions, migrations versionnées, stockage > 5MB |
| **createBrowserRouter** plutôt que BrowserRouter | Loaders data router = données avant rendu, zéro flash, meilleure UX |
| **0\|1** pour les booléens Dexie | Dexie v3 ne peut pas indexer les booléens natifs — comportement silencieux incorrect sinon |
| **fake-indexeddb** en test | jsdom ne fournit pas window.indexedDB — crash immédiat sinon |
| **Vitest** plutôt que Jest | Configuration native Vite, ESM natif, 5-10x plus rapide |
| **Diffs** en dev uniquement | Retourner des fichiers complets dépasse la context window sur une vraie codebase |
| **Orchestrateur** comme point d'entrée | Garantit l'ordre des agents, gère la boucle review, évite d'oublier le tester |
| **database avant architect** en schema-change | Le schéma est la source de vérité — l'archi s'adapte, pas l'inverse |
| **ui-animator après developer** | Le code fonctionnel doit exister avant d'ajouter le mouvement |
| **Tailwind pour simple, Framer pour complexe** | Zéro dépendance inutile — Framer Motion uniquement si Tailwind ne suffit pas |
