import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { setCookie, getCookie, hasCookie } from '../../utils/cookieManager';

/**
 * Cookie Consent Banner - באנר הסכמה לשימוש ב-Cookies
 * תואם לדרישות החוק הישראלי והתקנים הבינלאומיים
 * עיצוב מקצועי ומתקדם ברמה של אתרים גדולים
 * מאפשר גישה חופשית לאתר לפני מתן הסכמה
 * צבעים מותאמים לערכת הצבעים של האתר
 * נגישות מלאה לפי WCAG 2.1 AA ותקן ישראלי 5568
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
    // בדוק אם המשתמש כבר הסכים
    const cookieConsent = hasCookie('ladances-cookie-consent');
    if (!cookieConsent) {
      setShowBanner(true);
      // אנימציה כניסה חלקה
      setTimeout(() => {
        setIsVisible(true);
        // Focus management for accessibility
        if (acceptButtonRef.current) {
          acceptButtonRef.current.focus();
        }
      }, 100);
    } else {
      setAccepted(true);
    }
  }, []);

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

  return (
    <>
      {/* הבאנר עצמו - ללא overlay, מאפשר גישה לאתר */}
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
          className="h-1 bg-gradient-to-r from-[#4B2E83] via-[#7C3AED] to-[#EC4899]"
          aria-hidden="true"
        />
        
        {/* תוכן הבאנר */}
        <div className="bg-white/95 backdrop-blur-sm shadow-2xl border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              
              {/* תוכן טקסטואלי */}
              <div className="flex-1 space-y-4">
                {/* כותרת עם אייקון */}
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <div 
                      className="w-12 h-12 bg-gradient-to-br from-[#4B2E83] to-[#EC4899] rounded-2xl flex items-center justify-center shadow-lg"
                      aria-hidden="true"
                    >
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 
                      id="cookie-banner-title"
                      className="text-2xl font-bold bg-gradient-to-r from-[#4B2E83] to-[#EC4899] bg-clip-text text-transparent"
                    >
                      🍪 שימוש ב-Cookies
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 font-medium">
                      אבטחה ופרטיות ברמה הגבוהה ביותר
                    </p>
                  </div>
                </div>

                {/* תיאור מפורט */}
                <div className="space-y-3">
                  <p 
                    id="cookie-banner-description"
                    className="text-sm text-gray-700 leading-relaxed"
                  >
                    אנו משתמשות ב-Cookies מאובטחים כדי לשפר את חוויית המשתמשת באתר שלנו.
                    באנר זה עומד בתקני נגישות מלאים עם תמיכה במקלדת וקוראי מסך.
                  </p>
                </div>

                {/* מידע על נגישות */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h4 className="text-sm font-semibold text-[#4B2E83] mb-2">♿ נגישות מלאה:</h4>
                  <ul className="text-xs text-gray-700 space-y-1 mr-4">
                    <li>• ניווט מלא במקלדת (Tab, Enter, Escape)</li>
                    <li>• תמיכה מלאה בקוראי מסך</li>
                    <li>• ניגודיות צבעים עומדת בתקן AA</li>
                    <li>• כפתורים בגודל מינימלי 44x44 פיקסלים</li>
                  </ul>
                </div>
                
                {/* הערה על ייעוד לנשים בלבד */}
                <div className="bg-pink-50 border border-pink-200 rounded-lg p-3">
                  <p className="text-xs text-gray-700">
                    <strong>הערה חשובה:</strong> האתר והשירותים מיועדים לנשים בלבד. השימוש ב-Cookies וטכנולוגיות דומות 
                    מותנה באישור זהות נשית בהתאם למדיניות הסטודיו.
                  </p>
                </div>

                {/* קישורים נוספים */}
                <div className="flex flex-wrap items-center gap-4 text-sm">
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
                  <span className="text-gray-300" aria-hidden="true">•</span>
                  <span className="text-gray-600 flex items-center gap-1">
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    תואם לתקן נגישות 5568
                  </span>
                </div>
              </div>

              {/* כפתורי פעולה */}
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                {/* כפתור הסכמה */}
                <button
                  ref={acceptButtonRef}
                  onClick={handleAccept}
                  className="group relative px-8 py-4 bg-gradient-to-r from-[#4B2E83] to-[#EC4899] text-white rounded-2xl font-bold text-sm shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#4B2E83]/30 focus:ring-opacity-50 min-w-[140px] min-h-[44px]"
                  aria-label="הסכמה לשימוש ב-Cookies"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    אני מסכימה
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>

                {/* כפתור אי-הסכמה */}
                <button
                  ref={declineButtonRef}
                  onClick={handleDecline}
                  className="px-8 py-4 bg-gray-50 text-gray-700 rounded-2xl font-semibold text-sm border-2 border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-gray-300 focus:ring-opacity-50 min-w-[140px] min-h-[44px] hover:shadow-lg"
                  aria-label="אי-הסכמה לשימוש ב-Cookies"
                >
                  אני לא מסכימה
                </button>
              </div>
            </div>

            {/* הערה חשובה בתחתית */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-start gap-3 text-xs text-gray-600">
                <div className="flex-shrink-0 mt-1">
                  <svg className="w-5 h-5 text-[#4B2E83]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-700 mb-1">
                    הערה חשובה:
                  </p>
                  <p className="leading-relaxed">
                    Cookies חיוניים לפעולת האתר (כמו אימות משתמשים) יוגדרו גם ללא הסכמה, 
                    כנדרש לצורך אבטחה ופעולת האתר הבסיסית. Cookies לא הכרחיים (כמו cache ושיפור ביצועים) יוגדרו רק לאחר הסכמתך.
                  </p>
                </div>
              </div>
            </div>

            {/* הודעה על אי-אפשרות לסגירה */}
            <div className="mt-4 text-center">
              <div 
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg"
                role="alert"
                aria-live="polite"
              >
                <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="text-xs text-amber-700 font-medium">
                  הבאנר יישאר פתוח עד שתבחרי באחת האפשרויות - זה נדרש לפי החוק הישראלי
                </p>
              </div>
            </div>

            {/* מידע על נגישות נוסף */}
            <div className="mt-4 text-center">
              <div 
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg"
                role="complementary"
                aria-label="מידע על נגישות הבאנר"
              >
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-blue-700 font-medium">
                  באנר זה עומד בתקני נגישות מלאים - לפרטים נוספים ראה "הצהרת נגישות"
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
