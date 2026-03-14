// src/pages/ProfileData/components/HealthDataSection.tsx

import type { UserHealthData } from '../../../types';

interface HealthDataSectionProps {
  data?: UserHealthData;
}

const swimmingLevelLabels: Record<
  NonNullable<UserHealthData['swimmingLevel']>,
  string
> = {
  'non-swimmer': 'Ne sait pas nager',
  beginner: 'Débutant',
  intermediate: 'Intermédiaire',
  advanced: 'Avancé',
};

export function HealthDataSection({ data }: HealthDataSectionProps) {
  if (!data) {
    return (
      <p className="text-sm text-gray-500 italic">
        Aucune donnée de santé enregistrée
      </p>
    );
  }

  const hasData =
    data.medicalConditions ||
    data.allergies ||
    data.swimmingLevel ||
    data.medicalCertificateValidUntil;

  if (!hasData) {
    return (
      <p className="text-sm text-gray-500 italic">
        Aucune donnée de santé enregistrée
      </p>
    );
  }

  return (
    <dl className="space-y-4">
      {data.medicalConditions && (
        <div className="flex items-start gap-4">
          <dt className="w-32 text-sm font-medium text-gray-500 flex-shrink-0">
            Conditions médicales
          </dt>
          <dd className="text-sm text-gray-900">{data.medicalConditions}</dd>
        </div>
      )}

      {data.allergies && (
        <div className="flex items-start gap-4">
          <dt className="w-32 text-sm font-medium text-gray-500 flex-shrink-0">
            Allergies
          </dt>
          <dd className="text-sm text-gray-900">{data.allergies}</dd>
        </div>
      )}

      {data.swimmingLevel && (
        <div className="flex items-start gap-4">
          <dt className="w-32 text-sm font-medium text-gray-500 flex-shrink-0">
            Niveau de natation
          </dt>
          <dd className="text-sm text-gray-900">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {swimmingLevelLabels[data.swimmingLevel]}
            </span>
          </dd>
        </div>
      )}

      {data.medicalCertificateValidUntil && (
        <div className="flex items-start gap-4">
          <dt className="w-32 text-sm font-medium text-gray-500 flex-shrink-0">
            Certificat médical
          </dt>
          <dd className="text-sm text-gray-900">
            Valide jusqu'au{' '}
            {new Date(data.medicalCertificateValidUntil).toLocaleDateString(
              'fr-FR',
              {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }
            )}
          </dd>
        </div>
      )}
    </dl>
  );
}
