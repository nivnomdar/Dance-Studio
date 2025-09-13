import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaClock, FaCheckCircle, FaTimesCircle, FaInfoCircle } from 'react-icons/fa';
import { registrationsService } from '../../lib/registrations';
import { translateCategory } from '../../utils/categoryUtils';
import type { RegistrationWithDetails } from '../../types/registration';
import { LoadingSpinner } from '../common';
import ClassDetailsModal from './ClassDetailsModal';

interface MyClassesTabProps {
  userId: string;
  session: any;
  onClassesCountUpdate?: () => void;
  onCreditsUpdate?: () => void;
}

// Use the server-joined class details from the registrations API
type RegistrationWithClass = RegistrationWithDetails;

const MyClassesTab: React.FC<MyClassesTabProps> = ({ userId, session, onClassesCountUpdate, onCreditsUpdate }) => {
  const [registrations, setRegistrations] = useState<RegistrationWithClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past' | 'cancelled'>('upcoming');
  const [selectedRegistration, setSelectedRegistration] = useState<RegistrationWithClass | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1); // Current page for pagination
  const itemsPerPage = 6; // Number of items to display per page

  useEffect(() => {
    const fetchRegistrations = async (retryCount = 0) => {
      if (isFetching) return;
      
      try {
        setIsFetching(true);
        setLoading(true);
        setError(null);
        
        // קבלת כל ההרשמות של המשתמש (כולל שדה class מצורף מהשרת)
        const userRegistrations = await registrationsService.getMyRegistrations(userId);

        // השתמש ישירות בנתוני ה-class המוצמדים ע"י ה-API וסנן רשומות ללא class
        const registrationsWithClasses: RegistrationWithClass[] = (userRegistrations || [])
          .filter((r: any) => r && r.class)
          .map((r: any) => r as RegistrationWithClass);

        setRegistrations(registrationsWithClasses);
      } catch (err) {
        console.error('Error fetching registrations:', err);
        // Handle rate limiting gracefully
        if (err instanceof Error && err.message.includes('429')) {
          if (retryCount < 2) {
            const retryDelay = Math.pow(2, retryCount) * 2000;
            setError(`יותר מדי בקשות. מנסה שוב בעוד ${retryDelay/1000} שניות...`);
            setTimeout(() => fetchRegistrations(retryCount + 1), retryDelay);
            return;
          }
          setError('יותר מדי בקשות, אנא נסי שוב בעוד כמה שניות');
        } else {
          setError('שגיאה בטעינת ההרשמות שלך');
        }
      } finally {
        setLoading(false);
        setIsFetching(false);
      }
    };

    if (userId && session?.access_token) {
      // בדיקה אם עברו פחות מ-60 שניות מהטעינה האחרונה (increased from 30)
      const now = Date.now();
      const timeSinceLastFetch = now - lastFetchTime;
      const CACHE_DURATION = 60 * 1000; // 60 שניות
      
      if (timeSinceLastFetch < CACHE_DURATION && registrations.length > 0) {
        // השתמש בנתונים הקיימים
        setLoading(false);
        return;
      }
      
      // טען נתונים חדשים
      setLastFetchTime(now);
      fetchRegistrations();
    }
  }, [userId, session?.access_token, isFetching, lastFetchTime, registrations.length]);

  // Reset current page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  // פילטור הרשמות לפי תאריך
  const filteredRegistrations = registrations.filter(registration => {
    const registrationDate = new Date(registration.selected_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    switch (filter) {
      case 'upcoming':
        return registrationDate >= today && registration.status !== 'cancelled';
      case 'past':
        return registrationDate < today && registration.status !== 'cancelled';
      case 'cancelled':
        return registration.status === 'cancelled';
      default:
        return true; // מציג הכל כולל בוטלים
    }
  });

  // מיון לפי תאריך (העתידיים קודם, אחר כך העבר)
  const sortedRegistrations = filteredRegistrations.sort((a, b) => {
    const dateA = new Date(a.selected_date);
    const dateB = new Date(b.selected_date);
    return dateA.getTime() - dateB.getTime();
  });

  // Calculate total pages and slice registrations for current page
  const totalPages = Math.ceil(sortedRegistrations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRegistrations = sortedRegistrations.slice(startIndex, endIndex);

  const getStatusBadge = (registration: RegistrationWithClass) => {
    // בדוק קודם את הסטטוס מהדאטהבייס
    if (registration.status === 'cancelled') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <FaTimesCircle className="w-3 h-3 ml-1" />
          בוטל
        </span>
      );
    }

    const registrationDate = new Date(registration.selected_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (registrationDate < today) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <FaTimesCircle className="w-3 h-3 ml-1" />
          הסתיים
        </span>
      );
    } else if (registrationDate.getTime() === today.getTime()) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <FaClock className="w-3 h-3 ml-1" />
          היום
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <FaCheckCircle className="w-3 h-3 ml-1" />
          נקבע
        </span>
      );
    }
  };

  const openModal = (registration: RegistrationWithClass) => {
    setSelectedRegistration(registration);
    setShowModal(true);
  };

  // קבלת תגית תאריך (היום/מחר/תאריך)
  const getDateLabel = (registration: RegistrationWithClass) => {
    if (typeof registration.selected_date !== 'string') return null;
    
    const classDate = new Date(registration.selected_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (classDate.getTime() === today.getTime()) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          היום
        </span>
      );
    } else if (classDate.getTime() === tomorrow.getTime()) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          מחר
        </span>
      );
    }
    
    return null;
  };

  // ביטול הרשמה
  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#EC4899]/10">
        <div className="bg-gradient-to-r from-[#4B2E83] to-[#EC4899] px-4 sm:px-8 py-6">
          <h3 className="text-xl sm:text-2xl font-bold text-white font-agrandir-grand">
            השיעורים שלי
          </h3>
          <p className="text-white/80 text-sm mt-1">
            צפי בהיסטוריית השיעורים שלך
          </p>
        </div>
        <div className="p-4 sm:p-8">
          <div className="flex items-center justify-center py-8 sm:py-12">
            <LoadingSpinner message="טוען שיעורים..." size="md" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#EC4899]/10">
        <div className="bg-gradient-to-r from-[#4B2E83] to-[#EC4899] px-4 sm:px-8 py-6">
          <h3 className="text-xl sm:text-2xl font-bold text-white font-agrandir-grand">
            השיעורים שלי
          </h3>
          <p className="text-white/80 text-sm mt-1">
            צפי בהיסטוריית השיעורים שלך
          </p>
        </div>
        <div className="p-4 sm:p-8">
          <div className="text-center py-8 sm:py-12">
            <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <FaTimesCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-[#4B2E83] mb-2">שגיאה בטעינת השיעורים</h3>
            <p className="text-[#4B2E83]/70 mb-4 sm:mb-6 text-sm sm:text-base">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded-xl font-medium hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300 text-sm sm:text-base"
            >
              נסה שוב
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#EC4899]/10">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#4B2E83] to-[#EC4899] px-4 sm:px-8 py-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-white font-agrandir-grand">
              השיעורים שלי
            </h3>
            <p className="text-white/80 text-sm mt-1">
              צפי בהיסטוריית השיעורים שלך
            </p>
          </div>
          <div className="flex flex-wrap items-center bg-white/10 rounded-xl p-0.5 sm:p-1 backdrop-blur-sm gap-0.5 sm:gap-1 w-fit">
            <button
              onClick={() => setFilter('upcoming')}
              aria-label="הצג שיעורים עתידיים"
              className={`px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                filter === 'upcoming'
                  ? 'bg-white text-[#4B2E83] shadow-md'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              } focus:outline-none focus:ring-2 focus:ring-[#4B2E83] focus:ring-offset-2 focus:border-2 focus:border-[#4B2E83]`}
            >
              עתידיים
            </button>
            <button
              onClick={() => setFilter('past')}
              aria-label="הצג שיעורים שהסתיימו"
              className={`px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                filter === 'past'
                  ? 'bg-white text-[#4B2E83] shadow-md'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              } focus:outline-none focus:ring-2 focus:ring-[#4B2E83] focus:ring-offset-2 focus:border-2 focus:border-[#4B2E83]`}
            >
              הסתיימו
            </button>
            <button
              onClick={() => setFilter('cancelled')}
              aria-label="הצג שיעורים שבוטלו"
              className={`px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                filter === 'cancelled'
                  ? 'bg-white text-[#4B2E83] shadow-md'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              } focus:outline-none focus:ring-2 focus:ring-[#4B2E83] focus:ring-offset-2 focus:border-2 focus:border-[#4B2E83]`}
            >
              בוטלו
            </button>
            <button
              onClick={() => setFilter('all')}
              aria-label="הצג את כל השיעורים"
              className={`px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                filter === 'all'
                  ? 'bg-white text-[#4B2E83] shadow-md'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              } focus:outline-none focus:ring-2 focus:ring-[#4B2E83] focus:ring-offset-2 focus:border-2 focus:border-[#4B2E83]`}
            >
              הכל
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-8">
        {currentRegistrations.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <div className="mx-auto mb-4 sm:mb-6 w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center">
              <FaCalendarAlt className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-[#4B2E83] mb-2 sm:mb-3">
              {filter === 'all' ? 'אין לך הרשמות לשיעורים עדיין' : 
               filter === 'upcoming' ? 'אין לך שיעורים עתידיים' : 
               filter === 'past' ? 'אין לך שיעורים שהסתיימו' :
               'אין לך שיעורים שבוטלו'}
            </h3>
            <p className="text-[#4B2E83]/70 mb-4 sm:mb-6 text-sm sm:text-base">
              {filter === 'all' ? 'הרשמי לשיעור ראשון ותתחילי לרקוד!' : 
               filter === 'upcoming' ? 'הרשמי לשיעור חדש כדי לראות אותו כאן' : 
               filter === 'past' ? 'השיעורים שהסתיימו יופיעו כאן' :
               'השיעורים שבוטלו יופיעו כאן'}
            </p>
            <a
              href="/classes"
              aria-label="הרשמה לשיעור חדש"
              className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded-xl font-medium hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#4B2E83] focus:ring-offset-2 focus:border-2 focus:border-[#4B2E83]"
            >
              <FaCalendarAlt className="w-3 h-3 sm:w-4 sm:h-4 ml-2" aria-hidden="true" />
              הרשמה לשיעור
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {currentRegistrations.map((registration) => {
              
              return (
                <button
                  key={registration.id}
                  onClick={() => openModal(registration)}
                  aria-label={`פרטים על השיעור ${registration.class.name} בתאריך ${new Date(registration.selected_date).toLocaleDateString('he-IL')}`}
                  className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 cursor-pointer group hover:border-[#EC4899]/30 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#4B2E83] focus:ring-offset-2 focus:border-2 focus:border-[#4B2E83]"
                >
                  {/* Header with name and status */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-3">
                    <div className="flex-1">
                      <h4 className="text-lg sm:text-xl font-bold text-[#4B2E83] font-agrandir-grand group-hover:text-[#EC4899] transition-colors">
                        {registration.class.name}
                      </h4>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {getDateLabel(registration)}
                      {getStatusBadge(registration)}
                    </div>
                  </div>

                  {/* Date and Time - Main Info */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 p-3 sm:p-4 bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5 rounded-xl gap-2">
                    <div className="flex items-center text-[#4B2E83] font-semibold text-sm sm:text-base">
                      <FaCalendarAlt className="w-4 h-4 ml-2 text-[#EC4899]" aria-hidden="true" />
                      <span>
                        {registration.selected_date && typeof registration.selected_date === 'string' ? new Date(registration.selected_date).toLocaleDateString('he-IL', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        }) : ''}
                      </span>
                    </div>
                    <div className="flex items-center text-[#4B2E83] font-semibold text-sm sm:text-base">
                      <FaClock className="w-4 h-4 ml-2 text-[#EC4899]" aria-hidden="true" />
                      <span>{typeof registration.selected_time === 'string' ? registration.selected_time : ''}</span>
                    </div>
                  </div>

                  {/* Footer with category and click hint */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-3 border-t border-gray-100 gap-2">
                    <div className="text-sm text-[#4B2E83]/70 font-medium">
                      {translateCategory(registration.class.category || '')}
                    </div>
                    <div className="flex items-center text-xs text-[#4B2E83]/50">
                      <FaInfoCircle className="w-3 h-3 ml-1" aria-hidden="true" />
                      <span>לחצי לפרטים מלאים</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center py-4 sm:py-6">
          <nav className="flex items-center space-x-2" aria-label="ניווט בין דפי שיעורים">
              <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              aria-label="עמוד קודם"
              className="px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#4B2E83] focus:ring-offset-2 focus:border-2 focus:border-[#4B2E83]"
            >
              קודם
              </button>
            <span className="text-gray-600">
              עמוד {currentPage} מתוך {totalPages}
                      </span>
                <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              aria-label="עמוד הבא"
              className="px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#4B2E83] focus:ring-offset-2 focus:border-2 focus:border-[#4B2E83]"
            >
              הבא
                </button>
          </nav>
        </div>
      )}

      {/* Registration Details Modal */}
      {/* ClassDetailsModal Component */}
      <ClassDetailsModal
        selectedRegistration={selectedRegistration}
        showModal={showModal}
        setShowModal={setShowModal}
        onClassesCountUpdate={onClassesCountUpdate}
        onCreditsUpdate={onCreditsUpdate}
        session={session}
      />
    </div>
  );
};

export default MyClassesTab; 