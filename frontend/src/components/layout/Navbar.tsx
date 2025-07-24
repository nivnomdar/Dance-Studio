import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { handleAuthStateChange } from '../../lib/auth';
import { usePopup } from '../../contexts/PopupContext';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useProfile } from '../../hooks/useProfile';
import SecondaryNavbar from './SecondaryNavbar';

function Navbar() {
  // console.log('Navbar render at:', new Date().toISOString()); // Debug log
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [showLogoutSuccess, setShowLogoutSuccess] = useState(false);
  const navigate = useNavigate();
  const { showPopup } = usePopup();
  const { cartCount, clearCart } = useCart();
  const { user, profile, signOut, session } = useAuth();
  const { profile: localProfile } = useProfile();

  // שימוש בפרופיל מהטעינה המקומית קודם, אחרת מה-AuthContext
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

  const handleGoogleLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });
      
      // console.log('Navbar OAuth sign in result:', { data, error });
      
      if (error) {
        showPopup({
          title: 'שגיאת התחברות',
          message: 'אירעה שגיאה בניסיון להתחבר. אנא נסה שוב.',
          type: 'error',
          duration: 3000
        });
        throw error;
      }
    } catch (error) {
      // Handle login error silently
    }
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

      // ניקוי session storage
      sessionStorage.clear();

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
    <nav className="fixed top-0 left-0 right-0 bg-[#EC4899] shadow-lg z-50">
      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-visible">
        <div className="flex justify-between items-center h-12 overflow-visible">
          {/* Desktop Layout */}
          <div className="hidden md:flex items-center overflow-visible">
            {/* Login/Profile Button - Left side */}
            {user ? (
              <div className="relative overflow-visible">
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(!isProfileMenuOpen);
                    setIsMenuOpen(false); // סגירת התפריט הנייד כשהפרופיל נפתח
                  }}
                  className="text-[#FDF9F6] hover:text-black p-2 transition-colors duration-200 profile-button"
                  title="פרופיל משתמש"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" fill="currentColor" />
                  </svg>
                </button>
                {isProfileMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 rounded-md shadow-lg bg-[#EC4899] ring-1 ring-black ring-opacity-5 profile-menu z-[9999] border-2 border-white">
                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="block w-full text-right px-4 py-2 text-sm text-[#FDF9F6] hover:bg-[#EC4899]/80 hover:text-black transition-colors duration-200"
                      >
                        פרופיל משתמש
                      </Link>
                      {/* הצג הודעת טעינה אם הפרופיל לא נטען */}
                      {user && !currentProfile && (
                        <div className="block w-full text-right px-4 py-2 text-sm text-[#FDF9F6]">טוען פרופיל...</div>
                      )}
                      {/* הצג כפתור דשבורד מנהלים רק למנהלים */}
                      {(() => {
                        
                        return currentProfile?.role === 'admin';
                      })() && (
                        <Link
                          to="/admin"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="block w-full text-right px-4 py-2 text-sm text-[#FDF9F6] hover:bg-[#EC4899]/80 hover:text-black transition-colors duration-200"
                        >
                          דשבורד מנהלים
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="block w-full text-right px-4 py-2 text-sm text-[#FDF9F6] hover:bg-[#EC4899]/80 hover:text-black transition-colors duration-200"
                      >
                        התנתק
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={handleGoogleLogin}
                className="text-[#FDF9F6] hover:text-black p-2 transition-colors duration-200"
                title="התחבר"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="8" r="4" strokeWidth="1.5" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
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
            >
              <span className="sr-only">פתח תפריט</span>
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Login/Profile Button - Left side on mobile */}
            {user ? (
              <div className="relative overflow-visible">
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(!isProfileMenuOpen);
                    setIsMenuOpen(false); // סגירת התפריט הנייד כשהפרופיל נפתח
                  }}
                  className="text-[#FDF9F6] hover:text-black p-2 transition-colors duration-200 profile-button"
                  title="פרופיל משתמש"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" fill="currentColor" />
                  </svg>
                </button>
                {isProfileMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 rounded-md shadow-lg bg-[#EC4899] ring-1 ring-black ring-opacity-5 profile-menu z-[9999] border-2 border-white">
                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="block w-full text-right px-4 py-2 text-sm text-[#FDF9F6] hover:bg-[#EC4899]/80 hover:text-black transition-colors duration-200"
                      >
                        פרופיל משתמש
                      </Link>
                      {/* הצג הודעת טעינה אם הפרופיל לא נטען */}
                      {user && !currentProfile && (
                        <div className="block w-full text-right px-4 py-2 text-sm text-[#FDF9F6]">טוען פרופיל...</div>
                      )}
                      {/* הצג כפתור דשבורד מנהלים רק למנהלים */}
                      {(() => {
                        
                        return currentProfile?.role === 'admin';
                      })() && (
                        <Link
                          to="/admin"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="block w-full text-right px-4 py-2 text-sm text-[#FDF9F6] hover:bg-[#EC4899]/80 hover:text-black transition-colors duration-200"
                        >
                          דשבורד מנהלים
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="block w-full text-right px-4 py-2 text-sm text-[#FDF9F6] hover:bg-[#EC4899]/80 hover:text-black transition-colors duration-200"
                      >
                        התנתק
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={handleGoogleLogin}
                className="text-[#FDF9F6] hover:text-black p-2 transition-colors duration-200"
                title="התחבר"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="8" r="4" strokeWidth="1.5" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                </svg>
              </button>
            )}
          </div>

          {/* Logo - Center for both mobile and desktop */}
          <div className="flex-shrink-0 absolute left-1/2 transform -translate-x-1/2">
            <Link to="/" className="flex items-center">
              <img
                src="/images/LOGOladance.png"
                alt="Ladance Avigail"
                className="h-17 sm:h-22 w-auto -mt-1 sm:mt-4 sm:mb-4"
              />
            </Link>
          </div>

          {/* Desktop Layout - left side */}
          <div className="hidden md:flex items-center">
            {/* Shopping Cart Button - left side */}
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
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden bg-[#FFF5F9] shadow-lg`}>
        <div className="px-2 pt-1 pb-2 space-y-0.5 sm:px-3 sm:pt-2 sm:pb-3 sm:space-y-1">
          <Link
            to="/"
            className="block px-2 py-1.5 sm:px-3 sm:py-2 rounded-md text-sm sm:text-base font-medium text-[#EC4899] hover:text-black hover:bg-[#EC4899]/10 transition-colors duration-200 text-right"
            onClick={() => setIsMenuOpen(false)}
          >
            דף הבית
          </Link>
          <Link
            to="/classes"
            className="block px-2 py-1.5 sm:px-3 sm:py-2 rounded-md text-sm sm:text-base font-medium text-[#EC4899] hover:text-black hover:bg-[#EC4899]/10 transition-colors duration-200 text-right"
            onClick={() => setIsMenuOpen(false)}
          >
            שיעורים
          </Link>
          <Link
            to="/shop"
            className="block px-2 py-1.5 sm:px-3 sm:py-2 rounded-md text-sm sm:text-base font-medium text-[#EC4899] hover:text-black hover:bg-[#EC4899]/10 transition-colors duration-200 text-right"
            onClick={() => setIsMenuOpen(false)}
          >
            חנות
          </Link>
          <Link
            to="/contact"
            className="block px-2 py-1.5 sm:px-3 sm:py-2 rounded-md text-sm sm:text-base font-medium text-[#EC4899] hover:text-black hover:bg-[#EC4899]/10 transition-colors duration-200 text-right"
            onClick={() => setIsMenuOpen(false)}
          >
            צור קשר
          </Link>
        </div>
      </div>
      
      {/* Logout Success Modal */}
      {showLogoutSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl transform transition-all">
            <div className="text-center">
              {/* Success Icon */}
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              {/* Title */}
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-agrandir-grand">
                התנתקות מוצלחת! 👋
              </h2>
              
              {/* Message */}
              <p className="text-gray-600 mb-8 font-agrandir-regular leading-relaxed">
                התנתקת בהצלחה מהמערכת.
                <br />
                תודה שהשתמשת בשירותים שלנו!
              </p>
              
              {/* Button */}
              <button
                onClick={() => {
                  setShowLogoutSuccess(false);
                  navigate('/', { replace: true });
                  // רענון הדף אחרי 2 שניות כדי לוודא שהכל מתנקה
                  setTimeout(() => {
                    window.location.reload();
                  }, 2000);
                }}
                className="w-full bg-[#EC4899] hover:bg-[#EC4899]/90 text-white py-3 px-6 rounded-xl font-bold transition-colors duration-200"
              >
                חזור לדף הבית
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar; 