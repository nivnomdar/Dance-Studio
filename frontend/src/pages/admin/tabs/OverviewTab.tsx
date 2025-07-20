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

  // Process schedule_sessions data with aggregated information for upcoming week
  const processedSessions = data.sessions?.map((sessionData: any) => {
    // Get linked session_classes for this session
    const sessionClasses = data.session_classes?.filter((sc: any) => sc.session_id === sessionData.id) || [];
    
    // Get registrations for this session
    const sessionRegistrations = data.registrations?.filter((reg: any) => reg.session_id === sessionData.id) || [];
    const activeRegistrations = sessionRegistrations.filter((reg: any) => reg.status === 'active');
    
    // Filter active registrations for upcoming week only
    const upcomingActiveRegistrations = activeRegistrations.filter((reg: any) => {
      const registrationDate = new Date(reg.selected_date);
      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      return registrationDate >= today && registrationDate <= nextWeek;
    });
    
    // Calculate total expected revenue based on upcoming registrations only
    const totalRevenue = sessionClasses.reduce((sum: number, sc: any) => {
      const classRegistrations = upcomingActiveRegistrations.filter((reg: any) => reg.session_class_id === sc.id);
      return sum + (classRegistrations.length * sc.price);
    }, 0);

    // Calculate occupancy rate based on upcoming registrations only
    const occupancyRate = sessionData.max_capacity > 0 ? (upcomingActiveRegistrations.length / sessionData.max_capacity) * 100 : 0;

    // Get all unique selected dates from upcoming active registrations
    const allSelectedDates = [...new Set(upcomingActiveRegistrations.map((reg: any) => reg.selected_date))].filter(Boolean) as string[];
    
    // Filter dates for upcoming week only
    const upcomingWeekDates = allSelectedDates.filter((date: string) => {
      const sessionDate = new Date(date);
      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      return sessionDate >= today && sessionDate <= nextWeek;
    });
    
    // Get weekday names
    const weekdayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    const weekdayNamesEn = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    
    const weekdays = sessionData.weekdays?.map((day: any) => {
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

    // Get linked classes names
    const linkedClasses = sessionClasses.map((sc: any) => {
      const classData = data.classes?.find((c: any) => c.id === sc.class_id);
      return classData ? classData.name : 'שיעור לא ידוע';
    });

    return {
      ...sessionData,
      linkedClassesCount: sessionClasses.length,
      registrationsCount: sessionRegistrations.length,
      activeRegistrationsCount: upcomingActiveRegistrations.length,
      totalRevenue,
      occupancyRate,
      sessionClasses,
      registrations: sessionRegistrations,
      allSelectedDates,
      upcomingWeekDates,
      weekdays,
      linkedClasses,
      upcomingActiveRegistrations
    };
  }) || [];

  // Filter sessions for upcoming week
  const filteredSessions = processedSessions
    .filter((sessionData: any) => {
      const matchesSearch = sessionData.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           sessionData.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || 
                           (filterStatus === 'active' && sessionData.is_active) ||
                           (filterStatus === 'inactive' && !sessionData.is_active);
      
      // Filter for upcoming week - show sessions with active registrations in the next 7 days
      const hasUpcomingDates = sessionData.upcomingWeekDates.length > 0;
      
      return matchesSearch && matchesStatus && hasUpcomingDates;
    })
    .sort((a: any, b: any) => {
      // Sort by earliest upcoming date first
      const aEarliestDate = a.upcomingWeekDates.length > 0 ? new Date(Math.min(...a.upcomingWeekDates.map((d: string) => new Date(d).getTime()))) : new Date(9999, 11, 31);
      const bEarliestDate = b.upcomingWeekDates.length > 0 ? new Date(Math.min(...b.upcomingWeekDates.map((d: string) => new Date(d).getTime()))) : new Date(9999, 11, 31);
      return aEarliestDate.getTime() - bEarliestDate.getTime();
    });

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
    <div className="space-y-3 sm:space-y-6 overflow-x-hidden">
      {/* Key Statistics */}
      <div className="grid grid-cols-5 gap-2 sm:gap-4">
        <div className="bg-white p-2 sm:p-6 rounded-xl border border-[#EC4899]/10 text-center">
          <div className="text-lg sm:text-3xl font-bold text-[#EC4899]">{totalSessions}</div>
          <div className="text-xs sm:text-sm text-[#4B2E83]/70">סה"כ קבוצות</div>
        </div>
        <div className="bg-white p-2 sm:p-6 rounded-xl border border-[#4B2E83]/10 text-center">
          <div className="text-lg sm:text-3xl font-bold text-[#4B2E83]">{totalClasses}</div>
          <div className="text-xs sm:text-sm text-[#4B2E83]/70">סה"כ שיעורים</div>
        </div>
        <div className="bg-white p-2 sm:p-6 rounded-xl border border-[#EC4899]/10 text-center">
          <div className="text-lg sm:text-3xl font-bold text-[#EC4899]">{totalActiveRegistrations}</div>
          <div className="text-xs sm:text-sm text-[#4B2E83]/70">הרשמות פעילות</div>
        </div>
        <div className="bg-white p-2 sm:p-6 rounded-xl border border-[#4B2E83]/10 text-center">
          <div className="text-lg sm:text-3xl font-bold text-[#4B2E83]">₪{totalExpectedRevenue.toLocaleString()}</div>
          <div className="text-xs sm:text-sm text-[#4B2E83]/70">הכנסות צפויות</div>
        </div>
        <div className="bg-white p-2 sm:p-6 rounded-xl border border-[#EC4899]/10 text-center">
          <div className="text-lg sm:text-3xl font-bold text-[#EC4899]">{activeSessions}</div>
          <div className="text-xs sm:text-sm text-[#4B2E83]/70">קבוצות פעילות</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-3 sm:p-6 shadow-sm border border-[#EC4899]/10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-[#4B2E83] mb-2">חיפוש קבוצה קרובה</label>
            <input
              type="text"
              placeholder="חפש לפי שם או תיאור..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#4B2E83] mb-2">סטטוס קבוצה</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none"
            >
              <option value="all">כל הקבוצות הקרובות</option>
              <option value="active">פעילות בלבד</option>
              <option value="inactive">לא פעילות</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#EC4899]/10 overflow-hidden">
        <div className="p-3 sm:p-6 border-b border-[#EC4899]/10">
          <h2 className="text-lg sm:text-2xl font-bold text-[#4B2E83] mb-1 sm:mb-2">סקירה כללית לקבוצות הקרובות</h2>
          <p className="text-sm sm:text-base text-[#4B2E83]/70">קבוצות מתוכננות לשבוע הקרוב עם פרטי השיעורים וההרשמות</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] sm:min-w-[1500px]">
            <thead className="bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5">
              <tr>
                <th className="px-2 sm:px-4 py-1.5 sm:py-3 text-right text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 whitespace-nowrap">שם הקבוצה</th>
                <th className="px-2 sm:px-4 py-1.5 sm:py-3 text-right text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 whitespace-nowrap">תאריך מיועד</th>
                <th className="px-2 sm:px-4 py-1.5 sm:py-3 text-right text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 whitespace-nowrap">שעות</th>
                <th className="px-2 sm:px-4 py-1.5 sm:py-3 text-right text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 whitespace-nowrap">ימי שבוע</th>
                <th className="px-2 sm:px-4 py-1.5 sm:py-3 text-right text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 whitespace-nowrap">הרשמות פעילות</th>
                <th className="px-2 sm:px-4 py-1.5 sm:py-3 text-right text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 whitespace-nowrap">תפוסה</th>
                <th className="px-2 sm:px-4 py-1.5 sm:py-3 text-right text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 whitespace-nowrap">סטטוס</th>
                <th className="px-2 sm:px-4 py-1.5 sm:py-3 text-right text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 whitespace-nowrap">שיעורים מקושרים</th>
                <th className="px-2 sm:px-4 py-1.5 sm:py-3 text-right text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 whitespace-nowrap">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EC4899]/10">
              {filteredSessions.map((sessionData: any) => (
                <React.Fragment key={sessionData.id}>
                  <tr className="hover:bg-[#EC4899]/5 transition-colors">
                    <td className="px-2 sm:px-4 py-1.5 sm:py-2.5 border-l border-[#EC4899]/10">
                      <div className="font-semibold text-xs sm:text-sm text-[#4B2E83] leading-tight">{sessionData.name}</div>
                    </td>
                    <td className="px-2 sm:px-4 py-1.5 sm:py-2.5 border-l border-[#EC4899]/10">
                      <div className="space-y-1">
                        {sessionData.upcomingWeekDates.length > 0 ? (
                          sessionData.upcomingWeekDates.map((date: string, dateIndex: number) => (
                            <div key={dateIndex} className="text-xs sm:text-sm font-medium text-[#4B2E83] leading-tight">
                              {new Date(date).toLocaleDateString('he-IL')}
                            </div>
                          ))
                        ) : (
                          <span className="text-xs sm:text-sm text-[#4B2E83]/50">לא מוגדר</span>
                        )}
                      </div>
                    </td>
                    <td className="px-2 sm:px-4 py-1.5 sm:py-2.5 border-l border-[#EC4899]/10">
                      <div className="text-xs sm:text-sm text-[#EC4899] font-medium leading-tight">
                        {sessionData.start_time && sessionData.end_time 
                          ? `${sessionData.start_time.substring(0, 5)} - ${sessionData.end_time.substring(0, 5)}`
                          : 'לא מוגדר'
                        }
                      </div>
                    </td>
                    <td className="px-2 sm:px-4 py-1.5 sm:py-2.5 border-l border-[#EC4899]/10">
                      <div className="flex flex-wrap gap-1">
                        {sessionData.weekdays.length > 0 ? (
                          sessionData.weekdays.map((day: string, index: number) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#4B2E83]/10 text-[#4B2E83]">
                              {day}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-[#4B2E83]/50">לא מוגדר</span>
                        )}
                      </div>
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
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getOccupancyColor(sessionData.occupancyRate)}`}>
                        {sessionData.occupancyRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-2 sm:px-4 py-1.5 sm:py-2.5 border-l border-[#EC4899]/10 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        sessionData.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {sessionData.is_active ? 'פעיל' : 'לא פעיל'}
                      </span>
                    </td>
                    <td className="px-2 sm:px-4 py-1.5 sm:py-2.5 border-l border-[#EC4899]/10">
                      <div className="flex flex-wrap gap-1">
                        {sessionData.linkedClasses.length > 0 ? (
                          sessionData.linkedClasses.map((className: string, index: number) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#EC4899]/10 text-[#EC4899]">
                              {className}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-[#4B2E83]/50">אין שיעורים מקושרים</span>
                        )}
                      </div>
                    </td>
                    <td className="px-2 sm:px-4 py-1.5 sm:py-2.5 border-l border-[#EC4899]/10">
                      <button
                        onClick={() => setExpandedSession(expandedSession === sessionData.id ? null : sessionData.id)}
                        className="px-2 sm:px-3 py-1 bg-gradient-to-r from-[#4B2E83] to-[#EC4899] text-white rounded-lg font-medium hover:from-[#EC4899] hover:to-[#4B2E83] transition-all duration-300 text-xs"
                      >
                        {expandedSession === sessionData.id ? 'הסתר' : 'פרטים'}
                      </button>
                    </td>
                  </tr>
                  
                  {/* Expanded Details */}
                  {expandedSession === sessionData.id && (
                    <tr>
                      <td colSpan={9} className="px-6 py-4 bg-gray-50">
                        <div className="space-y-6">
                                                     {/* Linked Classes Section */}
                           <div>
                             <h3 className="text-lg font-semibold text-[#4B2E83] mb-4">שיעורים מקושרים</h3>
                             <div className="flex flex-wrap gap-2 justify-start">
                               {sessionData.sessionClasses.map((sessionClass: any) => {
                                 const classData = data.classes?.find((c: any) => c.id === sessionClass.class_id);
                                 return (
                                   <div key={sessionClass.id} className="bg-white p-2 rounded-lg border border-[#EC4899]/10 w-48 flex flex-col justify-between">
                                     <div>
                                       <div className="flex justify-between items-start mb-1">
                                         <h4 className="font-semibold text-[#4B2E83] text-xs leading-tight line-clamp-2">{classData?.name || 'שיעור לא ידוע'}</h4>
                                         <span className={`inline-flex items-center px-1 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
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
                                       className="w-full px-1 py-0.5 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded text-xs font-medium hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300"
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
                             {(() => {
                               return (
                                 <>
                                   <h3 className="text-lg font-semibold text-[#4B2E83] mb-4">הרשמות לשבוע הקרוב ({sessionData.upcomingActiveRegistrations.length})</h3>
                                   <div className="overflow-x-auto">
                                     <table className="w-full text-xs sm:text-sm min-w-[800px] sm:min-w-[1000px]">
                                       <thead className="bg-[#EC4899]/5">
                                         <tr>
                                           <th className="px-2 sm:px-4 py-1 sm:py-2 text-right text-[#4B2E83] font-medium whitespace-nowrap">שם מלא</th>
                                           <th className="px-2 sm:px-4 py-1 sm:py-2 text-right text-[#4B2E83] font-medium whitespace-nowrap">אימייל</th>
                                           <th className="px-2 sm:px-4 py-1 sm:py-2 text-right text-[#4B2E83] font-medium whitespace-nowrap">טלפון</th>
                                           <th className="px-2 sm:px-4 py-1 sm:py-2 text-right text-[#4B2E83] font-medium whitespace-nowrap">תאריך נבחר</th>
                                           <th className="px-2 sm:px-4 py-1 sm:py-2 text-right text-[#4B2E83] font-medium whitespace-nowrap">שעה נבחרת</th>
                                           <th className="px-2 sm:px-4 py-1 sm:py-2 text-right text-[#4B2E83] font-medium whitespace-nowrap">סטטוס</th>
                                           <th className="px-2 sm:px-4 py-1 sm:py-2 text-right text-[#4B2E83] font-medium whitespace-nowrap">ניסיון</th>
                                           <th className="px-2 sm:px-4 py-1 sm:py-2 text-right text-[#4B2E83] font-medium whitespace-nowrap">פעולות</th>
                                         </tr>
                                       </thead>
                                       <tbody className="divide-y divide-[#EC4899]/10">
                                         {sessionData.upcomingActiveRegistrations.map((registration: any) => (
                                           <tr key={registration.id} className="hover:bg-[#EC4899]/5">
                                             <td className="px-2 sm:px-4 py-1 sm:py-2 text-[#4B2E83] text-xs sm:text-sm">
                                               {registration.first_name} {registration.last_name}
                                             </td>
                                             <td className="px-2 sm:px-4 py-1 sm:py-2 text-[#4B2E83] text-xs sm:text-sm">{registration.email}</td>
                                             <td className="px-2 sm:px-4 py-1 sm:py-2 text-[#4B2E83] text-xs sm:text-sm">{registration.phone}</td>
                                             <td className="px-2 sm:px-4 py-1 sm:py-2 text-[#4B2E83] text-xs sm:text-sm">
                                               {new Date(registration.selected_date).toLocaleDateString('he-IL')}
                                             </td>
                                             <td className="px-2 sm:px-4 py-1 sm:py-2 text-[#4B2E83] text-xs sm:text-sm">{registration.selected_time}</td>
                                             <td className="px-2 sm:px-4 py-1 sm:py-2">
                                               <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                 registration.status === 'active' ? 'bg-green-100 text-green-800' :
                                                 registration.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                 'bg-red-100 text-red-800'
                                               }`}>
                                                 {registration.status === 'active' ? 'פעיל' :
                                                  registration.status === 'pending' ? 'ממתין' : 'בוטל'}
                                               </span>
                                             </td>
                                             <td className="px-2 sm:px-4 py-1 sm:py-2 text-[#4B2E83] text-xs sm:text-sm">{registration.experience || '-'}</td>
                                             <td className="px-2 sm:px-4 py-1 sm:py-2">
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

      {/* No Results */}
      {filteredSessions.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[#4B2E83] mb-2">לא נמצאו קבוצות קרובות</h3>
          <p className="text-[#4B2E83]/70">אין קבוצות מתוכננות לשבוע הקרוב או נסה לשנות את פרמטרי החיפוש</p>
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