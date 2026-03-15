// src/pages/About/index.tsx
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import {
  Award,
  Heart,
  Target,
  Eye,
  Users,
  Shield,
  Star,
  MapPin,
  Clock,
  CheckCircle,
  Waves,
} from 'lucide-react';

export function AboutPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef });
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const team = [
    {
      name: 'Alexandre Martin',
      role: 'Fondateur & Moniteur Chef',
      bio: '15 ans d\'expérience, diplômé d\'État, champion de France de kite race',
      image: '👨‍🏫',
      certs: ['BEESAN', 'Moniteur FFK', 'Sauveteur en Mer'],
    },
    {
      name: 'Sophie Dubois',
      role: 'Monitrice Senior',
      bio: 'Passionnée depuis 10 ans, spécialisée dans l\'apprentissage féminin',
      image: '👩‍🏫',
      certs: ['Monitrice FFK', 'Premiers Secours'],
    },
    {
      name: 'Lucas Bernard',
      role: 'Moniteur',
      bio: 'Ancien compétiteur, expert en freestyle et gestion de groupe',
      image: '🏄‍♂️',
      certs: ['Moniteur FFK', 'BPJEPS'],
    },
    {
      name: 'Emma Petit',
      role: 'Monitrice',
      bio: 'Pédagogue et patiente, parfaite pour les débutants et enfants',
      image: '👩‍🎓',
      certs: ['Monitrice FFK', 'BAFD'],
    },
  ];

  const values = [
    {
      icon: Shield,
      title: 'Sécurité',
      description: 'Notre priorité absolue. Encadrement rigoureux et matériel contrôlé.',
      color: 'from-blue-500 to-cyan-400',
    },
    {
      icon: Heart,
      title: 'Passion',
      description: 'Nous transmettons notre amour du kitesurf à chaque cours.',
      color: 'from-red-500 to-pink-400',
    },
    {
      icon: Target,
      title: 'Excellence',
      description: 'Un enseignement de qualité pour des progrès rapides.',
      color: 'from-purple-500 to-violet-400',
    },
    {
      icon: Users,
      title: 'Convivialité',
      description: 'Une ambiance chaleureuse dans le respect de chacun.',
      color: 'from-orange-500 to-yellow-400',
    },
  ];

  const milestones = [
    { year: '2009', title: 'Création', desc: 'Ouverture de la première école' },
    { year: '2012', title: 'Reconnaissance', desc: 'Label École Française de Kitesurf' },
    { year: '2015', title: 'Expansion', desc: 'Nouvelle base nautique équipée' },
    { year: '2018', title: 'Formation', desc: 'Plus de 3000 élèves formés' },
    { year: '2021', title: 'Innovation', desc: 'Plateforme de réservation en ligne' },
    { year: '2024', title: 'Excellence', desc: '5000+ élèves et 15 moniteurs' },
  ];

  const certifications = [
    'École Française de Kitesurf',
    'Fédération Française de Kitesurf (FFK)',
    'Label Qualité Tourisme',
    'Assurance RC Professionnelle',
    'Moniteurs Diplômés d\'État',
    'Équipement Certifié CE',
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-[60vh] flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 overflow-hidden"
      >
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -150, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 4 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 3,
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
              <span className="text-white font-medium">Depuis 2009</span>
            </motion.div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6"
          >
            Notre École
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto"
          >
            Plus de 15 ans d'expertise au service de votre apprentissage
          </motion.p>
        </motion.div>
      </section>

      {/* Story Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Notre Histoire
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Fondée en 2009 par Alexandre Martin, passionné de kitesurf depuis les débuts du sport,
                notre école est née d'une volonté simple : démocratiser le kitesurf tout en garantissant
                un enseignement de qualité et sécurisé.
              </p>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Ce qui a commencé comme une petite structure familiale est devenu au fil des années
                l'une des écoles de référence sur la côte, formant plus de 5000 élèves et accompagnant
                des passionnés de tous âges et de tous niveaux.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Notre philosophie ? Allier plaisir et sécurité, progression et convivialité, pour faire
                de chaque cours un moment unique et donner à chacun les clés pour évoluer en autonomie.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="aspect-square bg-gradient-to-br from-blue-600 to-cyan-500 rounded-3xl flex items-center justify-center">
                <Waves className="w-48 h-48 text-white/20" />
              </div>
              <div className="absolute -bottom-8 -left-8 bg-white rounded-2xl shadow-xl p-6">
                <div className="text-5xl font-bold text-blue-600">15+</div>
                <div className="text-gray-600">Années d'expérience</div>
              </div>
              <div className="absolute -top-8 -right-8 bg-white rounded-2xl shadow-xl p-6">
                <div className="text-5xl font-bold text-cyan-600">5000+</div>
                <div className="text-gray-600">Élèves formés</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Nos Valeurs
            </h2>
            <p className="text-xl text-gray-600">
              Ce qui nous anime au quotidien
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -8, scale: 1.05 }}
                className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 text-center"
              >
                <div
                  className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br ${value.color} mb-6 mx-auto`}
                >
                  <value.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Notre Parcours
            </h2>
            <p className="text-xl text-gray-600">
              Les moments clés de notre histoire
            </p>
          </motion.div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-blue-600 to-cyan-500 rounded-full hidden lg:block" />

            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={milestone.year}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className={`flex items-center ${
                    index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                  }`}
                >
                  <div className={`w-full lg:w-1/2 ${index % 2 === 0 ? 'lg:pr-16 lg:text-right' : 'lg:pl-16'}`}>
                    <div className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                      <div className="text-3xl font-bold text-blue-600 mb-2">{milestone.year}</div>
                      <div className="text-xl font-semibold text-gray-900 mb-2">{milestone.title}</div>
                      <div className="text-gray-600">{milestone.desc}</div>
                    </div>
                  </div>
                  <div className="hidden lg:flex absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-white border-4 border-blue-600 rounded-full items-center justify-center">
                    <div className="w-3 h-3 bg-blue-600 rounded-full" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Notre Équipe
            </h2>
            <p className="text-xl text-gray-600">
              Des passionnés à votre service
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -8 }}
                className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 text-center"
              >
                <div className="text-7xl mb-6">{member.image}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                <div className="text-blue-600 font-medium mb-4">{member.role}</div>
                <p className="text-gray-600 text-sm mb-6">{member.bio}</p>
                <div className="space-y-2">
                  {member.certs.map((cert) => (
                    <div
                      key={cert}
                      className="inline-flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-700"
                    >
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span>{cert}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-cyan-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Certifications & Labels
            </h2>
            <p className="text-xl text-blue-100">
              Des garanties de qualité et de sécurité
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certifications.map((cert, index) => (
              <motion.div
                key={cert}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 flex items-center space-x-4"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-white/30 rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <span className="text-white font-medium">{cert}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-start space-x-4"
            >
              <MapPin className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Localisation</h3>
                <p className="text-gray-600">
                  Plage de la Côte d'Azur<br />
                  06000 Nice, France
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="flex items-start space-x-4"
            >
              <Clock className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Horaires</h3>
                <p className="text-gray-600">
                  Tous les jours : 8h30 - 18h00<br />
                  Ouvert 7j/7 toute l'année
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex items-start space-x-4"
            >
              <Award className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Contact</h3>
                <p className="text-gray-600">
                  +33 6 00 00 00 00<br />
                  contact@kiteschool.fr
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
