// src/pages/Admin/index.tsx
// Page Admin - Gestion des cours et réservations
// Design Metalab harmonisé avec le reste du site

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useCourses } from '../../hooks/useCourses';
import { useReservations } from '../../hooks/useReservations';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Navigate, Link } from 'react-router-dom';
import type { CreateCourseInput } from '../../types';
import {
  Plus,
  X,
  BookOpen,
  Calendar,
  Users,
  TrendingUp,
  Wallet,
  Settings,
  Trash2,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

export function AdminPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { courses, createCourse, deleteCourse, isLoading: coursesLoading } = useCourses();
  const { reservations, updateReservationStatus } = useReservations();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<CreateCourseInput>({
    instructorId: 2,
    title: '',
    description: '',
    level: 'beginner',
    maxStudents: 6,
    price: 70,
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 flex items-center justify-center">
        <div aria-busy="true" aria-live="polite" className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      return;
    }
    try {
      await createCourse(formData);
      setShowCreateForm(false);
      setFormData({
        instructorId: 2,
        title: '',
        description: '',
        level: 'beginner',
        maxStudents: 6,
        price: 70,
      });
    } catch {
      // Error handled by hook
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) {
      try {
        await deleteCourse(id);
      } catch {
        // Error handled by hook
      }
    }
  };

  const handleReservationStatus = async (id: number, status: 'confirmed' | 'cancelled') => {
    try {
      await updateReservationStatus(id, status);
    } catch {
      // Error handled by hook
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100">
      {/* Hero Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 text-white"
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
                  Administration
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-blue-100 text-lg mt-2"
                >
                  Gérez les cours et les réservations
                </motion.p>
              </div>
            </div>
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="flex items-center space-x-2 bg-white text-blue-600 px-6 py-3 rounded-full font-semibold hover:bg-blue-50 transition-all shadow-lg"
            >
              {showCreateForm ? (
                <>
                  <X className="w-5 h-5" />
                  <span>Annuler</span>
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  <span>Nouveau cours</span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-8">
        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link
              to="/admin/pricing"
              className="group bg-white rounded-3xl shadow-xl p-6 border border-green-100 hover:shadow-2xl transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="font-bold text-gray-900">Tarifs</h3>
              <p className="text-sm text-gray-600">Gérer les prix</p>
            </Link>

            <Link
              to="/admin/wallets"
              className="group bg-white rounded-3xl shadow-xl p-6 border border-blue-100 hover:shadow-2xl transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="font-bold text-gray-900">Portefeuilles</h3>
              <p className="text-sm text-gray-600">Gérer les soldes</p>
            </Link>

            <Link
              to="/admin/school-schedule"
              className="group bg-white rounded-3xl shadow-xl p-6 border border-purple-100 hover:shadow-2xl transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="font-bold text-gray-900">Emploi du temps</h3>
              <p className="text-sm text-gray-600">Planning école</p>
            </Link>

            <Link
              to="/admin/stats"
              className="group bg-white rounded-3xl shadow-xl p-6 border border-orange-100 hover:shadow-2xl transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="font-bold text-gray-900">Statistiques</h3>
              <p className="text-sm text-gray-600">Analyser les données</p>
            </Link>
          </div>
        </motion.div>

        {/* Create Course Form */}
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-blue-100">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Créer un nouveau cours</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titre du cours
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Ex: Initiation au Kitesurf"
                      className="block w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prix (€)
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      min="0"
                      className="block w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="block w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:ring-blue-500"
                    rows={4}
                    placeholder="Décrivez le cours, les prérequis, le matériel inclus..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Niveau
                    </label>
                    <select
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value as CreateCourseInput['level'] })}
                      className="block w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="beginner">🌱 Débutant</option>
                      <option value="intermediate">⚡ Intermédiaire</option>
                      <option value="advanced">🔥 Avancé</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max élèves
                    </label>
                    <input
                      type="number"
                      value={formData.maxStudents}
                      onChange={(e) => setFormData({ ...formData, maxStudents: Number(e.target.value) })}
                      min="1"
                      className="block w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ID Moniteur
                    </label>
                    <input
                      type="number"
                      value={formData.instructorId}
                      onChange={(e) => setFormData({ ...formData, instructorId: Number(e.target.value) })}
                      min="1"
                      className="block w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" variant="primary">
                    Créer le cours
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {/* Courses Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Cours disponibles</h2>
            </div>
            <Badge variant="info" className="text-sm px-4 py-2">
              {courses.length} cours
            </Badge>
          </div>

          {coursesLoading ? (
            <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto" />
            </div>
          ) : courses.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Aucun cours disponible</p>
              <p className="text-sm text-gray-500 mt-1">Créez votre premier cours</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <Badge
                      variant={
                        course.level === 'beginner'
                          ? 'success'
                          : course.level === 'intermediate'
                          ? 'warning'
                          : 'danger'
                      }
                      className="text-sm"
                    >
                      {course.level === 'beginner'
                        ? '🌱 Débutant'
                        : course.level === 'intermediate'
                        ? '⚡ Intermédiaire'
                        : '🔥 Avancé'}
                    </Badge>
                    <span className="text-2xl font-bold text-blue-600">{course.price}€</span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2">{course.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>Max {course.maxStudents} élèves</span>
                    </div>
                    <button
                      onClick={() => handleDelete(course.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      aria-label={`Supprimer le cours ${course.title}`}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>

        {/* Reservations Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-400 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Réservations</h2>
            </div>
            <Badge variant="info" className="text-sm px-4 py-2">
              {reservations.length} réservations
            </Badge>
          </div>

          {reservations.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Aucune réservation</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Étudiant
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Cours
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {reservations.map((reservation) => {
                      const course = courses.find((c) => c.id === reservation.courseId);
                      return (
                        <tr key={reservation.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            #{reservation.id}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            Étudiant #{reservation.studentId}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {course?.title || `Cours #${reservation.courseId}`}
                          </td>
                          <td className="px-6 py-4">
                            <Badge
                              variant={
                                reservation.status === 'confirmed'
                                  ? 'success'
                                  : reservation.status === 'cancelled'
                                  ? 'danger'
                                  : 'warning'
                              }
                              className="text-sm"
                            >
                              {reservation.status === 'confirmed' ? (
                                <>
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Confirmé
                                </>
                              ) : reservation.status === 'cancelled' ? (
                                <>
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Annulé
                                </>
                              ) : (
                                <>
                                  <Clock className="w-3 h-3 mr-1" />
                                  En attente
                                </>
                              )}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            {reservation.status === 'pending' && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleReservationStatus(reservation.id, 'confirmed')}
                                  className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                                >
                                  Confirmer
                                </button>
                                <button
                                  onClick={() => handleReservationStatus(reservation.id, 'cancelled')}
                                  className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                  Annuler
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.section>
      </main>
    </div>
  );
}

export default AdminPage;
