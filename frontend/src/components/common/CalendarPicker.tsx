import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface CalendarPickerProps {
  currentMonth: Date;
  selectedDate: string;
  availableDates: string[];
  onDateSelect: (date: Date) => void;
  onMonthChange: (direction: 'next' | 'prev') => void;
  onClose: () => void;
  isOpen: boolean;
}

export default function CalendarPicker({
  currentMonth,
  selectedDate,
  availableDates,
  onDateSelect,
  onMonthChange,
  onClose,
  isOpen
}: CalendarPickerProps) {
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return selectedDate === formatDateForInput(date);
  };

  const isAvailableDate = (date: Date) => {
    return availableDates.includes(formatDateForInput(date));
  };

  if (!isOpen) return null;

  return (
    <div 
      className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl z-20 p-3 min-w-[300px] max-w-[350px]"
      role="dialog"
      aria-modal="false"
      aria-labelledby="calendar-title"
      aria-describedby="calendar-description"
    >
      <div id="calendar-title" className="sr-only">לוח שנה לבחירת תאריך</div>
      <div id="calendar-description" className="sr-only">בחרי תאריך מהתאריכים הזמינים</div>
      
      {/* Available dates info at top */}
      {availableDates.length > 0 && (
        <div className="mb-3 p-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
          <p className="text-xs font-medium text-green-700 mb-1">תאריכים זמינים:</p>
          <div className="flex flex-wrap gap-1" role="group" aria-label="תאריכים זמינים">
            {availableDates.slice(0, 4).map((date) => (
              <button
                key={date}
                type="button"
                onClick={() => onDateSelect(new Date(date))}
                className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium hover:bg-green-200 hover:text-green-800 transition-colors cursor-pointer"
                aria-label={`בחר תאריך ${new Date(date).toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric', year: 'numeric' })}`}
              >
                {new Date(date).toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric' })}
              </button>
            ))}
            {availableDates.length > 4 && (
              <span className="text-xs text-green-600 font-medium" aria-label={`ועוד ${availableDates.length - 4} תאריכים נוספים`}>
                +{availableDates.length - 4} נוספים
              </span>
            )}
          </div>
        </div>
      )}
      
      {/* Header with better styling */}
      <div className="flex items-center justify-between mb-3 p-2 bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5 rounded-lg">
        <button
          type="button"
          onClick={() => onMonthChange('prev')}
          className="p-1.5 hover:bg-white rounded transition-all duration-200 hover:shadow-sm"
          aria-label="חודש קודם"
        >
          <FaChevronRight className="w-3 h-3 text-[#4B2E83]" aria-hidden="true" />
        </button>
        <span className="text-sm font-bold text-[#4B2E83]" aria-live="polite">
          {currentMonth.toLocaleDateString('he-IL', { year: 'numeric', month: 'long' })}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onMonthChange('next')}
            className="p-1.5 hover:bg-white rounded transition-all duration-200 hover:shadow-sm"
            aria-label="חודש הבא"
          >
            <FaChevronLeft className="w-3 h-3 text-[#4B2E83]" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-red-100 rounded transition-all duration-200 hover:shadow-sm text-red-600 hover:text-red-700"
            title="סגור לוח שנה"
            aria-label="סגור לוח שנה"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Days of week with better styling */}
      <div className="grid grid-cols-7 gap-1 mb-2" role="rowgroup" aria-label="ימי השבוע">
        {['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'].map(day => (
          <div key={day} className="text-xs text-center text-[#4B2E83]/60 font-medium py-1" role="columnheader">
            {day}
          </div>
        ))}
      </div>
      
      {/* Enhanced Calendar grid */}
      <div className="grid grid-cols-7 gap-1" role="grid" aria-label={`לוח שנה לחודש ${currentMonth.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })}`}>
        {getDaysInMonth(currentMonth).map((date, index) => (
          <button
            key={index}
            type="button"
            onClick={() => date && onDateSelect(date)}
            disabled={!date || !isAvailableDate(date)}
            className={`
              p-1.5 text-xs rounded transition-all duration-200 font-medium
              ${!date ? 'invisible' : ''}
              ${date && isToday(date) ? 'bg-blue-100 text-blue-600 ring-1 ring-blue-200' : ''}
              ${date && isSelected(date) ? 'bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white shadow-md' : ''}
              ${date && !isToday(date) && !isSelected(date) && isAvailableDate(date) ? 'hover:bg-[#EC4899]/10 hover:text-[#EC4899] hover:shadow-sm' : ''}
              ${date && !isAvailableDate(date) ? 'text-gray-300 cursor-not-allowed' : 'cursor-pointer'}
              ${date && isAvailableDate(date) ? 'text-gray-700' : ''}
            `}
            aria-label={date ? `${date.getDate()} ${currentMonth.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })}${isToday(date) ? ', היום' : ''}${isSelected(date) ? ', נבחר' : ''}${!isAvailableDate(date) ? ', לא זמין' : ''}` : ''}
            aria-selected={date ? isSelected(date) : undefined}
            aria-disabled={date ? !isAvailableDate(date) : undefined}
            role="gridcell"
          >
            {date ? date.getDate() : ''}
          </button>
        ))}
      </div>
    </div>
  );
} 