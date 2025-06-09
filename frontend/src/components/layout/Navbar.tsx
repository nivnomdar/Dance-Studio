import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { User } from '@supabase/supabase-js';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // בדיקת סטטוס המשתמש בטעינת הקומפוננטה
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();

    // האזנה לשינויים בסטטוס ההתחברות
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error logging in with Google:', error);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/');
      setIsProfileMenuOpen(false);
    } catch (error) {
      console.error('Error logging out:', error);
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
    <nav className="fixed top-0 left-0 right-0 bg-[#4B2E83]/90 backdrop-blur-sm shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex flex-col items-center">
              <div className="flex items-center gap-2">
               
                <span className="text-2xl font-bold text-[#E6C17C] font-agrandir-grand tracking-wide">
                  Ladance
                </span> 
                <span className="text-2xl font-bold text-[#FDF9F6] font-agrandir-grand tracking-wide">
                  Avigail
                </span>
              </div>
              <span className="text-sm text-[#FDF9F6]/70 font-light italic tracking-wide">
                ( by Avigail Ladani )
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8 justify-end">
            <Link to="/" className="text-[#FDF9F6] hover:text-[#E6C17C] px-3 py-2 text-sm font-medium transition-colors duration-200">
              בית
            </Link>
            <Link to="/about" className="text-[#FDF9F6] hover:text-[#E6C17C] px-3 py-2 text-sm font-medium transition-colors duration-200">
              אודות
            </Link>
            <Link to="/classes" className="text-[#FDF9F6] hover:text-[#E6C17C] px-3 py-2 text-sm font-medium transition-colors duration-200">
              שיעורים
            </Link>
            <Link to="/contact" className="text-[#FDF9F6] hover:text-[#E6C17C] px-3 py-2 text-sm font-medium transition-colors duration-200">
              צור קשר
            </Link>
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="text-[#E6C17C] hover:text-[#FDF9F6] p-2 transition-colors duration-200 profile-button"
                  title="פרופיל משתמש"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="8" r="4" strokeWidth="1.5" fill="currentColor" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  </svg>
                </button>
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-[#4B2E83] ring-1 ring-black ring-opacity-5 profile-menu">
                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="block w-full text-right px-4 py-2 text-sm text-[#FDF9F6] hover:bg-[#4B2E83]/80 hover:text-[#E6C17C] transition-colors duration-200"
                      >
                        פרופיל משתמש
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-right px-4 py-2 text-sm text-[#FDF9F6] hover:bg-[#4B2E83]/80 hover:text-[#E6C17C] transition-colors duration-200"
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
                className="text-[#FDF9F6] hover:text-[#E6C17C] p-2 transition-colors duration-200"
                title="התחבר"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="8" r="4" strokeWidth="1.5" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                </svg>
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-[#FDF9F6] hover:text-[#E6C17C] hover:bg-[#4B2E83] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#E6C17C] transition-colors duration-200"
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
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden bg-[#4B2E83]`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link
            to="/"
            className="block px-3 py-2 rounded-md text-base font-medium text-[#FDF9F6] hover:text-[#E6C17C] hover:bg-[#4B2E83]/80 transition-colors duration-200 text-right"
            onClick={() => setIsMenuOpen(false)}
          >
            בית
          </Link>
          <Link
            to="/about"
            className="block px-3 py-2 rounded-md text-base font-medium text-[#FDF9F6] hover:text-[#E6C17C] hover:bg-[#4B2E83]/80 transition-colors duration-200 text-right"
            onClick={() => setIsMenuOpen(false)}
          >
            אודות
          </Link>
          <Link
            to="/classes"
            className="block px-3 py-2 rounded-md text-base font-medium text-[#FDF9F6] hover:text-[#E6C17C] hover:bg-[#4B2E83]/80 transition-colors duration-200 text-right"
            onClick={() => setIsMenuOpen(false)}
          >
            שיעורים
          </Link>
          <Link
            to="/contact"
            className="block px-3 py-2 rounded-md text-base font-medium text-[#FDF9F6] hover:text-[#E6C17C] hover:bg-[#4B2E83]/80 transition-colors duration-200 text-right"
            onClick={() => setIsMenuOpen(false)}
          >
            צור קשר
          </Link>
          {user ? (
            <button
              onClick={() => {
                handleLogout();
                setIsMenuOpen(false);
              }}
              className="block w-full text-right px-3 py-2 rounded-md text-base font-medium text-[#FDF9F6] hover:text-[#E6C17C] hover:bg-[#4B2E83]/80 transition-colors duration-200"
            >
              התנתק
            </button>
          ) : (
            <button
              onClick={() => {
                handleGoogleLogin();
                setIsMenuOpen(false);
              }}
              className="block w-full text-right px-3 py-2 rounded-md text-base font-medium text-[#FDF9F6] hover:text-[#E6C17C] hover:bg-[#4B2E83]/80 transition-colors duration-200"
            >
              התחבר
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar; 