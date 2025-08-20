import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUsers, FaCheckCircle, FaTimesCircle, FaSpinner, FaInfoCircle, FaTimes, FaStar, FaUserFriends, FaGraduationCap } from 'react-icons/fa';
import { registrationsService } from '../../lib/registrations';
import { classesService } from '../../lib/classes';
import { translateCategory } from '../../utils/categoryUtils';
import type { RegistrationWithDetails } from '../../types/registration';
import type { Class } from '../../types/class';
import { LoadingSpinner, StatusModal } from '../common';

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
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past' | 'cancelled'>('all');
  const [selectedRegistration, setSelectedRegistration] = useState<RegistrationWithClass | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

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

    if (userId && session) {
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
  }, [userId, session]);

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

  const getColorScheme = (category: string) => {
    switch (category) {
      case 'trial':
        return {
          bgColor: 'bg-green-500',
          textColor: 'text-green-600',
          lightBg: 'bg-green-50',
          hoverColor: 'hover:bg-green-600'
        };
      case 'ballet':
        return {
          bgColor: 'bg-pink-500',
          textColor: 'text-pink-600',
          lightBg: 'bg-pink-50',
          hoverColor: 'hover:bg-pink-600'
        };
      case 'jazz':
        return {
          bgColor: 'bg-purple-500',
          textColor: 'text-purple-600',
          lightBg: 'bg-purple-50',
          hoverColor: 'hover:bg-purple-600'
        };
      case 'contemporary':
        return {
          bgColor: 'bg-blue-500',
          textColor: 'text-blue-600',
          lightBg: 'bg-blue-50',
          hoverColor: 'hover:bg-blue-600'
        };
      default:
        return {
          bgColor: 'bg-gray-500',
          textColor: 'text-gray-600',
          lightBg: 'bg-gray-50',
          hoverColor: 'hover:bg-gray-600'
        };
    }
  };



  const openModal = (registration: RegistrationWithClass) => {
    setSelectedRegistration(registration);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRegistration(null);
  };

  const openCancelModal = () => {
    setShowCancelModal(true);
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
  };

  // האם ניתן לבטל הרשמה (48 שעות מראש)
  const canCancelRegistration = (registration: RegistrationWithClass) => {
    if (typeof registration.selected_date !== 'string' || typeof registration.selected_time !== 'string') return false;
    // נבנה תאריך מלא מהשדה והתאריך
    const [hour, minute] = registration.selected_time.split(':');
    const classDate = new Date(registration.selected_date);
    classDate.setHours(Number(hour || '0'), Number(minute || '0'), 0, 0);
    const now = new Date();
    const diffMs = classDate.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours >= 48;
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
  const handleCancelRegistration = async () => {
    if (!selectedRegistration) return;
    
    // בדיקה שההרשמה לא בוטלה כבר
    if (selectedRegistration.status === 'cancelled') {
      setErrorMessage('ההרשמה כבר בוטלה.');
      setShowErrorPopup(true);
      setTimeout(() => setShowErrorPopup(false), 5000);
      return;
    }
    
    
    
    try {

      
      const result = await registrationsService.cancelRegistration(selectedRegistration.id, session?.access_token);

      // Clear cache after successful cancellation
      registrationsService.clearUserCache(userId);
      
      setShowModal(false);
      setSelectedRegistration(null);
      setShowCancelModal(false);
      
      // עדכן את ההרשמה ברשימה
      setRegistrations((prev) => prev.map(r => 
        r.id === selectedRegistration.id 
          ? { ...r, status: 'cancelled' }
          : r
      ));
      
      // עדכן את ספירת השיעורים
      if (onClassesCountUpdate) {
        onClassesCountUpdate();
      }
      
      // עדכן את הקרדיטים אם זה שיעור מנוי
      if (selectedRegistration.used_credit && selectedRegistration.credit_type && onCreditsUpdate) {
        onCreditsUpdate();
      }
      
      // הצג הודעת הצלחה
      let successMsg = `ההרשמה ל"${selectedRegistration.class.name}" בוטלה בהצלחה!`;
      // אם זה שיעור ניסיון לפי קטגוריה, הוסף הודעה נוספת (למדיניות בלבד)
      if ((selectedRegistration.class.category || '').toLowerCase() === 'trial') {
        successMsg += '\n\nכעת תוכלי להזמין שוב שיעור ניסיון במועד חדש!';
      }
      
      // אם זה שיעור מנוי ששולם בקרדיט, הוסף הודעה על החזרת הקרדיט
      if (selectedRegistration.used_credit && selectedRegistration.credit_type) {
        const creditTypeText = selectedRegistration.credit_type === 'group' ? 'קבוצתי' : 'פרטי';
        successMsg += `\n\nקרדיט ${creditTypeText} אחד הוחזר לחשבונך!`;
      }
      
      setSuccessMessage(successMsg);
      setShowSuccessPopup(true);
      
      // סגירת הפופאפ אחרי 5 שניות
      setTimeout(() => setShowSuccessPopup(false), 5000);
      
    } catch (err) {
      console.error('MyClassesTab: Error cancelling registration:', err);
      setErrorMessage('שגיאה בביטול ההרשמה. אנא נסי שוב.');
      setShowErrorPopup(true);
      setTimeout(() => setShowErrorPopup(false), 5000);
    }
  };

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
              onClick={() => setFilter('all')}
              className={`px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                filter === 'all'
                  ? 'bg-white text-[#4B2E83] shadow-md'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              הכל
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                filter === 'upcoming'
                  ? 'bg-white text-[#4B2E83] shadow-md'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
            >
              עתידיים
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                filter === 'past'
                  ? 'bg-white text-[#4B2E83] shadow-md'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              הסתיימו
            </button>
            <button
              onClick={() => setFilter('cancelled')}
              className={`px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                filter === 'cancelled'
                  ? 'bg-white text-[#4B2E83] shadow-md'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              בוטלו
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-8">
        {sortedRegistrations.length === 0 ? (
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
              className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded-xl font-medium hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300 text-sm sm:text-base"
            >
              <FaCalendarAlt className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
              הרשמה לשיעור
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {sortedRegistrations.map((registration) => {
              const colors = getColorScheme(registration.class.category || 'default');
              const registrationDate = new Date(registration.selected_date);
              
              return (
                <div
                  key={registration.id}
                  onClick={() => openModal(registration)}
                  className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 cursor-pointer group hover:border-[#EC4899]/30 hover:scale-[1.02]"
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
                      <FaCalendarAlt className="w-4 h-4 ml-2 text-[#EC4899]" />
                      <span>
                        {registration.selected_date && typeof registration.selected_date === 'string' ? new Date(registration.selected_date).toLocaleDateString('he-IL', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        }) : ''}
                      </span>
                    </div>
                    <div className="flex items-center text-[#4B2E83] font-semibold text-sm sm:text-base">
                      <FaClock className="w-4 h-4 ml-2 text-[#EC4899]" />
                      <span>{typeof registration.selected_time === 'string' ? registration.selected_time : ''}</span>
                    </div>
                  </div>

                  {/* Footer with category and click hint */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-3 border-t border-gray-100 gap-2">
                    <div className="text-sm text-[#4B2E83]/70 font-medium">
                      {translateCategory(registration.class.category || '')}
                    </div>
                    <div className="flex items-center text-xs text-[#4B2E83]/50">
                      <FaInfoCircle className="w-3 h-3 ml-1" />
                      <span>לחצי לפרטים מלאים</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Registration Details Modal */}
      {showModal && selectedRegistration && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full mx-4 shadow-2xl border border-[#EC4899]/10 max-h-[90vh] overflow-y-auto animate-slideIn">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#4B2E83] to-[#EC4899] px-8 py-6 rounded-t-3xl relative">
              <button
                onClick={closeModal}
                className="absolute top-4 left-4 text-white/80 hover:text-white transition-colors"
              >
                <FaTimes className="w-6 h-6" />
              </button>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white font-agrandir-grand mb-2">
                  פרטי השיעור
                </h3>
                <p className="text-white/80 text-sm">
                  {selectedRegistration.class.name}
                </p>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8">
              {/* Class Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h4 className="text-2xl font-bold text-[#4B2E83] font-agrandir-grand">
                      {selectedRegistration.class.name}
                    </h4>
                    {getStatusBadge(selectedRegistration)}
                  </div>
                  {(selectedRegistration as any).class?.description && (
                    <p className="text-[#4B2E83]/70 text-base leading-relaxed">
                      {(selectedRegistration as any).class.description}
                    </p>
                  )}
                </div>
                <div className="bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white px-6 py-3 rounded-2xl font-bold text-xl shadow-lg">
                  {selectedRegistration.class.price} ש"ח
                </div>
              </div>

              {/* Class Details Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* פרטי השיעור */}
                <div className="bg-gradient-to-br from-[#EC4899]/5 to-[#4B2E83]/5 rounded-2xl p-6 border border-[#EC4899]/10">
                  <h5 className="text-lg font-bold text-[#4B2E83] mb-6 flex items-center">
                    <FaCalendarAlt className="w-5 h-5 ml-2 text-[#EC4899]" />
                    פרטי השיעור
                  </h5>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-white/50 rounded-xl">
                      <span className="text-[#4B2E83]/70 font-medium">תאריך השיעור:</span>
                      <span className="font-semibold text-[#4B2E83] text-right">
                        {typeof selectedRegistration.selected_date === 'string'
                          ? new Date(selectedRegistration.selected_date).toLocaleDateString('he-IL', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                          : ''}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/50 rounded-xl">
                      <span className="text-[#4B2E83]/70 font-medium">שעת השיעור:</span>
                      <span className="font-semibold text-[#4B2E83]">{selectedRegistration.selected_time || ''}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/50 rounded-xl">
                      <span className="text-[#4B2E83]/70 font-medium">מיקום השיעור:</span>
                      <span className="font-semibold text-[#4B2E83] text-right">יוסף לישנסקי 6, ראשון לציון</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/50 rounded-xl">
                      <span className="text-[#4B2E83]/70 font-medium">סוג השיעור:</span>
                      <span className="font-semibold text-[#4B2E83]">{translateCategory(selectedRegistration.class.category || '')}</span>
                    </div>
                  </div>
                </div>

                {/* פרטי הקורס */}
                <div className="bg-gradient-to-br from-[#4B2E83]/5 to-[#EC4899]/5 rounded-2xl p-6 border border-[#4B2E83]/10">
                  <h5 className="text-lg font-bold text-[#4B2E83] mb-6 flex items-center">
                    <FaGraduationCap className="w-5 h-5 ml-2 text-[#4B2E83]" />
                    פרטי הקורס
                  </h5>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-white/50 rounded-xl">
                      <span className="text-[#4B2E83]/70 font-medium">רמת השיעור:</span>
                      <span className="font-semibold text-[#4B2E83]">{selectedRegistration.class.level}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/50 rounded-xl">
                      <span className="text-[#4B2E83]/70 font-medium">משך השיעור:</span>
                      <span className="font-semibold text-[#4B2E83]">{selectedRegistration.class.duration} דקות</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-white/50 rounded-xl">
                      <span className="text-[#4B2E83]/70 font-medium">מחיר השיעור:</span>
                      <span className="font-semibold text-[#EC4899] text-lg">{selectedRegistration.class.price} ש"ח</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* פרטי ההרשמה */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 mb-6 border border-gray-200">
                <h5 className="text-lg font-bold text-[#4B2E83] mb-6 flex items-center">
                  <FaInfoCircle className="w-5 h-5 ml-2 text-[#EC4899]" />
                  פרטי ההרשמה
                </h5>
                <div className="space-y-4">
                  {/* Order Number - Full Width */}
                  <div className="p-3 bg-white/70 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[#4B2E83]/70 font-medium">מספר הזמנה:</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <span className="font-mono text-sm font-semibold text-[#4B2E83] break-all">
                        #{selectedRegistration.id}
                      </span>
                    </div>
                  </div>
                  
                  {/* Other Registration Details - Grid Layout */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center justify-between p-3 bg-white/70 rounded-xl">
                      <span className="text-[#4B2E83]/70 font-medium">תאריך ההרשמה:</span>
                      <span className="font-semibold text-[#4B2E83] text-right">
                        {typeof selectedRegistration.created_at === 'string' ? new Date(selectedRegistration.created_at).toLocaleDateString('he-IL') : ''}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/70 rounded-xl">
                      <span className="text-[#4B2E83]/70 font-medium">סטטוס ההרשמה:</span>
                      <span className="font-semibold text-[#4B2E83]">{selectedRegistration.status === 'active' ? 'פעיל' : selectedRegistration.status === 'cancelled' ? 'בוטל' : selectedRegistration.status}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/70 rounded-xl">
                      <span className="text-[#4B2E83]/70 font-medium">שם המשתתף:</span>
                      <span className="font-semibold text-[#4B2E83] text-right">
                        {selectedRegistration.first_name} {selectedRegistration.last_name}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col md:flex-row gap-4 mt-8">
                <button
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 bg-gray-100 text-[#4B2E83] rounded-xl font-medium hover:bg-gray-200 transition-all duration-300"
                >
                  סגור
                </button>
                <button
                  onClick={() => {
                    // כאן אפשר להוסיף פעולות נוספות כמו ביטול הרשמה
                    closeModal();
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded-xl font-medium hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300"
                >
                  <FaStar className="w-4 h-4 ml-2 inline" />
                  דרגי את השיעור
                </button>
                {canCancelRegistration(selectedRegistration) && selectedRegistration.status !== 'cancelled' && (
                  <button
                    onClick={openCancelModal}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-xl font-medium hover:from-red-700 hover:to-red-800 transition-all duration-300"
                  >
                    בטלי הרשמה
                  </button>
                )}
                {/* הודעה אם לא ניתן לבטל */}
                {!canCancelRegistration(selectedRegistration) && selectedRegistration.status === 'active' && (
                  <div className="flex-1 px-6 py-3 bg-yellow-100 text-yellow-800 rounded-xl font-medium flex items-center justify-center text-center">
                    לא ניתן לבטל את ההרשמה פחות מ-48 שעות לפני מועד השיעור
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && selectedRegistration && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full mx-4 shadow-2xl border border-red-200 animate-slideIn">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-700 px-8 py-6 rounded-t-3xl relative">
              <button
                onClick={closeCancelModal}
                className="absolute top-4 left-4 text-white/80 hover:text-white transition-colors"
              >
                <FaTimes className="w-6 h-6" />
              </button>
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaTimesCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white font-agrandir-grand mb-2">
                  ביטול הרשמה
                </h3>
                <p className="text-white/80 text-sm">
                  {selectedRegistration.class.name}
                </p>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8">
              <div className="text-center mb-6">
                <p className="text-[#4B2E83] text-lg mb-4">
                  האם את בטוחה שברצונך לבטל את ההרשמה לשיעור זה?
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
                  <p className="text-yellow-800 text-sm">
                    <strong>שים לב:</strong> ביטול הרשמה אפשרי רק עד 48 שעות לפני מועד השיעור.
                  </p>
                </div>
                {(selectedRegistration.class.category || '').toLowerCase() === 'trial' && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <p className="text-green-800 text-sm">
                      <strong>בנוסף:</strong> לאחר הביטול תוכלי להזמין שוב את שיעור הניסיון הזה במועד חדש.
                    </p>
                  </div>
                )}
                
                {selectedRegistration.used_credit && selectedRegistration.credit_type && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-blue-800 text-sm">
                      <strong>בנוסף:</strong> קרדיט {selectedRegistration.credit_type === 'group' ? 'קבוצתי' : 'פרטי'} אחד יוחזר לחשבונך (כי שילמת בקרדיט).
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={closeCancelModal}
                  className="flex-1 px-6 py-3 bg-gray-100 text-[#4B2E83] rounded-xl font-medium hover:bg-gray-200 transition-all duration-300"
                >
                  ביטול
                </button>
                <button
                  onClick={() => {
                    closeCancelModal();
                    handleCancelRegistration();
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-xl font-medium hover:from-red-700 hover:to-red-800 transition-all duration-300"
                >
                  בטלי הרשמה
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Popup */}
      <StatusModal
        isOpen={showSuccessPopup}
        onClose={() => setShowSuccessPopup(false)}
        type="success"
        title="הביטול הושלם בהצלחה!"
        message={successMessage}
      />

      {/* Error Popup */}
      <StatusModal
        isOpen={showErrorPopup}
        onClose={() => setShowErrorPopup(false)}
        type="error"
        title="שגיאה"
        message={errorMessage}
      />
    </div>
  );
};

export default MyClassesTab; 