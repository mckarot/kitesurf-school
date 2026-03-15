// src/pages/Contact/index.tsx
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  HelpCircle,
  ChevronDown,
  CheckCircle,
  MessageSquare,
  User,
  Calendar,
} from 'lucide-react';

export function ContactPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef });
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: 'Faut-il savoir nager pour faire du kitesurf ?',
      answer: 'Oui, il est recommandé de savoir nager pour pratiquer le kitesurf en toute sécurité. Cependant, le port du gilet de flottaison est obligatoire et nos moniteurs vous apprendront les techniques de sécurité pour retourner à la plage en cas de problème.',
    },
    {
      question: 'Quel âge minimum pour commencer le kitesurf ?',
      answer: 'Nous acceptons les élèves à partir de 10 ans, sous réserve d\'un poids minimum de 35kg. Le kitesurf est accessible à tous les âges, tant que la condition physique est suffisante. Nous avons des élèves de 10 à 70+ ans !',
    },
    {
      question: 'Combien de cours faut-il pour devenir autonome ?',
      answer: 'En moyenne, il faut entre 6 et 10 séances de 2h30 pour atteindre l\'autonomie. Cela varie selon les individus, leur progression et les conditions. Notre Pack Progression (6 cours) est idéal pour atteindre cet objectif.',
    },
    {
      question: 'Que dois-je apporter pour un cours ?',
      answer: 'Prévoyez un maillot de bain, une serviette, de la crème solaire, et éventuellement une combinaison si l\'eau est froide (nous en fournissons). Apportez aussi de l\'eau pour vous hydrater. Tout le reste (équipement, gilet, casque) est fourni.',
    },
    {
      question: 'Les cours ont-ils lieu tous les jours ?',
      answer: 'Oui, nous sommes ouverts 7j/7 toute l\'année, de 8h30 à 18h00. Les cours dépendent des conditions météo (vent). Nous vous confirmons la veille ou le matin même selon les prévisions.',
    },
    {
      question: 'Que se passe-t-il en cas de mauvais temps ?',
      answer: 'Si les conditions ne sont pas réunies (pas assez de vent ou vent trop fort), nous vous proposons de reprogrammer votre cours sans frais. Votre sécurité est notre priorité.',
    },
    {
      question: 'Proposez-vous des cours privés ?',
      answer: 'Oui, nous proposons des cours particuliers (1 élève), en duo (2 élèves) et collectifs (jusqu\'à 6 élèves). Le cours particulier permet une progression plus rapide et un suivi personnalisé.',
    },
    {
      question: 'Acceptez-vous les passifs FFK ?',
      answer: 'Oui, nous acceptons les passis FFK (Fédération Française de Kitesurf). Si vous avez déjà une licence, pensez à la mentionner lors de la réservation. Sinon, une assurance temporaire est incluse dans nos cours.',
    },
  ];

  const contactInfo = [
    {
      icon: Phone,
      title: 'Téléphone',
      value: '+33 6 00 00 00 00',
      href: 'tel:+33600000000',
      color: 'from-blue-500 to-cyan-400',
    },
    {
      icon: Mail,
      title: 'Email',
      value: 'contact@kiteschool.fr',
      href: 'mailto:contact@kiteschool.fr',
      color: 'from-purple-500 to-pink-400',
    },
    {
      icon: MapPin,
      title: 'Adresse',
      value: 'Plage de la Côte d\'Azur, 06000 Nice',
      href: '#',
      color: 'from-orange-500 to-yellow-400',
    },
    {
      icon: Clock,
      title: 'Horaires',
      value: 'Tous les jours 8h30 - 18h00',
      href: '#',
      color: 'from-green-500 to-emerald-400',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    }, 3000);
  };

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-[60vh] flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 overflow-hidden"
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
              <MessageSquare className="w-5 h-5 text-white" />
              <span className="text-white font-medium">Nous sommes là pour vous</span>
            </motion.div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6"
          >
            Contact & FAQ
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-purple-100 max-w-3xl mx-auto"
          >
            Une question ? Nous avons les réponses
          </motion.p>
        </motion.div>
      </section>

      {/* Contact Info Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactInfo.map((info, index) => (
              <motion.a
                key={info.title}
                href={info.href}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -8, scale: 1.05 }}
                className="group bg-gray-50 rounded-3xl p-8 text-center hover:bg-gradient-to-br hover:shadow-xl transition-all duration-300"
              >
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${info.color} mb-6 group-hover:scale-110 transition-transform`}
                >
                  <info.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{info.title}</h3>
                <p className="text-gray-600 group-hover:text-gray-900">{info.value}</p>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Envoyez-nous un message
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Remplissez le formulaire ci-dessous et nous vous répondrons sous 24h
              </p>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center"
                >
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-green-800 mb-2">Message envoyé !</h3>
                  <p className="text-green-700">Nous vous répondrons dans les plus brefs délais</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-1" />
                      Nom complet
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Votre nom"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Mail className="w-4 h-4 inline mr-1" />
                        Email
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="votre@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Phone className="w-4 h-4 inline mr-1" />
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="06 00 00 00 00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Sujet
                    </label>
                    <select
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="">Sélectionnez un sujet</option>
                      <option value="reservation">Réservation de cours</option>
                      <option value="information">Demande d'information</option>
                      <option value="partenaire">Devenir partenaire</option>
                      <option value="presse">Presse / Média</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={5}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      placeholder="Votre message..."
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                  >
                    <Send className="w-5 h-5" />
                    <span>Envoyer le message</span>
                  </motion.button>
                </form>
              )}
            </motion.div>

            {/* Map Placeholder */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="sticky top-24">
                <div className="aspect-square bg-gradient-to-br from-blue-600 to-cyan-500 rounded-3xl flex items-center justify-center overflow-hidden">
                  <div className="text-center text-white p-8">
                    <MapPin className="w-24 h-24 mx-auto mb-6 opacity-50" />
                    <h3 className="text-3xl font-bold mb-4">Nous trouver</h3>
                    <p className="text-blue-100 mb-6">
                      Plage de la Côte d'Azur<br />
                      06000 Nice, France
                    </p>
                    <a
                      href="https://maps.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 bg-white text-blue-600 px-6 py-3 rounded-full font-semibold hover:bg-blue-50 transition-all"
                    >
                      <span>Ouvrir dans Google Maps</span>
                    </a>
                  </div>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="bg-white rounded-2xl p-6 shadow-lg"
                  >
                    <Clock className="w-8 h-8 text-blue-600 mb-3" />
                    <div className="text-sm text-gray-600">Horaires</div>
                    <div className="font-semibold text-gray-900">8h30 - 18h00</div>
                    <div className="text-xs text-gray-500">7j/7 toute l'année</div>
                  </motion.div>
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="bg-white rounded-2xl p-6 shadow-lg"
                  >
                    <Phone className="w-8 h-8 text-cyan-600 mb-3" />
                    <div className="text-sm text-gray-600">Urgence</div>
                    <div className="font-semibold text-gray-900">+33 6 00 00 00 00</div>
                    <div className="text-xs text-gray-500">Disponible 24/7</div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl mb-6">
              <HelpCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Questions Fréquentes
            </h2>
            <p className="text-xl text-gray-600">
              Trouvez rapidement les réponses à vos questions
            </p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
                className="border border-gray-200 rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900 pr-8">{faq.question}</span>
                  <motion.div
                    animate={{ rotate: openFaq === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  </motion.div>
                </button>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: openFaq === index ? 'auto' : 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-5 text-gray-600 leading-relaxed">
                    {faq.answer}
                  </div>
                </motion.div>
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
              Prêt à vous lancer ?
            </h2>
            <p className="text-xl text-blue-100 mb-12">
              Réservez votre cours de kitesurf dès maintenant
            </p>
            <a
              href="/student"
              className="inline-flex items-center space-x-2 bg-white text-blue-600 px-10 py-5 rounded-full font-semibold text-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl"
            >
              <Calendar className="w-6 h-6" />
              <span>Réserver un cours</span>
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
