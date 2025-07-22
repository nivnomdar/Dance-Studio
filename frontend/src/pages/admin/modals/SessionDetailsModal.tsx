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
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#4B2E83] to-[#EC4899] p-6 text-white">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{session.name}</h2>
              {session.description && (
                <p className="text-white/90 text-sm">{session.description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-3xl font-light transition-colors duration-200 ml-4"
            >
              ×
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(95vh-120px)]">
          {/* Key Metrics */}
          <div className="p-6 bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                <div className="text-2xl font-bold text-[#4B2E83]">
                  {session.start_time && session.end_time 
                    ? `${session.start_time.substring(0, 5)} - ${session.end_time.substring(0, 5)}`
                    : '--:--'
                  }
                </div>
                <div className="text-sm text-[#4B2E83]/70 mt-1">שעות פעילות</div>
              </div>
              
              <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                <div className="text-2xl font-bold text-[#EC4899]">
                  {weekdays.join(', ')}
                </div>
                <div className="text-sm text-[#4B2E83]/70 mt-1">ימי פעילות</div>
              </div>
              
              <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                <div className="text-2xl font-bold text-[#4B2E83]">
                  {activeRegistrations.length} / {session.max_capacity}
                </div>
                <div className="text-sm text-[#4B2E83]/70 mt-1">הרשמות פעילות</div>
              </div>
              
              <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                <div className="text-2xl font-bold text-[#EC4899]">
                  {occupancyRate.toFixed(1)}%
                </div>
                <div className="text-sm text-[#4B2E83]/70 mt-1">תפוסה</div>
              </div>
            </div>
          </div>

          {/* Registration Statistics */}
          <div className="p-6 border-b border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-xl border border-green-200 text-center">
                <div className="text-3xl font-bold text-green-600">{activeRegistrations.length}</div>
                <div className="text-sm text-green-700 font-medium">הרשמות פעילות</div>
              </div>
              <div className="bg-red-50 p-4 rounded-xl border border-red-200 text-center">
                <div className="text-3xl font-bold text-red-600">{cancelledRegistrations.length}</div>
                <div className="text-sm text-red-700 font-medium">הרשמות בוטלו</div>
              </div>
            </div>
          </div>

          {/* Registrations List */}
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[#4B2E83]">רשימת משתתפים</h3>
              <div className="text-sm text-[#4B2E83]/70">
                {activeRegistrations.length} משתתפים (שיעורים עתידיים בלבד)
              </div>
            </div>
            
            {futureRegistrations.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto mb-4 w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-[#4B2E83] mb-2">אין הרשמות לסשן זה</h4>
                <p className="text-[#4B2E83]/70">עדיין לא נרשמו אנשים לסשן</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-[#4B2E83]/5 to-[#EC4899]/5">
                      <tr>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-[#4B2E83]">שם מלא</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-[#4B2E83]">אימייל</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-[#4B2E83]">טלפון</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-[#4B2E83]">תאריך שיעור</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-[#4B2E83]">סטטוס</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {futureRegistrations.map((reg: any) => (
                        <tr key={reg.id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4">
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
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-[#4B2E83]/80">{reg.email}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-[#4B2E83]/80">{reg.phone}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-[#4B2E83]/80">
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Notes Section */}
                {futureRegistrations.some((reg: any) => reg.notes) && (
                  <div className="p-6 border-t border-gray-100">
                    <h4 className="text-lg font-semibold text-[#4B2E83] mb-4">הערות משתתפים</h4>
                    <div className="space-y-3">
                      {futureRegistrations
                        .filter((reg: any) => reg.notes)
                        .map((reg: any) => (
                          <div key={reg.id} className="bg-gray-50 p-4 rounded-lg">
                            <div className="font-medium text-[#4B2E83] mb-1">
                              {reg.user ? 
                                `${reg.user.first_name || ''} ${reg.user.last_name || ''}`.trim() || reg.user.email :
                                `${reg.first_name || ''} ${reg.last_name || ''}`.trim() || reg.email || 'לא ידוע'
                              }
                            </div>
                            <div className="text-sm text-[#4B2E83]/80">{reg.notes}</div>
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