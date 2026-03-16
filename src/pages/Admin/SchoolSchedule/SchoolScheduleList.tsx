// src/pages/Admin/SchoolSchedule/SchoolScheduleList.tsx
// Liste des créneaux horaires pour un jour donné
// Design Metalab harmonisé

import type { SchoolSchedule } from '../../../types';
import { Edit2, Trash2, Clock } from 'lucide-react';

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
    <div className="space-y-3">
      {sortedSchedules.map((schedule) => (
        <div
          key={schedule.id}
          className="group flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:shadow-lg hover:border-purple-200 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-gray-900">{schedule.startTime}</span>
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                <span className="text-lg font-bold text-gray-900">{schedule.endTime}</span>
              </div>
              {schedule.isActive === 0 && (
                <span className="px-3 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                  Inactif
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit({
                id: schedule.id,
                dayOfWeek: schedule.dayOfWeek,
                startTime: schedule.startTime,
                endTime: schedule.endTime,
              })}
              className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              aria-label={`Modifier le créneau ${schedule.startTime} - ${schedule.endTime}`}
              disabled={isLoading}
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(schedule.id)}
              className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              aria-label={`Supprimer le créneau ${schedule.startTime} - ${schedule.endTime}`}
              disabled={isLoading}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
