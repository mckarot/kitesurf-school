// src/pages/ProfileData/components/IdentitySection.tsx

import { Link } from 'react-router-dom';
import type { User } from '../../../types';

interface IdentitySectionProps {
  user: User;
}

export function IdentitySection({ user }: IdentitySectionProps) {
  const formattedDate = new Date(user.createdAt).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-4">
      <dl className="space-y-4">
        <div className="flex items-start gap-4">
          <dt className="w-32 text-sm font-medium text-gray-500 flex-shrink-0">
            Nom complet
          </dt>
          <dd className="text-sm text-gray-900">
            {user.lastName.toUpperCase()} {user.firstName}
          </dd>
        </div>

        <div className="flex items-start gap-4">
          <dt className="w-32 text-sm font-medium text-gray-500 flex-shrink-0">
            Email
          </dt>
          <dd className="text-sm text-gray-900">{user.email}</dd>
        </div>

        <div className="flex items-start gap-4">
          <dt className="w-32 text-sm font-medium text-gray-500 flex-shrink-0">
            Rôle
          </dt>
          <dd className="text-sm text-gray-900">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
              {user.role}
            </span>
          </dd>
        </div>

        <div className="flex items-start gap-4">
          <dt className="w-32 text-sm font-medium text-gray-500 flex-shrink-0">
            Date d'inscription
          </dt>
          <dd className="text-sm text-gray-900">{formattedDate}</dd>
        </div>
      </dl>

      {/* Bouton Modifier - RGPD Article 16 */}
      <div className="pt-4 border-t border-gray-200">
        <Link
          to="/profil/modifier"
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 rounded-lg px-2 py-1 -ml-2"
          aria-label="Modifier mes informations personnelles"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          Modifier mes informations
        </Link>
      </div>
    </div>
  );
}
