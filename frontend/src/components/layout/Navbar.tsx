import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { User } from '@supabase/supabase-js';
import { handleAuthStateChange } from '../../lib/auth';
import { usePopup } from '../../contexts/PopupContext';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const { showPopup } = usePopup();

  useEffect(() => {
    // בדיקת סטטוס המשתמש בטעינת הקומפוננטה
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    checkUser();

    // האזנה לשינויים בסטטוס ההתחברות
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session);
      
      // בדיקה אם זה רענון דף
      const isPageRefresh = event === 'INITIAL_SESSION' || 
                          (event === 'SIGNED_IN' && session?.user?.app_metadata?.provider === 'google' && 
                           localStorage.getItem('hasShownLoginPopup') === 'true');

      if (isPageRefresh) {
        return;
      }

      if (event === 'SIGNED_IN') {
        setUser(session?.user ?? null);
        // שמירת מידע שהפופ-אפ כבר הוצג
        localStorage.setItem('hasShownLoginPopup', 'true');
        showPopup({
          title: 'התחברות מוצלחת',
          message: 'ברוך הבא! התחברת בהצלחה למערכת.',
          type: 'success',
          duration: 3000
        });
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        // ניקוי מידע מקומי בהתנתקות
        localStorage.removeItem('supabase.auth.token');
        localStorage.removeItem('hasShownLoginPopup');
        sessionStorage.clear();
        localStorage.clear();
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
      console.error('Error logging in with Google:', error);
    }
  };

  const handleLogout = async () => {
    try {
      console.log('Starting logout process...');
      
      // סגירת התפריטים
      setIsProfileMenuOpen(false);
      setIsMenuOpen(false);

      // ניקוי כל המידע המקומי קודם
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('hasShownLoginPopup');
      sessionStorage.clear();
      localStorage.clear();

      // איפוס מצב המשתמש מיד
      setUser(null);

      // התנתקות מ-Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        showPopup({
          title: 'שגיאת התנתקות',
          message: 'אירעה שגיאה בניסיון להתנתק. אנא נסה שוב.',
          type: 'error',
          duration: 3000
        });
        return;
      }

      // הצגת פופ-אפ התנתקות מוצלחת
      showPopup({
        title: 'התנתקות מוצלחת',
        message: 'התנתקת בהצלחה מהמערכת.',
        type: 'success',
        duration: 3000
      });

      // ניתוב לדף הבית
      navigate('/', { replace: true });

      // ריענון הדף אחרי שהפופ-אפ הוצג
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (error) {
      console.error('Error during logout:', error);
      showPopup({
        title: 'שגיאת התנתקות',
        message: 'אירעה שגיאה בניסיון להתנתק. אנא נסה שוב.',
        type: 'error',
        duration: 3000
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
    <nav className="fixed top-0 left-0 right-0 bg-[#EC4899]/90 backdrop-blur-sm shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Desktop Menu - Now on the left */}
          <div className="hidden md:flex items-center space-x-8">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="text-white hover:text-black p-2 transition-colors duration-200 profile-button"
                  title="פרופיל משתמש"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" fill="currentColor" />
                  </svg>
                </button>
                {isProfileMenuOpen && (
                  <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-[#EC4899] ring-1 ring-black ring-opacity-5 profile-menu">
                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="block w-full text-right px-4 py-2 text-sm text-[#FDF9F6] hover:bg-[#EC4899]/80 hover:text-black transition-colors duration-200"
                      >
                        פרופיל משתמש
            </Link>
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
            <Link to="/" className="text-[#FDF9F6] hover:text-black px-3 py-2 text-sm font-medium transition-colors duration-200">
                בית
              </Link>
            <Link to="/about" className="text-[#FDF9F6] hover:text-black px-3 py-2 text-sm font-medium transition-colors duration-200">
                אודות
              </Link>
            <Link to="/classes" className="text-[#FDF9F6] hover:text-black px-3 py-2 text-sm font-medium transition-colors duration-200">
                שיעורים
              </Link>
            <Link to="/shop" className="text-[#FDF9F6] hover:text-black px-3 py-2 text-sm font-medium transition-colors duration-200">
              חנות
            </Link>
            <Link to="/contact" className="text-[#FDF9F6] hover:text-black px-3 py-2 text-sm font-medium transition-colors duration-200">
                צור קשר
              </Link>
          </div>

          {/* Mobile menu button - Now on the left */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-[#FDF9F6] hover:text-black hover:bg-[#EC4899] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#E6C17C] transition-colors duration-200"
            >
              <span className="sr-only">פתח תפריט</span>
              {/* Hamburger icon */}
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              {/* Close icon */}
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
          </div>

          {/* Logo - Now on the right for both mobile and desktop */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex flex-col items-center">
              <div className="flex items-center gap-2 text-black" >
                <span className="text-2xl font-bold text-black font-agrandir-grand tracking-wide">
                  Ladance
                </span>
                <span className="text-2xl font-bold text-black font-agrandir-grand tracking-wide">
                  Avigail
                </span>
              </div>
              <span className="text-sm text-black font-light-bold italic tracking-wide">
                by Avigail Ladani
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden bg-[#FFF5F9] shadow-lg`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {user ? (
            <div className="flex flex-col space-y-2 mb-4 border-b border-[#EC4899]/20 pb-4">
              <div className="flex items-center space-x-2">
                <Link
                  to="/profile"
                  className="px-3 py-2 rounded-md text-base font-medium text-[#EC4899] hover:text-black hover:bg-[#EC4899]/10 transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  פרופיל משתמש
                </Link>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#EC4899]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" fill="currentColor" />
                </svg>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="px-3 py-2 rounded-md text-base font-medium text-[#EC4899] hover:text-black hover:bg-[#EC4899]/10 transition-colors duration-200"
                >
                  התנתק
                </button>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#EC4899]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2 mb-4 border-b border-[#EC4899]/20 pb-4">
              <button
                onClick={() => {
                  handleGoogleLogin();
                  setIsMenuOpen(false);
                }}
                className="px-3 py-2 rounded-md text-base font-medium text-[#EC4899] hover:text-black hover:bg-[#EC4899]/10 transition-colors duration-200"
              >
                התחברי
              </button>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#EC4899]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
            </div>
          )}
          <Link
            to="/"
            className="block px-3 py-2 rounded-md text-base font-medium text-[#EC4899] hover:text-black hover:bg-[#EC4899]/10 transition-colors duration-200 text-right"
            onClick={() => setIsMenuOpen(false)}
          >
            בית
          </Link>
          <Link
            to="/about"
            className="block px-3 py-2 rounded-md text-base font-medium text-[#EC4899] hover:text-black hover:bg-[#EC4899]/10 transition-colors duration-200 text-right"
            onClick={() => setIsMenuOpen(false)}
          >
            אודות
          </Link>
          <Link
            to="/classes"
            className="block px-3 py-2 rounded-md text-base font-medium text-[#EC4899] hover:text-black hover:bg-[#EC4899]/10 transition-colors duration-200 text-right"
            onClick={() => setIsMenuOpen(false)}
          >
            שיעורים
          </Link>
          <Link
            to="/shop"
            className="block px-3 py-2 rounded-md text-base font-medium text-[#EC4899] hover:text-black hover:bg-[#EC4899]/10 transition-colors duration-200 text-right"
            onClick={() => setIsMenuOpen(false)}
          >
            חנות
          </Link>
          <Link
            to="/contact"
            className="block px-3 py-2 rounded-md text-base font-medium text-[#EC4899] hover:text-black hover:bg-[#EC4899]/10 transition-colors duration-200 text-right"
            onClick={() => setIsMenuOpen(false)}
          >
            צרי קשר
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar; 