// src/pages/TimeSlots/index.tsx
// Page Moniteur - Gestion des indisponibilités avec design Metalab

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useSchoolSchedule } from '../../hooks/useSchoolSchedule';
import { useInstructorAvailability } from '../../hooks/useInstructorAvailability';
import { InstructorAvailabilityForm } from './InstructorAvailabilityForm';
import { InstructorAvailabilityList } from './InstructorAvailabilityList';
import { Button } from '../../components/ui/Button';
import { Navigate } from 'react-router-dom';
import type { SchoolSchedule } from '../../types';
import { 
  Clock, 
  AlertCircle, 
  Calendar, 
  Plus, 
  ArrowLeft,
  CheckCircle,
  XCircle
} from 'lucide-react';

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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Chargement...</p>
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

  const totalSlots = availabilityItems.length;
  const availableSlots = availabilityItems.filter(item => !item.availability || item.availability.isAvailable === 1).length;
  const unavailableSlots = availabilityItems.filter(item => item.availability?.isAvailable === 0).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Hero Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 text-white"
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
                <ArrowLeft className="w-6 h-6 text-white" />
              </motion.button>
              <div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="flex items-center space-x-3 mb-3"
                >
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold">Mes Indisponibilités</h1>
                </motion.div>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-purple-100 text-lg"
                >
                  Gérez vos créneaux indisponibles (maladie, congés, etc.)
                </motion.p>
              </div>
            </div>
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowForm(!showForm)}
              disabled={availabilityItems.length === 0}
              className="flex items-center space-x-2 bg-white text-purple-600 px-6 py-3 rounded-full font-semibold hover:bg-purple-50 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-5 h-5" />
              <span>{showForm ? 'Annuler' : 'Ajouter indisponibilité'}</span>
            </motion.button>
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
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          {/* Total créneaux */}
          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-white rounded-3xl shadow-xl p-6 border border-purple-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total créneaux</p>
                <p className="text-4xl font-bold text-purple-600">{totalSlots}</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-400 rounded-2xl flex items-center justify-center">
                <Clock className="w-8 h-8 text-white" />
              </div>
            </div>
          </motion.div>

          {/* Disponibles */}
          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-white rounded-3xl shadow-xl p-6 border border-green-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Disponibles</p>
                <p className="text-4xl font-bold text-green-600">{availableSlots}</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-400 rounded-2xl flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
            </div>
          </motion.div>

          {/* Indisponibles */}
          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-white rounded-3xl shadow-xl p-6 border border-red-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Indisponibles</p>
                <p className="text-4xl font-bold text-red-600">{unavailableSlots}</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-400 rounded-2xl flex items-center justify-center">
                <XCircle className="w-8 h-8 text-white" />
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Date Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white rounded-3xl shadow-xl p-6 border border-purple-100 mb-8"
        >
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              <label htmlFor="date" className="text-sm font-medium text-gray-700">
                Sélectionner une date :
              </label>
            </div>
            <input
              type="date"
              id="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="rounded-xl border border-gray-300 px-4 py-2 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
            <span className="text-gray-600 font-medium">
              {dayName} {dateObj.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-3xl shadow-lg p-6 border border-blue-100 mb-8"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-900">Comment gérer vos indisponibilités ?</p>
              <p className="text-sm text-blue-700 mt-2 leading-relaxed">
                Les créneaux horaires de l'école s'affichent ci-dessous. Cliquez sur un créneau pour le marquer comme indisponible (maladie, congés, etc.).
                Un créneau non marqué est considéré comme disponible par défaut.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Add Reason Form */}
        {showForm && selectedScheduleId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="bg-white rounded-3xl shadow-xl p-6 border border-pink-100 mb-8"
          >
            <div className="flex items-center space-x-2 mb-4">
              <Plus className="w-5 h-5 text-pink-600" />
              <h2 className="text-lg font-bold text-gray-900">Ajouter une indisponibilité</h2>
            </div>
            <InstructorAvailabilityForm
              scheduleId={selectedScheduleId}
              onSubmit={handleAddReason}
              onCancel={() => {
                setShowForm(false);
                setSelectedScheduleId(null);
              }}
              isLoading={isLoading}
            />
          </motion.div>
        )}

        {/* Loading State */}
        {scheduleLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Chargement...</p>
          </div>
        )}

        {/* Availability List */}
        {!scheduleLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
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
          </motion.div>
        )}
      </main>
    </div>
  );
}

export default TimeSlotsPage;
