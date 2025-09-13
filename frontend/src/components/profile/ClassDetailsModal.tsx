import React, { useState, useEffect, useRef } from 'react';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUsers, FaCheckCircle, FaTimesCircle, FaInfoCircle, FaTimes, FaUserFriends, FaGraduationCap, FaHourglassHalf, FaMoneyBillAlt, FaCreditCard } from 'react-icons/fa';
import { registrationsService } from '../../lib/registrations';
import { translateCategory } from '../../utils/categoryUtils';
import type { RegistrationWithDetails } from '../../types/registration';
import { StatusModal } from '../common';

interface ClassDetailsModalProps {
  selectedRegistration: RegistrationWithDetails | null;
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  onClassesCountUpdate?: () => void;
  onCreditsUpdate?: () => void;
  session: any;
}

type RegistrationWithClass = RegistrationWithDetails;

const ClassDetailsModal: React.FC<ClassDetailsModalProps> = ({
  selectedRegistration,
  showModal,
  setShowModal,
  onClassesCountUpdate,
  onCreditsUpdate,
  session,
}) => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const modalRef = useRef<HTMLDivElement>(null); // Ref for the modal content
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null); // To store the element that had focus before the modal opened

  useEffect(() => {
    if (showModal) {
      previouslyFocusedElementRef.current = document.activeElement as HTMLElement;
      // Focus the modal or the first focusable element inside it
      const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements && focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      } else if (modalRef.current) {
        modalRef.current.focus();
      }

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          event.stopPropagation(); // Prevent propagation to parent modals/elements
          closeModal();
          return;
        }

        if (event.key === 'Tab') {
          if (!modalRef.current) return;

          const currentFocusableElements = modalRef.current.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
          );

          if (currentFocusableElements.length === 0) {
            event.preventDefault(); // If no focusable elements, trap focus on the modal itself
            modalRef.current.focus();
            return;
          }

          const firstFocusableEl = currentFocusableElements[0];
          const lastFocusableEl = currentFocusableElements[currentFocusableElements.length - 1];

          if (event.shiftKey) {
            // If Shift + Tab and focus is on the first element, move to the last
            if (document.activeElement === firstFocusableEl || !modalRef.current.contains(document.activeElement)) {
              lastFocusableEl.focus();
              event.preventDefault();
            }
          } else {
            // If Tab and focus is on the last element, move to the first
            if (document.activeElement === lastFocusableEl) {
              firstFocusableEl.focus();
              event.preventDefault();
            }
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);

      document.body.style.overflow = 'hidden'; // Prevent background scrolling

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = ''; // Restore background scrolling
        // Restore focus to the element that was focused before the modal opened
        previouslyFocusedElementRef.current?.focus();
      };
    } else {
      // When modal closes, ensure focus is returned
      document.body.style.overflow = ''; // Restore background scrolling on close
      previouslyFocusedElementRef.current?.focus();
    }
  }, [showModal, setShowModal]);

  if (!showModal || !selectedRegistration) {
    return null;
  }

  const closeModal = () => {
    setShowModal(false);
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
  const getStatusBadge = (registration: RegistrationWithClass) => {
    // בדוק קודם את הסטטוס מהדאטהבייס
    if (registration.status === 'cancelled') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <FaTimesCircle className="w-3 h-3 ml-1" aria-hidden="true" />
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
          <FaTimesCircle className="w-3 h-3 ml-1" aria-hidden="true" />
          הסתיים
        </span>
      );
    } else if (registrationDate.getTime() === today.getTime()) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <FaClock className="w-3 h-3 ml-1" aria-hidden="true" />
          היום
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <FaCheckCircle className="w-3 h-3 ml-1" aria-hidden="true" />
          נקבע
        </span>
      );
    }
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
      await registrationsService.cancelRegistration(selectedRegistration.id, session?.access_token);

      // Clear cache after successful cancellation
      registrationsService.clearUserCache(selectedRegistration.user_id);
      
      setShowModal(false);
      setShowCancelModal(false);
      
      // עדכן את ההרשמה ברשימה (באמצעות קריאה לפונקציה חיצונית)
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
      console.error('ClassDetailsModal: Error cancelling registration:', err);
      setErrorMessage('שגיאה בביטול ההרשמה. אנא נסי שוב.');
      setShowErrorPopup(true);
      setTimeout(() => setShowErrorPopup(false), 5000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn" role="dialog" aria-modal="true" aria-labelledby="registration-details-title" aria-describedby="registration-details-description">
      <div ref={modalRef} className="bg-white rounded-3xl max-w-2xl w-full mx-4 shadow-2xl border border-[#EC4899]/10 max-h-[90vh] overflow-y-auto animate-slideIn" tabIndex={-1}>
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#4B2E83] to-[#EC4899] px-8 py-6 rounded-t-3xl relative sticky top-0 z-10">
          <button
            onClick={closeModal}
            aria-label="סגור פרטי שיעור"
            className="absolute top-4 left-4 text-white/80 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#4B2E83] focus:ring-offset-2 focus:border-2 focus:border-[#4B2E83]"
          >
            <FaTimes className="w-6 h-6" aria-hidden="true" />
          </button>
          {/* Status Badge in top right corner */}
          <div className="absolute top-4 right-4 z-20">
            {getStatusBadge(selectedRegistration)}
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white font-agrandir-grand mb-2" id="registration-details-title">
              פרטי השיעור
            </h2>
            <p className="text-white/80 text-sm" id="registration-details-description">
              {selectedRegistration.class.name}
            </p>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-8">
          {/* Class Header */}
          <article className="flex flex-col mb-6 p-4 rounded-xl bg-gradient-to-br from-[#EC4899]/5 to-[#4B2E83]/5 border border-[#EC4899]/10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold text-[#4B2E83] font-agrandir-grand flex items-center gap-2">
                <FaGraduationCap className="w-5 h-5 text-[#EC4899]" aria-hidden="true" />
                {selectedRegistration.class.name}
                {/* Removed getStatusBadge from here */}
              </h3>
            </div>
            {(selectedRegistration as any).class?.description && (
              <p className="text-[#4B2E83]/70 text-base leading-relaxed mt-2">
                {(selectedRegistration as any).class.description}
              </p>
            )}
          </article>

          {/* Class Details Section */}
          <div className="space-y-4 mb-8 p-4 rounded-xl bg-gradient-to-br from-[#EC4899]/5 to-[#4B2E83]/5 border border-[#EC4899]/10">
            <h4 className="text-lg font-bold text-[#4B2E83] mb-2 flex items-center gap-2">
              <FaInfoCircle className="w-5 h-5 text-[#EC4899]" aria-hidden="true" />
              פרטי השיעור
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="flex items-center gap-3 p-3 bg-white/50 rounded-xl">
                <FaCalendarAlt className="w-4 h-4 text-[#EC4899]" aria-hidden="true" />
                <div>
                  <span className="text-[#4B2E83]/70 font-medium block text-xs">תאריך:</span>
                  <span className="font-semibold text-[#4B2E83] text-sm">
                    {typeof selectedRegistration.selected_date === 'string'
                      ? new Date(selectedRegistration.selected_date).toLocaleDateString('he-IL', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })
                      : ''}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/50 rounded-xl">
                <FaClock className="w-4 h-4 text-[#EC4899]" aria-hidden="true" />
                <div>
                  <span className="text-[#4B2E83]/70 font-medium block text-xs">שעה:</span>
                  <span className="font-semibold text-[#4B2E83] text-sm">{selectedRegistration.selected_time || ''}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/50 rounded-xl">
                <FaMapMarkerAlt className="w-4 h-4 text-[#EC4899]" aria-hidden="true" />
                <div>
                  <span className="text-[#4B2E83]/70 font-medium block text-xs">מיקום:</span>
                  <span className="font-semibold text-[#4B2E83] text-sm">יוסף לישנסקי 6, ראשון לציון</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/50 rounded-xl">
                <FaUsers className="w-4 h-4 text-[#EC4899]" aria-hidden="true" />
                <div>
                  <span className="text-[#4B2E83]/70 font-medium block text-xs">סוג:</span>
                  <span className="font-semibold text-[#4B2E83] text-sm">{translateCategory(selectedRegistration.class.category || '')}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/50 rounded-xl">
                <FaGraduationCap className="w-4 h-4 text-[#EC4899]" aria-hidden="true" />
                <div>
                  <span className="text-[#4B2E83]/70 font-medium block text-xs">רמה:</span>
                  <span className="font-semibold text-[#4B2E83] text-sm">{selectedRegistration.class.level}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/50 rounded-xl">
                <FaHourglassHalf className="w-4 h-4 text-[#EC4899]" aria-hidden="true" />
                <div>
                  <span className="text-[#4B2E83]/70 font-medium block text-xs">משך:</span>
                  <span className="font-semibold text-[#4B2E83] text-sm">{selectedRegistration.class.duration} דקות</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/50 rounded-xl">
                <FaMoneyBillAlt className="w-4 h-4 text-[#EC4899]" aria-hidden="true" />
                <div>
                  <span className="text-[#4B2E83]/70 font-medium block text-xs">מחיר:</span>
                  <span className="font-semibold text-[#EC4899] text-sm">{selectedRegistration.class.price} ש"ח</span>
                </div>
              </div>
            </div>
          </div>

          {/* Registration Details Section */}
          <div className="space-y-4 mb-6">
            <h4 className="text-lg font-bold text-[#4B2E83] mb-2 flex items-center gap-2">
              <FaCreditCard className="w-5 h-5 text-[#EC4899]" aria-hidden="true" />
              פרטי הרשמה
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="flex items-center gap-3 p-3 bg-white/50 rounded-xl col-span-1 sm:col-span-2 lg:col-span-3">
                <FaInfoCircle className="w-4 h-4 text-[#EC4899]" aria-hidden="true" />
                <div>
                  <span className="text-[#4B2E83]/70 font-medium block text-xs">מספר הזמנה:</span>
                  <span className="font-mono text-sm font-semibold text-[#4B2E83] break-all">
                    #{selectedRegistration.id}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/50 rounded-xl">
                <FaCalendarAlt className="w-4 h-4 text-[#EC4899]" aria-hidden="true" />
                <div>
                  <span className="text-[#4B2E83]/70 font-medium block text-xs">תאריך הרשמה:</span>
                  <span className="font-semibold text-[#4B2E83] text-sm">
                    {typeof selectedRegistration.created_at === 'string' ? new Date(selectedRegistration.created_at).toLocaleDateString('he-IL') : ''}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/50 rounded-xl">
                <FaCheckCircle className="w-4 h-4 text-[#EC4899]" aria-hidden="true" />
                <div>
                  <span className="text-[#4B2E83]/70 font-medium block text-xs">סטטוס:</span>
                  <span className="font-semibold text-[#4B2E83] text-sm">{selectedRegistration.status === 'active' ? 'פעיל' : selectedRegistration.status === 'cancelled' ? 'בוטל' : selectedRegistration.status}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/50 rounded-xl col-span-1 sm:col-span-2 lg:col-span-1">
                <FaUserFriends className="w-4 h-4 text-[#EC4899]" aria-hidden="true" />
                <div>
                  <span className="text-[#4B2E83]/70 font-medium block text-xs">שם המשתתף:</span>
                  <span className="font-semibold text-[#4B2E83] text-sm">
                    {selectedRegistration.first_name} {selectedRegistration.last_name}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row gap-4 mt-8">
            {canCancelRegistration(selectedRegistration) && selectedRegistration.status !== 'cancelled' && (
              <button
                onClick={openCancelModal}
                aria-label="בטל הרשמה לשיעור"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-xl font-medium hover:from-red-700 hover:to-red-800 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#4B2E83] focus:ring-offset-2 focus:border-2 focus:border-[#4B2E83]"
              >
                בטלי הרשמה
              </button>
            )}
            {/* הודעה אם לא ניתן לבטל */}
            {!canCancelRegistration(selectedRegistration) && selectedRegistration.status === 'active' && (
              <div className="flex-1 px-6 py-3 bg-red-100 text-red-800 rounded-xl font-medium flex items-center justify-center text-center text-sm">
                לא ניתן לבטל את ההרשמה פחות מ-48 שעות לפני מועד השיעור. לביטול במקרים חריגים, אנא צרי קשר עם הסטודיו.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && selectedRegistration && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn" role="dialog" aria-modal="true" aria-labelledby="cancel-modal-title" aria-describedby="cancel-modal-description">
          <div className="bg-white rounded-3xl max-w-md w-full mx-4 shadow-2xl border border-red-200 animate-slideIn">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-700 px-8 py-6 rounded-t-3xl relative">
              <button
                onClick={closeCancelModal}
                aria-label="סגור חלון ביטול הרשמה"
                className="absolute top-4 left-4 text-white/80 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#4B2E83] focus:ring-offset-2 focus:border-2 focus:border-[#4B2E83]"
              >
                <FaTimes className="w-6 h-6" aria-hidden="true" />
              </button>
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaTimesCircle className="w-8 h-8 text-white" aria-hidden="true" />
                </div>
                <h2 className="text-2xl font-bold text-white font-agrandir-grand mb-2" id="cancel-modal-title">
                  ביטול הרשמה
                </h2>
                <p className="text-white/80 text-sm" id="cancel-modal-description">
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
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4" role="alert">
                  <p className="text-yellow-800 text-sm">
                    <strong>שים לב:</strong> ביטול הרשמה אפשרי רק עד 48 שעות לפני מועד השיעור.
                  </p>
                </div>
                {(selectedRegistration.class.category || '').toLowerCase() === 'trial' && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4" role="alert">
                    <p className="text-green-800 text-sm">
                      <strong>בנוסף:</strong> לאחר הביטול תוכלי להזמין שוב את שיעור הניסיון הזה במועד חדש.
                    </p>
                  </div>
                )}
                
                {selectedRegistration.used_credit && selectedRegistration.credit_type && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4" role="alert">
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
                  aria-label="אל תבטל את ההרשמה"
                  className="flex-1 px-6 py-3 bg-gray-100 text-[#4B2E83] rounded-xl font-medium hover:bg-gray-200 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#4B2E83] focus:ring-offset-2 focus:border-2 focus:border-[#4B2E83]"
                >
                  ביטול
                </button>
                <button
                  onClick={() => {
                    closeCancelModal();
                    handleCancelRegistration();
                  }}
                  aria-label="אשר ביטול הרשמה"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-xl font-medium hover:from-red-700 hover:to-red-800 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#4B2E83] focus:ring-offset-2 focus:border-2 focus:border-[#4B2E83]"
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
        aria-labelledby="success-modal-title"
        aria-describedby="success-modal-description"
      />

      {/* Error Popup */}
      <StatusModal
        isOpen={showErrorPopup}
        onClose={() => setShowErrorPopup(false)}
        type="error"
        title="שגיאה"
        message={errorMessage}
        aria-labelledby="error-modal-title"
        aria-describedby="error-modal-description"
      />
    </div>
  );
};

export default ClassDetailsModal;
