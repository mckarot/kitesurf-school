# 🪁 KiteSurf School - Application de Gestion

Application web de gestion pour une école de Kitesurf, développée avec React, TypeScript, Dexie.js (IndexedDB) et Tailwind CSS.

## 🚀 Technologies

- **Frontend** : React 18 + TypeScript + Vite
- **Base de données** : Dexie.js (IndexedDB)
- **Routing** : React Router v6.4+
- **Styling** : Tailwind CSS
- **Tests** : Vitest + React Testing Library + Playwright

## 📋 Fonctionnalités

### Rôles utilisateurs

#### 👤 Admin
- Gérer les cours (créer, modifier, supprimer)
- Gérer les utilisateurs
- Gérer les crédits des élèves
- Consulter les statistiques
- Valider les réservations

#### 🎓 Instructor (Moniteur)
- Voir ses cours assignés
- Gérer ses disponibilités
- Suivre ses élèves
- Consulter son calendrier

#### 🪁 Student (Élève)
- Réserver des cours (1 réservation = 1 séance de 2h30)
- Gérer ses crédits
- Suivre sa progression
- Modifier son profil
- Exporter ses données (RGPD)
- Demander la suppression de son compte

## 🛠️ Installation

```bash
# Cloner le dépôt
git clone <votre-url-github>
cd kitesurf-school

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

## 📦 Scripts disponibles

```bash
# Développement
npm run dev          # Démarre le serveur de développement

# Build
npm run build        # Compile pour la production
npm run preview      # Prévisualise la build

# Tests
npm run test         # Lance les tests
npm run test:ui      # Tests avec interface graphique
npm run test:run     # Tests en mode CI
npm run test:coverage # Tests avec couverture de code

# Linting
npm run lint         # Vérifie le code avec ESLint
```

## 📊 Base de données

Version actuelle : **8**

### Tables principales
- `users` - Utilisateurs (admin, instructor, student)
- `courses` - Cours disponibles
- `courseSessions` - Sessions de cours (2h30 par séance)
- `reservations` - Réservations des élèves
- `courseCredits` - Crédits des élèves (en séances)
- `timeSlots` - Disponibilités des moniteurs
- `userPhysicalData` - Données physiques des élèves
- `userHealthData` - Données de santé
- `userProgression` - Progression pédagogique
- `userTransactions` - Transactions financières
- `userConsents` - Consentements RGPD
- `deletionRequests` - Demandes de suppression

## 🔐 RGPD

L'application respecte le RGPD avec :
- ✅ Droit d'accès (Article 15)
- ✅ Droit de rectification (Article 16)
- ✅ Droit à l'oubli (Article 17)
- ✅ Portabilité des données (Article 20)
- ✅ Droit d'opposition (Article 21)

## 📝 Documentation

- [SCHEMA_BASE_DE_DONNEES.md](./SCHEMA_BASE_DE_DONNEES.md) - Schéma complet de la base de données
- [RGPD.md](./RGPD.md) - Politique de confidentialité
- [PLAN_ACTION_RGPD.md](./PLAN_ACTION_RGPD.md) - Plan d'action RGPD

## 🏗️ Architecture

```
src/
├── components/     # Composants UI réutilisables
├── db/            # Configuration Dexie.js + migrations
├── hooks/         # Hooks React personnalisés
├── pages/         # Pages de l'application
│   ├── Admin/
│   ├── Instructor/
│   ├── Student/
│   └── Profile/
├── types/         # Types TypeScript
├── utils/         # Fonctions utilitaires
└── router.tsx     # Configuration des routes
```

## 📱 Routes principales

| Route | Rôle | Description |
|-------|------|-------------|
| `/login` | Tous | Connexion |
| `/dashboard` | Tous | Tableau de bord |
| `/admin` | Admin | Gestion école |
| `/admin/credits` | Admin | Crédits élèves |
| `/admin/stats` | Admin | Statistiques |
| `/instructor` | Instructor | Espace moniteur |
| `/instructor/timeslots` | Instructor | Disponibilités |
| `/instructor/calendar` | Instructor | Calendrier |
| `/student` | Student | Réserver un cours |
| `/reservations` | Tous | Historique |
| `/profil/mes-donnees` | Tous | Données personnelles |

## 🎯 Système de crédits

- **1 crédit = 1 séance de 2h30**
- Sessions disponibles : **08:30-11:00** et **14:30-17:00**
- 1 réservation = **1 séance consommée**

## 📄 License

Ce projet est privé et réservé à un usage interne.

## 👥 Contributeurs

- Développement initial : 2026

## 📞 Support

Pour toute question, contactez l'équipe de développement.
