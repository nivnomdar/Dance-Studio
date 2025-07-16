import { useEffect, useState } from 'react';
import { useAdminData } from '../../../contexts/AdminDataContext';
import type { UserProfile } from '../../../types/auth';

interface AdminOverviewProps {
  profile: UserProfile;
}

export default function AdminOverview({ profile }: AdminOverviewProps) {
  const { data, isLoading, error, fetchOverview, isFetching } = useAdminData();
  const [timeFilter, setTimeFilter] = useState<'day' | 'week' | 'month'>('week');

  // טעינת נתונים רק אם אין נתונים או שהם ישנים
  useEffect(() => {
    if (!data.overview) {
      fetchOverview();
    }
  }, [data.overview, fetchOverview]);

  if (isLoading && !data.overview) {
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

  if (error && !data.overview) {
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
          <button
            onClick={fetchOverview}
            className="px-6 py-3 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded-xl font-medium hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300"
          >
            נסה שוב
          </button>
        </div>
      </div>
    );
  }

  if (!data.overview) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-[#4B2E83] mb-4">סקירה כללית</h2>
        <div className="text-center py-12">
          <p className="text-[#4B2E83]/70">אין נתונים זמינים</p>
        </div>
      </div>
    );
  }

  const { statistics, lowCapacityClasses } = data.overview;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#4B2E83] mb-4">סקירה כללית</h2>
        <button
          onClick={fetchOverview}
          disabled={isFetching}
          className="px-4 py-2 bg-gradient-to-r from-[#4B2E83] to-[#EC4899] text-white rounded-lg font-medium hover:from-[#EC4899] hover:to-[#4B2E83] transition-all duration-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isFetching ? 'מעדכן...' : 'רענן נתונים'}
        </button>
      </div>
      
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5 p-6 rounded-2xl border border-[#EC4899]/10">
        <h3 className="text-lg font-semibold text-[#4B2E83] mb-2">
          ברוכה הבאה, {profile.first_name}!
        </h3>
        <p className="text-[#4B2E83]/70">
          כאן תוכלי לנהל את כל ההיבטים של סטודיו אביגיל
        </p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Registrations Card - First and prominent */}


        <div className="bg-gradient-to-br from-[#EC4899]/5 to-[#4B2E83]/5 p-6 rounded-2xl border border-[#EC4899]/10">
          <h3 className="text-lg font-semibold text-[#4B2E83] mb-2">מספר שיעורים במערכת</h3>
          <p className="text-3xl font-bold text-[#EC4899]">{statistics.totalClasses}</p>
          <p className="text-sm text-[#4B2E83]/70 mt-2">
            {statistics.activeClasses} שיעורים פעילים (זמינים להרשמה)
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-[#4B2E83]/5 to-[#EC4899]/5 p-6 rounded-2xl border border-[#4B2E83]/10">
          <h3 className="text-lg font-semibold text-[#4B2E83] mb-2">ביטולים השבוע</h3>
          <p className="text-3xl font-bold text-[#4B2E83]">{statistics.cancellationsThisWeek}</p>
          <p className="text-sm text-[#4B2E83]/70 mt-2">
            תלמידות שביטלו שיעורים השבוע
          </p>
        </div>

        <div className="bg-gradient-to-br from-[#EC4899]/5 to-[#4B2E83]/5 p-6 rounded-2xl border border-[#EC4899]/10">
          <h3 className="text-lg font-semibold text-[#4B2E83] mb-2">שיעורים היום</h3>
          <p className="text-3xl font-bold text-[#EC4899]">{statistics.classesToday}</p>
          <p className="text-sm text-[#4B2E83]/70 mt-2">
            שיעורים מתוכננים להיום
          </p>
        </div>

        <div className="bg-gradient-to-br from-[#4B2E83]/5 to-[#EC4899]/5 p-6 rounded-2xl border border-[#4B2E83]/10">
          {/* Header with title */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-[#4B2E83]/10 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-[#4B2E83]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#4B2E83]">הרשמות לשיעורים</h3>
              <p className="text-xs text-[#4B2E83]/60 mt-0.5">
                {timeFilter === 'day' ? 'הרשמות מהיום האחרון' :
                 timeFilter === 'week' ? 'הרשמות מהשבוע האחרון' :
                 'משתמשות חדשות החודש'}
              </p>
            </div>
          </div>
          
          {/* Main statistic */}
          <div className="text-center mb-4">
            <p className="text-4xl font-bold text-[#4B2E83]">
              {timeFilter === 'day' ? statistics.registrationsToday || 0 :
               timeFilter === 'week' ? statistics.registrationsThisWeek :
               statistics.newUsers}
            </p>
            <p className="text-sm text-[#4B2E83]/70 mt-1">
              {timeFilter === 'day' ? 'הרשמות חדשות' :
               timeFilter === 'week' ? 'הרשמות חדשות' :
               'משתמשות חדשות'}
            </p>
          </div>
          
          {/* Filter buttons at bottom center */}
          <div className="flex justify-center">
            <div className="flex bg-white/50 backdrop-blur-sm rounded-xl p-1 border border-[#4B2E83]/10">
              <button
                onClick={() => setTimeFilter('day')}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all duration-200 ${
                  timeFilter === 'day' 
                    ? 'bg-[#4B2E83] text-white shadow-sm' 
                    : 'text-[#4B2E83]/70 hover:text-[#4B2E83] hover:bg-white/50'
                }`}
              >
                היום
              </button>
              <button
                onClick={() => setTimeFilter('week')}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all duration-200 ${
                  timeFilter === 'week' 
                    ? 'bg-[#4B2E83] text-white shadow-sm' 
                    : 'text-[#4B2E83]/70 hover:text-[#4B2E83] hover:bg-white/50'
                }`}
              >
                השבוע
              </button>
              <button
                onClick={() => setTimeFilter('month')}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all duration-200 ${
                  timeFilter === 'month' 
                    ? 'bg-[#4B2E83] text-white shadow-sm' 
                    : 'text-[#4B2E83]/70 hover:text-[#4B2E83] hover:bg-white/50'
                }`}
              >
                החודש
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Statistics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-[#EC4899]/5 to-[#4B2E83]/5 p-6 rounded-2xl border border-[#EC4899]/10">
          <h3 className="text-lg font-semibold text-[#4B2E83] mb-2">שיעורים מחר</h3>
          <p className="text-3xl font-bold text-[#EC4899]">{statistics.classesTomorrow}</p>
          <p className="text-sm text-[#4B2E83]/70 mt-2">
            שיעורים מתוכננים למחר
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-[#4B2E83]/5 to-[#EC4899]/5 p-6 rounded-2xl border border-[#4B2E83]/10">
          <h3 className="text-lg font-semibold text-[#4B2E83] mb-2">משתמשות חדשות במערכת</h3>
          <p className="text-3xl font-bold text-[#4B2E83]">{statistics.newUsers}</p>
          <p className="text-sm text-[#4B2E83]/70 mt-2">
            נרשמו ב-30 ימים אחרונים
          </p>
        </div>
      </div>

      {/* Low Capacity Classes - Need Attention */}
      {lowCapacityClasses.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-[#EC4899]/10">
          <h3 className="text-xl font-semibold text-[#4B2E83] mb-4">שיעורים שדורשים תשומת לב</h3>
          <p className="text-sm text-[#4B2E83]/70 mb-4">שיעורים עם פחות מ-50% רישום - דורשים קידום או ביטול</p>
          <div className="space-y-4">
            {lowCapacityClasses.map((cls: any) => (
              <div key={cls.id} className="flex justify-between items-center p-4 bg-gradient-to-r from-red-50 to-orange-50 border border-orange-200 rounded-xl">
                <div>
                  <h4 className="font-semibold text-[#4B2E83]">{cls.name}</h4>
                  <p className="text-sm text-[#4B2E83]/70">
                    {cls.session_classes && cls.session_classes.length > 0 ? 'לוח זמנים מוגדר' : 'לוח זמנים לא מוגדר'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-red-600">
                    {cls.registrations_count}/{cls.max_capacity}
                  </p>
                  <p className="text-sm text-red-600 font-medium">
                    {Math.round(cls.fill_rate)}% מלא
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 