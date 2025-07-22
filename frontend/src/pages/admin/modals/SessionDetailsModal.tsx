import React from 'react';
import { weekdaysToHebrew } from '../../../utils/weekdaysUtils';

interface SessionDetailsModalProps {
  session: any;
  isOpen: boolean;
  onClose: () => void;
  registrations: any[];
}

export default function SessionDetailsModal({ session, isOpen, onClose, registrations }: SessionDetailsModalProps) {
  if (!isOpen) return null;

  // Get registrations for this session
  const sessionRegistrations = registrations.filter(reg => reg.session_id === session.id);
  
  // Filter for future dates only
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day
  
  const futureRegistrations = sessionRegistrations.filter((reg: any) => {
    if (!reg.selected_date) return false;
    const registrationDate = new Date(reg.selected_date);
    registrationDate.setHours(0, 0, 0, 0);
    return registrationDate >= today;
  });
  
  const activeRegistrations = futureRegistrations.filter(reg => reg.status === 'active');
  const cancelledRegistrations = futureRegistrations.filter(reg => reg.status === 'cancelled');

  // Convert weekdays to Hebrew names
  const weekdays = weekdaysToHebrew(session.weekdays || []);

  const occupancyRate = session.max_capacity > 0 ? (activeRegistrations.length / session.max_capacity) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#4B2E83] to-[#EC4899] p-6 text-white relative">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{session.name}</h2>
                  <div className="flex items-center gap-4 text-sm text-white/80 mt-1">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      {session.start_time && session.end_time 
                        ? `${session.start_time.substring(0, 5)} - ${session.end_time.substring(0, 5)}`
                        : 'שעות לא מוגדרות'
                      }
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      {weekdays.join(', ')}
                    </span>
                  </div>
                </div>
              </div>
              {session.description && (
                <p className="text-white/90 text-sm leading-relaxed">{session.description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-3xl font-light transition-colors duration-200 ml-4 hover:bg-white/10 rounded-full w-10 h-10 flex items-center justify-center"
            >
              ×
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(95vh-140px)]">
          {/* Key Metrics Dashboard */}
          <div className="p-6 bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5 border-b border-gray-100">
            <h3 className="text-lg font-bold text-[#4B2E83] mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              סקירה כללית
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="text-2xl font-bold text-[#4B2E83] mb-1">
                  {activeRegistrations.length}
                </div>
                <div className="text-sm text-[#4B2E83]/70">הרשמות פעילות</div>
                <div className="text-xs text-green-600 font-medium mt-1">
                  {session.max_capacity > 0 ? `${session.max_capacity - activeRegistrations.length} מקומות פנויים` : 'ללא הגבלה'}
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="text-2xl font-bold text-[#EC4899] mb-1">
                  {occupancyRate.toFixed(1)}%
                </div>
                <div className="text-sm text-[#4B2E83]/70">תפוסה</div>
                <div className={`text-xs font-medium mt-1 ${
                  occupancyRate >= 80 ? 'text-green-600' : 
                  occupancyRate >= 50 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {occupancyRate >= 80 ? 'תפוסה גבוהה' : 
                   occupancyRate >= 50 ? 'תפוסה בינונית' : 'תפוסה נמוכה'}
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="text-2xl font-bold text-[#4B2E83] mb-1">
                  {cancelledRegistrations.length}
                </div>
                <div className="text-sm text-[#4B2E83]/70">הרשמות בוטלו</div>
                <div className="text-xs text-red-600 font-medium mt-1">
                  {sessionRegistrations.length > 0 ? `${((cancelledRegistrations.length / sessionRegistrations.length) * 100).toFixed(1)}% מההרשמות` : '0%'}
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="text-2xl font-bold text-[#EC4899] mb-1">
                  {session.max_capacity || '∞'}
                </div>
                <div className="text-sm text-[#4B2E83]/70">תפוסה מקסימלית</div>
                <div className="text-xs text-[#4B2E83]/60 mt-1">
                  {session.location || 'מיקום לא מוגדר'}
                </div>
              </div>
            </div>
          </div>

          {/* Session Details Section */}
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-bold text-[#4B2E83] mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              פרטי הקבוצה
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-[#4B2E83] mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    זמני פעילות
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[#4B2E83]/70">שעת התחלה:</span>
                      <span className="font-medium text-[#4B2E83]">
                        {session.start_time ? session.start_time.substring(0, 5) : 'לא מוגדר'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#4B2E83]/70">שעת סיום:</span>
                      <span className="font-medium text-[#4B2E83]">
                        {session.end_time ? session.end_time.substring(0, 5) : 'לא מוגדר'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#4B2E83]/70">משך שיעור:</span>
                      <span className="font-medium text-[#4B2E83]">
                        {session.start_time && session.end_time ? 
                          `${Math.round((new Date(`2000-01-01T${session.end_time}`).getTime() - new Date(`2000-01-01T${session.start_time}`).getTime()) / (1000 * 60))} דקות` : 
                          'לא מוגדר'
                        }
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-[#4B2E83] mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    ימי פעילות
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {weekdays.length > 0 ? (
                      weekdays.map((day: string, index: number) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#4B2E83]/10 text-[#4B2E83]">
                          {day}
                        </span>
                      ))
                    ) : (
                      <span className="text-[#4B2E83]/50">לא מוגדר</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-[#4B2E83] mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    מיקום ופרטים
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[#4B2E83]/70">מיקום:</span>
                      <span className="font-medium text-[#4B2E83] text-right">
                        {session.location || 'לא מוגדר'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#4B2E83]/70">סטטוס:</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        session.is_active 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {session.is_active ? (
                          <>
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            פעיל
                          </>
                        ) : (
                          <>
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            לא פעיל
                          </>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#4B2E83]/70">תפוסה מקסימלית:</span>
                      <span className="font-medium text-[#4B2E83]">
                        {session.max_capacity || 'ללא הגבלה'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-[#4B2E83] mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                    סטטיסטיקות
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[#4B2E83]/70">סה"כ הרשמות:</span>
                      <span className="font-medium text-[#4B2E83]">{sessionRegistrations.length}</span>
                    </div>
                                         <div className="flex justify-between">
                       <span className="text-[#4B2E83]/70">הרשמות פעילות:</span>
                       <span className="font-medium text-[#4B2E83]">{activeRegistrations.length}</span>
                     </div>
                    <div className="flex justify-between">
                      <span className="text-[#4B2E83]/70">אחוז ביטולים:</span>
                      <span className="font-medium text-[#4B2E83]">
                        {sessionRegistrations.length > 0 ? `${((cancelledRegistrations.length / sessionRegistrations.length) * 100).toFixed(1)}%` : '0%'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Registrations List */}
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-[#4B2E83] flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
                רשימת משתתפים
              </h3>
              <div className="flex items-center gap-4">
              <div className="text-sm text-[#4B2E83]/70">
                  {activeRegistrations.length} משתתפים פעילים
                </div>
                <div className="flex gap-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    פעיל: {activeRegistrations.length}
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700">
                    בוטל: {cancelledRegistrations.length}
                  </span>
                </div>
              </div>
            </div>
            
            {futureRegistrations.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <div className="mx-auto mb-4 w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-[#4B2E83] mb-2">אין הרשמות לסשן זה</h4>
                <p className="text-[#4B2E83]/70">עדיין לא נרשמו אנשים לסשן</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-[#4B2E83]/5 to-[#EC4899]/5">
                      <tr>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-[#4B2E83]">משתתף</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-[#4B2E83]">פרטי קשר</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-[#4B2E83]">תאריך שיעור</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-[#4B2E83]">סטטוס</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-[#4B2E83]">הערות</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {futureRegistrations.map((reg: any) => (
                        <tr key={reg.id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-[#4B2E83] to-[#EC4899] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                {reg.user ? 
                                  `${(reg.user.first_name || '').charAt(0)}${(reg.user.last_name || '').charAt(0)}` :
                                  `${(reg.first_name || '').charAt(0)}${(reg.last_name || '').charAt(0)}`
                                }
                              </div>
                              <div>
                            <div className="font-medium text-[#4B2E83]">
                              {reg.user ? 
                                `${reg.user.first_name || ''} ${reg.user.last_name || ''}`.trim() || reg.user.email :
                                `${reg.first_name || ''} ${reg.last_name || ''}`.trim() || reg.email || 'לא ידוע'
                              }
                            </div>
                            {reg.experience && (
                              <div className="text-xs text-[#4B2E83]/60 mt-1">
                                ניסיון: {reg.experience}
                              </div>
                            )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="text-sm text-[#4B2E83]/80 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                </svg>
                                {reg.email}
                              </div>
                              <div className="text-sm text-[#4B2E83]/80 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                </svg>
                                {reg.phone}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-[#4B2E83]/80 flex items-center gap-1">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                              </svg>
                              {reg.selected_date ? new Date(reg.selected_date).toLocaleDateString('he-IL') : 'לא מוגדר'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                              reg.status === 'active' 
                                ? 'bg-green-100 text-green-800 border border-green-200' 
                                : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                              {reg.status === 'active' ? (
                                <>
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  פעיל
                                </>
                              ) : reg.status === 'cancelled' ? (
                                <>
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                  </svg>
                                  בוטל
                                </>
                              ) : (
                                reg.status
                              )}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {reg.notes ? (
                              <div className="text-sm text-[#4B2E83]/80 max-w-xs truncate" title={reg.notes}>
                                {reg.notes}
                              </div>
                            ) : (
                              <span className="text-[#4B2E83]/40 text-sm">אין הערות</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Notes Section */}
                {futureRegistrations.some((reg: any) => reg.notes) && (
                  <div className="p-6 border-t border-gray-100 bg-gray-50">
                    <h4 className="text-lg font-semibold text-[#4B2E83] mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      הערות משתתפים
                    </h4>
                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {futureRegistrations
                        .filter((reg: any) => reg.notes)
                        .map((reg: any) => (
                          <div key={reg.id} className="bg-white p-4 rounded-lg border border-gray-200">
                            <div className="font-medium text-[#4B2E83] mb-2 flex items-center gap-2">
                              <div className="w-6 h-6 bg-gradient-to-r from-[#4B2E83] to-[#EC4899] rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                {reg.user ? 
                                  `${(reg.user.first_name || '').charAt(0)}${(reg.user.last_name || '').charAt(0)}` :
                                  `${(reg.first_name || '').charAt(0)}${(reg.last_name || '').charAt(0)}`
                                }
                              </div>
                              {reg.user ? 
                                `${reg.user.first_name || ''} ${reg.user.last_name || ''}`.trim() || reg.user.email :
                                `${reg.first_name || ''} ${reg.last_name || ''}`.trim() || reg.email || 'לא ידוע'
                              }
                            </div>
                            <div className="text-sm text-[#4B2E83]/80 leading-relaxed">{reg.notes}</div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 