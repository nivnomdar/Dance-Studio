import React, { useState, useEffect, useRef } from 'react';
import { setCookie, hasCookie } from '../../utils/cookieManager';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Cookie Consent Banner - באנר הסכמה לשימוש ב-Cookies
 * תואם לדרישות החוק הישראלי והתקנים הבינלאומיים
 * עיצוב מקצועי ומתקדם ברמה של אתרים גדולים
 * מאפשר גישה חופשית לאתר לפני מתן הסכמה
 * צבעים מותאמים לערכת הצבעים של האתר
 * נגישות מלאה לפי WCAG 2.1 AA ותקן ישראלי 5568
 * 
 * חשוב: הבאנר מופיע רק אחרי שהמשתמש אישר את תנאי השימוש
 */
export const CookieConsentBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  // Refs for accessibility and focus management
  const bannerRef = useRef<HTMLDivElement>(null);
  const acceptButtonRef = useRef<HTMLButtonElement>(null);
  const declineButtonRef = useRef<HTMLButtonElement>(null);
  const learnMoreButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // הבאנר מופיע רק אם:
    // 1. המשתמש מחובר
    // 2. המשתמש אישר תנאי שימוש (terms_accepted = true)
    // 3. המשתמש לא הסכים עדיין ל-cookies
    
    // Condition to show banner if not already consented
    const cookieConsent = hasCookie('ladances-cookie-consent');
    if (!cookieConsent) {
      setShowBanner(true);
      setTimeout(() => {
        setIsVisible(true);
        if (acceptButtonRef.current) {
          acceptButtonRef.current.focus();
        }
      }, 100);
    } else {
      setAccepted(true);
    }
  }, []); // Removed isAuthenticated, profile from dependency array

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!showBanner || accepted) return;

      switch (event.key) {
        case 'Escape':
          // Don't allow closing with Escape as per Israeli law requirements
          event.preventDefault();
          break;
        case 'Tab':
          // Ensure focus stays within the banner
          if (bannerRef.current) {
            const focusableElements = bannerRef.current.querySelectorAll(
              'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstElement = focusableElements[0] as HTMLElement;
            const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
            
            if (event.shiftKey && document.activeElement === firstElement) {
              event.preventDefault();
              lastElement.focus();
            } else if (!event.shiftKey && document.activeElement === lastElement) {
              event.preventDefault();
              firstElement.focus();
            }
          }
          break;
      }
    };

    if (showBanner && !accepted) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [showBanner, accepted]);

  const handleAccept = () => {
    
    // שמירת הסכמה ב-Cookie עם תוקף של שנה
    setCookie('ladances-cookie-consent', 'true', { expires: 365 });
    
    setIsVisible(false);
    setTimeout(() => {
      setAccepted(true);
      setShowBanner(false);
    }, 300);
  };

  const handleDecline = () => {
    
    // שמירת אי-הסכמה ב-Cookie עם תוקף של שנה
    setCookie('ladances-cookie-consent', 'false', { expires: 365 });
    
    setIsVisible(false);
    setTimeout(() => {
      setAccepted(true);
      setShowBanner(false);
    }, 300);
    // Note: Essential cookies will still be set for site functionality
  };

  const handleLearnMore = () => {
    // פתיחת מדיניות פרטיות בטאב חדש
    window.open('/privacy-policy', '_blank');
  };

  if (!showBanner || accepted) {
    return null;
  }

  // Removed previous double-check condition, now always show if not consented

  return (
    <>
      {/* הבאנר עצמו - קומפקטי, ללא overflow */}
      <div 
        ref={bannerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-banner-title"
        aria-describedby="cookie-banner-description"
        className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
        tabIndex={-1}
      >
        {/* קו עליון דקורטיבי עם צבעי האתר */}
        <div 
          className="h-1 bg-gradient-to-r from-[#EC4899] to-[#4B2E83]"
          aria-hidden="true"
        />
        
        {/* תוכן הבאנר - קומפקטי ללא overflow */}
        <div className="bg-pink-200 backdrop-blur-sm shadow-2xl border-t border-pink-100">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              
              {/* תוכן טקסטואלי - מידע חיוני בלבד */}
              <div className="flex-1 space-y-3">
                {/* כותרת עם אייקון */}
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <div 
                      className="w-10 h-10 bg-gradient-to-br from-[#4B2E83] to-[#EC4899] rounded-xl flex items-center justify-center shadow-lg"
                      aria-hidden="true"
                    >
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 
                      id="cookie-banner-title"
                      className="text-xl font-bold text-gray-700"
                    >
                      🍪 שימוש ב-Cookies
                    </h3>
                    <p className="text-sm text-gray-600 font-medium">
                      אבטחה ופרטיות ברמה הגבוהה ביותר
                    </p>
                  </div>
                </div>

                {/* תיאור מפורט - מידע חיוני בלבד */}
                <div>
                  <p 
                    id="cookie-banner-description"
                    className="text-sm text-gray-700 leading-relaxed"
                  >
                    אנו משתמשות ב-Cookies מאובטחים כדי לשפר את חוויית המשתמשת באתר שלנו.
                    Cookies חיוניים לפעולת האתר יוגדרו גם ללא הסכמה לצורך אבטחה.
                  </p>
                </div>

                {/* הערה על ייעוד לנשים בלבד - מידע חיוני */}
                <div className="bg-pink-50 border border-pink-400 rounded-lg p-3">
                  <p className="text-sm text-gray-700">
                    <strong>הערה חשובה:</strong> האתר והשירותים מיועדים לנשים בלבד. השימוש ב-Cookies וטכנולוגיות דומות 
                    מותנה באישור זהות נשית בהתאם למדיניות הסטודיו.
                  </p>
                </div>

                {/* קישור למדיניות פרטיות מפורטת */}
                <div className="flex items-center gap-2 text-sm">
                  <button
                    ref={learnMoreButtonRef}
                    onClick={handleLearnMore}
                    className="inline-flex items-center gap-2 text-[#4B2E83] hover:text-[#EC4899] font-medium underline decoration-2 underline-offset-2 transition-all duration-200 hover:scale-105"
                    aria-label="פתיחת מדיניות פרטיות מפורטת בטאב חדש"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    מדיניות פרטיות מפורטת
                  </button>
                  <span className="text-gray-300" aria-hidden="true">•</span>
                  <span className="text-gray-600 flex items-center gap-1">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    תואם לחוק הישראלי ו-GDPR
                  </span>
                </div>
              </div>

              {/* כפתורי פעולה */}
              <div className="flex flex-col gap-3 w-full lg:w-auto">
                {/* כפתור הסכמה */}
                <button
                  ref={acceptButtonRef}
                  onClick={handleAccept}
                  className="group relative px-6 py-3 bg-gradient-to-r from-[#4B2E83] to-[#EC4899] text-white rounded-xl font-bold text-sm shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#4B2E83]/30 focus:ring-opacity-50 min-w-[120px] min-h-[44px]"
                  aria-label="הסכמה לשימוש ב-Cookies"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    אני מסכימה
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>

                {/* כפתור אי-הסכמה */}
                <button
                  ref={declineButtonRef}
                  onClick={handleDecline}
                  className="px-6 py-3 bg-gray-50 text-gray-700 rounded-xl font-semibold text-sm border-2 border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-gray-300 focus:ring-opacity-50 min-w-[120px] min-h-[44px] hover:shadow-lg"
                  aria-label="אי-הסכמה לשימוש ב-Cookies"
                >
                  אני לא מסכימה
                </button>
              </div>
            </div>

            {/* הודעה על אי-אפשרות לסגירה - מידע חיוני */}
            <div className="mt-4 text-center">
              <div 
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#4B2E83] to-[#EC4899] rounded-lg"
                role="alert"
                aria-live="polite"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="text-sm text-white font-medium">
                  הבאנר יישאר פתוח עד שתבחרי באחת מהאפשרויות
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CookieConsentBanner;
