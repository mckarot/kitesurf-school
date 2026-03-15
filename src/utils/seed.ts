// src/utils/seed.ts
// Initialisation de la base de données avec des données de test
// Ajout de réservations pending et notifications pour tester la validation

import { db } from '../db/db';
import type { User, Course, Reservation, CourseSession, TimeSlot, UserConsent, CourseCredit, SchoolSchedule, Notification } from '../types';

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
      title: 'Cours Collectif',
      description: 'Apprenez en groupe dans une ambiance conviviale. Matériel inclus, briefing théorique et pratique encadrée.',
      level: 'beginner',
      maxStudents: 6,
      price: 70,
      isActive: 1,
      createdAt: Date.now(),
    },
    {
      id: 2,
      instructorId: 2,
      title: 'Cours Particulier',
      description: 'Un accompagnement 100% personnalisé avec moniteur dédié. Matériel premium et vidéo analyse.',
      level: 'beginner',
      maxStudents: 1,
      price: 120,
      isActive: 1,
      createdAt: Date.now(),
    },
    {
      id: 3,
      instructorId: 2,
      title: 'Cours Duo',
      description: "Partagez l'expérience à deux. Attention personnalisée et progression en duo.",
      level: 'beginner',
      maxStudents: 2,
      price: 95,
      isActive: 1,
      createdAt: Date.now(),
    },
  ];

  const courseSessions: CourseSession[] = [
    // Créneaux fixes de 2h30 pour chaque cours
    // Matin 1: 08:30 - 11:00
    // Matin 2: 11:30 - 14:00
    // Après-midi: 14:30 - 17:00

    // Cours 1 - Cours Collectif (6 élèves max)
    {
      id: 1,
      courseId: 1,
      date: '2026-03-20',
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
      date: '2026-03-20',
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
      date: '2026-03-20',
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
      date: '2026-03-21',
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
      date: '2026-03-21',
      startTime: '14:30',
      endTime: '17:00',
      location: 'Plage de la Baule',
      maxStudents: 6,
      isActive: 1,
      createdAt: Date.now(),
    },
    {
      id: 6,
      courseId: 1,
      date: '2026-03-22',
      startTime: '08:30',
      endTime: '11:00',
      location: 'Plage de la Baule',
      maxStudents: 6,
      isActive: 1,
      createdAt: Date.now(),
    },

    // Cours 2 - Cours Particulier (1 élève max)
    {
      id: 7,
      courseId: 2,
      date: '2026-03-20',
      startTime: '08:30',
      endTime: '11:00',
      location: 'Plage de la Baule',
      maxStudents: 1,
      isActive: 1,
      createdAt: Date.now(),
    },
    {
      id: 8,
      courseId: 2,
      date: '2026-03-20',
      startTime: '11:30',
      endTime: '14:00',
      location: 'Plage de la Baule',
      maxStudents: 1,
      isActive: 1,
      createdAt: Date.now(),
    },
    {
      id: 9,
      courseId: 2,
      date: '2026-03-21',
      startTime: '08:30',
      endTime: '11:00',
      location: 'Plage de la Baule',
      maxStudents: 1,
      isActive: 1,
      createdAt: Date.now(),
    },
    {
      id: 10,
      courseId: 2,
      date: '2026-03-21',
      startTime: '14:30',
      endTime: '17:00',
      location: 'Plage de la Baule',
      maxStudents: 1,
      isActive: 1,
      createdAt: Date.now(),
    },

    // Cours 3 - Cours Duo (2 élèves max)
    {
      id: 11,
      courseId: 3,
      date: '2026-03-20',
      startTime: '08:30',
      endTime: '11:00',
      location: 'Plage de la Baule',
      maxStudents: 2,
      isActive: 1,
      createdAt: Date.now(),
    },
    {
      id: 12,
      courseId: 3,
      date: '2026-03-20',
      startTime: '11:30',
      endTime: '14:00',
      location: 'Plage de la Baule',
      maxStudents: 2,
      isActive: 1,
      createdAt: Date.now(),
    },
    {
      id: 13,
      courseId: 3,
      date: '2026-03-21',
      startTime: '08:30',
      endTime: '11:00',
      location: 'Plage de la Baule',
      maxStudents: 2,
      isActive: 1,
      createdAt: Date.now(),
    },
    {
      id: 14,
      courseId: 3,
      date: '2026-03-21',
      startTime: '14:30',
      endTime: '17:00',
      location: 'Plage de la Baule',
      maxStudents: 2,
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
    // Réservations en attente pour tester la page de validation
    {
      id: 2,
      studentId: 3, // Alice
      courseId: 1, // Cours Collectif
      sessionId: 1, // Session du 2026-03-20 08:30-11:00
      status: 'pending',
      createdAt: Date.now() - 2 * 60 * 60 * 1000, // Il y a 2 heures
    },
    {
      id: 3,
      studentId: 4, // Bob
      courseId: 2, // Cours Particulier
      sessionId: 7, // Session du 2026-03-20 08:30-11:00
      status: 'pending',
      createdAt: Date.now() - 30 * 60 * 1000, // Il y a 30 minutes
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
  // SchoolSchedule - Emploi du temps de l'école
  // 18 créneaux par défaut (3 créneaux × 6 jours)
  // ============================================
  const schoolSchedules: SchoolSchedule[] = [
    // Lundi (dayOfWeek = 1)
    { id: 1, dayOfWeek: 1, startTime: '08:30', endTime: '11:00', isActive: 1, createdAt: Date.now() },
    { id: 2, dayOfWeek: 1, startTime: '11:30', endTime: '14:00', isActive: 1, createdAt: Date.now() },
    { id: 3, dayOfWeek: 1, startTime: '14:30', endTime: '17:00', isActive: 1, createdAt: Date.now() },
    // Mardi (dayOfWeek = 2)
    { id: 4, dayOfWeek: 2, startTime: '08:30', endTime: '11:00', isActive: 1, createdAt: Date.now() },
    { id: 5, dayOfWeek: 2, startTime: '11:30', endTime: '14:00', isActive: 1, createdAt: Date.now() },
    { id: 6, dayOfWeek: 2, startTime: '14:30', endTime: '17:00', isActive: 1, createdAt: Date.now() },
    // Mercredi (dayOfWeek = 3)
    { id: 7, dayOfWeek: 3, startTime: '08:30', endTime: '11:00', isActive: 1, createdAt: Date.now() },
    { id: 8, dayOfWeek: 3, startTime: '11:30', endTime: '14:00', isActive: 1, createdAt: Date.now() },
    { id: 9, dayOfWeek: 3, startTime: '14:30', endTime: '17:00', isActive: 1, createdAt: Date.now() },
    // Jeudi (dayOfWeek = 4)
    { id: 10, dayOfWeek: 4, startTime: '08:30', endTime: '11:00', isActive: 1, createdAt: Date.now() },
    { id: 11, dayOfWeek: 4, startTime: '11:30', endTime: '14:00', isActive: 1, createdAt: Date.now() },
    { id: 12, dayOfWeek: 4, startTime: '14:30', endTime: '17:00', isActive: 1, createdAt: Date.now() },
    // Vendredi (dayOfWeek = 5)
    { id: 13, dayOfWeek: 5, startTime: '08:30', endTime: '11:00', isActive: 1, createdAt: Date.now() },
    { id: 14, dayOfWeek: 5, startTime: '11:30', endTime: '14:00', isActive: 1, createdAt: Date.now() },
    { id: 15, dayOfWeek: 5, startTime: '14:30', endTime: '17:00', isActive: 1, createdAt: Date.now() },
    // Samedi (dayOfWeek = 6)
    { id: 16, dayOfWeek: 6, startTime: '08:30', endTime: '11:00', isActive: 1, createdAt: Date.now() },
    { id: 17, dayOfWeek: 6, startTime: '11:30', endTime: '14:00', isActive: 1, createdAt: Date.now() },
    { id: 18, dayOfWeek: 6, startTime: '14:30', endTime: '17:00', isActive: 1, createdAt: Date.now() },
  ];

  // ============================================
  // CourseCredits - Crédits de cours pour les étudiants
  // Correspond aux packs de la page Courses
  // Pack Découverte: 3 séances = 180€ (au lieu de 210€)
  // Pack Progression: 6 séances = 330€ (au lieu de 420€)
  // Pack Expert: 10 séances = 500€ (au lieu de 700€)
  // 1 séance = 2h30 de cours
  // ============================================
  const courseCredits: CourseCredit[] = [
    {
      id: 1,
      studentId: 3, // Alice
      sessions: 6, // Pack Progression
      usedSessions: 0,
      status: 'active',
      expiresAt: Date.now() + 60 * 24 * 60 * 60 * 1000, // 2 months from now
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: 2,
      studentId: 4, // Bob
      sessions: 3, // Pack Découverte
      usedSessions: 0,
      status: 'active',
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 1 month from now
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

  // ============================================
  // Notifications - Notifications de test
  // ============================================
  const notifications: Notification[] = [
    {
      id: 1,
      userId: 3, // Alice
      type: 'reservation_pending',
      title: 'Réservation en attente',
      message: 'Votre réservation pour "Cours Collectif" est en attente de confirmation.',
      read: 0,
      reservationId: 2,
      createdAt: Date.now() - 2 * 60 * 60 * 1000,
    },
    {
      id: 2,
      userId: 4, // Bob
      type: 'reservation_pending',
      title: 'Réservation en attente',
      message: 'Votre réservation pour "Cours Particulier" est en attente de confirmation.',
      read: 0,
      reservationId: 3,
      createdAt: Date.now() - 30 * 60 * 1000,
    },
    {
      id: 3,
      userId: 3, // Alice
      type: 'credit_added',
      title: 'Crédits ajoutés',
      message: '6 séances ont été ajoutées à votre compte (Pack Progression).',
      read: 1,
      createdAt: Date.now() - 60 * 24 * 60 * 60 * 1000, // Il y a 60 jours
    },
  ];

  await db.users.bulkAdd(users);
  await db.courses.bulkAdd(courses);
  await db.courseSessions.bulkAdd(courseSessions);
  await db.reservations.bulkAdd(reservations);
  await db.timeSlots.bulkAdd(timeSlots);
  await db.schoolSchedule.bulkAdd(schoolSchedules);
  await db.courseCredits.bulkAdd(courseCredits);
  await db.userConsents.bulkAdd(userConsents);
  await db.notifications.bulkAdd(notifications);

  console.log('Database seeded successfully!');
  console.log(`Initialized ${schoolSchedules.length} default school schedules`);
  console.log(`Created ${notifications.length} test notifications`);
  console.log(`Created ${reservations.filter(r => r.status === 'pending').length} pending reservations for testing`);
}
