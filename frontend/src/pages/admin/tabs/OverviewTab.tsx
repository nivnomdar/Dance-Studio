import React, { useState } from 'react';
import { ClassDetailsModal, RegistrationEditModal } from '../modals';

interface OverviewTabProps {
  data: any;
  session: any;
  fetchClasses: () => void;
}

// Hebrew weekday names
const HEBREW_WEEKDAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

export default function OverviewTab({ data, session, fetchClasses }: OverviewTabProps) {
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [selectedClassForDetails, setSelectedClassForDetails] = useState<any>(null);
  const [selectedRegistrationForEdit, setSelectedRegistrationForEdit] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Process schedule_sessions data with aggregated information
  const processedSessions = data.sessions?.map((sessionData: any) => {
    // Get linked session_classes for this session
    const sessionClasses = data.session_classes?.filter((sc: any) => sc.session_id === sessionData.id) || [];
    
    // Get registrations for this session
    const sessionRegistrations = data.registrations?.filter((reg: any) => reg.session_id === sessionData.id) || [];
    const activeRegistrations = sessionRegistrations.filter((reg: any) => reg.status === 'active');
    
    // Calculate total expected revenue
    const totalRevenue = sessionClasses.reduce((sum: number, sc: any) => {
      const classRegistrations = activeRegistrations.filter((reg: any) => reg.session_class_id === sc.id);
      return sum + (classRegistrations.length * sc.price);
    }, 0);

    // Calculate occupancy rate
    const occupancyRate = sessionData.max_capacity > 0 ? (activeRegistrations.length / sessionData.max_capacity) * 100 : 0;

    return {
      ...sessionData,
      linkedClassesCount: sessionClasses.length,
      registrationsCount: sessionRegistrations.length,
      activeRegistrationsCount: activeRegistrations.length,
      totalRevenue,
      occupancyRate,
      sessionClasses,
      registrations: sessionRegistrations
    };
  }) || [];

  // Filter sessions
  const filteredSessions = processedSessions
    .filter((sessionData: any) => {
      const matchesSearch = sessionData.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           sessionData.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || 
                           (filterStatus === 'active' && sessionData.is_active) ||
                           (filterStatus === 'inactive' && !sessionData.is_active);
      
      return matchesSearch && matchesStatus;
    })
    .sort((a: any, b: any) => b.activeRegistrationsCount - a.activeRegistrationsCount);

  // Overall statistics
  const totalSessions = processedSessions.length;
  const activeSessions = processedSessions.filter((s: any) => s.is_active).length;
  const totalClasses = data.classes?.length || 0;
  const totalActiveRegistrations = processedSessions.reduce((sum: number, s: any) => sum + s.activeRegistrationsCount, 0);
  const totalExpectedRevenue = processedSessions.reduce((sum: number, s: any) => sum + s.totalRevenue, 0);

  // Format weekdays to Hebrew
  const formatWeekdays = (weekdays: number[]) => {
    return weekdays.map(day => HEBREW_WEEKDAYS[day]).join(', ');
  };

  // Get occupancy rate color
  const getOccupancyColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600 bg-green-100';
    if (rate >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  // Handle class details view
  const handleViewClassDetails = (classData: any) => {
    setSelectedClassForDetails(classData);
  };

  // Handle registration edit
  const handleEditRegistration = (registration: any) => {
    setSelectedRegistrationForEdit(registration);
  };

  return (
    <div className="space-y-6">
      {/* Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-xl border border-[#EC4899]/10 text-center">
          <div className="text-3xl font-bold text-[#EC4899]">{totalSessions}</div>
          <div className="text-sm text-[#4B2E83]/70">סה"כ סשנים</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-[#4B2E83]/10 text-center">
          <div className="text-3xl font-bold text-[#4B2E83]">{totalClasses}</div>
          <div className="text-sm text-[#4B2E83]/70">סה"כ שיעורים</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-[#EC4899]/10 text-center">
          <div className="text-3xl font-bold text-[#EC4899]">{totalActiveRegistrations}</div>
          <div className="text-sm text-[#4B2E83]/70">הרשמות פעילות</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-[#4B2E83]/10 text-center">
          <div className="text-3xl font-bold text-[#4B2E83]">₪{totalExpectedRevenue.toLocaleString()}</div>
          <div className="text-sm text-[#4B2E83]/70">הכנסות צפויות</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-[#EC4899]/10 text-center">
          <div className="text-3xl font-bold text-[#EC4899]">{activeSessions}</div>
          <div className="text-sm text-[#4B2E83]/70">סשנים פעילים</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#EC4899]/10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#4B2E83] mb-2">חיפוש סשן</label>
            <input
              type="text"
              placeholder="חפש לפי שם או תיאור..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#4B2E83] mb-2">סטטוס סשן</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none"
            >
              <option value="all">כל הסשנים</option>
              <option value="active">פעילים בלבד</option>
              <option value="inactive">לא פעילים</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#EC4899]/10 overflow-hidden">
        <div className="p-6 border-b border-[#EC4899]/10">
          <h2 className="text-2xl font-bold text-[#4B2E83] mb-2">סקירה כללית של סשנים</h2>
          <p className="text-[#4B2E83]/70">מידע מפורט על כל הסשנים, השיעורים המקושרים וההרשמות</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5">
              <tr>
                <th className="px-6 py-4 text-right text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10">שם הסשן</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10">ימי פעילות</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10">שעות</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10">תאריכים</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10">קיבולת מקסימלית</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10">שיעורים מקושרים</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10">הרשמות פעילות</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10">אחוז תפוסה</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10">הכנסות צפויות</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EC4899]/10">
              {filteredSessions.map((sessionData: any) => (
                <React.Fragment key={sessionData.id}>
                  <tr className="hover:bg-[#EC4899]/5 transition-colors">
                    <td className="px-6 py-4 border-l border-[#EC4899]/10">
                      <div>
                        <div className="font-semibold text-[#4B2E83]">{sessionData.name}</div>
                        <div className="text-sm text-[#4B2E83]/70">{sessionData.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 border-l border-[#EC4899]/10">
                      <span className="text-sm text-[#4B2E83]">
                        {formatWeekdays(sessionData.weekdays)}
                      </span>
                    </td>
                    <td className="px-6 py-4 border-l border-[#EC4899]/10">
                      <span className="text-sm text-[#4B2E83]">
                        {sessionData.start_time?.substring(0, 5)} - {sessionData.end_time?.substring(0, 5)}
                      </span>
                    </td>
                    <td className="px-6 py-4 border-l border-[#EC4899]/10">
                      <div className="text-sm text-[#4B2E83]">
                        <div>{new Date(sessionData.start_date).toLocaleDateString('he-IL')}</div>
                        {sessionData.end_date && (
                          <div className="text-xs text-[#4B2E83]/70">
                            עד {new Date(sessionData.end_date).toLocaleDateString('he-IL')}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 border-l border-[#EC4899]/10 text-center">
                      <span className="font-semibold text-[#4B2E83]">{sessionData.max_capacity}</span>
                    </td>
                    <td className="px-6 py-4 border-l border-[#EC4899]/10 text-center">
                      <span className="font-semibold text-[#EC4899]">{sessionData.linkedClassesCount}</span>
                    </td>
                    <td className="px-6 py-4 border-l border-[#EC4899]/10 text-center">
                      <div>
                        <div className="font-semibold text-[#4B2E83]">{sessionData.activeRegistrationsCount}</div>
                        <div className="text-xs text-[#4B2E83]/70">מתוך {sessionData.registrationsCount}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 border-l border-[#EC4899]/10 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOccupancyColor(sessionData.occupancyRate)}`}>
                        {sessionData.occupancyRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 border-l border-[#EC4899]/10 text-[#EC4899] font-semibold">
                      ₪{sessionData.totalRevenue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 border-l border-[#EC4899]/10">
                      <button
                        onClick={() => setExpandedSession(expandedSession === sessionData.id ? null : sessionData.id)}
                        className="px-3 py-1 bg-gradient-to-r from-[#4B2E83] to-[#EC4899] text-white rounded-lg font-medium hover:from-[#EC4899] hover:to-[#4B2E83] transition-all duration-300 text-xs"
                      >
                        {expandedSession === sessionData.id ? 'הסתר פרטים' : 'הצג פרטים'}
                      </button>
                    </td>
                  </tr>
                  
                  {/* Expanded Details */}
                  {expandedSession === sessionData.id && (
                    <tr>
                      <td colSpan={10} className="px-6 py-4 bg-gray-50">
                        <div className="space-y-6">
                                                     {/* Linked Classes Section */}
                           <div>
                             <h3 className="text-lg font-semibold text-[#4B2E83] mb-4">שיעורים מקושרים</h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                               {sessionData.sessionClasses.map((sessionClass: any) => {
                                 const classData = data.classes?.find((c: any) => c.id === sessionClass.class_id);
                                 return (
                                   <div key={sessionClass.id} className="bg-white p-3 rounded-lg border border-[#EC4899]/10 h-32 flex flex-col justify-between">
                                     <div>
                                       <div className="flex justify-between items-start mb-2">
                                         <h4 className="font-semibold text-[#4B2E83] text-sm leading-tight line-clamp-2">{classData?.name || 'שיעור לא ידוע'}</h4>
                                         <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                                           sessionClass.is_trial ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                                         }`}>
                                           {sessionClass.is_trial ? 'ניסיון' : 'רגיל'}
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
                                       onClick={() => handleViewClassDetails(classData)}
                                       className="w-full px-2 py-1 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded text-xs font-medium hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300"
                                     >
                                       פרטי שיעור
                                     </button>
                                   </div>
                                 );
                               })}
                             </div>
                           </div>

                           {/* Registrations Section */}
                           <div>
                             <h3 className="text-lg font-semibold text-[#4B2E83] mb-4">הרשמות ({sessionData.registrations.length})</h3>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead className="bg-[#EC4899]/5">
                                  <tr>
                                    <th className="px-4 py-2 text-right text-[#4B2E83] font-medium">שם מלא</th>
                                    <th className="px-4 py-2 text-right text-[#4B2E83] font-medium">אימייל</th>
                                    <th className="px-4 py-2 text-right text-[#4B2E83] font-medium">טלפון</th>
                                    <th className="px-4 py-2 text-right text-[#4B2E83] font-medium">תאריך נבחר</th>
                                    <th className="px-4 py-2 text-right text-[#4B2E83] font-medium">שעה נבחרת</th>
                                    <th className="px-4 py-2 text-right text-[#4B2E83] font-medium">סטטוס</th>
                                    <th className="px-4 py-2 text-right text-[#4B2E83] font-medium">ניסיון</th>
                                    <th className="px-4 py-2 text-right text-[#4B2E83] font-medium">פעולות</th>
                                  </tr>
                                </thead>
                                                                 <tbody className="divide-y divide-[#EC4899]/10">
                                   {sessionData.registrations.map((registration: any) => (
                                    <tr key={registration.id} className="hover:bg-[#EC4899]/5">
                                      <td className="px-4 py-2 text-[#4B2E83]">
                                        {registration.first_name} {registration.last_name}
                                      </td>
                                      <td className="px-4 py-2 text-[#4B2E83]">{registration.email}</td>
                                      <td className="px-4 py-2 text-[#4B2E83]">{registration.phone}</td>
                                      <td className="px-4 py-2 text-[#4B2E83]">
                                        {new Date(registration.selected_date).toLocaleDateString('he-IL')}
                                      </td>
                                      <td className="px-4 py-2 text-[#4B2E83]">{registration.selected_time}</td>
                                      <td className="px-4 py-2">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                          registration.status === 'active' ? 'bg-green-100 text-green-800' :
                                          registration.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                          'bg-red-100 text-red-800'
                                        }`}>
                                          {registration.status === 'active' ? 'פעיל' :
                                           registration.status === 'pending' ? 'ממתין' : 'בוטל'}
                                        </span>
                                      </td>
                                      <td className="px-4 py-2 text-[#4B2E83]">{registration.experience || '-'}</td>
                                      <td className="px-4 py-2">
                                        <button
                                          onClick={() => handleEditRegistration(registration)}
                                          className="px-2 py-1 bg-gradient-to-r from-[#4B2E83] to-[#EC4899] text-white rounded text-xs hover:from-[#EC4899] hover:to-[#4B2E83] transition-all duration-300"
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

      {/* No Results */}
      {filteredSessions.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[#4B2E83] mb-2">לא נמצאו סשנים</h3>
          <p className="text-[#4B2E83]/70">נסה לשנות את פרמטרי החיפוש או הסינון</p>
        </div>
      )}

      {/* Modals */}
      {selectedClassForDetails && (
        <ClassDetailsModal
          classData={selectedClassForDetails}
          isOpen={!!selectedClassForDetails}
          onClose={() => setSelectedClassForDetails(null)}
        />
      )}

      {selectedRegistrationForEdit && (
        <RegistrationEditModal
          registrationData={selectedRegistrationForEdit}
          isOpen={!!selectedRegistrationForEdit}
          onClose={() => setSelectedRegistrationForEdit(null)}
          onSave={async (updatedRegistration) => {
            // Handle registration update
            try {
              const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/registrations/${updatedRegistration.id}/status`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ status: updatedRegistration.status })
              });

              if (response.ok) {
                await fetchClasses();
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
        />
      )}
    </div>
  );
} 