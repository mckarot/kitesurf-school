# Guide de Dépannage : "NotFoundError: The specified object store was not found"

Cette erreur se produit lorsque le code tente d'accéder à une "table" (Object Store) qui n'existe pas dans la version actuelle de la base de données de votre navigateur. Voici les causes possibles et comment les résoudre.

## Étape 1 : Le "Quick Fix" (Solution rapide)

Parfois, la base de données dans le navigateur peut être dans un état corrompu et irrécupérable. La solution la plus simple est de la supprimer manuellement.

1.  Ouvrez les outils de développement de votre navigateur (F12).
2.  Allez dans l'onglet **Application**.
3.  Dans le menu de gauche, trouvez **Stockage** > **IndexedDB**.
4.  Vous verrez une base de données nommée `KiteSurfSchoolDB`.
5.  Faites un clic droit dessus et choisissez **Supprimer la base de données**.
6.  Actualisez la page (F5). Dexie recréera la base de données à partir de la dernière version définie dans le code.

Si l'erreur persiste après cela, le problème se situe dans le code. Passez aux étapes suivantes.

## Étape 2 : Vérifier les Migrations de Base de Données

C'est la cause la plus fréquente. Quand vous ajoutez une nouvelle version à la base de données avec `db.version(X).stores({...})`, **vous devez y redéclarer TOUTES les tables qui doivent exister**, pas seulement les nouvelles.

**Où vérifier ?**
*   `src/db/db.ts` : Pour les migrations définies directement dans le constructeur.
*   `src/db/migrations/*.ts` : Pour les migrations externalisées.

**Exemple du bug que nous avons corrigé :**

Dans `src/db/db.ts`, la `version(14)` était définie comme ceci :
```typescript
// FAUX
this.version(14).stores({
  sessionExceptions: '++id, sessionId, [sessionId+type], date, createdAt',
});
```
**Problème :** Cette définition dit à Dexie : "Pour la version 14, je veux UNIQUEMENT la table `sessionExceptions`". Toutes les autres tables (`users`, `reservations`, etc.) sont donc supprimées.

**La Correction :**
Il faut copier la liste complète des tables de la version précédente et y ajouter la nouvelle table.

```typescript
// CORRECT
this.version(14).stores({
  // Toutes les tables de la v13...
  users: '++id, email, role, isActive, createdAt',
  courses: '++id, instructorId, level, isActive, createdAt',
  reservations: '++id, studentId, courseId, status, createdAt',
  courseSessions: '++id, courseId, isActive, createdAt, [courseId+date+startTime]',
  // ... et ainsi de suite pour toutes les tables
  
  // ... et on ajoute la nouvelle table
  sessionExceptions: '++id, sessionId, [sessionId+type], date, createdAt',
});
```

**Checklist pour une migration :**
1.  Identifiez le numéro de la dernière version.
2.  Ouvrez le fichier où elle est définie (`db.ts` ou `migrations/vX.ts`).
3.  Assurez-vous que la liste dans `.stores({...})` est complète. Comparez-la avec la version précédente pour être sûr de n'avoir rien oublié.

## Étape 3 : Vérifier la Portée des Transactions

La deuxième cause possible est qu'une transaction essaie d'accéder à une table qui n'a pas été déclarée au début de cette transaction.

**Où vérifier ?**
Recherchez les appels à `db.transaction()`. Le premier argument est le mode (`'r'` pour lecture, `'rw'` pour lecture/écriture), suivi des tables concernées.

**Exemple du bug que nous avons corrigé :**

Dans `src/utils/createReservationWithPayment.ts`, la transaction était définie comme ceci :
```typescript
// FAUX
await db.transaction('rw', db.userWallets, db.reservations, db.coursePricing, db.transactions, async () => {
  // ...
  // Le code à l'intérieur essayait d'accéder à `db.courseSessions`
  const session = await db.courseSessions.get(courseSessionId); 
  // ...
});
```
**Problème :** `db.courseSessions` était utilisé à l'intérieur de la fonction, mais n'était pas listé dans les tables de la transaction.

**La Correction :**
Ajoutez la table manquante à la liste. Si vous avez beaucoup de tables, passez-les dans un tableau.

```typescript
// CORRECT
await db.transaction('rw', [db.userWallets, db.reservations, db.coursePricing, db.transactions, db.courseSessions], async () => {
  // Le code ne plantera plus ici
  const session = await db.courseSessions.get(courseSessionId);
});
```

**Checklist pour une transaction :**
1.  Lisez le code à l'intérieur de la fonction `async () => { ... }` de la transaction.
2.  Listez toutes les tables de la base de données qui y sont utilisées (ex: `db.users`, `db.reservations`).
3.  Vérifiez que cette liste correspond exactement à la liste des tables déclarées dans l'appel `db.transaction(...)`.
