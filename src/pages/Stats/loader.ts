// src/pages/Stats/loader.ts

import { db } from '../../db/db';
import type { Reservation, Course, User } from '../../types';

export interface StatsLoaderData {
  reservations: Reservation[];
  courses: Course[];
  users: User[];
}

export async function statsLoader(): Promise<StatsLoaderData> {
  try {
    const [reservations, courses, users] = await Promise.all([
      db.reservations.toArray(),
      db.courses.toArray(),
      db.users.toArray(),
    ]);
    return { reservations, courses, users };
  } catch {
    return { reservations: [], courses: [], users: [] };
  }
}
