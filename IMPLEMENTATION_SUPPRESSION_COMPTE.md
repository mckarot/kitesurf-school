# 🗑️ SUPPRESSION DE COMPTE - RGPD Article 17

**Statut** : ✅ IMPLÉMENTÉ  
**Date** : 14 mars 2026  
**Article RGPD** : Article 17 (Droit à l'oubli)

---

## 🎯 VUE D'ENSEMBLE

L'application permet maintenant aux utilisateurs de demander la suppression de leur compte conformément au RGPD Article 17.

### Fonctionnalités Clés

- ✅ **Demande de suppression** en 3 étapes
- ✅ **Délai de rétractation** de 7 jours
- ✅ **Email de confirmation** avec lien sécurisé
- ✅ **Suppression effective** après 7 jours
- ✅ **Anonymisation** des données historiques
- ✅ **Conservation** des données légales (transactions)

---

## 📊 PROCESSUS DE SUPPRESSION

```
Étape 1 : Utilisateur demande suppression (J-0)
         ↓
Étape 2 : Email de confirmation envoyé avec token
         ↓
Étape 3 : Utilisateur clique sur lien de confirmation
         ↓
Étape 4 : Délai de rétractation de 7 jours
         ↓
Étape 5 : Suppression effective automatique (J+7)
```

---

## 🗂️ DONNÉES TRAITÉES

### Données SUPPRIMÉES (Droit à l'oubli)

| Table | Action | Justification |
|-------|--------|---------------|
| `users` | ❌ SUPPRIMER | Identité utilisateur |
| `userPhysicalData` | ❌ SUPPRIMER | Données physiques |
| `userHealthData` | ❌ SUPPRIMER | Données de santé (sensibles) |
| `courseCredits` | ❌ SUPPRIMER | Crédits personnels |

### Données ANONYMISÉES (Historique)

| Table | Action | Méthode |
|-------|--------|---------|
| `userProgression` | ⚠️ ANONYMISER | `userId → 0` |
| `reservations` | ⚠️ ANONYMISER | `studentId → 0` |

### Données CONSERVÉES (Obligations légales)

| Table | Durée | Justification |
|-------|-------|---------------|
| `transactions` | 10 ans | Article 172 Code de Commerce |
| `deletionRequests` | 1 an | Preuve légale de suppression |

---

## 🔧 COMPOSANTS CRÉÉS

### Pages

| Fichier | Route | Rôle |
|---------|-------|------|
| `DeleteAccountPage.tsx` | `/profil/supprimer-compte` | Formulaire de demande |
| `DeleteConfirmationModal.tsx` | - | Modal post-demande |
| `ConfirmDeletionPage.tsx` | `/profil/confirmer-suppression/:token` | Confirmation par token |
| `ProfileErrorBoundary.tsx` | - | Error Boundary |

### Hooks & Utils

| Fichier | Rôle |
|---------|------|
| `useDeleteAccount.ts` | Hook React pour suppression |
| `deleteAccountLogic.ts` | Logique métier de suppression |
| `cleanupDeletions.ts` | Cleanup automatique au démarrage |
| `generateUUID.ts` | Générateur de token UUID |

### Database

| Fichier | Rôle |
|---------|------|
| `db/migrations/v5.ts` | Table `deletionRequests` |
| `db/db.ts` | Migration v5 intégrée |

---

## 🧪 GUIDE DE TEST

### Test 1 : Demande de suppression

```
1. Se connecter avec student@kiteschool.com / student123
2. Naviguer vers /profil/supprimer-compte
3. Remplir le formulaire :
   - Mot de passe : student123
   - Raison : "Test"
   - Cocher "Je comprends..."
4. Cliquer sur "Demander la suppression"
5. ✅ La modale s'ouvre avec le token de confirmation
6. ✅ Le lien de confirmation est affiché
```

### Test 2 : Confirmation par token

```
1. Copier le lien affiché dans la modale
   Ex: http://localhost:5173/profil/confirmer-suppression/abc123...
2. Naviguer vers ce lien
3. ✅ La page de confirmation s'affiche
4. Cliquer sur "Confirmer la suppression définitive"
5. ✅ Message de succès
6. ✅ Compte programmé pour suppression dans 7 jours
```

### Test 3 : Annulation

```
1. Après la demande (avant confirmation)
2. Cliquer sur "Annuler la suppression" dans la modale
3. ✅ La demande est annulée
4. ✅ Le compte reste actif
```

### Test 4 : Cleanup automatique

```
1. Modifier manuellement une demande dans la DB :
   - status: 'confirmed'
   - confirmedAt: Date.now() - (8 * 24 * 60 * 60 * 1000) // Il y a 8 jours
   - scheduledFor: Date.now() - (1 * 24 * 60 * 60 * 1000) // Il y a 1 jour
2. Redémarrer l'application
3. ✅ Le script cleanupDeletions() s'exécute
4. ✅ Le compte est supprimé
5. ✅ La demande est marquée 'completed'
```

---

## 🔒 SÉCURITÉ

### Vérifications avant suppression

- ✅ **Mot de passe requis** : Re-vérification avant demande
- ✅ **Blockers vérifiés** : Pas de réservation future confirmée
- ✅ **Token UUID unique** : Non devinable, sécurisé
- ✅ **Délai 7 jours** : Période de rétractation obligatoire

### Protection des données

- ✅ **Transaction atomique** : Soit tout est supprimé, soit rien
- ✅ **Logs d'audit** : Demande tracée dans `deletionRequests`
- ✅ **Anonymisation** : Historique conservé mais non lié à l'identité

---

## 📧 EMAIL DE CONFIRMATION (Simulation)

Comme il n'y a pas de serveur email, le lien est affiché dans une alerte :

```javascript
alert(
  `EMAIL SIMULATION:\n\n` +
  `Demande de suppression créée avec succès.\n\n` +
  `Lien de confirmation:\n${confirmationLink}\n\n` +
  `Vous avez 7 jours pour confirmer.`
);
```

**Dans un vrai cas** :
- Le lien serait envoyé par email
- L'email contiendrait des instructions de sécurité
- Le lien expirerait après 24h

---

## ⚠️ POINTS D'ATTENTION

### Pour les utilisateurs

- ⚠️ La suppression est **irréversible** après 7 jours
- ⚠️ Les **transactions sont conservées** (obligation légale)
- ⚠️ L'**historique est anonymisé** (plus lié à l'identité)

### Pour les développeurs

- ⚠️ Ne pas supprimer la table `deletionRequests` (preuve légale)
- ⚠️ Conserver l'index `confirmationToken` (recherche rapide)
- ⚠️ Exécuter `cleanupDeletions()` au démarrage de l'app

---

## 🎯 CONFORMITÉ RGPD

### Article 17 - Droit à l'oubli

| Exigence | Implémentation |
|----------|----------------|
| **Suppression sur demande** | ✅ Formulaire `/profil/supprimer-compte` |
| **Information claire** | ✅ Liste des données supprimées/conservées |
| **Délai de rétractation** | ✅ 7 jours après confirmation |
| **Preuve de suppression** | ✅ Table `deletionRequests` |
| **Anonymisation** | ✅ `userId → 0` pour historique |

### Article 5 - Durée de conservation

| Donnée | Durée | Respect |
|--------|-------|---------|
| Identité | Jusqu'à suppression | ✅ |
| Transactions | 10 ans | ✅ |
| DeletionRequests | 1 an | ✅ |
| Logs d'audit | 6 mois | ⚠️ (à implémenter P5) |

---

## 📝 COMMANDES UTILES

### Voir les demandes en cours

```typescript
import { db } from './db/db';

const pendingRequests = await db.deletionRequests
  .where('status')
  .anyOf(['pending', 'confirmed'])
  .toArray();

console.log('Demandes en cours:', pendingRequests);
```

### Annuler une demande manuellement

```typescript
await db.deletionRequests.update(requestId, {
  status: 'cancelled'
});
```

### Forcer le cleanup

```typescript
import { runStartupCleanup } from './utils/cleanupDeletions';

await runStartupCleanup({ force: true });
```

---

## 🚀 PROCHAINES ÉTAPES

La suppression de compte est **fonctionnelle** ! ✅

**Pour aller plus loin** :
1. Ajouter un vrai service d'envoi d'emails
2. Implémenter les logs d'audit (P5)
3. Ajouter le nettoyage automatique des comptes inactifs (P4)
4. Créer un dashboard admin pour voir les suppressions

---

**Document créé le** : 14 mars 2026  
**Prochaine révision** : Après implémentation P2
