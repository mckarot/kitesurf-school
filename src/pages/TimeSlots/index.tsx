// src/pages/TimeSlots/index.tsx

import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTimeSlots } from '../../hooks/useTimeSlots';
import { TimeSlotForm } from '../../components/TimeSlot/TimeSlotForm';
import { TimeSlotList } from '../../components/TimeSlot/TimeSlotList';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Navigate } from 'react-router-dom';

export function TimeSlotsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const {
    timeSlots,
    createTimeSlot,
    deleteTimeSlot,
    updateTimeSlot,
    isLoading,
  } = useTimeSlots();
  const [showForm, setShowForm] = useState(false);

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

  const handleCreate = async (data: { date: string; startTime: string; endTime: string }) => {
    await createTimeSlot({
      instructorId: user.id,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
    });
    setShowForm(false);
  };

  const handleDelete = async (id: number) => {
    await deleteTimeSlot(id);
  };

  const handleToggleAvailability = async (id: number, isAvailable: boolean) => {
    await updateTimeSlot(id, { isAvailable: isAvailable ? 1 : 0 });
  };

  // Filter time slots for current instructor
  const instructorTimeSlots = timeSlots.filter((slot) => slot.instructorId === user.id);

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
              <h1 className="text-xl font-bold text-gray-900">Gestion des créneaux</h1>
            </div>
            <Button
              variant="primary"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? 'Annuler' : 'Nouveau créneau'}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Create Form */}
        {showForm && (
          <Card variant="elevated" className="mb-8">
            <CardHeader>
              <h2 className="font-semibold text-gray-900">Ajouter un créneau horaire</h2>
            </CardHeader>
            <CardBody>
              <TimeSlotForm
                instructorId={user.id}
                onSubmit={handleCreate}
                onCancel={() => setShowForm(false)}
                isLoading={isLoading}
              />
            </CardBody>
          </Card>
        )}

        {/* Time Slots List */}
        <section>
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              {instructorTimeSlots.length} créneau{instructorTimeSlots.length > 1 ? 'x' : ''}
            </p>
          </div>
          <TimeSlotList
            timeSlots={instructorTimeSlots}
            onDelete={handleDelete}
            onToggleAvailability={handleToggleAvailability}
            isLoading={isLoading}
            emptyMessage="Aucun créneau horaire. Ajoutez votre premier créneau pour indiquer vos disponibilités."
          />
        </section>
      </main>
    </div>
  );
}
