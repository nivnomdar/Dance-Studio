import { useEffect, useState } from 'react';
import { useAdminData } from '../../../contexts/AdminDataContext';
import type { UserProfile } from '../../../types/auth';
import { anyToHebrewDay, isSessionActiveOnDay } from '../../../utils/weekdaysUtils';
import { 
  formatDate, 
  formatDateRange, 
  getCurrentWeekInfo, 
  getWeekRange, 
  isCurrentWeek,
  getWeekInfo,
  getFullHebrewDate,
  isToday,
  isTomorrow
} from '../../../utils/dateUtils';

interface SessionDetails {
  id: string;
  name: string;
  description: string;
  start_time: string;
  end_time: string;
  weekdays: (string | number)[];
  max_capacity: number;
  location: string;
  is_active: boolean;
  linkedClasses: any[];
  activeRegistrationsCount: number;
  occupancyRate: number;
  activeRegistrations: any[]; // Add registrations array
  cancelledRegistrations: any[]; // Add cancelled registrations array
  date?: string; // Add optional date field
}

interface AdminCalendarProps {
  profile: UserProfile;
}

interface CalendarData {
  classes: any[];
  registrations: any[];
  weeklySchedule: {
    [key: string]: {
      startDate: string;
      days: {
        [key: string]: {
          date: string;
          dayName: string;
          classes: any[];
        };
      };
    };
  };
}

export default function AdminCalendar({ profile }: AdminCalendarProps) {
  const { data, isLoading, error, fetchCalendar, fetchClasses, isFetching } = useAdminData();
  const [currentWeek, setCurrentWeek] = useState(1);
  const [selectedSession, setSelectedSession] = useState<SessionDetails | null>(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showCancelledRegistrations, setShowCancelledRegistrations] = useState(false);

  // טעינת נתונים רק אם אין נתונים או שהם ישנים
  useEffect(() => {
    if (!data.calendar || !data.sessions || !data.session_classes || !data.classes) {
      // טען את כל הנתונים הנדרשים ללוח שנה
      fetchClasses();
      fetchCalendar();
    }
  }, [data.calendar, data.sessions, data.session_classes, data.classes, fetchCalendar, fetchClasses]);

  const calendarData = data.calendar as CalendarData | null;

  const getHebrewDayName = (dayName: string) => {
    return anyToHebrewDay(dayName);
  };

  // Function to get sessions for a specific date and week
  const getSessionsForDate = (dateKey: string, weekNumber: number, weekData: any) => {
    if (!data.sessions || !data.session_classes) return [];
    
    // Create date with timezone consideration
    const [year, month, day] = dateKey.split('-').map(Number);
    const date = new Date(year, month - 1, day, 12, 0, 0); // Use noon to avoid timezone issues
    const dayOfWeek = date.getDay(); // 0=Sunday, 1=Monday, 2=Tuesday, etc.
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[dayOfWeek];
    
    // Filter sessions that are active on this day
    const daySessions = data.sessions.filter((session: any) => {
      return isSessionActiveOnDay(session, dayName);
    });
    
    // Add linked classes and registration data to each session
    return daySessions.map((session: any) => {
      const linkedClasses = data.session_classes
        .filter((sc: any) => sc.session_id === session.id && sc.is_active)
        .map((sc: any) => {
          const classData = data.classes?.find((c: any) => c.id === sc.class_id);
          return {
            id: sc.id,
            classId: sc.class_id,
            className: classData?.name || 'שיעור לא ידוע',
            classPrice: classData?.price || 0
          };
        });
      
      // Calculate active registrations for this session and specific week
      // Debug: Log all registrations for this session to see their statuses
      const sessionRegistrations = data.registrations?.filter((reg: any) => {
        const [regYear, regMonth, regDay] = reg.selected_date.split('-').map(Number);
        const regDate = new Date(regYear, regMonth - 1, regDay, 12, 0, 0);
        const regDayOfWeek = regDate.getDay();
        const regDayName = dayNames[regDayOfWeek];
        
        return regDayName === dayName &&
               reg.selected_time === session.start_time.substring(0, 5);
      }) || [];
      
      console.log('Session registrations:', sessionRegistrations.map(r => ({
        id: r.id,
        status: r.status,
        statusType: typeof r.status,
        name: `${r.first_name} ${r.last_name}`,
        date: r.selected_date,
        time: r.selected_time
      })));
      
      // Log all unique statuses to see what we're dealing with
      const uniqueStatuses = [...new Set(sessionRegistrations.map(r => r.status))];
      console.log('Unique statuses in session:', uniqueStatuses);
      
      const activeRegistrations = data.registrations?.filter((reg: any) => {
        // Create date with timezone consideration
        const [regYear, regMonth, regDay] = reg.selected_date.split('-').map(Number);
        const regDate = new Date(regYear, regMonth - 1, regDay, 12, 0, 0);
        const regDayOfWeek = regDate.getDay();
        const regDayName = dayNames[regDayOfWeek];
        
        // Check if registration is for the selected week
        // Get the week dates from the week data
        const weekDates = Object.keys(weekData?.days || {}).sort();
        const weekStart = weekDates[0];
        const weekEnd = weekDates[weekDates.length - 1];
        const regDateStr = regDate.toISOString().split('T')[0];
        const isInSelectedWeek = regDateStr >= weekStart && regDateStr <= weekEnd;
        
        // Filter for active registrations (exclude cancelled)
        // Handle different possible status values
        const isCancelled = reg.status === 'cancelled' || 
                           reg.status === 'בוטל' || 
                           reg.status === 'canceled' ||
                           String(reg.status).toLowerCase().includes('cancel');
        
        return !isCancelled && 
               regDayName === dayName &&
               reg.selected_time === session.start_time.substring(0, 5) &&
               isInSelectedWeek;
      }) || [];

      // Calculate cancelled registrations for this session and specific week
      const cancelledRegistrations = data.registrations?.filter((reg: any) => {
        // Create date with timezone consideration
        const [regYear, regMonth, regDay] = reg.selected_date.split('-').map(Number);
        const regDate = new Date(regYear, regMonth - 1, regDay, 12, 0, 0);
        const regDayOfWeek = regDate.getDay();
        const regDayName = dayNames[regDayOfWeek];
        
        // Check if registration is for the selected week
        const weekDates = Object.keys(weekData?.days || {}).sort();
        const weekStart = weekDates[0];
        const weekEnd = weekDates[weekDates.length - 1];
        const regDateStr = regDate.toISOString().split('T')[0];
        const isInSelectedWeek = regDateStr >= weekStart && regDateStr <= weekEnd;
        
        // Filter for cancelled registrations
        // Handle different possible status values
        const isCancelled = reg.status === 'cancelled' || 
                           reg.status === 'בוטל' || 
                           reg.status === 'canceled' ||
                           String(reg.status).toLowerCase().includes('cancel');
        
        return isCancelled && 
               regDayName === dayName &&
               reg.selected_time === session.start_time.substring(0, 5) &&
               isInSelectedWeek;
      }) || [];
      
      const activeRegistrationsCount = activeRegistrations.length;
      const occupancyRate = session.max_capacity > 0 ? (activeRegistrationsCount / session.max_capacity) * 100 : 0;
      
      // Convert weekdays to Hebrew names for display
      const hebrewWeekdays = session.weekdays?.map((day: any) => anyToHebrewDay(day)) || [];
      
      return {
        ...session,
        weekdays: hebrewWeekdays, // Replace with Hebrew names
        linkedClasses,
        activeRegistrationsCount,
        occupancyRate,
        activeRegistrations, // Add the actual registrations data
        cancelledRegistrations // Add cancelled registrations data
      };
    });
  };

  // Function to handle session click
  const handleSessionClick = (session: SessionDetails, dateKey: string) => {
    setSelectedSession({
      ...session,
      date: dateKey
    });
    setShowSessionModal(true);
  };

  if (isLoading && !data.calendar) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-[#4B2E83] mb-4">לוח שנה</h2>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EC4899] mx-auto mb-4"></div>
          <p className="text-[#4B2E83]/70">טוען לוח שנה...</p>
        </div>
      </div>
    );
  }

  if (error && !data.calendar) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-[#4B2E83] mb-4">לוח שנה</h2>
        <div className="text-center py-12">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => {
              fetchClasses();
              fetchCalendar();
            }}
            className="px-6 py-3 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded-xl font-medium hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300"
          >
            נסה שוב
          </button>
        </div>
      </div>
    );
  }

  if (!calendarData && !isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-[#4B2E83] mb-4">לוח שנה</h2>
        <div className="text-center py-12">
          <p className="text-[#4B2E83]/70">אין נתונים זמינים</p>
        </div>
      </div>
    );
  }

  if (!calendarData) {
    return null;
  }

  const weekKeys = Object.keys(calendarData.weeklySchedule);
  const currentWeekData = calendarData.weeklySchedule[`week_${currentWeek}`];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 sm:mb-8">
        <div>
          <h2 className="text-2xl font-bold text-[#4B2E83]">לוח שנה</h2>
          <p className="text-sm text-[#4B2E83]/70 mt-1">ניהול קבוצות ופעילויות שבועיות</p>
        </div>
        <button
          onClick={() => {
            fetchClasses();
            fetchCalendar();
          }}
          disabled={isFetching}
          className="px-4 py-2 bg-gradient-to-r from-[#4B2E83] to-[#EC4899] text-white rounded-lg font-medium hover:from-[#EC4899] hover:to-[#4B2E83] transition-all duration-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isFetching ? 'מעדכן...' : 'רענן נתונים'}
        </button>
      </div>

      {/* Week Navigation */}
      <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-4 sm:mb-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-[#4B2E83] mb-2 flex items-center">
              <svg className="w-5 h-5 sm:w-6 h-6 mr-2 sm:mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              ניווט שבועי
            </h3>
            <p className="text-sm sm:text-base text-gray-600">בחרי שבוע לצפייה בפעילויות</p>
          </div>
          <div className="flex gap-1 sm:gap-2 w-full sm:w-auto">
            {weekKeys.map((weekKey, index) => (
              <button
                key={weekKey}
                onClick={() => setCurrentWeek(index + 1)}
                className={`flex-1 sm:flex-none px-3 sm:px-4 lg:px-5 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-semibold transition-all duration-300 text-sm sm:text-base relative overflow-hidden ${
                  currentWeek === index + 1
                    ? 'bg-gradient-to-r from-[#4B2E83] to-[#EC4899] text-white shadow-lg shadow-[#4B2E83]/30'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:shadow-md border border-gray-200'
                }`}
              >
                <span className="relative z-10">שבוע {index + 1}</span>
                {currentWeek === index + 1 && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
                )}
              </button>
            ))}
          </div>
        </div>
        
        {currentWeekData && (
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 sm:w-5 h-5 text-[#4B2E83]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm sm:text-lg font-semibold text-[#4B2E83]">
                    {(() => {
                      const weekDates = Object.keys(currentWeekData.days).sort();
                      if (weekDates.length >= 2) {
                        const firstDate = weekDates[0];
                        const lastDate = weekDates[weekDates.length - 1];
                        return formatDateRange(firstDate, lastDate);
                      }
                      return getWeekRange(currentWeekData.startDate);
                    })()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                {isCurrentWeek(currentWeek) && (
                  <span className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold bg-green-100 text-green-800 border border-green-200">
                    <svg className="w-3 h-3 sm:w-4 h-4 mr-1 sm:mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    שבוע נוכחי
                  </span>
                )}
                {currentWeek === 2 && (
                  <span className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                    <svg className="w-3 h-3 sm:w-4 h-4 mr-1 sm:mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    שבוע הבא
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Calendar Grid */}
      {currentWeekData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-4">
          {Object.entries(currentWeekData.days).map(([dateKey, dayData]) => (
            <div key={dateKey} className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border relative transition-all duration-500 hover:shadow-xl hover:scale-105 ${
              isToday(dateKey) 
                ? 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-green-300 shadow-2xl shadow-green-200/50 ring-4 ring-green-200/30' 
                : isTomorrow(dateKey)
                  ? 'bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50 border-blue-300 shadow-xl shadow-blue-200/40 ring-2 ring-blue-200/30'
                  : 'bg-white border-gray-200 shadow-lg hover:border-[#EC4899]/30'
            }`}>
              {/* Today/Tomorrow badge */}
              {isToday(dateKey) && (
                <div className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 transform rotate-12">
                  <span className="inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-bold bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30 border-2 border-white">
                    <svg className="w-2 h-2 sm:w-3 h-3 mr-0.5 sm:mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    היום
                  </span>
                </div>
              )}
              {isTomorrow(dateKey) && (
                <div className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 transform rotate-12">
                  <span className="inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-bold bg-gradient-to-r from-blue-500 to-sky-600 text-white shadow-lg shadow-blue-500/30 border-2 border-white">
                    <svg className="w-2 h-2 sm:w-3 h-3 mr-0.5 sm:mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    מחר
                  </span>
                </div>
              )}
              
                        <div className="text-center mb-3 sm:mb-4">
            <div className="mb-2">
              <h4 className="font-bold text-base sm:text-lg text-[#4B2E83] mb-1">
                {getHebrewDayName(dayData.dayName)}
              </h4>
              <p className="text-xs sm:text-sm font-semibold text-[#4B2E83]/80">
                {formatDate(dateKey)}
              </p>
            </div>
            <div className="w-full h-1 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] rounded-full opacity-30"></div>
          </div>

              {/* Sessions Section */}
              {(() => {
                const daySessions = getSessionsForDate(dateKey, currentWeek, currentWeekData);
                return daySessions.length > 0 ? (
                  <div className="mb-4">
                    <div className="space-y-3">
                      {daySessions.map((session) => (
                                        <div 
                  key={session.id} 
                  className={`p-2 sm:p-3 rounded-lg sm:rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 min-h-[70px] sm:min-h-[80px] flex items-center justify-center relative overflow-hidden ${
                    session.occupancyRate >= 100 
                      ? 'border-green-400 bg-gradient-to-br from-green-50 to-emerald-50 shadow-green-200/50' 
                      : session.occupancyRate >= 80 
                        ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-yellow-200/50'
                        : session.occupancyRate >= 50 
                          ? 'border-orange-400 bg-gradient-to-br from-orange-50 to-red-50 shadow-orange-200/50'
                          : 'border-red-400 bg-gradient-to-br from-red-50 to-pink-50 shadow-red-200/50'
                  }`}
                  onClick={() => handleSessionClick(session, dateKey)}
                >
                  <div className="text-center w-full relative z-10">
                    <h6 className="font-bold text-[#4B2E83] text-xs sm:text-sm mb-1 sm:mb-2 leading-tight break-words">{session.name}</h6>
                    <div className="flex items-center justify-center gap-1 mb-1 sm:mb-2">
                      <div className="w-1 h-1 sm:w-1.5 h-1.5 rounded-full bg-[#4B2E83]"></div>
                      <span className="text-xs font-semibold text-[#4B2E83]">
                        {session.activeRegistrationsCount}/{session.max_capacity}
                      </span>
                      <div className="w-1 h-1 sm:w-1.5 h-1.5 rounded-full bg-[#4B2E83]"></div>
                    </div>
                                                          <div className="relative">
                                <div className="w-full bg-gray-200 rounded-full h-1 sm:h-1.5 mb-0.5 sm:mb-1">
                                  <div 
                                    className={`h-1 sm:h-1.5 rounded-full transition-all duration-500 ${
                                      session.occupancyRate >= 100 
                                        ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                                        : session.occupancyRate >= 80 
                                          ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                                          : session.occupancyRate >= 50 
                                            ? 'bg-gradient-to-r from-orange-500 to-red-500'
                                            : 'bg-gradient-to-r from-red-500 to-pink-500'
                                    }`}
                                    style={{ width: `${Math.min(session.occupancyRate, 100)}%` }}
                                  ></div>
                                </div>
                                <div className={`text-xs font-semibold text-center ${
                                  session.occupancyRate >= 100 
                                    ? 'text-green-700' 
                                    : session.occupancyRate >= 80 
                                      ? 'text-yellow-700'
                                      : session.occupancyRate >= 50 
                                        ? 'text-orange-700'
                                        : 'text-red-700'
                                }`}>
                                  {session.occupancyRate.toFixed(0)}%
                                  {session.occupancyRate >= 100 && ' מלא!'}
                                </div>
                              </div>
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Classes Section */}
              {dayData.classes.length > 0 && (
                <div className="space-y-3">
                  <h5 className="font-semibold text-[#4B2E83] text-base mb-3">שיעורים זמינים:</h5>
                  {dayData.classes.map((cls) => (
                    <div key={cls.id} className="bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5 p-4 rounded-xl border border-[#EC4899]/10">
                      <div className="mb-3">
                        <h5 className="font-semibold text-[#4B2E83] text-base mb-1">{cls.name}</h5>
                        <p className="text-sm text-[#4B2E83]/70">
                          {cls.level} • {cls.duration} דקות • ₪{cls.price}
                        </p>
                      </div>

                      {/* Class Times */}
                      <div className="mb-3">
                        <p className="text-sm font-medium text-[#4B2E83] mb-2">שעות זמינות:</p>
                        <div className="flex flex-wrap gap-2">
                          {cls.times.map((time: string, index: number) => (
                            <span key={index} className="text-sm bg-[#4B2E83]/10 text-[#4B2E83] px-3 py-1 rounded">
                              {time}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Registrations */}
                      {cls.registrations.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-[#4B2E83] mb-2">
                            רשומות ({cls.registrations.length}):
                          </p>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {cls.registrations.map((reg: any) => (
                              <div key={reg.id} className="text-sm bg-white p-3 rounded border">
                                <p className="font-medium text-[#4B2E83]">
                                  {reg.userFullName}
                                </p>
                                <p className="text-[#4B2E83]/70">
                                  {reg.selectedTime} • {reg.phone}
                                </p>
                                {reg.notes && (
                                  <p className="text-[#4B2E83]/60 italic">
                                    הערה: {reg.notes}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Show "No activities" only if there are no sessions AND no classes */}
              {(() => {
                const daySessions = getSessionsForDate(dateKey, currentWeek, currentWeekData);
                return daySessions.length === 0 && dayData.classes.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-base text-[#4B2E83]/50">אין פעילויות מתוכננות</p>
                  </div>
                ) : null;
              })()}
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      <div className="bg-gradient-to-r from-[#4B2E83] to-[#EC4899] p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl text-white shadow-2xl">
        <div className="flex items-center mb-4 sm:mb-6">
          <svg className="w-6 h-6 sm:w-8 h-8 mr-3 sm:mr-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl sm:text-2xl font-bold">סיכום שבועי</h3>
        </div>
        <div className="grid grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
          {/* סה"כ קבוצות */}
          <div className="text-center bg-white/10 backdrop-blur-sm p-2 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl lg:rounded-2xl border border-white/20">
            <div className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 lg:mb-4">
              <svg className="w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838l-2.727 1.17 1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762z" />
              </svg>
            </div>
            <h4 className="text-xs sm:text-base lg:text-lg font-bold mb-1 sm:mb-2">סה"כ קבוצות</h4>
            <p className="text-lg sm:text-2xl lg:text-3xl font-bold">
              {(() => {
                const totalSessions = Object.values(currentWeekData.days).reduce((total, day) => {
                  const sessionsForDay = getSessionsForDate(day.date, currentWeek, currentWeekData);
                  return total + sessionsForDay.length;
                }, 0);
                return totalSessions;
              })()}
            </p>
            <p className="text-xs opacity-80 mt-1">
              {(() => {
                const daysWithSessions = Object.values(currentWeekData.days).filter(day => {
                  const sessionsForDay = getSessionsForDate(day.date, currentWeek, currentWeekData);
                  return sessionsForDay.length > 0;
                }).length;
                return `${daysWithSessions} ימים פעילים`;
              })()}
            </p>
          </div>
          
          {/* סה"כ משתתפים */}
          <div className="text-center bg-white/10 backdrop-blur-sm p-2 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl lg:rounded-2xl border border-white/20">
            <div className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 lg:mb-4">
              <svg className="w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <h4 className="text-xs sm:text-base lg:text-lg font-bold mb-1 sm:mb-2">סה"כ משתתפים</h4>
            <p className="text-lg sm:text-2xl lg:text-3xl font-bold">
              {(() => {
                const totalParticipants = Object.values(currentWeekData.days).reduce((total, day) => {
                  const sessionsForDay = getSessionsForDate(day.date, currentWeek, currentWeekData);
                  return total + sessionsForDay.reduce((dayTotal: number, session: any) => {
                    return dayTotal + (session.activeRegistrationsCount || 0);
                  }, 0);
                }, 0);
                return totalParticipants;
              })()}
            </p>
            <p className="text-xs opacity-80 mt-1">
              {(() => {
                const totalSessions = Object.values(currentWeekData.days).reduce((total, day) => {
                  const sessionsForDay = getSessionsForDate(day.date, currentWeek, currentWeekData);
                  return total + sessionsForDay.length;
                }, 0);
                const totalParticipants = Object.values(currentWeekData.days).reduce((total, day) => {
                  const sessionsForDay = getSessionsForDate(day.date, currentWeek, currentWeekData);
                  return total + sessionsForDay.reduce((dayTotal: number, session: any) => {
                    return dayTotal + (session.activeRegistrationsCount || 0);
                  }, 0);
                }, 0);
                const avgPerSession = totalSessions > 0 ? (totalParticipants / totalSessions) : 0;
                return `${avgPerSession.toFixed(1)} בממוצע לקבוצה`;
              })()}
            </p>
          </div>
          
          {/* תפוסה ממוצעת */}
          <div className="text-center bg-white/10 backdrop-blur-sm p-2 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl lg:rounded-2xl border border-white/20">
            <div className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 lg:mb-4">
              <svg className="w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h4 className="text-xs sm:text-base lg:text-lg font-bold mb-1 sm:mb-2">תפוסה ממוצעת</h4>
            <p className="text-lg sm:text-2xl lg:text-3xl font-bold">
              {(() => {
                const allSessions = Object.values(currentWeekData.days).flatMap(day => 
                  getSessionsForDate(day.date, currentWeek, currentWeekData)
                );
                if (allSessions.length === 0) return '0%';
                const avgOccupancy = allSessions.reduce((total, session) => {
                  return total + (session.occupancyRate || 0);
                }, 0) / allSessions.length;
                return `${avgOccupancy.toFixed(0)}%`;
              })()}
            </p>
            <p className="text-xs opacity-80 mt-1">
              {(() => {
                const allSessions = Object.values(currentWeekData.days).flatMap(day => 
                  getSessionsForDate(day.date, currentWeek, currentWeekData)
                );
                const fullSessions = allSessions.filter(session => (session.occupancyRate || 0) >= 100).length;
                return `${fullSessions} קבוצות מלאות`;
              })()}
            </p>
          </div>

          {/* ימים עם פעילות */}
          <div className="text-center bg-white/10 backdrop-blur-sm p-2 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl lg:rounded-2xl border border-white/20">
            <div className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 lg:mb-4">
              <svg className="w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            </div>
            <h4 className="text-xs sm:text-base lg:text-lg font-bold mb-1 sm:mb-2">ימים פעילים</h4>
            <p className="text-lg sm:text-2xl lg:text-3xl font-bold">
              {(() => {
                const activeDays = Object.values(currentWeekData.days).filter(day => {
                  const sessionsForDay = getSessionsForDate(day.date, currentWeek, currentWeekData);
                  return sessionsForDay.length > 0;
                }).length;
                return activeDays;
              })()}
            </p>
            <p className="text-xs opacity-80 mt-1">
              {(() => {
                const totalDays = Object.keys(currentWeekData.days).length;
                const activeDays = Object.values(currentWeekData.days).filter(day => {
                  const sessionsForDay = getSessionsForDate(day.date, currentWeek, currentWeekData);
                  return sessionsForDay.length > 0;
                }).length;
                return `${((activeDays / totalDays) * 100).toFixed(0)}% מהשבוע`;
              })()}
            </p>
          </div>
        </div>
      </div>

      {/* Session Details Modal */}
      {showSessionModal && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              {/* Header */}
              <div className="flex justify-between items-start mb-8">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-[#4B2E83] mb-2">{selectedSession.name}</h3>
                  <p className="text-[#4B2E83]/70 mb-2">{selectedSession.description}</p>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium text-blue-800">
                        {selectedSession.date && getFullHebrewDate(selectedSession.date)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-lg border border-green-200">
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium text-green-800">
                        {selectedSession.start_time.substring(0, 5)} - {selectedSession.end_time.substring(0, 5)}
                      </span>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border ${
                      selectedSession.is_active 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <svg className={`w-4 h-4 ${
                        selectedSession.is_active ? 'text-green-600' : 'text-red-600'
                      }`} fill="currentColor" viewBox="0 0 20 20">
                        {selectedSession.is_active ? (
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        ) : (
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        )}
                      </svg>
                      <span className={`font-medium ${
                        selectedSession.is_active ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {selectedSession.is_active ? 'פעיל' : 'לא פעיל'}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowSessionModal(false)}
                  className="text-[#4B2E83]/70 hover:text-[#4B2E83] transition-colors p-2 hover:bg-gray-100 rounded-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-gradient-to-r from-[#EC4899]/10 to-[#4B2E83]/10 p-4 rounded-xl border border-[#EC4899]/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#4B2E83]/70">תפוסה</p>
                      <p className="text-2xl font-bold text-[#4B2E83]">
                        {selectedSession.activeRegistrationsCount}/{selectedSession.max_capacity}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          selectedSession.occupancyRate >= 100 
                            ? 'bg-green-500' 
                            : selectedSession.occupancyRate >= 80 
                              ? 'bg-yellow-500' 
                              : selectedSession.occupancyRate >= 50 
                                ? 'bg-orange-500' 
                                : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(selectedSession.occupancyRate, 100)}%` }}
                      ></div>
                    </div>
                    <p className={`text-xs mt-1 ${
                      selectedSession.occupancyRate >= 100 
                        ? 'text-green-600 font-medium' 
                        : selectedSession.occupancyRate >= 80 
                          ? 'text-yellow-600' 
                          : selectedSession.occupancyRate >= 50 
                            ? 'text-orange-600' 
                            : 'text-red-600'
                    }`}>
                      {selectedSession.occupancyRate.toFixed(1)}% תפוסה
                      {selectedSession.occupancyRate >= 100 && ' - מלא!'}
                    </p>
                  </div>
                </div>



                <div className="bg-gradient-to-r from-blue-50 to-sky-50 p-4 rounded-xl border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-700">ימי פעילות שבועיות לקבוצה</p>
                      <p className="text-lg font-semibold text-blue-800">
                        סה"כ {selectedSession.weekdays.length} ימים
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-2 flex gap-1">
                    {selectedSession.weekdays.map((day, index) => (
                      <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {anyToHebrewDay(day)}
                      </span>
                    ))}
                  </div>
                </div>


              </div>

              {/* Registrations Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-xl font-semibold text-[#4B2E83] flex items-center">
                    <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                    </svg>
                    רשומים לקבוצה
                  </h4>
                  
                  {selectedSession.cancelledRegistrations.length > 0 && (
                    <button
                      onClick={() => setShowCancelledRegistrations(!showCancelledRegistrations)}
                      className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        showCancelledRegistrations 
                          ? 'bg-red-500 text-white hover:bg-red-600' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      {showCancelledRegistrations ? 'הסתר ביטולים' : `הצג ביטולים (${selectedSession.cancelledRegistrations.length})`}
                    </button>
                  )}
                </div>

                {/* Active Registrations */}
                {selectedSession.activeRegistrations.length > 0 ? (
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 w-16">מס'</th>
                            <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 w-32">שם מלא</th>
                            <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 w-40">אימייל</th>
                            <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 w-28">טלפון</th>
                            <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 w-32">תאריך הרשמה</th>
                            <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 w-24">סטטוס</th>
                            <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 w-40">הערות</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {selectedSession.activeRegistrations.map((registration, index) => (
                            <tr key={registration.id} className="hover:bg-gray-50 transition-colors duration-200">
                              <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                <div className="w-8 h-8 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] rounded-full flex items-center justify-center text-white text-sm font-bold">
                                  {index + 1}
                                </div>
                              </td>
                                                                                           <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                {registration.first_name && registration.last_name 
                                  ? `${registration.first_name} ${registration.last_name}`
                                  : registration.first_name || registration.last_name || 'שם לא זמין'
                                }
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {registration.email || 'אימייל לא זמין'}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {registration.phone || 'טלפון לא זמין'}
                              </td>

                              <td className="px-6 py-4 text-sm text-gray-600">
                                {registration.created_at ? (
                                  <div className="flex flex-col">
                                    <span className="font-medium">
                                      {new Date(registration.created_at).toLocaleDateString('he-IL')}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                      {new Date(registration.created_at).toLocaleTimeString('he-IL', { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                      })}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-gray-400">לא זמין</span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                  registration.status === 'active' || registration.status === 'confirmed'
                                    ? 'bg-green-100 text-green-800' 
                                    : registration.status === 'pending'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {registration.status === 'active' ? 'פעיל' :
                                   registration.status === 'confirmed' ? 'אושר' : 
                                   registration.status === 'pending' ? 'ממתין' : 
                                   registration.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                                {registration.notes ? (
                                  <div className="truncate" title={registration.notes}>
                                    {registration.notes}
                                  </div>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                    </svg>
                    <p className="text-gray-500">אין רשומים לקבוצה זו</p>
                  </div>
                )}

                {/* Cancelled Registrations */}
                {showCancelledRegistrations && selectedSession.cancelledRegistrations.length > 0 && (
                  <div className="bg-white rounded-xl border border-red-200 overflow-hidden shadow-sm">
                    <div className="bg-red-50 px-6 py-3 border-b border-red-200">
                      <h5 className="text-sm font-semibold text-red-800 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        רשומים שבוטלו ({selectedSession.cancelledRegistrations.length})
                      </h5>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-red-50">
                          <tr>
                            <th className="px-6 py-4 text-right text-sm font-semibold text-red-800 w-16">מס'</th>
                            <th className="px-6 py-4 text-right text-sm font-semibold text-red-800 w-32">שם מלא</th>
                            <th className="px-6 py-4 text-right text-sm font-semibold text-red-800 w-40">אימייל</th>
                            <th className="px-6 py-4 text-right text-sm font-semibold text-red-800 w-28">טלפון</th>
                            <th className="px-6 py-4 text-right text-sm font-semibold text-red-800 w-32">תאריך ביטול</th>
                            <th className="px-6 py-4 text-right text-sm font-semibold text-red-800 w-24">סטטוס</th>
                            <th className="px-6 py-4 text-right text-sm font-semibold text-red-800 w-40">הערות</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-red-100">
                          {selectedSession.cancelledRegistrations.map((registration, index) => (
                            <tr key={registration.id} className="hover:bg-red-50 transition-colors duration-200">
                              <td className="px-6 py-4 text-sm text-red-800 font-medium">
                                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                  {index + 1}
                                </div>
                              </td>
                                                                                           <td className="px-6 py-4 text-sm font-medium text-red-800">
                                {registration.first_name && registration.last_name 
                                  ? `${registration.first_name} ${registration.last_name}`
                                  : registration.first_name || registration.last_name || 'שם לא זמין'
                                }
                              </td>
                              <td className="px-6 py-4 text-sm text-red-700">
                                {registration.email || 'אימייל לא זמין'}
                              </td>
                              <td className="px-6 py-4 text-sm text-red-700">
                                {registration.phone || 'טלפון לא זמין'}
                              </td>
                              <td className="px-6 py-4 text-sm text-red-700">
                                {registration.updated_at ? (
                                  <div className="flex flex-col">
                                    <span className="font-medium">
                                      {new Date(registration.updated_at).toLocaleDateString('he-IL')}
                                    </span>
                                    <span className="text-xs text-red-400">
                                      {new Date(registration.updated_at).toLocaleTimeString('he-IL', { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                      })}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-red-400">לא זמין</span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                  בוטל
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-red-700 max-w-xs">
                                {registration.notes ? (
                                  <div className="truncate" title={registration.notes}>
                                    {registration.notes}
                                  </div>
                                ) : (
                                  <span className="text-red-400">-</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setShowSessionModal(false)}
                  className="px-8 py-3 bg-gradient-to-r from-[#4B2E83] to-[#EC4899] text-white rounded-xl font-medium hover:from-[#EC4899] hover:to-[#4B2E83] transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  סגור
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 