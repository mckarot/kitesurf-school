# 🔥 DATABASE - Requêtes Dexie pour Export Données Utilisateur

## 1. Schéma Dexie Mis à Jour

### Fichier: `src/db/db.ts`

```typescript
// src/db/db.ts

import Dexie from 'dexie';
import type { Table } from 'dexie';
import type { 
  User, 
  Course, 
  Reservation, 
  CourseSession, 
  TimeSlot,
  UserPhysicalData,
  UserHealthData,
  UserProgression,
  UserTransaction
} from '../types';

export class KiteSurfDB extends Dexie {
  users!: Table<User, number>;
  courses!: Table<Course, number>;
  reservations!: Table<Reservation, number>;
  courseSessions!: Table<CourseSession, number>;
  timeSlots!: Table<TimeSlot, number>;
  userPhysicalData!: Table<UserPhysicalData, number>;
  userHealthData!: Table<UserHealthData, number>;
  userProgression!: Table<UserProgression, number>;
  transactions!: Table<UserTransaction, number>;

  constructor() {
    super('KiteSurfSchoolDB');

    // Version 1: Initial schema
    this.version(1).stores({
      users: '++id, email, role, isActive, createdAt',
      courses: '++id, instructorId, level, isActive, createdAt',
      reservations: '++id, studentId, courseId, status, createdAt',
      courseSessions: '++id, courseId, isActive, createdAt',
    });

    // Version 2: Add timeSlots table for instructor availability
    this.version(2).stores({
      users: '++id, email, role, isActive, createdAt',
      courses: '++id, instructorId, level, isActive, createdAt',
      reservations: '++id, studentId, courseId, status, createdAt',
      courseSessions: '++id, courseId, isActive, createdAt',
      timeSlots: '++id, instructorId, date, isAvailable, createdAt',
    });

    // Version 3: Add user extended data tables for profile export
    this.version(3).stores({
      users: '++id, email, role, isActive, createdAt',
      courses: '++id, instructorId, level, isActive, createdAt',
      reservations: '++id, studentId, courseId, status, createdAt',
      courseSessions: '++id, courseId, isActive, createdAt',
      timeSlots: '++id, instructorId, date, isAvailable, createdAt',
      userPhysicalData: '++id, userId',
      userHealthData: '++id, userId',
      userProgression: '++id, userId',
      transactions: '++id, userId, reservationId, status, createdAt',
    });
  }
}

export const db = new KiteSurfDB();
```

## 2. Types à Ajouter dans `src/types/index.ts`

```typescript
// ============================================
// TYPES POUR DONNÉES ÉTENDUES UTILISATEUR
// ============================================

export interface UserPhysicalData {
  id: number;
  userId: number;
  weight?: number;        // kg
  height?: number;        // cm
  createdAt: number;
  updatedAt: number;
}

export interface UserHealthData {
  id: number;
  userId: number;
  medicalConditions?: string;
  allergies?: string;
  swimmingLevel?: 'non-swimmer' | 'beginner' | 'intermediate' | 'advanced';
  medicalCertificateValidUntil?: string; // ISO date
  createdAt: number;
  updatedAt: number;
}

export interface UserProgression {
  id: number;
  userId: number;
  currentIkoLevel?: 'discovery' | 'beginner' | 'intermediate' | 'advanced' | 'autonomous';
  validatedSkills: string[];
  createdAt: number;
  updatedAt: number;
}

export interface UserTransaction {
  id: number;
  userId: number;
  reservationId: number;
  amount: number;
  currency: string;
  type: 'payment' | 'refund' | 'wallet_credit';
  status: 'pending' | 'completed' | 'failed';
  createdAt: number;
}

export type CreateUserPhysicalDataInput = Omit<UserPhysicalData, 'id' | 'createdAt' | 'updatedAt'>;
export type CreateUserHealthDataInput = Omit<UserHealthData, 'id' 'createdAt' | 'updatedAt'>;
export type CreateUserProgressionInput = Omit<UserProgression, 'id' | 'createdAt' | 'updatedAt'>;
export type CreateUserTransactionInput = Omit<UserTransaction, 'id' | 'createdAt'>;
```

## 3. Requêtes Dexie Optimisées

### Fichier: `src/pages/ProfileData/loader.ts`

```typescript
// src/pages/ProfileData/loader.ts

import { db } from '../../db/db';
import type { 
  User, 
  UserPhysicalData, 
  UserHealthData, 
  UserProgression,
  UserReservationExport,
  UserTransactionExport 
} from '../../types';

export interface ProfileDataLoaderReturn {
  user: User;
  physicalData?: UserPhysicalData;
  healthData?: UserHealthData;
  progression?: UserProgression;
  reservations: UserReservationExport[];
  transactions: UserTransactionExport[];
}

/**
 * Récupère TOUTES les données d'un utilisateur pour l'export
 * Optimisé avec des requêtes parallèles
 */
export async function profileDataLoader(userId: number): Promise<ProfileDataLoaderReturn> {
  // Récupération parallèle de toutes les données
  const [
    user,
    physicalData,
    healthData,
    progression,
    reservations,
    transactions
  ] = await Promise.all([
    // 1. User data
    db.users.get(userId),
    
    // 2. Physical data (index: userId)
    db.userPhysicalData.where('userId').equals(userId).first(),
    
    // 3. Health data (index: userId)
    db.userHealthData.where('userId').equals(userId).first(),
    
    // 4. Progression (index: userId)
    db.userProgression.where('userId').equals(userId).first(),
    
    // 5. Reservations with course details (index: studentId)
    (async () => {
      const userReservations = await db.reservations
        .where('studentId')
        .equals(userId)
        .toArray();
      
      // Enrichir avec les détails des cours
      const enrichedReservations: UserReservationExport[] = await Promise.all(
        userReservations.map(async (reservation) => {
          const course = await db.courses.get(reservation.courseId);
          const session = await db.courseSessions
            .where('courseId')
            .equals(reservation.courseId)
            .first();
          
          return {
            id: reservation.id,
            courseId: reservation.courseId,
            courseTitle: course?.title || 'Cours inconnu',
            date: session?.date || '',
            startTime: session?.startTime || '',
            endTime: session?.endTime || '',
            location: session?.location || '',
            status: reservation.status,
            createdAt: reservation.createdAt,
          };
        })
      );
      
      return enrichedReservations;
    })(),
    
    // 6. Transactions (index: userId)
    (async () => {
      const userTransactions = await db.transactions
        .where('userId')
        .equals(userId)
        .toArray();
      
      return userTransactions.map((t) => ({
        id: t.id,
        reservationId: t.reservationId,
        amount: t.amount,
        currency: t.currency,
        type: t.type,
        status: t.status,
        createdAt: t.createdAt,
      }));
    })(),
  ]);

  if (!user) {
    throw new Error(`Utilisateur non trouvé: ${userId}`);
  }

  return {
    user,
    physicalData,
    healthData,
    progression,
    reservations,
    transactions,
  };
}

/**
 * Récupère l'ID de l'utilisateur connecté depuis le localStorage
 * (Même méthode que useAuth pour la cohérence)
 */
export function getCurrentUserId(): number {
  const AUTH_STORAGE_KEY = 'kitesurf_auth_userId';
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!stored) {
    throw new Error('Utilisateur non connecté');
  }
  const parsed = Number(stored);
  if (Number.isNaN(parsed)) {
    throw new Error('ID utilisateur invalide');
  }
  return parsed;
}
```

## 4. Index Requis

| Table | Index | Usage |
|-------|-------|-------|
| `userPhysicalData` | `userId` | Recherche par user |
| `userHealthData` | `userId` | Recherche par user |
| `userProgression` | `userId` | Recherche par user |
| `transactions` | `userId` | Recherche par user |
| `transactions` | `reservationId` | Jointure avec reservations |
| `reservations` | `studentId` | Recherche par user |

## 5. Gestion des Erreurs Dexie

```typescript
// Dans le loader, intercepter les erreurs spécifiques
try {
  const data = await profileDataLoader(userId);
  return data;
} catch (error) {
  if (error instanceof Error) {
    if (error.name === 'DatabaseClosedError') {
      console.error('Base de données fermée');
      throw new Error('La base de données n\'est pas accessible');
    }
    if (error.name === 'QuotaExceededError') {
      console.error('Stockage IndexedDB plein');
      throw new Error('Stockage insuffisant');
    }
  }
  throw error;
}
```

## 6. Migration de Données (Optionnel)

Si des données existent déjà dans localStorage ou d'autres tables, créer un fichier de migration :

```typescript
// src/db/migrations/v3-migrate-user-data.ts
import { db } from '../db';

export async function migrateUserDataV3(): Promise<void> {
  // Migration optionnelle si nécessaire
  // Ex: copier des données depuis localStorage vers IndexedDB
}
```

---

**FIN DU DOCUMENT DATABASE** - Transmettre au Developer Agent.
