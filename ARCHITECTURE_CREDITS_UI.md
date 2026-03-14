# Architecture UI - Système de Crédits KiteSurf School

## 📋 Vue d'Ensemble

Cette architecture implémente les pages UI pour la gestion des crédits de cours selon le schéma Dexie v4 et les hooks existants.

---

## 🏗️ Structure de Fichiers Complète

```
src/
├── pages/
│   ├── Admin/
│   │   └── Credits/
│   │       ├── index.tsx                  # Page principale Admin Credits
│   │       ├── CreditsTable.tsx           # Tableau des élèves avec soldes
│   │       ├── AddCreditsModal.tsx        # Modal d'ajout de crédits
│   │       ├── CreditHistory.tsx          # Historique des crédits par élève
│   │       ├── CreditsErrorBoundary.tsx   # Error Boundary spécifique
│   │       └── loader.ts                  # Loader React Router
│   ├── Student/
│   │   ├── index.tsx                      # Page modifiée avec solde
│   │   ├── StudentBalance.tsx             # Composant affichage du solde
│   │   ├── BookCourseModal.tsx            # Modal de réservation avec confirmation
│   │   └── StudentErrorBoundary.tsx       # Error Boundary spécifique
│   └── Instructor/
│       ├── index.tsx                      # Page modifiée avec élèves assignés
│       ├── AssignedStudents.tsx           # Liste des élèves assignés
│       ├── ScheduleWithStudents.tsx       # Emploi du temps avec noms
│       └── InstructorErrorBoundary.tsx    # Error Boundary spécifique
├── hooks/
│   ├── useCourseCredits.ts                # Déjà existant ✓
│   └── useStudentBalance.ts               # Déjà existant ✓
├── utils/
│   ├── calculateBalance.ts                # Déjà existant ✓
│   └── createReservationWithCredit.ts     # Déjà existant ✓
└── router.tsx                             # À modifier avec nouvelles routes
```

---

## 🔀 Routing (React Router v6.4+)

### Modification de `src/router.tsx`

```typescript
// Nouvelles routes à ajouter
{
  path: '/admin/credits',
  element: <CreditsPage />,
  loader: creditsLoader,
  errorElement: <DbErrorBoundary><CreditsErrorBoundary /></DbErrorBoundary>,
}
```

---

## 📊 Interfaces TypeScript

### Types pour les Vues Admin

```typescript
// src/types/index.ts (à compléter)

/**
 * Vue consolidée pour l'affichage des crédits en page Admin
 */
export interface AdminCreditView {
  studentId: number;
  studentName: string;
  studentEmail: string;
  totalHours: number;
  usedHours: number;
  remainingHours: number;
  creditsCount: number;
  lastCreditDate?: number;
}

/**
 * Données retournées par le loader Admin Credits
 */
export interface AdminCreditsLoaderData {
  students: User[];
  credits: CourseCredit[];
  instructors: User[];
}

/**
 * Input pour le formulaire d'ajout de crédits
 */
export interface AddCreditsFormInput {
  studentId: number;
  instructorId?: number; // Optionnel: moniteur assigné
  hours: number;
  expiresAt?: number; // Timestamp optionnel
}
```

---

## 🛡️ Error Boundaries

### 1. `CreditsErrorBoundary.tsx`

Intercepte les erreurs spécifiques à la gestion des crédits:
- `QuotaExceededError`: Stockage IndexedDB plein
- `VersionError`: Problème de migration de schéma
- `DatabaseClosedError`: DB fermée (tab en arrière-plan)

### 2. `StudentErrorBoundary.tsx`

Intercepte les erreurs lors de la réservation:
- Échec de transaction `createReservationWithCredit`
- Solde insuffisant lors de la vérification

### 3. `InstructorErrorBoundary.tsx`

Intercepte les erreurs d'affichage des élèves assignés:
- Échec de chargement des crédits
- Problème de jointure cours/élèves

---

## 📦 Composants

### Page Admin - `/admin/credits`

#### `index.tsx` - Page Principale
- **Props**: Aucune (utilise `useLoaderData`)
- **Responsabilités**:
  - Afficher le tableau des élèves
  - Gérer l'ouverture/fermeture du modal
  - Gérer l'historique expandable
- **État local**: `selectedStudentId`, `isModalOpen`, `expandedHistoryId`

#### `CreditsTable.tsx`
- **Props**:
```typescript
interface CreditsTableProps {
  students: AdminCreditView[];
  onAddCredits: (studentId: number) => void;
  onViewHistory: (studentId: number) => void;
}
```
- **Responsabilités**:
  - Afficher le tableau triable
  - Boutons d'action par ligne
  - Indicateurs de solde (couleurs)

#### `AddCreditsModal.tsx`
- **Props**:
```typescript
interface AddCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddCreditsFormInput) => Promise<void>;
  students: User[];
  instructors: User[];
  initialStudentId?: number;
}
```
- **Responsabilités**:
  - Formulaire complet d'ajout
  - Validation des inputs
  - Accessibilité (focus trap, Escape)

#### `CreditHistory.tsx`
- **Props**:
```typescript
interface CreditHistoryProps {
  studentId: number;
  credits: CourseCredit[];
  onClose: () => void;
}
```
- **Responsabilités**:
  - Liste chronologique des crédits
  - Détails par crédit (heures, expiration, statut)

---

### Page Student - `/student`

#### `index.tsx` - Page Modifiée
- **Modifications**:
  - Ajout de `StudentBalance` en en-tête
  - Boutons "Réserver" conditionnels (solde > 0)
  - Intégration de `BookCourseModal`

#### `StudentBalance.tsx` (Nouveau)
- **Props**:
```typescript
interface StudentBalanceProps {
  balance: StudentBalance;
  className?: string;
}
```
- **Responsabilités**:
  - Affichage en gros du solde
  - Code couleur (vert/orange/rouge)
  - Accessibilité (`aria-live`)

#### `BookCourseModal.tsx` (Nouveau)
- **Props**:
```typescript
interface BookCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseSession: CourseSession;
  hoursRequired: number;
  currentBalance: number;
  onConfirm: () => Promise<void>;
}
```
- **Responsabilités**:
  - Affichage "Solde actuel → Solde après"
  - Confirmation explicite
  - Gestion du loading pendant la transaction

---

### Page Instructor - `/instructor`

#### `index.tsx` - Page Modifiée
- **Modifications**:
  - Nouvelle section "Mes élèves assignés"
  - Emploi du temps avec noms des élèves

#### `AssignedStudents.tsx` (Nouveau)
- **Props**:
```typescript
interface AssignedStudentsProps {
  students: AdminCreditView[];
  totalHoursToTeach: number;
}
```
- **Responsabilités**:
  - Liste des élèves avec soldes
  - Total des heures à dispenser

#### `ScheduleWithStudents.tsx` (Nouveau)
- **Props**:
```typescript
interface ScheduleWithStudentsProps {
  timeSlots: TimeSlot[];
  reservations: Reservation[];
  students: User[];
}
```
- **Responsabilités**:
  - Affichage des créneaux avec noms
  - Indicateurs de remplissage

---

## 🔧 Loaders React Router

### `src/pages/Admin/Credits/loader.ts`

```typescript
import { db } from '../../../db/db';
import type { AdminCreditsLoaderData } from '../../../types';

export async function creditsLoader(): Promise<AdminCreditsLoaderData> {
  const [students, credits, instructors] = await Promise.all([
    db.users.where('role').equals('student').toArray(),
    db.courseCredits.toArray(),
    db.users.where('role').equals('instructor').toArray(),
  ]);

  return { students, credits, instructors };
}
```

### `src/pages/Student/loader.ts`

```typescript
import { db } from '../../../db/db';
import type { CourseCredit, Reservation } from '../../../types';

export interface StudentLoaderData {
  credits: CourseCredit[];
  reservations: Reservation[];
}

export async function studentLoader(): Promise<StudentLoaderData> {
  const currentUserId = sessionStorage.getItem('currentUserId');
  if (!currentUserId) {
    throw new Error('Not authenticated');
  }

  const userId = parseInt(currentUserId, 10);

  const [credits, reservations] = await Promise.all([
    db.courseCredits.where('studentId').equals(userId).toArray(),
    db.reservations.where('studentId').equals(userId).toArray(),
  ]);

  return { credits, reservations };
}
```

### `src/pages/Instructor/loader.ts`

```typescript
import { db } from '../../../db/db';
import type { CourseCredit, TimeSlot, User } from '../../../types';

export interface InstructorLoaderData {
  credits: CourseCredit[];
  timeSlots: TimeSlot[];
  students: User[];
}

export async function instructorLoader(): Promise<InstructorLoaderData> {
  const currentUserId = sessionStorage.getItem('currentUserId');
  if (!currentUserId) {
    throw new Error('Not authenticated');
  }

  const instructorId = parseInt(currentUserId, 10);

  const [credits, timeSlots, students] = await Promise.all([
    db.courseCredits.toArray(), // Tous les crédits (filtrage en mémoire)
    db.timeSlots.where('instructorId').equals(instructorId).toArray(),
    db.users.where('role').equals('student').toArray(),
  ]);

  return { credits, timeSlots, students };
}
```

---

## 🎨 Tailwind CSS - Classes Standardisées

### Balance Display (Student)

```typescript
// Solde positif (> 0)
<div className="bg-green-50 border border-green-200 rounded-lg p-4">
  <span className="text-2xl font-bold text-green-700">{hours}h</span>
  <span className="text-sm text-green-600 ml-2">disponibles</span>
</div>

// Solde faible (1-2h)
<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
  <span className="text-2xl font-bold text-yellow-700">{hours}h</span>
  <span className="text-sm text-yellow-600 ml-2">disponibles</span>
</div>

// Solde nul (= 0)
<div className="bg-red-50 border border-red-200 rounded-lg p-4">
  <span className="text-2xl font-bold text-red-700">0h</span>
  <span className="text-sm text-red-600 ml-2">Solde épuisé</span>
</div>
```

### Credits Table (Admin)

```typescript
<table className="min-w-full divide-y divide-gray-200">
  <thead className="bg-gray-50">
    <tr>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        Élève
      </th>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        Solde
      </th>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        Actions
      </th>
    </tr>
  </thead>
  <tbody className="bg-white divide-y divide-gray-200">
    {/* Rows */}
  </tbody>
</table>
```

### Modal (Standard)

```typescript
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  className="fixed inset-0 z-50 overflow-y-auto"
>
  <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
    {/* Backdrop */}
    <div
      className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
      aria-hidden="true"
      onClick={onClose}
    />

    {/* Modal Panel */}
    <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
      {/* Content */}
    </div>
  </div>
</div>
```

---

## ♿ Accessibilité

### Requirements

| Élément | Requirement |
|---------|-------------|
| Modal | `aria-modal="true"`, `aria-labelledby`, focus trap, fermeture Escape |
| Tableau | `role="table"`, `aria-sort` pour les colonnes triables |
| Boutons | `aria-label` pour les actions sans texte visible |
| Solde | `aria-live="polite"` pour les mises à jour dynamiques |
| Loading | `aria-busy="true"`, `aria-live="polite"` |

### Focus Trap Implementation

```typescript
// Dans les modals
useEffect(() => {
  if (isOpen) {
    const focusableElements = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements?.[0];
    const lastElement = focusableElements?.[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => document.removeEventListener('keydown', handleTabKey);
  }
}, [isOpen, onClose]);
```

---

## 📝 Plan d'Implémentation

### Phase 1: Admin Credits (Priorité Haute)

1. **Créer `loader.ts`** - Charger élèves + crédits + moniteurs
2. **Créer `CreditsErrorBoundary.tsx`** - Gérer erreurs Dexie
3. **Créer `CreditsTable.tsx`** - Tableau avec soldes
4. **Créer `AddCreditsModal.tsx`** - Formulaire d'ajout
5. **Créer `CreditHistory.tsx`** - Historique expandable
6. **Créer `index.tsx`** - Assembler la page
7. **Modifier `router.tsx`** - Ajouter la route

### Phase 2: Student Reservation (Priorité Haute)

1. **Créer `StudentBalance.tsx`** - Affichage du solde
2. **Créer `BookCourseModal.tsx`** - Modal de confirmation
3. **Créer `StudentErrorBoundary.tsx`** - Gérer erreurs
4. **Modifier `index.tsx`** - Intégrer les nouveaux composants
5. **Créer `loader.ts`** - Charger crédits + réservations

### Phase 3: Instructor View (Priorité Moyenne)

1. **Créer `AssignedStudents.tsx`** - Liste des élèves
2. **Créer `ScheduleWithStudents.tsx`** - Emploi du temps
3. **Créer `InstructorErrorBoundary.tsx`** - Gérer erreurs
4. **Modifier `index.tsx`** - Intégrer les nouvelles sections
5. **Créer `loader.ts`** - Charger données nécessaires

---

## ✅ Checklist de Validation

### TypeScript Strict

- [ ] Zéro `any` dans le code
- [ ] Zéro `as Type` sans type guard
- [ ] Toutes les interfaces définies
- [ ] Types génériques utilisés correctement

### React Router Data API

- [ ] Loaders implémentés pour toutes les pages
- [ ] `useLoaderData()` utilisé (pas de `useEffect` pour chargement initial)
- [ ] `errorElement` configuré sur chaque route

### Dexie.js

- [ ] Index composites utilisés (`[studentId+status]`)
- [ ] Transactions atomiques pour les mutations
- [ ] Gestion des erreurs `QuotaExceededError`, `VersionError`

### Tailwind CSS

- [ ] Zéro `style={}` inline
- [ ] Zéro fichier `.css` custom
- [ ] Classes utilitaires uniquement

### Accessibilité

- [ ] `aria-label` sur les boutons icones
- [ ] `aria-modal` sur les modals
- [ ] `aria-live` sur les mises à jour dynamiques
- [ ] Focus trap dans les modals
- [ ] Navigation clavier testée

---

## 🔗 Dépendances entre Fichiers

```
router.tsx
  ├── Admin/Credits/loader.ts
  ├── Admin/Credits/index.tsx
  │   ├── CreditsTable.tsx
  │   ├── AddCreditsModal.tsx
  │   └── CreditHistory.tsx
  ├── Student/loader.ts
  ├── Student/index.tsx
  │   ├── StudentBalance.tsx
  │   └── BookCourseModal.tsx
  └── Instructor/loader.ts
      └── Instructor/index.tsx
          ├── AssignedStudents.tsx
          └── ScheduleWithStudents.tsx
```

---

## 📌 Notes Importantes

1. **Pas de localStorage**: Toutes les données passent par Dexie.js
2. **Loaders avant rendu**: Pas de flash de contenu non chargé
3. **Transactions atomiques**: `createReservationWithCredit` garantit la cohérence
4. **Error Boundaries imbriquées**: Root + Feature level pour isolation
5. **Hooks existants réutilisés**: `useCourseCredits`, `useStudentBalance`
