// src/db/db.ts

import Dexie from 'dexie';
import type { Table } from 'dexie';
import type {
  User,
  Course,
  Reservation,
  CourseSession,
  TimeSlot,
  UserPhysicalData,
  UserHealthData,
  UserProgression,
  UserTransaction,
  CourseCredit,
  DeletionRequest,
  UserConsent,
  SchoolSchedule,
  InstructorAvailability,
  Notification,
  UserWallet,
  CoursePricing
} from '../types';
import { configureV5Migration } from './migrations/v5';
import { configureV6Migration } from './migrations/v6';
import { configureV7Migration } from './migrations/v7';
import { configureV8Migration } from './migrations/v8';
import { configureV9Migration } from './migrations/v9';
import { configureV10Migration } from './migrations/v10';
import { configureV13Migration } from './migrations/v13';

export class KiteSurfDB extends Dexie {
  users!: Table<User, number>;
  courses!: Table<Course, number>;
  reservations!: Table<Reservation, number>;
  courseSessions!: Table<CourseSession, number>;
  timeSlots!: Table<TimeSlot, number>;
  userPhysicalData!: Table<UserPhysicalData, number>;
  userHealthData!: Table<UserHealthData, number>;
  userProgression!: Table<UserProgression, number>;
  transactions!: Table<UserTransaction, number>;
  courseCredits!: Table<CourseCredit, number>;
  deletionRequests!: Table<DeletionRequest, number>;
  userConsents!: Table<UserConsent, number>;
  schoolSchedule!: Table<SchoolSchedule, number>;
  instructorAvailability!: Table<InstructorAvailability, number>;
  notifications!: Table<Notification, number>;
  userWallets!: Table<UserWallet, number>;
  coursePricing!: Table<CoursePricing, number>;

  constructor() {
    super('KiteSurfSchoolDB');

    // Version 1: Initial schema
    this.version(1).stores({
      users: '++id, email, role, isActive, createdAt',
      courses: '++id, instructorId, level, isActive, createdAt',
      reservations: '++id, studentId, courseId, status, createdAt',
      courseSessions: '++id, courseId, isActive, createdAt',
    });

    // Version 2: Add timeSlots table for instructor availability
    this.version(2).stores({
      users: '++id, email, role, isActive, createdAt',
      courses: '++id, instructorId, level, isActive, createdAt',
      reservations: '++id, studentId, courseId, status, createdAt',
      courseSessions: '++id, courseId, isActive, createdAt',
      timeSlots: '++id, instructorId, date, isAvailable, createdAt',
    });

    // Version 3: Add user extended data tables for profile export
    this.version(3).stores({
      users: '++id, email, role, isActive, createdAt',
      courses: '++id, instructorId, level, isActive, createdAt',
      reservations: '++id, studentId, courseId, status, createdAt',
      courseSessions: '++id, courseId, isActive, createdAt',
      timeSlots: '++id, instructorId, date, isAvailable, createdAt',
      userPhysicalData: '++id, userId',
      userHealthData: '++id, userId',
      userProgression: '++id, userId',
      transactions: '++id, userId, reservationId, status, createdAt',
    });

    // Version 4: Add courseCredits table for course credit system
    // Index justification:
    // - ++id: Primary key auto-increment
    // - studentId: Optimizes getStudentCredits(studentId) queries
    // - [studentId+status]: Optimizes queries filtering both student and status
    // - status: Optimizes filtering by credit status (active/expired/refunded)
    this.version(4).stores({
      users: '++id, email, role, isActive, createdAt',
      courses: '++id, instructorId, level, isActive, createdAt',
      reservations: '++id, studentId, courseId, status, createdAt',
      courseSessions: '++id, courseId, isActive, createdAt',
      timeSlots: '++id, instructorId, date, isAvailable, createdAt',
      userPhysicalData: '++id, userId',
      userHealthData: '++id, userId',
      userProgression: '++id, userId',
      transactions: '++id, userId, reservationId, status, createdAt',
      courseCredits: '++id, studentId, [studentId+status], status, createdAt',
    }).upgrade(async tx => {
      // Migration: Initialize courseCredits table with empty data
      // No existing data to migrate since this is a new table
      console.log('Database migrated to version 4: courseCredits table added');
    });

    // Version 5: Add deletionRequests table for RGPD Article 17 (Right to be forgotten)
    // Index justification:
    // - ++id: Primary key auto-increment
    // - userId: Optimizes findRequestsByUserId(userId) queries
    // - status: Optimizes cleanup queries filtering by status (confirmed/pending)
    // - requestedAt: Optimizes time-based queries for cleanup scheduling
    // - confirmationToken: Unique index for email confirmation validation
    configureV5Migration(this);

    // Version 6: Add userConsents table for RGPD consent management
    // Index justification:
    // - ++id: Primary key auto-increment
    // - userId: Optimizes getUserConsents(userId) queries - O(log n)
    // - consentType: Optimizes queries filtering by consent type - O(log n)
    // - status: Optimizes filtering by consent status (accepted/refused) - O(log n)
    // - [userId+consentType]: Composite index for getUserConsent(userId, type) - O(log n)
    //   This index is critical for efficiently retrieving the latest consent for a specific type
    configureV6Migration(this);

    // Version 7: Add photo field to users table for profile photo (RGPD Article 16)
    // Index justification:
    // - photo is NOT indexed because it's never used in WHERE/FILTER queries
    // - Always accessed by userId (already indexed by ++id primary key)
    configureV7Migration(this);

    // Version 8: Convert credit system from hours to sessions (1 session = 2h30)
    // - Rename hours → sessions
    // - Rename usedHours → usedSessions
    // - Convert existing data: sessions = hours / 2.5 (rounded down)
    configureV8Migration(this);

    // Version 9: Add schoolSchedule and instructorAvailability tables
    // New schedule management system:
    // - schoolSchedule: Admin-managed base schedule (Monday to Saturday)
    // - instructorAvailability: Instructor-managed unavailability for specific dates
    // Index justification:
    // - schoolSchedule: ++id (primary key), dayOfWeek (filter by day), isActive (filter active slots)
    // - instructorAvailability: ++id (primary key), [instructorId+date+scheduleId] (composite for unique constraint),
    //   instructorId (filter by instructor), date (filter by date), isAvailable (filter availability)
    configureV9Migration(this);

    // Version 10: Add composite index on courseSessions for efficient date/time queries
    // - [courseId+date+startTime]: Required by useAvailableSessions hook for fast lookups
    configureV10Migration(this);

    // Version 11: Add notifications table for admin notifications to students
    // Index justification:
    // - ++id: Primary key auto-increment
    // - userId: Optimizes getUserNotifications(userId) queries - O(log n)
    // - [userId+read]: Optimizes filtering unread notifications for a user
    // - type: Optimizes filtering by notification type
    // - createdAt: Optimizes sorting notifications by date
    this.version(11).stores({
      users: '++id, email, role, isActive, createdAt',
      courses: '++id, instructorId, level, isActive, createdAt',
      reservations: '++id, studentId, courseId, status, createdAt',
      courseSessions: '++id, courseId, isActive, createdAt',
      timeSlots: '++id, instructorId, date, isAvailable, createdAt',
      userPhysicalData: '++id, userId',
      userHealthData: '++id, userId',
      userProgression: '++id, userId',
      transactions: '++id, userId, reservationId, status, createdAt',
      courseCredits: '++id, studentId, [studentId+status], status, createdAt',
      notifications: '++id, userId, [userId+read], type, createdAt',
    });

    // Version 12: Add composite index [courseId+date+startTime] on courseSessions
    // Required by generateCourseSessions to check for existing sessions
    this.version(12).stores({
      users: '++id, email, role, isActive, createdAt',
      courses: '++id, instructorId, level, isActive, createdAt',
      reservations: '++id, studentId, courseId, status, createdAt',
      courseSessions: '++id, courseId, isActive, createdAt, [courseId+date+startTime]',
      timeSlots: '++id, instructorId, date, isAvailable, createdAt',
      userPhysicalData: '++id, userId',
      userHealthData: '++id, userId',
      userProgression: '++id, userId',
      transactions: '++id, userId, reservationId, status, createdAt',
      courseCredits: '++id, studentId, [studentId+status], status, createdAt',
      notifications: '++id, userId, [userId+read], type, createdAt',
    });

    // Version 13: Add userWallets and coursePricing tables for euros system
    // userWallets: Stores euro balance for each user (replaces credit system)
    // coursePricing: Dynamic pricing management by admin (displayed on /courses)
    configureV13Migration(this);
  }
}

export const db = new KiteSurfDB();
