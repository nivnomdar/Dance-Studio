import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaWaze } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { MarketingConsentForm } from '../MarketingConsentForm';

const Footer: React.FC = () => {
  const { profile } = useAuth();
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [newsletterMessage, setNewsletterMessage] = useState<{ type: 'success' | 'error' | null; text: string }>({ type: null, text: '' });
  const navigate = useNavigate();

  // Check if user is logged in and needs marketing consent form
  const shouldShowMarketingForm = profile && !profile.marketing_consent;
  const userEmail = profile?.email || '';

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setNewsletterMessage({ type: 'error', text: 'אנא הזיני כתובת אימייל תקינה' });
      return;
    }

    // העברת המשתמש לדף יצירת קשר עם האימייל שכבר מלא
    navigate(`/contact?email=${encodeURIComponent(email.trim())}`);
  };

  const handleMarketingSuccess = () => {
    // The profile will be updated via the AuthContext
    // No need to force a re-render - the state will update automatically
    // Just reset the email input
    setEmail('');
  };

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Logo and Description */}
          <div className="lg:col-span-1">
            <h4 className="text-lg font-semibold text-pink-400 ">סטודיו</h4>
            <div className="flex items-center mb-4">
              <img 
                src="https://login.ladances.com/storage/v1/object/public/homePage/navbar/ladances-LOGO.svg" 
                alt="סטודיו לריקוד של אביגיל" 
                className="h-16 w-auto ml-3"
              />
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              סטודיו מקצועי ללימודי ריקוד על עקבים מתאים לגילאי 18+. 
              אני מאמינה שכל אישה יכולה לרקוד ולגלות את התשוקה לתנועה.
            </p>
            <h4 className="text-lg font-semibold text-pink-400 mb-4">עקבי אחרי</h4>
            <div className="flex justify-center items-center gap-6">
              <a 
                href="https://www.instagram.com/avigailladani?igsh=MXc4ZXU5cGdsM3U2cw==" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group relative p-2.5 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:shadow-pink-500/25"
                aria-label="עקבי אחרי באינסטגרם (נפתח בחלון חדש)"
                title="אינסטגרם"
              >
                <svg className="w-5 h-5 text-white drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  אינסטגרם - Instagram
                </div>
              </a>
              <a 
                href="https://www.facebook.com/alina.ladani.2025?locale=he_IL" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group relative p-2.5 rounded-full bg-[#1877F2] hover:bg-[#166FE5] transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:shadow-blue-500/25"
                aria-label="עקבי אחרי בפייסבוק (נפתח בחלון חדש)"
                title="פייסבוק"
              >
                <svg className="w-5 h-5 text-white drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  פייסבוק - Facebook
                </div>
              </a>
              {/* TODO: החלף במספר וואטסאפ אמיתי */}
              <a 
                href="https://wa.me/972501234567" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group relative p-2.5 rounded-full bg-[#25D366] hover:bg-[#22C55E] transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:shadow-green-500/25"
                aria-label="צרי קשר בווטסאפ (נפתח בחלון חדש)"
                title="ווטסאפ"
              >
                <svg className="w-5 h-5 text-white drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  ווטסאפ - WhatsApp
                </div>
              </a>
              <a 
                href="https://ul.waze.com/ul?place=EitZb3NlZiBMaXNoYW5za2kgQmx2ZCwgUmlzaG9uIExlWmlvbiwgSXNyYWVsIi4qLAoUChIJyUzrhYSzAhURYAgXG887oa8SFAoSCf9mqyc4tAIVEbh6GldKxbwX&ll=31.99049600%2C34.76588500&navigate=yes&utm_campaign=default&utm_source=waze_website&utm_medium=lm_share_location" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group relative p-2.5 rounded-full bg-[#33CCFF] hover:bg-[#2BB5E6] transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:shadow-blue-400/25"
                aria-label="נווטי לסטודיו בוויז (נפתח בחלון חדש)"
                title="וויז"
              >
                <FaWaze className="w-5 h-5 text-white drop-shadow-sm" aria-hidden="true" />
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  וויז - Waze
                </div>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-1">
            <h4 className="text-lg font-semibold text-pink-400 mb-4">ניווט מהיר</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-300 hover:text-pink-400 transition-colors duration-200 flex items-center">
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                  </svg>
                  דף הבית
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-pink-400 transition-colors duration-200 flex items-center">
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  אודות
                </Link>
              </li>
              <li>
                <Link to="/classes" className="text-gray-300 hover:text-pink-400 transition-colors duration-200 flex items-center">
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                  </svg>
                  שיעורים
                </Link>
              </li>
              {/* הצג לינק לשיעור ניסיון - הלוגיקה הגלובלית הוסרה, קישור תמיד זמין */}
              {(
                <li>
                  <Link to="/classes" className="text-amber-400 hover:text-amber-300 transition-colors duration-200 flex items-center font-medium">
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    שיעור ניסיון
                  </Link>
                </li>
              )}
              <li>
                <Link to="/shop" className="text-gray-300 hover:text-pink-400 transition-colors duration-200 flex items-center">
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                  </svg>
                  חנות
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-pink-400 transition-colors duration-200 flex items-center">
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                  צור קשר
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="lg:col-span-1">
            <h4 className="text-lg font-semibold text-pink-400 mb-4">פרטי קשר</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 space-x-reverse">
                <svg className="ml-2 w-4 h-4 text-pink-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <a 
                  href="https://ul.waze.com/ul?place=EitZb3NlZiBMaXNoYW5za2kgQmx2ZCwgUmlzaG9uIExlWmlvbiwgSXNyYWVsIi4qLAoUChIJyUzrhYSzAhURYAgXG887oa8SFAoSCf9mqyc4tAIVEbh6GldKxbwX&ll=31.99049600%2C34.76588500&navigate=yes&utm_campaign=default&utm_source=waze_website&utm_medium=lm_share_location" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-pink-400 transition-colors duration-200 text-sm"
                >
                  <p>רחוב יוסף לישנסקי 6</p>
                  <p>ראשון לציון, ישראל</p>
                </a>
              </div>
              
              <div className="flex items-center space-x-3 space-x-reverse">
                <svg className="ml-2 w-4 h-4 text-pink-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                <a href="tel:+972-3-1234567" className="text-gray-300 hover:text-pink-400 transition-colors duration-200 text-sm">
                  03-1234567
                </a>
              </div>
              
              <div className="flex items-center space-x-3 space-x-reverse">
                <svg className="ml-2 w-4 h-4 text-pink-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                <a href="mailto:info@ladances.com" className="text-gray-300 hover:text-pink-400 transition-colors duration-200 text-sm">
                  info@ladances.com
                </a>
              </div>
              
              <div className="flex items-center space-x-3 space-x-reverse">
                <svg className="ml-2 w-4 h-4 text-pink-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <div>
                  <p className="text-gray-300 text-sm">ראשון עד חמישי: 18:00, 19:00, 20:00</p>
                </div>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-1">
            <h4 className="text-lg font-semibold text-pink-400 mb-4">
              {shouldShowMarketingForm ? 'הישארי מעודכנת' : 'צרי קשר'}
            </h4>
            <p className="text-gray-300 text-sm mb-4">
              {shouldShowMarketingForm 
                ? 'הזיני את האימייל שלך כדי לקבל עדכונים, מבצעים וחדשות מהסטודיו'
                : 'הזיני את האימייל שלך ונעבור לטופס יצירת קשר להשלמת הפרטים'
              }
            </p>
            {shouldShowMarketingForm ? (
              <MarketingConsentForm userEmail={userEmail} onSuccess={handleMarketingSuccess} />
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="האימייל שלך"
                  required
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400"
                />
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-medium py-2 px-4 rounded-md transition-all duration-200 transform hover:scale-105 flex items-center justify-center"
                >
                  המשיכי לטופס יצירת קשר
                </button>
                
                {/* הודעת שגיאה */}
                {newsletterMessage.type === 'error' && (
                  <div className="p-3 rounded-md border-2 bg-red-900/20 border-red-500/30 text-red-300">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2 bg-red-400"></div>
                      <span className="text-sm font-medium">{newsletterMessage.text}</span>
                    </div>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © {currentYear} סטודיו אביגיל לדאנס לריקוד על עקבים. כל הזכויות שמורות.
            </div>
            
            <div className="flex items-center gap-1.5 text-sm">
                <Link to="/privacy-policy" className="text-gray-400 hover:text-pink-400 transition-colors duration-200">
                  מדיניות פרטיות
                </Link>
                <span className="text-gray-500 text-xs">•</span>
                <Link to="/terms-of-service" className="text-gray-400 hover:text-pink-400 transition-colors duration-200">
                  תנאי שימוש
                </Link>
                <span className="text-gray-500 text-xs">•</span>
                <Link to="/accessibility-statement" className="text-gray-400 hover:text-pink-400 transition-colors duration-200">
                  הצהרת נגישות
                </Link>
                <span className="text-gray-500 text-xs">•</span>
                <Link to="/physical-accessibility" className="text-gray-400 hover:text-pink-400 transition-colors duration-200">
                  נגישות פיזית
                </Link>
            </div>
          </div>
          
          {/* Developer Credit */}
          <div className="mt-4 pt-4 border-t border-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
              <div className="text-gray-500 text-xs flex items-center">
               
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <span className="text-gray-500 text-xs">פותח על ידי:</span>
                <a 
                  href="https://portfolio-teal-pi-42.vercel.app" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-pink-400 hover:text-pink-300 transition-colors duration-200 text-xs font-medium flex items-center"
                >
                  <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
                  </svg>
                  Nif-Web
                </a>
                <span className="text-gray-500 text-xs">•</span>
               
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 