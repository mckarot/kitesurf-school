// src/pages/Admin/SchoolSchedule/index.tsx
// Page Admin - Gestion des emplois du temps de l'école
// Design Metalab harmonisé avec le reste du site

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSchoolSchedule } from '../../../hooks/useSchoolSchedule';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { SchoolScheduleForm } from './SchoolScheduleForm';
import { SchoolScheduleList } from './SchoolScheduleList';
import { Navigate } from 'react-router-dom';
import {
  Calendar,
  Plus,
  X,
  Clock,
  RotateCcw,
  Edit2,
  Trash2,
  CheckCircle2
} from 'lucide-react';

const DAYS_OF_WEEK = [
  '', // Index 0 unused
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
];

const DAY_ICONS = [
  '',
  '🌙', // Lundi
  '⭐', // Mardi
  '☀️', // Mercredi
  '🌤️', // Jeudi
  '🌅', // Vendredi
  '🏖️', // Samedi
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
    if (window.confirm('⚠️ Cette action va réinitialiser tous les créneaux par défaut.\n\nÊtes-vous sûr de vouloir continuer ?')) {
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

  const totalSchedules = schedules.length;
  const activeDays = Object.keys(schedulesByDay).filter(key => schedulesByDay[Number(key)].length > 0).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100">
      {/* Hero Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => window.history.back()}
                className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/30 transition-all"
                aria-label="Retour"
              >
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </motion.button>
              <div>
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="text-4xl md:text-5xl font-bold"
                >
                  Emploi du temps
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-purple-100 text-lg mt-2"
                >
                  Gérez les créneaux horaires de l'école
                </motion.p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleResetToDefaults}
                disabled={isLoading}
                className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm text-white px-5 py-3 rounded-full font-semibold hover:bg-white/30 transition-all disabled:opacity-50"
              >
                <RotateCcw className="w-5 h-5" />
                <span className="hidden sm:inline">Réinitialiser</span>
              </motion.button>
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setEditingSchedule(null);
                  setShowForm(!showForm);
                }}
                disabled={isLoading}
                className="flex items-center space-x-2 bg-white text-purple-600 px-6 py-3 rounded-full font-semibold hover:bg-purple-50 transition-all shadow-lg disabled:opacity-50"
              >
                {showForm ? (
                  <>
                    <X className="w-5 h-5" />
                    <span>Annuler</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    <span>Nouveau créneau</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-8">
        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <div className="bg-white rounded-3xl shadow-xl p-6 border border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total créneaux</p>
                <p className="text-4xl font-bold text-purple-600">{totalSchedules}</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-400 rounded-2xl flex items-center justify-center">
                <Clock className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-6 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Jours actifs</p>
                <p className="text-4xl font-bold text-blue-600">{activeDays}/6</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center">
                <Calendar className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-6 border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Statut</p>
                <p className="text-lg font-bold text-green-600">✓ Actif</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-400 rounded-2xl flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            role="alert"
            className="mb-6 rounded-2xl bg-red-50 border border-red-200 p-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <X className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="font-semibold text-red-800">Erreur</p>
                <p className="text-sm text-red-700 mt-1">{error.message}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Create/Edit Form */}
        {(showForm || editingSchedule) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-purple-100">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-400 rounded-xl flex items-center justify-center">
                  {editingSchedule ? (
                    <Edit2 className="w-5 h-5 text-white" />
                  ) : (
                    <Plus className="w-5 h-5 text-white" />
                  )}
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingSchedule ? 'Modifier le créneau' : 'Ajouter un créneau horaire'}
                </h2>
              </div>

              <SchoolScheduleForm
                initialData={editingSchedule || undefined}
                onSubmit={editingSchedule ? handleUpdate : handleCreate}
                onCancel={() => {
                  setShowForm(false);
                  setEditingSchedule(null);
                }}
                isLoading={isLoading}
              />
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading && schedules.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Chargement des créneaux...</p>
          </motion.div>
        )}

        {/* Schedules by Day */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="space-y-4"
        >
          {DAYS_OF_WEEK.map((dayName, dayIndex) => {
            if (dayIndex === 0) return null;
            const daySchedules = schedulesByDay[dayIndex] || [];
            const icon = DAY_ICONS[dayIndex];

            return (
              <motion.div
                key={dayIndex}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * dayIndex, duration: 0.4 }}
                whileHover={{ scale: 1.01 }}
                className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{icon}</span>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{dayName}</h3>
                      <p className="text-sm text-gray-500">
                        {daySchedules.length} créneau{daySchedules.length > 1 ? 'x' : ''}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={daySchedules.length > 0 ? 'success' : 'danger'}
                    className="text-sm px-4 py-2"
                  >
                    {daySchedules.length > 0 ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Actif
                      </>
                    ) : (
                      <>
                        <X className="w-3 h-3 mr-1" />
                        Aucun
                      </>
                    )}
                  </Badge>
                </div>

                {daySchedules.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">Aucun créneau pour {dayName}</p>
                    <p className="text-sm text-gray-400 mt-1">Cliquez sur "Nouveau créneau" pour en ajouter</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <SchoolScheduleList
                      schedules={daySchedules}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      isLoading={isLoading}
                    />
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.section>
      </main>
    </div>
  );
}

export default SchoolSchedulePage;
