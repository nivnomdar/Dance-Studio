import { useState } from 'react';
import { SessionDetailsModal, RegistrationEditModal, SessionEditModal } from '../../modals';
import { weekdaysToHebrew } from '../../../utils/weekdaysUtils';
import { apiService } from '../../../lib/api';

interface SessionsTabProps {
  data: any;
  session: any;
  fetchClasses: (forceRefresh?: boolean) => void;
}

export default function SessionsTab({ data, session, fetchClasses }: SessionsTabProps) {
  const [sessionDetailsModalOpen, setSessionDetailsModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [selectedRegistrationForEdit, setSelectedRegistrationForEdit] = useState<any>(null);
  const [sessionEditModalOpen, setSessionEditModalOpen] = useState(false);
  const [selectedSessionForEdit, setSelectedSessionForEdit] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('active');

  // Handle view session details
  const handleViewSessionDetails = (session: any) => {
    setSelectedSession(session);
    setSessionDetailsModalOpen(true);
  };

  // Handle edit registration
  const handleEditRegistration = (registration: any) => {
    setSelectedRegistrationForEdit(registration);
  };

  // Handle add new session
  const handleAddNewSession = () => {
    setSelectedSessionForEdit({});
    setSessionEditModalOpen(true);
  };

  // Handle edit session
  const handleEditSession = (sessionData: any) => {
    setSelectedSessionForEdit(sessionData);
    setSessionEditModalOpen(true);
  };

  // Handle save session
  const handleSaveSession = async (sessionData: any) => {
    try {
      let sessionId = sessionData.id;
      
      // Save session first
      if (sessionId) {
        await apiService.sessions.updateSession(sessionId, sessionData);
      } else {
        const newSession = await apiService.sessions.createSession(sessionData);
        sessionId = newSession.id; // Get the new session ID
      }
      
      // Handle linked classes if they exist
      if (sessionData.linkedClasses && sessionData.linkedClasses.length > 0) {
        // Get existing session classes for comparison
        const existingSessionClasses = data.sessionClasses?.filter((sc: any) => sc.session_id === sessionId) || [];
        const existingClassIds = existingSessionClasses.map((sc: any) => sc.class_id);
        
        // Only add classes that don't already exist
        const classesToAdd = sessionData.linkedClasses.filter((lc: any) => !existingClassIds.includes(lc.class_id));
        
        // Add new class links
        for (const linkedClass of classesToAdd) {
          try {
            await apiService.sessions.addClassToSession(
              sessionId,
              linkedClass.class_id,
              linkedClass.price,
              linkedClass.is_trial,
              linkedClass.max_uses_per_user
            );
          } catch (error) {
            console.error('Error adding class to session:', error);
            // Continue with other classes even if one fails
          }
        }
        
        // Note: We don't remove existing classes to avoid foreign key constraint issues
        // Classes can only be removed if there are no registrations referencing them
      }
      
      await fetchClasses(true);
      setSessionEditModalOpen(false);
      setSelectedSessionForEdit(null);
    } catch (error) {
      console.error('Error saving session:', error);
      alert('שגיאה בשמירת הקבוצה');
    }
  };

  // Filter sessions
  const filteredSessions = (data.sessions || [])
    .filter((sessionData: any) => {
      const matchesSearch = sessionData.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           sessionData.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || 
                           (filterStatus === 'active' && sessionData.is_active) ||
                           (filterStatus === 'inactive' && !sessionData.is_active);
      
      return matchesSearch && matchesStatus;
    })
    .sort((a: any, b: any) => a.name.localeCompare(b.name));

  // Key Statistics
  const totalSessions = data.sessions?.length || 0;
  const activeSessions = data.sessions?.filter((s: any) => s.is_active).length || 0;
  const totalRegistrations = data.registrations?.length || 0;
  const activeRegistrations = data.registrations?.filter((r: any) => r.status === 'active').length || 0;

  return (
    <div className="space-y-3 sm:space-y-6 overflow-x-hidden">




      {/* פילטרים מתקדמים */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#EC4899]/10 overflow-hidden">
        <div className="bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5 px-6 py-4 border-b border-[#EC4899]/10">
          <div className="flex items-center gap-3">
            
           
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            {/* חיפוש */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-[#4B2E83] mb-2">
                חיפוש קבוצה
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="חפש לפי שם או תיאור..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none transition-all hover:bg-white hover:shadow-sm"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <svg className="w-5 h-5 text-[#4B2E83]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                </div>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4B2E83]/40 hover:text-[#4B2E83] transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            
            {/* סטטוס */}
            <div>
              <label className="block text-sm font-medium text-[#4B2E83] mb-2">
                סטטוס קבוצה
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none transition-all hover:bg-white hover:shadow-sm"
              >
                <option value="active">פעילות בלבד</option>
                <option value="inactive">לא פעילות</option>
              </select>
            </div>
            
            {/* פעולות */}
            <div>
              <label className="block text-sm font-medium text-[#4B2E83] mb-2 opacity-0 pointer-events-none">
                פעולות
              </label>
              <div className="flex gap-2 h-12 w-full">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterStatus('all');
                  }}
                  className="flex-1 min-w-[120px] px-3 py-2.5 bg-gray-50 text-[#4B2E83] rounded-xl font-medium hover:bg-gray-200 transition-all duration-300 text-sm flex items-center justify-center gap-1.5 border border-gray-200 hover:border-gray-300 h-12 cursor-pointer"
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  <span className="whitespace-nowrap">איפוס</span>
                </button>
                <button 
                  onClick={handleAddNewSession}
                  className="flex-1 min-w-[120px] px-3 py-2.5 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded-xl font-medium hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300 text-sm flex items-center justify-center gap-1.5 shadow-lg hover:shadow-xl h-12 cursor-pointer"
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  <span className="whitespace-nowrap">קבוצה חדשה</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* מחוונים פעילים */}
          {(searchTerm || filterStatus !== 'all') && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-[#4B2E83]/70">פילטרים פעילים:</span>
                {searchTerm && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#EC4899]/10 text-[#EC4899] rounded-full text-xs font-medium">
                    חיפוש: "{searchTerm}"
                    <button
                      onClick={() => setSearchTerm('')}
                      className="ml-1 hover:text-[#EC4899]/80 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filterStatus !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#4B2E83]/10 text-[#4B2E83] rounded-full text-xs font-medium">
                    סטטוס: {filterStatus === 'active' ? 'פעילות' : 'לא פעילות'}
                    <button
                      onClick={() => setFilterStatus('all')}
                      className="ml-1 hover:text-[#4B2E83]/80 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#EC4899]/10 overflow-hidden">
        <div className="p-3 sm:p-6 border-b border-[#EC4899]/10">
          <h2 className="text-lg sm:text-2xl font-bold text-[#4B2E83] mb-1 sm:mb-2">קבוצות במערכת</h2>
          <p className="text-sm sm:text-base text-[#4B2E83]/70">ניהול הקבוצות במערכת עם אפשרויות עריכה</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5">
              <tr>
                <th className="px-2 sm:px-3 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 w-1/5">שם הקבוצה</th>
                <th className="px-2 sm:px-3 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 w-1/8">שעות</th>
                <th className="px-2 sm:px-3 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 w-1/5">ימי שבוע</th>
                <th className="px-2 sm:px-3 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 w-1/8">תפוסה</th>
                <th className="px-2 sm:px-3 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 w-1/8">סטטוס</th>
                <th className="px-2 sm:px-3 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 w-1/5">שיעורים מקושרים</th>
                <th className="px-2 sm:px-3 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 w-1/8">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EC4899]/10">
              {filteredSessions.map((sessionData: any) => {
                // Get classes linked to this session
                const linkedClasses = (data.session_classes || [])
                  .filter((sc: any) => sc.session_id === sessionData.id)
                  .map((sc: any) => {
                    const classData = data.classes?.find((c: any) => c.id === sc.class_id);
                    return classData ? classData.name : 'שיעור לא ידוע';
                  });

                const weekdays = weekdaysToHebrew(sessionData.weekdays || []);

                return (
                  <tr key={sessionData.id} className="hover:bg-[#EC4899]/5 transition-colors">
                    <td className="px-2 sm:px-3 py-2 sm:py-3 border-l border-[#EC4899]/10">
                      <div className="font-semibold text-xs sm:text-sm text-[#4B2E83] truncate">
                        {sessionData.name}
                      </div>
                    </td>
                    <td className="px-2 sm:px-3 py-2 sm:py-3 border-l border-[#EC4899]/10 text-center">
                      <div className="text-xs sm:text-sm text-[#EC4899] font-medium">
                        {sessionData.start_time && sessionData.end_time 
                          ? `${sessionData.start_time.substring(0, 5)} - ${sessionData.end_time.substring(0, 5)}`
                          : 'לא מוגדר'
                        }
                      </div>
                    </td>
                    <td className="px-2 sm:px-3 py-2 sm:py-3 border-l border-[#EC4899]/10">
                      <div className="flex flex-wrap gap-1">
                        {weekdays.length > 0 ? (
                          weekdays.slice(0, 2).map((day: string, index: number) => (
                            <span key={index} className="inline-flex items-center px-1 sm:px-2 py-1 rounded-full text-xs font-medium bg-[#4B2E83]/10 text-[#4B2E83]">
                              {day}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-[#4B2E83]/50">לא מוגדר</span>
                        )}
                        {weekdays.length > 2 && (
                          <span className="text-xs text-[#4B2E83]/70">+{weekdays.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-2 sm:px-3 py-2 sm:py-3 border-l border-[#EC4899]/10 text-center">
                      <div className="text-xs sm:text-sm font-semibold text-[#4B2E83]">
                        {sessionData.max_capacity || 0}
                      </div>
                    </td>
                    <td className="px-2 sm:px-3 py-2 sm:py-3 border-l border-[#EC4899]/10 text-center">
                      <span className={`inline-flex items-center gap-1 px-1 sm:px-2 py-1 rounded-full text-xs font-medium ${
                        sessionData.is_active 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {sessionData.is_active ? (
                          <>
                            <svg className="w-2 h-2 sm:w-3 sm:h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="hidden sm:inline">פעיל</span>
                            <span className="sm:hidden">✓</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-2 h-2 sm:w-3 sm:h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span className="hidden sm:inline">לא פעיל</span>
                            <span className="sm:hidden">✗</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-2 sm:px-3 py-2 sm:py-3 border-l border-[#EC4899]/10">
                      <div className="space-y-2">
                        {/* שורה ראשונה - כפתור עין קבוע בפינה השמאלית + כמות השיעורים */}
                        <div className="flex items-center gap-3">
                          {/* כפתור עין קבוע בפינה השמאלית */}
                          {linkedClasses.length > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                // Toggle הצגת השיעורים
                                const row = document.getElementById(`classes-row-${sessionData.id}`);
                                if (row) {
                                  const isHidden = row.classList.contains('hidden');
                                  row.classList.toggle('hidden');
                                  
                                  // עדכון האייקון
                                  const icon = document.getElementById(`eye-icon-${sessionData.id}`);
                                  if (icon) {
                                    if (isHidden) {
                                      icon.innerHTML = `<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />`;
                                    } else {
                                      icon.innerHTML = `<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542 7z" />`;
                                    }
                                  }
                                }
                              }}
                              className="text-[#EC4899] hover:text-[#EC4899]/80 hover:bg-[#EC4899]/5 p-1.5 rounded transition-colors flex-shrink-0"
                              title="לחצי להצגה/הסתרה של השיעורים"
                            >
                              <svg id={`eye-icon-${sessionData.id}`} className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542 7z" />
                              </svg>
                            </button>
                          )}
                          
                          {/* כמות השיעורים */}
                          <span className="text-sm font-semibold text-[#4B2E83]">
                            {linkedClasses.length} שיעור{linkedClasses.length !== 1 ? 'ים' : ''}
                          </span>
                        </div>
                        
                        {/* שורה שנייה - רשימת השיעורים (מוסתרת כברירת מחדל) */}
                        {linkedClasses.length > 0 ? (
                          <div id={`classes-row-${sessionData.id}`} className="hidden">
                            <div className="space-y-1">
                              {linkedClasses.map((className: string, index: number) => (
                                <div key={index} className="flex items-center gap-2 text-xs">
                                  <span className="w-4 h-4 bg-[#EC4899]/10 rounded-full flex items-center justify-center text-[#EC4899] font-medium">
                                    {index + 1}
                                  </span>
                                  <span className="text-[#4B2E83] bg-[#EC4899]/5 px-2 py-1 rounded text-xs truncate">
                                    {className}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-[#4B2E83]/50 bg-gray-50 px-2 py-1 rounded text-center">
                            אין שיעורים מקושרים
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-2 sm:px-3 py-2 sm:py-3 border-l border-[#EC4899]/10 text-center">
                      <div className="flex gap-1 justify-center">
                        <button
                          onClick={() => handleViewSessionDetails(sessionData)}
                          className="px-1 sm:px-2 py-1 bg-gradient-to-r from-[#4B2E83] to-[#EC4899] text-white rounded-lg font-medium hover:from-[#EC4899] hover:to-[#4B2E83] transition-all duration-300 text-xs cursor-pointer"
                        >
                          רשומים
                        </button>
                        <button
                          onClick={() => handleEditSession(sessionData)}
                          className="px-1 sm:px-2 py-1 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded-lg font-medium hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300 text-xs cursor-pointer"
                        >
                          ערוך
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* No Results */}
      {filteredSessions.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[#4B2E83] mb-2">לא נמצאו קבוצות</h3>
          <p className="text-[#4B2E83]/70">נסה לשנות את פרמטרי החיפוש או הסינון</p>
        </div>
      )}

      {/* סטטיסטיקות מהירות */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#EC4899]/10 overflow-hidden">
        <div className="bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5 px-6 py-4 border-b border-[#EC4899]/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#4B2E83]">סיכום סטטיסטיקות</h3>
              <p className="text-sm text-[#4B2E83]/70">נתונים כלליים על הקבוצות וההרשמות במערכת</p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-[#4B2E83] to-[#4B2E83]/80 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">סה״כ קבוצות</p>
                  <p className="text-2xl font-bold">{totalSessions}</p>
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-[#EC4899] to-[#EC4899]/80 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">קבוצות פעילות</p>
                  <p className="text-2xl font-bold">{activeSessions}</p>
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">סה״כ הרשמות</p>
                  <p className="text-2xl font-bold">{totalRegistrations}</p>
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">הרשמות פעילות</p>
                  <p className="text-2xl font-bold">{activeRegistrations}</p>
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
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

      {selectedRegistrationForEdit && (
        <RegistrationEditModal
          registrationData={selectedRegistrationForEdit}
          isOpen={!!selectedRegistrationForEdit}
          onClose={() => setSelectedRegistrationForEdit(null)}
          onSave={async (updatedRegistration) => {
            try {
              const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/registrations/${updatedRegistration.id}/status`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({ status: updatedRegistration.status })
              });

              if (response.ok) {
                await fetchClasses(true);
                setSelectedRegistrationForEdit(null);
              } else {
                throw new Error('Failed to update registration');
              }
            } catch (error) {
              console.error('Error updating registration:', error);
              alert('שגיאה בעדכון ההרשמה');
            }
          }}
          isLoading={false}
          isNewRegistration={false}
          classes={data.classes || []}
          sessions={data.sessions || []}
          session_classes={data.session_classes || []}
          profiles={data.profiles || []}
        />
      )}

      {sessionEditModalOpen && (
        <SessionEditModal
          sessionData={selectedSessionForEdit}
          isOpen={sessionEditModalOpen}
          onClose={() => {
            setSessionEditModalOpen(false);
            setSelectedSessionForEdit(null);
          }}
          onSave={handleSaveSession}
          isLoading={false}
          classes={data.classes || []}
          sessionClasses={data.session_classes || []}
        />
      )}
    </div>
  );
} 