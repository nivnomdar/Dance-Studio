
import { useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

interface LogoutSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const LogoutSuccessModal = ({ isOpen, onClose, onConfirm }: LogoutSuccessModalProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  // Check if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
    focusables[0]?.focus();

    document.body.style.overflow = 'hidden';

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
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, getFocusableElements]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4" role="presentation" onClick={onClose}>
      <div ref={dialogRef} className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-sm sm:max-w-md w-full mx-auto overflow-hidden border border-white/20" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="logout-success-title" aria-describedby="logout-success-desc" tabIndex={-1} aria-expanded={isOpen}>
        {/* Header */}
        <div className="bg-gradient-to-r from-[#4B2E83] to-[#EC4899] p-4 sm:p-6 text-white text-center relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" aria-hidden="true"></div>
          
          {/* Close Button - X */}
          <button
            onClick={onClose}
            className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200 group"
            aria-label="סגירת המודל"
            title="סגירה"
          >
            <svg 
              className={`w-5 h-5 sm:w-6 sm:h-6 text-white ${!prefersReducedMotion ? 'group-hover:scale-110 transition-transform duration-200' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
          
          {/* Logo or Icon */}
          <div className="relative z-10 mb-4 sm:mb-6">
            <motion.svg 
              className="w-16 h-16 sm:w-20 sm:h-20 text-green-400 mx-auto drop-shadow-lg"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </motion.svg>
          </div>
          
          {/* Title */}
          <div className="relative z-10">
            <h2 id="logout-success-title" className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 font-agrandir-grand">התנתקות מוצלחת! 👋</h2>
            <p id="logout-success-desc" className="text-sm sm:text-base text-white/90">התנתקת בהצלחה מהמערכת.</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          <p className="text-gray-600 text-sm text-center mb-6">
            אשמח לראות אותך שוב בקרוב!
          </p>
          
          {/* Button */}
          <button
            onClick={onConfirm}
            className="w-full bg-[#EC4899] hover:bg-[#EC4899]/90 text-white py-3 px-6 rounded-xl font-bold transition-colors duration-200"
            aria-label="חזרי לדף הבית"
          >
            חזרי לדף בית
          </button>
        </div>
      </div>
    </div>
  );
};
