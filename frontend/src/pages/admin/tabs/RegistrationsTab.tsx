import React, { useState } from 'react';
import { RegistrationEditModal } from '../modals';

interface RegistrationsTabProps {
  data: any;
  session: any;
  fetchClasses: () => void;
}

export default function RegistrationsTab({ data, session, fetchClasses }: RegistrationsTabProps) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [registrationEditModalOpen, setRegistrationEditModalOpen] = useState(false);
  const [editingRegistration, setEditingRegistration] = useState<any>(null);
  const [isSavingRegistration, setIsSavingRegistration] = useState(false);
  const [expandedCancelledGroups, setExpandedCancelledGroups] = useState<Set<string>>(new Set());

  // Define the processed registration type
  type ProcessedRegistration = {
    id: string;
    class_id: string;
    session_id: string;
    user_id?: string;
    first_name?: string;
    last_name?: string;
    email: string;
    phone?: string;
    status: string;
    created_at: string;
    selected_date?: string;
    selected_time?: string;
    class_name: string;
    session_name: string;
    user_name: string;
  };

  // Process registrations data
  const processedRegistrations: ProcessedRegistration[] = (data.registrations || []).map((reg: any) => {
    const classData = data.classes.find((c: any) => c.id === reg.class_id);
    const sessionData = data.sessions.find((s: any) => s.id === reg.session_id);
    
    // Get next session date for this registration
    let nextSessionDate = null;
    if (reg.selected_date) {
      const selectedDate = new Date(reg.selected_date);
      const today = new Date();
      if (selectedDate >= today) {
        nextSessionDate = selectedDate;
      }
    }
    
    return {
      ...reg,
      class_name: classData?.name || 'שיעור לא ידוע',
      session_name: sessionData?.name || 'סשן לא ידוע',
      session_id: reg.session_id,
      next_session_date: nextSessionDate,
      user_name: reg.user ? 
        `${reg.user.first_name || ''} ${reg.user.last_name || ''}`.trim() || reg.user.email :
        `${reg.first_name || ''} ${reg.last_name || ''}`.trim() || reg.email || 'לא ידוע'
    };
  });

  // Group registrations by date and time
  const registrationsByDateTime = processedRegistrations.reduce((acc: any, reg: any) => {
    // Only include active registrations with future dates
    if (reg.status !== 'active' || !reg.selected_date) return acc;
    
    const selectedDate = new Date(reg.selected_date);
    const today = new Date();
    if (selectedDate < today) return acc;
    
    // Create a unique key for date + time + session
    const dateTimeKey = `${reg.selected_date}_${reg.selected_time}_${reg.session_id}`;
    
    if (!acc[dateTimeKey]) {
      const sessionData = data.sessions.find((s: any) => s.id === reg.session_id);
      const classData = data.classes.find((c: any) => c.id === reg.class_id);
      
      acc[dateTimeKey] = {
        date: reg.selected_date,
        time: reg.selected_time,
        session_id: reg.session_id,
        session_name: sessionData?.name || 'קבוצה לא ידועה',
        class_name: classData?.name || 'שיעור לא ידוע',
        registrations: []
      };
    }
    
    acc[dateTimeKey].registrations.push(reg);
    return acc;
  }, {});



  // Convert to array and sort by date and time
  const dateTimeList = Object.values(registrationsByDateTime).sort((a: any, b: any) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    if (dateA.getTime() !== dateB.getTime()) {
      return dateA.getTime() - dateB.getTime();
    }
    // If same date, sort by time
    return a.time.localeCompare(b.time);
  });

  // Filter registrations within each date/time group and add cancelled registrations
  const filteredDateTimeList = dateTimeList.map((dateTimeGroup: any) => {
    const dateTimeKey = `${dateTimeGroup.date}_${dateTimeGroup.time}_${dateTimeGroup.session_id}`;
    
    // Find cancelled registrations for this same date/time/session
    const cancelledForThisGroup = processedRegistrations.filter((reg: any) => 
      reg.status === 'cancelled' && 
      reg.selected_date === dateTimeGroup.date && 
      reg.selected_time === dateTimeGroup.time && 
      reg.session_id === dateTimeGroup.session_id &&
      reg.selected_date && 
      new Date(reg.selected_date) >= new Date()
    );

    return {
      ...dateTimeGroup,
      dateTimeKey,
      hasCancelled: cancelledForThisGroup.length > 0,
      cancelledRegistrations: cancelledForThisGroup,
      registrations: dateTimeGroup.registrations
        .filter((reg: any) => {
          const matchesSearch = reg.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                               reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                               reg.class_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                               reg.session_name.toLowerCase().includes(searchTerm.toLowerCase());
          
          const matchesStatus = filterStatus === 'all' || reg.status === filterStatus;
          
          return matchesSearch && matchesStatus;
        })
        .sort((a: any, b: any) => a.user_name.localeCompare(b.user_name, 'he'))
    };
  }).filter((dateTimeGroup: any) => dateTimeGroup.registrations.length > 0);



  // Statistics - only future active registrations
  const futureActiveRegistrations = processedRegistrations.filter(reg => 
    reg.status === 'active' && reg.selected_date && new Date(reg.selected_date) >= new Date()
  );
  const totalRegistrations = futureActiveRegistrations.length;
  const activeRegistrations = futureActiveRegistrations.length;
  const cancelledRegistrations = processedRegistrations.filter(reg => reg.status === 'cancelled').length;

  // Handle registration edit
  const handleEditRegistration = (registrationData: any) => {
    setEditingRegistration(registrationData);
    setRegistrationEditModalOpen(true);
  };

  // Handle save registration
  const handleSaveRegistration = async (updatedRegistration: any) => {
    if (!session) return;
    
    setIsSavingRegistration(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/registrations/${updatedRegistration.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ status: updatedRegistration.status })
      });

      if (!response.ok) {
        throw new Error('Failed to update registration');
      }

      await fetchClasses();
      setRegistrationEditModalOpen(false);
      setEditingRegistration(null);
    } catch (error) {
      console.error('Error updating registration:', error);
      alert('שגיאה בעדכון ההרשמה');
    } finally {
      setIsSavingRegistration(false);
    }
  };

  // Handle toggle cancelled registrations for a specific group
  const handleToggleCancelled = (dateTimeKey: string) => {
    const newExpanded = new Set(expandedCancelledGroups);
    if (newExpanded.has(dateTimeKey)) {
      newExpanded.delete(dateTimeKey);
    } else {
      newExpanded.add(dateTimeKey);
    }
    setExpandedCancelledGroups(newExpanded);
  };

  return (
    <div className="space-y-3 sm:space-y-6 overflow-x-hidden">
      {/* Statistics */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="bg-white p-2 sm:p-6 rounded-xl border border-[#EC4899]/10 text-center">
          <div className="text-lg sm:text-3xl font-bold text-[#EC4899]">{totalRegistrations}</div>
          <div className="text-xs sm:text-sm text-[#4B2E83]/70">סה"כ הרשמות</div>
        </div>
        <div className="bg-white p-2 sm:p-6 rounded-xl border border-[#4B2E83]/10 text-center">
          <div className="text-lg sm:text-3xl font-bold text-[#4B2E83]">{activeRegistrations}</div>
          <div className="text-xs sm:text-sm text-[#4B2E83]/70">הרשמות פעילות</div>
        </div>
        <div className="bg-white p-2 sm:p-6 rounded-xl border border-[#EC4899]/10 text-center">
          <div className="text-lg sm:text-3xl font-bold text-[#EC4899]">{cancelledRegistrations}</div>
          <div className="text-xs sm:text-sm text-[#4B2E83]/70">הרשמות בוטלו</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-3 sm:p-6 shadow-sm border border-[#EC4899]/10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-[#4B2E83] mb-2">חיפוש הרשמה</label>
            <input
              type="text"
              placeholder="חפש לפי שם, אימייל, שיעור או קבוצה..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#4B2E83] mb-2">סטטוס הרשמה</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none"
            >
              <option value="all">כל ההרשמות</option>
              <option value="active">פעילות בלבד</option>
              <option value="cancelled">בוטלו בלבד</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
              }}
              className="w-full px-4 py-2 bg-gray-100 text-[#4B2E83] rounded-lg font-medium hover:bg-gray-200 transition-all duration-300"
            >
              נקה פילטרים
            </button>
          </div>
        </div>
      </div>

      {/* Registrations by Date and Time */}
      <div className="space-y-6">
        {filteredDateTimeList.map((dateTimeGroup: any) => (
          <div key={`${dateTimeGroup.date}_${dateTimeGroup.time}_${dateTimeGroup.session_id}`} className="bg-white rounded-2xl shadow-sm border border-[#EC4899]/10 overflow-hidden">
            <div className="p-3 sm:p-6 border-b border-[#EC4899]/10 bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#4B2E83] mb-1 sm:mb-2">{dateTimeGroup.session_name}</h2>
                  <p className="text-sm sm:text-base text-[#4B2E83]/70">
                    {new Date(dateTimeGroup.date).toLocaleDateString('he-IL')} • {dateTimeGroup.time} • {dateTimeGroup.registrations.length} רשומים פעילים
                  </p>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] sm:min-w-[800px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 sm:px-4 py-2 sm:py-4 text-right text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 whitespace-nowrap w-20 sm:w-24">שם מלא</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-4 text-right text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 whitespace-nowrap w-24 sm:w-28">אימייל</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-4 text-right text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 whitespace-nowrap w-16 sm:w-20">טלפון</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-4 text-right text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 whitespace-nowrap w-16 sm:w-20">שיעור</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-4 text-right text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 whitespace-nowrap w-16 sm:w-20">תאריך הבא</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-4 text-right text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 whitespace-nowrap w-12 sm:w-16">סטטוס</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-4 text-right text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 whitespace-nowrap w-12 sm:w-16">פעולות</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EC4899]/10">
                  {dateTimeGroup.registrations.map((reg: any) => (
                    <tr 
                      key={reg.id} 
                      className="hover:bg-[#EC4899]/5 transition-colors"
                    >
                      <td className="px-2 sm:px-4 py-2 sm:py-4 border-l border-[#EC4899]/10">
                        <div className="font-semibold text-[#4B2E83] text-xs sm:text-sm truncate">{reg.user_name}</div>
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-4 border-l border-[#EC4899]/10">
                        <div className="text-xs sm:text-sm text-[#4B2E83]/70 truncate">{reg.email}</div>
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-4 border-l border-[#EC4899]/10">
                        <div className="text-xs sm:text-sm text-[#4B2E83]/70">{reg.phone}</div>
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-4 border-l border-[#EC4899]/10">
                        <span className="inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#4B2E83]/10 text-[#4B2E83] truncate">
                          {reg.class_name}
                        </span>
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-4 border-l border-[#EC4899]/10">
                        <div className="text-xs sm:text-sm text-[#4B2E83]/70">
                          {reg.next_session_date ? (
                            new Date(reg.next_session_date).toLocaleDateString('he-IL')
                          ) : (
                            <span className="text-[#4B2E83]/50">לא מוגדר</span>
                          )}
                        </div>
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-4 border-l border-[#EC4899]/10">
                        <span className={`inline-flex items-center gap-1 px-1.5 sm:px-2.5 py-0.5 rounded-full text-xs font-medium ${
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
                      <td className="px-2 sm:px-4 py-2 sm:py-4 border-l border-[#EC4899]/10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditRegistration(reg);
                          }}
                          className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gradient-to-r from-[#4B2E83] to-[#EC4899] text-white rounded-lg font-medium hover:from-[#EC4899] hover:to-[#4B2E83] transition-all duration-300 text-xs"
                        >
                          ערוך
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Show Cancelled Button if there are cancelled registrations */}
            {dateTimeGroup.hasCancelled && (
              <div className="p-3 sm:p-6 border-t border-[#EC4899]/10 bg-gray-50">
                <button
                  onClick={() => handleToggleCancelled(dateTimeGroup.dateTimeKey)}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium transition-colors"
                >
                  <svg 
                    className={`w-4 h-4 transition-transform ${expandedCancelledGroups.has(dateTimeGroup.dateTimeKey) ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  הצג {dateTimeGroup.cancelledRegistrations.length} הרשמות מבוטלות
                </button>
              </div>
            )}

            {/* Cancelled Registrations Table */}
            {dateTimeGroup.hasCancelled && expandedCancelledGroups.has(dateTimeGroup.dateTimeKey) && (
              <div className="border-t border-red-200 bg-red-50">
                <div className="p-3 sm:p-6 border-b border-red-200 bg-red-100">
                  <h3 className="text-lg font-semibold text-red-800">הרשמות מבוטלות</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px] sm:min-w-[800px]">
                    <thead className="bg-red-100">
                      <tr>
                        <th className="px-2 sm:px-4 py-2 sm:py-4 text-right text-xs sm:text-sm font-semibold text-red-800 border-l border-red-200 whitespace-nowrap w-20 sm:w-24">שם מלא</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-4 text-right text-xs sm:text-sm font-semibold text-red-800 border-l border-red-200 whitespace-nowrap w-24 sm:w-28">אימייל</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-4 text-right text-xs sm:text-sm font-semibold text-red-800 border-l border-red-200 whitespace-nowrap w-16 sm:w-20">טלפון</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-4 text-right text-xs sm:text-sm font-semibold text-red-800 border-l border-red-200 whitespace-nowrap w-16 sm:w-20">שיעור</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-4 text-right text-xs sm:text-sm font-semibold text-red-800 border-l border-red-200 whitespace-nowrap w-16 sm:w-20">תאריך מבוטל</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-4 text-right text-xs sm:text-sm font-semibold text-red-800 border-l border-red-200 whitespace-nowrap w-12 sm:w-16">סטטוס</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-4 text-right text-xs sm:text-sm font-semibold text-red-800 border-l border-red-200 whitespace-nowrap w-12 sm:w-16">פעולות</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-red-200">
                      {dateTimeGroup.cancelledRegistrations.map((reg: any) => (
                        <tr 
                          key={reg.id} 
                          className="hover:bg-red-50 transition-colors"
                        >
                          <td className="px-2 sm:px-4 py-2 sm:py-4 border-l border-red-200">
                            <div className="font-semibold text-red-800 text-xs sm:text-sm truncate">{reg.user_name}</div>
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-4 border-l border-red-200">
                            <div className="text-xs sm:text-sm text-red-700 truncate">{reg.email}</div>
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-4 border-l border-red-200">
                            <div className="text-xs sm:text-sm text-red-700">{reg.phone}</div>
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-4 border-l border-red-200">
                            <span className="inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 truncate">
                              {reg.class_name}
                            </span>
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-4 border-l border-red-200">
                            <div className="text-xs sm:text-sm text-red-700">
                              {reg.selected_date ? (
                                new Date(reg.selected_date).toLocaleDateString('he-IL')
                              ) : (
                                <span className="text-red-500">לא מוגדר</span>
                              )}
                            </div>
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-4 border-l border-red-200">
                            <span className="inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              בוטל
                            </span>
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-4 border-l border-red-200">
                                                          <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditRegistration(reg);
                                }}
                                className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-medium hover:from-red-700 hover:to-red-800 transition-all duration-300 text-xs"
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
            )}
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredDateTimeList.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[#4B2E83] mb-2">לא נמצאו הרשמות</h3>
          <p className="text-[#4B2E83]/70">נסה לשנות את פרמטרי החיפוש או הסינון</p>
        </div>
      )}



      {/* Registration Edit Modal */}
      {registrationEditModalOpen && editingRegistration && (
        <RegistrationEditModal
          registrationData={editingRegistration}
          isOpen={registrationEditModalOpen}
          onClose={() => {
            setRegistrationEditModalOpen(false);
            setEditingRegistration(null);
          }}
          onSave={handleSaveRegistration}
          isLoading={isSavingRegistration}
        />
      )}
    </div>
  );
} 