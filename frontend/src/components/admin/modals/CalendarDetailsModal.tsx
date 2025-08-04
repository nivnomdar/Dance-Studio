import React, { useState } from 'react';

// Types
interface Registration {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

interface SessionDetails {
  id: string;
  name: string;
  description: string;
  start_time: string;
  end_time: string;
  weekdays: (string | number)[];
  max_capacity: number;
  location: string;
  is_active: boolean;
  linkedClasses: any[];
  activeRegistrationsCount: number;
  occupancyRate: number;
  activeRegistrations: Registration[];
  cancelledRegistrations: Registration[];
  date?: string;
}

interface CalendarDetailsModalProps {
  session: SessionDetails | null;
  isOpen: boolean;
  onClose: () => void;
}

// Fallback for motion components if framer-motion is not available
const motion = {
  div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  button: ({ children, ...props }: any) => <button {...props}>{children}</button>
};

const CalendarDetailsModal: React.FC<CalendarDetailsModalProps> = ({ 
  session, 
  isOpen, 
  onClose 
}) => {
  if (!isOpen || !session) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-[95vw] sm:max-w-3xl max-h-[85vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#4B2E83] to-[#EC4899] p-3 sm:p-4 text-white relative">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold">{session.name}</h2>
                  <div className="flex items-center gap-2 sm:gap-3 text-xs text-white/80 mt-1">
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      {session.start_time && session.end_time 
                        ? `${session.start_time.substring(0, 5)} עד ${session.end_time.substring(0, 5)}`
                        : 'שעות לא מוגדרות'
                      }
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                      </svg>
                      {session.activeRegistrationsCount}/{session.max_capacity} משתתפות
                    </span>
                  </div>
                </div>
              </div>
              {session.description && (
                <p className="text-white/90 text-xs leading-relaxed">{session.description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-xl sm:text-2xl font-light transition-colors duration-200 ml-2 sm:ml-3 hover:bg-white/10 rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center"
            >
              ×
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(85vh-120px)]">
          {/* Registrations List */}
          <div className="p-2 sm:p-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <h3 className="text-sm font-bold text-[#4B2E83] flex items-center gap-2">
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
                רשימת משתתפות
              </h3>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                
                <div className="flex gap-1 sm:gap-2">
                  <span className="inline-flex items-center px-1 sm:px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    פעיל: {session.activeRegistrations.length}
                  </span>
                  <span className="inline-flex items-center px-1 sm:px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">
                    בוטל: {session.cancelledRegistrations.length}
                  </span>
                </div>
              </div>
            </div>
            
            {session.activeRegistrations.length === 0 && session.cancelledRegistrations.length === 0 ? (
              <div className="text-center py-4 sm:py-6 bg-gray-50 rounded-xl">
                <div className="mx-auto mb-2 sm:mb-3 w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h4 className="text-sm font-semibold text-[#4B2E83] mb-1">אין הרשמות לסשן זה</h4>
                <p className="text-xs text-[#4B2E83]/70">עדיין לא נרשמו אנשים לסשן</p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {/* Active Registrations */}
                {session.activeRegistrations.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="bg-green-50 px-2 sm:px-3 py-1.5 sm:py-2 border-b border-green-200">
                      <h5 className="text-xs font-semibold text-green-800 flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        משתתפות רשומות ({session.activeRegistrations.length})
                      </h5>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[350px] sm:min-w-0">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-1 sm:px-1.5 py-1.5 sm:py-2 text-right text-xs font-semibold text-gray-700 w-5 sm:w-6">מס'</th>
                            <th className="px-1 sm:px-1.5 py-1.5 sm:py-2 text-right text-xs font-semibold text-gray-700 w-12 sm:w-16 sm:w-20">שם מלא</th>
                            <th className="px-1 sm:px-1.5 py-1.5 sm:py-2 text-right text-xs font-semibold text-gray-700 hidden sm:table-cell w-16 sm:w-20 sm:w-24">אימייל</th>
                            <th className="px-1 sm:px-1.5 py-1.5 sm:py-2 text-right text-xs font-semibold text-gray-700 hidden md:table-cell w-10 sm:w-14 sm:w-16">טלפון</th>
                            <th className="px-1 sm:px-1.5 py-1.5 sm:py-2 text-right text-xs font-semibold text-gray-700 w-8 sm:w-10 sm:w-12">סטטוס</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {session.activeRegistrations.map((registration, index) => (
                            <tr key={registration.id} className="hover:bg-gray-50 transition-colors duration-200">
                              <td className="px-1 sm:px-1.5 py-1.5 sm:py-2 text-xs text-gray-900 font-medium">
                                <div className="w-4 h-4 sm:w-4 sm:h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] rounded-full flex items-center justify-center text-white text-xs font-bold">
                                  {index + 1}
                                </div>
                              </td>
                              <td className="px-1 sm:px-1.5 py-1.5 sm:py-2 text-xs font-medium text-gray-900">
                                <div className="flex flex-col">
                                  <span>
                                    {registration.first_name && registration.last_name 
                                      ? `${registration.first_name} ${registration.last_name}`
                                      : registration.first_name || registration.last_name || 'שם לא זמין'
                                    }
                                  </span>
                                  <span className="text-xs text-gray-500 sm:hidden">
                                    {registration.email || 'אימייל לא זמין'}
                                  </span>
                                  <span className="text-xs text-gray-500 sm:hidden">
                                    {registration.phone || 'טלפון לא זמין'}
                                  </span>
                                </div>
                              </td>
                              <td className="px-1 sm:px-1.5 py-1.5 sm:py-2 text-xs text-gray-600 hidden sm:table-cell">
                                {registration.email || 'אימייל לא זמין'}
                              </td>
                              <td className="px-1 sm:px-1.5 py-1.5 sm:py-2 text-xs text-gray-600 hidden md:table-cell">
                                {registration.phone || 'טלפון לא זמין'}
                              </td>
                              <td className="px-1 sm:px-1.5 py-1.5 sm:py-2">
                                <span className={`inline-flex items-center px-1 sm:px-2 py-0.5 rounded-full text-xs font-medium ${
                                  registration.status === 'active' || registration.status === 'confirmed'
                                    ? 'bg-green-100 text-green-800' 
                                    : registration.status === 'pending'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {registration.status === 'active' ? 'פעיל' :
                                   registration.status === 'confirmed' ? 'אושר' : 
                                   registration.status === 'pending' ? 'ממתין' : 
                                   registration.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Cancelled Registrations */}
                {session.cancelledRegistrations.length > 0 && (
                  <div className="bg-white rounded-xl border border-red-200 overflow-hidden shadow-sm">
                    <div className="bg-red-50 px-2 sm:px-3 py-1.5 sm:py-2 border-b border-red-200">
                      <h5 className="text-xs font-semibold text-red-800 flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        רשומים שבוטלו ({session.cancelledRegistrations.length})
                      </h5>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[350px] sm:min-w-0">
                        <thead className="bg-red-50">
                          <tr>
                            <th className="px-1 sm:px-1.5 py-1.5 sm:py-2 text-right text-xs font-semibold text-red-800 w-5 sm:w-6">מס'</th>
                            <th className="px-1 sm:px-1.5 py-1.5 sm:py-2 text-right text-xs font-semibold text-red-800 w-12 sm:w-16 sm:w-20">שם מלא</th>
                            <th className="px-1 sm:px-1.5 py-1.5 sm:py-2 text-right text-xs font-semibold text-red-800 hidden sm:table-cell w-16 sm:w-20 sm:w-24">אימייל</th>
                            <th className="px-1 sm:px-1.5 py-1.5 sm:py-2 text-right text-xs font-semibold text-red-800 hidden md:table-cell w-10 sm:w-14 sm:w-16">טלפון</th>
                            <th className="px-1 sm:px-1.5 py-1.5 sm:py-2 text-right text-xs font-semibold text-red-800 w-8 sm:w-10 sm:w-12">סטטוס</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-red-100">
                          {session.cancelledRegistrations.map((registration, index) => (
                            <tr key={registration.id} className="hover:bg-red-50 transition-colors duration-200">
                              <td className="px-1 sm:px-1.5 py-1.5 sm:py-2 text-xs text-red-800 font-medium">
                                <div className="w-4 h-4 sm:w-4 sm:h-4 sm:w-5 sm:h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                  {index + 1}
                                </div>
                              </td>
                              <td className="px-1 sm:px-1.5 py-1.5 sm:py-2 text-xs font-medium text-red-800">
                                <div className="flex flex-col">
                                  <span>
                                    {registration.first_name && registration.last_name 
                                      ? `${registration.first_name} ${registration.last_name}`
                                      : registration.first_name || registration.last_name || 'שם לא זמין'
                                    }
                                  </span>
                                  <span className="text-xs text-red-500 sm:hidden">
                                    {registration.email || 'אימייל לא זמין'}
                                  </span>
                                  <span className="text-xs text-red-500 sm:hidden">
                                    {registration.phone || 'טלפון לא זמין'}
                                  </span>
                                </div>
                              </td>
                              <td className="px-1 sm:px-1.5 py-1.5 sm:py-2 text-xs text-red-700 hidden sm:table-cell">
                                {registration.email || 'אימייל לא זמין'}
                              </td>
                              <td className="px-1 sm:px-1.5 py-1.5 sm:py-2 text-xs text-red-700 hidden md:table-cell">
                                {registration.phone || 'טלפון לא זמין'}
                              </td>
                              <td className="px-1 sm:px-1.5 py-1.5 sm:py-2">
                                <span className="inline-flex items-center px-1 sm:px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                                  <svg className="w-2 h-2 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                  בוטל
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
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
};

export default CalendarDetailsModal; 