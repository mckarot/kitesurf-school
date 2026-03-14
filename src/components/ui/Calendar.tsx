// src/components/ui/Calendar.tsx

import { useMemo } from 'react';
import {
  getStartOfWeek,
  getEndOfWeek,
  getWeekDays,
  getMonthNameFr,
  getDayNameFr,
  getDayNumber,
  isToday,
  addDays,
} from '../../utils/dateUtils';

interface CalendarProps {
  currentDate?: Date;
  onDateChange?: (date: Date) => void;
  selectedDate?: string;
  onDateSelect?: (date: string) => void;
  view?: 'week' | 'month';
  events?: { date: string; label: string; color?: string }[];
}

export function Calendar({
  currentDate = new Date(),
  onDateChange,
  selectedDate,
  onDateSelect,
  view = 'week',
  events = [],
}: CalendarProps) {
  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);
  const monthDays = useMemo(() => {
    const days: (string | null)[] = [];
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const startPadding = firstDay.getDay() - 1; // Monday = 0

    for (let i = 0; i < startPadding; i++) {
      days.push(null);
    }

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      days.push(date.toISOString().split('T')[0]);
    }

    return days;
  }, [currentDate]);

  const handlePrevWeek = () => {
    if (onDateChange) {
      onDateChange(addDays(currentDate, -7));
    }
  };

  const handleNextWeek = () => {
    if (onDateChange) {
      onDateChange(addDays(currentDate, 7));
    }
  };

  const handlePrevMonth = () => {
    if (onDateChange) {
      onDateChange(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    }
  };

  const handleNextMonth = () => {
    if (onDateChange) {
      onDateChange(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    }
  };

  const handleToday = () => {
    if (onDateChange) {
      onDateChange(new Date());
    }
  };

  const getEventForDate = (date: string) => {
    return events.find((e) => e.date === date);
  };

  if (view === 'week') {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevWeek}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              aria-label="Semaine précédente"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={handleNextWeek}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              aria-label="Semaine suivante"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">
            {getMonthNameFr(getStartOfWeek(currentDate))}
          </h2>
          <button
            onClick={handleToday}
            className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition"
          >
            Aujourd'hui
          </button>
        </div>

        {/* Week days header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Week days */}
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((dateStr) => {
            const date = new Date(dateStr + 'T00:00:00');
            const isTodayDate = isToday(dateStr);
            const isSelected = selectedDate === dateStr;
            const event = getEventForDate(dateStr);

            return (
              <button
                key={dateStr}
                onClick={() => onDateSelect?.(dateStr)}
                className={`
                  relative p-3 rounded-lg transition text-center
                  ${isSelected ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}
                  ${isTodayDate && !isSelected ? 'ring-2 ring-blue-600' : ''}
                `}
              >
                <div className="text-xs font-medium mb-1">
                  {getDayNameFr(date)}
                </div>
                <div className={`text-lg font-semibold ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                  {getDayNumber(date)}
                </div>
                {event && (
                  <div
                    className={`absolute bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full ${event.color || 'bg-blue-500'}`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Month view
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            aria-label="Mois précédent"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            aria-label="Mois suivant"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <h2 className="text-lg font-semibold text-gray-900 capitalize">
          {getMonthNameFr(currentDate)}
        </h2>
        <button
          onClick={handleToday}
          className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition"
        >
          Aujourd'hui
        </button>
      </div>

      {/* Week days header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Month days */}
      <div className="grid grid-cols-7 gap-1">
        {monthDays.map((dateStr, index) => {
          if (!dateStr) {
            return <div key={`empty-${index}`} className="p-3" />;
          }

          const date = new Date(dateStr + 'T00:00:00');
          const isTodayDate = isToday(dateStr);
          const isSelected = selectedDate === dateStr;
          const event = getEventForDate(dateStr);

          return (
            <button
              key={dateStr}
              onClick={() => onDateSelect?.(dateStr)}
              className={`
                relative p-3 rounded-lg transition text-center min-h-[80px]
                ${isSelected ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}
                ${isTodayDate && !isSelected ? 'ring-2 ring-blue-600' : ''}
              `}
            >
              <div className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                {getDayNumber(date)}
              </div>
              {event && (
                <div className="mt-1 text-xs truncate px-1 rounded" style={{ backgroundColor: event.color || '#3b82f6', color: 'white' }}>
                  {event.label}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
