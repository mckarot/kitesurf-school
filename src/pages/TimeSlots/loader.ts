// src/pages/TimeSlots/loader.ts

import { db } from '../../db/db';
import type { TimeSlot } from '../../types';

export async function timeSlotsLoader(): Promise<TimeSlot[]> {
  try {
    return await db.timeSlots.orderBy('createdAt').reverse().toArray();
  } catch {
    return [];
  }
}
