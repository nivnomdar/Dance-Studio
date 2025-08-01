import React, { useState } from 'react';
import { SessionDetailsModal, RegistrationEditModal, SessionEditModal } from '../modals';
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
  const [filterStatus, setFilterStatus] = useState<string>('all');

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
      if (sessionData.id) {
        await apiService.sessions.updateSession(sessionData.id, sessionData);
      } else {
        await apiService.sessions.createSession(sessionData);
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


      {/* Filters */}
      <div className="bg-white rounded-2xl p-3 sm:p-6 shadow-sm border border-[#EC4899]/10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">חיפוש קבוצה</label>
            <input
              type="text"
              placeholder="חפש לפי שם או תיאור..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">סטטוס קבוצה</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none"
            >
              <option value="all">כל הקבוצות</option>
              <option value="active">פעילות בלבד</option>
              <option value="inactive">לא פעילות</option>
            </select>
          </div>
          <div className="flex flex-col sm:flex-row items-end gap-2 sm:col-span-2 lg:col-span-1">
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
              }}
              className="w-full sm:flex-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 text-[#4B2E83] rounded-lg font-medium hover:bg-gray-200 transition-all duration-300 text-xs sm:text-sm"
            >
              נקה פילטרים
            </button>
            <button 
              onClick={handleAddNewSession}
              className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded-lg font-medium hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300 text-xs sm:text-sm"
            >
              הוסיפי קבוצה חדשה
            </button>
          </div>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#EC4899]/10 overflow-hidden">
        <div className="p-3 sm:p-6 border-b border-[#EC4899]/10">
          <h2 className="text-lg sm:text-2xl font-bold text-[#4B2E83] mb-1 sm:mb-2">ניהול קבוצות</h2>
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
                      <div className="flex flex-wrap gap-1">
                        {linkedClasses.length > 0 ? (
                          linkedClasses.slice(0, 1).map((className: string, index: number) => (
                            <span key={index} className="inline-flex items-center px-1 sm:px-2 py-1 rounded-full text-xs font-medium bg-[#EC4899]/10 text-[#EC4899] truncate">
                              {className}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-[#4B2E83]/50">אין שיעורים</span>
                        )}
                        {linkedClasses.length > 1 && (
                          <span className="text-xs text-[#4B2E83]/70">+{linkedClasses.length - 1}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-2 sm:px-3 py-2 sm:py-3 border-l border-[#EC4899]/10 text-center">
                      <div className="flex gap-1 justify-center">
                        <button
                          onClick={() => handleViewSessionDetails(sessionData)}
                          className="px-1 sm:px-2 py-1 bg-gradient-to-r from-[#4B2E83] to-[#EC4899] text-white rounded-lg font-medium hover:from-[#EC4899] hover:to-[#4B2E83] transition-all duration-300 text-xs"
                        >
                          פרטים
                        </button>
                        <button
                          onClick={() => handleEditSession(sessionData)}
                          className="px-1 sm:px-2 py-1 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded-lg font-medium hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300 text-xs"
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