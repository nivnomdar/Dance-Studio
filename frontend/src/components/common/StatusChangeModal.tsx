import React, { useEffect, useRef, useCallback } from 'react';

interface StatusChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (options?: { returnCredit?: boolean; deductCredit?: boolean }) => void;
  currentStatus: string;
  newStatus: string;
  registrationInfo: {
    userName: string;
    className: string;
    sessionName: string;
    date: string;
    time: string;
  };
  isLoading?: boolean;
}

export default function StatusChangeModal({
  isOpen,
  onClose,
  onConfirm,
  currentStatus,
  newStatus,
  registrationInfo,
  isLoading = false
}: StatusChangeModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  const getFocusableElements = useCallback((): HTMLElement[] => {
    const container = modalRef.current;
    if (!container) return [];
    const selectors = [
      'a[href]', 'button:not([disabled])', 'textarea:not([disabled])', 'input:not([disabled])', 'select:not([disabled])', '[tabindex]:not([tabindex="-1"])'
    ];
    return Array.from(container.querySelectorAll<HTMLElement>(selectors.join(','))).filter(el => !el.hasAttribute('disabled') && el.tabIndex !== -1 && el.offsetParent !== null);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    const focusables = getFocusableElements();
    const target = focusables[0] || modalRef.current;
    target?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key === 'Tab') {
        const items = getFocusableElements();
        if (items.length === 0) {
          e.preventDefault();
          return;
        }
        const first = items[0];
        const last = items[items.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (e.shiftKey) {
          if (active === first || !items.includes(active as HTMLElement)) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (active === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      previouslyFocusedRef.current?.focus?.();
    };
  }, [isOpen, onClose, getFocusableElements]);

  if (!isOpen) return null;

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'active':
        return { text: 'פעיל', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
      case 'cancelled':
        return { text: 'בוטל', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
      default:
        return { text: status, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' };
    }
  };

  const currentStatusDisplay = getStatusDisplay(currentStatus);
  const newStatusDisplay = getStatusDisplay(newStatus);

  const [returnCredit, setReturnCredit] = React.useState(true);
  const [deductCredit, setDeductCredit] = React.useState(true);

  const handleConfirm = () => {
    onConfirm({ returnCredit, deductCredit });
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-3 md:p-4"
      role="presentation"
      onClick={onClose}
    >
      <div 
        ref={modalRef}
        className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-2xl max-w-sm sm:max-w-md w-full mx-auto overflow-hidden border border-white/20"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="status-change-title"
        aria-describedby="status-change-description"
        tabIndex={-1}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#4B2E83] to-[#EC4899] p-3 sm:p-4 md:p-4 lg:p-3 xl:p-2 text-white text-center relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" aria-hidden="true"></div>
          
          {/* Warning Icon */}
          <div className="relative z-10 mb-2 sm:mb-3 md:p-4 lg:p-3 xl:p-2">
            <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-12 lg:h-12 xl:w-10 xl:h-10 bg-white/20 rounded-full flex items-center justify-center mx-auto shadow-lg" aria-hidden="true">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-6 lg:h-6 xl:w-5 xl:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
          
          {/* Title */}
          <div className="relative z-10">
            <h2 id="status-change-title" className="text-base sm:text-lg md:text-xl lg:text-lg xl:text-base font-bold mb-1 font-agrandir-grand leading-tight">
              שינוי סטטוס הרשמה
            </h2>
            <p id="status-change-description" className="text-xs sm:text-sm md:text-sm lg:text-xs text-white/90">אנא אשרי את השינוי</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 md:p-4 lg:p-3 xl:p-2">
          {/* Registration Info */}
          <div className="bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5 border border-[#EC4899]/20 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-4 lg:p-3 xl:p-2 mb-3 sm:mb-4">
            <h3 className="text-sm sm:text-base md:text-lg lg:text-base xl:text-sm font-semibold text-[#4B2E83] mb-2 sm:mb-3 md:mb-3 lg:mb-2 text-center">פרטי ההרשמה</h3>
            
            <div className="space-y-1.5 sm:space-y-2 md:space-y-2.5 lg:space-y-1.5 xl:space-y-1 text-xs sm:text-sm md:text-sm lg:text-xs text-gray-700">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-0.5 sm:gap-0">
                <span className="font-medium text-right sm:text-left">משתמש:</span>
                <span className="font-bold text-[#4B2E83] text-right sm:text-left">
                  {registrationInfo.userName}
                </span>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-0.5 sm:gap-0">
                <span className="font-medium text-right sm:text-left">שיעור:</span>
                <span className="font-bold text-[#4B2E83] text-right sm:text-left">
                  {registrationInfo.className}
                </span>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-0.5 sm:gap-0">
                <span className="font-medium text-right sm:text-left">קבוצה:</span>
                <span className="font-bold text-[#4B2E83] text-right sm:text-left">
                  {registrationInfo.sessionName}
                </span>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-0.5 sm:gap-0">
                <span className="font-medium text-right sm:text-left">תאריך:</span>
                <span className="font-bold text-[#4B2E83] text-right sm:text-left">
                  {registrationInfo.date}
                </span>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-0.5 sm:gap-0">
                <span className="font-medium text-right sm:text-left">שעה:</span>
                <span className="font-bold text-[#4B2E83] text-right sm:text-left">
                  {registrationInfo.time}
                </span>
              </div>
            </div>
          </div>

          {/* Status Change */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-4 lg:p-3 xl:p-2 mb-3 sm:mb-4">
            <div className="flex items-start gap-1.5 sm:gap-2 md:gap-2.5 lg:gap-1.5 xl:gap-1">
              <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5 lg:w-4 lg:h-4 xl:w-3 xl:h-3 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" aria-hidden="true">
                <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3 md:h-3 lg:w-2.5 lg:h-2.5 xl:w-2 xl:h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-right flex-1">
                <h4 className="font-semibold text-blue-900 mb-2 text-xs sm:text-sm md:text-sm lg:text-xs">שינוי סטטוס</h4>
                                 <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2">
                   <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${currentStatusDisplay.bg} ${currentStatusDisplay.color} border ${currentStatusDisplay.border}`}>
                     {currentStatusDisplay.text}
                   </span>
                   <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                   </svg>
                   <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${newStatusDisplay.bg} ${newStatusDisplay.color} border ${newStatusDisplay.border}`}>
                     {newStatusDisplay.text}
                   </span>
                 </div>
                <p className="text-xs text-blue-800">
                  האם את בטוחה שברצונך לשנות את סטטוס ההרשמה מ-<strong>{currentStatusDisplay.text}</strong> ל-<strong>{newStatusDisplay.text}</strong>?
                </p>
              </div>
            </div>
          </div>

          {/* Credit Return Toggle - only if moving to cancelled */}
          {newStatus === 'cancelled' && (
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-4 lg:p-3 xl:p-2 mb-3 sm:mb-4">
              <div className="flex items-center gap-2">
                <input
                  id="returnCreditToggle"
                  type="checkbox"
                  checked={returnCredit}
                  onChange={(e) => setReturnCredit(e.target.checked)}
                  className="w-4 h-4 text-amber-600 border-amber-300 rounded focus:ring-amber-500"
                  aria-describedby="returnCreditHelp"
                />
                <label htmlFor="returnCreditToggle" className="text-xs sm:text-sm text-amber-800 font-medium">
                  החזר קרדיט למשתמש על ביטול הרשמה זו
                </label>
              </div>
              <p id="returnCreditHelp" className="text-[11px] sm:text-xs text-amber-700 mt-1">
                אם מסומן, יוחזר קרדיט מתאים (קבוצתי/פרטי) בהתאם להרשמה. אם לא מסומן, הקרדיט לא יוחזר.
              </p>
            </div>
          )}

          {/* Credit Deduct Toggle - only if moving to active */}
          {newStatus === 'active' && (
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-4 lg:p-3 xl:p-2 mb-3 sm:mb-4">
              <div className="flex items-center gap-2">
                <input
                  id="deductCreditToggle"
                  type="checkbox"
                  checked={deductCredit}
                  onChange={(e) => setDeductCredit(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 border-emerald-300 rounded focus:ring-emerald-500"
                  aria-describedby="deductCreditHelp"
                />
                <label htmlFor="deductCreditToggle" className="text-xs sm:text-sm text-emerald-800 font-medium">
                  ניכוי קרדיט למשתמש על הפעלה מחדש של ההרשמה
                </label>
              </div>
              <p id="deductCreditHelp" className="text-[11px] sm:text-xs text-emerald-700 mt-1">
                אם מסומן, ינוכה קרדיט מתאים (קבוצתי/פרטי) בהתאם להרשמה. אם לא מסומן, לא ינוכה קרדיט.
              </p>
            </div>
          )}
          
          {/* Buttons */}
          <div className="space-y-1.5 sm:space-y-2 md:space-y-2.5 lg:space-y-1.5 xl:space-y-1">
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#EC4899] to-[#4B2E83] hover:from-[#4B2E83] hover:to-[#EC4899] text-white py-2 sm:py-2.5 md:py-3 lg:py-2 xl:py-1.5 px-3 sm:px-4 md:px-5 lg:px-3 xl:px-2 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm md:text-sm lg:text-xs transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={`${isLoading ? 'מעדכנת' : 'אשרי'} שינוי סטטוס מ-${currentStatusDisplay.text} ל-${newStatusDisplay.text}`}
            >
              {isLoading ? 'מעדכנת...' : 'אשרי שינוי'}
            </button>
            
            <button
              onClick={onClose}
              disabled={isLoading}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 sm:py-2.5 md:py-3 lg:py-2 xl:py-1.5 px-3 sm:px-4 md:px-5 lg:px-3 xl:px-2 rounded-lg sm:rounded-xl font-medium transition-colors duration-200 text-xs sm:text-sm md:text-sm lg:text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="ביטול שינוי סטטוס"
            >
              ביטול
            </button>
          </div>
        </div>

        {/* Close Button */}
        <div className="p-1.5 sm:p-2 md:p-3 lg:p-2 xl:p-1 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-full py-1.5 sm:py-2 md:py-2.5 lg:py-1.5 xl:py-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200 font-medium text-xs sm:text-sm md:text-sm lg:text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="חזרה לחלונית הקודמת"
          >
            חזרה
          </button>
        </div>
      </div>
    </div>
  );
} 