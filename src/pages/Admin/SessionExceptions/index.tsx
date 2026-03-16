// src/pages/Admin/SessionExceptions/index.tsx
// Page de gestion des exceptions de sessions (annulations, modifications)

import { useState } from 'react';
import { useLoaderData, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../../hooks/useAuth';
import { useSessionExceptions } from '../../../hooks/useSessionExceptions';
import type { SessionExceptionsLoaderData } from './loader';
import type { CourseSession, Course } from '../../../types';
import { Calendar, X, Check, AlertTriangle, RefreshCw, Users } from 'lucide-react';
import { formatDateFr } from '../../../utils/dateUtils';

export function SessionExceptionsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { exceptions, courseSessions, courses } = useLoaderData() as SessionExceptionsLoaderData;
  const { createExceptionsForPeriod, deleteException } = useSessionExceptions();

  const [selectedCourse, setSelectedCourse] = useState<number | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

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

  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  // Filtrer les sessions par cours sélectionné
  const filteredSessions = courseSessions.filter(session => {
    if (!session.isActive) return false;
    if (selectedCourse && session.courseId !== selectedCourse) return false;
    return true;
  });

  // Grouper les sessions par date
  const sessionsByDate = new Map<string, CourseSession[]>();
  filteredSessions.forEach(session => {
    if (!sessionsByDate.has(session.date)) {
      sessionsByDate.set(session.date, []);
    }
    sessionsByDate.get(session.date)!.push(session);
  });

  const sortedDates = Array.from(sessionsByDate.keys()).sort();

  // Compter les exceptions par date
  const exceptionsByDate = new Map<string, number>();
  exceptions.forEach(exc => {
    const count = exceptionsByDate.get(exc.date) || 0;
    exceptionsByDate.set(exc.date, count + 1);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCourse || !startDate || !endDate || !reason) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      alert('La date de début doit être antérieure à la date de fin');
      return;
    }

    setIsSubmitting(true);
    try {
      const count = await createExceptionsForPeriod(
        selectedCourse as number,
        startDate,
        endDate,
        'cancelled',
        reason
      );

      setSuccessMessage(`✅ ${count} session(s) annulée(s) avec succès`);
      
      // Reset form
      setStartDate('');
      setEndDate('');
      setReason('');
      
      // Refresh after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      alert('❌ Erreur lors de l\'annulation des sessions');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteException = async (id: number) => {
    if (!confirm('Voulez-vous vraiment supprimer cette exception ?')) {
      return;
    }

    try {
      await deleteException(id);
      setSuccessMessage('✅ Exception supprimée');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      alert('❌ Erreur lors de la suppression');
      console.error(error);
    }
  };

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
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="flex items-center space-x-3 mb-3"
              >
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold">Gestion des Annulations</h1>
              </motion.div>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-purple-100 text-lg"
              >
                Annulez des sessions pour congés, fériés, ou autres événements
              </motion.p>
            </div>
            <motion.a
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="/admin"
              className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full font-semibold hover:bg-white/30 transition-all"
            >
              <span>Retour</span>
            </motion.a>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-8">
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-800"
          >
            {successMessage}
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulaire d'annulation */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-white rounded-3xl shadow-xl p-6 border border-purple-100"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-400 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Annuler une période</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Cours */}
              <div>
                <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-2">
                  Cours concerné
                </label>
                <select
                  id="course"
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="">Sélectionner un cours</option>
                  {courses
                    .filter(c => c.isActive === 1)
                    .map(course => (
                      <option key={course.id} value={course.id}>
                        {course.title} ({course.level})
                      </option>
                    ))}
                </select>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Date de début
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Date de fin
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Motif */}
              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                  Motif de l'annulation
                </label>
                <select
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="">Sélectionner un motif</option>
                  <option value="Congés d'été">Congés d'été</option>
                  <option value="Congés d'hiver">Congés d'hiver</option>
                  <option value="Jour férié">Jour férié</option>
                  <option value="Météo défavorable">Météo défavorable</option>
                  <option value="Moniteur malade">Moniteur malade</option>
                  <option value="Événement spécial">Événement spécial</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              {/* Bouton */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold rounded-xl hover:from-red-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-500"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Annulation en cours...
                  </span>
                ) : (
                  'Annuler les sessions'
                )}
              </button>
            </form>
          </motion.section>

          {/* Liste des sessions à venir */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="bg-white rounded-3xl shadow-xl p-6 border border-purple-100"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Sessions à venir</h2>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {sortedDates.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Aucune session prévue</p>
                </div>
              ) : (
                sortedDates.map(date => {
                  const sessions = sessionsByDate.get(date)!;
                  const exceptionCount = exceptionsByDate.get(date) || 0;
                  const hasExceptions = exceptionCount > 0;

                  return (
                    <div
                      key={date}
                      className={`p-4 rounded-xl border ${
                        hasExceptions
                          ? 'bg-red-50 border-red-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-gray-900">
                          {formatDateFr(date)}
                        </p>
                        {hasExceptions && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
                            {exceptionCount} annulée(s)
                          </span>
                        )}
                      </div>
                      <div className="space-y-1">
                        {sessions.map(session => (
                          <div
                            key={session.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-gray-600">
                              {session.startTime} - {session.endTime}
                            </span>
                            <span className="text-gray-500">
                              {session.maxStudents} places
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.section>
        </div>

        {/* Historique des exceptions */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-8 bg-white rounded-3xl shadow-xl p-6 border border-purple-100"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-yellow-400 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Historique des annulations</h2>
          </div>

          {exceptions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Aucune annulation enregistrée</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Session ID</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Motif</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {exceptions.map(exception => (
                    <tr
                      key={exception.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {formatDateFr(exception.date)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        #{exception.sessionId}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {exception.reason}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            exception.type === 'cancelled'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {exception.type === 'cancelled' ? 'Annulé' : 'Modifié'}
                        </span>
                      </td>
                      <td className="text-right py-3 px-4">
                        <button
                          onClick={() => handleDeleteException(exception.id)}
                          className="p-2 hover:bg-red-100 rounded-lg transition text-red-600"
                          aria-label="Supprimer cette exception"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.section>
      </main>
    </div>
  );
}

export default SessionExceptionsPage;
