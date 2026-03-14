// src/types/index.ts
// Types principaux de l'application KiteSurf School
// Toutes les interfaces doivent être exportées depuis ce fichier

// ============================================
// USER & AUTHENTICATION
// ============================================

export interface User {
  id: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'instructor' | 'student';
  isActive: 0 | 1;
  createdAt: number;
  photo?: string; // Base64 encoded image (RGPD Article 16)
}

// ============================================
// COURSES & SESSIONS
// ============================================

export interface Course {
  id: number;
  instructorId: number;
  title: string;
  description?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  maxStudents: number;
  price: number;
  isActive: 0 | 1;
  createdAt: number;
}

export interface CourseSession {
  id: number;
  courseId: number;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  maxStudents: number;
  isActive: 0 | 1;
  createdAt: number;
}

export interface TimeSlot {
  id: number;
  instructorId: number;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: 0 | 1;
  createdAt: number;
}

// ============================================
// RESERVATIONS
// ============================================

export interface Reservation {
  id: number;
  studentId: number;
  courseId: number;
  sessionId?: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: number;
}

// ============================================
// USER PROFILE DATA (RGPD Article 16)
// ============================================

export interface UserPhysicalData {
  id: number;
  userId: number;
  height?: number;
  weight?: number;
  shoeSize?: number;
  wetsuitSize?: string;
  harnessSize?: string;
  createdAt: number;
  updatedAt: number;
}

export interface UserHealthData {
  id: number;
  userId: number;
  medicalConditions?: string;
  allergies?: string;
  medications?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  bloodType?: string;
  swimmingLevel?: string;
  medicalCertificateValidUntil?: string;
  createdAt: number;
  updatedAt: number;
}

export interface UserProgression {
  id: number;
  userId: number;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  skills: string[];
  totalHours: number;
  lastSessionDate?: number;
  notes?: string;
  currentIkoLevel?: string;
  validatedSkills: string[];
  createdAt: number;
  updatedAt: number;
}

export interface UserProgressionExport {
  currentIkoLevel?: string;
  validatedSkills: string[];
  sessionHistory: Array<{
    id: number;
    date: string;
    location: string;
    instructorName: string;
    courseTitle: string;
    level: string;
  }>;
}

// ============================================
// TRANSACTIONS & CREDITS
// ============================================

export interface UserTransaction {
  id: number;
  userId: number;
  reservationId?: number;
  amount: number;
  type: 'payment' | 'refund' | 'credit_purchase';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod?: string;
  currency?: string;
  createdAt: number;
}

/**
 * CourseCredit - Crédits de cours pour les étudiants
 *
 * Utilise 'sessions' et 'usedSessions' pour le système de crédits
 * 1 séance = 2h30 de cours
 */
export interface CourseCredit {
  id: number;
  studentId: number;
  sessions: number;
  usedSessions: number;
  status: 'active' | 'expired' | 'refunded';
  expiresAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface StudentBalance {
  totalSessions: number;
  usedSessions: number;
  remainingSessions: number;
}

export type AddCourseCreditInput = Pick<CourseCredit, 'studentId' | 'sessions' | 'expiresAt'> & {
  instructorId?: number;
};
export type AddCreditsFormInput = AddCourseCreditInput;

export interface AdminCreditsLoaderData {
  students: User[];
  credits: CourseCredit[];
  instructors: User[];
}

// ============================================
// RGPD - CONSENT MANAGEMENT (Article 7 + 21)
// ============================================

export type ConsentType = 'marketing_emails' | 'photos_marketing' | 'analytics_cookies';

export type ConsentStatus = 'accepted' | 'refused';

export interface UserConsent {
  id: number;
  userId: number;
  consentType: ConsentType;
  status: ConsentStatus;
  version: string;
  acceptedAt: number;
  updatedAt: number;
  ipAddress?: string;
  userAgent?: string;
}

export interface ConsentSummary {
  marketing_emails: { hasConsent: boolean; isAccepted: boolean; lastUpdatedAt: number | null };
  photos_marketing: { hasConsent: boolean; isAccepted: boolean; lastUpdatedAt: number | null };
  analytics_cookies: { hasConsent: boolean; isAccepted: boolean; lastUpdatedAt: number | null };
}

// ============================================
// RGPD - DELETION REQUESTS (Article 17)
// ============================================

export interface DeletionRequest {
  id: number;
  userId: number;
  requestedAt: number;
  confirmedAt?: number;
  scheduledFor?: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  confirmationToken: string;
  reason?: string;
  emailSentAt?: number;
}

export interface DeletionEligibilityResult {
  canDelete: boolean;
  blockers: string[];
}

export interface DeletionExecutionResult {
  success: boolean;
  error?: string;
}

export interface DeletionConfirmationResult {
  success: boolean;
  error?: string;
  message?: string;
}

// ============================================
// PROFILE EDIT TYPES (RGPD Article 16)
// ============================================

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  photo?: string;
}

export interface UpdatePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string; // Required for password change validation
}

export interface ProfileUpdateResult {
  success: boolean;
  error?: string;
  field?: keyof UpdateProfileInput | 'currentPassword' | 'newPassword' | 'general';
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface PasswordStrengthCriteria {
  hasMinLength: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
  criteria?: PasswordStrengthCriteria;
}

export interface PhotoUploadResult {
  success: boolean;
  photoBase64?: string;
  error?: string;
}

export interface ProfileModificationHistory {
  id: number;
  userId: number;
  modifiedAt: number;
  modifiedFields: string[];
  previousValues: Partial<User>;
  ipAddress?: string;
}

export interface UseProfileEditReturn {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  updateProfile: (data: UpdateProfileInput) => Promise<ProfileUpdateResult>;
  updatePassword: (input: UpdatePasswordInput) => Promise<ProfileUpdateResult>;
  uploadPhoto: (file: File) => Promise<PhotoUploadResult>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

export interface EditProfileFormState {
  firstName: string;
  lastName: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  photo: string | null;
}

export interface EditProfileFormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  photo?: string;
  general?: string;
}

// ============================================
// USER DATA EXPORT (RGPD Article 15)
// ============================================

export interface UserReservationExport {
  id: number;
  courseId: number;
  courseTitle: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  status: Reservation['status'];
  createdAt: number;
}

export interface UserTransactionExport {
  id: number;
  reservationId?: number;
  amount: number;
  currency: string;
  type: 'payment' | 'refund' | 'credit_purchase';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  createdAt: number;
}

export interface UserProfileExport {
  exportedAt: string;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: 'admin' | 'instructor' | 'student';
    createdAt: number;
  };
  physicalData?: {
    weight?: number;
    height?: number;
  };
  healthData?: {
    medicalConditions?: string;
    allergies?: string;
    swimmingLevel?: string;
    medicalCertificateValidUntil?: string;
  };
  progression?: UserProgressionExport;
  reservations: UserReservationExport[];
  transactions: UserTransactionExport[];
}

// ============================================
// STATS & ANALYTICS
// ============================================

export interface StatsData {
  totalReservations: number;
  totalRevenue: number;
  activeStudents: number;
  activeCourses: number;
  reservationsByLevel: { level: string; count: number }[];
  reservationsByStatus: { status: string; count: number }[];
  revenueByMonth: { month: string; revenue: number }[];
}

export interface StatsFilter {
  startDate?: string;
  endDate?: string;
}

// ============================================
// RESERVATION HISTORY
// ============================================

export interface ReservationHistoryItem {
  id: number;
  reservationId: number;
  studentId: number;
  studentName: string;
  courseId: number;
  courseTitle: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  status: Reservation['status'];
  createdAt: number;
}

// ============================================
// ADMIN CREDIT VIEW
// ============================================

export interface AdminCreditView {
  studentId: number;
  studentName: string;
  studentEmail: string;
  totalSessions: number;
  usedSessions: number;
  remainingSessions: number;
  creditsCount: number;
  lastCreditDate?: number;
}

// ============================================
// INPUT TYPES FOR CREATION
// ============================================

export type CreateCourseInput = Omit<Course, 'id' | 'isActive' | 'createdAt'>;

export type CreateReservationInput = Omit<Reservation, 'id' | 'createdAt'>;

export type CreateCourseSessionInput = Omit<CourseSession, 'id' | 'isActive' | 'createdAt'>;

export type CreateTimeSlotInput = Omit<TimeSlot, 'id' | 'isAvailable' | 'createdAt'>;

export type CreateUserInput = Omit<User, 'id' | 'isActive' | 'createdAt'>;

// ============================================
// RESERVATION WITH CREDIT
// ============================================

export interface CreateReservationWithCreditResult {
  success: boolean;
  error?: string;
  reservationId?: number;
  remainingBalance?: StudentBalance;
}
