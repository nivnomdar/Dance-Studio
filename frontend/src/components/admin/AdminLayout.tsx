import { useState } from 'react';
import type { UserProfile } from '../../types/auth';

interface Tab {
  key: string;
  label: string;
  component: React.ComponentType<{ profile: UserProfile }>;
}

interface AdminLayoutProps {
  tabs: Tab[];
  profile: UserProfile;
}

export default function AdminLayout({ tabs, profile }: AdminLayoutProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const ActiveComponent = tabs.find(tab => tab.key === activeTab)?.component || tabs[0].component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF5F9] via-[#FDF9F6] to-[#FFF5F9] pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#4B2E83] mb-4 font-agrandir-grand">
            דשבורד מנהלים
          </h1>
          <p className="text-lg text-[#4B2E83]/70 max-w-2xl mx-auto">
            ברוכה הבאה לפאנל הניהול של סטודיו אביגיל
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#EC4899]/10">
          {/* Tabs Navigation */}
          <div className="bg-gradient-to-r from-[#4B2E83] to-[#EC4899] px-8 py-6">
            <div className="flex justify-center space-x-2 rtl:space-x-reverse">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    activeTab === tab.key 
                      ? 'bg-white text-[#4B2E83] shadow-lg' 
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            <ActiveComponent profile={profile} />
          </div>
        </div>
      </div>
    </div>
  );
} 