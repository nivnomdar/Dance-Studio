import React, { useState } from 'react';
import { FaUser, FaCalendarAlt, FaShoppingBag, FaCreditCard } from 'react-icons/fa';
import PersonalDetailsTab from './PersonalDetailsTab';
import MyClassesTab from './MyClassesTab';
import MyOrdersTab from './MyOrdersTab';

import type { UserProfile } from '../../types/auth';

interface ProfileTabsProps {
  user: any;
  localProfile: UserProfile | null;
  formData: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    postalCode: string;
  };
  isEditing: boolean;
  isLoading: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onToggleEdit: () => void;
  session: any;
  onClassesCountUpdate?: () => void;
  onCreditsUpdate?: () => void;
}

type TabType = 'personal' | 'classes' | 'orders';

const ProfileTabs: React.FC<ProfileTabsProps> = ({
  user,
  localProfile,
  formData,
  isEditing,
  isLoading,
  onInputChange,
  onSubmit,
  onToggleEdit,
  session,
  onClassesCountUpdate,
  onCreditsUpdate
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('personal');

  // עדכן את ספירת השיעורים כאשר עוברים לטאב השיעורים
  const handleTabChange = (tabId: TabType) => {
    setActiveTab(tabId);
    if (tabId === 'classes' && onClassesCountUpdate) {
      onClassesCountUpdate();
    }
  };

  const tabs = [
    {
      id: 'personal' as TabType,
      label: 'פרטים אישיים',
      icon: FaUser,
      count: null
    },
    {
      id: 'classes' as TabType,
      label: 'השיעורים שלי',
      icon: FaCalendarAlt,
      count: null // TODO: Add actual count from registrations
    },
    {
      id: 'orders' as TabType,
      label: 'הזמנות',
      icon: FaShoppingBag,
      count: null // TODO: Add actual count from orders
    },

  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return (
          <PersonalDetailsTab
            user={user}
            localProfile={localProfile}
            formData={formData}
            isEditing={isEditing}
            isLoading={isLoading}
            onInputChange={onInputChange}
            onSubmit={onSubmit}
            onToggleEdit={onToggleEdit}
          />
        );
      case 'classes':
        return (
          <MyClassesTab
            userId={user?.id || ''}
            session={session}
            onClassesCountUpdate={onClassesCountUpdate}
            onCreditsUpdate={onCreditsUpdate}
          />
        );
      case 'orders':
        return (
          <MyOrdersTab
            userId={user?.id || ''}
            session={session}
          />
        );

            default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-lg border border-[#EC4899]/10">
        <div className="p-4">
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white shadow-md'
                      : 'bg-gray-50 text-[#4B2E83] hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                  {tab.count !== null && (
                    <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                      isActive ? 'bg-white/20' : 'bg-[#EC4899] text-white'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
};

export default ProfileTabs; 