import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAdminData } from '../../contexts/AdminDataContext';
import type { UserProfile } from '../../types/auth';
import { ClassesTab, SessionsTab, RegistrationsTab } from './tabs';

interface ClassesReportsProps {
  profile: UserProfile;
}

type TabType = 'classes' | 'sessions' | 'registrations';

export default function ClassesReports({ profile }: ClassesReportsProps) {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { data, isLoading, error, fetchClasses, isFetching } = useAdminData();
  const [activeTab, setActiveTab] = useState<TabType>('classes');

  // Load data on component mount
  useEffect(() => {
    if (data.classes.length === 0) {
      fetchClasses();
    }
  }, [data.classes.length, fetchClasses]);

  if (isLoading && data.classes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#EC4899]/5 to-[#4B2E83]/5 p-6">
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
      <div className="min-h-screen bg-gradient-to-br from-[#EC4899]/5 to-[#4B2E83]/5 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchClasses}
              className="px-6 py-3 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded-xl font-medium hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300"
            >
              נסה שוב
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EC4899]/5 to-[#4B2E83]/5 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#EC4899]/10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#4B2E83]">דוחות שיעורים</h1>
              <p className="text-[#4B2E83]/70 mt-2">סקירה כללית של השיעורים, הסשנים וההרשמות</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/admin')}
                className="px-4 py-2 bg-gradient-to-r from-[#4B2E83] to-[#EC4899] text-white rounded-lg font-medium hover:from-[#EC4899] hover:to-[#4B2E83] transition-all duration-300 text-sm"
              >
                חזור לפאנל
              </button>
              <button
                onClick={fetchClasses}
                disabled={isFetching}
                className="px-4 py-2 bg-gradient-to-r from-[#4B2E83] to-[#EC4899] text-white rounded-lg font-medium hover:from-[#EC4899] hover:to-[#4B2E83] transition-all duration-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isFetching ? 'מעדכן...' : 'רענן נתונים'}
              </button>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#EC4899]/10">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('classes')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'classes'
                  ? 'bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white'
                  : 'bg-gray-100 text-[#4B2E83] hover:bg-gray-200'
              }`}
            >
              שיעורים
            </button>
            <button
              onClick={() => setActiveTab('sessions')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'sessions'
                  ? 'bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white'
                  : 'bg-gray-100 text-[#4B2E83] hover:bg-gray-200'
              }`}
            >
              סשנים
            </button>
            <button
              onClick={() => setActiveTab('registrations')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
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