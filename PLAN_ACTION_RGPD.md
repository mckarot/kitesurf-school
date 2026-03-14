# 📋 PLAN D'ACTION RGPD - KiteSurf School

**Date** : 14 mars 2026
**Document de référence** : `RGPD.md` (Version 2.0)

---

## 🎯 ÉTAT DES LIEUX

### ✅ DÉJÀ IMPLÉMENTÉ

| Fonctionnalité | Section RGPD | Statut | Fichiers |
|----------------|--------------|--------|----------|
| **Page "Mes Données Personnelles"** | Section 3.1 (Droit d'accès) | ✅ TERMINÉ | `src/pages/ProfileData/` |
| **Export JSON des données** | Section 3.4 (Portabilité) | ✅ TERMINÉ | `src/utils/exportUserData.ts` |
| **Système de Crédits** | - | ✅ TERMINÉ | `src/hooks/useCourseCredits.ts` |
| **Affichage des données** | Section 1 (Données collectées) | ✅ TERMINÉ | Tous les composants |
| **Suppression de compte** | Section 3.3 (Droit à l'oubli) | ✅ TERMINÉ | `src/pages/Profile/`, `src/utils/deleteAccountLogic.ts` |
| **Gestion des consentements** | Section 1.8 + 3.5 (Article 7 + 21) | ✅ TERMINÉ | `src/pages/Profile/ConsentsPage.tsx`, `src/hooks/useConsents.ts` |
| **Modification de profil** | Section 3.2 (Article 16) | ✅ TERMINÉ | `src/pages/Profile/EditProfilePage.tsx`, `src/hooks/useProfileEdit.ts` |

---

## ❌ À IMPLÉMENTER (PRIORISÉ)

### 🔴 PRIORITÉ 1 : Suppression de Compte (Article 17 RGPD) ✅ FAIT

**Statut** : ✅ TERMINÉ

**Fichiers créés** :
- ✅ `src/pages/Profile/DeleteAccountPage.tsx`
- ✅ `src/pages/Profile/ConfirmDeletionPage.tsx`
- ✅ `src/utils/deleteAccountLogic.ts`
- ✅ `src/utils/cleanupDeletions.ts`
- ✅ `src/hooks/useDeleteAccount.ts`
- ✅ `src/db/migrations/v5.ts` (table `deletionRequests`)
- ✅ `src/pages/Profile/ProfileErrorBoundary.tsx`
- ✅ `src/utils/generateUUID.ts`

---

### 🟠 PRIORITÉ 2 : Gestion des Consentements (Article 7 + 21 RGPD) ✅ FAIT

**Statut** : ✅ TERMINÉ

**Fichiers créés** :
- ✅ `src/db/migrations/v6.ts` (table `userConsents`)
- ✅ `src/utils/consentManager.ts`
- ✅ `src/hooks/useConsents.ts`
- ✅ `src/components/ui/Toggle.tsx`
- ✅ `src/pages/Profile/ConsentsPage.tsx`
- ✅ `src/utils/seed.ts` (modifié)
- ✅ `src/router.tsx` (modifié)

---

### 🟡 PRIORITÉ 3 : Modification des Données (Article 16 RGPD) ✅ FAIT

**Statut** : ✅ TERMINÉ - 14 mars 2026

**Fichiers créés** :
- ✅ `src/types/profile.ts` (nouveaux types)
- ✅ `src/db/migrations/v7.ts` (champ `photo` dans users)
- ✅ `src/utils/passwordValidator.ts` (validation mot de passe)
- ✅ `src/utils/profileUpdateLogic.ts` (logique métier)
- ✅ `src/components/ui/ImageUpload.tsx` (upload photo)
- ✅ `src/components/ui/PasswordStrength.tsx` (force mot de passe)
- ✅ `src/hooks/useProfileEdit.ts` (hook d'édition)
- ✅ `src/pages/Profile/EditProfilePage.tsx` (page d'édition)
- ✅ `src/pages/ProfileData/components/IdentitySection.tsx` (modifié avec lien)
- ✅ `src/router.tsx` (route `/profil/modifier` ajoutée)
- ✅ `src/db/db.ts` (migration V7 configurée)
- ✅ `src/types/index.ts` (export des types profile)

**Fonctionnalités implémentées** :
- ✅ Modification nom, prénom, email
- ✅ Upload photo de profil (max 500KB, base64)
- ✅ Changement de mot de passe avec validation de force
- ✅ Validation email unique
- ✅ Error Boundaries dédiées
- ✅ Accessibilité (ARIA, labels, erreurs)
- ✅ Informations RGPD Article 16

**Contraintes respectées** :
- ✅ TypeScript strict (zéro `any`)
- ✅ Tailwind CSS uniquement
- ✅ Dexie.js avec migration V7
- ✅ React Router v6.4+ avec Error Boundaries
- ✅ Validation sécurisée des mots de passe (8+ caractères, majuscule, minuscule, chiffre, spécial)

---

### 🟢 PRIORITÉ 4 : Nettoyage Automatique (Section 2)

**Pourquoi c'est important** :
- Respect des durées de rétention
- Suppression automatique des données expirées

**Ce qu'il faut créer** :

```
src/
├── utils/
│   └── cleanup.ts                      # Script de nettoyage
├── pages/
│   └── Admin/
│       └── CleanupDashboard.tsx        # Dashboard de nettoyage
└── db/
    └── migrations/
        └── v8.ts                       # Index pour cleanup
```

**Règles de nettoyage** :

| Type de donnée | Durée | Action |
|----------------|-------|--------|
| Compte utilisateur | 3 ans inactivité | Email J-30, J-7 → Suppression |
| Progression | 5 ans | Archivage anonymisé |
| Santé | 1 an | Suppression automatique |
| Logs | 6 mois | Rotation mensuelle |

**Fonctionnalités** :
- [ ] Script exécuté au démarrage de l'app
- [ ] Identifier comptes inactifs > 3 ans
- [ ] Envoyer emails de rappel (J-30, J-7)
- [ ] Supprimer comptes non réactivés
- [ ] Anonymiser données de progression > 5 ans
- [ ] Supprimer données de santé > 1 an
- [ ] Dashboard admin pour voir les statistiques

**Deadline** : 1 mois

---

### 🔵 PRIORITÉ 5 : Logs d'Audit (Section 5.1)

**Pourquoi c'est important** :
- Obligation de sécurité (Article 32 RGPD)
- Traçabilité des actions sensibles
- Détection de fraude

**Ce qu'il faut créer** :

```
src/
├── db/
│   └── migrations/
│       └── v9.ts                       # Table auditLogs
├── utils/
│   └── auditLogger.ts                  # Logger d'audit
└── pages/
    └── Admin/
        └── AuditLogsPage.tsx           # Visualisation des logs
```

**Nouvelle table Dexie** :
```typescript
interface AuditLog {
  id: number;
  userId: number;
  action: 'login' | 'logout' | 'password_change' |
          'account_delete' | 'data_export' | 'profile_edit';
  timestamp: number;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, unknown>;
}
```

**Actions à logger** :
- [ ] Connexion / Déconnexion
- [ ] Modification mot de passe
- [ ] Suppression compte
- [ ] Export de données
- [ ] Modification profil
- [ ] Changement de consentements

**Deadline** : 1 mois

---

## 📊 ROADMAP

```
Semaine 1 (14-21 mars)     : ✅ Suppression de compte (P1) - TERMINÉ
Semaine 2 (21-28 mars)     : ✅ Gestion des consentements (P2) - TERMINÉ
Semaine 3 (28 mars-4 avr)  : ✅ Modification des données (P3) - TERMINÉ
Semaine 4 (4-11 avril)     : ❌ Nettoyage automatique (P4)
Semaine 5 (11-18 avril)    : ❌ Logs d'audit (P5)
```

---

## 🛠️ FICHIERS CRÉÉS (RÉCAPITULATIF COMPLET)

### Priority 1 - Suppression de compte ✅ FAIT
- ✅ `src/pages/Profile/DeleteAccountPage.tsx`
- ✅ `src/pages/Profile/ConfirmDeletionPage.tsx`
- ✅ `src/utils/deleteAccountLogic.ts`
- ✅ `src/utils/cleanupDeletions.ts`
- ✅ `src/hooks/useDeleteAccount.ts`
- ✅ `src/db/migrations/v5.ts` (table `deletionRequests`)
- ✅ `src/pages/Profile/ProfileErrorBoundary.tsx`
- ✅ `src/utils/generateUUID.ts`

### Priority 2 - Consentements ✅ FAIT
- ✅ `src/db/migrations/v6.ts` (table `userConsents`)
- ✅ `src/utils/consentManager.ts`
- ✅ `src/hooks/useConsents.ts`
- ✅ `src/components/ui/Toggle.tsx`
- ✅ `src/pages/Profile/ConsentsPage.tsx`
- ✅ `src/utils/seed.ts` (modifié)
- ✅ `src/router.tsx` (modifié)

### Priority 3 - Modification ✅ FAIT (14 mars 2026)
- ✅ `src/types/profile.ts`
- ✅ `src/db/migrations/v7.ts`
- ✅ `src/utils/passwordValidator.ts`
- ✅ `src/utils/profileUpdateLogic.ts`
- ✅ `src/components/ui/ImageUpload.tsx`
- ✅ `src/components/ui/PasswordStrength.tsx`
- ✅ `src/hooks/useProfileEdit.ts`
- ✅ `src/pages/Profile/EditProfilePage.tsx`
- ✅ `src/pages/ProfileData/components/IdentitySection.tsx` (modifié)
- ✅ `src/router.tsx` (modifié)
- ✅ `src/db/db.ts` (modifié)
- ✅ `src/types/index.ts` (modifié)

### Priority 4 - Nettoyage (À FAIRE)
- [ ] `src/utils/cleanup.ts`
- [ ] `src/pages/Admin/CleanupDashboard.tsx`
- [ ] `src/db/migrations/v8.ts`

### Priority 5 - Audit (À FAIRE)
- [ ] `src/db/migrations/v9.ts` (table `auditLogs`)
- [ ] `src/utils/auditLogger.ts`
- [ ] `src/pages/Admin/AuditLogsPage.tsx`

---

## ✅ CHECKLIST RGPD

| Article RGPD | Droit | Statut | Priorité |
|--------------|-------|--------|----------|
| Art. 15 | Droit d'accès | ✅ IMPLÉMENTÉ | - |
| Art. 16 | Droit de rectification | ✅ IMPLÉMENTÉ | P3 |
| Art. 17 | Droit à l'oubli | ✅ IMPLÉMENTÉ | P1 |
| Art. 20 | Portabilité des données | ✅ IMPLÉMENTÉ | - |
| Art. 21 | Droit d'opposition | ✅ IMPLÉMENTÉ | P2 |
| Art. 32 | Sécurité des données | ⚠️ PARTIEL | P5 |

---

## 📝 NOTES IMPORTANTES

### Contraintes Techniques
- **TypeScript strict** : zéro `any`
- **Dexie.js** : Migrations avec `.upgrade()`
- **Tailwind CSS** : Uniquement
- **React Router v6.4+** : Loaders obligatoires

### Contraintes RGPD
- **Durée de conservation** : Respecter les durées légales
- **Preuve de consentement** : Timestamp + version obligatoires
- **Logs d'audit** : Conservation 6 mois minimum
- **Export JSON** : Format structuré et lisible

### Tests Requis
- Tests unitaires pour chaque utilitaire
- Tests d'intégration pour les flux complets
- Tests de suppression (rollback si échec)
- Tests de performance (cleanup sur gros volume)

---

## 🎯 PROCHAINE ÉTAPE

**Commencer la Priorité 4 : Nettoyage Automatique**

C'est important car :
1. Respect des durées de rétention RGPD
2. Évite l'accumulation de données obsolètes
3. Réduit les risques de sécurité

---

**Document créé le** : 14 mars 2026
**Dernière mise à jour** : 14 mars 2026 (P3 terminée)
**Prochaine révision** : Après implémentation P4
