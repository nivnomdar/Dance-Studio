import React, { useState, useMemo, useCallback } from 'react';
import { useAdminData } from '../../../contexts/AdminDataContext';
import { useAuth } from '../../../contexts/AuthContext';
import type { UserProfile } from '../../../types/auth';
// ... existing code ...
import { ClassDetailsModal, RegistrationEditModal } from '../../../pages/admin/modals';
import { RefreshButton } from '../../admin';

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

// ... existing code ...

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
  const [expandedLinkedClasses, setExpandedLinkedClasses] = useState<string | null>(null);
  const [selectedClassForDetails, setSelectedClassForDetails] = useState<any>(null);
  const [classDetailsModalOpen, setClassDetailsModalOpen] = useState(false);
  const [selectedRegistrationForEdit, setSelectedRegistrationForEdit] = useState<any>(null);
  const [registrationEditModalOpen, setRegistrationEditModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showQuickActionModal, setShowQuickActionModal] = useState(false);
  
  // Debug logs

  
  // Check if data is complete
  const hasCompleteData = useMemo(() => {
    const hasData = data.classes && data.classes.length > 0 && 
           data.sessions && data.sessions.length > 0 && 
           data.registrations && data.registrations.length >= 0;
  
    return hasData;
  }, [data.classes, data.sessions, data.registrations]);

  // Fallback data if no data is available
  const fallbackData = useMemo(() => ({
    classes: data.classes || [],
    sessions: data.sessions || [],
    registrations: data.registrations || [],
    session_classes: data.session_classes || [],
    overview: data.overview || { totalClasses: 0, totalRegistrations: 0, totalSessions: 0 }
  }), [data]);

  // Use fallback data if no complete data
  const displayData = hasCompleteData ? data : fallbackData;

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

  // Process sessions with additional data
  const processedSessions = useMemo(() => {
    if (!displayData.sessions || displayData.sessions.length === 0) {
      return [];
    }

    const allSessionEntries: SessionData[] = [];

    displayData.sessions.forEach((session: SessionData) => {
      const linkedClasses = displayData.session_classes?.filter(
        (sc: any) => sc.session_id === session.id
      ) || [];

      const sessionRegistrations = displayData.registrations?.filter(
        (reg: any) => reg.session_id === session.id
      ) || [];

      // Generate upcoming dates for this session
      const upcomingDates = generateUpcomingDates(session.weekdays);

      // Create a session entry for each upcoming date
      const sessionEntries = upcomingDates.map((date: string) => {
        // Filter registrations for this specific date
        const dateRegistrations = sessionRegistrations.filter((reg: any) => {
          return reg.selected_date === date;
        });
        
        const dateActiveRegistrations = dateRegistrations.filter(
          (reg: any) => reg.status === 'active'
        );

        const dateTotalRevenue = dateRegistrations.reduce(
          (sum: number, reg: any) => sum + (reg.purchase_price || 0), 0
        );

        const dateOccupancyRate = session.max_capacity > 0 
          ? (dateActiveRegistrations.length / session.max_capacity) * 100 
          : 0;

        return {
          ...session,
          specificDate: date,
          linkedClassesCount: linkedClasses.length,
          registrationsCount: dateRegistrations.length,
          activeRegistrationsCount: dateActiveRegistrations.length,
          totalRevenue: dateTotalRevenue,
          occupancyRate: dateOccupancyRate,
          sessionClasses: linkedClasses,
          registrations: dateRegistrations,
          linkedClasses: linkedClasses.map((sc: any) => {
            const classData = displayData.classes?.find((c: any) => c.id === sc.class_id);
            return classData ? classData.name : 'שיעור לא ידוע';
          }),
          upcomingActiveRegistrations: dateActiveRegistrations
        };
      });

      allSessionEntries.push(...sessionEntries);
    });

    return allSessionEntries;
  }, [displayData.sessions, displayData.session_classes, displayData.registrations, generateUpcomingDates]);

  // Filter and sort sessions
  const filteredAndSortedSessions = useMemo(() => {
    let filtered = processedSessions;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((session: SessionData) =>
        session.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter((session: SessionData) => {
        if (filterStatus === 'active') return session.is_active;
        if (filterStatus === 'inactive') return !session.is_active;
        return true;
      });
    }

    // Sort by date (closest to farthest) when "all" is selected, otherwise by occupancy rate
    if (filterStatus === 'all') {
      return filtered.sort((a: SessionData, b: SessionData) => {
        if (!a.specificDate || !b.specificDate) return 0;
        return new Date(a.specificDate).getTime() - new Date(b.specificDate).getTime();
      });
    } else {
      // Sort by occupancy rate (descending) for other filters
      return filtered.sort((a: SessionData, b: SessionData) => 
        (b.occupancyRate || 0) - (a.occupancyRate || 0)
      );
    }
  }, [processedSessions, searchTerm, filterStatus]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalSessions = processedSessions.length;
    const activeSessions = processedSessions.filter((s: SessionData) => s.is_active).length;
    const totalRegistrations = processedSessions.reduce((sum: number, s: SessionData) => sum + (s.registrationsCount || 0), 0);
    const totalRevenue = processedSessions.reduce((sum: number, s: SessionData) => sum + (s.totalRevenue || 0), 0);
    const avgOccupancy = totalSessions > 0 
      ? processedSessions.reduce((sum: number, s: SessionData) => sum + (s.occupancyRate || 0), 0) / totalSessions 
      : 0;

    return {
      totalSessions,
      activeSessions,
      totalRegistrations,
      totalRevenue,
      avgOccupancy: Math.round(avgOccupancy * 100) / 100
    };
  }, [processedSessions]);

  // Event handlers
  const handleViewClassDetails = useCallback((classData: any) => {
    setSelectedClassForDetails(classData);
  }, []);

  const handleEditRegistration = useCallback((registration: any) => {
    setSelectedRegistrationForEdit(registration);
  }, []);

  const handleToggleSessionExpansion = (sessionId: string) => {
    setExpandedSession(expandedSession === sessionId ? null : sessionId);
  };

  const handleToggleLinkedClassesExpansion = (sessionId: string) => {
    setExpandedLinkedClasses(expandedLinkedClasses === sessionId ? null : sessionId);
  };

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <div>
          <h2 className="text-2xl font-bold text-[#4B2E83]">סקירה כללית</h2>
          <p className="text-sm text-[#4B2E83]/70 mt-1">סקירה כללית של השיעורים, הסשנים וההרשמות</p>
        </div>
        <RefreshButton
          onClick={handleRefreshData}
          isFetching={isFetching}
        />
      </div>

      {/* Quick Action Buttons */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-[#EC4899]/10">
        <h3 className="text-lg font-semibold text-[#4B2E83] mb-4 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          פעולות מהירות
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Add Class Button */}
          <button
            onClick={() => {
              alert('למעבר להוספת שיעור: לחצי על הטאב "שיעורים" ואז על כפתור "הוספת שיעור"');
            }}
            className="flex items-center gap-3 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-700 rounded-lg transition-all duration-200 border border-blue-200 hover:border-blue-300"
          >
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div className="text-left">
              <h4 className="font-medium text-sm">הוספת שיעור</h4>
              <p className="text-xs text-blue-600">צור שיעור חדש</p>
            </div>
          </button>

          {/* Add Session Button */}
          <button
            onClick={() => {
              alert('למעבר להוספת קבוצה: לחצי על הטאב "שיעורים" ואז על "קבוצות" ואז על כפתור "הוספת קבוצה"');
            }}
            className="flex items-center gap-3 p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 text-purple-700 rounded-lg transition-all duration-200 border border-purple-200 hover:border-purple-300"
          >
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="text-left">
              <h4 className="font-medium text-sm">הוספת קבוצה</h4>
              <p className="text-xs text-purple-600">צור קבוצה חדשה</p>
            </div>
          </button>

          {/* Add Registration Button */}
          <button
            onClick={() => {
              alert('למעבר להוספת הרשמה: לחצי על הטאב "שיעורים" ואז על "הרשמות" ואז על כפתור "הוספת הרשמה"');
            }}
            className="flex items-center gap-3 p-3 sm:p-4 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 text-green-700 rounded-lg transition-all duration-200 border border-green-200 hover:border-green-300"
          >
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="text-left">
              <h4 className="font-medium text-sm">הוספת הרשמה</h4>
              <p className="text-xs text-green-600">צור הרשמה חדשה</p>
            </div>
          </button>
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
              {filteredAndSortedSessions.map((sessionData: SessionData) => (
                <React.Fragment key={`${sessionData.id}_${sessionData.specificDate}`}>
                  <tr className="hover:bg-[#EC4899]/5 transition-colors">
                    <td className="px-2 sm:px-4 py-1.5 sm:py-2.5 border-l border-[#EC4899]/10">
                      <div className="font-semibold text-xs sm:text-sm text-[#4B2E83] leading-tight truncate max-w-32 sm:max-w-40">{sessionData.name}</div>
                    </td>
                                        <td className="px-2 sm:px-4 py-1.5 sm:py-2.5 border-l border-[#EC4899]/10 text-center">
                      <div className="text-xs sm:text-sm font-medium text-[#4B2E83] leading-tight">
                        {sessionData.specificDate ? (
                          <div className="space-y-1">
                            <div className="font-semibold text-xs sm:text-sm">
                              {new Date(sessionData.specificDate).toLocaleDateString('he-IL')}
                            </div>
                              {(() => {
                                // Get the specific day of week for this date
                                const specificDate = new Date(sessionData.specificDate);
                                const dayOfWeek = specificDate.getDay(); // 0=Sunday, 1=Monday, etc.
                                
                                // Convert day number to Hebrew name
                                const dayName = getDayOfWeekName(dayOfWeek);
                                
                              const date = new Date(sessionData.specificDate);
                              const today = new Date();
                              today.setHours(0,0,0,0);
                              const tomorrow = new Date(today);
                              tomorrow.setDate(today.getDate() + 1);
                              
                              let statusText = '';
                              let statusColor = '';
                              
                              if (date.getTime() === today.getTime()) {
                                statusText = 'היום';
                                statusColor = 'text-green-600';
                              } else if (date.getTime() === tomorrow.getTime()) {
                                statusText = 'מחר';
                                statusColor = 'text-blue-600';
                              }
                              
                              return (
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
                              );
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
                            <div className="text-[#4B2E83]/70 text-xs">עד</div>
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
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        sessionData.is_active 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {sessionData.is_active ? (
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
                    </td>
                                        <td className="px-2 sm:px-4 py-1.5 sm:py-2.5 border-l border-[#EC4899]/10">
                      <div className="flex flex-wrap gap-1 max-h-12 overflow-hidden">
                        {sessionData.linkedClasses && sessionData.linkedClasses.length > 0 ? (
                          <>
                            {sessionData.linkedClasses.slice(0, 2).map((className: string, index: number) => (
                              <span key={index} className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-[#EC4899]/10 text-[#EC4899] truncate max-w-20 sm:max-w-24">
                              {className}
                            </span>
                            ))}
                            {sessionData.linkedClasses.length > 2 && (
                              <button
                                onClick={() => handleToggleLinkedClassesExpansion(`${sessionData.id}_${sessionData.specificDate}`)}
                                className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-[#4B2E83]/10 text-[#4B2E83] hover:bg-[#4B2E83]/20 transition-colors cursor-pointer"
                              >
                                +{sessionData.linkedClasses.length - 2}
                              </button>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-[#4B2E83]/50">אין שיעורים מקושרים</span>
                        )}
                      </div>
                      
                      {/* Expanded Linked Classes */}
                      {expandedLinkedClasses === `${sessionData.id}_${sessionData.specificDate}` && sessionData.linkedClasses && sessionData.linkedClasses.length > 2 && (
                        <div className="mt-2 p-2 bg-white rounded-lg border border-[#EC4899]/20 shadow-sm">
                          <div className="flex flex-wrap gap-1">
                            {sessionData.linkedClasses.slice(2).map((className: string, index: number) => (
                              <span key={index + 2} className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-[#EC4899]/10 text-[#EC4899] truncate max-w-20 sm:max-w-24">
                                {className}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
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
                                const classData = displayData.classes?.find((c: any) => c.id === sessionClass.class_id);
                                return (
                                  <div key={sessionClass.id} className="bg-white p-1.5 sm:p-2 rounded-lg border border-[#EC4899]/10 w-40 sm:w-48 flex flex-col justify-between">
                                    <div>
                                      <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-semibold text-[#4B2E83] text-xs leading-tight line-clamp-2">{classData?.name || 'שיעור לא ידוע'}</h4>
                                        <span className={`inline-flex items-center gap-1 px-1 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                                          sessionClass.is_trial ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-green-100 text-green-800 border border-green-200'
                                        }`}>
                                          {sessionClass.is_trial ? (
                                            <>
                                              <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                              </svg>
                                              ניסיון
                                            </>
                                          ) : (
                                            <>
                                              <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                              </svg>
                                              רגיל
                                            </>
                                          )}
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
                                                  <span className={`inline-flex items-center gap-1 px-1 py-0.5 rounded-full text-xs font-medium ${
                                                    registration.status === 'active' ? 'bg-green-100 text-green-800 border border-green-200' :
                                                    registration.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                                                    'bg-red-50 text-red-700 border border-red-200'
                                                  }`}>
                                                    {registration.status === 'active' ? (
                                                      <>
                                                        <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
                                                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                        פעיל
                                                      </>
                                                    ) : registration.status === 'pending' ? (
                                                      <>
                                                        <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
                                                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                        </svg>
                                                        ממתין
                                                      </>
                                                    ) : (
                                                      <>
                                                        <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
                                                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                        </svg>
                                                        בוטל
                                                      </>
                                                    )}
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
      {filteredAndSortedSessions.length === 0 && (
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
          isNewRegistration={false}
          classes={data.classes || []}
          sessions={data.sessions || []}
          session_classes={data.session_classes || []}
          profiles={data.profiles || []}
        />
      )}
    </div>
  );
} 