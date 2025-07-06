import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaWaze } from 'react-icons/fa';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // כאן תוכלי להוסיף לוגיקה לשליחת האימייל
    alert('תודה! נרשמת בהצלחה לעדכונים שלי.');
    setEmail('');
  };

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Logo and Description */}
          <div className="lg:col-span-1">
            <h4 className="text-lg font-semibold text-pink-400 mb-4 flex items-center">
              <img 
                src="/images/LOGOladance.png" 
                alt="סטודיו אביגיל לריקוד" 
                className="h-20 w-auto ml-3"
              />
              סטודיו אביגיל
            </h4>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              סטודיו מקצועי ללימודי ריקוד ומחול לכל הגילאים. 
              אני מאמינה שכל אחת יכולה לרקוד ולגלות את התשוקה לתנועה.
            </p>
            <h4 className="text-lg font-semibold text-pink-400 mb-3">עקבי אחרינו</h4>
            <div className="flex justify-center items-center gap-6">
              <a 
                href="https://www.instagram.com/avigailladani?igsh=MXc4ZXU5cGdsM3U2cw==" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group relative p-2.5 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:shadow-pink-500/25"
                aria-label="עקבי אחרי באינסטגרם"
                title="אינסטגרם"
              >
                <svg className="w-5 h-5 text-white drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24">
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
                aria-label="עקבי אחרי בפייסבוק"
                title="פייסבוק"
              >
                <svg className="w-5 h-5 text-white drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  פייסבוק - Facebook
                </div>
              </a>
              <a 
                href="https://wa.me/972XXXXXXXXX" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group relative p-2.5 rounded-full bg-[#25D366] hover:bg-[#22C55E] transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:shadow-green-500/25"
                aria-label="צרי קשר בווטסאפ"
                title="ווטסאפ"
              >
                <svg className="w-5 h-5 text-white drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  ווטסאפ - WhatsApp
                </div>
              </a>
              <a 
                href="https://waze.com/ul/hsv8qj8q8q" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group relative p-2.5 rounded-full bg-[#33CCFF] hover:bg-[#2BB5E6] transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:shadow-blue-400/25"
                aria-label="נווט לסטודיו בוויז"
                title="וויז"
              >
                <FaWaze className="w-5 h-5 text-white drop-shadow-sm" />
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  וויז - Waze
                </div>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-1">
            <h4 className="text-lg font-semibold text-pink-400 mb-4">ניווט מהיר</h4>
            <ul className="space-y-2">
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
              <li>
                <Link to="/trial-class" className="text-gray-300 hover:text-pink-400 transition-colors duration-200 flex items-center">
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  שיעור ניסיון
                </Link>
              </li>
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
                <FaWaze className="w-5 h-5 text-[#33CCFF] mt-0.5 flex-shrink-0" />
                <a 
                  href="https://waze.com/ul/hsv8qj8q8q" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-pink-400 transition-colors duration-200 text-sm"
                >
                  <p>רחוב יוסף לישנסקי 6</p>
                  <p>ראשון לציון, ישראל</p>
                </a>
              </div>
              
              <div className="flex items-center space-x-3 space-x-reverse">
                <svg className="w-5 h-5 text-pink-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                <a href="tel:+972-3-1234567" className="text-gray-300 hover:text-pink-400 transition-colors duration-200 text-sm">
                  03-1234567
                </a>
              </div>
              
              <div className="flex items-center space-x-3 space-x-reverse">
                <svg className="w-5 h-5 text-pink-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                <a href="mailto:info@avigaildance.com" className="text-gray-300 hover:text-pink-400 transition-colors duration-200 text-sm">
                  info@avigaildance.com
                </a>
              </div>
              
              <div className="flex items-center space-x-3 space-x-reverse">
                <svg className="w-5 h-5 text-pink-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <div>
                  <p className="text-gray-300 text-sm">שני-שלישי: 18:00, 19:00, 20:00</p>
                  <p className="text-gray-300 text-sm">שאר הימים: סגור</p>
                </div>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-1">
            <h4 className="text-lg font-semibold text-pink-400 mb-4">הישארי מעודכנת</h4>
            <p className="text-gray-300 text-sm mb-4">
              הירשמי לעדכונים על שיעורים חדשים, אירועים מיוחדים ומבצעים
            </p>
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
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                </svg>
                הרשמה
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © {currentYear} סטודיו אביגיל לריקוד. כל הזכויות שמורות.
            </div>
            
            <div className="flex items-center space-x-6 space-x-reverse text-sm">
              <Link to="/privacy" className="text-gray-400 hover:text-pink-400 transition-colors duration-200">
                מדיניות פרטיות
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-pink-400 transition-colors duration-200">
                תנאי שימוש
              </Link>
              <Link to="/sitemap" className="text-gray-400 hover:text-pink-400 transition-colors duration-200">
                מפת האתר
              </Link>
            </div>
          </div>
          
          {/* Developer Credit */}
          <div className="mt-4 pt-4 border-t border-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
              <div className="text-gray-500 text-xs flex items-center">
                <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                נבנה באהבה עם React, TypeScript ו-Tailwind CSS
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <span className="text-gray-500 text-xs">פותח על ידי:</span>
                <a 
                  href="https://github.com/niv-developer" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-pink-400 hover:text-pink-300 transition-colors duration-200 text-xs font-medium flex items-center"
                >
                  <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  ניב המפתח
                </a>
                <span className="text-gray-500 text-xs">•</span>
                <a 
                  href="mailto:niv@example.com" 
                  className="text-pink-400 hover:text-pink-300 transition-colors duration-200 text-xs flex items-center"
                >
                  <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                  niv@example.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 