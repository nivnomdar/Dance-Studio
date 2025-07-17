import React from 'react';

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
  const activeRegistrations = sessionRegistrations.filter(reg => reg.status === 'active');
  const cancelledRegistrations = sessionRegistrations.filter(reg => reg.status === 'cancelled');

  // Get weekday names
  const weekdayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  const weekdayNamesEn = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  
  const weekdays = session.weekdays?.map((day: any) => {
    if (typeof day === 'string') {
      const dayLower = day.toLowerCase();
      const dayIndex = weekdayNamesEn.indexOf(dayLower);
      return dayIndex !== -1 ? weekdayNames[dayIndex] : day;
    }
    if (typeof day === 'number') {
      return weekdayNames[day] || `יום ${day}`;
    }
    return `יום ${day}`;
  }) || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-[#4B2E83]">{session.name}</h2>
              <p className="text-[#4B2E83]/70 mt-1">{session.description}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Session Information */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#4B2E83]">
                {session.start_date ? new Date(session.start_date).toLocaleDateString('he-IL') : 'לא מוגדר'}
              </div>
              <div className="text-sm text-[#4B2E83]/70">תאריך מיועד</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#EC4899]">
                {session.start_time && session.end_time 
                  ? `${session.start_time.substring(0, 5)} - ${session.end_time.substring(0, 5)}`
                  : 'לא מוגדר'
                }
              </div>
              <div className="text-sm text-[#4B2E83]/70">שעות</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#4B2E83]">{weekdays.join(', ')}</div>
              <div className="text-sm text-[#4B2E83]/70">ימי שבוע</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#EC4899]">{activeRegistrations.length} / {session.max_capacity}</div>
              <div className="text-sm text-[#4B2E83]/70">הרשמות פעילות</div>
            </div>
          </div>
        </div>

        {/* Registration Statistics */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
              <div className="text-2xl font-bold text-green-600">{activeRegistrations.length}</div>
              <div className="text-sm text-green-700">הרשמות פעילות</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-center">
              <div className="text-2xl font-bold text-red-600">{cancelledRegistrations.length}</div>
              <div className="text-sm text-red-700">הרשמות בוטלו</div>
            </div>
          </div>
        </div>

        {/* Registrations List */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-[#4B2E83] mb-4">פרטי המשתתפים</h3>
          
          {sessionRegistrations.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto mb-4 w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-[#4B2E83] mb-2">אין הרשמות לסשן זה</h4>
              <p className="text-[#4B2E83]/70">עדיין לא נרשמו אנשים לסשן</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5">
                  <tr>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-[#4B2E83]">שם מלא</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-[#4B2E83]">אימייל</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-[#4B2E83]">טלפון</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-[#4B2E83]">תאריך הרשמה</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-[#4B2E83]">ניסיון</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-[#4B2E83]">הערות</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-[#4B2E83]">סטטוס</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EC4899]/10">
                  {sessionRegistrations.map((reg: any) => (
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
                        <span className="text-sm text-[#4B2E83]/70">
                          {reg.experience || 'לא צוין'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-[#4B2E83]/70 max-w-xs truncate block">
                          {reg.notes || 'אין הערות'}
                        </span>
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
          )}
        </div>
      </div>
    </div>
  );
} 