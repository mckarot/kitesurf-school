# 🏗️ ARCHITECTURE - Page "Mes Données Personnelles"

## 1. Structure de Dossiers

```
src/
├── pages/
│   └── ProfileData/
│       ├── index.tsx              # Page principale avec useLoaderData
│       ├── loader.ts              # Loader React Router + fonction getUserAllData
│       └── components/
│           ├── DataSection.tsx    # Composant générique pour chaque section
│           ├── IdentitySection.tsx
│           ├── PhysicalDataSection.tsx
│           ├── HealthDataSection.tsx
│           ├── ProgressionSection.tsx
│           ├── ReservationsSection.tsx
│           └── TransactionsSection.tsx
├── hooks/
│   └── useUserDataExport.ts       # Hook pour l'export JSON
├── utils/
│   └── exportUserData.ts          # Fonction pure d'export JSON
└── router.tsx                     # À modifier (nouvelle route)
```

## 2. Interfaces TypeScript à Ajouter

### Fichier: `src/types/index.ts`

```typescript
// ============================================
// TYPES POUR EXPORT DONNÉES UTILISATEUR (RGPD)
// ============================================

export interface UserPhysicalData {
  weight?: number;        // kg
  height?: number;        // cm
}

export interface UserHealthData {
  medicalConditions?: string;
  allergies?: string;
  swimmingLevel?: 'non-swimmer' | 'beginner' | 'intermediate' | 'advanced';
  medicalCertificateValidUntil?: string; // ISO date
}

export interface UserProgression {
  currentIkoLevel?: 'discovery' | 'beginner' | 'intermediate' | 'advanced' | 'autonomous';
  validatedSkills: string[];
  sessionHistory: UserSessionHistoryItem[];
}

export interface UserSessionHistoryItem {
  id: number;
  date: string;
  location: string;
  instructorName: string;
  courseTitle: string;
  level: string;
}

export interface UserReservationExport {
  id: number;
  courseId: number;
  courseTitle: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: number;
}

export interface UserTransactionExport {
  id: number;
  reservationId: number;
  amount: number;
  currency: string;
  type: 'payment' | 'refund' | 'wallet_credit';
  status: 'pending' | 'completed' | 'failed';
  createdAt: number;
}

export interface UserProfileExport {
  exportedAt: string;           // ISO date
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    createdAt: number;
  };
  physicalData?: UserPhysicalData;
  healthData?: UserHealthData;
  progression?: UserProgression;
  reservations: UserReservationExport[];
  transactions: UserTransactionExport[];
}
```

## 3. Schéma Dexie.js - Modifications Requises

### Fichier: `src/db/db.ts`

**Version 3** - Ajout des tables pour données utilisateur étendues :

```typescript
// Version 3: Add user extended data tables
this.version(3).stores({
  users: '++id, email, role, isActive, createdAt',
  courses: '++id, instructorId, level, isActive, createdAt',
  reservations: '++id, studentId, courseId, status, createdAt',
  courseSessions: '++id, courseId, isActive, createdAt',
  timeSlots: '++id, instructorId, date, isAvailable, createdAt',
  // NEW tables for user data
  userPhysicalData: '++id, userId',
  userHealthData: '++id, userId',
  userProgression: '++id, userId',
  transactions: '++id, userId, reservationId, status, createdAt',
});
```

**NOTE:** Pour cette feature, nous allons assumer que les tables existent déjà ou seront créées via migration. Si les tables n'existent pas, les données seront simplement vides dans l'export.

## 4. Plan de Routing

### Fichier: `src/router.tsx`

```typescript
{
  path: '/profil',
  element: <ProfileLayout />,  // Optionnel: layout commun pour toutes les pages profil
  errorElement: <DbErrorBoundary><div /></DbErrorBoundary>,
  children: [
    {
      path: 'mes-donnees',
      loader: async () => {
        const userId = getCurrentUserId();
        return profileDataLoader(userId);
      },
      element: <ProfileDataPage />,
    },
  ],
}
```

## 5. Error Boundaries

| Niveau | Boundary | Erreurs Interceptées |
|--------|----------|---------------------|
| Root | `DbErrorBoundary` (existant) | QuotaExceededError, InvalidStateError, VersionError |
| Feature | `ProfileDataErrorBoundary` (nouveau) | DatabaseClosedError, NotFoundError (user) |

## 6. Plan de Composants

### `ProfileDataPage` (page principale)
- **Props:** Aucune (utilise useLoaderData)
- **Responsabilités:**
  - Afficher toutes les sections de données
  - Gérer le bouton d'export JSON
  - Afficher l'état de chargement

### `DataSection` (composant générique)
- **Props:**
  ```typescript
  interface DataSectionProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    className?: string;
  }
  ```
- **Responsabilités:** Wrapper visuel pour chaque section

### `IdentitySection`
- **Props:** `{ user: User }`
- **Responsabilités:** Afficher nom, prénom, email, date inscription

### `PhysicalDataSection`
- **Props:** `{ data?: UserPhysicalData }`
- **Responsabilités:** Afficher poids, taille

### `HealthDataSection`
- **Props:** `{ data?: UserHealthData }`
- **Responsabilités:** Afficher conditions médicales, allergies, niveau natation

### `ProgressionSection`
- **Props:** `{ progression?: UserProgression }`
- **Responsabilités:** Afficher niveau IKO, compétences, historique sessions

### `ReservationsSection`
- **Props:** `{ reservations: UserReservationExport[] }`
- **Responsabilités:** Tableau des réservations

### `TransactionsSection`
- **Props:** `{ transactions: UserTransactionExport[] }`
- **Responsabilités:** Tableau des transactions

## 7. Hooks à Créer

### `useUserDataExport`
```typescript
// src/hooks/useUserDataExport.ts
interface UseUserDataExportReturn {
  isExporting: boolean;
  exportError: Error | null;
  triggerExport: (data: UserProfileExport) => Promise<void>;
}

export function useUserDataExport(): UseUserDataExportReturn;
```

## 8. Utilitaires à Créer

### `exportUserData`
```typescript
// src/utils/exportUserData.ts
export function generateUserDataFilename(): string;
export function downloadJsonFile(data: UserProfileExport, filename: string): void;
export function formatExportData(userData: ProfileDataLoaderReturn): UserProfileExport;
```

## 9. Loader React Router

### `profileDataLoader`
```typescript
// src/pages/ProfileData/loader.ts
interface ProfileDataLoaderReturn {
  user: User;
  physicalData?: UserPhysicalData;
  healthData?: UserHealthData;
  progression?: UserProgression;
  reservations: UserReservationExport[];
  transactions: UserTransactionExport[];
}

export async function profileDataLoader(userId: number): Promise<ProfileDataLoaderReturn>;
export function getCurrentUserId(): number;
```

---

## ✅ CHECKLIST POUR LE DEVELOPPER

- [ ] Créer `src/pages/ProfileData/index.tsx`
- [ ] Créer `src/pages/ProfileData/loader.ts`
- [ ] Créer `src/pages/ProfileData/components/DataSection.tsx`
- [ ] Créer `src/pages/ProfileData/components/IdentitySection.tsx`
- [ ] Créer `src/pages/ProfileData/components/PhysicalDataSection.tsx`
- [ ] Créer `src/pages/ProfileData/components/HealthDataSection.tsx`
- [ ] Créer `src/pages/ProfileData/components/ProgressionSection.tsx`
- [ ] Créer `src/pages/ProfileData/components/ReservationsSection.tsx`
- [ ] Créer `src/pages/ProfileData/components/TransactionsSection.tsx`
- [ ] Créer `src/hooks/useUserDataExport.ts`
- [ ] Créer `src/utils/exportUserData.ts`
- [ ] Modifier `src/types/index.ts` (ajouter interfaces)
- [ ] Modifier `src/router.tsx` (ajouter route)
- [ ] Modifier `src/db/db.ts` (version 3 si tables nouvelles)

---

## 🎨 DESIGN SYSTEM (Tailwind)

- **Couleurs:** Utiliser `blue-600` pour actions principales, `gray-*` pour texte
- **Espacement:** `p-4`, `p-6` pour les sections, `gap-4` entre éléments
- **Typography:** `text-lg font-semibold` pour titres, `text-sm text-gray-600` pour labels
- **Accessibilité:** `aria-label`, `role="region"`, focus visible

---

**FIN DU DOCUMENT ARCHITECTE** - Transmettre au Database Agent puis Developer Agent.
