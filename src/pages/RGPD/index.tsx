// src/pages/RGPD/index.tsx
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  FileText,
  Lock,
  User,
  Database,
  Eye,
  Download,
  Trash,
  Mail,
  CheckCircle,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';

export function RGPDPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef });
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const principles = [
    {
      icon: Eye,
      title: 'Transparence',
      description: "Nous vous informons clairement de l'utilisation de vos données",
    },
    {
      icon: Lock,
      title: 'Sécurité',
      description: 'Vos données sont protégées et stockées de manière sécurisée',
    },
    {
      icon: User,
      title: 'Contrôle',
      description: 'Vous gardez le contrôle sur vos données personnelles',
    },
    {
      icon: Database,
      title: 'Minimisation',
      description: 'Nous ne collectons que les données strictement nécessaires',
    },
  ];

  const rights = [
    {
      icon: Eye,
      title: "Droit d'accès",
      description: 'Vous pouvez accéder à toutes vos données personnelles',
      action: 'Accéder à mes données',
      link: '/profil/mes-donnees',
    },
    {
      icon: FileText,
      title: 'Droit de rectification',
      description: 'Vous pouvez modifier vos informations à tout moment',
      action: 'Modifier mon profil',
      link: '/profil/modifier',
    },
    {
      icon: Trash,
      title: "Droit à l'effacement",
      description: 'Vous pouvez demander la suppression de votre compte',
      action: 'Supprimer mon compte',
      link: '/profil/supprimer-compte',
    },
    {
      icon: Mail,
      title: "Droit d'opposition",
      description: "Vous pouvez vous opposer au traitement de vos données",
      action: 'Gérer les consentements',
      link: '/profil/consentements',
    },
  ];

  const dataCollected = [
    {
      category: 'Informations personnelles',
      items: ['Nom', 'Prénom', 'Date de naissance', 'Nationalité'],
      purpose: 'Identification et gestion des inscriptions',
      retention: "Durée de l'abonnement + 3 ans",
    },
    {
      category: 'Coordonnées',
      items: ['Adresse email', 'Numéro de téléphone', 'Adresse postale'],
      purpose: 'Communication et contact',
      retention: "Durée de l'abonnement + 3 ans",
    },
    {
      category: 'Données de santé',
      items: ['Certificat médical', 'Informations médicales'],
      purpose: 'Sécurité et adaptation des cours',
      retention: "Durée de l'abonnement + 1 an",
    },
    {
      category: 'Données de navigation',
      items: ['Historique de réservation', 'Préférences'],
      purpose: 'Amélioration du service',
      retention: "Durée de l'abonnement + 1 an",
    },
  ];

  const security = [
    {
      icon: Shield,
      title: 'Chiffrement',
      description: 'Toutes les données sont chiffrées lors du transfert (HTTPS/TLS)',
    },
    {
      icon: Lock,
      title: 'Stockage sécurisé',
      description: 'Base de données locale chiffrée (IndexedDB)',
    },
    {
      icon: User,
      title: 'Accès restreint',
      description: 'Seul le personnel autorisé accède à vos données',
    },
    {
      icon: CheckCircle,
      title: 'Sauvegardes',
      description: 'Sauvegardes régulières pour prévenir la perte de données',
    },
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-[60vh] flex items-center justify-center bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 overflow-hidden"
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
              <Shield className="w-5 h-5 text-white" />
              <span className="text-white font-medium">Protection des données</span>
            </motion.div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6"
          >
            Politique RGPD
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-purple-100 max-w-3xl mx-auto"
          >
            Vos données personnelles sont protégées et vous gardez le contrôle total
          </motion.p>
        </motion.div>
      </section>

      {/* Principles Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Nos Engagements
            </h2>
            <p className="text-xl text-gray-600">
              Conformité totale avec le Règlement Général sur la Protection des Données
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {principles.map((principle, index) => (
              <motion.div
                key={principle.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -8 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-400 rounded-2xl mb-6">
                  <principle.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{principle.title}</h3>
                <p className="text-gray-600">{principle.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Rights Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Vos Droits
            </h2>
            <p className="text-xl text-gray-600">
              Conformément au RGPD, vous disposez de droits sur vos données
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {rights.map((right, index) => (
              <motion.div
                key={right.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -8, scale: 1.05 }}
                className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-2xl mb-6">
                  <right.icon className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{right.title}</h3>
                <p className="text-gray-600 mb-6">{right.description}</p>
                <Link
                  to={right.link}
                  className="inline-flex items-center space-x-2 text-purple-600 font-semibold hover:text-purple-700 transition-colors"
                >
                  <span>{right.action}</span>
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Collection Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Données Collectées
            </h2>
            <p className="text-xl text-gray-600">
              Nous ne collectons que les données strictement nécessaires
            </p>
          </motion.div>

          <div className="space-y-8">
            {dataCollected.map((data, index) => (
              <motion.div
                key={data.category}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{data.category}</h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {data.items.map((item) => (
                        <span
                          key={item}
                          className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="md:text-right space-y-2">
                    <div>
                      <span className="text-sm text-gray-500">Finalité : </span>
                      <span className="text-gray-900 font-medium">{data.purpose}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Conservation : </span>
                      <span className="text-gray-900 font-medium">{data.retention}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-24 bg-gradient-to-br from-purple-600 to-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Sécurité des Données
            </h2>
            <p className="text-xl text-purple-100">
              Nous mettons tout en œuvre pour protéger vos informations
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {security.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/30 rounded-2xl mb-6">
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-purple-100">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact DPO Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-400 rounded-2xl mb-6">
              <Mail className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Délégué à la Protection des Données
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Pour toute question relative à la protection de vos données personnelles,
              vous pouvez contacter notre DPO à :
            </p>
            <a
              href="mailto:dpo@kiteschool.fr"
              className="inline-flex items-center space-x-2 bg-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-purple-700 transition-all shadow-lg hover:shadow-xl"
            >
              <Mail className="w-6 h-6" />
              <span>dpo@kiteschool.fr</span>
            </a>
            <p className="text-gray-500 mt-4">
              Réponse sous 48h ouvrées
            </p>
          </motion.div>
        </div>
      </section>

      {/* Last Update */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-600">
            <p className="text-sm">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <p className="text-xs mt-2">
              Cette politique peut être modifiée à tout moment. Nous vous informerons de tout changement important.
            </p>
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
              Gérez vos données
            </h2>
            <p className="text-xl text-blue-100 mb-12">
              Accédez, modifiez ou supprimez vos données personnelles à tout moment
            </p>
            <Link
              to="/profil/mes-donnees"
              className="inline-flex items-center space-x-2 bg-white text-blue-600 px-10 py-5 rounded-full font-semibold text-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl"
            >
              <User className="w-6 h-6" />
              <span>Accéder à mon profil</span>
              <ArrowRight className="w-6 h-6" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
