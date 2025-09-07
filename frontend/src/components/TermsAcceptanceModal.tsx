import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { TermsCookieManager } from '../utils/termsCookieManager';

interface TermsAcceptanceModalProps {
  isOpen: boolean;
  userId: string;
  marketingConsent?: boolean; 
  isNewUser?: boolean; // Added this prop
  showWelcomeBack?: boolean; // New prop for existing users
  onAccept: () => void;
}

export const TermsAcceptanceModal = ({ 
  isOpen, 
  userId,
  showWelcomeBack = false, // Default to false for backward compatibility
  onAccept 
}: TermsAcceptanceModalProps) => {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setTermsAccepted(false);
      setError(null);
      setShowSuccess(false);
    }
  }, [isOpen]);

  // No auto-close - let the user control when to go to home page
  // This prevents duplicate success handling

  // Only prevent scrolling within the modal, not the entire page
  // This allows the background page to remain scrollable
  useEffect(() => {
    if (isOpen) {
      // Only prevent keyboard navigation within the modal
      const preventModalKeys = (e: KeyboardEvent) => {
        // Allow Escape key to close modal
        if (e.key === 'Escape') {
          return;
        }
        // Only prevent navigation keys when modal is focused
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'PageUp', 'PageDown', 'Home', 'End'].includes(e.key)) {
          const target = e.target as HTMLElement;
          if (target.closest('.modal-content')) {
            e.preventDefault();
          }
        }
      };

      document.addEventListener('keydown', preventModalKeys, { passive: false });
      
      return () => {
        document.removeEventListener('keydown', preventModalKeys);
      };
    }
  }, [isOpen]);

  const handleAcceptTerms = async () => {
    if (!termsAccepted) {
      setError('עליך לאשר את תנאי השימוש כדי להמשיך');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('לא מחובר למערכת');
      }

      // Call backend API to accept terms
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/profiles/accept-terms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        }
        // No body needed - backend gets userId from token
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'שגיאה לא ידועה' }));
        throw new Error(errorData.message || 'שגיאה באישור התנאים');
      }

      const result = await response.json();
      
      if (result.success) {
        
        // Set client-side cookie immediately for immediate access
        TermsCookieManager.setTermsAccepted(userId);
        
        // Clear any cached profile data to force fresh load
        const cacheKey = `profile_${userId}`;
        try {
          localStorage.removeItem(cacheKey);
        } catch (error) {
          console.warn('Could not clear profile cache:', error);
        }
        
        // Also clear any profile cookies
        try {
          const cookies = document.cookie.split(';');
          cookies.forEach(cookie => {
            const trimmedCookie = cookie.trim();
            if (trimmedCookie.startsWith('profile_')) {
              const cookieName = trimmedCookie.split('=')[0];
              document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
            }
          });
        } catch (error) {
          console.warn('Could not clear profile cookies:', error);
        }
        
        // Note: Backend should also set httpOnly cookie for security
        // The client-side cookie is for immediate UI updates
        // 
        // Backend should set:
        // res.cookie("ladance_terms_accepted", "true", {
        //   maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
        //   httpOnly: true,
        //   secure: true,
        //   sameSite: "strict",
        //   path: "/"
        // });
        
        // Verify cookie was set
        const cookieData = TermsCookieManager.getTermsAccepted();
        
        // Show success message first
        setShowSuccess(true);
        
        // Don't call onAccept here - let the user see the success message first
        // onAccept will be called when they click the "Go to Home" button
      } else {
        throw new Error('שגיאה באישור התנאים');
      }
    } catch (error) {
      console.error('Error accepting terms:', error);
      setError(error instanceof Error ? error.message : 'אירעה שגיאה באישור התנאים. אנא נסה שוב.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Main Modal */}
      <div 
        className="fixed inset-0 flex items-center justify-center z-[60] p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <div className="modal-content bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto overflow-y-auto border border-gray-200 relative focus:outline-none focus:ring-4 focus:ring-[#4B2E83]/20 max-h-[90vh]">
          {/* Enhanced shadow and border for better visibility */}
          <div className="absolute inset-0 rounded-2xl shadow-[0_20px_60px_-12px_rgba(0,0,0,0.25)] pointer-events-none"></div>
          
        {/* Header */}
          <div className="bg-gradient-to-r from-[#4B2E83] to-[#EC4899] p-6 text-white text-center relative z-10">
            <div className="flex justify-center items-center">
              <img 
                src="https://login.ladances.com/storage/v1/object/public/homePage/navbar/ladances-LOGO.svg"
                alt="Avigail Dance Studio Logo"
                className="h-16 w-auto -mt-6"
              />
            </div>
          </div>

        {/* Content */}
        <div className="p-6">
          {!showSuccess ? (
            <>
              <div className="mb-6">
                {/* Styled Checkbox */}
                <div className="flex items-start gap-4 mb-6">
                  <div className="relative flex-shrink-0">
                    <input
                      type="checkbox"
                      id="terms-accepted"
                      name="terms-accepted"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="w-5 h-5 border-2 border-gray-300 rounded-md bg-white cursor-pointer transition-all duration-200 ease-in-out checked:bg-[#4B2E83] checked:border-[#4B2E83] hover:border-[#4B2E83] focus:outline-none focus:ring-2 focus:ring-[#4B2E83] focus:ring-opacity-50"
                      aria-label="אני מאשרת ומסכימה לתנאי השימוש ומדיניות הפרטיות"
                      aria-describedby="terms-description"
                      aria-checked={termsAccepted}
                      aria-required="true"
                      role="checkbox"
                      required
                    />
                    {termsAccepted && (
                      <svg 
                        className="absolute text-white pointer-events-none"
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                        style={{
                          left: '50%',
                          top: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: '12px',
                          height: '12px'
                        }}
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={3} 
                          d="M5 13l4 4L19 7" 
                        />
                      </svg>
                    )}
                  </div>
                  <label htmlFor="terms-accepted" className="text-sm text-gray-700 leading-relaxed cursor-pointer select-none flex-1">
                    <div className="space-y-2">
                      <div className="font-semibold text-gray-900 text-base leading-relaxed">
                        קראתי ואני מאשרת ומסכימה ל- 
                    <a 
                      href="/terms-of-service" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                            className="text-[#4B2E83] hover:text-[#3B1E73] font-medium underline decoration-2 underline-offset-2 transition-colors duration-200 inline-block"
                    >
                      תנאי השימוש
                    </a>
                          {' '}ו-
                    <a 
                      href="/privacy-policy" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                            className="text-[#4B2E83] hover:text-[#3B1E73] font-medium underline decoration-2 underline-offset-2 transition-colors duration-200 inline-block"
                    >
                      מדיניות הפרטיות
                    </a>
                    {' '}של הסטודיו
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Accept Button */}
              <button
                onClick={handleAcceptTerms}
                disabled={isLoading || !termsAccepted}
                className="w-full bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white py-4 rounded-xl font-semibold hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:transform-none border-2 border-transparent hover:border-[#4B2E83]/20"
                aria-describedby={error ? "error-message" : undefined}
                aria-busy={isLoading}
              >
                <div className="transition-all duration-300 ease-in-out">
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>מאשרת...</span>
                    </div>
                  ) : (
                    <span>אני מאשרת - אישור תנאים</span>
                  )}
                </div>
              </button>

              {/* Error Message */}
              {error && (
                <div 
                  className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg"
                  role="alert"
                  aria-live="assertive"
                  aria-atomic="true"
                  id="error-message"
                >
                  <p className="text-red-600 text-sm text-center">{error}</p>
                </div>
              )}
            </>
          ) : (
            /* Success State - Show within modal */
            <div className="text-center py-8">
              {/* Success Icon */}
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              {/* Success Message */}
              <h3 className="text-2xl font-bold text-gray-900 mb-3 animate-in fade-in duration-500">
                {showWelcomeBack ? 'התחברות מוצלחת! 🎉' : 'ההרשמה בוצעה בהצלחה! 🎉'}
              </h3>
              
              <p className="text-gray-700 mb-8 animate-in fade-in duration-500 delay-200">
                {showWelcomeBack ? 'כיף לראות אותך שוב' : 'כעת תוכלי לגשת לכל התכונות של האתר!'}
              </p>
              
              {/* Go to Home Button */}
              <button
                onClick={() => {
                  
                  if (showWelcomeBack) {
                    // For existing users, just close the modal
                    onAccept();
                  } else {
                    // For new users, reload profile and redirect
                    // First, reload the profile to ensure it's updated
                    // This will trigger TermsGuard to re-evaluate and close the modal
                    onAccept();
                    
                    // Then redirect to home page
                    setTimeout(() => {
                      window.location.href = '/';
                    }, 100);
                  }
                }}
                className="w-full bg-gradient-to-r from-[#4B2E83] to-[#EC4899] text-white py-4 rounded-xl font-semibold hover:from-[#EC4899] hover:to-[#4B2E83] transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl cursor-pointer animate-in fade-in duration-500 delay-300"
              >
                {showWelcomeBack ? 'המשיכי לדף הבית' : 'לדף הבית'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
};
