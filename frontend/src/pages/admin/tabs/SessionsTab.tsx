import React, { useState } from 'react';
import { SessionDetailsModal } from '../modals';

interface SessionsTabProps {
  data: any;
  session: any;
  fetchClasses: () => void;
}

export default function SessionsTab({ data, session, fetchClasses }: SessionsTabProps) {
  const [sessionDetailsModalOpen, setSessionDetailsModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);

  // Handle view session details
  const handleViewSessionDetails = (session: any) => {
    setSelectedSession(session);
    setSessionDetailsModalOpen(true);
  };

  return (
    <div className="space-y-3 sm:space-y-6 overflow-x-hidden">
      {/* All Sessions Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#EC4899]/10 overflow-hidden">
        <div className="p-3 sm:p-6 border-b border-[#EC4899]/10">
          <h2 className="text-lg sm:text-2xl font-bold text-[#4B2E83] mb-1 sm:mb-2">כל הקבוצות במערכת</h2>
          <p className="text-sm sm:text-base text-[#4B2E83]/70">סקירה מפורטת של כל הקבוצות הקיימות במערכת</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] sm:min-w-[1200px]">
            <thead className="bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5">
              <tr>
                <th className="px-3 sm:px-6 py-2 sm:py-4 text-right text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 whitespace-nowrap">שם הקבוצה</th>
                <th className="px-3 sm:px-6 py-2 sm:py-4 text-right text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 whitespace-nowrap">תיאור</th>
                <th className="px-3 sm:px-6 py-2 sm:py-4 text-right text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 whitespace-nowrap">תאריך מיועד</th>
                <th className="px-3 sm:px-6 py-2 sm:py-4 text-right text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 whitespace-nowrap">שעות</th>
                <th className="px-3 sm:px-6 py-2 sm:py-4 text-right text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 whitespace-nowrap">ימי שבוע</th>
                <th className="px-3 sm:px-6 py-2 sm:py-4 text-right text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 whitespace-nowrap">הרשמות פעילות</th>
                <th className="px-3 sm:px-6 py-2 sm:py-4 text-right text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 whitespace-nowrap">תפוסה</th>
                <th className="px-3 sm:px-6 py-2 sm:py-4 text-right text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 whitespace-nowrap">סטטוס</th>
                <th className="px-3 sm:px-6 py-2 sm:py-4 text-right text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 whitespace-nowrap">שיעורים מקושרים</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EC4899]/10">
              {(data.sessions || []).map((session: any) => {
                // Get classes linked to this session
                const linkedClasses = (data.session_classes || [])
                  .filter((sc: any) => sc.session_id === session.id)
                  .map((sc: any) => {
                    const classData = data.classes.find((c: any) => c.id === sc.class_id);
                    return classData ? classData.name : 'שיעור לא ידוע';
                  });

                // Get weekday names
                const weekdayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
                const weekdayNamesEn = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                
                const weekdays = session.weekdays?.map((day: any) => {
                  // Handle string format (e.g., "thursday", "Wednesday")
                  if (typeof day === 'string') {
                    const dayLower = day.toLowerCase();
                    const dayIndex = weekdayNamesEn.indexOf(dayLower);
                    return dayIndex !== -1 ? weekdayNames[dayIndex] : day;
                  }
                  // Handle number format (0-6)
                  if (typeof day === 'number') {
                    return weekdayNames[day] || `יום ${day}`;
                  }
                  return `יום ${day}`;
                }) || [];

                return (
                  <tr 
                    key={session.id} 
                    className="hover:bg-[#EC4899]/5 transition-colors cursor-pointer"
                    onClick={() => handleViewSessionDetails(session)}
                  >
                    <td className="px-3 sm:px-6 py-2 sm:py-4 border-l border-[#EC4899]/10">
                      <div className="font-semibold text-xs sm:text-sm text-[#4B2E83]">{session.name}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 border-l border-[#EC4899]/10">
                      <div className="text-xs sm:text-sm text-[#4B2E83]/70 max-w-xs truncate">
                        {session.description || 'אין תיאור'}
                      </div>
                    </td>
                    <td className="px-6 py-4 border-l border-[#EC4899]/10">
                      <div className="space-y-1">
                        {(() => {
                          // Get all active registrations for this session
                          const sessionRegistrations = (data.registrations || []).filter((reg: any) => 
                            reg.session_id === session.id && reg.status === 'active'
                          );
                          
                          // Get all unique selected dates from all registrations
                          const allSelectedDates = [...new Set(sessionRegistrations.map((reg: any) => reg.selected_date))].filter(Boolean) as string[];
                          
                          if (allSelectedDates.length > 0) {
                            return allSelectedDates.map((date: string, dateIndex: number) => (
                              <div key={dateIndex} className="text-sm font-medium text-[#4B2E83]">
                                {new Date(date).toLocaleDateString('he-IL')}
                              </div>
                            ));
                          } else {
                            return <span className="text-sm text-[#4B2E83]/50">לא מוגדר</span>;
                          }
                        })()}
                      </div>
                    </td>
                    <td className="px-6 py-4 border-l border-[#EC4899]/10">
                      <div className="text-sm text-[#EC4899] font-medium">
                        {session.start_time && session.end_time 
                          ? `${session.start_time.substring(0, 5)} - ${session.end_time.substring(0, 5)}`
                          : 'לא מוגדר'
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 border-l border-[#EC4899]/10">
                      <div className="flex flex-wrap gap-1">
                        {weekdays.length > 0 ? (
                          weekdays.map((day: string, index: number) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#4B2E83]/10 text-[#4B2E83]">
                              {day}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-[#4B2E83]/50">לא מוגדר</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 border-l border-[#EC4899]/10">
                      <div className="text-center">
                        {(() => {
                          // Count active registrations for this session
                          const sessionRegistrations = (data.registrations || []).filter((reg: any) => 
                            reg.session_id === session.id && reg.status === 'active'
                          );
                          const activeRegistrations = sessionRegistrations.length;
                          
                          return (
                            <>
                              <div className="font-semibold text-[#4B2E83]">
                                {activeRegistrations} מתוך {session.max_capacity} הרשמות
                              </div>
                              <div className="text-xs text-[#4B2E83]/70">
                                {activeRegistrations === session.max_capacity ? 'מלא' : 'פנוי'}
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </td>

                    <td className="px-6 py-4 border-l border-[#EC4899]/10">
                      <div className="text-center">
                        {(() => {
                          // Count active registrations for this session
                          const sessionRegistrations = (data.registrations || []).filter((reg: any) => 
                            reg.session_id === session.id && reg.status === 'active'
                          );
                          const activeRegistrations = sessionRegistrations.length;
                          const occupancyPercentage = session.max_capacity > 0 ? Math.round((activeRegistrations / session.max_capacity) * 100) : 0;
                          
                          // Determine color based on occupancy percentage
                          let colorClass = '';
                          if (occupancyPercentage >= 80) {
                            colorClass = 'bg-green-100 text-green-800'; // Green for high occupancy (80%+) - good
                          } else if (occupancyPercentage >= 50) {
                            colorClass = 'bg-yellow-100 text-yellow-800'; // Yellow for medium occupancy (50-79%)
                          } else {
                            colorClass = 'bg-red-100 text-red-800'; // Red for low occupancy (<50%) - bad
                          }
                          
                          return (
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}>
                              {occupancyPercentage}%
                            </span>
                          );
                        })()}
                      </div>
                    </td>

                    <td className="px-6 py-4 border-l border-[#EC4899]/10">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        session.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {session.is_active ? 'פעיל' : 'לא פעיל'}
                      </span>
                    </td>
                    <td className="px-6 py-4 border-l border-[#EC4899]/10">
                      <div className="flex flex-wrap gap-1">
                        {linkedClasses.length > 0 ? (
                          linkedClasses.map((className: string, index: number) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#EC4899]/10 text-[#EC4899]">
                              {className}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-[#4B2E83]/50">אין שיעורים מקושרים</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Session Details Modal */}
      {sessionDetailsModalOpen && selectedSession && (
        <SessionDetailsModal
          session={selectedSession}
          isOpen={sessionDetailsModalOpen}
          onClose={() => {
            setSessionDetailsModalOpen(false);
            setSelectedSession(null);
          }}
          registrations={data.registrations || []}
        />
      )}
    </div>
  );
} 