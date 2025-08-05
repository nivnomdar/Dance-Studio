import { useState, useMemo, useCallback } from 'react';
import { useAdminData } from '../contexts/AdminDataContext';
import { useAuth } from '../contexts/AuthContext';
import { SessionData } from '../types/admin';
import { 
  processSessions, 
  filterAndSortSessions, 
  calculateSummaryStats, 
  hasCompleteData, 
  createFallbackData 
} from '../utils/adminOverviewUtils';

export const useAdminOverview = () => {
  const { data, isLoading, error, fetchClasses, isFetching, resetRateLimit } = useAdminData();
  const { session } = useAuth();
  
  // State
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [expandedLinkedClasses, setExpandedLinkedClasses] = useState<string | null>(null);
  const [selectedClassForDetails, setSelectedClassForDetails] = useState<any>(null);
  const [selectedRegistrationForEdit, setSelectedRegistrationForEdit] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Check if data is complete
  const dataComplete = useMemo(() => hasCompleteData(data), [data]);

  // Use fallback data if no complete data
  const displayData = useMemo(() => {
    return dataComplete ? data : createFallbackData(data);
  }, [data, dataComplete]);

  // Process sessions with additional data
  const processedSessions = useMemo(() => {
    return processSessions(
      displayData.sessions || [],
      displayData.session_classes || [],
      displayData.registrations || [],
      displayData.classes || []
    );
  }, [displayData.sessions, displayData.session_classes, displayData.registrations, displayData.classes]);

  // Filter and sort sessions
  const filteredAndSortedSessions = useMemo(() => {
    return filterAndSortSessions(processedSessions, searchTerm, filterStatus);
  }, [processedSessions, searchTerm, filterStatus]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    return calculateSummaryStats(processedSessions);
  }, [processedSessions]);

  // Event handlers
  const handleViewClassDetails = useCallback((classData: any) => {
    setSelectedClassForDetails(classData);
  }, []);

  const handleEditRegistration = useCallback((registration: any) => {
    setSelectedRegistrationForEdit(registration);
  }, []);

  const handleToggleSessionExpansion = useCallback((sessionId: string) => {
    setExpandedSession(expandedSession === sessionId ? null : sessionId);
  }, [expandedSession]);

  const handleToggleLinkedClassesExpansion = useCallback((sessionId: string) => {
    setExpandedLinkedClasses(expandedLinkedClasses === sessionId ? null : sessionId);
  }, [expandedLinkedClasses]);

  const handleRefreshData = useCallback(() => {
    resetRateLimit();
    fetchClasses();
  }, [resetRateLimit, fetchClasses]);

  const handleUpdateRegistration = useCallback(async (updatedRegistration: any) => {
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
        await fetchClasses();
        setSelectedRegistrationForEdit(null);
      } else {
        throw new Error('Failed to update registration');
      }
    } catch (error) {
      console.error('Error updating registration:', error);
      alert('שגיאה בעדכון ההרשמה');
    }
  }, [session?.access_token, fetchClasses]);

  return {
    // Data
    data: displayData,
    processedSessions,
    filteredAndSortedSessions,
    summaryStats,
    
    // Loading states
    isLoading,
    isFetching,
    error,
    dataComplete,
    
    // State
    expandedSession,
    expandedLinkedClasses,
    selectedClassForDetails,
    selectedRegistrationForEdit,
    searchTerm,
    filterStatus,
    
    // Setters
    setSearchTerm,
    setFilterStatus,
    setSelectedClassForDetails,
    setSelectedRegistrationForEdit,
    
    // Handlers
    handleViewClassDetails,
    handleEditRegistration,
    handleToggleSessionExpansion,
    handleToggleLinkedClassesExpansion,
    handleRefreshData,
    handleUpdateRegistration,
    resetRateLimit
  };
}; 