// src/pages/Equipment/index.tsx
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState } from 'react';
import {
  Waves,
  Shield,
  Wind,
  Check,
  ZoomIn,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export function EquipmentPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef });
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const equipment = [
    {
      category: 'Ailes',
      icon: Wind,
      description: "Notre flotte d'ailes est renouvelée chaque année pour vous offrir le meilleur matériel",
      items: [
        { name: 'Duotone Neo', sizes: '5m² à 12m²', description: 'Polyvalente, idéale pour le wave' },
        { name: 'North Reach', sizes: '6m² à 14m²', description: 'Performance et stabilité' },
        { name: 'Cabrinha Switchblade', sizes: '7m² à 12m²', description: 'Freestyle et big air' },
      ],
    },
    {
      category: 'Planches',
      icon: Waves,
      description: 'Des planches adaptées à tous les niveaux et toutes les pratiques',
      items: [
        { name: 'Duotine Twin Tip', sizes: '120cm à 142cm', description: 'Débutant à confirmé' },
        { name: 'North Surf', sizes: "5'4 à 6'2", description: 'Pour la vague' },
        { name: 'F-One Race', sizes: '136cm à 140cm', description: 'Performance et vitesse' },
      ],
    },
    {
      category: 'Sécurité',
      icon: Shield,
      description: "Votre sécurité est notre priorité, tout l'équipement est contrôlé quotidiennement",
      items: [
        { name: "Gilets d'impact", sizes: 'XS à XXL', description: 'Protection et flottaison' },
        { name: 'Casques', sizes: 'Tous âges', description: 'Protection de la tête' },
        { name: 'Lignes de sécurité', sizes: 'Standard', description: 'Système de largage rapide' },
      ],
    },
  ];

  const gallery = [
    { src: '🪁', alt: 'Aile de kitesurf sur la plage' },
    { src: '🏄', alt: 'Kitesurfeur en action' },
    { src: '🌊', alt: 'Vagues et kite' },
    { src: '⛵', alt: 'Équipement complet' },
    { src: '🎯', alt: 'Session de formation' },
    { src: '📸', alt: 'Coucher de soleil kite' },
    { src: '🏆', alt: 'Progression élève' },
    { src: '🌅', alt: 'Session matinale' },
    { src: '💪', alt: 'Kite power' },
    { src: '🎨', alt: 'Couleurs du kite' },
    { src: '⚡', alt: 'Action sportive' },
    { src: '🔥', alt: 'Session intense' },
  ];

  const features = [
    {
      title: 'Matériel Premium',
      description: 'Nous travaillons avec les plus grandes marques : Duotone, North, Cabrinha, F-One',
    },
    {
      title: 'Entretien Quotidien',
      description: 'Chaque équipement est vérifié, nettoyé et séché après chaque utilisation',
    },
    {
      title: 'Renouvellement Annuel',
      description: 'Notre flotte est renouvelée chaque année pour garantir performance et sécurité',
    },
    {
      title: 'Taille Adaptée',
      description: 'Nous sélectionnons le matériel idéal selon votre poids, niveau et conditions',
    },
  ];

  const openLightbox = (index: number) => setSelectedImage(index);
  const closeLightbox = () => setSelectedImage(null);
  const prevImage = () => setSelectedImage((prev) => (prev === null ? 0 : (prev - 1 + gallery.length) % gallery.length));
  const nextImage = () => setSelectedImage((prev) => (prev === null ? 0 : (prev + 1) % gallery.length));

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-[60vh] flex items-center justify-center bg-gradient-to-br from-cyan-600 via-blue-700 to-purple-700 overflow-hidden"
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
              <span className="text-white font-medium">Qualité & Sécurité</span>
            </motion.div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6"
          >
            Notre Équipement
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto"
          >
            Du matériel premium, entretenu et renouvelé chaque année
          </motion.p>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl mb-6">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Equipment Categories Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Notre Flotte
            </h2>
            <p className="text-xl text-gray-600">
              Un équipement adapté à tous les niveaux et toutes les pratiques
            </p>
          </motion.div>

          <div className="space-y-16">
            {equipment.map((category, catIndex) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: catIndex * 0.15, duration: 0.6 }}
              >
                <div className="flex items-center space-x-4 mb-8">
                  <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center">
                    <category.icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900">{category.category}</h3>
                    <p className="text-gray-600">{category.description}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {category.items.map((item, itemIndex) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: itemIndex * 0.1, duration: 0.5 }}
                      whileHover={{ y: -4 }}
                      className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all"
                    >
                      <h4 className="text-xl font-bold text-gray-900 mb-2">{item.name}</h4>
                      <div className="text-blue-600 font-semibold mb-2">{item.sizes}</div>
                      <p className="text-gray-600">{item.description}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Galerie
            </h2>
            <p className="text-xl text-gray-600">
              Découvrez l'ambiance KiteSchool en images
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {gallery.map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
                whileHover={{ scale: 1.05, zIndex: 10 }}
                onClick={() => openLightbox(index)}
                className="relative aspect-square bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center cursor-pointer overflow-hidden group"
              >
                <span className="text-6xl group-hover:scale-110 transition-transform duration-300">
                  {image.src}
                </span>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                  <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {selectedImage !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-8 h-8" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
            className="absolute left-4 p-2 text-white hover:bg-white/20 rounded-full transition-colors"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
            className="absolute right-4 p-2 text-white hover:bg-white/20 rounded-full transition-colors"
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          <div
            className="text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-9xl mb-4">{gallery[selectedImage].src}</div>
            <p className="text-white text-lg">{gallery[selectedImage].alt}</p>
            <div className="text-white/60 mt-2">
              {selectedImage + 1} / {gallery.length}
            </div>
          </div>
        </motion.div>
      )}

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-cyan-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Envie d'essayer ?
            </h2>
            <p className="text-xl text-blue-100 mb-12">
              Tout l'équipement est inclus dans nos cours. Réservez votre session maintenant !
            </p>
            <a
              href="/student"
              className="inline-flex items-center space-x-2 bg-white text-blue-600 px-10 py-5 rounded-full font-semibold text-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl"
            >
              <Waves className="w-6 h-6" />
              <span>Réserver un cours</span>
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
