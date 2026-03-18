// src/pages/Courses/index.tsx
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import {
  Users,
  User,
  UsersRound,
  Star,
  Check,
  Clock,
  Award,
  Wind,
  ArrowRight,
  Calendar,
  Heart,
  Zap,
  Target,
  Trophy,
  Medal,
  Flame,
  Droplet,
  Sun,
  Moon,
  Cloud,
  CloudRain,
} from 'lucide-react';
import { useCourseCards } from '../../hooks/useCourseCards';
import { usePackCards } from '../../hooks/usePackCards';

// Map icon names to actual components
const ICON_MAP: Record<string, any> = {
  Users,
  User,
  UsersRound,
  Star,
  Award,
  Wind,
  Clock,
  Calendar,
  Check,
  Heart,
  Zap,
  Target,
  Trophy,
  Medal,
  Flame,
  Droplet,
  Sun,
  Moon,
  Cloud,
  CloudRain,
};

export function CoursesPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef });
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const { cards: courseCards, isLoading: courseCardsLoading } = useCourseCards();
  const { cards: packCards, isLoading: packCardsLoading } = usePackCards();

  // Afficher un loader pendant le chargement des données
  if (courseCardsLoading || packCardsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div aria-busy="true" aria-live="polite" className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement des cours...</p>
        </div>
      </div>
    );
  }

  // Filtrer les cartes actives
  const activeCourseCards = courseCards.filter(card => card.isActive === 1);
  const activePackCards = packCards.filter(card => card.isActive === 1);

  const levels = [
    {
      icon: Wind,
      title: 'Débutant',
      description: "Première fois sur l'eau ? Nos moniteurs vous accompagnent pas à pas",
      skills: ['Prise en main', 'Sécurité', 'Premiers bords'],
    },
    {
      icon: Award,
      title: 'Intermédiaire',
      description: 'Vous avez les bases ? Perfectionnez votre technique',
      skills: ['Navigation', 'Virages', 'Premiers sauts'],
    },
    {
      icon: Star,
      title: 'Avancé',
      description: 'Vous êtes autonome ? Passez au niveau supérieur',
      skills: ['Freestyle', 'Vagues', 'Race'],
    },
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-[60vh] flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 overflow-hidden"
      >
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(25)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -120, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <motion.div
          style={{ opacity }}
          className="relative z-10 text-center px-4"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-8"
            >
              <Award className="w-5 h-5 text-white" />
              <span className="text-white font-medium">Formation Professionnelle</span>
            </motion.div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6"
          >
            Cours & Tarifs
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto"
          >
            Des formules adaptées à tous les niveaux et tous les budgets
          </motion.p>
        </motion.div>
      </section>

      {/* Levels Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Tous Niveaux
            </h2>
            <p className="text-xl text-gray-600">
              Un parcours personnalisé pour chaque élève
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {levels.map((level, index) => (
              <motion.div
                key={level.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -8 }}
                className="group bg-gray-50 rounded-3xl p-8 hover:bg-gradient-to-br hover:from-blue-50 hover:to-cyan-50 transition-all duration-300"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-6 group-hover:scale-110 transition-transform">
                  <level.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{level.title}</h3>
                <p className="text-gray-600 mb-6">{level.description}</p>
                <ul className="space-y-2">
                  {level.skills.map((skill) => (
                    <li key={skill} className="flex items-center space-x-2 text-gray-700">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Nos Formules
            </h2>
            <p className="text-xl text-gray-600">
              Choisissez le format qui vous correspond
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {activeCourseCards.map((course, index) => {
              const IconComponent = ICON_MAP[course.icon] || Users;
              return (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ y: -12, scale: 1.02 }}
                  className={`relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 ${
                    course.isHighlighted === 1 ? 'ring-2 ring-purple-500 ring-offset-4' : ''
                  }`}
                >
                  {course.badge && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                        {course.badge}
                      </div>
                    </div>
                  )}

                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${course.color} mb-6`}
                  >
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{course.title}</h3>
                  <p className="text-gray-600 mb-6">{course.description}</p>

                  <div className="flex items-baseline mb-6">
                    <span className="text-5xl font-bold text-gray-900">{course.price}€</span>
                    <span className="text-gray-600 ml-2">/séance</span>
                  </div>

                  <div className="space-y-3 mb-8">
                    <div className="flex items-center space-x-2 text-gray-700">
                      <Clock className="w-5 h-5 text-blue-500" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-700">
                      <Users className="w-5 h-5 text-blue-500" />
                      <span>Max {course.maxStudents} {course.maxStudents === 1 ? 'élève' : 'élèves'}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-700">
                      <Award className="w-5 h-5 text-blue-500" />
                      <span>{course.level}</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {course.features.map((feature) => (
                      <li key={feature} className="flex items-start space-x-2">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    to="/student"
                    className={`block w-full py-4 rounded-xl font-semibold text-center transition-all ${
                      course.isHighlighted === 1 || course.badge
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    Réserver
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Packs Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Packs Économiques
            </h2>
            <p className="text-xl text-gray-600">
              Plus vous réservez, plus vous économisez
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {activePackCards.map((pack, index) => (
              <motion.div
                key={pack.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -12, scale: 1.02 }}
                className={`relative bg-gradient-to-br from-gray-50 to-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 ${
                  pack.isHighlighted === 1 ? 'border-purple-500' : 'border-transparent'
                }`}
              >
                {pack.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      {pack.badge}
                    </div>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{pack.title}</h3>
                  <p className="text-gray-600">{pack.description}</p>
                </div>

                <div className="text-center mb-6">
                  <div className="flex items-center justify-center space-x-3">
                    <span className="text-5xl font-bold text-gray-900">{pack.price}€</span>
                    {pack.originalPrice && (
                      <div className="text-left">
                        <div className="text-sm text-gray-500 line-through">{pack.originalPrice}€</div>
                        {pack.discount !== undefined && pack.discount > 0 && (
                          <div className="text-sm text-green-600 font-semibold">-{pack.discount}€</div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-gray-600 mt-2">{pack.sessions} séances</div>
                </div>

                <ul className="space-y-3 mb-8">
                  {pack.features.map((feature) => (
                    <li key={feature} className="flex items-start space-x-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to="/student"
                  className={`block w-full py-4 rounded-xl font-semibold text-center transition-all ${
                    pack.isHighlighted === 1 || pack.badge
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  Choisir ce pack
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-cyan-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Prêt à commencer ?
            </h2>
            <p className="text-xl text-blue-100 mb-12">
              Réservez votre cours dès maintenant et vivez l'expérience kitesurf
            </p>
            <Link
              to="/student"
              className="inline-flex items-center space-x-2 bg-white text-blue-600 px-10 py-5 rounded-full font-semibold text-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl"
            >
              <Calendar className="w-6 h-6" />
              <span>Réserver maintenant</span>
              <ArrowRight className="w-6 h-6" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
