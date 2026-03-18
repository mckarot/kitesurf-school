// src/db/migrations/v15.ts
// Migration v15 : Tables courseCards et packCards pour affichage dynamique sur /courses
// + Champs de surbrillance et badges personnalisables

import type { KiteSurfDB } from '../db';

/**
 * Configure la migration V15 de la base de données
 *
 * Changements :
 * - Ajout de la table courseCards (cartes de cours affichées sur /courses)
 * - Ajout de la table packCards (cartes de packs affichées sur /courses)
 * - Permet à l'admin de gérer les contenus, prix, badges et surbrillances
 *
 * courseCards :
 * - Stocke les informations complètes des cours (collectif, particulier, duo)
 * - Inclut titre, description, prix, durée, max élèves, niveau, features
 * - Badge optionnel ("Plus populaire", etc.) et surbrillance
 * - Couleur et icône personnalisables
 *
 * packCards :
 * - Stocke les informations complètes des packs (3, 6, 10 séances)
 * - Inclut titre, description, sessions, prix, prix original, économie
 * - Liste des avantages (features)
 * - Badge optionnel ("Meilleure offre", etc.) et surbrillance
 *
 * Index :
 * - courseCards : ++id, courseType, [courseType+isActive], isActive, createdAt
 * - packCards : ++id, packType, [packType+isActive], isActive, createdAt
 */
export function configureV15Migration(db: KiteSurfDB): void {
  db.version(15).stores({
    // Tables existantes (inchangées)
    users: '++id, email, role, isActive, createdAt',
    courses: '++id, instructorId, level, isActive, createdAt',
    reservations: '++id, studentId, courseId, status, createdAt',
    courseSessions: '++id, courseId, isActive, createdAt, [courseId+date+startTime]',
    timeSlots: '++id, instructorId, date, isAvailable, createdAt',
    userPhysicalData: '++id, userId',
    userHealthData: '++id, userId',
    userProgression: '++id, userId',
    transactions: '++id, userId, reservationId, status, createdAt',
    courseCredits: '++id, studentId, [studentId+status], status, createdAt',
    notifications: '++id, userId, [userId+read], type, createdAt',
    deletionRequests: '++id, userId, status, requestedAt, confirmationToken',
    userConsents: '++id, userId, consentType, status, [userId+consentType]',
    schoolSchedule: '++id, dayOfWeek, isActive, createdAt',
    instructorAvailability: '++id, [instructorId+date+scheduleId], instructorId, date, isAvailable, createdAt',
    userWallets: '++id, userId, balance, createdAt',
    coursePricing: '++id, courseType, [courseType+isActive], isActive, createdAt',
    sessionExceptions: '++id, sessionId, [sessionId+type], date, createdAt',
    // NOUVELLES TABLES
    courseCards: '++id, courseType, [courseType+isActive], isActive, createdAt',
    packCards: '++id, packType, [packType+isActive], isActive, createdAt',
  }).upgrade(async (tx) => {
    // ── 1. Initialiser les courseCards par défaut ───────────────────────────────
    // Ces cartes pourront être modifiées par l'admin via /admin/pricing
    const defaultCourseCards = [
      {
        courseType: 'collectif' as const,
        title: 'Cours Collectif',
        description: 'Apprenez en groupe dans une ambiance conviviale',
        price: 70,
        duration: '2h30',
        maxStudents: 6,
        level: 'Tous niveaux',
        features: [
          'Matériel inclus',
          'Équipement de sécurité',
          'Briefing théorique',
          'Pratique encadrée',
          'Débriefing personnalisé',
          'Attestation de progression',
        ],
        badge: '',
        isHighlighted: 0 as 0 | 1,
        color: 'from-blue-500 to-cyan-400',
        icon: 'Users',
        isActive: 1 as 0 | 1,
        createdAt: Date.now(),
      },
      {
        courseType: 'particulier' as const,
        title: 'Cours Particulier',
        description: 'Un accompagnement 100% personnalisé',
        price: 120,
        duration: '2h30',
        maxStudents: 1,
        level: 'Tous niveaux',
        features: [
          'Matériel premium inclus',
          'Moniteur dédié',
          'Programme sur mesure',
          'Flexibilité horaire',
          'Vidéo analyse',
          'Suivi personnalisé',
        ],
        badge: 'Plus populaire',
        isHighlighted: 1 as 0 | 1,
        color: 'from-purple-500 to-pink-400',
        icon: 'User',
        isActive: 1 as 0 | 1,
        createdAt: Date.now(),
      },
      {
        courseType: 'duo' as const,
        title: 'Cours Duo',
        description: "Partagez l'expérience à deux",
        price: 95,
        duration: '2h30',
        maxStudents: 2,
        level: 'Tous niveaux',
        features: [
          'Matériel inclus',
          'Équipement de sécurité',
          'Attention personnalisée',
          'Progression en duo',
          'Moments de partage',
          'Idéal couple/amis',
        ],
        badge: '',
        isHighlighted: 0 as 0 | 1,
        color: 'from-orange-500 to-yellow-400',
        icon: 'UsersRound',
        isActive: 1 as 0 | 1,
        createdAt: Date.now(),
      },
    ];

    await tx.table('courseCards').bulkAdd(defaultCourseCards);

    console.log(`[v15] Initialized ${defaultCourseCards.length} default course cards`);

    // ── 2. Initialiser les packCards par défaut ─────────────────────────────────
    // Calcul des prix originaux et économies basés sur le prix du cours collectif
    const collectifPrice = 70;

    const defaultPackCards = [
      {
        packType: 'pack_3' as const,
        title: 'Pack Découverte',
        description: 'Parfait pour débuter et découvrir les sensations',
        sessions: 3,
        price: 180,
        originalPrice: collectifPrice * 3, // 210€
        discount: (collectifPrice * 3) - 180, // 30€
        features: [
          '3 cours collectifs',
          'Matériel inclus',
          'Progression garantie',
          'Valable 1 mois',
        ],
        badge: '',
        isHighlighted: 0 as 0 | 1,
        isActive: 1 as 0 | 1,
        createdAt: Date.now(),
      },
      {
        packType: 'pack_6' as const,
        title: 'Pack Progression',
        description: 'Pour acquérir les bases et devenir autonome',
        sessions: 6,
        price: 330,
        originalPrice: collectifPrice * 6, // 420€
        discount: (collectifPrice * 6) - 330, // 90€
        features: [
          '6 cours collectifs',
          'Matériel inclus',
          'Suivi personnalisé',
          'Valable 2 mois',
          'Attestation incluse',
        ],
        badge: 'Meilleure offre',
        isHighlighted: 1 as 0 | 1,
        isActive: 1 as 0 | 1,
        createdAt: Date.now(),
      },
      {
        packType: 'pack_10' as const,
        title: 'Pack Expert',
        description: 'La formule complète pour maîtriser le kite',
        sessions: 10,
        price: 500,
        originalPrice: collectifPrice * 10, // 700€
        discount: (collectifPrice * 10) - 500, // 200€
        features: [
          '10 cours (collectifs ou duos)',
          'Matériel premium',
          'Vidéo analyse',
          'Valable 3 mois',
          'Certification FFK',
          'Accès club partenaire',
        ],
        badge: '',
        isHighlighted: 0 as 0 | 1,
        isActive: 1 as 0 | 1,
        createdAt: Date.now(),
      },
    ];

    await tx.table('packCards').bulkAdd(defaultPackCards);

    console.log(`[v15] Initialized ${defaultPackCards.length} default pack cards`);
    console.log('[v15] Migration completed: courseCards and packCards tables enabled');
  });
}

/**
 * Helper pour accéder à la table courseCards avec typage fort
 * @param db - Instance de KiteSurfDB
 * @returns Table typée CourseCard
 */
export function getCourseCardsTable(db: KiteSurfDB) {
  return db.table('courseCards');
}

/**
 * Helper pour accéder à la table packCards avec typage fort
 * @param db - Instance de KiteSurfDB
 * @returns Table typée PackCard
 */
export function getPackCardsTable(db: KiteSurfDB) {
  return db.table('packCards');
}
