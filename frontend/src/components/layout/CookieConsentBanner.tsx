import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { setCookie, getCookie, hasCookie } from '../../utils/cookieManager';

/**
 * Cookie Consent Banner - באנר הסכמה לשימוש ב-Cookies
 * תואם לדרישות החוק הישראלי והתקנים הבינלאומיים
 */
export const CookieConsentBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    // בדוק אם המשתמש כבר הסכים
    const cookieConsent = hasCookie('ladances-cookie-consent');
    if (!cookieConsent) {
      setShowBanner(true);
    } else {
      setAccepted(true);
    }
  }, []);

  const handleAccept = () => {
    // שמירת הסכמה ב-Cookie עם תוקף של שנה
    setCookie('ladances-cookie-consent', 'true', { expires: 365 });
    setAccepted(true);
    setShowBanner(false);
  };

  const handleDecline = () => {
    // שמירת אי-הסכמה ב-Cookie עם תוקף של שנה
    setCookie('ladances-cookie-consent', 'false', { expires: 365 });
    setAccepted(true);
    setShowBanner(false);
    // Note: Essential cookies will still be set for site functionality
  };

  if (!showBanner || accepted) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-lg z-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              🍪 שימוש ב-Cookies
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              אנו משתמשים ב-Cookies כדי לשפר את חוויית המשתמש באתר שלנו. 
              Cookies אלה נחוצים לפעולת האתר הבסיסית ולשמירת העדפות המשתמש. 
              על ידי המשך השימוש באתר, אתה מסכים לשימוש ב-Cookies בהתאם ל
              <Link 
                to="/privacy-policy" 
                className="text-blue-600 hover:text-blue-800 underline mx-1"
              >
                מדיניות הפרטיות
              </Link>
              שלנו.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              onClick={handleAccept}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
            >
              אני מסכים
            </button>
            <button
              onClick={handleDecline}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors duration-200 text-sm font-medium"
            >
              אני לא מסכים
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentBanner;
