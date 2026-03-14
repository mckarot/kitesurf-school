// src/pages/ProfileData/components/ProgressionSection.tsx

import type { UserProgression } from '../../../types';

interface ProgressionSectionProps {
  progression?: UserProgression;
}

const ikoLevelLabels: Record<
  NonNullable<UserProgression['currentIkoLevel']>,
  string
> = {
  discovery: 'Découverte',
  beginner: 'Débutant',
  intermediate: 'Intermédiaire',
  advanced: 'Avancé',
  autonomous: 'Autonome',
};

export function ProgressionSection({ progression }: ProgressionSectionProps) {
  if (!progression) {
    return (
      <p className="text-sm text-gray-500 italic">
        Aucune donnée de progression enregistrée
      </p>
    );
  }

  const hasData =
    progression.currentIkoLevel ||
    (progression.validatedSkills && progression.validatedSkills.length > 0);

  if (!hasData) {
    return (
      <p className="text-sm text-gray-500 italic">
        Aucune donnée de progression enregistrée
      </p>
    );
  }

  return (
    <dl className="space-y-4">
      {progression.currentIkoLevel && (
        <div className="flex items-start gap-4">
          <dt className="w-32 text-sm font-medium text-gray-500 flex-shrink-0">
            Niveau IKO
          </dt>
          <dd className="text-sm text-gray-900">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              {ikoLevelLabels[progression.currentIkoLevel]}
            </span>
          </dd>
        </div>
      )}

      {progression.validatedSkills && progression.validatedSkills.length > 0 && (
        <div className="flex items-start gap-4">
          <dt className="w-32 text-sm font-medium text-gray-500 flex-shrink-0">
            Compétences
          </dt>
          <dd className="text-sm text-gray-900">
            <ul className="list-disc list-inside space-y-1">
              {progression.validatedSkills.map((skill, index) => (
                <li key={index}>{skill}</li>
              ))}
            </ul>
          </dd>
        </div>
      )}
    </dl>
  );
}
