import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useAdminData } from '../../contexts';
import type { UserProfile } from '../../../types/auth';
import { ClassesTab, SessionsTab, RegistrationsTab } from './index';
import { RefreshButton } from '../../components';

interface AdminClassesProps {
  profile: UserProfile;
}

type TabType = 'classes' | 'sessions' | 'registrations';

// Global flag to prevent multiple initializations across renders
let globalAdminClassesInitialized = false;

export default function AdminClasses({ profile }: AdminClassesProps) {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { data, isLoading, error, fetchClasses, isFetching, resetRateLimit } = useAdminData();
  const [activeTab, setActiveTab] = useState<TabType>('classes');
  const previousUserIdRef = useRef<string | null>(null); // Track previous user ID

  // Load data on component mount - only once
  useEffect(() => {
    // טען רק אם לא טענו עדיין ואין נתונים ולא בטעינה
    if (!globalAdminClassesInitialized && data.classes.length === 0 && !isLoading) {
      globalAdminClassesInitialized = true;
      fetchClasses();
    } else if (data.classes.length > 0) {
      // אם יש כבר נתונים, סמן כמוכן
      globalAdminClassesInitialized = true;
    }
  }, [fetchClasses, data.classes.length, isLoading]); // תלוי גם ב-isLoading

  // Reset global flag when user changes
  useEffect(() => {
    const currentUserId = session?.user?.id;
    
    // אם יש כבר נתונים טעונים, אל תאפס את ה־flag
    if (globalAdminClassesInitialized && data.classes.length > 0) {
      return;
    }
    
    // אם יש session קיים ואותו משתמש, אל תאפס
    if (currentUserId && previousUserIdRef.current === currentUserId && globalAdminClassesInitialized) {
      return;
    }
    
    // רק אם יש משתמש חדש ושונה מהקודם
    if (currentUserId && currentUserId !== previousUserIdRef.current) {
      globalAdminClassesInitialized = false;
      previousUserIdRef.current = currentUserId;
    } else if (currentUserId && !previousUserIdRef.current) {
      // First time loading with a user
      previousUserIdRef.current = currentUserId;
    }
    // אם אין משתמש או אותו משתמש, אל תאפס את ה־flag
  }, [session?.user?.id, data.classes.length]);
  
  // Prevent resetting global flag if data was already loaded successfully
  useEffect(() => {
    // Data already loaded successfully
  }, [data.classes.length]);

  // Prevent unnecessary resets when data is loading
  useEffect(() => {
    // Data is loading
  }, [isLoading]);

  // Ensure global flag is not reset when session exists
  useEffect(() => {
    // Session exists and data loaded
  }, [session?.user?.id, data.classes.length]);

  // Function to refresh data
  const handleRefresh = () => {
    globalAdminClassesInitialized = false;
    resetRateLimit();
    fetchClasses();
  };

  if (isLoading && data.classes.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
          <div>
            <h2 className="text-2xl font-bold text-[#4B2E83]">ניהול שיעורים</h2>
            <p className="text-sm text-[#4B2E83]/70 mt-1">סקירה כללית של השיעורים, הסשנים וההרשמות</p>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EC4899] mx-auto mb-4"></div>
          <p className="text-[#4B2E83]/70">טוען נתונים...</p>
        </div>
      </div>
    );
  }

  if (error && data.classes.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
          <div>
            <h2 className="text-2xl font-bold text-[#4B2E83]">ניהול שיעורים</h2>
            <p className="text-sm text-[#4B2E83]/70 mt-1">סקירה כללית של השיעורים, הסשנים וההרשמות</p>
          </div>
        </div>
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
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <div>
        <h2 className="text-2xl font-bold text-[#4B2E83]">ניהול שיעורים</h2>
          <p className="text-sm text-[#4B2E83]/70 mt-1">סקירה כללית של השיעורים, הסשנים וההרשמות</p>
        </div>
        <RefreshButton
          onClick={handleRefresh}
          isFetching={isFetching}
        />
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#EC4899]/10">
        <div className="grid grid-cols-3 sm:grid-cols-3 gap-3">

          <button
            onClick={() => setActiveTab('classes')}
            className={`px-4 py-3 rounded-lg font-medium transition-all text-sm ${
              activeTab === 'classes'
                ? 'bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white'
                : 'bg-gray-100 text-[#4B2E83] hover:bg-gray-200'
            }`}
          >
            שיעורים
          </button>
          <button
            onClick={() => setActiveTab('sessions')}
            className={`px-4 py-3 rounded-lg font-medium transition-all text-sm ${
              activeTab === 'sessions'
                ? 'bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white'
                : 'bg-gray-100 text-[#4B2E83] hover:bg-gray-200'
            }`}
          >
            קבוצות
          </button>
          <button
            onClick={() => setActiveTab('registrations')}
            className={`px-4 py-3 rounded-lg font-medium transition-all text-sm ${
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
      <div className="bg-white rounded-2xl shadow-sm border border-[#EC4899]/10 overflow-hidden">
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