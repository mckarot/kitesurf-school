// src/utils/dateUtils.ts

/**
 * Format a date string (YYYY-MM-DD) to a readable French format
 * Example: "2026-03-15" -> "15 mars 2026"
 */
export function formatDateFr(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00'); // Add time to avoid timezone issues
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Format a date to short French format
 * Example: "2026-03-15" -> "15/03/2026"
 */
export function formatDateShort(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('fr-FR');
}

/**
 * Format time string to readable format
 * Example: "09:00" -> "09h00"
 */
export function formatTime(timeString: string): string {
  const [hours, minutes] = timeString.split(':');
  return `${hours}h${minutes}`;
}

/**
 * Get the start of the week (Monday) for a given date
 */
export function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get the end of the week (Sunday) for a given date
 */
export function getEndOfWeek(date: Date): Date {
  const start = getStartOfWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

/**
 * Get all days in a week as ISO date strings
 */
export function getWeekDays(date: Date): string[] {
  const start = getStartOfWeek(date);
  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

/**
 * Get the current week's days
 */
export function getCurrentWeekDays(): string[] {
  return getWeekDays(new Date());
}

/**
 * Add days to a date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Check if a date is today
 */
export function isToday(dateString: string): boolean {
  const today = new Date().toISOString().split('T')[0];
  return dateString === today;
}

/**
 * Check if a date is in the past
 */
export function isPast(dateString: string): boolean {
  const today = new Date().toISOString().split('T')[0];
  return dateString < today;
}

/**
 * Get month name in French
 */
export function getMonthNameFr(date: Date): string {
  return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
}

/**
 * Get day name in French (short)
 */
export function getDayNameFr(date: Date): string {
  return date.toLocaleDateString('fr-FR', { weekday: 'short' });
}

/**
 * Get day number
 */
export function getDayNumber(date: Date): number {
  return date.getDate();
}

/**
 * Format a date range
 */
export function formatDateRange(start: string, end: string): string {
  const startDate = new Date(start + 'T00:00:00');
  const endDate = new Date(end + 'T00:00:00');
  
  if (startDate.getMonth() === endDate.getMonth() && startDate.getFullYear() === endDate.getFullYear()) {
    return `${startDate.getDate()} - ${endDate.getDate()} ${startDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`;
  }
  
  return `${formatDateShort(start)} au ${formatDateShort(end)}`;
}

/**
 * Get the first day of a month
 */
export function getFirstDayOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Get the last day of a month
 */
export function getLastDayOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

/**
 * Get all days in a month
 */
export function getDaysInMonth(date: Date): string[] {
  const days: string[] = [];
  const firstDay = getFirstDayOfMonth(date);
  const lastDay = getLastDayOfMonth(date);
  
  for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
    days.push(d.toISOString().split('T')[0]);
  }
  
  return days;
}
