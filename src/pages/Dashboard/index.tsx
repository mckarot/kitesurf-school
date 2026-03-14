// src/pages/Dashboard/index.tsx

import { useAuth } from '../../hooks/useAuth';
import { useCourses } from '../../hooks/useCourses';
import { useReservations } from '../../hooks/useReservations';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Navigate } from 'react-router-dom';

export function DashboardPage() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const { courses } = useCourses();
  const { reservations } = useReservations();

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

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const activeCourses = courses.filter((c) => c.isActive === 1);
  const activeReservations = reservations.filter((r) => r.status !== 'cancelled');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user.firstName[0]}{user.lastName[0]}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {user.firstName} {user.lastName}
              </p>
              <Badge
                variant={
                  user.role === 'admin'
                    ? 'danger'
                    : user.role === 'instructor'
                    ? 'info'
                    : 'default'
                }
                size="sm"
              >
                {user.role === 'admin'
                  ? 'Administrateur'
                  : user.role === 'instructor'
                  ? 'Moniteur'
                  : 'Élève'}
              </Badge>
            </div>
          </div>
          <Button variant="ghost" onClick={logout} aria-label="Déconnexion">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Tableau de bord</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card variant="elevated">
            <CardHeader>
              <h3 className="font-medium text-gray-900">Cours disponibles</h3>
            </CardHeader>
            <CardBody>
              <p className="text-3xl font-bold text-blue-600">{activeCourses.length}</p>
            </CardBody>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <h3 className="font-medium text-gray-900">Réservations actives</h3>
            </CardHeader>
            <CardBody>
              <p className="text-3xl font-bold text-green-600">{activeReservations.length}</p>
            </CardBody>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <h3 className="font-medium text-gray-900">Niveau</h3>
            </CardHeader>
            <CardBody>
              <p className="text-lg font-medium text-gray-900 capitalize">
                {user.role === 'student' ? 'Débutant' : 'Expert'}
              </p>
            </CardBody>
          </Card>
        </div>

        {/* Navigation by Role */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {user.role === 'admin' && (
            <>
              <a href="/admin" className="block">
                <Card variant="elevated" className="hover:shadow-md transition cursor-pointer">
                  <CardBody className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Gestion des utilisateurs</h3>
                      <p className="text-sm text-gray-500">Administrer les comptes</p>
                    </div>
                  </CardBody>
                </Card>
              </a>
              <a href="/admin/courses" className="block">
                <Card variant="elevated" className="hover:shadow-md transition cursor-pointer">
                  <CardBody className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Gestion des cours</h3>
                      <p className="text-sm text-gray-500">Créer et modifier les cours</p>
                    </div>
                  </CardBody>
                </Card>
              </a>
            </>
          )}

          {user.role === 'instructor' && (
            <a href="/instructor" className="block">
              <Card variant="elevated" className="hover:shadow-md transition cursor-pointer">
                <CardBody className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Mes cours</h3>
                    <p className="text-sm text-gray-500">Gérer vos sessions</p>
                  </div>
                </CardBody>
              </Card>
            </a>
          )}

          {user.role === 'student' && (
            <a href="/student" className="block">
              <Card variant="elevated" className="hover:shadow-md transition cursor-pointer">
                <CardBody className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Réserver un cours</h3>
                    <p className="text-sm text-gray-500">Voir les disponibilités</p>
                  </div>
                </CardBody>
              </Card>
            </a>
          )}
        </div>
      </main>
    </div>
  );
}
