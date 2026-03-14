// src/utils/consentManager.ts
// Utilitaires pour la gestion des consentements RGPD

import type { UserConsent, ConsentType, ConsentStatus, ConsentSummary } from '../types';

/**
 * Vérifie si un utilisateur possède un consentement valide pour un type donné
 *
 * Un consentement est considéré valide si :
 * - Il existe pour le type demandé
 * - Son statut est 'accepted'
 *
 * @param consents - Tableau des consentements de l'utilisateur
 * @param type - Type de consentement à vérifier
 * @returns true si un consentement accepté existe, false sinon
 *
 * @example
 * ```typescript
 * const hasMarketingConsent = hasValidConsent(consents, 'marketing_emails');
 * if (hasMarketingConsent) {
 *   // Envoyer email marketing
 * }
 * ```
 */
export function hasValidConsent(consents: UserConsent[], type: ConsentType): boolean {
  try {
    const latestConsent = getLatestConsent(consents, type);
    return latestConsent !== null && latestConsent.status === 'accepted';
  } catch (error) {
    console.error(`[consentManager] Error checking valid consent for ${type}:`, error);
    return false;
  }
}

/**
 * Récupère le consentement le plus récent pour un type donné
 *
 * Trie les consentements par updatedAt décroissant et retourne le premier
 * correspondant au type demandé.
 *
 * @param consents - Tableau des consentements de l'utilisateur
 * @param type - Type de consentement à rechercher
 * @returns Le consentement le plus récent ou null si aucun n'existe
 *
 * @example
 * ```typescript
 * const latestMarketingConsent = getLatestConsent(consents, 'marketing_emails');
 * if (latestMarketingConsent) {
 *   console.log(`Accepted at: ${formatConsentDate(latestMarketingConsent.acceptedAt)}`);
 * }
 * ```
 */
export function getLatestConsent(consents: UserConsent[], type: ConsentType): UserConsent | null {
  try {
    const filteredConsents = consents.filter((c) => c.consentType === type);

    if (filteredConsents.length === 0) {
      return null;
    }

    // Tri par updatedAt décroissant pour obtenir le plus récent
    const sorted = [...filteredConsents].sort((a, b) => b.updatedAt - a.updatedAt);
    return sorted[0] ?? null;
  } catch (error) {
    console.error(`[consentManager] Error getting latest consent for ${type}:`, error);
    return null;
  }
}

/**
 * Crée un objet de consentement prêt à être inséré dans la base de données
 *
 * Initialise les timestamps (acceptedAt, updatedAt) avec le timestamp actuel.
 * Le status est initialisé à la valeur fournie.
 *
 * @param userId - ID de l'utilisateur
 * @param type - Type de consentement
 * @param status - Statut du consentement ('accepted' ou 'refused')
 * @param version - Version des CGU/Politique de confidentialité
 * @param ipAddress - Optionnel : adresse IP pour traçabilité
 * @param userAgent - Optionnel : user-agent pour traçabilité
 * @returns Objet UserConsent sans id (prêt pour insertion)
 *
 * @example
 * ```typescript
 * const newConsent = createConsent(
 *   userId,
 *   'marketing_emails',
 *   'accepted',
 *   '1.2.0',
 *   '192.168.1.1',
 *   'Mozilla/5.0...'
 * );
 * await db.userConsents.add(newConsent);
 * ```
 */
export function createConsent(
  userId: number,
  type: ConsentType,
  status: ConsentStatus,
  version: string,
  ipAddress?: string,
  userAgent?: string
): Omit<UserConsent, 'id'> {
  const now = Date.now();

  return {
    userId,
    consentType: type,
    status,
    version,
    acceptedAt: now,
    updatedAt: now,
    ipAddress,
    userAgent,
  };
}

/**
 * Crée un objet de mise à jour pour modifier un consentement existant
 *
 * Génère un nouveau timestamp updatedAt et conserve le statut fourni.
 * Utilisé avec db.userConsents.update(id, updatePayload)
 *
 * @param status - Nouveau statut du consentement
 * @param version - Nouvelle version des CGU/Politique de confidentialité
 * @returns Objet partiel pour mise à jour (status + updatedAt)
 *
 * @example
 * ```typescript
 * const updatePayload = updateConsentPayload('refused', '1.3.0');
 * await db.userConsents.update(consentId, updatePayload);
 * ```
 */
export function updateConsentPayload(
  status: ConsentStatus,
  version: string
): Pick<UserConsent, 'status' | 'updatedAt' | 'version'> {
  return {
    status,
    version,
    updatedAt: Date.now(),
  };
}

/**
 * Récupère l'historique complet des consentements pour un type donné
 *
 * Retourne tous les consentements du type demandé, triés par acceptedAt croissant
 * (du plus ancien au plus récent). Utile pour afficher l'historique des changements.
 *
 * @param consents - Tableau des consentements de l'utilisateur
 * @param type - Type de consentement à filtrer
 * @returns Tableau des consentements triés chronologiquement
 *
 * @example
 * ```typescript
 * const history = getConsentHistory(consents, 'marketing_emails');
 * history.forEach(c => {
 *   console.log(`${formatConsentDate(c.acceptedAt)}: ${c.status}`);
 * });
 * ```
 */
export function getConsentHistory(consents: UserConsent[], type: ConsentType): UserConsent[] {
  try {
    const filteredConsents = consents.filter((c) => c.consentType === type);

    // Tri par acceptedAt croissant (du plus ancien au plus récent)
    return [...filteredConsents].sort((a, b) => a.acceptedAt - b.acceptedAt);
  } catch (error) {
    console.error(`[consentManager] Error getting consent history for ${type}:`, error);
    return [];
  }
}

/**
 * Génère un résumé des consentements pour tous les types
 *
 * Retourne un objet synthétique indiquant pour chaque type :
 * - hasConsent : true si un consentement existe (quel que soit le statut)
 * - isAccepted : true si le consentement le plus récent est accepté
 * - lastUpdatedAt : timestamp de la dernière modification
 *
 * @param consents - Tableau des consentements de l'utilisateur
 * @returns Objet résumé avec état pour chaque type de consentement
 *
 * @example
 * ```typescript
 * const summary = getConsentSummary(consents);
 * console.log(summary.marketing_emails.isAccepted); // true/false
 * ```
 */
export function getConsentSummary(consents: UserConsent[]): ConsentSummary {
  const consentTypes: ConsentType[] = [
    'marketing_emails',
    'photos_marketing',
    'analytics_cookies',
  ];

  const summary: ConsentSummary = {
    marketing_emails: { hasConsent: false, isAccepted: false, lastUpdatedAt: null },
    photos_marketing: { hasConsent: false, isAccepted: false, lastUpdatedAt: null },
    analytics_cookies: { hasConsent: false, isAccepted: false, lastUpdatedAt: null },
  };

  try {
    for (const type of consentTypes) {
      const latest = getLatestConsent(consents, type);

      if (latest !== null) {
        summary[type] = {
          hasConsent: true,
          isAccepted: latest.status === 'accepted',
          lastUpdatedAt: latest.updatedAt,
        };
      }
    }
  } catch (error) {
    console.error('[consentManager] Error generating consent summary:', error);
  }

  return summary;
}

/**
 * Formate un timestamp en date lisible au format français
 *
 * Utilise Intl.DateTimeFormat avec la locale 'fr-FR' pour un formatage
 * conforme aux conventions françaises (jj/mm/aaaa à hh:mm).
 *
 * @param timestamp - Timestamp en millisecondes (Date.now())
 * @returns Date formatée en français (ex: "14/03/2026 à 10:30")
 *
 * @example
 * ```typescript
 * const formatted = formatConsentDate(1710408600000);
 * // "14/03/2024 à 10:30"
 * ```
 */
export function formatConsentDate(timestamp: number): string {
  try {
    const date = new Date(timestamp);

    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch (error) {
    console.error('[consentManager] Error formatting date:', error);
    return 'Date invalide';
  }
}

/**
 * Vérifie si un consentement a été mis à jour après une date donnée
 *
 * Utile pour déterminer si un utilisateur a accepté une nouvelle version
 * des CGU/Politique de confidentialité.
 *
 * @param consents - Tableau des consentements de l'utilisateur
 * @param type - Type de consentement à vérifier
 * @param sinceTimestamp - Timestamp de référence (ex: date de publication nouvelle version)
 * @returns true si un consentement existe et a été mis à jour après la date donnée
 *
 * @example
 * ```typescript
 * const hasAcceptedNewPolicy = isConsentUpdatedSince(
 *   consents,
 *   'marketing_emails',
 *   newPolicyPublishedAt
 * );
 * ```
 */
export function isConsentUpdatedSince(
  consents: UserConsent[],
  type: ConsentType,
  sinceTimestamp: number
): boolean {
  try {
    const latest = getLatestConsent(consents, type);

    if (latest === null) {
      return false;
    }

    return latest.updatedAt >= sinceTimestamp;
  } catch (error) {
    console.error(`[consentManager] Error checking consent update date for ${type}:`, error);
    return false;
  }
}

/**
 * Récupère tous les consentements acceptés d'un utilisateur
 *
 * Filtre et retourne uniquement les consentements avec statut 'accepted'.
 * Utile pour générer une liste des autorisations actives.
 *
 * @param consents - Tableau des consentements de l'utilisateur
 * @returns Tableau des consentements acceptés (un par type, le plus récent)
 *
 * @example
 * ```typescript
 * const acceptedConsents = getAcceptedConsents(consents);
 * acceptedConsents.forEach(c => {
 *   // Traiter chaque consentement accepté
 * });
 * ```
 */
export function getAcceptedConsents(consents: UserConsent[]): UserConsent[] {
  try {
    const consentTypes: ConsentType[] = [
      'marketing_emails',
      'photos_marketing',
      'analytics_cookies',
    ];

    const acceptedConsents: UserConsent[] = [];

    for (const type of consentTypes) {
      const latest = getLatestConsent(consents, type);

      if (latest !== null && latest.status === 'accepted') {
        acceptedConsents.push(latest);
      }
    }

    return acceptedConsents;
  } catch (error) {
    console.error('[consentManager] Error getting accepted consents:', error);
    return [];
  }
}

/**
 * Récupère tous les consentements refusés d'un utilisateur
 *
 * Filtre et retourne uniquement les consentements avec statut 'refused'.
 * Utile pour respecter les préférences de l'utilisateur.
 *
 * @param consents - Tableau des consentements de l'utilisateur
 * @returns Tableau des consentements refusés (un par type, le plus récent)
 *
 * @example
 * ```typescript
 * const refusedConsents = getRefusedConsents(consents);
 * refusedConsents.forEach(c => {
 *   // Ne pas activer la fonctionnalité correspondante
 * });
 * ```
 */
export function getRefusedConsents(consents: UserConsent[]): UserConsent[] {
  try {
    const consentTypes: ConsentType[] = [
      'marketing_emails',
      'photos_marketing',
      'analytics_cookies',
    ];

    const refusedConsents: UserConsent[] = [];

    for (const type of consentTypes) {
      const latest = getLatestConsent(consents, type);

      if (latest !== null && latest.status === 'refused') {
        refusedConsents.push(latest);
      }
    }

    return refusedConsents;
  } catch (error) {
    console.error('[consentManager] Error getting refused consents:', error);
    return [];
  }
}
