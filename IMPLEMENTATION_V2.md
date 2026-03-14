# KiteSurf School - Améliorations V2

## Résumé des modifications

### 1. Calendrier Instructeur (`/instructor/calendar`)

**Fichiers créés :**
- `src/pages/InstructorCalendar/index.tsx` - Page principale du calendrier
- `src/pages/InstructorCalendar/loader.ts` - Loader React Router + helper
- `src/components/Calendar/InstructorCalendar.tsx` - Composant calendrier avec vue semaine/mois
- `src/components/Calendar/index.ts` - Export du composant

**Fichiers modifiés :**
- `src/router.tsx` - Ajout de la route `/instructor/calendar`
- `src/pages/Instructor/index.tsx` - Ajout du lien vers le calendrier

**Fonctionnalités :**
- Vue semaine et mois avec navigation
- Affichage des créneaux (timeSlots) du moniteur connecté
- Code couleur : vert = disponible, gris = indisponible
- Click sur une date pour voir les créneaux du jour
- Click sur un créneau pour voir les détails (modal)
- Affichage du nombre de réservations associées

### 2. Statut "completed" pour les réservations

**Fichiers créés :**
- `src/utils/reservationUtils.ts` - Utilitaires pour gérer le statut completed

**Fichiers modifiés :**
- `src/main.tsx` - Appel de `updateCompletedReservations()` au démarrage
- `src/utils/seed.ts` - Ajout de timeSlots de test (dates passées et futures)
- `src/components/ReservationHistory/ReservationItem.tsx` - Bouton "Marquer comme terminé"
- `src/components/TimeSlot/TimeSlotCard.tsx` - Badge "Passé" pour les créneaux passés
- `src/pages/ReservationHistory/index.tsx` - Toggle pour afficher/masquer les réservations terminées
- `src/components/ui/Badge.tsx` - Ajout de la variante 'secondary'
- `src/pages/Instructor/index.tsx` - Affichage du statut completed dans le tableau

**Logique :**
- Une réservation devient automatiquement `completed` quand la date de la session est passée
- L'utilitaire `updateCompletedReservations()` est appelé au chargement de l'app
- Les instructeurs et admins peuvent manuellement marquer une réservation comme terminée
- Filtre optionnel pour afficher/masquer les réservations terminées dans l'historique

## Types TypeScript

Le type `Reservation` inclut maintenant le statut `completed` :

```typescript
export interface Reservation {
  id: number;
  studentId: number;
  courseId: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: number;
}
```

## Commandes

```bash
# Installation
npm install

# Développement
npm run dev

# Build
npm run build

# Preview
npm run preview
```

## Instructions de test

### 1. Tester le calendrier instructeur

1. Lancez l'application : `npm run dev`
2. Connectez-vous avec le compte instructeur :
   - Email : `instructor@kiteschool.com`
   - Password : `instructor123`
3. Cliquez sur "Calendrier" dans le header
4. Naviguez entre les vues semaine/mois
5. Cliquez sur une date pour voir les créneaux
6. Cliquez sur un créneau pour voir les détails

### 2. Tester le statut "completed"

1. Connectez-vous avec le compte admin :
   - Email : `admin@kiteschool.com`
   - Password : `admin123`
2. Allez dans "Historique des réservations"
3. Les réservations avec des dates passées devraient avoir le statut "Terminé"
4. Cliquez sur "Marquer comme terminé" pour une réservation éligible
5. Décochez "Afficher les réservations terminées" pour les masquer

### 3. Vérifier la mise à jour automatique

1. Ouvrez la console du navigateur (F12)
2. Rechargez la page
3. Cherchez le message : `X réservation(s) marquée(s) comme terminée(s)`

## Identifiants de test

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | `admin@kiteschool.com` | `admin123` |
| Instructeur | `instructor@kiteschool.com` | `instructor123` |
| Étudiant | `student@kiteschool.com` | `student123` |
| Étudiant 2 | `student2@kiteschool.com` | `student123` |

## Architecture

### Loaders React Router v6.4+

Les données sont chargées AVANT le rendu du composant :

```typescript
// src/pages/InstructorCalendar/loader.ts
export async function instructorCalendarLoader(instructorId: number) {
  return {
    timeSlots: await db.timeSlots.where('instructorId').equals(instructorId).sortBy('date'),
    courses: await db.courses.where('instructorId').equals(instructorId).toArray(),
    reservations: await db.reservations.toArray(),
  };
}
```

### Hooks personnalisés

Structure type avec gestion d'erreur et loading :

```typescript
export function useReservationHistory(userId?: number): UseReservationHistoryReturn {
  const [history, setHistory] = useState<ReservationHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // ... opérations Dexie
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to load');
      setError(errorObj);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  return { history, isLoading, error, loadHistory, ... };
}
```

### Accessibilité

- `aria-label` sur les éléments interactifs
- `role="alert"` sur les messages d'erreur
- `aria-busy="true"` sur les zones en chargement
- Focus management avec `focus-visible`
- Navigation clavier sur les listes

## Notes

- TypeScript strict : zéro `any`, types explicites partout
- Tailwind CSS uniquement : zéro fichier `.css` custom
- Dexie.js : opérations avec `try/catch`, jamais de `.catch()` silencieux
- Composants fonctionnels uniquement
- Composants < 100 lignes (décomposition si nécessaire)
