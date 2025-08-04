import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useAdminData } from '../../../contexts/AdminDataContext';
import type { UserProfile } from '../../../types/auth';
import { RefreshButton } from '../../admin';
import CalendarDetailsModal from '../modals/CalendarDetailsModal';

// Calendar Constants
const HEBREW_MONTHS = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
];

const HEBREW_DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

const OCCUPANCY_COLORS = {
  FULL: 'bg-green-500',
  HIGH: 'bg-yellow-500', 
  MEDIUM: 'bg-orange-500',
  LOW: 'bg-red-500'
} as const;

const OCCUPANCY_TEXT_COLORS = {
  FULL: 'text-green-600',
  HIGH: 'text-yellow-600',
  MEDIUM: 'text-orange-600', 
  LOW: 'text-red-600'
} as const;

// Types
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
  activeRegistrations: any[];
  cancelledRegistrations: any[];
  date?: string;
}

interface Event {
  id: string;
  date: string;
  title: string;
  description?: string;
  icon?: string;
  start_time?: string;
  end_time?: string;
  max_capacity?: number;
  activeRegistrationsCount?: number;
  occupancyRate?: number;
}

interface DayData {
  date: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  events: Event[];
}

interface AdminCalendarProps {
  profile: UserProfile;
}

// Calendar utility functions
const getDaysInMonth = (year: number, month: number): Date[] => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: Date[] = [];
  
  // Add days from previous month to fill first week
  const firstDayOfWeek = firstDay.getDay();
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    days.push(new Date(year, month, -i));
  }
  
  // Add all days of current month
  for (let day = 1; day <= lastDay.getDate(); day++) {
    days.push(new Date(year, month, day));
  }
  
  // Add days from next month to fill last week
  const lastDayOfWeek = lastDay.getDay();
  for (let i = 1; i <= 6 - lastDayOfWeek; i++) {
    days.push(new Date(year, month + 1, i));
  }
  
  return days;
};

const formatDateString = (date: Date): string => {
  // Format date in Israel timezone (UTC+3)
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getHebrewMonthName = (month: number): string => {
  return HEBREW_MONTHS[month];
};

const getHebrewDayName = (day: number): string => {
  return HEBREW_DAYS[day];
};

const getCalendarOccupancyColor = (occupancyRate?: number) => {
  if (!occupancyRate) return OCCUPANCY_COLORS.LOW;
  
  if (occupancyRate >= 100) return OCCUPANCY_COLORS.FULL;
  if (occupancyRate >= 80) return OCCUPANCY_COLORS.HIGH;
  if (occupancyRate >= 50) return OCCUPANCY_COLORS.MEDIUM;
  return OCCUPANCY_COLORS.LOW;
};

const getCalendarOccupancyTextColor = (occupancyRate?: number) => {
  if (!occupancyRate) return OCCUPANCY_TEXT_COLORS.LOW;
  
  if (occupancyRate >= 100) return OCCUPANCY_TEXT_COLORS.FULL;
  if (occupancyRate >= 80) return OCCUPANCY_TEXT_COLORS.HIGH;
  if (occupancyRate >= 50) return OCCUPANCY_TEXT_COLORS.MEDIUM;
  return OCCUPANCY_TEXT_COLORS.LOW;
};

export default function AdminCalendar({ profile }: AdminCalendarProps) {
  const { data, isLoading, error, fetchClasses, isFetching } = useAdminData();
  const [selectedSession, setSelectedSession] = useState<SessionDetails | null>(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isMobile, setIsMobile] = useState(false);

  // Responsive detection
  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      setIsMobile(width < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get current date in Israel timezone for display
  const getCurrentIsraelDate = () => {
    const now = new Date();
    // Israel is UTC+3, but we'll use the local date which should be correct
    return formatDateString(now);
  };

  // Function to get sessions for a specific date
  const getSessionsForDate = (dateKey: string) => {
    if (!data.sessions || !data.session_classes) return [];
    
    const [year, month, day] = dateKey.split('-').map(Number);
    // Use Israel timezone
    const date = new Date(year, month - 1, day, 12, 0, 0);
    // Get day of week in Israel timezone
    const dayOfWeek = date.getDay();
    
    const daySessions = data.sessions.filter((session: any) => {
      // Check if session is active on this day of week
      if (!session.weekdays || !Array.isArray(session.weekdays)) return false;
      
      // weekdays is JSONB array like [3,4] where 0=Sunday, 1=Monday, etc.
      return session.weekdays.includes(dayOfWeek);
    });
    
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
      
      const sessionRegistrations = data.registrations?.filter((reg: any) => {
        return reg.session_id === session.id && reg.selected_date === dateKey && reg.status === 'active';
      }) || [];
      
      const cancelledRegistrations = data.registrations?.filter((reg: any) => {
        return reg.session_id === session.id && reg.selected_date === dateKey && reg.status === 'cancelled';
      }) || [];
      
      const activeRegistrationsCount = sessionRegistrations.length;
      const occupancyRate = session.max_capacity > 0 ? (activeRegistrationsCount / session.max_capacity) * 100 : 0;
      
      return {
        ...session,
        linkedClasses,
        activeRegistrationsCount,
        occupancyRate,
        activeRegistrations: sessionRegistrations,
        cancelledRegistrations,
        date: dateKey
      };
    });
  };

  // Calendar data
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    // Get today's date in Israel timezone
    const todayString = getCurrentIsraelDate();
    
    const days = getDaysInMonth(year, month);
    
    return days.map(date => {
      const dateString = formatDateString(date);
      const daySessions = getSessionsForDate(dateString);
      
      // Convert sessions to events format
      const events: Event[] = daySessions.map(session => ({
        id: session.id,
        date: dateString,
        title: session.name,
        description: session.description,
        start_time: session.start_time,
        end_time: session.end_time,
        max_capacity: session.max_capacity,
        activeRegistrationsCount: session.activeRegistrationsCount,
        occupancyRate: session.occupancyRate
      }));
      
      return {
        date: dateString,
        dayNumber: date.getDate(),
        isCurrentMonth: date.getMonth() === month,
        isToday: dateString === todayString,
        isSelected: dateString === selectedDate,
        events
      };
    });
  }, [currentDate, selectedDate, data.sessions, data.session_classes, data.registrations, getCurrentIsraelDate]);

  // Calendar navigation handlers
  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleDaySelect = (date: string) => {
    setSelectedDate(date);
  };

  const handleEventClick = (event: Event) => {
    const sessionData = data.sessions?.find((s: any) => s.id === event.id);
    if (sessionData) {
      // Get the actual session with registration data
      const daySessions = getSessionsForDate(event.date);
      const sessionWithRegistrations = daySessions.find(s => s.id === event.id);
      
      if (sessionWithRegistrations) {
        setSelectedSession({
          ...sessionWithRegistrations,
          date: event.date,
          activeRegistrationsCount: sessionWithRegistrations.activeRegistrationsCount,
          occupancyRate: sessionWithRegistrations.occupancyRate
        });
        setShowSessionModal(true);
      }
    }
  };

  const selectedDayEvents = useMemo(() => {
    if (!selectedDate) return [];
    const daySessions = getSessionsForDate(selectedDate);
    return daySessions.map(session => ({
      id: session.id,
      date: selectedDate,
      title: session.name,
      description: session.description,
      start_time: session.start_time,
      end_time: session.end_time,
      max_capacity: session.max_capacity,
      activeRegistrationsCount: session.activeRegistrationsCount,
      occupancyRate: session.occupancyRate
    }));
  }, [selectedDate, data.sessions, data.session_classes, data.registrations]);

  // Calendar Components
  const DayCircle: React.FC<{
    day: DayData;
    onSelect: (date: string) => void;
    isMobile: boolean;
  }> = ({ day, onSelect, isMobile }) => {
    const hasEvents = day.events.length > 0;
    const isToday = day.isToday;
    const isSelected = day.isSelected;
    const isCurrentMonth = day.isCurrentMonth;
    
    const baseClasses = `
      relative flex items-center justify-center rounded-full font-medium transition-all duration-200 cursor-pointer
      ${isMobile ? 'w-6 h-6 text-[9px]' : 'w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-xs sm:text-sm md:text-base'}
      ${isToday 
        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' 
        : isSelected 
          ? 'bg-[#EC4899] text-white shadow-lg shadow-[#EC4899]/30'
          : isCurrentMonth 
            ? 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            : 'bg-gray-50 text-gray-400'
      }
      ${hasEvents ? 'ring-2 ring-[#EC4899]/30' : ''}
    `;

    return (
      <div
        className={baseClasses}
        onClick={() => onSelect(day.date)}
      >
        <span className="relative z-10">{day.dayNumber}</span>
        
        {/* Event indicators */}
        {hasEvents && (
          <div className="absolute -bottom-0.5 sm:-bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
            {day.events.slice(0, 3).map((event) => (
              <div
                key={event.id}
                className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${getCalendarOccupancyColor(event.occupancyRate)}`}
              />
            ))}
            {day.events.length > 3 && (
              <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-gray-400 text-[6px] sm:text-[8px] text-white flex items-center justify-center">
                +
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Events List Component
  const EventsList: React.FC<{
    events: Event[];
    selectedDate: string;
    onEventClick?: (event: Event) => void;
    isMobile: boolean;
  }> = ({ events, selectedDate, onEventClick, isMobile }) => {
    if (events.length === 0) {
      return (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">אין פעילויות ביום זה</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-[#4B2E83]">
            פעילויות ליום {new Date(selectedDate + 'T00:00:00').toLocaleDateString('he-IL')}
          </h3>
          <span className="text-xs text-gray-500">{events.length} פעילויות</span>
        </div>
        
        <div className="space-y-2">
          {events.map((event) => (
            <div
              key={event.id}
              className={`
                bg-white rounded-lg border-2 border-[#EC4899]/20 shadow-sm hover:shadow-md hover:border-[#EC4899]/40 transition-all duration-200 cursor-pointer touch-manipulation
                ${isMobile ? 'p-2.5' : 'p-3 sm:p-4'}
              `}
              onClick={() => onEventClick?.(event)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-[#4B2E83] mb-1 leading-tight text-sm">
                    {event.title}
                  </h4>
                  
                  {event.description && (
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {event.description}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap gap-2 text-xs">
                    {event.start_time && (
                      <div className="flex items-center gap-1 text-blue-600">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        {event.start_time.substring(0, 5)}
                      </div>
                    )}
                    
                    {event.max_capacity && event.activeRegistrationsCount !== undefined && (
                      <div className="flex items-center gap-1 text-purple-600">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                        </svg>
                        {event.activeRegistrationsCount}/{event.max_capacity}
                      </div>
                    )}
                    
                    {event.occupancyRate !== undefined && (
                      <div className={`flex items-center gap-1 ${getCalendarOccupancyTextColor(event.occupancyRate)}`}>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {event.occupancyRate.toFixed(0)}%
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex-shrink-0 ml-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${getCalendarOccupancyColor(event.occupancyRate)}`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (isLoading || isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[200px] sm:min-h-[250px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-b-2 border-[#EC4899] mx-auto mb-2 sm:mb-3"></div>
          <p className="text-gray-600 text-xs sm:text-sm">טוען לוח שנה...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[200px] sm:min-h-[250px]">
        <div className="text-center">
          <div className="text-red-500 mb-2 sm:mb-3">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-gray-600 mb-2 sm:mb-3 text-xs sm:text-sm">שגיאה בטעינת לוח השנה</p>
          <RefreshButton onClick={() => { fetchClasses(); }} isFetching={isFetching} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* iOS Calendar View */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#4B2E83] to-[#EC4899] p-3 sm:p-4 md:p-6 text-white">
          <div className="flex items-center justify-between">
            <button
              onClick={goToPreviousMonth}
              className="p-1.5 sm:p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors touch-manipulation"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            <div className="text-center px-2">
              <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold leading-tight">
                {getHebrewMonthName(currentDate.getMonth())} {currentDate.getFullYear()}
              </h2>
            </div>
            
            <button
              onClick={goToNextMonth}
              className="p-1.5 sm:p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors touch-manipulation"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Calendar Grid */}
        <div className="p-2 sm:p-4 md:p-6">
          {/* Day names header */}
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1 md:gap-2 mb-2 sm:mb-3 md:mb-4">
            {['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'].map((day, index) => (
              <div key={day} className="text-center min-h-[1.5rem] sm:min-h-[1.75rem] md:min-h-[2rem] flex items-center justify-center">
                <span className="text-[9px] sm:text-xs md:text-sm font-medium text-gray-500">
                  {getHebrewDayName(index)}
                </span>
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1 md:gap-2">
            {calendarData.map((day) => (
              <div
                key={day.date}
                className="flex justify-center items-center min-h-[2rem] sm:min-h-[2.5rem] md:min-h-[3rem]"
              >
                <DayCircle
                  day={day}
                  onSelect={handleDaySelect}
                  isMobile={isMobile}
                />
              </div>
            ))}
          </div>
          
          {/* Events section */}
          {selectedDate && (
            <div className="mt-4 sm:mt-6 md:mt-8 pt-3 sm:pt-4 md:pt-6 border-t border-gray-200">
              <EventsList
                events={selectedDayEvents}
                selectedDate={selectedDate}
                onEventClick={handleEventClick}
                isMobile={isMobile}
              />
            </div>
          )}
        </div>
      </div>

      {/* Session Details Modal */}
      <CalendarDetailsModal
        session={selectedSession}
        isOpen={showSessionModal}
        onClose={() => setShowSessionModal(false)}
      />
    </div>
  );
} 