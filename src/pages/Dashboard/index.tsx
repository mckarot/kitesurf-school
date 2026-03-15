// src/pages/Dashboard/index.tsx

import { useAuth } from '../../hooks/useAuth';
import { useCourses } from '../../hooks/useCourses';
import { useReservations } from '../../hooks/useReservations';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { AnimatedCard } from '../../components/ui/AnimatedCard';
import { StaggerContainer } from '../../components/ui/StaggerContainer';
import { PageTransition } from '../../components/ui/PageTransition';
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

  const handleResetDatabase = async () => {
    if (!confirm('⚠️ Attention !\n\nCette action va supprimer toutes les données de la base.\n\nÊtes-vous sûr de vouloir continuer ?')) {
      return;
    }

    try {
      console.log('🔄 Réinitialisation en cours...');

      await new Promise((resolve, reject) => {
        const request = indexedDB.deleteDatabase('KiteSurfSchoolDB');
        request.onsuccess = resolve;
        request.onerror = reject;
        request.onblocked = () => reject(new Error('Base verrouillée'));
      });

      console.log('✅ Base de données supprimée !');
      console.log('📥 Rechargement des données de seed...');
      console.log('');
      console.log('📚 Comptes de test:');
      console.log('   Admin:     admin@kiteschool.com / admin123');
      console.log('   Moniteur:  instructor@kiteschool.com / instructor123');
      console.log('   Étudiant:  student@kiteschool.com / student123');
      console.log('');

      alert('✅ Base de données réinitialisée avec succès !\n\nLes données de test vont être rechargées.');
      window.location.reload();

    } catch (error) {
      console.error('❌ Erreur:', error);
      alert('❌ Erreur lors de la réinitialisation:\n' + (error as Error).message);
    }
  };

  return (
    <PageTransition>
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
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
            <button
              onClick={handleResetDatabase}
              className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
              title="Réinitialiser la base de données"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Réinitialiser la base
            </button>
          </div>

          {/* Stats Cards avec Stagger */}
          <StaggerContainer staggerDelay={0.08} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <AnimatedCard variant="elevated">
              <CardHeader>
                <h3 className="font-medium text-gray-900">Cours disponibles</h3>
              </CardHeader>
              <CardBody>
                <p className="text-3xl font-bold text-blue-600">{activeCourses.length}</p>
              </CardBody>
            </AnimatedCard>

            <AnimatedCard variant="elevated">
              <CardHeader>
                <h3 className="font-medium text-gray-900">Réservations actives</h3>
              </CardHeader>
              <CardBody>
                <p className="text-3xl font-bold text-green-600">{activeReservations.length}</p>
              </CardBody>
            </AnimatedCard>

            <AnimatedCard variant="elevated">
              <CardHeader>
                <h3 className="font-medium text-gray-900">Niveau</h3>
              </CardHeader>
              <CardBody>
                <p className="text-lg font-medium text-gray-900 capitalize">
                  {user.role === 'student' ? 'Débutant' : 'Expert'}
                </p>
              </CardBody>
            </AnimatedCard>
          </StaggerContainer>

          {/* Navigation by Role */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {user.role === 'admin' && (
              <>
                <a href="/admin" className="block">
                  <AnimatedCard variant="elevated" className="hover:shadow-md transition cursor-pointer">
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
                  </AnimatedCard>
                </a>
                <a href="/admin/courses" className="block">
                  <AnimatedCard variant="elevated" className="hover:shadow-md transition cursor-pointer">
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
                  </AnimatedCard>
                </a>
              </>
            )}

            {user.role === 'instructor' && (
              <a href="/instructor" className="block">
                <AnimatedCard variant="elevated" className="hover:shadow-md transition cursor-pointer">
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
                </AnimatedCard>
              </a>
            )}

            {user.role === 'student' && (
              <a href="/student" className="block">
                <AnimatedCard variant="elevated" className="hover:shadow-md transition cursor-pointer">
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
                </AnimatedCard>
              </a>
            )}
          </div>

          {/* Maintenance - Bouton de réinitialisation */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <details className="bg-gray-50 rounded-lg p-4">
              <summary className="font-medium text-gray-700 cursor-pointer text-sm">
                🔧 Maintenance (Admin uniquement)
              </summary>
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-3">
                  Réinitialiser la base de données avec les données de test
                </p>
                <button
                  onClick={handleResetDatabase}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Réinitialiser la base de données
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  ⚠️ Cette action est irréversible. Toutes les données seront supprimées.
                </p>
              </div>
            </details>
          </div>
        </main>
      </div>
    </PageTransition>
  );
}
