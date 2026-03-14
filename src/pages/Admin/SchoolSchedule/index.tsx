// src/pages/Admin/SchoolSchedule/index.tsx
// Page Admin - Gestion des emplois du temps de l'école

import { useState, useEffect } from 'react';
import { useSchoolSchedule } from '../../../hooks/useSchoolSchedule';
import { Card, CardBody, CardHeader } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { SchoolScheduleForm } from './SchoolScheduleForm';
import { SchoolScheduleList } from './SchoolScheduleList';

const DAYS_OF_WEEK = [
  '', // Index 0 unused
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
];

export function SchoolSchedulePage() {
  const {
    schedules,
    isLoading,
    error,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    resetToDefaults,
    loadSchedules,
  } = useSchoolSchedule();

  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<{ id: number; dayOfWeek: number; startTime: string; endTime: string } | null>(null);

  // Charge les créneaux au montage
  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

  const handleCreate = async (data: { dayOfWeek: number; startTime: string; endTime: string }) => {
    await createSchedule({
      dayOfWeek: data.dayOfWeek as 1 | 2 | 3 | 4 | 5 | 6,
      startTime: data.startTime,
      endTime: data.endTime,
      isActive: 1,
    });
    setShowForm(false);
  };

  const handleUpdate = async (data: { dayOfWeek: number; startTime: string; endTime: string }) => {
    if (!editingSchedule) return;
    await updateSchedule(editingSchedule.id, {
      dayOfWeek: data.dayOfWeek as 1 | 2 | 3 | 4 | 5 | 6,
      startTime: data.startTime,
      endTime: data.endTime,
    });
    setEditingSchedule(null);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce créneau ?')) {
      await deleteSchedule(id);
    }
  };

  const handleEdit = (schedule: { id: number; dayOfWeek: number; startTime: string; endTime: string }) => {
    setEditingSchedule(schedule);
    setShowForm(false);
  };

  const handleCancelEdit = () => {
    setEditingSchedule(null);
  };

  const handleResetToDefaults = async () => {
    if (window.confirm('Cette action va réinitialiser tous les créneaux par défaut. Êtes-vous sûr ?')) {
      await resetToDefaults();
    }
  };

  // Group schedules by day
  const schedulesByDay = schedules.reduce((acc, schedule) => {
    const day = schedule.dayOfWeek;
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(schedule);
    return acc;
  }, {} as Record<number, typeof schedules>);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a href="/admin" className="text-gray-600 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </a>
              <h1 className="text-xl font-bold text-gray-900">Emploi du temps de l'école</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={handleResetToDefaults}
                disabled={isLoading}
              >
                Réinitialiser
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setEditingSchedule(null);
                  setShowForm(!showForm);
                }}
                disabled={isLoading}
              >
                {showForm ? 'Annuler' : 'Nouveau créneau'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Error Message */}
        {error && (
          <div role="alert" className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">
            <p className="font-medium">Erreur</p>
            <p className="text-sm">{error.message}</p>
          </div>
        )}

        {/* Create/Edit Form */}
        {showForm && (
          <Card variant="elevated" className="mb-8">
            <CardHeader>
              <h2 className="font-semibold text-gray-900">Ajouter un créneau horaire</h2>
            </CardHeader>
            <CardBody>
              <SchoolScheduleForm
                onSubmit={handleCreate}
                onCancel={() => setShowForm(false)}
                isLoading={isLoading}
              />
            </CardBody>
          </Card>
        )}

        {/* Edit Form */}
        {editingSchedule && (
          <Card variant="elevated" className="mb-8">
            <CardHeader>
              <h2 className="font-semibold text-gray-900">Modifier le créneau</h2>
            </CardHeader>
            <CardBody>
              <SchoolScheduleForm
                initialData={editingSchedule}
                onSubmit={handleUpdate}
                onCancel={handleCancelEdit}
                isLoading={isLoading}
              />
            </CardBody>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <div aria-busy="true" aria-live="polite" className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
            <p className="text-gray-600">Chargement...</p>
          </div>
        )}

        {/* Schedules by Day */}
        <section className="space-y-6">
          {DAYS_OF_WEEK.map((dayName, dayIndex) => {
            if (dayIndex === 0) return null; // Skip index 0
            const daySchedules = schedulesByDay[dayIndex] || [];

            return (
              <Card key={dayIndex} variant="elevated">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-gray-900">{dayName}</h2>
                    <Badge variant={daySchedules.length > 0 ? 'success' : 'danger'}>
                      {daySchedules.length} créneau{daySchedules.length > 1 ? 'x' : ''}
                    </Badge>
                  </div>
                </CardHeader>
                <CardBody>
                  {daySchedules.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Aucun créneau pour {dayName}</p>
                  ) : (
                    <SchoolScheduleList
                      schedules={daySchedules}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      isLoading={isLoading}
                    />
                  )}
                </CardBody>
              </Card>
            );
          })}
        </section>
      </main>
    </div>
  );
}

export default SchoolSchedulePage;
