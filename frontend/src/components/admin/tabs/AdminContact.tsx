import { useEffect, useState } from 'react';
import { useAdminData } from '../../../contexts/AdminDataContext';
import type { UserProfile } from '../../../types/auth';
import { RefreshButton } from '../../admin';

interface AdminContactProps {
  profile: UserProfile;
}

export default function AdminContact({ profile }: AdminContactProps) {
  const { data, isLoading, error, fetchContact, isFetching } = useAdminData();
  const [filter, setFilter] = useState<'all' | 'new'>('all');

  // טעינת נתונים רק אם אין נתונים או שהם ישנים
  useEffect(() => {
    if (data.messages.length === 0) {
      fetchContact();
    }
  }, [data.messages.length, fetchContact]);

  const totalMessages = data.messages.length;
  const newMessages = data.messages.filter(msg => msg.status === 'new').length;
  const repliedMessages = data.messages.filter(msg => msg.status === 'replied').length;
  
  // Calculate messages this week
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const messagesThisWeek = data.messages.filter((msg: any) => 
    new Date(msg.created_at) > oneWeekAgo
  ).length;
  
  // Calculate average response time (simplified - assuming 24 hours if no response)
  const avgResponseTime = newMessages > 0 ? 24 : (totalMessages > 0 ? 2 : 0);
  
  const filteredMessages = filter === 'all' 
    ? data.messages 
    : data.messages.filter(msg => msg.status === 'new');

  if (isLoading && data.messages.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-[#4B2E83]">פניות צור קשר</h2>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EC4899] mx-auto mb-4"></div>
          <p className="text-[#4B2E83]/70">טוען נתונים...</p>
        </div>
      </div>
    );
  }

  if (error && data.messages.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-[#4B2E83]">פניות צור קשר</h2>
        <div className="text-center py-12">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchContact}
            className="px-6 py-3 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded-xl font-medium hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300"
          >
            נסה שוב
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <div>
          <h2 className="text-2xl font-bold text-[#4B2E83]">פניות צור קשר</h2>
          <p className="text-sm text-[#4B2E83]/70 mt-1">ניהול פניות ותמיכה</p>
        </div>
        <RefreshButton
          onClick={fetchContact}
          isFetching={isFetching}
        />
      </div>

      {/* Contact Messages Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-[#EC4899]/5 to-[#4B2E83]/5 p-6 rounded-2xl border border-[#EC4899]/10">
          <h3 className="text-lg font-semibold text-[#4B2E83] mb-2">פניות דחופות</h3>
          <p className="text-3xl font-bold text-[#EC4899]">{newMessages}</p>
          <p className="text-sm text-[#4B2E83]/70 mt-2">פניות ממתינות לתשובה</p>
        </div>
        
        <div className="bg-gradient-to-br from-[#4B2E83]/5 to-[#EC4899]/5 p-6 rounded-2xl border border-[#4B2E83]/10">
          <h3 className="text-lg font-semibold text-[#4B2E83] mb-2">פניות השבוע</h3>
          <p className="text-3xl font-bold text-[#4B2E83]">{messagesThisWeek}</p>
          <p className="text-sm text-[#4B2E83]/70 mt-2">סה"כ פניות שהתקבלו השבוע</p>
        </div>
        
        <div className="bg-gradient-to-br from-[#EC4899]/5 to-[#4B2E83]/5 p-6 rounded-2xl border border-[#EC4899]/10">
          <h3 className="text-lg font-semibold text-[#4B2E83] mb-2">זמן תגובה ממוצע</h3>
          <p className="text-3xl font-bold text-[#EC4899]">{avgResponseTime} שעות</p>
          <p className="text-sm text-[#4B2E83]/70 mt-2">שעות עד לתשובה</p>
        </div>
      </div>

      {/* Contact Messages List */}
      <div className="bg-white p-6 rounded-2xl border border-[#EC4899]/10">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <h3 className="text-lg font-semibold text-[#4B2E83]">רשימת פניות</h3>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setFilter('all')}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all duration-300 ${
                filter === 'all'
                  ? 'bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white'
                  : 'bg-gradient-to-r from-[#4B2E83] to-[#EC4899] text-white hover:from-[#EC4899] hover:to-[#4B2E83]'
              }`}
            >
              כל הפניות ({totalMessages})
            </button>
            <button 
              onClick={() => setFilter('new')}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all duration-300 ${
                filter === 'new'
                  ? 'bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white'
                  : 'bg-gradient-to-r from-[#4B2E83] to-[#EC4899] text-white hover:from-[#EC4899] hover:to-[#4B2E83]'
              }`}
            >
              חדשות ({newMessages})
            </button>
          </div>
        </div>

        {filteredMessages.length > 0 ? (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {filteredMessages.map((message: any) => (
              <div key={message.id} className="bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5 p-4 rounded-xl border border-[#EC4899]/10">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-[#4B2E83]">{message.name}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        message.status === 'new' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : message.status === 'read'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {message.status === 'new' ? 'חדש' : 
                         message.status === 'read' ? 'נקרא' : 'נענה'}
                      </span>
                    </div>
                    <p className="text-sm text-[#4B2E83]/70 mb-1">
                      <strong>נושא:</strong> {message.subject}
                    </p>
                    <p className="text-sm text-[#4B2E83]/70 mb-1">
                      <strong>אימייל:</strong> {message.email}
                    </p>
                    {message.phone && (
                      <p className="text-sm text-[#4B2E83]/70 mb-2">
                        <strong>טלפון:</strong> {message.phone}
                      </p>
                    )}
                    <p className="text-sm text-[#4B2E83]/70 line-clamp-2">
                      {message.message}
                    </p>
                    <p className="text-xs text-[#4B2E83]/50 mt-2">
                      {new Date(message.created_at).toLocaleDateString('he-IL')} - {new Date(message.created_at).toLocaleTimeString('he-IL')}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <button className="px-3 py-1 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded-lg text-xs font-medium hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300">
                      צפה
                    </button>
                    {message.status === 'new' && (
                      <button className="px-3 py-1 bg-gradient-to-r from-[#4B2E83] to-[#EC4899] text-white rounded-lg text-xs font-medium hover:from-[#EC4899] hover:to-[#4B2E83] transition-all duration-300">
                        ענה
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto mb-4 w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-[#4B2E83] mb-2">
              {filter === 'all' ? 'אין פניות כרגע' : 'אין פניות חדשות'}
            </h4>
            <p className="text-[#4B2E83]/70">
              {filter === 'all' 
                ? 'כאשר יתקבלו פניות חדשות, הן יופיעו כאן'
                : 'כל הפניות נענו או נקראו'
              }
            </p>
          </div>
        )}
      </div>

      {/* Contact Management Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button className="p-4 bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5 border border-[#EC4899]/10 rounded-xl hover:from-[#EC4899]/10 hover:to-[#4B2E83]/10 transition-all duration-300">
          <h4 className="font-semibold text-[#4B2E83] mb-2">הגדרות טופס</h4>
          <p className="text-sm text-[#4B2E83]/70">הגדר שדות ושאלות בטופס צור קשר</p>
        </button>
        
        <button className="p-4 bg-gradient-to-r from-[#4B2E83]/5 to-[#EC4899]/5 border border-[#4B2E83]/10 rounded-xl hover:from-[#4B2E83]/10 hover:to-[#EC4899]/10 transition-all duration-300">
          <h4 className="font-semibold text-[#4B2E83] mb-2">תבניות תשובה</h4>
          <p className="text-sm text-[#4B2E83]/70">צור תבניות תשובה מהירות</p>
        </button>
      </div>
    </div>
  );
} 