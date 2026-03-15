// src/router.tsx

import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/Login';
import { DashboardPage } from './pages/Dashboard';
import { StudentPage } from './pages/Student';
import { AdminPage } from './pages/Admin';
import { InstructorPage } from './pages/Instructor';
import { ErrorBoundary } from './components/ErrorBoundary';
import { TimeSlotsPage } from './pages/TimeSlots';
import { ReservationHistoryPage } from './pages/ReservationHistory';
import { StatsPage } from './pages/Stats';
import { InstructorCalendarPage } from './pages/InstructorCalendar';
import { instructorCalendarLoader, getCurrentInstructorId } from './pages/InstructorCalendar/loader';
import { DbErrorBoundary } from './components/DbErrorBoundary';
import { ProfileDataPage } from './pages/ProfileData';
import { profileDataLoader, getCurrentUserId } from './pages/ProfileData/loader';
import { CreditsPage } from './pages/Admin/Credits';
import { creditsLoader } from './pages/Admin/Credits/loader';
import { studentLoader } from './pages/Student/loader';
import { instructorLoader } from './pages/Instructor/loader';
import { CreditsErrorBoundary } from './pages/Admin/Credits/CreditsErrorBoundary';
import { StudentErrorBoundary } from './pages/Student/StudentErrorBoundary';
import { InstructorErrorBoundary } from './pages/Instructor/InstructorErrorBoundary';
import { ProfileErrorBoundary } from './pages/Profile/ProfileErrorBoundary';
import { DeleteAccountPage } from './pages/Profile/DeleteAccountPage';
import { ConfirmDeletionPage, confirmDeletionLoader } from './pages/Profile/ConfirmDeletionPage';
import { ConsentsPage } from './pages/Profile/ConsentsPage';
import { EditProfilePage } from './pages/Profile/EditProfilePage';
import { SchoolSchedulePage } from './pages/Admin/SchoolSchedule';

// New public pages with Metalab design
import { MainLayout } from './components/Layout/MainLayout';
import { HomePage } from './pages/Home';
import { AboutPage } from './pages/About';
import { CoursesPage } from './pages/Courses';
import { EquipmentPage } from './pages/Equipment';
import { ContactPage } from './pages/Contact';
import { RGPDPage } from './pages/RGPD';

// Auth wrapper for public pages
const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  return children;
};

export const router = createBrowserRouter([
  // Public routes with new Metalab design
  {
    path: '/',
    element: <Navigate to="/home" replace />,
    errorElement: <ErrorBoundary><div /></ErrorBoundary>,
  },
  {
    path: '/home',
    element: <MainLayout />,
    errorElement: <ErrorBoundary><div /></ErrorBoundary>,
    children: [
      { index: true, element: <HomePage /> },
    ],
  },
  {
    path: '/about',
    element: <MainLayout />,
    errorElement: <ErrorBoundary><div /></ErrorBoundary>,
    children: [
      { index: true, element: <AboutPage /> },
    ],
  },
  {
    path: '/courses',
    element: <MainLayout />,
    errorElement: <ErrorBoundary><div /></ErrorBoundary>,
    children: [
      { index: true, element: <CoursesPage /> },
    ],
  },
  {
    path: '/equipment',
    element: <MainLayout />,
    errorElement: <ErrorBoundary><div /></ErrorBoundary>,
    children: [
      { index: true, element: <EquipmentPage /> },
    ],
  },
  {
    path: '/contact',
    element: <MainLayout />,
    errorElement: <ErrorBoundary><div /></ErrorBoundary>,
    children: [
      { index: true, element: <ContactPage /> },
    ],
  },
  {
    path: '/rgpd',
    element: <MainLayout />,
    errorElement: <ErrorBoundary><div /></ErrorBoundary>,
    children: [
      { index: true, element: <RGPDPage /> },
    ],
  },
  
  // Legacy routes (keep existing functionality)
  {
    path: '/login',
    element: <LoginPage />,
    errorElement: <ErrorBoundary><div /></ErrorBoundary>,
  },
  {
    path: '/dashboard',
    element: <DashboardPage />,
    errorElement: <ErrorBoundary><div /></ErrorBoundary>,
  },
  {
    path: '/student',
    element: <MainLayout requireAuth={true} allowedRoles={['student']} />,
    errorElement: <DbErrorBoundary><StudentErrorBoundary><div /></StudentErrorBoundary></DbErrorBoundary>,
    children: [
      { 
        index: true, 
        element: <StudentPage />,
        errorElement: <StudentErrorBoundary><div /></StudentErrorBoundary>,
      },
    ],
  },
  {
    path: '/admin',
    element: <AdminPage />,
    errorElement: <ErrorBoundary><div /></ErrorBoundary>,
  },
  {
    path: '/admin/credits',
    element: <CreditsPage />,
    loader: creditsLoader,
    errorElement: <DbErrorBoundary><CreditsErrorBoundary><div /></CreditsErrorBoundary></DbErrorBoundary>,
  },
  {
    path: '/admin/school-schedule',
    element: <SchoolSchedulePage />,
    errorElement: <ErrorBoundary><div /></ErrorBoundary>,
  },
  {
    path: '/instructor',
    element: <InstructorPage />,
    loader: instructorLoader,
    errorElement: <DbErrorBoundary><InstructorErrorBoundary><div /></InstructorErrorBoundary></DbErrorBoundary>,
  },
  // New routes for V2 features
  {
    path: '/instructor/timeslots',
    element: <TimeSlotsPage />,
    errorElement: <ErrorBoundary><div /></ErrorBoundary>,
  },
  {
    path: '/instructor/calendar',
    element: <InstructorCalendarPage />,
    loader: async () => {
      const instructorId = getCurrentInstructorId();
      return instructorCalendarLoader(instructorId);
    },
    errorElement: <DbErrorBoundary><div /></DbErrorBoundary>,
  },
  {
    path: '/reservations',
    element: <MainLayout requireAuth={true} allowedRoles={['student']} />,
    errorElement: <ErrorBoundary><div /></ErrorBoundary>,
    children: [
      { index: true, element: <ReservationHistoryPage /> },
    ],
  },
  {
    path: '/admin/stats',
    element: <StatsPage />,
    errorElement: <ErrorBoundary><div /></ErrorBoundary>,
  },
  // Profile routes
  {
    path: '/profil/mes-donnees',
    element: <MainLayout requireAuth={true} />,
    errorElement: <DbErrorBoundary><div /></DbErrorBoundary>,
    children: [
      { index: true, element: <ProfileDataPage /> },
    ],
  },
  {
    path: '/profil/modifier',
    element: <MainLayout requireAuth={true} />,
    errorElement: <DbErrorBoundary><ProfileErrorBoundary><div /></ProfileErrorBoundary></DbErrorBoundary>,
    children: [
      { index: true, element: <EditProfilePage /> },
    ],
  },
  {
    path: '/profil/consentements',
    element: <MainLayout requireAuth={true} />,
    errorElement: <DbErrorBoundary><ProfileErrorBoundary><div /></ProfileErrorBoundary></DbErrorBoundary>,
    children: [
      { index: true, element: <ConsentsPage /> },
    ],
  },
  {
    path: '/profil/supprimer-compte',
    element: <MainLayout requireAuth={true} />,
    errorElement: <DbErrorBoundary><ProfileErrorBoundary><div /></ProfileErrorBoundary></DbErrorBoundary>,
    children: [
      { index: true, element: <DeleteAccountPage /> },
    ],
  },
  {
    path: '/profil/confirmer-suppression/:token',
    element: <ConfirmDeletionPage />,
    loader: confirmDeletionLoader,
    errorElement: <DbErrorBoundary><ProfileErrorBoundary><div /></ProfileErrorBoundary></DbErrorBoundary>,
  },
  {
    path: '*',
    element: <Navigate to="/home" replace />,
    errorElement: <ErrorBoundary><div /></ErrorBoundary>,
  },
]);
