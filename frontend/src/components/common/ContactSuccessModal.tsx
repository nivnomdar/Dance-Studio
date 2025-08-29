import { useEffect, useRef, useCallback } from 'react';

interface ContactSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactSuccessModal = ({ isOpen, onClose }: ContactSuccessModalProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const getFocusableElements = useCallback((): HTMLElement[] => {
    const container = dialogRef.current;
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
    const target = focusables[0] || dialogRef.current;
    target?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
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
  }, [isOpen, getFocusableElements]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4" onClick={onClose} role="presentation">
      <div ref={dialogRef} className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-sm sm:max-w-md w-full mx-auto overflow-hidden border border-white/20" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="contact-success-title" aria-describedby="contact-success-desc" tabIndex={-1}>
        <div className="bg-gradient-to-r from-[#4B2E83] to-[#EC4899] p-4 sm:p-6 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" aria-hidden="true"></div>
          <div className="relative z-10 mb-4 sm:mb-6">
            <img src="https://login.ladances.com/storage/v1/object/public/homePage/navbar/ladances-LOGO.svg" alt="Ladance Avigail" className="h-17 sm:h-22 w-auto mx-auto drop-shadow-lg" />
          </div>
          <div className="relative z-10">
            <h2 id="contact-success-title" className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 font-agrandir-grand">תודה!</h2>
            <p id="contact-success-desc" className="text-sm sm:text-base text-white/90">ההודעה נשלחה. אחזור אליך בהקדם.</p>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center bg-green-100 text-green-600" aria-hidden="true">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-center text-[#4B2E83]/80">תודה שפנית. ההודעה התקבלה במערכת.</p>
        </div>

        <div className="p-3 sm:p-4 border-t border-gray-100 bg-gray-50/50">
          <button onClick={onClose} className="w-full py-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200 font-medium">
            חזרה
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactSuccessModal;


