# 📋 GESTION DES CONSENTEMENTS - RGPD Article 7 + 21

**Statut** : ✅ IMPLÉMENTÉ  
**Date** : 14 mars 2026  
**Articles RGPD** : Article 7 (Preuve du consentement) + Article 21 (Droit d'opposition)

---

## 🎯 VUE D'ENSEMBLE

L'application permet maintenant aux utilisateurs de gérer leurs consentements RGPD conformément aux Articles 7 et 21.

### Fonctionnalités Clés

- ✅ **3 types de consentements** gérés
- ✅ **Preuve légale** avec timestamp + version
- ✅ **Historique complet** de tous les consentements
- ✅ **Toggle accessible** (ARIA, clavier)
- ✅ **Droit d'opposition** (Article 21)
- ✅ **Modification à tout moment**

---

## 📊 TYPES DE CONSENTEMENTS

| Type | Description | Version Actuelle |
|------|-------------|------------------|
| `marketing_emails` | Recevoir emails promotionnels | v2.0 |
| `photos_marketing` | Utilisation photos/vidéos marketing | v1.5 |
| `analytics_cookies` | Cookies analytiques | v1.0 |

---

## 🗂️ DONNÉES COLLECTÉES

### Pour Chaque Consentement

| Champ | Type | Obligatoire | Rôle |
|-------|------|-------------|------|
| `userId` | number | ✅ | Lien vers l'utilisateur |
| `consentType` | ConsentType | ✅ | Type de consentement |
| `status` | 'accepted' \| 'refused' | ✅ | Statut du consentement |
| `version` | string | ✅ | Version du document accepté |
| `acceptedAt` | number (timestamp) | ✅ | Date du consentement |
| `updatedAt` | number (timestamp) | ✅ | Dernière mise à jour |
| `ipAddress` | string | ❌ | Preuve légale (optionnel) |
| `userAgent` | string | ❌ | Preuve légale (optionnel) |

---

## 🔧 COMPOSANTS CRÉÉS

### Pages

| Fichier | Route | Rôle |
|---------|-------|------|
| `ConsentsPage.tsx` | `/profil/consentements` | Page de gestion |

### Hooks & Utils

| Fichier | Rôle |
|---------|------|
| `useConsents.ts` | Hook React pour gestion |
| `consentManager.ts` | Fonctions pures métier |
| `generateUUID.ts` | Déjà créé (P1) |

### Composants UI

| Fichier | Rôle |
|---------|------|
| `Toggle.tsx` | Bouton switch accessible |

### Database

| Fichier | Rôle |
|---------|------|
| `db/migrations/v6.ts` | Table `userConsents` |
| `db/db.ts` | Migration v6 intégrée |
| `types/index.ts` | Interfaces UserConsent |

---

## 🧪 GUIDE DE TEST

### Test 1 : Voir ses consentements

```
1. Se connecter avec student@kiteschool.com / student123 (Alice)
2. Naviguer vers /profil/consentements
3. ✅ Les 3 sections s'affichent :
   - Emails marketing : Accepté (v2.0, il y a 30 jours)
   - Photos marketing : Refusé (v1.5, il y a 10 jours)
   - Cookies analytiques : Accepté (v1.0, il y a 30 jours)
4. ✅ L'historique affiche les 3 consentements
```

### Test 2 : Modifier un consentement

```
1. Sur la page /profil/consentements
2. Cliquer sur le toggle "Emails marketing"
3. ✅ Le toggle passe de ON à OFF (ou inversement)
4. ✅ Un nouveau consentement est créé dans l'historique
5. ✅ La date est mise à jour
6. ✅ La version est conservée
```

### Test 3 : Vérifier l'historique

```
1. Après avoir modifié un consentement
2. Scroller vers le bas de page
3. ✅ L'historique affiche TOUS les consentements
4. ✅ Le plus récent est en haut
5. ✅ Chaque ligne montre : Type, Statut, Date, Version
```

### Test 4 : Seed data (Bob)

```
1. Se connecter avec student2@kiteschool.com / student123 (Bob)
2. Naviguer vers /profil/consentements
3. ✅ Emails marketing : Refusé
4. ✅ Photos marketing : Non affiché (jamais consenti)
5. ✅ Cookies analytiques : Accepté (à l'instant)
```

---

## 🔒 PREUVE LÉGALE (Article 7 RGPD)

### Ce Qui Est Enregistré

Pour chaque consentement :

```typescript
{
  userId: 3,
  consentType: 'marketing_emails',
  status: 'accepted',
  version: '2.0',              // Version du document
  acceptedAt: 1710360000000,    // Timestamp précis
  updatedAt: 1710360000000,     // Dernière MAJ
  ipAddress: '192.168.1.1',    // Optionnel
  userAgent: 'Mozilla/5.0...'   // Optionnel
}
```

### Pourquoi C'est Conforme

| Exigence RGPD | Implémentation |
|---------------|----------------|
| **Date du consentement** | ✅ `acceptedAt` (timestamp) |
| **Version du document** | ✅ `version` (ex: "2.0") |
| **Identité de la personne** | ✅ `userId` (lié à l'utilisateur) |
| **Statut clair** | ✅ `status` ('accepted' ou 'refused') |
| **Traçabilité** | ✅ Historique complet conservé |

---

## 📊 FONCTIONS MÉTIER (consentManager.ts)

### Fonctions Principales

| Fonction | Rôle | Exemple |
|----------|------|---------|
| `hasValidConsent()` | Vérifie si consentement accepté | `hasValidConsent(consents, 'marketing_emails')` |
| `getLatestConsent()` | Récupère le plus récent | `getLatestConsent(consents, 'photos_marketing')` |
| `createConsent()` | Crée un nouveau consentement | `createConsent(userId, type, 'accepted', '2.0')` |
| `getConsentHistory()` | Historique par type | `getConsentHistory(consents, 'analytics_cookies')` |
| `getConsentSummary()` | Résumé pour UI | `getConsentSummary(consents)` |
| `formatConsentDate()` | Format date français | `formatConsentDate(timestamp)` |

---

## 🎨 COMPOSANT UI

### Toggle

**Props** :
```typescript
interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  id?: string;
  size?: 'sm' | 'md' | 'lg';
}
```

**Accessibilité** :
- ✅ `role="switch"`
- ✅ `aria-checked={checked}`
- ✅ `aria-label={label}`
- ✅ Navigation clavier (Enter, Space)
- ✅ Focus visible

---

## 📧 CONSENTEMENTS PAR DÉFAUT (Seed Data)

### Alice (student@kiteschool.com)

| Type | Statut | Version | Date |
|------|--------|---------|------|
| Emails marketing | ✅ Accepté | v2.0 | Il y a 30 jours |
| Photos marketing | ❌ Refusé | v1.5 | Il y a 10 jours |
| Cookies analytics | ✅ Accepté | v1.0 | Il y a 30 jours |

### Bob (student2@kiteschool.com)

| Type | Statut | Version | Date |
|------|--------|---------|------|
| Emails marketing | ❌ Refusé | v2.0 | Il y a 5 jours |
| Photos marketing | - | - | Jamais consenti |
| Cookies analytics | ✅ Accepté | v1.0 | À l'instant |

---

## ⚠️ POINTS D'ATTENTION

### Pour les utilisateurs

- ✅ **Modification à tout moment** : Les consentements peuvent être changés
- ✅ **Historique conservé** : Tous les consentements sont tracés
- ✅ **Version des documents** : La version est affichée pour preuve

### Pour les développeurs

- ⚠️ **Ne pas supprimer l'historique** : Article 7 exige la traçabilité
- ⚠️ **Incrémenter la version** : Si les CGU changent, mettre à jour `CONSENT_VERSIONS`
- ⚠️ **Utiliser `createConsent()`** : Toujours créer un NOUVEL enregistrement (pas de update)

---

## 🔄 MISE À JOUR DES VERSIONS

Quand les CGU ou la politique de confidentialité changent :

```typescript
// Dans src/utils/consentManager.ts
export const CONSENT_VERSIONS: Record<ConsentType, string> = {
  marketing_emails: '2.0',  // ← Incrémenter si changement
  photos_marketing: '1.5',
  analytics_cookies: '1.0',
};
```

**Procédure** :
1. Incrémenter la version dans `CONSENT_VERSIONS`
2. Mettre à jour le texte des CGU
3. Les utilisateurs devront re-confirmer (nouvel enregistrement créé)

---

## 🎯 CONFORMITÉ RGPD

### Article 7 - Preuve du consentement

| Exigence | Implémentation |
|----------|----------------|
| **Démontrer le consentement** | ✅ Enregistrement dans IndexedDB |
| **Date et heure** | ✅ `acceptedAt` (timestamp) |
| **Version du document** | ✅ `version` (ex: "2.0") |
| **Identité de la personne** | ✅ `userId` (lié à User) |

### Article 21 - Droit d'opposition

| Exigence | Implémentation |
|----------|----------------|
| **S'opposer au marketing** | ✅ Toggle "Emails marketing" |
| **S'opposer aux photos** | ✅ Toggle "Photos marketing" |
| **S'opposer aux cookies** | ✅ Toggle "Cookies analytiques" |
| **Information claire** | ✅ Description pour chaque type |

---

## 📝 COMMANDES UTILES

### Voir les consentements d'un utilisateur

```typescript
import { db } from './db/db';

const userConsents = await db.userConsents
  .where('userId')
  .equals(3) // Alice
  .toArray();

console.log('Consentements d\'Alice:', userConsents);
```

### Vérifier un consentement spécifique

```typescript
import { hasValidConsent } from './utils/consentManager';

const hasEmailConsent = hasValidConsent(consents, 'marketing_emails');
console.log('Alice a consenti aux emails:', hasEmailConsent); // true/false
```

### Créer un consentement manuellement

```typescript
import { createConsent } from './utils/consentManager';

const newConsent = createConsent(
  3, // userId
  'marketing_emails',
  'accepted',
  '2.0'
);

await db.userConsents.add(newConsent as any);
```

---

## 🚀 PROCHAINES ÉTAPES

La gestion des consentements est **fonctionnelle** ! ✅

**Pour aller plus loin** :
1. Ajouter `ipAddress` et `userAgent` pour preuve légale renforcée
2. Implémenter le nettoyage automatique (P4)
3. Créer les logs d'audit (P5)
4. Ajouter la modification des données (P3)

---

**Document créé le** : 14 mars 2026  
**Prochaine révision** : Après implémentation P3
