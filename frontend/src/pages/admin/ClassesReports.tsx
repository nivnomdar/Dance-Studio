import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAdminData } from '../../contexts/AdminDataContext';
import type { UserProfile } from '../../types/auth';
import { ClassesTab, SessionsTab, RegistrationsTab } from './tabs';

interface ClassesReportsProps {
  profile: UserProfile;
}

type TabType = 'classes' | 'sessions' | 'registrations';

// Global flag to prevent multiple initializations across renders
let globalClassesReportsInitialized = false;

export default function ClassesReports({ profile }: ClassesReportsProps) {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { data, isLoading, error, fetchClasses, isFetching, resetRateLimit } = useAdminData();
  const [activeTab, setActiveTab] = useState<TabType>('classes');
  const previousUserIdRef = useRef<string | null>(null); // Track previous user ID

  // Load data on component mount - only once
  useEffect(() => {
    console.log('ClassesReports useEffect called');
    console.log('globalClassesReportsInitialized:', globalClassesReportsInitialized);
    console.log('data.classes.length:', data.classes.length);
    console.log('isLoading:', isLoading);
    
    // טען רק אם לא טענו עדיין ואין נתונים ולא בטעינה
    if (!globalClassesReportsInitialized && data.classes.length === 0 && !isLoading) {
      console.log('ClassesReports: calling fetchClasses');
      globalClassesReportsInitialized = true;
      fetchClasses();
    } else if (data.classes.length > 0) {
      // אם יש כבר נתונים, סמן כמוכן
      console.log('ClassesReports: data already loaded, marking as initialized');
      globalClassesReportsInitialized = true;
    } else if (isLoading && globalClassesReportsInitialized) {
      // אם בטעינה ויש כבר flag, אל תעשה כלום
      console.log('ClassesReports: already loading, skipping');
    }
  }, [fetchClasses, data.classes.length, isLoading]); // תלוי גם ב-isLoading

  // Reset global flag when user changes
  useEffect(() => {
    const currentUserId = session?.user?.id;
    
    // אם יש כבר נתונים טעונים, אל תאפס את ה־flag
    if (globalClassesReportsInitialized && data.classes.length > 0) {
      console.log('ClassesReports: data already loaded, preventing user change reset');
      return;
    }
    
    // אם יש session קיים ואותו משתמש, אל תאפס
    if (currentUserId && previousUserIdRef.current === currentUserId && globalClassesReportsInitialized) {
      console.log('ClassesReports: same user with existing session, not resetting');
      return;
    }
    
    // רק אם יש משתמש חדש ושונה מהקודם
    if (currentUserId && currentUserId !== previousUserIdRef.current) {
      console.log('ClassesReports: user actually changed, resetting global flag');
      console.log('Previous user:', previousUserIdRef.current);
      console.log('Current user:', currentUserId);
      globalClassesReportsInitialized = false;
      previousUserIdRef.current = currentUserId;
    } else if (currentUserId && !previousUserIdRef.current) {
      // First time loading with a user
      console.log('ClassesReports: first time loading with user:', currentUserId);
      previousUserIdRef.current = currentUserId;
    } else if (currentUserId && previousUserIdRef.current === currentUserId) {
      // Same user, don't reset
      console.log('ClassesReports: same user, not resetting global flag');
    }
    // אם אין משתמש או אותו משתמש, אל תאפס את ה־flag
  }, [session?.user?.id, data.classes.length]);

  // Prevent resetting global flag if data was already loaded successfully
  useEffect(() => {
    if (globalClassesReportsInitialized && data.classes.length > 0) {
      console.log('ClassesReports: data already loaded successfully, preventing reset');
    }
  }, [data.classes.length]);

  // Prevent unnecessary resets when data is loading
  useEffect(() => {
    if (isLoading && globalClassesReportsInitialized) {
      console.log('ClassesReports: data is loading, keeping global flag as true');
    }
  }, [isLoading]);

  // Ensure global flag is not reset when session exists
  useEffect(() => {
    if (session?.user?.id && globalClassesReportsInitialized && data.classes.length > 0) {
      console.log('ClassesReports: session exists and data loaded, keeping global flag');
    }
  }, [session?.user?.id, data.classes.length]);

  // Function to refresh data
  const handleRefresh = () => {
    console.log('ClassesReports: manual refresh requested');
    globalClassesReportsInitialized = false;
    resetRateLimit();
    fetchClasses();
  };

  if (isLoading && data.classes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#EC4899]/5 to-[#4B2E83]/5 p-6 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EC4899] mx-auto mb-4"></div>
            <p className="text-[#4B2E83]/70">טוען דוחות שיעורים...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && data.classes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#EC4899]/5 to-[#4B2E83]/5 p-6 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-red-600 mb-4">{error}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleRefresh}
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EC4899]/5 to-[#4B2E83]/5 p-2 sm:p-6 overflow-x-hidden">
      <div className="w-full max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl p-3 sm:p-6 shadow-sm border border-[#EC4899]/10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-[#4B2E83]">דוחות שיעורים</h1>
              <p className="text-sm sm:text-base text-[#4B2E83]/70 mt-1 sm:mt-2">סקירה כללית של השיעורים, הסשנים וההרשמות</p>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={() => navigate('/admin')}
                className="px-3 sm:px-4 py-2 bg-gradient-to-r from-[#4B2E83] to-[#EC4899] text-white rounded-lg font-medium hover:from-[#EC4899] hover:to-[#4B2E83] transition-all duration-300 text-xs sm:text-sm"
              >
                חזור לפאנל
              </button>
              <button
                onClick={handleRefresh}
                disabled={isFetching}
                className="px-3 sm:px-4 py-2 bg-gradient-to-r from-[#4B2E83] to-[#EC4899] text-white rounded-lg font-medium hover:from-[#EC4899] hover:to-[#4B2E83] transition-all duration-300 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isFetching ? 'מעדכן...' : 'רענן נתונים'}
              </button>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-2xl p-2 sm:p-6 shadow-sm border border-[#EC4899]/10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-2">

            <button
              onClick={() => setActiveTab('classes')}
              className={`px-2 sm:px-6 py-1.5 sm:py-3 rounded-lg font-medium transition-all text-xs sm:text-base ${
                activeTab === 'classes'
                  ? 'bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white'
                  : 'bg-gray-100 text-[#4B2E83] hover:bg-gray-200'
              }`}
            >
              שיעורים
            </button>
            <button
              onClick={() => setActiveTab('sessions')}
              className={`px-2 sm:px-6 py-1.5 sm:py-3 rounded-lg font-medium transition-all text-xs sm:text-base ${
                activeTab === 'sessions'
                  ? 'bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white'
                  : 'bg-gray-100 text-[#4B2E83] hover:bg-gray-200'
              }`}
            >
              קבוצות
            </button>
            <button
              onClick={() => setActiveTab('registrations')}
              className={`px-2 sm:px-6 py-1.5 sm:py-3 rounded-lg font-medium transition-all text-xs sm:text-base ${
                activeTab === 'registrations'
                  ? 'bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white'
                  : 'bg-gray-100 text-[#4B2E83] hover:bg-gray-200'
              }`}
            >
              הרשמות
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'classes' && (
          <ClassesTab 
            data={data} 
            session={session} 
            fetchClasses={fetchClasses}
          />
        )}
        
        {activeTab === 'sessions' && (
          <SessionsTab 
            data={data} 
            session={session} 
            fetchClasses={fetchClasses}
          />
        )}
        
        {activeTab === 'registrations' && (
          <RegistrationsTab 
            data={data} 
            session={session} 
            fetchClasses={fetchClasses}
          />
        )}
      </div>
    </div>
  );
} 