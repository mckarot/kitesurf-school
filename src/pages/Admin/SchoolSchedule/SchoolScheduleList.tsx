// src/pages/Admin/SchoolSchedule/SchoolScheduleList.tsx
// Liste des créneaux horaires pour un jour donné

import type { SchoolSchedule } from '../../../types';

interface SchoolScheduleListProps {
  schedules: SchoolSchedule[];
  onEdit: (schedule: { id: number; dayOfWeek: number; startTime: string; endTime: string }) => void;
  onDelete: (id: number) => void;
  isLoading: boolean;
}

export function SchoolScheduleList({ schedules, onEdit, onDelete, isLoading }: SchoolScheduleListProps) {
  // Sort by startTime
  const sortedSchedules = [...schedules].sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="space-y-2">
      {sortedSchedules.map((schedule) => (
        <div
          key={schedule.id}
          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-gray-900">{schedule.startTime}</span>
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              <span className="text-lg font-semibold text-gray-900">{schedule.endTime}</span>
            </div>
            {schedule.isActive === 0 && (
              <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded">
                Inactif
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit({
                id: schedule.id,
                dayOfWeek: schedule.dayOfWeek,
                startTime: schedule.startTime,
                endTime: schedule.endTime,
              })}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
              aria-label={`Modifier le créneau ${schedule.startTime} - ${schedule.endTime}`}
              disabled={isLoading}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => onDelete(schedule.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
              aria-label={`Supprimer le créneau ${schedule.startTime} - ${schedule.endTime}`}
              disabled={isLoading}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
