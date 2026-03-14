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

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
    errorElement: <ErrorBoundary><div /></ErrorBoundary>,
  },
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
    element: <StudentPage />,
    loader: studentLoader,
    errorElement: <DbErrorBoundary><StudentErrorBoundary><div /></StudentErrorBoundary></DbErrorBoundary>,
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
    element: <ReservationHistoryPage />,
    errorElement: <ErrorBoundary><div /></ErrorBoundary>,
  },
  {
    path: '/admin/stats',
    element: <StatsPage />,
    errorElement: <ErrorBoundary><div /></ErrorBoundary>,
  },
  // Profile routes
  {
    path: '/profil/mes-donnees',
    element: <ProfileDataPage />,
    loader: async () => {
      const userId = getCurrentUserId();
      return profileDataLoader(userId);
    },
    errorElement: <DbErrorBoundary><div /></DbErrorBoundary>,
  },
  {
    path: '/profil/modifier',
    element: <EditProfilePage />,
    errorElement: <DbErrorBoundary><ProfileErrorBoundary><div /></ProfileErrorBoundary></DbErrorBoundary>,
  },
  {
    path: '/profil/consentements',
    element: <ConsentsPage />,
    errorElement: <DbErrorBoundary><ProfileErrorBoundary><div /></ProfileErrorBoundary></DbErrorBoundary>,
  },
  {
    path: '/profil/supprimer-compte',
    element: <DeleteAccountPage />,
    errorElement: <DbErrorBoundary><ProfileErrorBoundary><div /></ProfileErrorBoundary></DbErrorBoundary>,
  },
  {
    path: '/profil/confirmer-suppression/:token',
    element: <ConfirmDeletionPage />,
    loader: confirmDeletionLoader,
    errorElement: <DbErrorBoundary><ProfileErrorBoundary><div /></ProfileErrorBoundary></DbErrorBoundary>,
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
    errorElement: <ErrorBoundary><div /></ErrorBoundary>,
  },
]);
