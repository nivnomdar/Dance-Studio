import { useEffect, useState } from 'react';
import { useAdminData } from '../../../contexts/AdminDataContext';
import type { UserProfile } from '../../../types/auth';

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
  const { data, isLoading, error, fetchCalendar, isFetching } = useAdminData();
  const [currentWeek, setCurrentWeek] = useState(1);

  // טעינת נתונים רק אם אין נתונים או שהם ישנים
  useEffect(() => {
    if (!data.calendar) {
      fetchCalendar();
    }
  }, [data.calendar, fetchCalendar]);

  const calendarData = data.calendar as CalendarData | null;

  const getHebrewDayName = (dayName: string) => {
    const dayNames: { [key: string]: string } = {
      sunday: 'ראשון',
      monday: 'שני',
      tuesday: 'שלישי',
      wednesday: 'רביעי',
      thursday: 'חמישי',
      friday: 'שישי',
      saturday: 'שבת'
    };
    return dayNames[dayName] || dayName;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('he-IL', {
      day: 'numeric',
      month: 'short'
    });
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
            onClick={fetchCalendar}
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
        <h2 className="text-2xl font-bold text-[#4B2E83] mb-4">לוח שנה</h2>
        <div className="flex gap-3">
          <button
            onClick={fetchCalendar}
            disabled={isFetching}
            className="px-4 py-2 bg-gradient-to-r from-[#4B2E83] to-[#EC4899] text-white rounded-lg font-medium hover:from-[#EC4899] hover:to-[#4B2E83] transition-all duration-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isFetching ? 'מעדכן...' : 'רענן נתונים'}
          </button>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="bg-white p-4 rounded-2xl border border-[#EC4899]/10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-[#4B2E83]">ניווט שבועי</h3>
          <div className="flex gap-2">
            {weekKeys.map((weekKey, index) => (
              <button
                key={weekKey}
                onClick={() => setCurrentWeek(index + 1)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
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
          <p className="text-sm text-[#4B2E83]/70">
            {formatDate(currentWeekData.startDate)} - {formatDate(new Date(new Date(currentWeekData.startDate).getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])}
          </p>
        )}
      </div>

      {/* Calendar Grid */}
      {currentWeekData && (
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
          {Object.entries(currentWeekData.days).map(([dateKey, dayData]) => (
            <div key={dateKey} className="bg-white p-4 rounded-2xl border border-[#EC4899]/10">
              <div className="text-center mb-4">
                <h4 className="font-semibold text-[#4B2E83]">
                  {getHebrewDayName(dayData.dayName)}
                </h4>
                <p className="text-sm text-[#4B2E83]/70">
                  {formatDate(dateKey)}
                </p>
              </div>

              {dayData.classes.length > 0 ? (
                <div className="space-y-3">
                  {dayData.classes.map((cls) => (
                    <div key={cls.id} className="bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5 p-3 rounded-xl border border-[#EC4899]/10">
                      <div className="mb-2">
                        <h5 className="font-semibold text-[#4B2E83] text-sm">{cls.name}</h5>
                        <p className="text-xs text-[#4B2E83]/70">
                          {cls.level} • {cls.duration} דקות • ₪{cls.price}
                        </p>
                      </div>

                      {/* Class Times */}
                      <div className="mb-2">
                        <p className="text-xs font-medium text-[#4B2E83] mb-1">שעות זמינות:</p>
                        <div className="flex flex-wrap gap-1">
                          {cls.times.map((time: string, index: number) => (
                            <span key={index} className="text-xs bg-[#4B2E83]/10 text-[#4B2E83] px-2 py-1 rounded">
                              {time}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Registrations */}
                      {cls.registrations.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-[#4B2E83] mb-1">
                            רשומות ({cls.registrations.length}):
                          </p>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {cls.registrations.map((reg: any) => (
                              <div key={reg.id} className="text-xs bg-white p-2 rounded border">
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
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-[#4B2E83]/50">אין שיעורים מתוכננים</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      <div className="bg-white p-6 rounded-2xl border border-[#EC4899]/10">
        <h3 className="text-lg font-semibold text-[#4B2E83] mb-4">סיכום שבועי</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-[#EC4899]">
              {currentWeekData ? Object.values(currentWeekData.days).reduce((total, day) => 
                total + day.classes.length, 0) : 0}
            </p>
            <p className="text-sm text-[#4B2E83]/70">סה"כ שיעורים</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-[#4B2E83]">
              {currentWeekData ? Object.values(currentWeekData.days).reduce((total, day) => 
                total + day.classes.reduce((classTotal, cls) => 
                  classTotal + cls.registrations.length, 0), 0) : 0}
            </p>
            <p className="text-sm text-[#4B2E83]/70">סה"כ הרשמות</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-[#EC4899]">
              {calendarData.classes.length}
            </p>
            <p className="text-sm text-[#4B2E83]/70">סוגי שיעורים</p>
          </div>
        </div>
      </div>
    </div>
  );
} 