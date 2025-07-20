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
        
        return reg.status !== 'cancelled' && 
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
        occupancyRate
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-[#4B2E83] mb-4">לוח שנה</h2>
        <div className="flex gap-3">
          <button
            onClick={() => {
              fetchClasses();
              fetchCalendar();
            }}
            disabled={isFetching}
            className="px-6 py-3 bg-gradient-to-r from-[#4B2E83] to-[#EC4899] text-white rounded-lg font-medium hover:from-[#EC4899] hover:to-[#4B2E83] transition-all duration-300 text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isFetching ? 'מעדכן...' : 'רענן נתונים'}
          </button>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="bg-white p-6 rounded-2xl border border-[#EC4899]/10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-[#4B2E83]">ניווט שבועי</h3>
          <div className="flex gap-3">
            {weekKeys.map((weekKey, index) => (
              <button
                key={weekKey}
                onClick={() => setCurrentWeek(index + 1)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 text-base ${
                  currentWeek === index + 1
                    ? 'bg-[#4B2E83] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                שבוע {index + 1}
              </button>
            ))}
          </div>
        </div>
        
        {currentWeekData && (
          <div className="space-y-2">
            <p className="text-base text-[#4B2E83]/70">
              {(() => {
                // Get the first and last dates from the week data
                const weekDates = Object.keys(currentWeekData.days).sort();
                if (weekDates.length >= 2) {
                  const firstDate = weekDates[0];
                  const lastDate = weekDates[weekDates.length - 1];
                  return formatDateRange(firstDate, lastDate);
                }
                return getWeekRange(currentWeekData.startDate);
              })()}
            </p>
            {isCurrentWeek(currentWeek) && (
              <p className="text-sm text-[#EC4899] font-medium">
                שבוע נוכחי
              </p>
            )}
            {currentWeek === 2 && (
              <p className="text-sm text-[#3B82F6] font-medium">
                שבוע הבא
              </p>
            )}
          </div>
        )}
      </div>

      {/* Calendar Grid */}
      {currentWeekData && (
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
          {Object.entries(currentWeekData.days).map(([dateKey, dayData]) => (
            <div key={dateKey} className="bg-white p-4 rounded-2xl border border-[#EC4899]/10 relative">
              {/* Today/Tomorrow badge */}
              {isToday(dateKey) && (
                <div className="absolute -top-1 -right-1 transform rotate-12">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 shadow-sm">
                    היום
                  </span>
                </div>
              )}
              {isTomorrow(dateKey) && (
                <div className="absolute -top-1 -right-1 transform rotate-12">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 shadow-sm">
                    מחר
                  </span>
                </div>
              )}
              
              <div className="text-center mb-4">
                <h4 className="font-semibold text-[#4B2E83] text-base">
                  {getHebrewDayName(dayData.dayName)}
                </h4>
                <p className="text-sm text-[#4B2E83]/70">
                  {formatDate(dateKey)}
                </p>
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
                          className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 min-h-[80px] flex items-center justify-center ${
                            session.occupancyRate >= 100 
                              ? 'border-green-300 bg-green-50' // ירוק עדין עם רקע עדין
                              : session.occupancyRate >= 50 
                                ? 'border-yellow-300 bg-yellow-50' // צהוב עדין עם רקע עדין
                                : 'border-red-300 bg-red-50' // אדום עדין עם רקע עדין
                          }`}
                          onClick={() => handleSessionClick(session, dateKey)}
                        >
                          <div className="text-center w-full">
                            <h6 className="font-semibold text-[#4B2E83] text-sm mb-1 line-clamp-2">{session.name}</h6>
                            <div className="text-sm font-semibold text-[#4B2E83]">
                              {session.activeRegistrationsCount}/{session.max_capacity} נרשמים
                            </div>
                          </div>
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
      <div className="bg-white p-6 rounded-2xl border border-[#EC4899]/10">
        <h3 className="text-xl font-semibold text-[#4B2E83] mb-6">סיכום שבועי</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-[#EC4899]">
              {currentWeekData ? Object.values(currentWeekData.days).reduce((total, day) => 
                total + day.classes.length, 0) : 0}
            </p>
            <p className="text-base text-[#4B2E83]/70">סה"כ שיעורים</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-[#4B2E83]">
              {currentWeekData ? Object.values(currentWeekData.days).reduce((total, day) => 
                total + day.classes.reduce((classTotal, cls) => 
                  classTotal + cls.registrations.length, 0), 0) : 0}
            </p>
            <p className="text-base text-[#4B2E83]/70">סה"כ הרשמות</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-[#EC4899]">
              {calendarData.classes.length}
            </p>
            <p className="text-base text-[#4B2E83]/70">סוגי שיעורים</p>
          </div>
        </div>
      </div>

      {/* Session Details Modal */}
      {showSessionModal && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-[#4B2E83] mb-2">{selectedSession.name}</h3>
                  <p className="text-sm text-[#4B2E83]/70 mb-1">{selectedSession.description}</p>
                  <p className="text-sm text-[#4B2E83]/60">
                    {selectedSession.date && getFullHebrewDate(selectedSession.date)}
                  </p>
                </div>
                <button
                  onClick={() => setShowSessionModal(false)}
                  className="text-[#4B2E83]/70 hover:text-[#4B2E83] transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Session Details */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-[#4B2E83] text-lg">פרטי הקבוצה</h4>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-[#4B2E83]/70">תאריך:</span>
                      <span className="font-medium text-[#4B2E83]">
                        {selectedSession.date && getFullHebrewDate(selectedSession.date)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-[#4B2E83]/70">שעות:</span>
                      <span className="font-medium text-[#4B2E83]">
                        {selectedSession.start_time.substring(0, 5)} - {selectedSession.end_time.substring(0, 5)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-[#4B2E83]/70">ימי פעילות:</span>
                      <div className="flex gap-1">
                        {selectedSession.weekdays.map((day, index) => (
                          <span key={index} className="text-xs bg-[#4B2E83]/10 text-[#4B2E83] px-2 py-1 rounded">
                            {anyToHebrewDay(day)}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-[#4B2E83]/70">מיקום:</span>
                      <span className="font-medium text-[#4B2E83]">{selectedSession.location}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-[#4B2E83]/70">תפוסה:</span>
                      <span className="font-medium text-[#4B2E83]">
                        {selectedSession.activeRegistrationsCount}/{selectedSession.max_capacity} ({selectedSession.occupancyRate.toFixed(1)}%)
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-[#4B2E83]/70">סטטוס:</span>
                      <span className={`font-medium ${selectedSession.is_active ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedSession.is_active ? 'פעיל' : 'לא פעיל'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Linked Classes */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-[#4B2E83] text-lg">שיעורים מקושרים</h4>
                  
                  {selectedSession.linkedClasses.length > 0 ? (
                    <div className="space-y-2">
                      {selectedSession.linkedClasses.map((linkedClass) => (
                        <div key={linkedClass.id} className="bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5 p-3 rounded-lg border border-[#EC4899]/10">
                          <h5 className="font-semibold text-[#4B2E83] text-sm">{linkedClass.className}</h5>
                          <p className="text-xs text-[#4B2E83]/70">₪{linkedClass.classPrice}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[#4B2E83]/50">אין שיעורים מקושרים</p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowSessionModal(false)}
                  className="px-6 py-2 bg-gradient-to-r from-[#4B2E83] to-[#EC4899] text-white rounded-lg font-medium hover:from-[#EC4899] hover:to-[#4B2E83] transition-all duration-300"
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