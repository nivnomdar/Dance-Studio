import React from 'react';
import { SessionData } from '../../types/admin';
import { getOccupancyColor, groupRegistrationsByTime } from '../../utils/adminOverviewUtils';
import { DateDisplay, TimeDisplay, StatusBadge } from './AdminOverviewComponents';

interface AdminOverviewTableProps {
  sessions: SessionData[];
  expandedSession: string | null;
  expandedLinkedClasses: string | null;
  onToggleSessionExpansion: (sessionId: string) => void;
  onToggleLinkedClassesExpansion: (sessionId: string) => void;
  onViewClassDetails: (classData: any) => void;
  onEditRegistration: (registration: any) => void;
  displayData: any;
}

export const AdminOverviewTable: React.FC<AdminOverviewTableProps> = ({
  sessions,
  expandedSession,
  expandedLinkedClasses,
  onToggleSessionExpansion,
  onToggleLinkedClassesExpansion,
  onViewClassDetails,
  onEditRegistration,
  displayData
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#EC4899]/10 overflow-hidden">
      <div className="p-3 sm:p-6 border-b border-[#EC4899]/10">
        <h2 className="text-lg sm:text-2xl font-bold text-[#4B2E83] mb-1 sm:mb-2">סקירה כללית לקבוצות הקרובות</h2>
        <p className="text-sm sm:text-base text-[#4B2E83]/70">קבוצות מתוכננות לשבוע הקרוב עם פרטי השיעורים וההרשמות</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] sm:min-w-[1000px]">
          <thead className="bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5">
            <tr>
              <th className="px-2 sm:px-4 py-1.5 sm:py-3 text-right text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 whitespace-nowrap">שם הקבוצה</th>
              <th className="px-2 sm:px-4 py-1.5 sm:py-3 text-center text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 whitespace-nowrap">תאריך ויום</th>
              <th className="px-2 sm:px-4 py-1.5 sm:py-3 text-center text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 whitespace-nowrap">שעות פעילות</th>
              <th className="px-2 sm:px-4 py-1.5 sm:py-3 text-right text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 whitespace-nowrap">הרשמות פעילות</th>
              <th className="px-2 sm:px-4 py-1.5 sm:py-3 text-right text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 whitespace-nowrap">תפוסה</th>
              <th className="px-2 sm:px-4 py-1.5 sm:py-3 text-right text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 whitespace-nowrap">סטטוס</th>
              <th className="px-2 sm:px-4 py-1.5 sm:py-3 text-right text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 whitespace-nowrap">שיעורים מקושרים</th>
              <th className="px-2 sm:px-4 py-1.5 sm:py-3 text-right text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 whitespace-nowrap">פעולות</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EC4899]/10">
            {sessions.map((sessionData: SessionData) => (
              <React.Fragment key={`${sessionData.id}_${sessionData.specificDate}`}>
                <tr className="hover:bg-[#EC4899]/5 transition-colors">
                  <td className="px-2 sm:px-4 py-1.5 sm:py-2.5 border-l border-[#EC4899]/10">
                    <div className="font-semibold text-xs sm:text-sm text-[#4B2E83] leading-tight truncate max-w-32 sm:max-w-40">{sessionData.name}</div>
                  </td>
                  <td className="px-2 sm:px-4 py-1.5 sm:py-2.5 border-l border-[#EC4899]/10 text-center">
                    <div className="text-xs sm:text-sm font-medium text-[#4B2E83] leading-tight">
                      {sessionData.specificDate ? (
                        <DateDisplay specificDate={sessionData.specificDate} />
                      ) : 'לא מוגדר'}
                    </div>
                  </td>
                  <td className="px-2 sm:px-4 py-1.5 sm:py-2.5 border-l border-[#EC4899]/10 text-center">
                    <TimeDisplay startTime={sessionData.start_time} endTime={sessionData.end_time} />
                  </td>
                  <td className="px-2 sm:px-4 py-1.5 sm:py-2.5 border-l border-[#EC4899]/10 text-center">
                    <div className="leading-tight">
                      <div className="font-semibold text-xs sm:text-sm text-[#4B2E83]">
                        {sessionData.activeRegistrationsCount} מתוך {sessionData.max_capacity} הרשמות
                      </div>
                      <div className="text-xs text-[#4B2E83]/70">
                        {sessionData.activeRegistrationsCount === sessionData.max_capacity ? 'מלא' : 'פנוי'}
                      </div>
                    </div>
                  </td>
                  <td className="px-2 sm:px-4 py-1.5 sm:py-2.5 border-l border-[#EC4899]/10 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getOccupancyColor(sessionData.occupancyRate || 0)}`}>
                      {sessionData.occupancyRate?.toFixed(1) || '0.0'}%
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 py-1.5 sm:py-2.5 border-l border-[#EC4899]/10 text-center">
                    <StatusBadge isActive={sessionData.is_active} />
                  </td>
                  <td className="px-2 sm:px-4 py-1.5 sm:py-2.5 border-l border-[#EC4899]/10">
                    <div className="flex flex-wrap gap-1 max-h-12 overflow-hidden">
                      {sessionData.linkedClasses && sessionData.linkedClasses.length > 0 ? (
                        <>
                          {sessionData.linkedClasses.slice(0, 2).map((className: string, index: number) => (
                            <span key={index} className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-[#EC4899]/10 text-[#EC4899] truncate max-w-20 sm:max-w-24">
                              {className}
                            </span>
                          ))}
                          {sessionData.linkedClasses.length > 2 && (
                            <button
                              onClick={() => onToggleLinkedClassesExpansion(`${sessionData.id}_${sessionData.specificDate}`)}
                              className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-[#4B2E83]/10 text-[#4B2E83] hover:bg-[#4B2E83]/20 transition-colors cursor-pointer"
                            >
                              +{sessionData.linkedClasses.length - 2}
                            </button>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-[#4B2E83]/50">אין שיעורים מקושרים</span>
                      )}
                    </div>
                    
                    {/* Expanded Linked Classes */}
                    {expandedLinkedClasses === `${sessionData.id}_${sessionData.specificDate}` && sessionData.linkedClasses && sessionData.linkedClasses.length > 2 && (
                      <div className="mt-2 p-2 bg-white rounded-lg border border-[#EC4899]/20 shadow-sm">
                        <div className="flex flex-wrap gap-1">
                          {sessionData.linkedClasses.slice(2).map((className: string, index: number) => (
                            <span key={index + 2} className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-[#EC4899]/10 text-[#EC4899] truncate max-w-20 sm:max-w-24">
                              {className}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-2 sm:px-4 py-1.5 sm:py-2.5 border-l border-[#EC4899]/10">
                    <button
                      onClick={() => onToggleSessionExpansion(`${sessionData.id}_${sessionData.specificDate}`)}
                      className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gradient-to-r from-[#4B2E83] to-[#EC4899] text-white rounded-lg font-medium hover:from-[#EC4899] hover:to-[#4B2E83] transition-all duration-300 text-xs"
                    >
                      {expandedSession === `${sessionData.id}_${sessionData.specificDate}` ? 'הסתר' : 'פרטים'}
                    </button>
                  </td>
                </tr>
                
                {/* Expanded Details */}
                {expandedSession === `${sessionData.id}_${sessionData.specificDate}` && (
                  <tr>
                    <td colSpan={9} className="px-6 py-4 bg-gray-50">
                      <div className="space-y-6">
                        {/* Linked Classes Section */}
                        <div className="border-2 border-[#EC4899]/20 rounded-xl p-4 bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5">
                          <h3 className="text-lg font-semibold text-[#4B2E83] mb-4">שיעורים מקושרים</h3>
                          <div className="flex flex-wrap gap-2 justify-start">
                            {sessionData.sessionClasses && sessionData.sessionClasses.map((sessionClass: any) => {
                              const classData = displayData.classes?.find((c: any) => c.id === sessionClass.class_id);
                              return (
                                <div key={sessionClass.id} className="bg-white p-1.5 sm:p-2 rounded-lg border border-[#EC4899]/10 w-40 sm:w-48 flex flex-col justify-between">
                                  <div>
                                    <div className="flex justify-between items-start mb-1">
                                      <h4 className="font-semibold text-[#4B2E83] text-xs leading-tight line-clamp-2">{classData?.name || 'שיעור לא ידוע'}</h4>
                                      <span className={`inline-flex items-center gap-1 px-1 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                                        sessionClass.is_trial ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-green-100 text-green-800 border border-green-200'
                                      }`}>
                                        {sessionClass.is_trial ? (
                                          <>
                                            <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
                                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            ניסיון
                                          </>
                                        ) : (
                                          <>
                                            <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
                                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            רגיל
                                          </>
                                        )}
                                      </span>
                                    </div>
                                    <div className="text-xs text-[#4B2E83]/70 space-y-0.5">
                                      <div>מחיר: ₪{sessionClass.price}</div>
                                      {sessionClass.max_uses_per_user && (
                                        <div>מקסימום: {sessionClass.max_uses_per_user}</div>
                                      )}
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => onViewClassDetails(classData)}
                                    className="w-full px-0.5 sm:px-1 py-0.5 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded text-xs font-medium hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300"
                                  >
                                    פרטי שיעור
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Registrations Section */}
                        <div className="border-2 border-[#4B2E83]/20 rounded-xl p-4 bg-gradient-to-r from-[#4B2E83]/5 to-[#EC4899]/5">
                          {(() => {
                            // Since we already have registrations for a specific date, we can group by time
                            const registrationsByTime = groupRegistrationsByTime(sessionData.upcomingActiveRegistrations || []);
                            const timeEntries = Object.values(registrationsByTime);
                            
                            return (
                              <>
                                <h3 className="text-lg font-semibold text-[#4B2E83] mb-4">שיעורים לשבוע הקרוב ({timeEntries.length})</h3>
                                {timeEntries.map((timeEntry: any, timeIndex: number) => (
                                  <div key={timeIndex} className="mb-6 last:mb-0">
                                    <div className="bg-[#EC4899]/10 p-3 rounded-lg mb-3">
                                      <h4 className="font-semibold text-[#4B2E83] text-sm">
                                        {sessionData.specificDate ? new Date(sessionData.specificDate).toLocaleDateString('he-IL') : 'לא מוגדר'} - {timeEntry.time} 
                                        <span className="text-[#4B2E83]/70 font-normal"> ({timeEntry.registrations.length} משתתפים)</span>
                                      </h4>
                                    </div>
                                    <div className="overflow-x-auto">
                                      <table className="w-full text-xs sm:text-sm min-w-[400px] sm:min-w-[600px]">
                                        <thead className="bg-[#EC4899]/5">
                                          <tr>
                                            <th className="px-1 sm:px-2 py-1 sm:py-2 text-right text-[#4B2E83] font-medium whitespace-nowrap w-16 sm:w-20">שם מלא</th>
                                            <th className="px-1 sm:px-2 py-1 sm:py-2 text-right text-[#4B2E83] font-medium whitespace-nowrap w-20 sm:w-24">אימייל</th>
                                            <th className="px-1 sm:px-2 py-1 sm:py-2 text-right text-[#4B2E83] font-medium whitespace-nowrap w-14 sm:w-16">טלפון</th>
                                            <th className="px-1 sm:px-2 py-1 sm:py-2 text-right text-[#4B2E83] font-medium whitespace-nowrap w-10 sm:w-12">סטטוס</th>
                                            <th className="px-1 sm:px-2 py-1 sm:py-2 text-right text-[#4B2E83] font-medium whitespace-nowrap w-10 sm:w-12">פעולות</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#EC4899]/10">
                                          {timeEntry.registrations.map((registration: any) => (
                                            <tr key={registration.id} className="hover:bg-[#EC4899]/5">
                                              <td className="px-1 sm:px-2 py-1 sm:py-2 text-[#4B2E83] text-xs sm:text-sm truncate">
                                                {registration.first_name} {registration.last_name}
                                              </td>
                                              <td className="px-1 sm:px-2 py-1 sm:py-2 text-[#4B2E83] text-xs sm:text-sm truncate">{registration.email}</td>
                                              <td className="px-1 sm:px-2 py-1 sm:py-2 text-[#4B2E83] text-xs sm:text-sm">{registration.phone}</td>
                                              <td className="px-1 sm:px-2 py-1 sm:py-2">
                                                <span className={`inline-flex items-center gap-1 px-1 py-0.5 rounded-full text-xs font-medium ${
                                                  registration.status === 'active' ? 'bg-green-100 text-green-800 border border-green-200' :
                                                  registration.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                                                  'bg-red-50 text-red-700 border border-red-200'
                                                }`}>
                                                  {registration.status === 'active' ? (
                                                    <>
                                                      <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                      </svg>
                                                      פעיל
                                                    </>
                                                  ) : registration.status === 'pending' ? (
                                                    <>
                                                      <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                      </svg>
                                                      ממתין
                                                    </>
                                                  ) : (
                                                    <>
                                                      <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                      </svg>
                                                      בוטל
                                                    </>
                                                  )}
                                                </span>
                                              </td>
                                              <td className="px-1 sm:px-2 py-1 sm:py-2">
                                                <button
                                                  onClick={() => onEditRegistration(registration)}
                                                  className="px-0.5 sm:px-1 py-0.5 bg-gradient-to-r from-[#4B2E83] to-[#EC4899] text-white rounded text-xs hover:from-[#EC4899] hover:to-[#4B2E83] transition-all duration-300"
                                                >
                                                  ערוך
                                                </button>
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                ))}
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}; 