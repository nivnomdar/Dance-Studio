import React from 'react';
import ResponsiveSelect from '../../../components/ui/ResponsiveSelect';
import { SessionData } from '../../types/admin';
import { getDayOfWeekName, getOccupancyColor, groupRegistrationsByTime } from '../../utils/adminOverviewUtils';

// Loading State Component
export const AdminOverviewLoadingState: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-[#4B2E83] mb-4">סקירה כללית</h2>
    <div className="text-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EC4899] mx-auto mb-4"></div>
      <p className="text-[#4B2E83]/70">טוען נתונים...</p>
    </div>
  </div>
);

// Error State Component
interface ErrorStateProps {
  error: string;
  onRetry: () => void;
  onResetRateLimit: () => void;
}

export const AdminOverviewErrorState: React.FC<ErrorStateProps> = ({ error, onRetry, onResetRateLimit }) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-[#4B2E83] mb-4">סקירה כללית</h2>
    <div className="text-center py-12">
      <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <p className="text-red-600 mb-4">{error}</p>
      <div className="flex gap-3 justify-center">
        <button
          onClick={onRetry}
          className="px-6 py-3 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded-xl font-medium hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300"
        >
          נסה שוב
        </button>
        {error.includes('יותר מדי בקשות') && (
          <button
            onClick={onResetRateLimit}
            className="px-6 py-3 bg-gray-500 text-white rounded-xl font-medium hover:bg-gray-600 transition-all duration-300"
          >
            איפוס הגבלה
          </button>
        )}
      </div>
    </div>
  </div>
);

// No Data State Component
export const AdminOverviewNoDataState: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-[#4B2E83] mb-4">סקירה כללית</h2>
    <div className="text-center py-12">
      <p className="text-[#4B2E83]/70">אין נתונים זמינים</p>
    </div>
  </div>
);

// Filters Component
interface FiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
}

export const AdminOverviewFilters: React.FC<FiltersProps> = ({ 
  searchTerm, 
  setSearchTerm, 
  filterStatus, 
  setFilterStatus 
}) => (
  <div className="bg-white rounded-2xl p-3 sm:p-6 shadow-sm border border-[#EC4899]/10">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
      <div>
        <label className="block text-sm font-medium text-[#4B2E83] mb-2">חיפוש קבוצה קרובה</label>
        <input
          type="text"
          placeholder="חפש לפי שם או תיאור..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none"
        />
      </div>
      <div>
        <ResponsiveSelect
          label="סטטוס קבוצה"
          value={filterStatus}
          onChange={(v) => setFilterStatus(v)}
          options={[
            { value: 'all', label: 'כל הקבוצות הקרובות' },
            { value: 'active', label: 'פעילות בלבד' },
            { value: 'inactive', label: 'לא פעילות' }
          ]}
        />
      </div>
    </div>
  </div>
);

// Date Display Component
interface DateDisplayProps {
  specificDate: string;
}

export const DateDisplay: React.FC<DateDisplayProps> = ({ specificDate }) => {
  const specificDateObj = new Date(specificDate);
  const dayOfWeek = specificDateObj.getDay();
  const dayName = getDayOfWeekName(dayOfWeek);
  
  const today = new Date();
  today.setHours(0,0,0,0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  let statusText = '';
  let statusColor = '';
  
  if (specificDateObj.getTime() === today.getTime()) {
    statusText = 'היום';
    statusColor = 'text-green-600';
  } else if (specificDateObj.getTime() === tomorrow.getTime()) {
    statusText = 'מחר';
    statusColor = 'text-blue-600';
  }
  
  return (
    <div className="space-y-1">
      <div className="font-semibold text-xs sm:text-sm">
        {specificDateObj.toLocaleDateString('he-IL')}
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-[#4B2E83]/10 text-[#4B2E83] whitespace-nowrap">
          יום {dayName}
        </span>
        {statusText && (
          <div className={`text-xs font-semibold ${statusColor}`}>
            {statusText}
          </div>
        )}
      </div>
    </div>
  );
};

// Time Display Component
interface TimeDisplayProps {
  startTime?: string;
  endTime?: string;
}

export const TimeDisplay: React.FC<TimeDisplayProps> = ({ startTime, endTime }) => (
  <div className="text-xs sm:text-sm text-[#EC4899] font-medium leading-tight">
    {startTime && endTime ? (
      <div className="space-y-1">
        <div className="font-semibold">
          {startTime.substring(0, 5)}
        </div>
        <div className="text-[#4B2E83]/70 text-xs">עד</div>
        <div className="font-semibold">
          {endTime.substring(0, 5)}
        </div>
      </div>
    ) : (
      'לא מוגדר'
    )}
  </div>
);

// Status Badge Component
interface StatusBadgeProps {
  isActive: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ isActive }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
    isActive 
      ? 'bg-green-100 text-green-800 border border-green-200' 
      : 'bg-red-50 text-red-700 border border-red-200'
  }`}>
    {isActive ? (
      <>
        <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        פעיל
      </>
    ) : (
      <>
        <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
        לא פעיל
      </>
    )}
  </span>
);

// No Results Component
export const AdminOverviewNoResults: React.FC = () => (
  <div className="bg-white rounded-2xl p-12 text-center">
    <div className="mx-auto mb-4 w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-[#4B2E83] mb-2">לא נמצאו קבוצות קרובות</h3>
    <p className="text-[#4B2E83]/70">אין קבוצות מתוכננות לשבוע הקרוב או נסה לשנות את פרמטרי החיפוש</p>
  </div>
); 