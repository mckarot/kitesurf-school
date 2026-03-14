# 🕐 Réstructure des Créneaux - Résumé

**Date** : 14 mars 2026  
**Version** : 9 (migration DB)

---

## 🎯 NOUVELLE ARCHITECTURE

### **1. Admin → Définit les créneaux de l'école**
- Crée les **3 créneaux fixes** par défaut :
  - **Matin 1** : 08:30 - 11:00 (2h30)
  - **Matin 2** : 11:30 - 14:00 (2h30)
  - **Après-midi** : 14:30 - 17:00 (2h30)
- S'appliquent du **Lundi au Samedi**, toute l'année
- Page : `/admin/school-schedule`

### **2. Moniteur → Peut bloquer des créneaux**
- Consulte les créneaux de l'école
- Peut **bloquer** ses propres créneaux (maladie, congés, autre)
- Page : `/instructor/timeslots` → "Mes indisponibilités"

---

## 📊 NOUVELLES TABLES DE BASE DE DONNÉES

### **Table : `schoolSchedule`** (Admin-managed)

```typescript
interface SchoolSchedule {
  id: number;
  dayOfWeek: 1-6;  // 1=Lundi, 2=Mardi, ..., 6=Samedi
  startTime: string;  // "08:30"
  endTime: string;    // "11:00"
  isActive: 0 | 1;
  createdAt: number;
}
```

**18 créneaux par défaut** (3 créneaux × 6 jours)

---

### **Table : `instructorAvailability`** (Instructor-managed)

```typescript
interface InstructorAvailability {
  id: number;
  instructorId: number;
  date: string;  // "YYYY-MM-DD"
  scheduleId: number;  // Référence à SchoolSchedule
  isAvailable: 0 | 1;  // 0 = bloqué, 1 = disponible
  reason?: string;  // "Maladie", "Congés", "Autre"
  createdAt: number;
}
```

**Index composite** : `[instructorId+date+scheduleId]`

---

## 📁 FICHIERS CRÉÉS

| Fichier | Description |
|---------|-------------|
| `src/db/migrations/v9.ts` | Migration DB - crée les 2 tables |
| `src/hooks/useSchoolSchedule.ts` | Hook pour gérer les créneaux école |
| `src/hooks/useInstructorAvailability.ts` | Hook pour gérer les indisponibilités |
| `src/pages/Admin/SchoolSchedule/index.tsx` | Page Admin - gestion créneaux école |
| `src/pages/Admin/SchoolSchedule/SchoolScheduleForm.tsx` | Formulaire création/édition |
| `src/pages/Admin/SchoolSchedule/SchoolScheduleList.tsx` | Liste des créneaux par jour |
| `src/pages/TimeSlots/InstructorAvailabilityForm.tsx` | Formulaire d'indisponibilité |
| `src/pages/TimeSlots/InstructorAvailabilityList.tsx` | Liste des créneaux avec statut |

---

## 📁 FICHIERS MODIFIÉS

| Fichier | Modifications |
|---------|---------------|
| `src/types/index.ts` | Ajout interfaces `SchoolSchedule`, `InstructorAvailability` |
| `src/db/db.ts` | Version 9 ajoutée |
| `src/utils/seed.ts` | 18 créneaux par défaut initialisés |
| `src/router.tsx` | Route `/admin/school-schedule` ajoutée |
| `src/pages/TimeSlots/index.tsx` | Transformé en "Mes indisponibilités" |
| `src/pages/Instructor/index.tsx` | Lien mis à jour |
| `src/pages/Admin/index.tsx` | Bouton "Emploi du temps" ajouté |

---

## 🎨 UI CHANGES

### **Admin**
- **Nouvelle page** : `/admin/school-schedule`
  - Liste des créneaux par jour (Lundi → Samedi)
  - Créer, modifier, supprimer des créneaux
  - Bouton "Réinitialiser les créneaux par défaut"

### **Moniteur**
- **Page transformée** : `/instructor/timeslots`
  - Titre : "Mes indisponibilités"
  - Sélecteur de date
  - Liste des créneaux de l'école pour la date sélectionnée
  - Bouton "Indisponible" pour chaque créneau
  - Formulaire avec motifs prédéfinis :
    - Maladie
    - Congés
    - Formation
    - Rendez-vous médical
    - Empêchement personnel
    - Autre

---

## 🔄 BUSINESS LOGIC

### **Création de CourseSession**
```typescript
// Les sessions sont créées basées sur SchoolSchedule
// Seuls les créneaux disponibles (isAvailable=1) peuvent avoir des sessions

const availableSlots = await db.schoolSchedule
  .where('dayOfWeek')
  .equals(dayOfWeek)
  .and(slot => slot.isActive === 1)
  .filter(async slot => {
    const availability = await db.instructorAvailability
      .where('[instructorId+date+scheduleId]')
      .equals([instructorId, date, slot.id])
      .first();
    return !availability || availability.isAvailable === 1;
  });
```

---

## 📊 DONNÉES PAR DÉFAUT

### **18 School Schedules initialisés**

```
Lundi (dayOfWeek=1):
  - 08:30 - 11:00
  - 11:30 - 14:00
  - 14:30 - 17:00

Mardi (dayOfWeek=2):
  - 08:30 - 11:00
  - 11:30 - 14:00
  - 14:30 - 17:00

Mercredi (dayOfWeek=3):
  - 08:30 - 11:00
  - 11:30 - 14:00
  - 14:30 - 17:00

Jeudi (dayOfWeek=4):
  - 08:30 - 11:00
  - 11:30 - 14:00
  - 14:30 - 17:00

Vendredi (dayOfWeek=5):
  - 08:30 - 11:00
  - 11:30 - 14:00
  - 14:30 - 17:00

Samedi (dayOfWeek=6):
  - 08:30 - 11:00
  - 11:30 - 14:00
  - 14:30 - 17:00
```

---

## ✅ CHECKLIST

- ✅ Types ajoutés (`SchoolSchedule`, `InstructorAvailability`)
- ✅ Migration v9 créée
- ✅ Tables créées dans `db.ts`
- ✅ Hook `useSchoolSchedule` créé
- ✅ Hook `useInstructorAvailability` créé
- ✅ Page Admin `SchoolSchedule` créée
- ✅ Page Moniteur `TimeSlots` transformée
- ✅ Seed mis à jour avec 18 créneaux
- ✅ Routes ajoutées
- ✅ Build validé (TypeScript strict)
- ✅ Documentation mise à jour

---

## 🚀 PROCHAINES ÉTAPES

1. **Réinitialiser la base de données** pour initialiser les 18 créneaux
2. **Tester la page Admin** : `/admin/school-schedule`
3. **Tester la page Moniteur** : `/instructor/timeslots`
4. **Vérifier que les créneaux s'affichent** correctement
5. **Tester le blocage d'un créneau** par un moniteur

---

## 📝 NOTES

- **Migration automatique** : La version 9 sera appliquée automatiquement
- **Données existantes** : Les anciennes tables `timeSlots` restent intactes
- **Rétrocompatibilité** : Les anciennes sessions utilisent toujours `courseSessions`
- **Future évolution** : Les sessions de cours pourront être créées automatiquement basées sur `schoolSchedule`

---

**Document créé le** : 14 mars 2026  
**Version** : 1.0  
**Statut** : ✅ IMPLÉMENTÉ
