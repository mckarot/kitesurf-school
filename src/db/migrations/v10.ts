// src/db/migrations/v10.ts
// Migration v10: Ajout d'index composites sur courseSessions pour la recherche par date et horaire

import type { KiteSurfDB } from '../db';

export function configureV10Migration(db: KiteSurfDB): void {
  db.version(10).stores({
    courseSessions: '++id, courseId, [courseId+date+startTime], isActive, createdAt',
  }).upgrade(async (tx) => {
    console.log('Database migrated to version 10: Added composite index [courseId+date+startTime] on courseSessions');
    
    // Optionnel: Recréer les sessions pour tous les cours existants
    const courses = await tx.table('courses').toArray();
    console.log(`Found ${courses.length} courses, sessions will be generated on-demand`);
  });
}
