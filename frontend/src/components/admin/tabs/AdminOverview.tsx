import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useAdminData } from '../../../contexts/AdminDataContext';
import { useAuth } from '../../../contexts/AuthContext';
import type { UserProfile } from '../../../types/auth';
import { weekdaysToHebrew, HEBREW_WEEKDAYS } from '../../../utils/weekdaysUtils';
import { ClassDetailsModal, RegistrationEditModal } from '../../../pages/admin/modals';

// Types
interface SessionData {
  id: string;
  name: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  weekdays: number[];
  max_capacity: number;
  is_active: boolean;
  specificDate?: string;
  linkedClassesCount?: number;
  registrationsCount?: number;
  activeRegistrationsCount?: number;
  totalRevenue?: number;
  occupancyRate?: number;
  sessionClasses?: any[];
  registrations?: any[];
  linkedClasses?: string[];
  upcomingActiveRegistrations?: any[];
}

interface AdminOverviewProps {
  profile: UserProfile;
}

// Constants
const WEEKDAY_NAMES = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
const DAYS_IN_WEEK = 7;
const MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000;

// Helper functions
const getDayOfWeekName = (dayNumber: number): string => {
  return WEEKDAY_NAMES[dayNumber] || 'לא ידוע';
};

const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

const isTomorrow = (date: Date): boolean => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return date.toDateString() === tomorrow.toDateString();
};

const getOccupancyColor = (rate: number): string => {
  if (rate >= 80) return 'text-green-600 bg-green-100';
  if (rate >= 50) return 'text-yellow-600 bg-yellow-100';
  return 'text-red-600 bg-red-100';
};

const convertWeekdayToNumber = (day: any): number | undefined => {
  if (typeof day === 'number') return day;
  if (typeof day === 'string') {
    const dayMap: { [key: string]: number } = {
      'monday': 1, 'tuesday': 2, 'wednesday': 3, 'thursday': 4, 
      'friday': 5, 'saturday': 6, 'sunday': 0
    };
    return dayMap[day.toLowerCase()];
  }
  return undefined;
};

export default function AdminOverview({ profile }: AdminOverviewProps) {
  const { data, isLoading, error, fetchClasses, isFetching, resetRateLimit } = useAdminData();
  const { session } = useAuth();
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [selectedClassForDetails, setSelectedClassForDetails] = useState<any>(null);
  const [selectedRegistrationForEdit, setSelectedRegistrationForEdit] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const hasInitialized = useRef(false);

  // Check if data is complete
  const hasCompleteData = useMemo(() => {
    return data.classes && data.classes.length > 0 && 
           data.sessions && data.sessions.length > 0 && 
           data.registrations && data.registrations.length >= 0;
  }, [data.classes, data.sessions, data.registrations]);

  // Data loading effect
  useEffect(() => {
    if (!hasInitialized.current && !hasCompleteData) {
      hasInitialized.current = true;
      fetchClasses();
    } else if (hasCompleteData && !hasInitialized.current) {
      hasInitialized.current = true;
    }
  }, [fetchClasses, hasCompleteData]);

  // Generate upcoming dates for a session
  const generateUpcomingDates = useCallback((weekdays: number[]): string[] => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + DAYS_IN_WEEK * MILLISECONDS_IN_DAY);
    const upcomingDates: string[] = [];
    
    for (let i = 0; i < DAYS_IN_WEEK; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      if (weekdays.includes(date.getDay())) {
        const dateString = date.toISOString().split('T')[0];
        upcomingDates.push(dateString);
      }
    }
    
    return [...new Set(upcomingDates)]; // Remove duplicates
  }, []);

  // Process sessions data
  const processedSessions = useMemo(() => {
    if (!data.sessions) return [];

    return data.sessions.map((sessionData: SessionData) => {
      const sessionClasses = data.session_classes?.filter((sc: any) => sc.session_id === sessionData.id) || [];
      const sessionRegistrations = data.registrations?.filter((reg: any) => reg.session_id === sessionData.id) || [];
      const activeRegistrations = sessionRegistrations.filter((reg: any) => reg.status === 'active');
      
      // Filter for upcoming week
      const upcomingActiveRegistrations = activeRegistrations.filter((reg: any) => {
        const registrationDate = new Date(reg.selected_date);
        const today = new Date();
        const nextWeek = new Date(today.getTime() + DAYS_IN_WEEK * MILLISECONDS_IN_DAY);
        return registrationDate >= today && registrationDate <= nextWeek;
      });
      
      const linkedClasses = sessionClasses.map((sc: any) => {
        const classData = data.classes?.find((c: any) => c.id === sc.class_id);
        return classData ? classData.name : 'שיעור לא ידוע';
      });

      // Convert weekdays to numbers
      const weekdayNumbers = sessionData.weekdays
        ?.map(convertWeekdayToNumber)
        .filter((num): num is number => num !== undefined) || [];

      const allUpcomingDates = generateUpcomingDates(weekdayNumbers);

      // Create entries for each date
      return allUpcomingDates.map((date: string) => {
        const dateRegistrations = upcomingActiveRegistrations.filter((reg: any) => reg.selected_date === date);
        
        const totalRevenue = sessionClasses.reduce((sum: number, sc: any) => {
          const classRegistrations = dateRegistrations.filter((reg: any) => reg.session_class_id === sc.id);
          return sum + (classRegistrations.length * sc.price);
        }, 0);

        const occupancyRate = sessionData.max_capacity > 0 ? (dateRegistrations.length / sessionData.max_capacity) * 100 : 0;

        return {
          ...sessionData,
          specificDate: date,
          linkedClassesCount: sessionClasses.length,
          registrationsCount: sessionRegistrations.length,
          activeRegistrationsCount: dateRegistrations.length,
          totalRevenue,
          occupancyRate,
          sessionClasses,
          registrations: sessionRegistrations,
          linkedClasses,
          upcomingActiveRegistrations: dateRegistrations
        };
      });
    }).flat();
  }, [data.sessions, data.session_classes, data.registrations, data.classes, generateUpcomingDates]);

  // Filter and sort sessions
  const filteredSessions = useMemo(() => {
    return processedSessions
      .filter((sessionData: SessionData) => {
        const matchesSearch = sessionData.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             sessionData.description?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = filterStatus === 'all' || 
                             (filterStatus === 'active' && sessionData.is_active) ||
                             (filterStatus === 'inactive' && !sessionData.is_active);
        
        const hasUpcomingDates = sessionData.specificDate && sessionData.is_active;
        
        return matchesSearch && matchesStatus && hasUpcomingDates;
      })
      .sort((a: SessionData, b: SessionData) => {
        const aDate = a.specificDate ? new Date(a.specificDate) : new Date(9999, 11, 31);
        const bDate = b.specificDate ? new Date(b.specificDate) : new Date(9999, 11, 31);
        
        if (aDate.getTime() !== bDate.getTime()) {
          return aDate.getTime() - bDate.getTime();
        }
        
        return a.name.localeCompare(b.name);
      });
  }, [processedSessions, searchTerm, filterStatus]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const totalSessions = processedSessions.length;
    const activeSessions = processedSessions.filter((s: SessionData) => s.is_active).length;
    const totalClasses = data.classes?.length || 0;
    const totalActiveRegistrations = processedSessions.reduce((sum: number, s: SessionData) => sum + (s.activeRegistrationsCount || 0), 0);
    const totalExpectedRevenue = processedSessions.reduce((sum: number, s: SessionData) => sum + (s.totalRevenue || 0), 0);
    
    const totalRegistrations = data.registrations?.length || 0;
    const cancelledRegistrations = data.registrations?.filter((reg: any) => reg.status === 'cancelled').length || 0;
    const pendingRegistrations = data.registrations?.filter((reg: any) => reg.status === 'pending').length || 0;
    
    const oneWeekAgo = new Date(Date.now() - DAYS_IN_WEEK * MILLISECONDS_IN_DAY);
    const registrationsThisWeek = data.registrations?.filter((reg: any) => 
      new Date(reg.created_at) > oneWeekAgo
    ).length || 0;
    
    const cancellationsThisWeek = data.registrations?.filter((reg: any) => 
      reg.status === 'cancelled' && new Date(reg.updated_at || reg.created_at) > oneWeekAgo
    ).length || 0;
    
    const averageOccupancyRate = processedSessions.length > 0 
      ? processedSessions.reduce((sum: number, s: SessionData) => sum + (s.occupancyRate || 0), 0) / processedSessions.length 
      : 0;

    return {
      totalSessions,
      activeSessions,
      totalClasses,
      totalActiveRegistrations,
      totalExpectedRevenue,
      totalRegistrations,
      cancelledRegistrations,
      pendingRegistrations,
      registrationsThisWeek,
      cancellationsThisWeek,
      averageOccupancyRate
    };
  }, [processedSessions, data.classes, data.registrations]);

  // Event handlers
  const handleViewClassDetails = useCallback((classData: any) => {
    setSelectedClassForDetails(classData);
  }, []);

  const handleEditRegistration = useCallback((registration: any) => {
    setSelectedRegistrationForEdit(registration);
  }, []);

  const handleToggleSessionExpansion = useCallback((sessionKey: string) => {
    setExpandedSession(expandedSession === sessionKey ? null : sessionKey);
  }, [expandedSession]);

  const handleRefreshData = useCallback(() => {
    resetRateLimit();
    fetchClasses();
  }, [resetRateLimit, fetchClasses]);

  // Loading state
  if (isLoading && !hasCompleteData) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-[#4B2E83] mb-4">סקירה כללית</h2>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EC4899] mx-auto mb-4"></div>
          <p className="text-[#4B2E83]/70">טוען נתונים...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !hasCompleteData) {
    return (
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
              onClick={handleRefreshData}
              className="px-6 py-3 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded-xl font-medium hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300"
            >
              נסה שוב
            </button>
            {error.includes('יותר מדי בקשות') && (
              <button
                onClick={resetRateLimit}
                className="px-6 py-3 bg-gray-500 text-white rounded-xl font-medium hover:bg-gray-600 transition-all duration-300"
              >
                איפוס הגבלה
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!hasCompleteData) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-[#4B2E83] mb-4">סקירה כללית</h2>
        <div className="text-center py-12">
          <p className="text-[#4B2E83]/70">אין נתונים זמינים</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#4B2E83]">סקירה כללית</h2>
          <p className="text-sm text-[#4B2E83]/70 mt-1">סקירה כללית של השיעורים, הסשנים וההרשמות</p>
        </div>
        <button
          onClick={handleRefreshData}
          disabled={isFetching}
          className="px-4 py-2 bg-gradient-to-r from-[#4B2E83] to-[#EC4899] text-white rounded-lg font-medium hover:from-[#EC4899] hover:to-[#4B2E83] transition-all duration-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isFetching ? 'מעדכן...' : 'רענן נתונים'}
        </button>
      </div>
      
      {/* Key Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-4">
        <div className="bg-white p-2 sm:p-4 rounded-xl border border-[#EC4899]/10 text-center">
          <div className="text-lg sm:text-2xl font-bold text-[#EC4899]">{statistics.totalSessions}</div>
          <div className="text-xs text-[#4B2E83]/70">סה"כ קבוצות</div>
        </div>
        <div className="bg-white p-2 sm:p-4 rounded-xl border border-[#4B2E83]/10 text-center">
          <div className="text-lg sm:text-2xl font-bold text-[#4B2E83]">{statistics.totalClasses}</div>
          <div className="text-xs text-[#4B2E83]/70">סה"כ שיעורים</div>
        </div>
        <div className="bg-white p-2 sm:p-4 rounded-xl border border-[#EC4899]/10 text-center">
          <div className="text-lg sm:text-2xl font-bold text-[#EC4899]">{statistics.totalActiveRegistrations}</div>
          <div className="text-xs text-[#4B2E83]/70">הרשמות פעילות</div>
        </div>
        <div className="bg-white p-2 sm:p-4 rounded-xl border border-[#4B2E83]/10 text-center">
          <div className="text-lg sm:text-2xl font-bold text-[#4B2E83]">₪{statistics.totalExpectedRevenue.toLocaleString()}</div>
          <div className="text-xs text-[#4B2E83]/70">הכנסות צפויות</div>
        </div>
        <div className="bg-white p-2 sm:p-4 rounded-xl border border-[#EC4899]/10 text-center">
          <div className="text-lg sm:text-2xl font-bold text-[#EC4899]">{statistics.activeSessions}</div>
          <div className="text-xs text-[#4B2E83]/70">קבוצות פעילות</div>
        </div>
        <div className="bg-white p-2 sm:p-4 rounded-xl border border-[#4B2E83]/10 text-center">
          <div className="text-lg sm:text-2xl font-bold text-[#4B2E83]">{statistics.registrationsThisWeek}</div>
          <div className="text-xs text-[#4B2E83]/70">הרשמות השבוע</div>
        </div>
        <div className="bg-white p-2 sm:p-4 rounded-xl border border-[#EC4899]/10 text-center">
          <div className="text-lg sm:text-2xl font-bold text-[#EC4899]">{statistics.averageOccupancyRate.toFixed(1)}%</div>
          <div className="text-xs text-[#4B2E83]/70">תפוסה ממוצעת</div>
        </div>
        <div className="bg-white p-2 sm:p-4 rounded-xl border border-[#4B2E83]/10 text-center">
          <div className="text-lg sm:text-2xl font-bold text-[#4B2E83]">{statistics.cancelledRegistrations}</div>
          <div className="text-xs text-[#4B2E83]/70">הרשמות בוטלו</div>
        </div>
      </div>

      {/* Filters */}
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
            <label className="block text-sm font-medium text-[#4B2E83] mb-2">סטטוס קבוצה</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none"
            >
              <option value="all">כל הקבוצות הקרובות</option>
              <option value="active">פעילות בלבד</option>
              <option value="inactive">לא פעילות</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#EC4899]/10 overflow-hidden">
        <div className="p-3 sm:p-6 border-b border-[#EC4899]/10">
          <h2 className="text-lg sm:text-2xl font-bold text-[#4B2E83] mb-1 sm:mb-2">סקירה כללית לקבוצות הקרובות</h2>
          <p className="text-sm sm:text-base text-[#4B2E83]/70">קבוצות מתוכננות לשבוע הקרוב עם פרטי השיעורים וההרשמות</p>
      </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] sm:min-w-[1000px]">
            <thead className="bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5">
              <tr>
                <th className="px-2 sm:px-4 py-1.5 sm:py-3 text-right text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 whitespace-nowrap">שם הקבוצה</th>
                <th className="px-2 sm:px-4 py-1.5 sm:py-3 text-center text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 whitespace-nowrap">תאריך ויום</th>
                <th className="px-2 sm:px-4 py-1.5 sm:py-3 text-center text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 whitespace-nowrap">שעות פעילות</th>
                <th className="px-2 sm:px-4 py-1.5 sm:py-3 text-right text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 whitespace-nowrap">הרשמות פעילות</th>
                <th className="px-2 sm:px-4 py-1.5 sm:py-3 text-right text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 whitespace-nowrap">תפוסה</th>
                <th className="px-2 sm:px-4 py-1.5 sm:py-3 text-right text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 whitespace-nowrap">סטטוס</th>
                <th className="px-2 sm:px-4 py-1.5 sm:py-3 text-right text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 whitespace-nowrap">שיעורים מקושרים</th>
                <th className="px-2 sm:px-4 py-1.5 sm:py-3 text-right text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 whitespace-nowrap">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EC4899]/10">
              {filteredSessions.map((sessionData: SessionData) => (
                <React.Fragment key={`${sessionData.id}_${sessionData.specificDate}`}>
                  <tr className="hover:bg-[#EC4899]/5 transition-colors">
                    <td className="px-2 sm:px-4 py-1.5 sm:py-2.5 border-l border-[#EC4899]/10">
                      <div className="font-semibold text-xs sm:text-sm text-[#4B2E83] leading-tight">{sessionData.name}</div>
                    </td>
                                        <td className="px-2 sm:px-4 py-1.5 sm:py-2.5 border-l border-[#EC4899]/10 text-center">
                      <div className="text-xs sm:text-sm font-medium text-[#4B2E83] leading-tight">
                        {sessionData.specificDate ? (
                          <div className="space-y-1">
                            <div className="font-semibold">
                              {new Date(sessionData.specificDate).toLocaleDateString('he-IL')}
                            </div>
                            <div className="flex justify-center">
                              {(() => {
                                // Get the specific day of week for this date
                                const specificDate = new Date(sessionData.specificDate);
                                const dayOfWeek = specificDate.getDay(); // 0=Sunday, 1=Monday, etc.
                                
                                // Convert day number to Hebrew name
                                const dayName = getDayOfWeekName(dayOfWeek);
                                
                                return (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#4B2E83]/10 text-[#4B2E83]">
                                    יום {dayName}
                                  </span>
                                );
                              })()}
                            </div>
                            {(() => {
                              const date = new Date(sessionData.specificDate);
                              const today = new Date();
                              today.setHours(0,0,0,0);
                              const tomorrow = new Date(today);
                              tomorrow.setDate(today.getDate() + 1);
                              if (date.getTime() === today.getTime()) {
                                return <div className="text-xs font-semibold text-green-600">היום</div>;
                              }
                              if (date.getTime() === tomorrow.getTime()) {
                                return <div className="text-xs font-semibold text-blue-600">מחר</div>;
                              }
                              return null;
                            })()}
                          </div>
                        ) : 'לא מוגדר'}
                      </div>
                    </td>
                    <td className="px-2 sm:px-4 py-1.5 sm:py-2.5 border-l border-[#EC4899]/10 text-center">
                      <div className="text-xs sm:text-sm text-[#EC4899] font-medium leading-tight">
                        {sessionData.start_time && sessionData.end_time ? (
                          <div className="space-y-1">
                            <div className="font-semibold">
                              {sessionData.start_time.substring(0, 5)}
                            </div>
                            <div className="text-[#4B2E83]/70">עד</div>
                            <div className="font-semibold">
                              {sessionData.end_time.substring(0, 5)}
                            </div>
                          </div>
                        ) : (
                          'לא מוגדר'
                        )}
                      </div>
                    </td>
                    <td className="px-2 sm:px-4 py-1.5 sm:py-2.5 border-l border-[#EC4899]/10 text-center">
                      <div className="leading-tight">
                        <div className="font-semibold text-xs sm:text-sm text-[#4B2E83]">
                          {sessionData.activeRegistrationsCount} מתוך {sessionData.max_capacity} הרשמות
          </div>
                        <div className="text-xs text-[#4B2E83]/70">
                          {sessionData.activeRegistrationsCount === sessionData.max_capacity ? 'מלא' : 'פנוי'}
        </div>
            </div>
                    </td>
                    <td className="px-2 sm:px-4 py-1.5 sm:py-2.5 border-l border-[#EC4899]/10 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getOccupancyColor(sessionData.occupancyRate || 0)}`}>
                        {sessionData.occupancyRate?.toFixed(1) || '0.0'}%
                      </span>
                    </td>
                    <td className="px-2 sm:px-4 py-1.5 sm:py-2.5 border-l border-[#EC4899]/10 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        sessionData.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {sessionData.is_active ? 'פעיל' : 'לא פעיל'}
                      </span>
                    </td>
                                        <td className="px-2 sm:px-4 py-1.5 sm:py-2.5 border-l border-[#EC4899]/10">
                      <div className="flex flex-wrap gap-1">
                        {sessionData.linkedClasses && sessionData.linkedClasses.length > 0 ? (
                          sessionData.linkedClasses.map((className: string, index: number) => (
                            <span key={index} className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-[#EC4899]/10 text-[#EC4899] truncate">
                              {className}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-[#4B2E83]/50">אין שיעורים מקושרים</span>
                        )}
                      </div>
                    </td>
                    <td className="px-2 sm:px-4 py-1.5 sm:py-2.5 border-l border-[#EC4899]/10">
                      <button
                        onClick={() => handleToggleSessionExpansion(`${sessionData.id}_${sessionData.specificDate}`)}
                        className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gradient-to-r from-[#4B2E83] to-[#EC4899] text-white rounded-lg font-medium hover:from-[#EC4899] hover:to-[#4B2E83] transition-all duration-300 text-xs"
                      >
                        {expandedSession === `${sessionData.id}_${sessionData.specificDate}` ? 'הסתר' : 'פרטים'}
                      </button>
                    </td>
                  </tr>
                  
                  {/* Expanded Details */}
                  {expandedSession === `${sessionData.id}_${sessionData.specificDate}` && (
                    <tr>
                      <td colSpan={9} className="px-6 py-4 bg-gray-50">
                        <div className="space-y-6">
                          {/* Linked Classes Section */}
                          <div className="border-2 border-[#EC4899]/20 rounded-xl p-4 bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5">
                            <h3 className="text-lg font-semibold text-[#4B2E83] mb-4">שיעורים מקושרים</h3>
                            <div className="flex flex-wrap gap-2 justify-start">
                              {sessionData.sessionClasses && sessionData.sessionClasses.map((sessionClass: any) => {
                                const classData = data.classes?.find((c: any) => c.id === sessionClass.class_id);
                                return (
                                  <div key={sessionClass.id} className="bg-white p-1.5 sm:p-2 rounded-lg border border-[#EC4899]/10 w-40 sm:w-48 flex flex-col justify-between">
                                    <div>
                                      <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-semibold text-[#4B2E83] text-xs leading-tight line-clamp-2">{classData?.name || 'שיעור לא ידוע'}</h4>
                                        <span className={`inline-flex items-center px-1 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                                          sessionClass.is_trial ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                                        }`}>
                                          {sessionClass.is_trial ? 'ניסיון' : 'רגיל'}
            </span>
          </div>
                                      <div className="text-xs text-[#4B2E83]/70 space-y-0.5">
                                        <div>מחיר: ₪{sessionClass.price}</div>
                                        {sessionClass.max_uses_per_user && (
                                          <div>מקסימום: {sessionClass.max_uses_per_user}</div>
                                        )}
        </div>
      </div>
                                    <button
                                      onClick={() => handleViewClassDetails(classData)}
                                      className="w-full px-0.5 sm:px-1 py-0.5 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded text-xs font-medium hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300"
                                    >
                                      פרטי שיעור
                                    </button>
            </div>
                                );
                              })}
          </div>
        </div>

                          {/* Registrations Section */}
                          <div className="border-2 border-[#4B2E83]/20 rounded-xl p-4 bg-gradient-to-r from-[#4B2E83]/5 to-[#EC4899]/5">
                            {(() => {
                              // Since we already have registrations for a specific date, we can group by time
                              const registrationsByTime = (sessionData.upcomingActiveRegistrations || []).reduce((acc: any, registration: any) => {
                                const timeKey = registration.selected_time || 'no-time';
                                if (!acc[timeKey]) {
                                  acc[timeKey] = {
                                    time: registration.selected_time || 'לא מוגדר',
                                    registrations: []
                                  };
                                }
                                acc[timeKey].registrations.push(registration);
                                return acc;
                              }, {});

                              const timeEntries = Object.values(registrationsByTime);
                              
                                                              return (
                                  <>
                                    <h3 className="text-lg font-semibold text-[#4B2E83] mb-4">שיעורים לשבוע הקרוב ({timeEntries.length})</h3>
                                                                        {timeEntries.map((timeEntry: any, timeIndex: number) => (
                                      <div key={timeIndex} className="mb-6 last:mb-0">
                                        <div className="bg-[#EC4899]/10 p-3 rounded-lg mb-3">
                                          <h4 className="font-semibold text-[#4B2E83] text-sm">
                                            {sessionData.specificDate ? new Date(sessionData.specificDate).toLocaleDateString('he-IL') : 'לא מוגדר'} - {timeEntry.time} 
                                            <span className="text-[#4B2E83]/70 font-normal"> ({timeEntry.registrations.length} משתתפים)</span>
                                          </h4>
            </div>
                                        <div className="overflow-x-auto">
                                          <table className="w-full text-xs sm:text-sm min-w-[400px] sm:min-w-[600px]">
                                            <thead className="bg-[#EC4899]/5">
                                              <tr>
                                                <th className="px-1 sm:px-2 py-1 sm:py-2 text-right text-[#4B2E83] font-medium whitespace-nowrap w-16 sm:w-20">שם מלא</th>
                                                <th className="px-1 sm:px-2 py-1 sm:py-2 text-right text-[#4B2E83] font-medium whitespace-nowrap w-20 sm:w-24">אימייל</th>
                                                <th className="px-1 sm:px-2 py-1 sm:py-2 text-right text-[#4B2E83] font-medium whitespace-nowrap w-14 sm:w-16">טלפון</th>
                                                <th className="px-1 sm:px-2 py-1 sm:py-2 text-right text-[#4B2E83] font-medium whitespace-nowrap w-10 sm:w-12">סטטוס</th>
                                                <th className="px-1 sm:px-2 py-1 sm:py-2 text-right text-[#4B2E83] font-medium whitespace-nowrap w-10 sm:w-12">פעולות</th>
                                              </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#EC4899]/10">
                                              {timeEntry.registrations.map((registration: any) => (
                                              <tr key={registration.id} className="hover:bg-[#EC4899]/5">
                                                <td className="px-1 sm:px-2 py-1 sm:py-2 text-[#4B2E83] text-xs sm:text-sm truncate">
                                                  {registration.first_name} {registration.last_name}
                                                </td>
                                                <td className="px-1 sm:px-2 py-1 sm:py-2 text-[#4B2E83] text-xs sm:text-sm truncate">{registration.email}</td>
                                                <td className="px-1 sm:px-2 py-1 sm:py-2 text-[#4B2E83] text-xs sm:text-sm">{registration.phone}</td>
                                                <td className="px-1 sm:px-2 py-1 sm:py-2">
                                                  <span className={`inline-flex items-center px-1 py-0.5 rounded-full text-xs font-medium ${
                                                    registration.status === 'active' ? 'bg-green-100 text-green-800' :
                                                    registration.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                  }`}>
                                                    {registration.status === 'active' ? 'פעיל' :
                                                     registration.status === 'pending' ? 'ממתין' : 'בוטל'}
            </span>
                                                </td>
                                                <td className="px-1 sm:px-2 py-1 sm:py-2">
                                                  <button
                                                    onClick={() => handleEditRegistration(registration)}
                                                    className="px-0.5 sm:px-1 py-0.5 bg-gradient-to-r from-[#4B2E83] to-[#EC4899] text-white rounded text-xs hover:from-[#EC4899] hover:to-[#4B2E83] transition-all duration-300"
                                                  >
                                                    ערוך
                                                  </button>
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
          </div>
                                  ))}
                                </>
                              );
                            })()}
        </div>
            </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* No Results */}
      {filteredSessions.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
          </div>
          <h3 className="text-lg font-semibold text-[#4B2E83] mb-2">לא נמצאו קבוצות קרובות</h3>
          <p className="text-[#4B2E83]/70">אין קבוצות מתוכננות לשבוע הקרוב או נסה לשנות את פרמטרי החיפוש</p>
        </div>
      )}

      {/* Modals */}
      {selectedClassForDetails && (
        <ClassDetailsModal
          classData={selectedClassForDetails}
          isOpen={!!selectedClassForDetails}
          onClose={() => setSelectedClassForDetails(null)}
        />
      )}

      {selectedRegistrationForEdit && (
        <RegistrationEditModal
          registrationData={selectedRegistrationForEdit}
          isOpen={!!selectedRegistrationForEdit}
          onClose={() => setSelectedRegistrationForEdit(null)}
          onSave={async (updatedRegistration) => {
            // Handle registration update
            try {
              const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/registrations/${updatedRegistration.id}/status`, {
                method: 'PUT',
                                 headers: {
                   'Content-Type': 'application/json',
                   'Authorization': `Bearer ${session?.access_token}`
                 },
                body: JSON.stringify({ status: updatedRegistration.status })
              });

              if (response.ok) {
                await fetchClasses();
                setSelectedRegistrationForEdit(null);
              } else {
                throw new Error('Failed to update registration');
              }
            } catch (error) {
              console.error('Error updating registration:', error);
              alert('שגיאה בעדכון ההרשמה');
            }
          }}
          isLoading={false}
        />
      )}
    </div>
  );
} 