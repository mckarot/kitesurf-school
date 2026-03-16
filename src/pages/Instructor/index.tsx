// src/pages/Instructor/index.tsx
// Espace Moniteur avec design Metalab

import { useLoaderData } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useCourses } from '../../hooks/useCourses';
import { useReservations } from '../../hooks/useReservations';
import { Badge } from '../../components/ui/Badge';
import { Navigate } from 'react-router-dom';
import { AssignedStudents } from './AssignedStudents';
import { ScheduleWithStudents } from './ScheduleWithStudents';
import { InstructorErrorBoundary } from './InstructorErrorBoundary';
import type { InstructorLoaderData } from './loader';
import { 
  Users, 
  Calendar, 
  BookOpen, 
  Clock, 
  AlertCircle,
  TrendingUp,
  CheckCircle,
  UserCheck
} from 'lucide-react';

/**
 * Page Moniteur - Espace de Gestion
 * Design Metalab harmonisé
 */
export function InstructorPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { credits, timeSlots, students, reservations, courses, instructorId, courseSessions } = useLoaderData() as InstructorLoaderData;

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

  const myCourses = courses.filter((c) => c.instructorId === instructorId && c.isActive === 1);

  const getReservationCount = (courseId: number): number => {
    return reservations.filter(
      (r) => r.courseId === courseId && r.status !== 'cancelled'
    ).length;
  };

  const totalReservations = myCourses.reduce((acc, c) => acc + getReservationCount(c.id), 0);

  return (
    <InstructorErrorBoundary>
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
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl"
                >
                  <UserCheck className="w-8 h-8 text-white" />
                </motion.div>
                <div>
                  <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="text-4xl md:text-5xl font-bold"
                  >
                    Bonjour {user.firstName} !
                  </motion.h1>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="flex items-center space-x-3 mt-2"
                  >
                    <Badge variant="info" className="text-sm px-4 py-1.5 bg-white/20 text-white border-white/30">
                      Moniteur
                    </Badge>
                    <span className="text-purple-100">
                      {user.email}
                    </span>
                  </motion.div>
                </div>
              </div>
              <motion.a
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="/dashboard"
                className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full hover:bg-white/30 transition-all"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="font-medium">Retour</span>
              </motion.a>
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {/* Mes cours */}
            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              className="bg-white rounded-3xl shadow-xl p-6 border border-purple-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Mes cours</p>
                  <p className="text-4xl font-bold text-purple-600">{myCourses.length}</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-400 rounded-2xl flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
              </div>
            </motion.div>

            {/* Réservations totales */}
            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              className="bg-white rounded-3xl shadow-xl p-6 border border-green-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Réservations</p>
                  <p className="text-4xl font-bold text-green-600">{totalReservations}</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-400 rounded-2xl flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
              </div>
            </motion.div>

            {/* Élèves inscrits */}
            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              className="bg-white rounded-3xl shadow-xl p-6 border border-blue-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Élèves</p>
                  <p className="text-4xl font-bold text-blue-600">{students.length}</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
              </div>
            </motion.div>

            {/* Créneaux horaires */}
            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              className="bg-white rounded-3xl shadow-xl p-6 border border-orange-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Créneaux</p>
                  <p className="text-4xl font-bold text-orange-600">{timeSlots.length}</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-yellow-400 rounded-2xl flex items-center justify-center">
                  <Clock className="w-8 h-8 text-white" />
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex flex-wrap gap-4 mb-8"
          >
            <a
              href="/instructor/timeslots"
              className="flex items-center space-x-2 bg-white text-red-600 px-6 py-3 rounded-full font-semibold hover:bg-red-50 transition-all shadow-lg hover:shadow-xl"
            >
              <AlertCircle className="w-5 h-5" />
              <span>Indisponibilités</span>
            </a>
            <a
              href="/instructor/calendar"
              className="flex items-center space-x-2 bg-white text-purple-600 px-6 py-3 rounded-full font-semibold hover:bg-purple-50 transition-all shadow-lg hover:shadow-xl"
            >
              <Calendar className="w-5 h-5" />
              <span>Calendrier</span>
            </a>
          </motion.div>

          {/* Section: Mes élèves assignés */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center space-x-2 mb-6">
              <UserCheck className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">Mes élèves assignés</h2>
            </div>
            <AssignedStudents
              students={students}
              allCredits={credits}
              instructorId={user.id}
            />
          </motion.section>

          {/* Section: Emploi du temps avec élèves */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center space-x-2 mb-6">
              <Calendar className="w-6 h-6 text-pink-600" />
              <h2 className="text-2xl font-bold text-gray-900">Emploi du temps</h2>
            </div>
            <ScheduleWithStudents
              timeSlots={timeSlots}
              reservations={reservations}
              students={students}
              courses={courses}
              courseSessions={courseSessions}
            />
          </motion.section>

          {/* My Courses */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center space-x-2 mb-6">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Mes cours</h2>
            </div>
            {myCourses.length === 0 ? (
              <div className="bg-white rounded-3xl shadow-xl p-12 text-center border border-purple-100">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="w-10 h-10 text-gray-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Aucun cours assigné</h3>
                <p className="text-gray-600 mb-6">
                  Contactez l'administrateur pour être assigné à des cours
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myCourses.map((course, index) => {
                  const reservationCount = getReservationCount(course.id);
                  return (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.4 }}
                      whileHover={{ y: -4, scale: 1.02 }}
                      className="bg-white rounded-3xl shadow-xl p-6 border border-purple-100"
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
                        <span className="text-sm text-gray-500 font-medium">
                          {reservationCount}/{course.maxStudents} élèves
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 mb-3">
                        {course.title}
                      </h3>

                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {course.description}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-purple-100">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Users className="w-4 h-4 text-purple-600" />
                          <span>Max {course.maxStudents}</span>
                        </div>
                        <div className="text-lg font-bold text-purple-600">
                          {course.price}€
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.section>
        </main>
      </div>
    </InstructorErrorBoundary>
  );
}

export default InstructorPage;
