import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { usePopup } from '../../contexts/PopupContext';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useProfile } from '../../hooks/useProfile';
import SecondaryNavbar from './SecondaryNavbar';
import { GoogleLoginModal } from '../GoogleLogin';
import { LogoutSuccessModal } from '../LogoutSuccessModal';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [showLogoutSuccess, setShowLogoutSuccess] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigate = useNavigate();
  const { showPopup } = usePopup();
  const { user, profile, signOut } = useAuth();
  const { profile: localProfile } = useProfile();

  // Use useCart unconditionally
  const { cartCount, clearCart } = useCart();
  
  const currentProfile = localProfile || profile;

  // לוגים לדיבוג - הוסרו כי הכל עובד

  // האזנה לשינויים בסטטוס ההתחברות רק לפופאפ
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // בדיקה אם זה לא רענון דף
        const isPageRefresh = session?.user?.app_metadata?.provider === 'google';
        
        if (!isPageRefresh) {
          showPopup({
            title: 'התחברות מוצלחת',
            message: 'ברוך הבא! התחברת בהצלחה למערכת.',
            type: 'success',
            duration: 3000
          });
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [showPopup]);

  const handleLoginClick = () => {
    setShowLoginModal(true);
  };

  /**
   * טיפול בהתנתקות המשתמש
   * מציג הודעות למשתמש ומנקה את המידע
   */
  const handleLogout = async () => {
    try {
      // סגירת התפריטים מיד
      setIsProfileMenuOpen(false);
      setIsMenuOpen(false);

      // ניקוי הסל לפני ההתנתקות
      clearCart();

      // התנתקות מהמערכת
      await signOut();

      // ניקוי cookies
      // Note: Cookies will be cleared automatically when expired

      // הצגת modal התנתקות מוצלחת
      setShowLogoutSuccess(true);
        
    } catch (error) {
      console.error('Logout error:', error);
      showPopup({
        title: 'שגיאת התנתקות',
        message: 'אירעה שגיאה בניסיון להתנתק. אנא נסה שוב.',
        type: 'error',
        duration: 4000
      });
    }
  };

  // סגירת התפריט כשלוחצים מחוץ לו
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.profile-menu') && !target.closest('.profile-button')) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 bg-gradient-to-r from-[#4B2E83] to-[#EC4899] shadow-lg z-50">
      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-visible">
        <div className="flex justify-between items-center h-12 overflow-visible">
          {/* Desktop Layout */}
          <div className="hidden md:flex items-center overflow-visible">
            {/* Login/Profile Button - Left side */}
            {user && profile ? (
              <div className="relative overflow-visible">
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(!isProfileMenuOpen);
                    setIsMenuOpen(false); // סגירת התפריט הנייד כשהפרופיל נפתח
                  }}
                  className="text-[#FDF9F6] hover:text-black p-2 transition-colors duration-200 profile-button"
                  title="פרופיל משתמש"
                  aria-haspopup="menu"
                  aria-expanded={isProfileMenuOpen}
                  aria-controls="profile-menu-desktop"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" fill="currentColor" aria-hidden="true" />
                  </svg>
                </button>
                {isProfileMenuOpen && (
                  <div id="profile-menu-desktop" role="menu" aria-label="תפריט פרופיל" className="absolute right-0 top-full mt-1 w-48 rounded-md shadow-lg bg-[#EC4899] ring-1 ring-black ring-opacity-5 profile-menu z-[9999] border-2 border-white">
                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="block w-full text-right px-4 py-2 text-sm text-[#FDF9F6] hover:bg-[#EC4899]/80 hover:text-black transition-colors duration-200"
                        role="menuitem"
                      >
                        פרופיל משתמש
                      </Link>
                      {/* הצג כפתור דשבורד מנהלים רק למנהלים */}
                      {currentProfile?.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="block w-full text-right px-4 py-2 text-sm text-[#FDF9F6] hover:bg-[#EC4899]/80 hover:text-black transition-colors duration-200"
                          role="menuitem"
                        >
                          דשבורד מנהלים
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="block w-full text-right px-4 py-2 text-sm text-[#FDF9F6] hover:bg-[#EC4899]/80 hover:text-black transition-colors duration-200"
                        role="menuitem"
                      >
                        התנתק
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={handleLoginClick}
                className="text-[#FDF9F6] hover:text-black p-2 transition-colors duration-200"
                title="התחבר"
                aria-label="פתיחת חלונית התחברות"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="8" r="4" strokeWidth="1.5" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" aria-hidden="true" />
                </svg>
              </button>
            )}
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden flex items-center -space-x-2 overflow-visible">
            {/* Menu Button */}
            <button
              onClick={() => {
                setIsMenuOpen(!isMenuOpen);
                setIsProfileMenuOpen(false); // סגירת התפריט הפרופיל כשהתפריט הנייד נפתח
              }}
              className="inline-flex items-center justify-center p-2 rounded-md text-[#FDF9F6] hover:text-black hover:bg-[#EC4899] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#E6C17C] transition-colors duration-200"
              aria-label={isMenuOpen ? 'סגירת תפריט' : 'פתיחת תפריט'}
              aria-controls="mobile-menu"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">פתח תפריט</span>
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" aria-hidden="true" />
              </svg>
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" aria-hidden="true" />
              </svg>
            </button>
            
            {/* Login/Profile Button - Left side on mobile */}
            {user && profile ? (
              <div className="relative overflow-visible">
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(!isProfileMenuOpen);
                    setIsMenuOpen(false); // סגירת התפריט הנייד כשהפרופיל נפתח
                  }}
                  className="text-[#FDF9F6] hover:text-black p-2 transition-colors duration-200 profile-button"
                  title="פרופיל משתמש"
                  aria-haspopup="menu"
                  aria-expanded={isProfileMenuOpen}
                  aria-controls="profile-menu-mobile"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" fill="currentColor" aria-hidden="true" />
                  </svg>
                </button>
                {isProfileMenuOpen && (
                  <div id="profile-menu-mobile" role="menu" aria-label="תפריט פרופיל" className="absolute right-0 top-full mt-1 w-48 rounded-md shadow-lg bg-[#EC4899] ring-1 ring-black ring-opacity-5 profile-menu z-[9999] border-2 border-white">
                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="block w-full text-right px-4 py-2 text-sm text-[#FDF9F6] hover:bg-[#EC4899]/80 hover:text-black transition-colors duration-200"
                        role="menuitem"
                      >
                        פרופיל משתמש
                      </Link>
                      {/* הצג כפתור דשבורד מנהלים רק למנהלים */}
                      {currentProfile?.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="block w-full text-right px-4 py-2 text-sm text-[#FDF9F6] hover:bg-[#EC4899]/80 hover:text-black transition-colors duration-200"
                          role="menuitem"
                        >
                          דשבורד מנהלים
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="block w-full text-right px-4 py-2 text-sm text-[#FDF9F6] hover:bg-[#EC4899]/80 hover:text-black transition-colors duration-200"
                        role="menuitem"
                      >
                        התנתק
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={handleLoginClick}
                className="text-[#FDF9F6] hover:text-black p-2 transition-colors duration-200"
                title="התחבר"
                aria-label="פתיחת חלונית התחברות"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="8" r="4" strokeWidth="1.5" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" aria-hidden="true" />
                </svg>
              </button>
            )}
          </div>

          {/* Logo - Center for both mobile and desktop */}
          <div className="flex-shrink-0 absolute left-1/2 transform -translate-x-1/2 z-[60]">
            <Link to="/" className="flex items-center">
              <img
                src="https://login.ladances.com/storage/v1/object/public/homePage/navbar/ladances-LOGO.svg"
                alt="Ladance Avigail"
                className="h-20 w-auto -mt-8 mb-1 sm:h-20 sm:-mt-8 sm:mb-1 md:h-26 md:-mt-8 md:mb-1 lg:h-30 lg:-mt-9 lg:mb-1 xl:h-30 xl:-mt-9 xl:mb-1 2xl:h-30 2xl:-mt-8.5 2xl:mb-1"
                onError={(e) => {
                  // Fallback to local image if Supabase image fails to load
                  const target = e.target as HTMLImageElement;
                  target.src = "/images/LOGOladance.png";
                }}
              />
            </Link>
          </div>

          {/* Desktop Layout - left side */}
          <div className="hidden md:flex items-center">
            {/* Shopping Cart Button - left side */}
            <Link to="/cart" className="text-[#FDF9F6] hover:text-black p-2 transition-colors duration-200 relative" title="סל קניות" aria-label={`סל קניות${cartCount > 0 ? `, ${cartCount} פריטים` : ''}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" aria-hidden="true" />
                <circle cx="9" cy="12" r="1" aria-hidden="true" />
                <circle cx="15" cy="12" r="1" aria-hidden="true" />
              </svg>
              {/* Cart Items Counter */}
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-[#EC4899] text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold border border-[#EC4899] shadow-lg">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Layout - left side */}
          <div className="md:hidden flex items-center">
            {/* Shopping Cart Button */}
            <Link to="/cart" className="text-[#FDF9F6] hover:text-black p-2 transition-colors duration-200 relative" title="סל קניות">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                <circle cx="9" cy="12" r="1" />
                <circle cx="15" cy="12" r="1" />
              </svg>
              {/* Cart Items Counter */}
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-[#EC4899] text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold border border-[#EC4899] shadow-lg">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      <SecondaryNavbar />

      {/* Mobile menu */}
      <div id="mobile-menu" className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden bg-[#FFF5F9] shadow-lg`} role="menu" aria-label="תפריט ראשי">
        <div className="px-2 pt-1 pb-2 space-y-0.5 sm:px-3 sm:pt-2 sm:pb-3 sm:space-y-1">
          <Link
            to="/"
            className="block px-2 py-1.5 sm:px-3 sm:py-2 rounded-md text-sm sm:text-base font-medium text-[#EC4899] hover:text-black hover:bg-[#EC4899]/10 transition-colors duration-200 text-right"
            onClick={() => setIsMenuOpen(false)}
            role="menuitem"
          >
            דף הבית
          </Link>
          <Link
            to="/classes"
            className="block px-2 py-1.5 sm:px-3 sm:py-2 rounded-md text-sm sm:text-base font-medium text-[#EC4899] hover:text-black hover:bg-[#EC4899]/10 transition-colors duration-200 text-right"
            onClick={() => setIsMenuOpen(false)}
            role="menuitem"
          >
            שיעורים
          </Link>
          <Link
            to="/shop"
            className="block px-2 py-1.5 sm:px-3 sm:py-2 rounded-md text-sm sm:text-base font-medium text-[#EC4899] hover:text-black hover:bg-[#EC4899]/10 transition-colors duration-200 text-right"
            onClick={() => setIsMenuOpen(false)}
            role="menuitem"
          >
            חנות
          </Link>
          <Link
            to="/contact"
            className="block px-2 py-1.5 sm:px-3 sm:py-2 rounded-md text-sm sm:text-base font-medium text-[#EC4899] hover:text-black hover:bg-[#EC4899]/10 transition-colors duration-200 text-right"
            onClick={() => setIsMenuOpen(false)}
            role="menuitem"
          >
            צור קשר
          </Link>
        </div>
      </div>
      
      {/* Logout Success Modal */}
      <LogoutSuccessModal
        isOpen={showLogoutSuccess}
        onClose={() => setShowLogoutSuccess(false)}
        onConfirm={() => {
          setShowLogoutSuccess(false);
          navigate('/', { replace: true });
          // רענון הדף אחרי 2 שניות כדי לוודא שהכל מתנקה
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }}
      />

      {/* Login Modal */}
      <GoogleLoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </nav>
  );
}

export default Navbar; 