import React, { useState } from 'react';
import { RegistrationEditModal } from '../../modals';
import { Pagination } from '../../components';
import { StatusChangeModal } from '../../../components/common';
import { ADMIN_STYLES, TABLE_COLUMNS, getStatusBadgeStyles } from '../../utils';

interface RegistrationsTabProps {
  data: any;
  session: any;
  fetchClasses: (forceRefresh?: boolean) => void;
}

// Extended registration type with additional computed fields
interface ProcessedRegistration {
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
  next_session_date?: Date | null;
  is_future: boolean;
  is_past: boolean;
  used_credit?: boolean;
  credit_type?: string;
}



export default function RegistrationsTab({ data, session, fetchClasses }: RegistrationsTabProps) {
  // State management
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [filterSession, setFilterSession] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'grouped' | 'all' | 'history'>('grouped');
  const [registrationEditModalOpen, setRegistrationEditModalOpen] = useState(false);
  const [editingRegistration, setEditingRegistration] = useState<any>(null);
  const [isSavingRegistration, setIsSavingRegistration] = useState(false);
  const [expandedCancelledGroups, setExpandedCancelledGroups] = useState<Set<string>>(new Set());
  
  // Status change modal state
  const [statusChangeModalOpen, setStatusChangeModalOpen] = useState(false);
  const [statusChangeRegistration, setStatusChangeRegistration] = useState<any>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  
  // Pagination state for history tab
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Helper functions
  const processRegistrationsData = (): ProcessedRegistration[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (data.registrations || []).map((reg: any) => {
      const classData = data.classes.find((c: any) => c.id === reg.class_id);
      const sessionData = data.sessions.find((s: any) => s.id === reg.session_id);
      
      const selectedDate = reg.selected_date ? new Date(reg.selected_date) : null;
      const isFuture = selectedDate && selectedDate >= today;
      const isPast = selectedDate && selectedDate < today;
      
      return {
        ...reg,
        class_name: classData?.name || 'שיעור לא ידוע',
        session_name: sessionData?.name || 'קבוצה לא ידועה',
        session_id: reg.session_id,
        next_session_date: isFuture ? selectedDate : null,
        user_name: reg.user ? 
          `${reg.user.first_name || ''} ${reg.user.last_name || ''}`.trim() || reg.user.email :
          `${reg.first_name || ''} ${reg.last_name || ''}`.trim() || reg.email || 'לא ידוע',
        is_future: isFuture,
        is_past: isPast
      };
    });
  };

  const filterRegistrations = (registrations: ProcessedRegistration[]): ProcessedRegistration[] => {
    return registrations
      .filter(reg => {
        const matchesSearch = reg.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             reg.class_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             reg.session_name.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = filterStatus === 'all' || reg.status === filterStatus;
        const matchesClass = filterClass === 'all' || reg.class_id === filterClass;
        const matchesSession = filterSession === 'all' || reg.session_id === filterSession;
        const matchesDate = !filterDate || reg.selected_date === filterDate;
        
        // Filter by tab
        let matchesTab = true;
        if (activeTab === 'grouped') {
          matchesTab = reg.is_future; // כולל גם פעילים וגם מבוטלים עתידיים
        } else if (activeTab === 'all') {
          matchesTab = reg.is_future;
        } else if (activeTab === 'history') {
          matchesTab = reg.is_past;
        }
        
        return matchesSearch && matchesStatus && matchesClass && matchesSession && matchesDate && matchesTab;
      })
      .sort((a, b) => {
        // Sort by date first, then by time, then by name
        if (a.selected_date && b.selected_date) {
          const dateA = new Date(a.selected_date);
          const dateB = new Date(b.selected_date);
          if (dateA.getTime() !== dateB.getTime()) {
            return dateA.getTime() - dateB.getTime();
          }
        }
        
        if (a.selected_time && b.selected_time) {
          const timeCompare = a.selected_time.localeCompare(b.selected_time);
          if (timeCompare !== 0) return timeCompare;
        }
        
        return a.user_name.localeCompare(b.user_name, 'he');
      });
  };

  const calculateStatistics = (registrations: ProcessedRegistration[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const futureRegistrations = registrations.filter(reg => reg.is_future);
    const pastRegistrations = registrations.filter(reg => reg.is_past);
    const activeRegistrations = registrations.filter(reg => reg.status === 'active');
    const cancelledRegistrations = registrations.filter(reg => reg.status === 'cancelled');

    return {
      totalFuture: futureRegistrations.length,
      totalPast: pastRegistrations.length,
      totalActive: activeRegistrations.length,
      totalCancelled: cancelledRegistrations.length,
      futureActive: futureRegistrations.filter(reg => reg.status === 'active').length
    };
  };

  // Group registrations by date and time (for grouped view)
  const groupRegistrationsByDateTime = (registrations: ProcessedRegistration[]) => {
    return registrations.reduce((acc: any, reg: ProcessedRegistration) => {
      if (!reg.selected_date || !reg.selected_time) return acc;
      
      const dateTimeKey = `${reg.selected_date}_${reg.selected_time}_${reg.session_id}`;
      
      if (!acc[dateTimeKey]) {
        acc[dateTimeKey] = {
          date: reg.selected_date,
          time: reg.selected_time,
          session_id: reg.session_id,
          session_name: reg.session_name,
          class_name: reg.class_name,
          registrations: [],
          cancelledRegistrations: []
        };
      }
      
      if (reg.status === 'cancelled') {
        acc[dateTimeKey].cancelledRegistrations.push(reg);
      } else {
        acc[dateTimeKey].registrations.push(reg);
      }
      
      return acc;
    }, {});
  };

  // Process data
  const processedRegistrations = processRegistrationsData();
  const filteredRegistrations = filterRegistrations(processedRegistrations);
  
  // Pagination for history tab
  const totalItems = filteredRegistrations.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRegistrations = filteredRegistrations.slice(startIndex, endIndex);
  
  // Group registrations for grouped view
  const groupedRegistrations = groupRegistrationsByDateTime(filteredRegistrations);
  const dateTimeList = Object.values(groupedRegistrations).sort((a: any, b: any) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    if (dateA.getTime() !== dateB.getTime()) {
      return dateA.getTime() - dateB.getTime();
    }
    return a.time.localeCompare(b.time);
  });
  const stats = calculateStatistics(processedRegistrations);

  // Event handlers
  const handleEditRegistration = (registrationData: any) => {
    setEditingRegistration(registrationData);
    setRegistrationEditModalOpen(true);
  };

  const handleAddNewRegistration = () => {
    setEditingRegistration({});
    setRegistrationEditModalOpen(true);
  };

  const handleStatusClick = (registration: ProcessedRegistration) => {
    const targetStatus = registration.status === 'active' ? 'cancelled' : 'active';
    setStatusChangeRegistration(registration);
    setNewStatus(targetStatus);
    setStatusChangeModalOpen(true);
  };

  const handleStatusChange = async () => {
    if (!statusChangeRegistration || !session) return;
    
    setIsChangingStatus(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/registrations/${statusChangeRegistration.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ 
          status: newStatus,
          returnCredit: statusChangeRegistration.used_credit && statusChangeRegistration.credit_type
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'שגיאה לא ידועה';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // עדכון מיידי של הנתונים
      await fetchClasses(true); // force refresh
      
      // סגירת המודל
      setStatusChangeModalOpen(false);
      setStatusChangeRegistration(null);
      setNewStatus('');
      
      // הצגת הודעה על הצלחה
      console.log('Status changed successfully');
    } catch (error) {
      console.error('Error changing status:', error);
      const errorMessage = error instanceof Error ? error.message : 'שגיאה לא ידועה';
      alert(`שגיאה: ${errorMessage}`);
    } finally {
      setIsChangingStatus(false);
    }
  };

  const handleSaveRegistration = async (updatedRegistration: any, returnCredit?: boolean) => {
    if (!session) return;
    
    const isNewRegistration = !updatedRegistration.id;
    setIsSavingRegistration(true);
    
    console.log('=== FRONTEND: SAVING REGISTRATION ===');
    console.log('Saving registration:', { isNewRegistration, updatedRegistration, returnCredit, session: !!session });
    console.log('Full registration data:', JSON.stringify(updatedRegistration, null, 2));
    
    try {
      let response;
      
      if (isNewRegistration) {
        // Create new registration
        console.log('=== FRONTEND: CREATING NEW REGISTRATION ===');
        console.log('Creating new registration with data:', updatedRegistration);
        console.log('Session access token:', session.access_token ? 'Present' : 'Missing');
        console.log('API URL:', `${import.meta.env.VITE_API_BASE_URL}/registrations`);
        
        console.log('=== FRONTEND: SENDING REGISTRATION DATA ===');
        console.log('Used credit:', updatedRegistration.used_credit);
        console.log('Credit type:', updatedRegistration.credit_type);
        console.log('User ID:', updatedRegistration.user_id);
        
        response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/registrations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify(updatedRegistration)
        });
        
        console.log('=== FRONTEND: RESPONSE RECEIVED ===');
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Response error text:', errorText);
          console.error('Response error status:', response.status);
        } else {
          const responseData = await response.json();
          console.log('Response success data:', responseData);
        }
      } else {
        // Update existing registration
        console.log('=== FRONTEND: UPDATING EXISTING REGISTRATION ===');
        const updateData = { 
          status: updatedRegistration.status,
          ...(returnCredit !== undefined && { returnCredit })
        };
        console.log('Update data:', updateData);
        
        response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/registrations/${updatedRegistration.id}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify(updateData)
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        
        // Try to parse error message
        let errorMessage = 'שגיאה לא ידועה';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          // If not JSON, use the raw text
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      await fetchClasses(true); // force refresh
      // Don't close the modal immediately - let the success modal handle it
      // setRegistrationEditModalOpen(false);
      // setEditingRegistration(null);
    } catch (error) {
      console.error('=== FRONTEND: ERROR SAVING REGISTRATION ===');
      console.error('Error saving registration:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'שגיאה לא ידועה';
      alert(`שגיאה: ${errorMessage}`);
    } finally {
      setIsSavingRegistration(false);
    }
  };

  const handleToggleCancelled = (dateTimeKey: string) => {
    const newExpanded = new Set(expandedCancelledGroups);
    if (newExpanded.has(dateTimeKey)) {
      newExpanded.delete(dateTimeKey);
    } else {
      newExpanded.add(dateTimeKey);
    }
    setExpandedCancelledGroups(newExpanded);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setFilterClass('all');
    setFilterSession('all');
    setFilterDate('');
    setCurrentPage(1); // Reset to first page when clearing filters
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Reset pagination when changing tabs
  const handleTabChange = (tab: 'grouped' | 'all' | 'history') => {
    setActiveTab(tab);
    setCurrentPage(1); // Reset to first page when changing tabs
  };

  const getStatusBadge = (status: string, registration?: ProcessedRegistration) => {
    const isHistoryTab = activeTab === 'history';
    const statusStyles = getStatusBadgeStyles(status);
    const baseClasses = `inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${isHistoryTab ? '' : 'cursor-pointer hover:shadow-md'} transition-all duration-200`;
    
    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (registration && !isHistoryTab) {
        handleStatusClick(registration);
      }
    };
    
    const StatusElement = isHistoryTab ? 'span' : 'button';
    const statusProps = isHistoryTab ? {} : { onClick: handleClick, title: "לחצי לשינוי סטטוס" };
    
    return (
      <StatusElement
        {...statusProps}
        className={`${baseClasses} ${statusStyles.bg} ${statusStyles.text} ${statusStyles.border} ${!isHistoryTab ? statusStyles.hover : ''}`}
      >
        {status === 'active' && (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )}
        {status === 'cancelled' && (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        )}
        {status === 'active' ? 'פעיל' : status === 'cancelled' ? 'בוטל' : status}
      </StatusElement>
    );
  };

  const renderRegistrationsTable = (registrations: ProcessedRegistration[], showDate = true, showTime = true) => (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[800px]">
        <thead className="bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5">
          <tr>
            <th className="px-2 sm:px-3 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 w-8">#</th>
            <th className={`px-2 sm:px-3 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 ${TABLE_COLUMNS.name.width}`}>
              {TABLE_COLUMNS.name.label}
            </th>
            <th className={`px-2 sm:px-3 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 ${TABLE_COLUMNS.email.width}`}>
              {TABLE_COLUMNS.email.label}
            </th>
            <th className={`px-2 sm:px-3 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 ${TABLE_COLUMNS.phone.width}`}>
              {TABLE_COLUMNS.phone.label}
            </th>
            <th className={`px-2 sm:px-3 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 ${TABLE_COLUMNS.class.width}`}>
              {TABLE_COLUMNS.class.label}
            </th>
            <th className={`px-2 sm:px-3 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 ${TABLE_COLUMNS.session.width}`}>
              {TABLE_COLUMNS.session.label}
            </th>
            {showDate && (
              <th className={`px-2 sm:px-3 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 ${TABLE_COLUMNS.date.width}`}>
                {TABLE_COLUMNS.date.label}
              </th>
            )}
            {showTime && (
              <th className={`px-2 sm:px-3 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 ${TABLE_COLUMNS.time.width}`}>
                {TABLE_COLUMNS.time.label}
              </th>
            )}
            <th className={`px-2 sm:px-3 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-[#4B2E83] border-l border-[#EC4899]/10 ${TABLE_COLUMNS.status.width}`}>
              <div className="flex flex-col items-center">
                <span>{TABLE_COLUMNS.status.label}</span>
                <span className="text-xs text-[#4B2E83]/60 font-normal">ניתן לשינוי</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#EC4899]/10">
          {registrations.map((reg, idx) => (
            <tr 
              key={reg.id} 
              className="hover:bg-[#EC4899]/5 transition-colors"
            >
              <td className="px-2 sm:px-3 py-2 sm:py-3 border-l border-[#EC4899]/10 text-center font-bold text-xs sm:text-sm text-[#4B2E83]">{idx + 1}</td>
              <td className="px-2 sm:px-3 py-2 sm:py-3 border-l border-[#EC4899]/10 text-center">
                <div className="font-semibold text-xs sm:text-sm text-[#4B2E83] truncate" title={reg.user_name}>
                  {reg.user_name}
                </div>
              </td>
              <td className="px-2 sm:px-3 py-2 sm:py-3 border-l border-[#EC4899]/10 text-center">
                <div className="text-xs sm:text-sm text-[#4B2E83]/70 truncate" title={reg.email}>
                  {reg.email}
                </div>
              </td>
              <td className="px-2 sm:px-3 py-2 sm:py-3 border-l border-[#EC4899]/10 text-center">
                <div className="text-xs sm:text-sm text-[#4B2E83]/70">
                  {reg.phone || '-'}
                </div>
              </td>
              <td className="px-2 sm:px-3 py-2 sm:py-3 border-l border-[#EC4899]/10 text-center">
                <div className="font-semibold text-xs sm:text-sm text-[#4B2E83] truncate" title={reg.class_name}>
                  {reg.class_name}
                </div>
              </td>
              <td className="px-2 sm:px-3 py-2 sm:py-3 border-l border-[#EC4899]/10 text-center">
                <div className="flex justify-center">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#EC4899]/10 text-[#EC4899] whitespace-nowrap" title={reg.session_name}>
                    {reg.session_name}
                  </span>
                </div>
              </td>
              {showDate && (
                <td className="px-2 sm:px-3 py-2 sm:py-3 border-l border-[#EC4899]/10 text-center">
                  <div className="text-xs sm:text-sm text-[#4B2E83]/70">
                    {reg.selected_date ? (
                      new Date(reg.selected_date).toLocaleDateString('he-IL')
                    ) : (
                      <span className="text-[#4B2E83]/50">לא מוגדר</span>
                    )}
                  </div>
                </td>
              )}
              {showTime && (
                <td className="px-2 sm:px-3 py-2 sm:py-3 border-l border-[#EC4899]/10 text-center">
                  <div className="text-xs sm:text-sm text-[#4B2E83]/70">
                    {reg.selected_time || '-'}
                  </div>
                </td>
              )}
              <td className="px-2 sm:px-3 py-2 sm:py-3 border-l border-[#EC4899]/10 text-center">
                <div className="flex justify-center">
                  {getStatusBadge(reg.status, reg)}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-3 sm:space-y-6 overflow-x-hidden">


      {/* Tabs */}
      <div className="bg-white rounded-2xl p-3 sm:p-6 shadow-sm border border-[#EC4899]/10">
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => handleTabChange('grouped')}
            className={`${ADMIN_STYLES.tabButton} ${activeTab === 'grouped' ? ADMIN_STYLES.tabButtonActive : ADMIN_STYLES.tabButtonInactive}`}
          >
            הרשמות מקובצות
          </button>
          <button
            onClick={() => handleTabChange('all')}
            className={`${ADMIN_STYLES.tabButton} ${activeTab === 'all' ? ADMIN_STYLES.tabButtonActive : ADMIN_STYLES.tabButtonInactive}`}
          >
            כל ההרשמות העתידיות
          </button>
          <button
            onClick={() => handleTabChange('history')}
            className={`${ADMIN_STYLES.tabButton} ${activeTab === 'history' ? ADMIN_STYLES.tabButtonActive : ADMIN_STYLES.tabButtonInactive}`}
          >
            היסטוריית הרשמות
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-3 sm:p-6 shadow-sm border border-[#EC4899]/10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">חיפוש הרשמה</label>
              <input
                type="text"
                placeholder="חפש לפי שם, אימייל, שיעור או קבוצה..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">סטטוס הרשמה</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none"
              >
                <option value="all">כל ההרשמות</option>
                <option value="active">פעילות בלבד</option>
                <option value="cancelled">בוטלו בלבד</option>
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">שיעור</label>
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none"
              >
                <option value="all">כל השיעורים</option>
                {data.classes?.map((cls: any) => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">קבוצה</label>
              <select
                value={filterSession}
                onChange={(e) => setFilterSession(e.target.value)}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none"
              >
                <option value="all">כל הקבוצות</option>
                {data.sessions?.map((session: any) => (
                  <option key={session.id} value={session.id}>{session.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">תאריך</label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none"
              />
            </div>
            <div className="flex flex-col sm:flex-row items-end gap-2 sm:col-span-2 lg:col-span-1">
              <button
                onClick={handleClearFilters}
                className={`w-full sm:flex-1 ${ADMIN_STYLES.buttonSecondary} text-xs sm:text-sm`}
              >
                נקה פילטרים
              </button>
              <button 
                onClick={handleAddNewRegistration}
                className={`w-full sm:w-auto ${ADMIN_STYLES.button} text-xs sm:text-sm`}
              >
                הוסיפי הרשמה חדשה
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'grouped' && (
        <div className="space-y-6">
          {dateTimeList.map((dateTimeGroup: any) => (
            <div key={`${dateTimeGroup.date}_${dateTimeGroup.time}_${dateTimeGroup.session_id}`} className="bg-white rounded-2xl shadow-sm border border-[#EC4899]/10 overflow-hidden">
              <div className="p-3 sm:p-6 border-b border-[#EC4899]/10 bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-[#4B2E83] mb-1 sm:mb-2">{dateTimeGroup.session_name}</h2>
                    <p className="text-sm sm:text-base text-[#4B2E83]/70">
                      {new Date(dateTimeGroup.date).toLocaleDateString('he-IL')} • {dateTimeGroup.time} • {dateTimeGroup.registrations.length} רשומים פעילים
                      {dateTimeGroup.cancelledRegistrations.length > 0 && (
                        <span className="text-red-600"> • {dateTimeGroup.cancelledRegistrations.length} בוטלו</span>
                      )}
                    </p>
                  </div>
                  {dateTimeGroup.cancelledRegistrations.length > 0 && (
                    <button
                      onClick={() => handleToggleCancelled(`${dateTimeGroup.date}_${dateTimeGroup.time}_${dateTimeGroup.session_id}`)}
                      className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium transition-colors text-sm"
                    >
                      <svg 
                        className={`w-4 h-4 transition-transform ${expandedCancelledGroups.has(`${dateTimeGroup.date}_${dateTimeGroup.time}_${dateTimeGroup.session_id}`) ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      הרשמות מבוטלות ({dateTimeGroup.cancelledRegistrations.length})
                    </button>
                  )}
                </div>
              </div>
              
              {dateTimeGroup.registrations.length > 0 && renderRegistrationsTable(dateTimeGroup.registrations, false, false)}

              {/* Cancelled Registrations Section */}
              {dateTimeGroup.cancelledRegistrations.length > 0 && (
                <div className="border-t border-red-200 bg-red-50">
                  <div className="p-2 sm:p-3 border-b border-red-200 bg-red-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <h3 className="text-sm sm:text-base font-semibold text-red-800">הרשמות מבוטלות</h3>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-200 text-red-800">
                          {dateTimeGroup.cancelledRegistrations.length}
                        </span>
                      </div>
                      <button
                        onClick={() => handleToggleCancelled(`${dateTimeGroup.date}_${dateTimeGroup.time}_${dateTimeGroup.session_id}`)}
                        className="flex items-center gap-1.5 px-2 py-1.5 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg font-medium transition-colors text-xs sm:text-sm"
                      >
                        <svg 
                          className={`w-3 h-3 transition-transform ${expandedCancelledGroups.has(`${dateTimeGroup.date}_${dateTimeGroup.time}_${dateTimeGroup.session_id}`) ? 'rotate-180' : ''}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        {expandedCancelledGroups.has(`${dateTimeGroup.date}_${dateTimeGroup.time}_${dateTimeGroup.session_id}`) ? 'הסתר' : 'הצג'}
                      </button>
                    </div>
                  </div>
                  
                  {expandedCancelledGroups.has(`${dateTimeGroup.date}_${dateTimeGroup.time}_${dateTimeGroup.session_id}`) && (
                    <div className="p-2 sm:p-3">
                      {renderRegistrationsTable(dateTimeGroup.cancelledRegistrations, false, false)}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {(activeTab === 'all' || activeTab === 'history') && (
        <div className="bg-white rounded-2xl shadow-sm border border-[#EC4899]/10 overflow-hidden">
          <div className="p-3 sm:p-6 border-b border-[#EC4899]/10">
            <h2 className="text-lg sm:text-2xl font-bold text-[#4B2E83] mb-1 sm:mb-2">
              {activeTab === 'all' ? 'כל ההרשמות העתידיות' : 'היסטוריית הרשמות'}
            </h2>
            <p className="text-sm sm:text-base text-[#4B2E83]/70">
              {activeTab === 'all' 
                ? 'סקירה כללית של כל ההרשמות לשיעורים עתידיים' 
                : 'היסטוריה של כל ההרשמות לשיעורים שכבר עברו'
              }
            </p>
          </div>
          {renderRegistrationsTable(
            activeTab === 'history' ? paginatedRegistrations : filteredRegistrations, 
            true, 
            true
          )}
          
          {/* Pagination for history tab */}
          {activeTab === 'history' && totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              showItemsPerPage={true}
              onItemsPerPageChange={handleItemsPerPageChange}
              itemsPerPageOptions={[10, 25, 50, 100]}
            />
          )}
        </div>
      )}

      {/* No Results */}
      {((activeTab === 'grouped' && dateTimeList.length === 0) || 
        ((activeTab === 'all' || activeTab === 'history') && filteredRegistrations.length === 0)) && (
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
          isNewRegistration={!editingRegistration.id}
          classes={data.classes || []}
          sessions={data.sessions || []}
          session_classes={data.session_classes || []}
          profiles={data.profiles || []}
        />
      )}

      {/* Status Change Modal */}
      {statusChangeModalOpen && statusChangeRegistration && (
        <StatusChangeModal
          isOpen={statusChangeModalOpen}
          onClose={() => {
            setStatusChangeModalOpen(false);
            setStatusChangeRegistration(null);
            setNewStatus('');
          }}
          onConfirm={handleStatusChange}
          currentStatus={statusChangeRegistration.status}
          newStatus={newStatus}
          registrationInfo={{
            userName: statusChangeRegistration.user_name,
            className: statusChangeRegistration.class_name,
            sessionName: statusChangeRegistration.session_name,
            date: statusChangeRegistration.selected_date ? new Date(statusChangeRegistration.selected_date).toLocaleDateString('he-IL') : 'לא מוגדר',
            time: statusChangeRegistration.selected_time || 'לא מוגדר'
          }}
          isLoading={isChangingStatus}
        />
      )}
    </div>
  );
} 