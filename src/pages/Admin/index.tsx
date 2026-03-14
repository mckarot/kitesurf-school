// src/pages/Admin/index.tsx

import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useCourses } from '../../hooks/useCourses';
import { useReservations } from '../../hooks/useReservations';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Navigate } from 'react-router-dom';
import type { CreateCourseInput } from '../../types';

export function AdminPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { courses, createCourse, deleteCourse, isLoading: coursesLoading } = useCourses();
  const { reservations, updateReservationStatus } = useReservations();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<CreateCourseInput>({
    instructorId: 2, // Default to first instructor
    title: '',
    description: '',
    level: 'beginner',
    maxStudents: 6,
    price: 100,
  });

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
        price: 100,
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a href="/dashboard" className="text-gray-600 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </a>
              <h1 className="text-xl font-bold text-gray-900">Administration</h1>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="/admin/school-schedule"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
                aria-label="Gérer l'emploi du temps de l'école"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Emploi du temps
              </a>
              <a
                href="/admin/credits"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition"
                aria-label="Gérer les crédits de cours"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2.5S10.343 13 12 13s3-1.395 3-2.5S13.657 8 12 8zm0 6c-1.105 0-2 .895-2 2s.895 2 2 2 2-.895 2-2-.895-2-2-2zm0-10C6.477 4 2 8.477 2 14s4.477 10 10 10 10-4.477 10-10S17.523 4 12 4z" />
                </svg>
                Crédits
              </a>
              <a
                href="/admin/stats"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Statistiques
              </a>
              <Button
                variant="secondary"
                onClick={() => setShowCreateForm(!showCreateForm)}
              >
                {showCreateForm ? 'Annuler' : 'Nouveau cours'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Create Course Form */}
        {showCreateForm && (
          <Card variant="elevated" className="mb-8">
            <CardHeader>
              <h2 className="font-semibold text-gray-900">Créer un nouveau cours</h2>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Titre"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Introduction au Kitesurf"
                    required
                  />
                  <Input
                    label="Prix (€)"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                    rows={3}
                    placeholder="Décrivez le cours..."
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Niveau
                    </label>
                    <select
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value as CreateCourseInput['level'] })}
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="beginner">Débutant</option>
                      <option value="intermediate">Intermédiaire</option>
                      <option value="advanced">Avancé</option>
                    </select>
                  </div>
                  <Input
                    label="Max élèves"
                    type="number"
                    value={formData.maxStudents}
                    onChange={(e) => setFormData({ ...formData, maxStudents: Number(e.target.value) })}
                    min="1"
                    required
                  />
                  <Input
                    label="ID Moniteur"
                    type="number"
                    value={formData.instructorId}
                    onChange={(e) => setFormData({ ...formData, instructorId: Number(e.target.value) })}
                    min="1"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="ghost" onClick={() => setShowCreateForm(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" variant="primary">
                    Créer le cours
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        )}

        {/* Courses List */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Cours</h2>
          {coursesLoading ? (
            <div aria-busy="true" className="text-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((course) => (
                <Card key={course.id} variant="elevated">
                  <CardBody>
                    <div className="flex items-start justify-between mb-2">
                      <Badge
                        variant={
                          course.level === 'beginner'
                            ? 'success'
                            : course.level === 'intermediate'
                            ? 'warning'
                            : 'danger'
                        }
                      >
                        {course.level === 'beginner'
                          ? 'Débutant'
                          : course.level === 'intermediate'
                          ? 'Intermédiaire'
                          : 'Avancé'}
                      </Badge>
                      <span className="text-lg font-bold text-gray-900">{course.price}€</span>
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1">{course.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Max {course.maxStudents} élèves</span>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(course.id)}
                        aria-label={`Supprimer le cours ${course.title}`}
                      >
                        Supprimer
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Reservations List */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Réservations</h2>
          {reservations.length === 0 ? (
            <p className="text-gray-600 text-center py-8">Aucune réservation</p>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Étudiant
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Cours
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Statut
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reservations.map((reservation) => {
                    const course = courses.find((c) => c.id === reservation.courseId);
                    return (
                      <tr key={reservation.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">#{reservation.id}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">Étudiant #{reservation.studentId}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {course?.title || `Cours #${reservation.courseId}`}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              reservation.status === 'confirmed'
                                ? 'success'
                                : reservation.status === 'cancelled'
                                ? 'danger'
                                : 'warning'
                            }
                          >
                            {reservation.status === 'confirmed'
                              ? 'Confirmé'
                              : reservation.status === 'cancelled'
                              ? 'Annulé'
                              : 'En attente'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            {reservation.status === 'pending' && (
                              <>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleReservationStatus(reservation.id, 'confirmed')}
                                >
                                  Confirmer
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleReservationStatus(reservation.id, 'cancelled')}
                                >
                                  Annuler
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
