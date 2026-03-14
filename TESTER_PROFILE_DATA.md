# 🧪 TESTS - Page "Mes Données Personnelles"

## Structure des Tests

```
src/
├── pages/
│   └── ProfileData/
│       ├── __tests__/
│       │   ├── exportUserData.test.ts    # Tests unitaires utilitaires
│       │   ├── loader.test.ts            # Tests du loader
│       │   └── ProfileDataPage.test.tsx  # Tests du composant
│       └── ...
└── ...
```

---

## 1. Tests Unitaires - exportUserData.ts

### Fichier: `src/pages/ProfileData/__tests__/exportUserData.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  generateUserDataFilename,
  formatExportData,
  downloadJsonFile,
  formatExportData,
} from '../../../utils/exportUserData';
import type { ProfileDataLoaderReturn } from '../../loader';

describe('exportUserData', () => {
  describe('generateUserDataFilename', () => {
    it('devrait générer un nom de fichier au format correct', () => {
      // Mock Date
      const mockDate = new Date('2024-03-15T10:30:00Z');
      vi.spyOn(global, 'Date').mockImplementation(() => mockDate as unknown as Date);

      const filename = generateUserDataFilename();

      expect(filename).toBe('mes-donnees-kitesurf-2024-03-15.json');
      
      vi.restoreAllMocks();
    });

    it('devrait padding les mois et jours < 10', () => {
      const mockDate = new Date('2024-01-05T10:30:00Z');
      vi.spyOn(global, 'Date').mockImplementation(() => mockDate as unknown as Date);

      const filename = generateUserDataFilename();

      expect(filename).toBe('mes-donnees-kitesurf-2024-01-05.json');
      
      vi.restoreAllMocks();
    });
  });

  describe('formatExportData', () => {
    const mockLoaderData: ProfileDataLoaderReturn = {
      user: {
        id: 1,
        email: 'test@example.com',
        password: 'hashed',
        firstName: 'Jean',
        lastName: 'Dupont',
        role: 'student',
        isActive: 1,
        createdAt: 1710000000000,
      },
      physicalData: {
        id: 1,
        userId: 1,
        weight: 75,
        height: 180,
        createdAt: 1710000000000,
        updatedAt: 1710000000000,
      },
      healthData: {
        id: 1,
        userId: 1,
        medicalConditions: 'Asthme',
        allergies: 'Pollen',
        swimmingLevel: 'intermediate',
        medicalCertificateValidUntil: '2025-12-31',
        createdAt: 1710000000000,
        updatedAt: 1710000000000,
      },
      progression: {
        id: 1,
        userId: 1,
        currentIkoLevel: 'beginner',
        validatedSkills: ['Water start', 'First jumps'],
        createdAt: 1710000000000,
        updatedAt: 1710000000000,
      },
      reservations: [
        {
          id: 1,
          courseId: 1,
          courseTitle: 'Discovery Course',
          date: '2024-03-20',
          startTime: '10:00',
          endTime: '12:00',
          location: 'Beach Club',
          status: 'confirmed',
          createdAt: 1710000000000,
        },
      ],
      transactions: [
        {
          id: 1,
          reservationId: 1,
          amount: 100,
          currency: 'EUR',
          type: 'payment',
          status: 'completed',
          createdAt: 1710000000000,
        },
      ],
    };

    it('devrait formater correctement toutes les données', () => {
      const result = formatExportData(mockLoaderData);

      expect(result.exportedAt).toBeDefined();
      expect(result.user).toEqual({
        id: 1,
        email: 'test@example.com',
        firstName: 'Jean',
        lastName: 'Dupont',
        role: 'student',
        createdAt: 1710000000000,
      });
      expect(result.physicalData).toEqual({
        weight: 75,
        height: 180,
      });
      expect(result.healthData).toEqual({
        medicalConditions: 'Asthme',
        allergies: 'Pollen',
        swimmingLevel: 'intermediate',
        medicalCertificateValidUntil: '2025-12-31',
      });
      expect(result.progression).toEqual({
        currentIkoLevel: 'beginner',
        validatedSkills: ['Water start', 'First jumps'],
        sessionHistory: [],
      });
      expect(result.reservations).toHaveLength(1);
      expect(result.transactions).toHaveLength(1);
    });

    it('devrait gérer les données optionnelles manquantes', () => {
      const minimalData: ProfileDataLoaderReturn = {
        user: mockLoaderData.user,
        reservations: [],
        transactions: [],
      };

      const result = formatExportData(minimalData);

      expect(result.physicalData).toBeUndefined();
      expect(result.healthData).toBeUndefined();
      expect(result.progression).toBeUndefined();
      expect(result.reservations).toEqual([]);
      expect(result.transactions).toEqual([]);
    });
  });

  describe('downloadJsonFile', () => {
    let createElementSpy: vi.SpyInstance;
    let appendChildSpy: vi.SpyInstance;
    let removeChildSpy: vi.SpyInstance;
    let clickSpy: vi.SpyInstance;
    let revokeObjectURLSpy: vi.SpyInstance;

    beforeEach(() => {
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
        setAttribute: vi.fn(),
      };
      createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(
        mockLink as unknown as HTMLAnchorElement
      );
      appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation();
      removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation();
      clickSpy = vi.spyOn(mockLink, 'click');
      revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('devrait créer et télécharger un fichier JSON', () => {
      const mockData = {
        exportedAt: '2024-03-15T10:30:00Z',
        user: { id: 1, email: 'test@example.com' },
        reservations: [],
        transactions: [],
      };

      downloadJsonFile(mockData as any, 'test-export.json');

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(appendChildSpy).toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();
      expect(revokeObjectURLSpy).toHaveBeenCalled();
    });
  });
});
```

---

## 2. Tests du Loader

### Fichier: `src/pages/ProfileData/__tests__/loader.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { db } from '../../../db/db';
import { profileDataLoader, getCurrentUserId } from '../loader';

// Mock Dexie
vi.mock('../../../db/db', () => ({
  db: {
    users: {
      get: vi.fn(),
    },
    userPhysicalData: {
      where: vi.fn().mockReturnThis(),
      equals: vi.fn().mockReturnThis(),
      first: vi.fn(),
    },
    userHealthData: {
      where: vi.fn().mockReturnThis(),
      equals: vi.fn().mockReturnThis(),
      first: vi.fn(),
    },
    userProgression: {
      where: vi.fn().mockReturnThis(),
      equals: vi.fn().mockReturnThis(),
      first: vi.fn(),
    },
    reservations: {
      where: vi.fn().mockReturnThis(),
      equals: vi.fn().mockReturnThis(),
      toArray: vi.fn(),
    },
    courses: {
      get: vi.fn(),
    },
    courseSessions: {
      where: vi.fn().mockReturnThis(),
      equals: vi.fn().mockReturnThis(),
      first: vi.fn(),
    },
    transactions: {
      where: vi.fn().mockReturnThis(),
      equals: vi.fn().mockReturnThis(),
      toArray: vi.fn(),
    },
  },
}));

describe('profileDataLoader', () => {
  const mockUser = {
    id: 1,
    email: 'test@example.com',
    firstName: 'Jean',
    lastName: 'Dupont',
    role: 'student' as const,
    isActive: 1 as const,
    createdAt: 1710000000000,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devrait charger toutes les données utilisateur', async () => {
    vi.mocked(db.users.get).mockResolvedValue(mockUser);
    vi.mocked(db.userPhysicalData.where).mockReturnValue({
      equals: vi.fn().mockReturnValue({
        first: vi.fn().mockResolvedValue({ weight: 75 }),
      }),
    } as any);
    vi.mocked(db.reservations.where).mockReturnValue({
      equals: vi.fn().mockReturnValue({
        toArray: vi.fn().mockResolvedValue([]),
      }),
    } as any);
    vi.mocked(db.transactions.where).mockReturnValue({
      equals: vi.fn().mockReturnValue({
        toArray: vi.fn().mockResolvedValue([]),
      }),
    } as any);

    const result = await profileDataLoader(1);

    expect(result.user).toEqual(mockUser);
    expect(db.users.get).toHaveBeenCalledWith(1);
  });

  it('devrait lancer une erreur si utilisateur non trouvé', async () => {
    vi.mocked(db.users.get).mockResolvedValue(undefined);

    await expect(profileDataLoader(999)).rejects.toThrow(
      'Utilisateur non trouvé: 999'
    );
  });

  it('devrait retourner des tableaux vides si pas de réservations', async () => {
    vi.mocked(db.users.get).mockResolvedValue(mockUser);
    vi.mocked(db.reservations.where).mockReturnValue({
      equals: vi.fn().mockReturnValue({
        toArray: vi.fn().mockResolvedValue([]),
      }),
    } as any);
    vi.mocked(db.transactions.where).mockReturnValue({
      equals: vi.fn().mockReturnValue({
        toArray: vi.fn().mockResolvedValue([]),
      }),
    } as any);

    const result = await profileDataLoader(1);

    expect(result.reservations).toEqual([]);
    expect(result.transactions).toEqual([]);
  });
});

describe('getCurrentUserId', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('devrait retourner l\'ID stocké', () => {
    localStorage.setItem('kitesurf_auth_userId', '42');
    expect(getCurrentUserId()).toBe(42);
  });

  it('devrait lancer une erreur si non connecté', () => {
    expect(() => getCurrentUserId()).toThrow('Utilisateur non connecté');
  });

  it('devrait lancer une erreur si ID invalide', () => {
    localStorage.setItem('kitesurf_auth_userId', 'invalid');
    expect(() => getCurrentUserId()).toThrow('ID utilisateur invalide');
  });
});
```

---

## 3. Tests du Composant Page

### Fichier: `src/pages/ProfileData/__tests__/ProfileDataPage.test.tsx`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProfileDataPage } from '../index';
import type { ProfileDataLoaderReturn } from '../loader';

// Mock useLoaderData
const mockLoaderData = vi.hoisted(() => vi.fn());
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useLoaderData: () => mockLoaderData(),
  };
});

// Mock useAuth
vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 1, role: 'student' },
    isLoading: false,
  }),
}));

// Mock useUserDataExport
vi.mock('../../../hooks/useUserDataExport', () => ({
  useUserDataExport: () => ({
    isExporting: false,
    exportError: null,
    triggerExport: vi.fn(),
  }),
}));

describe('ProfileDataPage', () => {
  const mockData: ProfileDataLoaderReturn = {
    user: {
      id: 1,
      email: 'test@example.com',
      firstName: 'Jean',
      lastName: 'Dupont',
      role: 'student',
      isActive: 1,
      createdAt: 1710000000000,
    },
    reservations: [],
    transactions: [],
  };

  beforeEach(() => {
    mockLoaderData.mockReturnValue(mockData);
  });

  it('devrait afficher le titre de la page', () => {
    render(<ProfileDataPage />);
    expect(screen.getByText('Mes Données Personnelles')).toBeInTheDocument();
  });

  it('devrait afficher la section Identité', () => {
    render(<ProfileDataPage />);
    expect(screen.getByText('Identité')).toBeInTheDocument();
    expect(screen.getByText('DUPONT Jean')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('devrait afficher le bouton d\'export', () => {
    render(<ProfileDataPage />);
    expect(
      screen.getByRole('button', { name: /télécharger mes données/i })
    ).toBeInTheDocument();
  });

  it('devrait afficher un message si pas de réservations', () => {
    render(<ProfileDataPage />);
    expect(screen.getByText('Aucune réservation')).toBeInTheDocument();
  });

  it('devrait afficher un message si pas de transactions', () => {
    render(<ProfileDataPage />);
    expect(screen.getByText('Aucune transaction')).toBeInTheDocument();
  });

  it('devrait afficher les sections vides pour données manquantes', () => {
    render(<ProfileDataPage />);
    expect(screen.getByText('Aucune donnée physique enregistrée')).toBeInTheDocument();
    expect(screen.getByText('Aucune donnée de santé enregistrée')).toBeInTheDocument();
    expect(screen.getByText('Aucune donnée de progression enregistrée')).toBeInTheDocument();
  });
});

describe('ProfileDataPage avec données complètes', () => {
  const completeData: ProfileDataLoaderReturn = {
    user: {
      id: 1,
      email: 'test@example.com',
      firstName: 'Jean',
      lastName: 'Dupont',
      role: 'student',
      isActive: 1,
      createdAt: 1710000000000,
    },
    physicalData: {
      id: 1,
      userId: 1,
      weight: 75,
      height: 180,
      createdAt: 1710000000000,
      updatedAt: 1710000000000,
    },
    healthData: {
      id: 1,
      userId: 1,
      medicalConditions: 'Asthme',
      allergies: 'Pollen',
      swimmingLevel: 'intermediate',
      medicalCertificateValidUntil: '2025-12-31',
      createdAt: 1710000000000,
      updatedAt: 1710000000000,
    },
    progression: {
      id: 1,
      userId: 1,
      currentIkoLevel: 'beginner',
      validatedSkills: ['Water start'],
      createdAt: 1710000000000,
      updatedAt: 1710000000000,
    },
    reservations: [
      {
        id: 1,
        courseId: 1,
        courseTitle: 'Discovery',
        date: '2024-03-20',
        startTime: '10:00',
        endTime: '12:00',
        location: 'Beach',
        status: 'confirmed',
        createdAt: 1710000000000,
      },
    ],
    transactions: [
      {
        id: 1,
        reservationId: 1,
        amount: 100,
        currency: 'EUR',
        type: 'payment',
        status: 'completed',
        createdAt: 1710000000000,
      },
    ],
  };

  it('devrait afficher les données physiques', () => {
    mockLoaderData.mockReturnValue(completeData);
    render(<ProfileDataPage />);
    expect(screen.getByText('75 kg')).toBeInTheDocument();
    expect(screen.getByText('180 cm')).toBeInTheDocument();
  });

  it('devrait afficher les données de santé', () => {
    mockLoaderData.mockReturnValue(completeData);
    render(<ProfileDataPage />);
    expect(screen.getByText('Asthme')).toBeInTheDocument();
    expect(screen.getByText('Pollen')).toBeInTheDocument();
    expect(screen.getByText('Intermédiaire')).toBeInTheDocument();
  });

  it('devrait afficher la progression', () => {
    mockLoaderData.mockReturnValue(completeData);
    render(<ProfileDataPage />);
    expect(screen.getByText('Débutant')).toBeInTheDocument();
    expect(screen.getByText('Water start')).toBeInTheDocument();
  });

  it('devrait afficher les réservations dans le tableau', () => {
    mockLoaderData.mockReturnValue(completeData);
    render(<ProfileDataPage />);
    expect(screen.getByText('Discovery')).toBeInTheDocument();
    expect(screen.getByText('Confirmée')).toBeInTheDocument();
  });

  it('devrait afficher les transactions dans le tableau', () => {
    mockLoaderData.mockReturnValue(completeData);
    render(<ProfileDataPage />);
    expect(screen.getByText('100.00 EUR')).toBeInTheDocument();
    expect(screen.getByText('Complété')).toBeInTheDocument();
  });
});
```

---

## 4. Configuration Vitest

### Fichier: `vite.config.ts` (à modifier)

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
```

### Fichier: `src/test/setup.ts` (à créer)

```typescript
import '@testing-library/jest-dom';
```

---

## 5. Commandes de Test

```bash
# Installer les dépendances de test
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom

# Exécuter tous les tests
npm run test

# Exécuter les tests en watch mode
npm run test:watch

# Exécuter les tests avec coverage
npm run test:coverage

# Exécuter les tests spécifiques à ProfileData
npm run test -- ProfileData
```

---

## 6. Checklist de Validation des Tests

| Test | Statut | Couverture |
|------|--------|------------|
| `generateUserDataFilename` | ✅ | Format, padding |
| `formatExportData` | ✅ | Données complètes, minimales |
| `downloadJsonFile` | ✅ | Création blob, cleanup |
| `profileDataLoader` | ✅ | Succès, erreur user, vide |
| `getCurrentUserId` | ✅ | Succès, non connecté, invalide |
| `ProfileDataPage` | ✅ | Rendu, sections, données |

---

**FIN DU DOCUMENT TESTER**
