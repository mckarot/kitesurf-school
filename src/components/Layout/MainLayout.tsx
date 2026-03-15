// src/components/Layout/MainLayout.tsx
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  Menu,
  X,
  Waves,
  Calendar,
  Users,
  Phone,
  Info,
  Home,
  Shield,
  LogOut,
  User,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface MainLayoutProps {
  requireAuth?: boolean;
  allowedRoles?: ('student' | 'instructor' | 'admin')[];
}

const navItems = [
  { path: '/home', label: 'Accueil', icon: Home },
  { path: '/about', label: 'À Propos', icon: Info },
  { path: '/courses', label: 'Cours & Tarifs', icon: Users },
  { path: '/equipment', label: 'Équipement', icon: Waves },
  { path: '/student', label: 'Réserver', icon: Calendar },
  { path: '/contact', label: 'Contact', icon: Phone },
];

export function MainLayout({ requireAuth = false, allowedRoles }: MainLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Redirect to login if auth required and user not connected
  useEffect(() => {
    if (requireAuth && !user && !isRedirecting) {
      setIsRedirecting(true);
      navigate('/login', { state: { from: location.pathname }, replace: true });
    } else if (requireAuth && user && allowedRoles && !allowedRoles.includes(user.role)) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, requireAuth, allowedRoles, navigate, location.pathname, isRedirecting]);

  const handleLogout = () => {
    logout();
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/90 backdrop-blur-md shadow-lg'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/home" className="flex items-center space-x-3">
              <motion.div
                whileHover={{ rotate: 10, scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Waves className="w-10 h-10 text-blue-600" />
              </motion.div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                KiteSchool
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => (
                <motion.div
                  key={item.path}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to={item.path}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      location.pathname === item.path
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* User Actions */}
            <div className="hidden lg:flex items-center space-x-4">
              {user && (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/reservations"
                    className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    Historique
                  </Link>
                  <Link
                    to="/profil/mes-donnees"
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">{user.firstName} {user.lastName}</span>
                  </Link>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                  </motion.button>
                </div>
              )}
              {!user && (
                <Link
                  to="/login"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Connexion
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-gray-700"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-20 left-0 right-0 z-40 bg-white shadow-lg lg:hidden"
          >
            <div className="px-4 py-6 space-y-2">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${
                      location.pathname === item.path
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </motion.div>
              ))}
              {user && (
                <>
                  <div className="border-t border-gray-200 my-4" />
                  <Link
                    to="/reservations"
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    <Calendar className="w-5 h-5" />
                    <span className="font-medium">Historique</span>
                  </Link>
                  <Link
                    to="/profil/mes-donnees"
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    <Shield className="w-5 h-5" />
                    <span className="font-medium">Mon Profil</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Déconnexion</span>
                  </button>
                </>
              )}
              {!user && (
                <>
                  <div className="border-t border-gray-200 my-4" />
                  <Link
                    to="/login"
                    className="flex items-center space-x-3 px-4 py-3 text-blue-600 hover:bg-blue-50 rounded-lg font-medium"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Connexion</span>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="pt-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Waves className="w-8 h-8 text-blue-500" />
                <span className="text-xl font-bold">KiteSchool</span>
              </div>
              <p className="text-gray-400 text-sm">
                École de kitesurf professionnelle. Apprenez en toute sécurité avec des moniteurs certifiés.
              </p>
              <div className="flex space-x-4">
                {['facebook', 'instagram', 'youtube'].map((social) => (
                  <motion.a
                    key={social}
                    href="#"
                    whileHover={{ scale: 1.2, y: -2 }}
                    className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                  >
                    <span className="sr-only">{social}</span>
                    <div className="w-5 h-5 bg-gray-400 rounded" />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Liens Rapides</h3>
              <ul className="space-y-2">
                {navItems.slice(0, 4).map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Légal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/rgpd" className="text-gray-400 hover:text-white transition-colors">
                    Politique RGPD
                  </Link>
                </li>
                <li>
                  <Link to="/mentions-legales" className="text-gray-400 hover:text-white transition-colors">
                    Mentions Légales
                  </Link>
                </li>
                <li>
                  <Link to="/cgv" className="text-gray-400 hover:text-white transition-colors">
                    CGV
                  </Link>
                </li>
                <li>
                  <Link to="/confidentialite" className="text-gray-400 hover:text-white transition-colors">
                    Confidentialité
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span>+33 6 00 00 00 00</span>
                </li>
                <li>
                  <a href="mailto:contact@kiteschool.fr" className="hover:text-white transition-colors">
                    contact@kiteschool.fr
                  </a>
                </li>
                <li>
                  <p>Plage de la Côte d'Azur</p>
                  <p>06000 Nice, France</p>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400 text-sm">
            <p>© {new Date().getFullYear()} KiteSchool. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
