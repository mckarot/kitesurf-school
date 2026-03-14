// src/pages/TimeSlots/InstructorAvailabilityList.tsx
// Liste des créneaux avec statut de disponibilité

import type { SchoolSchedule } from '../../types';

interface AvailabilityViewItem {
  schedule: SchoolSchedule;
  availability?: {
    id: number;
    isAvailable: 0 | 1;
    reason?: string;
  };
}

interface InstructorAvailabilityListProps {
  items: AvailabilityViewItem[];
  onToggle: (scheduleId: number, currentlyAvailable: boolean) => Promise<void>;
  onDelete: (availabilityId: number) => Promise<void>;
  onOpenForm: (scheduleId: number) => void;
  isLoading: boolean;
}

export function InstructorAvailabilityList({ items, onToggle, onDelete, onOpenForm, isLoading }: InstructorAvailabilityListProps) {
  // Sort by startTime
  const sortedItems = [...items].sort((a, b) => a.schedule.startTime.localeCompare(b.schedule.startTime));

  if (items.length === 0) {
    return (
      <Card variant="elevated">
        <CardBody className="text-center py-12">
          <svg
            className="w-16 h-16 text-gray-300 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-gray-600 mb-2">Aucun créneau horaire pour cette date</p>
          <p className="text-sm text-gray-500">
            Les créneaux de l'école s'afficheront ici. Sélectionnez une autre date.
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <section>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Créneaux du {sortedItems[0]?.schedule ? 'jour' : ''}
      </h2>
      <div className="space-y-3">
        {sortedItems.map((item) => {
          const isBlocked = item.availability && item.availability.isAvailable === 0;

          return (
            <div
              key={item.schedule.id}
              className={`flex items-center justify-between p-4 rounded-lg border transition ${
                isBlocked
                  ? 'bg-red-50 border-red-200'
                  : 'bg-green-50 border-green-200'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-gray-900">{item.schedule.startTime}</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                  <span className="text-lg font-semibold text-gray-900">{item.schedule.endTime}</span>
                </div>
                {isBlocked && (
                  <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded">
                    {item.availability?.reason || 'Indisponible'}
                  </span>
                )}
                {!isBlocked && (
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">
                    Disponible
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenForm(item.schedule.id)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition ${
                    isBlocked
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                  disabled={isLoading}
                  aria-label={isBlocked ? 'Marquer comme disponible' : 'Marquer comme indisponible'}
                >
                  {isBlocked ? 'Modifier' : 'Indisponible'}
                </button>
                {isBlocked && item.availability && (
                  <button
                    onClick={() => onDelete(item.availability!.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    aria-label="Supprimer l'indisponibilité"
                    disabled={isLoading}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// Import Card for the empty state
import { Card, CardBody } from '../../components/ui/Card';
