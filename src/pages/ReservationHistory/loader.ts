// src/pages/ReservationHistory/loader.ts

import { db } from '../../db/db';
import type { Reservation } from '../../types';

export async function reservationHistoryLoader(): Promise<Reservation[]> {
  try {
    return await db.reservations.orderBy('createdAt').reverse().toArray();
  } catch {
    return [];
  }
}
