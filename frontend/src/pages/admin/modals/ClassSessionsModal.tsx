import React, { useState } from 'react';

interface ClassSessionsModalProps {
  classData: any;
  isOpen: boolean;
  onClose: () => void;
  sessions: any[];
  sessionClasses: any[];
  registrations: any[];
}

export default function ClassSessionsModal({ classData, isOpen, onClose, sessions, sessionClasses, registrations }: ClassSessionsModalProps) {
  const [activeTab, setActiveTab] = useState<'sessions' | 'registrations'>('sessions');

  if (!isOpen) return null;

  // Get sessions for this class
  const classSessionClasses = sessionClasses.filter(sc => sc.class_id === classData.id);
  const classSessions = sessions.filter(s => 
    classSessionClasses.some(sc => sc.session_id === s.id)
  );

  // Get registrations for this class
  const classRegistrations = registrations.filter(reg => reg.class_id === classData.id);

  // Group registrations by session
  const registrationsBySession = classSessions.map(session => {
    const sessionRegistrations = classRegistrations.filter(reg => reg.session_id === session.id);
    const activeRegistrations = sessionRegistrations.filter(reg => reg.status === 'active');
    const cancelledRegistrations = sessionRegistrations.filter(reg => reg.status === 'cancelled');

    return {
      session,
      registrations: sessionRegistrations,
      activeRegistrations,
      cancelledRegistrations,
      totalRegistrations: sessionRegistrations.length,
      activeCount: activeRegistrations.length,
      cancelledCount: cancelledRegistrations.length
    };
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-[#4B2E83]">סשנים והרשמות - {classData.name}</h2>
              <p className="text-[#4B2E83]/70 mt-1">{classData.description}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('sessions')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'sessions'
                  ? 'bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white'
                  : 'bg-gray-100 text-[#4B2E83] hover:bg-gray-200'
              }`}
            >
              סשנים ({classSessions.length})
            </button>
            <button
              onClick={() => setActiveTab('registrations')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'registrations'
                  ? 'bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white'
                  : 'bg-gray-100 text-[#4B2E83] hover:bg-gray-200'
              }`}
            >
              הרשמות ({classRegistrations.length})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'sessions' && (
            <div className="space-y-6">
              {registrationsBySession.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto mb-4 w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-[#4B2E83] mb-2">אין סשנים לשיעור זה</h3>
                  <p className="text-[#4B2E83]/70">השיעור עדיין לא מקושר לסשנים</p>
                </div>
              ) : (
                registrationsBySession.map(({ session, registrations, activeRegistrations, cancelledRegistrations, totalRegistrations, activeCount, cancelledCount }) => (
                  <div key={session.id} className="bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5 p-6 rounded-xl border border-[#EC4899]/10">
                    {/* Session Header */}
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-2xl font-bold text-[#4B2E83]">{session.name}</h3>
                              {session.start_date && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#4B2E83]/10 text-[#4B2E83]">
                                  {new Date(session.start_date).toLocaleDateString('he-IL')}
                                </span>
                              )}
                              {session.start_time && session.end_time && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#EC4899]/10 text-[#EC4899]">
                                  {session.start_time.substring(0, 5)} - {session.end_time.substring(0, 5)}
                                </span>
                              )}
                            </div>
                            <p className="text-[#4B2E83]/70">{session.description}</p>
                          </div>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            session.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {session.is_active ? 'פעיל' : 'לא פעיל'}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-[#4B2E83]">{session.max_capacity}</div>
                            <div className="text-sm text-[#4B2E83]/70">קיבולת מקסימלית</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-[#4B2E83]">{activeCount + cancelledCount}</div>
                            <div className="text-sm text-[#4B2E83]/70">סה"כ הרשמות</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Registration Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-2xl font-bold text-green-600">{activeCount}</div>
                            <div className="text-sm text-green-700">הרשמות פעילות</div>
                          </div>
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-2xl font-bold text-red-600">{cancelledCount}</div>
                            <div className="text-sm text-red-700">הרשמות בוטלו</div>
                          </div>
                          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Registrations List */}
                    {registrations.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-[#4B2E83] mb-4">פרטי הרשמות</h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-white/50">
                              <tr>
                                <th className="px-4 py-2 text-right text-[#4B2E83] font-medium">שם מלא</th>
                                <th className="px-4 py-2 text-right text-[#4B2E83] font-medium">אימייל</th>
                                <th className="px-4 py-2 text-right text-[#4B2E83] font-medium">טלפון</th>
                                <th className="px-4 py-2 text-right text-[#4B2E83] font-medium">תאריך הרשמה</th>
                                <th className="px-4 py-2 text-right text-[#4B2E83] font-medium">סטטוס</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/20">
                              {registrations.map((reg: any) => (
                                <tr key={reg.id} className="hover:bg-white/20">
                                  <td className="px-4 py-2">
                                    {reg.user ? 
                                      `${reg.user.first_name || ''} ${reg.user.last_name || ''}`.trim() || reg.user.email :
                                      `${reg.first_name || ''} ${reg.last_name || ''}`.trim() || reg.email || 'לא ידוע'
                                    }
                                  </td>
                                  <td className="px-4 py-2">{reg.email}</td>
                                  <td className="px-4 py-2">{reg.phone}</td>
                                  <td className="px-4 py-2">
                                    {new Date(reg.created_at).toLocaleDateString('he-IL')}
                                  </td>
                                  <td className="px-4 py-2">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                      reg.status === 'active' 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                      {reg.status === 'active' ? 'פעיל' : 
                                       reg.status === 'cancelled' ? 'בוטל' : reg.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {registrations.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-[#4B2E83]/70">אין הרשמות לסשן זה</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'registrations' && (
            <div className="space-y-6">
              {classRegistrations.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto mb-4 w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-[#4B2E83] mb-2">אין הרשמות לשיעור זה</h3>
                  <p className="text-[#4B2E83]/70">עדיין לא נרשמו אנשים לשיעור</p>
                </div>
              ) : (
                <div>
                  {/* Registration Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {classRegistrations.filter(reg => reg.status === 'active').length}
                      </div>
                      <div className="text-sm text-green-700">הרשמות פעילות</div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {classRegistrations.filter(reg => reg.status === 'cancelled').length}
                      </div>
                      <div className="text-sm text-red-700">הרשמות בוטלו</div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-center">
                      <div className="text-2xl font-bold text-blue-600">{classRegistrations.length}</div>
                      <div className="text-sm text-blue-700">סה"כ הרשמות</div>
                    </div>
                  </div>

                  {/* All Registrations Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5">
                        <tr>
                          <th className="px-6 py-4 text-right text-sm font-semibold text-[#4B2E83]">שם מלא</th>
                          <th className="px-6 py-4 text-right text-sm font-semibold text-[#4B2E83]">אימייל</th>
                          <th className="px-6 py-4 text-right text-sm font-semibold text-[#4B2E83]">טלפון</th>
                          <th className="px-6 py-4 text-right text-sm font-semibold text-[#4B2E83]">תאריך הרשמה</th>
                          <th className="px-6 py-4 text-right text-sm font-semibold text-[#4B2E83]">סטטוס</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EC4899]/10">
                        {classRegistrations.map((reg: any) => (
                          <tr key={reg.id} className="hover:bg-[#EC4899]/5">
                            <td className="px-6 py-4">
                              {reg.user ? 
                                `${reg.user.first_name || ''} ${reg.user.last_name || ''}`.trim() || reg.user.email :
                                `${reg.first_name || ''} ${reg.last_name || ''}`.trim() || reg.email || 'לא ידוע'
                              }
                            </td>
                            <td className="px-6 py-4">{reg.email}</td>
                            <td className="px-6 py-4">{reg.phone}</td>
                            <td className="px-6 py-4">
                              {new Date(reg.created_at).toLocaleDateString('he-IL')}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                reg.status === 'active' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {reg.status === 'active' ? 'פעיל' : 
                                 reg.status === 'cancelled' ? 'בוטל' : reg.status}
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
  );
} 