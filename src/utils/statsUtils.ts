// src/utils/statsUtils.ts

import type { StatsData, Course, Reservation, User } from '../types';

/**
 * Calculate total revenue from reservations and courses
 */
export function calculateTotalRevenue(
  reservations: Reservation[],
  courses: Course[]
): number {
  return reservations
    .filter((r) => r.status === 'confirmed' || r.status === 'completed')
    .reduce((total, reservation) => {
      const course = courses.find((c) => c.id === reservation.courseId);
      return total + (course?.price || 0);
    }, 0);
}

/**
 * Count active students (students with at least one non-cancelled reservation)
 */
export function countActiveStudents(
  reservations: Reservation[],
  users: User[]
): number {
  const studentIds = new Set(
    reservations
      .filter((r) => r.status !== 'cancelled')
      .map((r) => r.studentId)
  );
  
  return Array.from(studentIds).filter((id) => {
    const user = users.find((u) => u.id === id);
    return user && user.role === 'student' && user.isActive === 1;
  }).length;
}

/**
 * Count active courses
 */
export function countActiveCourses(courses: Course[]): number {
  return courses.filter((c) => c.isActive === 1).length;
}

/**
 * Group reservations by course level
 */
export function groupReservationsByLevel(
  reservations: Reservation[],
  courses: Course[]
): { level: string; count: number }[] {
  const levelMap = new Map<string, number>();
  
  reservations.forEach((reservation) => {
    if (reservation.status === 'cancelled') return;
    
    const course = courses.find((c) => c.id === reservation.courseId);
    if (!course) return;
    
    const levelKey = course.level;
    levelMap.set(levelKey, (levelMap.get(levelKey) || 0) + 1);
  });
  
  return Array.from(levelMap.entries()).map(([level, count]) => ({
    level: level === 'beginner' ? 'Débutant' : level === 'intermediate' ? 'Intermédiaire' : 'Avancé',
    count,
  }));
}

/**
 * Group reservations by status
 */
export function groupReservationsByStatus(
  reservations: Reservation[]
): { status: string; count: number }[] {
  const statusMap = new Map<string, number>();
  
  reservations.forEach((reservation) => {
    statusMap.set(reservation.status, (statusMap.get(reservation.status) || 0) + 1);
  });
  
  return Array.from(statusMap.entries()).map(([status, count]) => ({
    status: status === 'pending' ? 'En attente' : status === 'confirmed' ? 'Confirmé' : status === 'cancelled' ? 'Annulé' : 'Terminé',
    count,
  }));
}

/**
 * Calculate revenue by month
 */
export function calculateRevenueByMonth(
  reservations: Reservation[],
  courses: Course[],
  monthsCount: number = 6
): { month: string; revenue: number }[] {
  const now = new Date();
  const monthMap = new Map<string, number>();
  
  // Initialize months
  for (let i = monthsCount - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthMap.set(key, 0);
  }
  
  // Calculate revenue per month
  reservations
    .filter((r) => r.status === 'confirmed' || r.status === 'completed')
    .forEach((reservation) => {
      const course = courses.find((c) => c.id === reservation.courseId);
      if (!course) return;
      
      const date = new Date(reservation.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (monthMap.has(key)) {
        monthMap.set(key, (monthMap.get(key) || 0) + course.price);
      }
    });
  
  // Format for display
  return Array.from(monthMap.entries()).map(([key, revenue]) => {
    const [year, month] = key.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return {
      month: date.toLocaleDateString('fr-FR', { month: 'short' }),
      revenue,
    };
  });
}

/**
 * Build complete stats data object
 */
export function buildStatsData(
  reservations: Reservation[],
  courses: Course[],
  users: User[]
): StatsData {
  return {
    totalReservations: reservations.filter((r) => r.status !== 'cancelled').length,
    totalRevenue: calculateTotalRevenue(reservations, courses),
    activeStudents: countActiveStudents(reservations, users),
    activeCourses: countActiveCourses(courses),
    reservationsByLevel: groupReservationsByLevel(reservations, courses),
    reservationsByStatus: groupReservationsByStatus(reservations),
    revenueByMonth: calculateRevenueByMonth(reservations, courses),
  };
}

/**
 * Filter reservations by date range
 */
export function filterReservationsByDateRange(
  reservations: Reservation[],
  startDate?: string,
  endDate?: string
): Reservation[] {
  if (!startDate && !endDate) {
    return reservations;
  }
  
  return reservations.filter((r) => {
    const reservationDate = new Date(r.createdAt).toISOString().split('T')[0];
    
    if (startDate && reservationDate < startDate) {
      return false;
    }
    
    if (endDate && reservationDate > endDate) {
      return false;
    }
    
    return true;
  });
}

/**
 * Calculate percentage change between two values
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return Math.round(((current - previous) / previous) * 100);
}
