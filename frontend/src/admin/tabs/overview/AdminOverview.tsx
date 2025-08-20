import React from 'react';
import { useAdminOverview } from '../../hooks/useAdminOverview';
import { AdminOverviewProps } from '../../types/admin';
import { 
  AdminOverviewLoadingState, 
  AdminOverviewErrorState, 
  AdminOverviewNoDataState, 
  AdminOverviewFilters, 
  AdminOverviewNoResults 
} from '../overview/AdminOverviewComponents';
import { AdminOverviewTable } from '../overview/AdminOverviewTable';
import { ClassDetailsModal, RegistrationEditModal } from '../../modals';
import { RefreshButton } from '../../components';
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
        <div className="flex items-center gap-3">
          {/* Weekly contact messages metric */}
          {data.messages && data.messages.length > 0 && (
            <button
              onClick={() => {
                // Navigate to contact tab
                const contactTab = document.querySelector('button[data-tab-key="contact"]');
                if (contactTab) {
                  (contactTab as HTMLElement).click();
                }
              }}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-[#EC4899]/20 bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5 text-[#4B2E83] text-sm font-medium hover:from-[#EC4899]/10 hover:to-[#4B2E83]/10 hover:border-[#EC4899]/30 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md"
              title='לחצי לעבור לדף יצירת קשר'
              aria-label={`התקבלו השבוע: ${(() => {
                const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                return data.messages.filter((msg: any) => new Date(msg.created_at) > oneWeekAgo).length;
              })()} (${data.messages.filter((msg: any) => msg.status === 'new').length} לא נקראו)`}
            >
              <span className="h-5 w-5 rounded-full bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white flex items-center justify-center">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </span>
              <span className="font-semibold">השבוע</span>
              <span className="text-[#EC4899] font-bold">
                {(() => {
                  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                  return data.messages.filter((msg: any) => new Date(msg.created_at) > oneWeekAgo).length;
                })()}
              </span>
              <span className="text-xs opacity-70">
                ({data.messages.filter((msg: any) => msg.status === 'new').length} לא נקראו)
              </span>
            </button>
          )}
          
          <RefreshButton
            onClick={handleRefreshData}
            isFetching={isFetching}
          />
        </div>
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