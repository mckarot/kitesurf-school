// src/components/ui/DatePicker.tsx
// Composant de sélection de date simple

import { useState, useEffect } from 'react';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  minDate?: string;
  maxDate?: string;
  disabled?: boolean;
}

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const DAYS = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'];

export function DatePicker({ value, onChange, minDate, maxDate, disabled }: DatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(value).getMonth());
  const [currentYear, setCurrentYear] = useState(new Date(value).getFullYear());

  const selectedDate = new Date(value);

  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get first day of month (0 = Sunday, 1 = Monday, ...)
  const getFirstDayOfMonth = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Convert to Monday = 0
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const handleDateClick = (day: number) => {
    // Créer la date en UTC pour éviter les problèmes de fuseau horaire
    const year = currentYear;
    const month = String(currentMonth + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateStr = `${year}-${month}-${dayStr}`;
    onChange(dateStr);
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day && 
           today.getMonth() === currentMonth && 
           today.getFullYear() === currentYear;
  };

  const isSelected = (day: number) => {
    // Comparer les chaînes de date pour éviter les problèmes de fuseau horaire
    const selectedDay = selectedDate.getDate();
    const selectedMonth = selectedDate.getMonth();
    const selectedYear = selectedDate.getFullYear();
    
    // Si la date vient d'une chaîne ISO (YYYY-MM-DD), l'analyser correctement
    if (value.includes('-')) {
      const [y, m, d] = value.split('-').map(Number);
      return y === currentYear && (m - 1) === currentMonth && d === day;
    }
    
    return selectedDay === day && selectedMonth === currentMonth && selectedYear === currentYear;
  };

  const isDisabled = (day: number) => {
    // Créer la date en format YYYY-MM-DD pour éviter les problèmes de fuseau horaire
    const month = String(currentMonth + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateStr = `${currentYear}-${month}-${dayStr}`;
    
    // Récupérer le jour de la semaine (0 = Dimanche, 1 = Lundi, ...)
    const dateObj = new Date(currentYear, currentMonth, day);
    const dayOfWeek = dateObj.getDay();
    
    // Dimanche est fermé (day 0)
    if (dayOfWeek === 0) return true;
    
    if (minDate && dateStr < minDate) return true;
    if (maxDate && dateStr > maxDate) return true;
    
    return disabled;
  };

  // Generate calendar days
  const renderDays = () => {
    const days: JSX.Element[] = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10" />);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const disabled = isDisabled(day);
      const selected = isSelected(day);
      const today = isToday(day);
      
      days.push(
        <button
          key={day}
          type="button"
          onClick={() => !disabled && handleDateClick(day)}
          disabled={disabled}
          className={`h-10 w-10 rounded-lg text-sm font-medium transition
            ${selected 
              ? 'bg-blue-600 text-white' 
              : today 
                ? 'bg-blue-100 text-blue-600' 
                : 'text-gray-900 hover:bg-gray-100'
            }
            ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          {day}
        </button>
      );
    }
    
    return days;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-lg">
      {/* Month/Year Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div className="flex items-center gap-2">
          <select
            value={currentMonth}
            onChange={(e) => setCurrentMonth(Number(e.target.value))}
            className="border border-gray-200 rounded-lg px-2 py-1 text-sm"
            disabled={disabled}
          >
            {MONTHS.map((month, index) => (
              <option key={index} value={index}>{month}</option>
            ))}
          </select>
          
          <select
            value={currentYear}
            onChange={(e) => setCurrentYear(Number(e.target.value))}
            className="border border-gray-200 rounded-lg px-2 py-1 text-sm"
            disabled={disabled}
          >
            {Array.from({ length: 3 }, (_, i) => currentYear - 1 + i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        
        <button
          type="button"
          onClick={handleNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS.map(day => (
          <div key={day} className="h-10 flex items-center justify-center text-xs font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {renderDays()}
      </div>
    </div>
  );
}
