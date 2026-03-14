// src/pages/TimeSlots/index.tsx
// Page Moniteur - Gestion des indisponibilités
// Les moniteurs peuvent bloquer des créneaux spécifiques (maladie, congés, etc.)

import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useSchoolSchedule } from '../../hooks/useSchoolSchedule';
import { useInstructorAvailability } from '../../hooks/useInstructorAvailability';
import { InstructorAvailabilityForm } from './InstructorAvailabilityForm';
import { InstructorAvailabilityList } from './InstructorAvailabilityList';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Navigate } from 'react-router-dom';
import type { SchoolSchedule } from '../../types';

interface AvailabilityViewItem {
  schedule: SchoolSchedule;
  availability?: {
    id: number;
    isAvailable: 0 | 1;
    reason?: string;
  };
}

export function TimeSlotsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { getSchedulesByDay, isLoading: scheduleLoading } = useSchoolSchedule();
  const {
    setAvailability,
    deleteAvailability,
    getAvailabilityForDate,
    isLoading,
  } = useInstructorAvailability();

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [availabilityItems, setAvailabilityItems] = useState<AvailabilityViewItem[]>([]);

  const loadAvailabilityForDate = async (date: string) => {
    if (!user) return;

    const dateObj = new Date(date);
    let dayOfWeek = dateObj.getDay();
    if (dayOfWeek === 0) dayOfWeek = 6; // Dimanche -> 6

    try {
      const schedules = await getSchedulesByDay(dayOfWeek);
      const availabilities = await getAvailabilityForDate(user.id, date);

      const items: AvailabilityViewItem[] = schedules.map((schedule) => {
        const availability = availabilities.find((a) => a.scheduleId === schedule.id);
        return {
          schedule,
          availability: availability ? {
            id: availability.id,
            isAvailable: availability.isAvailable,
            reason: availability.reason,
          } : undefined,
        };
      });

      setAvailabilityItems(items);
    } catch (err) {
      console.error('Error loading availability:', err);
    }
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    loadAvailabilityForDate(date);
  };

  const handleToggleAvailability = async (scheduleId: number, currentlyAvailable: boolean) => {
    if (!user) return;

    try {
      await setAvailability({
        instructorId: user.id,
        date: selectedDate,
        scheduleId,
        isAvailable: currentlyAvailable ? 0 : 1,
        reason: currentlyAvailable ? 'Indisponible' : undefined,
      });
      await loadAvailabilityForDate(selectedDate);
    } catch (err) {
      console.error('Error toggling availability:', err);
    }
  };

  const handleAddReason = async (scheduleId: number, reason: string) => {
    if (!user) return;

    try {
      await setAvailability({
        instructorId: user.id,
        date: selectedDate,
        scheduleId,
        isAvailable: 0,
        reason,
      });
      await loadAvailabilityForDate(selectedDate);
      setShowForm(false);
    } catch (err) {
      console.error('Error adding reason:', err);
    }
  };

  const handleDeleteAvailability = async (availabilityId: number) => {
    try {
      await deleteAvailability(availabilityId);
      await loadAvailabilityForDate(selectedDate);
    } catch (err) {
      console.error('Error deleting availability:', err);
    }
  };

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

  const dayNames = ['', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  const dateObj = new Date(selectedDate);
  const dayName = dayNames[dateObj.getDay() === 0 ? 6 : dateObj.getDay()];

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
              <h1 className="text-xl font-bold text-gray-900">Mes indisponibilités</h1>
            </div>
            <Button
              variant="primary"
              onClick={() => setShowForm(!showForm)}
              disabled={availabilityItems.length === 0}
            >
              {showForm ? 'Annuler' : 'Ajouter une indisponibilité'}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Date Selector */}
        <Card variant="elevated" className="mb-6">
          <CardBody>
            <div className="flex items-center gap-4">
              <label htmlFor="date" className="text-sm font-medium text-gray-700">
                Sélectionner une date :
              </label>
              <input
                type="date"
                id="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <span className="text-gray-600">
                {dayName} {dateObj.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
          </CardBody>
        </Card>

        {/* Info Card */}
        <Card variant="elevated" className="mb-6">
          <CardBody className="bg-blue-50 border-blue-200">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-blue-900">Comment gérer vos indisponibilités ?</p>
                <p className="text-sm text-blue-700 mt-1">
                  Les créneaux horaires de l'école s'affichent ci-dessous. Cliquez sur un créneau pour le marquer comme indisponible (maladie, congés, etc.).
                  Un créneau non marqué est considéré comme disponible par défaut.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Add Reason Form */}
        {showForm && selectedScheduleId && (
          <Card variant="elevated" className="mb-6">
            <CardHeader>
              <h2 className="font-semibold text-gray-900">Ajouter une indisponibilité</h2>
            </CardHeader>
            <CardBody>
              <InstructorAvailabilityForm
                scheduleId={selectedScheduleId}
                onSubmit={handleAddReason}
                onCancel={() => {
                  setShowForm(false);
                  setSelectedScheduleId(null);
                }}
                isLoading={isLoading}
              />
            </CardBody>
          </Card>
        )}

        {/* Loading State */}
        {scheduleLoading && (
          <div aria-busy="true" aria-live="polite" className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
            <p className="text-gray-600">Chargement...</p>
          </div>
        )}

        {/* Availability List */}
        {!scheduleLoading && (
          <InstructorAvailabilityList
            items={availabilityItems}
            onToggle={handleToggleAvailability}
            onDelete={handleDeleteAvailability}
            onOpenForm={(scheduleId) => {
              setSelectedScheduleId(scheduleId);
              setShowForm(true);
            }}
            isLoading={isLoading}
          />
        )}
      </main>
    </div>
  );
}
