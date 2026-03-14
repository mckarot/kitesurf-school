// src/pages/ProfileData/components/PhysicalDataSection.tsx

import type { UserPhysicalData } from '../../../types';

interface PhysicalDataSectionProps {
  data?: UserPhysicalData;
}

export function PhysicalDataSection({ data }: PhysicalDataSectionProps) {
  if (!data || (!data.weight && !data.height)) {
    return (
      <p className="text-sm text-gray-500 italic">
        Aucune donnée physique enregistrée
      </p>
    );
  }

  return (
    <dl className="space-y-4">
      {data.weight !== undefined && (
        <div className="flex items-start gap-4">
          <dt className="w-32 text-sm font-medium text-gray-500 flex-shrink-0">
            Poids
          </dt>
          <dd className="text-sm text-gray-900">{data.weight} kg</dd>
        </div>
      )}

      {data.height !== undefined && (
        <div className="flex items-start gap-4">
          <dt className="w-32 text-sm font-medium text-gray-500 flex-shrink-0">
            Taille
          </dt>
          <dd className="text-sm text-gray-900">{data.height} cm</dd>
        </div>
      )}
    </dl>
  );
}
