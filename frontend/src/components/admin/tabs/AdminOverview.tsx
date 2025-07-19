import { useEffect, useState, useRef } from 'react';
import { useAdminData } from '../../../contexts/AdminDataContext';
import type { UserProfile } from '../../../types/auth';

interface AdminOverviewProps {
  profile: UserProfile;
}

export default function AdminOverview({ profile }: AdminOverviewProps) {
  const { data, isLoading, error, fetchOverview, isFetching, resetRateLimit } = useAdminData();
  const [timeFilter, setTimeFilter] = useState<'day' | 'week' | 'month' | 'year'>('week');
  const hasInitialized = useRef(false);

  // טעינת נתונים רק פעם אחת - עם מניעת רענונים כפולים
  useEffect(() => {
    console.log('AdminOverview useEffect called');
    console.log('hasInitialized.current:', hasInitialized.current);
    console.log('data.overview:', data.overview);
    
    // טען רק אם לא טענו עדיין ואין נתונים
    if (!hasInitialized.current && !data.overview) {
      console.log('AdminOverview: calling fetchOverview');
      hasInitialized.current = true;
      fetchOverview();
    }
  }, [fetchOverview]); // תלוי רק ב-fetchOverview, לא ב-data כדי למנוע לולאות

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
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                resetRateLimit();
                fetchOverview();
              }}
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
          onClick={() => {
            resetRateLimit();
            fetchOverview();
          }}
          disabled={isFetching}
          className="px-4 py-2 bg-gradient-to-r from-[#4B2E83] to-[#EC4899] text-white rounded-lg font-medium hover:from-[#EC4899] hover:to-[#4B2E83] transition-all duration-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isFetching ? 'מעדכן...' : 'רענן נתונים'}
        </button>
      </div>
      
      {/* Welcome Message */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              ברוכה הבאה, {profile.first_name}!
            </h3>
            <p className="text-gray-600 text-sm">
              כאן תוכלי לנהל את כל ההיבטים של סטודיו אביגיל
            </p>
          </div>
        </div>
      </div>

      {/* Time Filter Buttons - Centered */}
      <div className="flex justify-center">
        <div className="flex bg-white/50 backdrop-blur-sm rounded-xl p-1 border border-[#4B2E83]/10 shadow-sm">
          <button
            onClick={() => setTimeFilter('day')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              timeFilter === 'day' 
                ? 'bg-[#4B2E83] text-white shadow-sm' 
                : 'text-[#4B2E83]/70 hover:text-[#4B2E83] hover:bg-white/50'
            }`}
          >
            היום
          </button>
          <button
            onClick={() => setTimeFilter('week')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              timeFilter === 'week' 
                ? 'bg-[#4B2E83] text-white shadow-sm' 
                : 'text-[#4B2E83]/70 hover:text-[#4B2E83] hover:bg-white/50'
            }`}
          >
            השבוע
          </button>
          <button
            onClick={() => setTimeFilter('month')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              timeFilter === 'month' 
                ? 'bg-[#4B2E83] text-white shadow-sm' 
                : 'text-[#4B2E83]/70 hover:text-[#4B2E83] hover:bg-white/50'
            }`}
          >
            החודש
          </button>
          <button
            onClick={() => setTimeFilter('year')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              timeFilter === 'year' 
                ? 'bg-[#4B2E83] text-white shadow-sm' 
                : 'text-[#4B2E83]/70 hover:text-[#4B2E83] hover:bg-white/50'
            }`}
          >
            השנה
          </button>
        </div>
      </div>

      {/* Main Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {/* הכנסות */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-2xl border border-emerald-200 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
              {timeFilter === 'day' ? 'היום' : timeFilter === 'week' ? 'השבוע' : timeFilter === 'month' ? 'החודש' : 'השנה'}
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">הכנסות</h3>
          <p className="text-2xl lg:text-3xl font-bold text-emerald-700">
            ₪{timeFilter === 'day' ? statistics.revenueToday || 0 :
              timeFilter === 'week' ? statistics.revenueThisWeek || 0 :
              timeFilter === 'month' ? statistics.revenueThisMonth || 0 :
              statistics.revenueThisYear || 0}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            מהרשמות לשיעורים
          </p>
        </div>

        {/* הרשמות */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
              {timeFilter === 'day' ? 'היום' : timeFilter === 'week' ? 'השבוע' : timeFilter === 'month' ? 'החודש' : 'השנה'}
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">הרשמות חדשות</h3>
          <p className="text-2xl lg:text-3xl font-bold text-blue-700">
            {timeFilter === 'day' ? statistics.registrationsToday || 0 :
             timeFilter === 'week' ? statistics.registrationsThisWeek || 0 :
             timeFilter === 'month' ? statistics.registrationsThisMonth || 0 :
             statistics.registrationsThisYear || 0}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            תלמידות שנרשמו לשיעורים
          </p>
        </div>

        {/* משתמשות חדשות */}
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-2xl border border-purple-200 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
              {timeFilter === 'day' ? 'היום' : timeFilter === 'week' ? 'השבוע' : timeFilter === 'month' ? 'החודש' : 'השנה'}
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">משתמשות חדשות</h3>
          <p className="text-2xl lg:text-3xl font-bold text-purple-700">
            {timeFilter === 'day' ? statistics.newUsersToday || 0 :
             timeFilter === 'week' ? statistics.newUsersThisWeek || 0 :
             timeFilter === 'month' ? statistics.newUsers || 0 :
             statistics.newUsersThisYear || 0}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            נרשמו לאתר
          </p>
        </div>

        {/* ביטולים */}
        <div className="bg-gradient-to-br from-red-50 to-rose-50 p-6 rounded-2xl border border-red-200 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded-full">
              {timeFilter === 'day' ? 'היום' : timeFilter === 'week' ? 'השבוע' : timeFilter === 'month' ? 'החודש' : 'השנה'}
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">ביטולים</h3>
          <p className="text-2xl lg:text-3xl font-bold text-red-700">
            {timeFilter === 'day' ? statistics.cancellationsToday || 0 :
             timeFilter === 'week' ? statistics.cancellationsThisWeek || 0 :
             timeFilter === 'month' ? statistics.cancellationsThisMonth || 0 :
             statistics.cancellationsThisYear || 0}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            תלמידות שביטלו שיעורים
          </p>
        </div>
      </div>

      {/* Secondary Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* כמות פניות */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl border border-amber-200 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-amber-600 bg-amber-100 px-2 py-1 rounded-full">
              {timeFilter === 'day' ? 'היום' : timeFilter === 'week' ? 'השבוע' : timeFilter === 'month' ? 'החודש' : 'השנה'}
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">כמות פניות</h3>
          <p className="text-2xl lg:text-3xl font-bold text-amber-700">
            {timeFilter === 'day' ? statistics.inquiriesToday || 0 :
             timeFilter === 'week' ? statistics.inquiriesThisWeek || 0 :
             timeFilter === 'month' ? statistics.inquiriesThisMonth || 0 :
             statistics.inquiriesThisYear || 0}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            פניות חדשות דרך האתר
          </p>
        </div>

        {/* שיעורים היום */}
        <div className="bg-gradient-to-br from-cyan-50 to-sky-50 p-6 rounded-2xl border border-cyan-200 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-cyan-600 bg-cyan-100 px-2 py-1 rounded-full">
              {timeFilter === 'day' ? 'היום' : timeFilter === 'week' ? 'השבוע' : timeFilter === 'month' ? 'החודש' : 'השנה'}
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">שיעורים מתוכננים</h3>
          <p className="text-2xl lg:text-3xl font-bold text-cyan-700">
            {timeFilter === 'day' ? statistics.classesToday || 0 :
             timeFilter === 'week' ? statistics.classesThisWeek || 0 :
             timeFilter === 'month' ? statistics.classesThisMonth || 0 :
             statistics.classesThisYear || 0}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            שיעורים {timeFilter === 'day' ? 'היום' : timeFilter === 'week' ? 'השבוע' : timeFilter === 'month' ? 'החודש' : 'השנה'}
          </p>
        </div>

        {/* שיעורים עם מקומות פנויים */}
        <div className="bg-gradient-to-br from-lime-50 to-green-50 p-6 rounded-2xl border border-lime-200 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-lime-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-lime-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-lime-600 bg-lime-100 px-2 py-1 rounded-full">
              זמינים
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">מקומות פנויים</h3>
          <p className="text-2xl lg:text-3xl font-bold text-lime-700">
            {statistics.availableSpots || 0}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            מקומות פנויים בשיעורים
          </p>
        </div>
      </div>

      {/* Low Capacity Classes - Need Attention */}
      {lowCapacityClasses.length > 0 && (
        <div className="bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-2xl border border-red-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">שיעורים שדורשים תשומת לב</h3>
              <p className="text-sm text-gray-600">שיעורים עם פחות מ-50% רישום - דורשים קידום או ביטול</p>
            </div>
          </div>
          <div className="space-y-3">
            {lowCapacityClasses.map((cls: any) => (
              <div key={cls.id} className="flex justify-between items-center p-4 bg-white/70 backdrop-blur-sm border border-red-200 rounded-xl hover:bg-white/90 transition-all duration-200">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 text-sm lg:text-base">{cls.name}</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    {cls.session_classes && cls.session_classes.length > 0 ? 'לוח זמנים מוגדר' : 'לוח זמנים לא מוגדר'}
                  </p>
                </div>
                <div className="text-right ml-4">
                  <p className="font-bold text-red-600 text-sm lg:text-base">
                    {cls.registrations_count}/{cls.max_capacity}
                  </p>
                  <p className="text-xs text-red-600 font-medium">
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