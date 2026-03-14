# 📊 SCHÉMAS DE BASE DE DONNÉES - KiteSurf School

**Version** : 8.0  
**Dernière mise à jour** : 14 mars 2026  
**Base de données** : `KiteSurfSchoolDB` (Dexie.js / IndexedDB)

---

## 🎯 VUE D'ENSEMBLE DES RÔLES

```
┌─────────────────────────────────────────────────────────────────┐
│                         UTILISATEURS                            │
├─────────────────────────────────────────────────────────────────┤
│  admin       │ Gestion complète de l'école                      │
│  instructor  │ Moniteur - Gère ses cours et disponibilités      │
│  student     │ Élève - Réserve des cours, suit sa progression   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 👤 1. SCHÉMA COMMUN : USER (TOUS RÔLES)

```typescript
interface User {
  id: number;              // Clé primaire auto-incrémentée
  email: string;           // Unique, utilisé pour l'authentification
  password: string;        // Haché (bcrypt)
  firstName: string;       // Prénom
  lastName: string;        // Nom
  role: 'admin' | 'instructor' | 'student';
  isActive: 0 | 1;         // 1 = actif, 0 = désactivé
  createdAt: number;       // Timestamp de création
  photo?: string;          // Base64 (optionnel, RGPD Article 16)
}
```

**Index** : `id`, `email`, `role`, `isActive`, `createdAt`

---

## 🏢 2. RÔLE : ADMIN

### **Permissions**
- ✅ Gérer tous les cours (créer, modifier, supprimer)
- ✅ Gérer tous les utilisateurs
- ✅ Gérer les crédits des élèves
- ✅ Voir toutes les réservations
- ✅ Accéder aux statistiques
- ✅ Supprimer les comptes (RGPD Article 17)

### **Tables utilisées**

| Table | Accès | Description |
|-------|-------|-------------|
| `users` | Lecture/Écriture | Gère tous les utilisateurs |
| `courses` | Lecture/Écriture | Crée et modifie les cours |
| `reservations` | Lecture/Écriture | Valide/annule les réservations |
| `courseCredits` | Lecture/Écriture | Ajoute des crédits aux élèves |
| `courseSessions` | Lecture/Écriture | Crée les sessions de cours |
| `deletionRequests` | Lecture/Écriture | Gère les demandes de suppression |
| `userConsents` | Lecture | Consulte les consentements RGPD |

### **Pages Admin**
- `/admin` - Gestion des cours et réservations
- `/admin/credits` - Gestion des crédits élèves
- `/admin/stats` - Statistiques

---

## 🎓 3. RÔLE : INSTRUCTOR (MONITEUR)

### **Permissions**
- ✅ Voir ses cours assignés
- ✅ Gérer ses disponibilités (TimeSlots)
- ✅ Voir ses élèves assignés
- ✅ Consulter son calendrier
- ❌ Ne peut PAS créer de cours (réservé aux admins)
- ❌ Ne peut PAS gérer les crédits

### **Tables utilisées**

| Table | Accès | Description |
|-------|-------|-------------|
| `users` | Lecture seule (son profil) | Consulte son profil |
| `courses` | Lecture | Voit ses cours (`instructorId`) |
| `timeSlots` | Lecture/Écriture | Gère ses disponibilités |
| `courseSessions` | Lecture | Voit ses sessions de cours |
| `reservations` | Lecture | Voit les réservations de ses cours |
| `userProgression` | Lecture | Suit la progression de ses élèves |

### **Relation avec les cours**
```typescript
interface Course {
  id: number;
  instructorId: number;    // 👈 Référence au moniteur assigné
  title: string;
  // ... autres champs
}
```

### **Pages Moniteur**
- `/instructor` - Vue d'ensemble
- `/instructor/timeslots` - Gestion des disponibilités
- `/instructor/calendar` - Calendrier des cours

---

## 🪁 3. RÔLE : STUDENT (ÉLÈVE)

### **Permissions**
- ✅ Réserver des cours
- ✅ Gérer ses crédits (acheter, consommer)
- ✅ Suivre sa progression
- ✅ Modifier son profil (données personnelles)
- ✅ Exporter ses données (RGPD Article 20)
- ✅ Demander la suppression de son compte (RGPD Article 17)
- ❌ Ne peut PAS créer de cours
- ❌ Ne peut PAS gérer les crédits des autres

### **Tables utilisées**

| Table | Accès | Description |
|-------|-------|-------------|
| `users` | Lecture/Écriture (son profil) | Modifie son profil |
| `courses` | Lecture | Consulte les cours disponibles |
| `reservations` | Lecture/Écriture (les siennes) | Réserve des cours |
| `courseCredits` | Lecture/Écriture (les siens) | Gère ses crédits |
| `courseSessions` | Lecture | Voit les sessions disponibles |
| `userPhysicalData` | Lecture/Écriture (les siennes) | Données physiques (poids, taille...) |
| `userHealthData` | Lecture/Écriture (les siennes) | Données de santé |
| `userProgression` | Lecture/Écriture (la sienne) | Suivi de progression |
| `userConsents` | Lecture/Écriture (les siens) | Consentements RGPD |
| `deletionRequests` | Écriture (demande) | Demande la suppression |

### **Système de Crédits**
```typescript
interface CourseCredit {
  id: number;
  studentId: number;     // 👈 Référence à l'élève
  sessions: number;      // Nombre de séances achetées (1 séance = 2h30)
  usedSessions: number;  // Séances déjà consommées
  status: 'active' | 'expired' | 'refunded';
  expiresAt?: number;    // Date d'expiration (optionnel)
  createdAt: number;
  updatedAt: number;
}
```

### **Réservation d'un cours**
```typescript
interface Reservation {
  id: number;
  studentId: number;     // 👈 Élève qui réserve
  courseId: number;      // Cours réservé
  sessionId?: number;    // Session spécifique (optionnel)
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: number;
}
```

**Business Logic** :
- 1 réservation = **1 séance consommée** (2h30 de cours)
- Sessions disponibles : **08:30-11:00** et **14:30-17:00**

### **Pages Élève**
- `/student` - Réserver un cours
- `/reservations` - Historique des réservations
- `/profil/mes-donnees` - Export des données personnelles
- `/profil/modifier` - Modifier son profil
- `/profil/consentements` - Gérer les consentements RGPD

---

## 📦 4. TOUTES LES TABLES (DÉTAILS COMPLETS)

### **Table : users**
```typescript
{
  id: number;           // ++id (auto-increment)
  email: string;        // Indexé
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'instructor' | 'student';  // Indexé
  isActive: 0 | 1;      // Indexé
  createdAt: number;    // Indexé
  photo?: string;       // Base64 (optionnel)
}
```

---

### **Table : courses**
```typescript
{
  id: number;           // ++id
  instructorId: number; // Indexé (référence à users.id)
  title: string;
  description?: string;
  level: 'beginner' | 'intermediate' | 'advanced';  // Indexé
  maxStudents: number;
  price: number;
  isActive: 0 | 1;      // Indexé
  createdAt: number;    // Indexé
}
```

---

### **Table : courseSessions**
```typescript
{
  id: number;           // ++id
  courseId: number;     // Indexé (référence à courses.id)
  date: string;         // Format: "YYYY-MM-DD"
  startTime: string;    // Format: "HH:MM" (ex: "08:30")
  endTime: string;      // Format: "HH:MM" (ex: "11:00")
  location: string;     // Lieu du cours
  maxStudents: number;
  isActive: 0 | 1;      // Indexé
  createdAt: number;    // Indexé
}
```

---

### **Table : reservations**
```typescript
{
  id: number;           // ++id
  studentId: number;    // Indexé (référence à users.id)
  courseId: number;     // Indexé (référence à courses.id)
  sessionId?: number;   // Optionnel (référence à courseSessions.id)
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';  // Indexé
  createdAt: number;    // Indexé
}
```

---

### **Table : timeSlots** (Disponibilités moniteurs)
```typescript
{
  id: number;           // ++id
  instructorId: number; // Indexé (référence à users.id)
  date: string;         // Format: "YYYY-MM-DD"
  startTime: string;    // Format: "HH:MM"
  endTime: string;      // Format: "HH:MM"
  isAvailable: 0 | 1;   // Indexé
  createdAt: number;    // Indexé
}
```

---

### **Table : courseCredits** (Crédits élèves)
```typescript
{
  id: number;           // ++id
  studentId: number;    // Indexé (référence à users.id)
  sessions: number;     // Nombre de séances achetées
  usedSessions: number; // Séances consommées
  status: 'active' | 'expired' | 'refunded';  // Indexé
  expiresAt?: number;   // Timestamp d'expiration
  createdAt: number;    // Indexé
  updatedAt: number;
}
```

**Index composites** : `[studentId+status]`

---

### **Table : userPhysicalData** (Données physiques élèves)
```typescript
{
  id: number;           // ++id
  userId: number;       // Indexé (référence à users.id)
  height?: number;      // Taille en cm
  weight?: number;      // Poids en kg
  shoeSize?: number;    // Pointure
  wetsuitSize?: string; // Taille combinaison
  harnessSize?: string; // Taille harnais
  createdAt: number;
  updatedAt: number;
}
```

---

### **Table : userHealthData** (Données de santé élèves)
```typescript
{
  id: number;           // ++id
  userId: number;       // Indexé (référence à users.id)
  medicalConditions?: string;  // Conditions médicales
  allergies?: string;          // Allergies
  medications?: string;        // Traitements en cours
  emergencyContact?: string;   // Contact d'urgence
  emergencyPhone?: string;     // Téléphone d'urgence
  bloodType?: string;          // Groupe sanguin
  swimmingLevel?: string;      // Niveau de natation
  medicalCertificateValidUntil?: string;  // Validité certificat médical
  createdAt: number;
  updatedAt: number;
}
```

---

### **Table : userProgression** (Progression pédagogique)
```typescript
{
  id: number;           // ++id
  userId: number;       // Indexé (référence à users.id)
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  skills: string[];     // Compétences acquises
  totalHours: number;   // Nombre total d'heures de vol
  lastSessionDate?: number;
  notes?: string;       // Notes du moniteur
  currentIkoLevel?: string;  // Niveau IKO actuel
  validatedSkills: string[]; // Compétences validées
  createdAt: number;
  updatedAt: number;
}
```

---

### **Table : userTransactions** (Transactions financières)
```typescript
{
  id: number;           // ++id
  userId: number;       // Indexé (référence à users.id)
  reservationId?: number;  // Optionnel (référence à reservations.id)
  amount: number;       // Montant en euros
  type: 'payment' | 'refund' | 'credit_purchase';  // Indexé
  status: 'pending' | 'completed' | 'failed' | 'refunded';  // Indexé
  paymentMethod?: string;
  currency?: string;    // Devise (ex: "EUR")
  createdAt: number;    // Indexé
}
```

---

### **Table : userConsents** (Consentements RGPD)
```typescript
{
  id: number;           // ++id
  userId: number;       // Indexé (référence à users.id)
  consentType: 'marketing_emails' | 'photos_marketing' | 'analytics_cookies';
  status: 'accepted' | 'refused';  // Indexé
  version: string;      // Version du consentement
  acceptedAt: number;   // Timestamp d'acceptation
  updatedAt: number;
  ipAddress?: string;   // IP lors de l'acceptation
  userAgent?: string;   // User-Agent lors de l'acceptation
}
```

**Index composites** : `[userId+consentType]`

---

### **Table : deletionRequests** (Demandes de suppression RGPD)
```typescript
{
  id: number;           // ++id
  userId: number;       // Indexé (référence à users.id)
  requestedAt: number;  // Timestamp de la demande
  confirmedAt?: number; // Timestamp de confirmation
  scheduledFor?: number; // Date de suppression programmée
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';  // Indexé
  confirmationToken: string;  // Token unique pour confirmation par email
  reason?: string;      // Raison de la suppression
  emailSentAt?: number; // Timestamp d'envoi de l'email
}
```

---

## 🔗 5. RELATIONS ENTRE TABLES

```
┌──────────────────────────────────────────────────────────────────┐
│                        DIAGRAMME DE RELATIONS                    │
└──────────────────────────────────────────────────────────────────┘

users (id: number)
  │
  ├─► courses.instructorId         (1 admin/instructor → N cours)
  │
  ├─► reservations.studentId       (1 student → N réservations)
  │
  ├─► courseCredits.studentId      (1 student → N crédits)
  │
  ├─► timeSlots.instructorId       (1 instructor → N créneaux)
  │
  ├─► userPhysicalData.userId      (1 user → 1 fiche physique)
  │
  ├─► userHealthData.userId        (1 user → 1 fiche santé)
  │
  ├─► userProgression.userId       (1 student → 1 progression)
  │
  ├─► userTransactions.userId      (1 user → N transactions)
  │
  ├─► userConsents.userId          (1 user → N consentements)
  │
  └─► deletionRequests.userId      (1 user → N demandes)

courses (id: number)
  │
  └─► courseSessions.courseId      (1 cours → N sessions)
      │
      └─► reservations.sessionId   (1 session → N réservations)

reservations (id: number)
  │
  └─► userTransactions.reservationId  (1 réservation → N transactions)
```

---

## 📅 6. EXEMPLE DE FLUX COMPLET

### **Flux : Un élève réserve un cours**

```
1. Élève se connecte
   └─► users (vérification email/password)

2. Élève consulte les cours disponibles
   └─► courses.where('isActive').equals(1)

3. Élève voit les sessions pour un cours
   └─► courseSessions.where('courseId').equals(courseId)

4. Élève clique sur "Réserver"
   └─► Vérifie son solde de crédits
       └─► courseCredits.where('studentId').equals(studentId)
       └─► Calcule: remainingSessions = sessions - usedSessions

5. Confirmation de la réservation
   └─► Crée une réservation
       └─► reservations.add({ studentId, courseId, sessionId, ... })
   
   └─► Décrémente 1 séance du crédit
       └─► courseCredits.update(creditId, { usedSessions: usedSessions + 1 })

6. Moniteur voit la réservation
   └─► reservations.where('courseId').equals(courseId)
   └─► courses.where('instructorId').equals(instructorId)
```

---

## 🔐 7. SÉCURITÉ ET RGPD

### **Données sensibles**
| Table | Données | Durée de conservation |
|-------|---------|----------------------|
| `userHealthData` | Santé | 1 an |
| `userPhysicalData` | Physique | 5 ans |
| `userProgression` | Pédagogique | 5 ans |
| `userConsents` | Consentements | 6 mois après suppression |
| `deletionRequests` | Demandes | 6 mois |

### **Droits RGPD implémentés**
- ✅ **Article 15** : Droit d'accès (`/profil/mes-donnees`)
- ✅ **Article 16** : Droit de rectification (`/profil/modifier`)
- ✅ **Article 17** : Droit à l'oubli (suppression de compte)
- ✅ **Article 20** : Portabilité des données (export JSON)
- ✅ **Article 21** : Droit d'opposition (consentements)

---

## 📊 8. STATISTIQUES ET INDEX

### **Index par table**

| Table | Index | Justification |
|-------|-------|---------------|
| `users` | `email`, `role`, `isActive` | Authentification, filtrage |
| `courses` | `instructorId`, `level`, `isActive` | Recherche par moniteur/niveau |
| `reservations` | `studentId`, `courseId`, `status` | Historique élève, gestion cours |
| `courseSessions` | `courseId`, `isActive` | Sessions par cours |
| `courseCredits` | `studentId`, `[studentId+status]`, `status` | Solde élève, crédits actifs |
| `userConsents` | `userId`, `[userId+consentType]`, `status` | Consentements par utilisateur |
| `deletionRequests` | `userId`, `status`, `confirmationToken` | Gestion des suppressions |

---

**Document créé le** : 14 mars 2026  
**Version de la base de données** : 8  
**Dernière migration** : Conversion heures → séances (1 séance = 2h30)
