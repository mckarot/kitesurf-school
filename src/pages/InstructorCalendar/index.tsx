// src/pages/InstructorCalendar/index.tsx

import { useLoaderData, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { InstructorCalendar } from '../../components/Calendar/InstructorCalendar';
import type { InstructorCalendarLoaderData } from './loader';

export function InstructorCalendarPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { timeSlots, courses, reservations } = useLoaderData() as InstructorCalendarLoaderData;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div aria-busy="true" aria-live="polite" className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'instructor') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a href="/instructor" className="text-gray-600 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </a>
              <h1 className="text-xl font-bold text-gray-900">Calendrier des créneaux</h1>
            </div>
            <a
              href="/instructor/timeslots"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Gérer les créneaux
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <InstructorCalendar
          timeSlots={timeSlots}
          courses={courses}
          reservations={reservations}
        />
      </main>
    </div>
  );
}
