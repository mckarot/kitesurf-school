// src/pages/ProfileData/components/ReservationsSection.tsx

import type { UserReservationExport } from '../../../types';

interface ReservationsSectionProps {
  reservations: UserReservationExport[];
}

const statusLabels: Record<UserReservationExport['status'], string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  cancelled: 'Annulée',
  completed: 'Terminée',
};

const statusStyles: Record<UserReservationExport['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-green-100 text-green-800',
};

export function ReservationsSection({ reservations }: ReservationsSectionProps) {
  if (reservations.length === 0) {
    return (
      <p className="text-sm text-gray-500 italic">
        Aucune réservation
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Cours
            </th>
            <th
              scope="col"
              className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Date
            </th>
            <th
              scope="col"
              className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Lieu
            </th>
            <th
              scope="col"
              className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Statut
            </th>
            <th
              scope="col"
              className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Réservé le
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {reservations.map((reservation) => (
            <tr key={reservation.id} className="hover:bg-gray-50">
              <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">
                {reservation.courseTitle}
              </td>
              <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">
                {reservation.date ? (
                  <>
                    {new Date(reservation.date).toLocaleDateString('fr-FR')}
                    {reservation.startTime && (
                      <span className="text-gray-500 ml-1">
                        ({reservation.startTime} - {reservation.endTime})
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-gray-400">Non défini</span>
                )}
              </td>
              <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">
                {reservation.location || <span className="text-gray-400">Non défini</span>}
              </td>
              <td className="px-3 py-3 text-sm whitespace-nowrap">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    statusStyles[reservation.status]
                  }`}
                >
                  {statusLabels[reservation.status]}
                </span>
              </td>
              <td className="px-3 py-3 text-sm text-gray-500 whitespace-nowrap">
                {new Date(reservation.createdAt).toLocaleDateString('fr-FR')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
