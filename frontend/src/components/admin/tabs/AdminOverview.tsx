import React from 'react';
import { useAdminOverview } from '../../../hooks/useAdminOverview';
import { AdminOverviewProps } from '../../../types/admin';
import { 
  AdminOverviewLoadingState, 
  AdminOverviewErrorState, 
  AdminOverviewNoDataState, 
  AdminOverviewFilters, 
  AdminOverviewNoResults 
} from '../overview/AdminOverviewComponents';
import { AdminOverviewTable } from '../overview/AdminOverviewTable';
import { ClassDetailsModal, RegistrationEditModal } from '../../../pages/admin/modals';
import { RefreshButton } from '../../admin';
import AdminCalendar from './AdminCalendar';

export default function AdminOverview({ profile }: AdminOverviewProps) {
  const {
    // Data
    data,
    filteredAndSortedSessions,
    
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
  } = useAdminOverview();

  // Loading state
  if (isLoading && !dataComplete) {
    return <AdminOverviewLoadingState />;
  }

  // Error state
  if (error && !dataComplete) {
    return (
      <AdminOverviewErrorState
        error={error}
        onRetry={handleRefreshData}
        onResetRateLimit={resetRateLimit}
      />
    );
  }

  // No data state
  if (!dataComplete) {
    return <AdminOverviewNoDataState />;
  }

  return (
    <div className="space-y-3 sm:space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <div>
          <h2 className="text-2xl font-bold text-[#4B2E83]">סקירה כללית</h2>
          <p className="text-sm text-[#4B2E83]/70 mt-1">סקירה כללית של השיעורים, הסשנים וההרשמות</p>
        </div>
        <RefreshButton
          onClick={handleRefreshData}
          isFetching={isFetching}
        />
      </div>

      {/* Calendar Component */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-[#EC4899]/10">
        <AdminCalendar profile={profile} />
      </div>

      {/* Filters */}
      <AdminOverviewFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
      />

      {/* Sessions Table */}
      <AdminOverviewTable
        sessions={filteredAndSortedSessions}
        expandedSession={expandedSession}
        expandedLinkedClasses={expandedLinkedClasses}
        onToggleSessionExpansion={handleToggleSessionExpansion}
        onToggleLinkedClassesExpansion={handleToggleLinkedClassesExpansion}
        onViewClassDetails={handleViewClassDetails}
        onEditRegistration={handleEditRegistration}
        displayData={data}
      />

      {/* No Results */}
      {filteredAndSortedSessions.length === 0 && (
        <AdminOverviewNoResults />
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
          onSave={handleUpdateRegistration}
          isLoading={false}
          isNewRegistration={false}
          classes={data.classes || []}
          sessions={data.sessions || []}
          session_classes={data.session_classes || []}
          profiles={data.profiles || []}
        />
      )}
    </div>
  );
} 