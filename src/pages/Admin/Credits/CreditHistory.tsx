// src/pages/Admin/Credits/CreditHistory.tsx

import { useRef, useEffect } from 'react';
import type { CourseCredit } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';

interface CreditHistoryProps {
  studentId: number;
  studentName: string;
  credits: CourseCredit[];
  onClose: () => void;
}

/**
 * Composant d'affichage de l'historique des crédits pour un élève.
 *
 * Affiche:
 * - Liste chronologique des crédits (du plus récent au plus ancien)
 * - Détails par crédit: séances, utilisées, statut, expiration
 * - Badge de statut coloré
 *
 * @param props - Props du composant
 * @returns JSX.Element - Panneau d'historique
 *
 * @example
 * ```tsx
 * <CreditHistory
 *   studentId={selectedStudentId}
 *   studentName={selectedStudentName}
 *   credits={studentCredits}
 *   onClose={() => setExpandedHistoryId(null)}
 * />
 * ```
 */
export function CreditHistory({
  studentId,
  studentName,
  credits,
  onClose,
}: CreditHistoryProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Focus sur le panneau quand il s'ouvre
  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  // Tri des crédits du plus récent au plus ancien
  const sortedCredits = [...credits].sort((a, b) => b.createdAt - a.createdAt);

  // Calcul du total des séances
  const totalSessions = credits.reduce((sum, c) => sum + c.sessions, 0);
  const totalUsed = credits.reduce((sum, c) => sum + c.usedSessions, 0);
  const totalRemaining = totalSessions - totalUsed;

  const getStatusBarVariant = (credit: CourseCredit): 'success' | 'warning' | 'danger' | 'info' => {
    if (credit.status === 'expired') return 'danger';
    if (credit.status === 'refunded') return 'info';
    if (credit.usedSessions >= credit.sessions) return 'warning';
    return 'success';
  };

  const getStatusBarLabel = (credit: CourseCredit): string => {
    if (credit.status === 'expired') return 'Expiré';
    if (credit.status === 'refunded') return 'Remboursé';
    if (credit.usedSessions >= credit.sessions) return 'Épuisé';
    return 'Actif';
  };

  return (
    <div
      ref={panelRef}
      tabIndex={-1}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden"
      aria-label={`Historique des crédits de ${studentName}`}
    >
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Historique des crédits
            </h3>
            <p className="text-sm text-gray-600 mt-1">{studentName}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Fermer l'historique"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </Button>
        </div>
      </div>

      {/* Résumé du solde */}
      <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-600 uppercase tracking-wide">Total acheté</p>
            <p className="text-xl font-bold text-blue-700">{totalSessions} séances</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 uppercase tracking-wide">Utilisé</p>
            <p className="text-xl font-bold text-orange-700">{totalUsed} séances</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 uppercase tracking-wide">Restant</p>
            <p
              className={`text-xl font-bold ${
                totalRemaining === 0
                  ? 'text-red-700'
                  : totalRemaining <= 2
                  ? 'text-yellow-700'
                  : 'text-green-700'
              }`}
            >
              {totalRemaining} séances
            </p>
          </div>
        </div>
      </div>

      {/* Liste des crédits */}
      <div className="divide-y divide-gray-200">
        {sortedCredits.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <svg
              className="w-12 h-12 text-gray-300 mx-auto mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-gray-600 font-medium">Aucun crédit</p>
            <p className="text-sm text-gray-500 mt-1">
              Cet élève n'a pas encore de crédits
            </p>
          </div>
        ) : (
          sortedCredits.map((credit) => (
            <div
              key={credit.id}
              className="px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                {/* Informations du crédit */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      {credit.sessions} séances achetées
                    </span>
                    <Badge variant={getStatusBarVariant(credit)}>
                      {getStatusBarLabel(credit)}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    {/* Barre de progression */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          credit.usedSessions >= credit.sessions
                            ? 'bg-orange-500'
                            : 'bg-blue-500'
                        }`}
                        style={{ width: `${(credit.usedSessions / credit.sessions) * 100}%` }}
                        aria-label={`${credit.usedSessions} séances utilisées sur ${credit.sessions}`}
                      />
                    </div>

                    {/* Détails */}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>
                        Utilisé: {credit.usedSessions} séances / {credit.sessions} séances
                      </span>
                      <span>•</span>
                      <span>
                        Créé le {new Date(credit.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                      {credit.expiresAt && (
                        <>
                          <span>•</span>
                          <span
                            className={
                              credit.expiresAt < Date.now()
                                ? 'text-red-600 font-medium'
                                : ''
                            }
                          >
                            Expire le {new Date(credit.expiresAt).toLocaleDateString('fr-FR')}
                            {credit.expiresAt < Date.now() && ' (expiré)'}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Séances restantes pour ce crédit */}
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {credit.sessions - credit.usedSessions} séances
                  </p>
                  <p className="text-xs text-gray-500">restantes</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
