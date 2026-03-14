// src/utils/seed.ts

import { db } from '../db/db';
import type { User, Course, Reservation, CourseSession, TimeSlot, UserConsent, CourseCredit } from '../types';

export async function seedDatabase(): Promise<void> {
  const userCount = await db.users.count();

  if (userCount > 0) {
    // Database already seeded
    return;
  }

  const users: User[] = [
    {
      id: 1,
      email: 'admin@kiteschool.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isActive: 1,
      createdAt: Date.now(),
      photo: '',
    },
    {
      id: 2,
      email: 'instructor@kiteschool.com',
      password: 'instructor123',
      firstName: 'John',
      lastName: 'Waves',
      role: 'instructor',
      isActive: 1,
      createdAt: Date.now(),
      photo: '',
    },
    {
      id: 3,
      email: 'student@kiteschool.com',
      password: 'student123',
      firstName: 'Alice',
      lastName: 'Surf',
      role: 'student',
      isActive: 1,
      createdAt: Date.now(),
      photo: '',
    },
    {
      id: 4,
      email: 'student2@kiteschool.com',
      password: 'student123',
      firstName: 'Bob',
      lastName: 'Kite',
      role: 'student',
      isActive: 1,
      createdAt: Date.now(),
      photo: '',
    },
  ];

  const courses: Course[] = [
    {
      id: 1,
      instructorId: 2,
      title: 'Introduction au Kitesurf',
      description: 'Apprenez les bases du kitesurf en toute sécurité.',
      level: 'beginner',
      maxStudents: 6,
      price: 150,
      isActive: 1,
      createdAt: Date.now(),
    },
    {
      id: 2,
      instructorId: 2,
      title: 'Perfectionnement Kitesurf',
      description: 'Améliorez votre technique et apprenez les figures intermédiaires.',
      level: 'intermediate',
      maxStudents: 4,
      price: 200,
      isActive: 1,
      createdAt: Date.now(),
    },
    {
      id: 3,
      instructorId: 2,
      title: 'Kitesurf Avancé',
      description: 'Maîtrisez les figures avancées et le freestyle.',
      level: 'advanced',
      maxStudents: 3,
      price: 250,
      isActive: 1,
      createdAt: Date.now(),
    },
  ];

  const courseSessions: CourseSession[] = [
    // Créneaux fixes de 2h30 pour chaque cours
    // Matin 1: 08:30 - 11:00
    // Matin 2: 11:30 - 14:00
    // Après-midi: 14:30 - 17:00
    
    // Cours 1 - Introduction au Kitesurf
    {
      id: 1,
      courseId: 1,
      date: '2026-03-15',
      startTime: '08:30',
      endTime: '11:00',
      location: 'Plage de la Baule',
      maxStudents: 6,
      isActive: 1,
      createdAt: Date.now(),
    },
    {
      id: 2,
      courseId: 1,
      date: '2026-03-15',
      startTime: '11:30',
      endTime: '14:00',
      location: 'Plage de la Baule',
      maxStudents: 6,
      isActive: 1,
      createdAt: Date.now(),
    },
    {
      id: 3,
      courseId: 1,
      date: '2026-03-15',
      startTime: '14:30',
      endTime: '17:00',
      location: 'Plage de la Baule',
      maxStudents: 6,
      isActive: 1,
      createdAt: Date.now(),
    },
    {
      id: 4,
      courseId: 1,
      date: '2026-03-16',
      startTime: '08:30',
      endTime: '11:00',
      location: 'Plage de la Baule',
      maxStudents: 6,
      isActive: 1,
      createdAt: Date.now(),
    },
    {
      id: 5,
      courseId: 1,
      date: '2026-03-16',
      startTime: '14:30',
      endTime: '17:00',
      location: 'Plage de la Baule',
      maxStudents: 6,
      isActive: 1,
      createdAt: Date.now(),
    },
    
    // Cours 2 - Perfectionnement Kitesurf
    {
      id: 6,
      courseId: 2,
      date: '2026-03-17',
      startTime: '08:30',
      endTime: '11:00',
      location: 'Spot de la Torche',
      maxStudents: 4,
      isActive: 1,
      createdAt: Date.now(),
    },
    {
      id: 7,
      courseId: 2,
      date: '2026-03-17',
      startTime: '11:30',
      endTime: '14:00',
      location: 'Spot de la Torche',
      maxStudents: 4,
      isActive: 1,
      createdAt: Date.now(),
    },
    {
      id: 8,
      courseId: 2,
      date: '2026-03-17',
      startTime: '14:30',
      endTime: '17:00',
      location: 'Spot de la Torche',
      maxStudents: 4,
      isActive: 1,
      createdAt: Date.now(),
    },
    
    // Cours 3 - Kitesurf Avancé
    {
      id: 9,
      courseId: 3,
      date: '2026-03-18',
      startTime: '08:30',
      endTime: '11:00',
      location: 'Spot de la Torche',
      maxStudents: 3,
      isActive: 1,
      createdAt: Date.now(),
    },
    {
      id: 10,
      courseId: 3,
      date: '2026-03-18',
      startTime: '11:30',
      endTime: '14:00',
      location: 'Spot de la Torche',
      maxStudents: 3,
      isActive: 1,
      createdAt: Date.now(),
    },
    {
      id: 11,
      courseId: 3,
      date: '2026-03-18',
      startTime: '14:30',
      endTime: '17:00',
      location: 'Spot de la Torche',
      maxStudents: 3,
      isActive: 1,
      createdAt: Date.now(),
    },
  ];

  const reservations: Reservation[] = [
    {
      id: 1,
      studentId: 4,
      courseId: 1,
      status: 'confirmed',
      createdAt: Date.now(),
    },
  ];

  // TimeSlots for instructor (id: 2) - including past and future dates
  const timeSlots: TimeSlot[] = [
    {
      id: 1,
      instructorId: 2,
      date: '2026-03-13', // Past date (yesterday)
      startTime: '09:00',
      endTime: '12:00',
      isAvailable: 1,
      createdAt: Date.now(),
    },
    {
      id: 2,
      instructorId: 2,
      date: '2026-03-13',
      startTime: '14:00',
      endTime: '17:00',
      isAvailable: 0, // Booked
      createdAt: Date.now(),
    },
    {
      id: 3,
      instructorId: 2,
      date: '2026-03-14', // Today
      startTime: '09:00',
      endTime: '12:00',
      isAvailable: 1,
      createdAt: Date.now(),
    },
    {
      id: 4,
      instructorId: 2,
      date: '2026-03-14',
      startTime: '14:00',
      endTime: '17:00',
      isAvailable: 1,
      createdAt: Date.now(),
    },
    {
      id: 5,
      instructorId: 2,
      date: '2026-03-15', // Tomorrow
      startTime: '09:00',
      endTime: '12:00',
      isAvailable: 1,
      createdAt: Date.now(),
    },
    {
      id: 6,
      instructorId: 2,
      date: '2026-03-15',
      startTime: '14:00',
      endTime: '17:00',
      isAvailable: 1,
      createdAt: Date.now(),
    },
    {
      id: 7,
      instructorId: 2,
      date: '2026-03-16',
      startTime: '09:00',
      endTime: '12:00',
      isAvailable: 1,
      createdAt: Date.now(),
    },
    {
      id: 8,
      instructorId: 2,
      date: '2026-03-17',
      startTime: '09:00',
      endTime: '13:00',
      isAvailable: 1,
      createdAt: Date.now(),
    },
    {
      id: 9,
      instructorId: 2,
      date: '2026-03-18',
      startTime: '08:00',
      endTime: '12:00',
      isAvailable: 1,
      createdAt: Date.now(),
    },
    {
      id: 10,
      instructorId: 2,
      date: '2026-03-19',
      startTime: '09:00',
      endTime: '12:00',
      isAvailable: 1,
      createdAt: Date.now(),
    },
    {
      id: 11,
      instructorId: 2,
      date: '2026-03-20',
      startTime: '09:00',
      endTime: '12:00',
      isAvailable: 1,
      createdAt: Date.now(),
    },
  ];

  // ============================================
  // CourseCredits - Crédits de cours pour les étudiants
  // 1 séance = 2h30 de cours
  // ============================================
  const courseCredits: CourseCredit[] = [
    {
      id: 1,
      studentId: 3, // Alice
      sessions: 4, // 10 heures = 4 séances (10 / 2.5 = 4)
      usedSessions: 0,
      status: 'active',
      expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year from now
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: 2,
      studentId: 4, // Bob
      sessions: 2, // 5 heures = 2 séances (5 / 2.5 = 2)
      usedSessions: 0,
      status: 'active',
      expiresAt: Date.now() + 180 * 24 * 60 * 60 * 1000, // 6 months from now
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ];

  // ============================================
  // UserConsents - Données de consentements RGPD
  // ============================================
  const userConsents: UserConsent[] = [
    {
      id: 1,
      userId: 3, // Alice
      consentType: 'marketing_emails',
      status: 'accepted',
      version: '2.0',
      acceptedAt: Date.now() - 30 * 24 * 60 * 60 * 1000, // Il y a 30 jours
      updatedAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
    {
      id: 2,
      userId: 3, // Alice
      consentType: 'photos_marketing',
      status: 'refused',
      version: '1.5',
      acceptedAt: Date.now() - 10 * 24 * 60 * 60 * 1000, // Il y a 10 jours
      updatedAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
    {
      id: 3,
      userId: 3, // Alice
      consentType: 'analytics_cookies',
      status: 'accepted',
      version: '1.0',
      acceptedAt: Date.now() - 30 * 24 * 60 * 60 * 1000, // Il y a 30 jours
      updatedAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
    {
      id: 4,
      userId: 4, // Bob
      consentType: 'marketing_emails',
      status: 'refused',
      version: '2.0',
      acceptedAt: Date.now() - 5 * 24 * 60 * 60 * 1000, // Il y a 5 jours
      updatedAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    },
    {
      id: 5,
      userId: 4, // Bob
      consentType: 'analytics_cookies',
      status: 'accepted',
      version: '1.0',
      acceptedAt: Date.now(),
      updatedAt: Date.now(),
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    },
  ];

  await db.users.bulkAdd(users);
  await db.courses.bulkAdd(courses);
  await db.courseSessions.bulkAdd(courseSessions);
  await db.reservations.bulkAdd(reservations);
  await db.timeSlots.bulkAdd(timeSlots);
  await db.courseCredits.bulkAdd(courseCredits);
  await db.userConsents.bulkAdd(userConsents);

  console.log('Database seeded successfully!');
}
