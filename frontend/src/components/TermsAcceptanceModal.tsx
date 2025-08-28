import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { TermsCookieManager } from '../utils/termsCookieManager';

interface TermsAcceptanceModalProps {
  isOpen: boolean;
  userId: string;
  marketingConsent?: boolean;
  isNewUser?: boolean;
  onAccept: () => void;
}

export const TermsAcceptanceModal = ({ 
  isOpen, 
  userId, 
  marketingConsent = false,
  isNewUser = false,
  onAccept 
}: TermsAcceptanceModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [shouldCloseModal, setShouldCloseModal] = useState(false);
  const { loadProfile, profile } = useAuth();

  // Prevent scrolling with keyboard
  useEffect(() => {
    const preventScroll = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'PageUp', 'PageDown', 'Home', 'End'].includes(e.key)) {
        e.preventDefault();
      }
    };

    const preventWheel = (e: WheelEvent) => {
      e.preventDefault();
    };

    const preventTouch = (e: TouchEvent) => {
      e.preventDefault();
    };

    if (isOpen) {
      document.addEventListener('keydown', preventScroll, { passive: false });
      document.addEventListener('wheel', preventWheel, { passive: false });
      document.addEventListener('touchmove', preventTouch, { passive: false });
    }

    return () => {
      document.removeEventListener('keydown', preventScroll);
      document.removeEventListener('wheel', preventWheel);
      document.removeEventListener('touchmove', preventTouch);
    };
  }, [isOpen]);

  // Auto-close success popup after 5 seconds
  useEffect(() => {
    if (showSuccessPopup) {
      const timer = setTimeout(() => {
        setShowSuccessPopup(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [showSuccessPopup]);

  const handleAcceptTerms = async () => {
    if (!termsAccepted) {
      setError('עליך לאשר את תנאי השימוש כדי להמשיך');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log('Starting terms acceptance process...');

      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('לא מחובר למערכת');
      }

      console.log('Session found, calling API...');

      // Call backend API to accept terms
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/profiles/accept-terms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        }
        // No body needed - backend gets userId from token
      });

      console.log('API response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'שגיאה לא ידועה' }));
        throw new Error(errorData.message || 'שגיאה באישור התנאים');
      }

      const result = await response.json();
      console.log('API result:', result);
      
      if (result.success) {
        console.log('Terms accepted successfully!');
        
        // Show success state in button
        setShowSuccess(true);
        setError(null);
        
        // Set cookie to remember terms acceptance
        TermsCookieManager.setTermsAccepted(userId);
        console.log('TermsCookieManager: Cookie set for user:', userId);
        
        // Verify cookie was set
        const cookieData = TermsCookieManager.getTermsAccepted();
        console.log('TermsCookieManager: Cookie verification:', cookieData);
        
        // Double-check that the cookie is working
        if (!cookieData || !cookieData.accepted) {
          console.error('TermsCookieManager: Cookie verification failed!');
        } else {
          console.log('TermsCookieManager: Cookie verification successful');
        }
        
        // Wait for profile to update
        try {
          console.log('Updating profile...');
          await loadProfile();
          console.log('Profile updated successfully');
          
          // Show success popup within the modal
          setShowSuccessPopup(true);

    } catch (error) {
          console.error('Failed to update profile:', error);
          // Even if profile update fails, show success state
          setShowSuccessPopup(true);
        }
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
      {/* Success Popup - shown after modal closes */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-auto overflow-hidden border border-gray-200 animate-in zoom-in duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">
                {isNewUser ? 'ההרשמה בוצעה בהצלחה! 🎉' : 'התנאים אושרו בהצלחה! ✅'}
              </h3>
              <p className="text-white/90 text-sm">
                {isNewUser ? 'ברוכה הבאה לסטודיו אביגיל לדאנס!' : 'אתה יכול להמשיך להשתמש באתר'}
              </p>
            </div>
            
            {/* Content */}
            <div className="p-6 text-center">
              <p className="text-gray-700 mb-6">
                {isNewUser 
                  ? 'ההרשמה שלך הושלמה בהצלחה. כעת תוכלי לגשת לכל התכונות של האתר!'
                  : 'תנאי השימוש אושרו בהצלחה. כעת תוכל להמשיך להשתמש באתר!'
                }
              </p>
              
              {/* Close Button */}
              <button
                onClick={() => {
                  // Close modal and trigger re-render to check updated profile
                  onAccept();
                }}
                className="w-full bg-gradient-to-r from-[#4B2E83] to-[#EC4899] text-white py-3 rounded-xl font-semibold hover:from-[#EC4899] hover:to-[#4B2E83] transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl cursor-pointer"
              >
                מעולה! תודה
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Modal */}
      <div 
        className="fixed inset-0 flex items-center justify-center z-[60] p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto overflow-hidden border border-gray-200 relative focus:outline-none focus:ring-4 focus:ring-[#4B2E83]/20 max-h-[90vh]">
          {/* Enhanced shadow and border for better visibility */}
          <div className="absolute inset-0 rounded-2xl shadow-[0_20px_60px_-12px_rgba(0,0,0,0.25)] pointer-events-none"></div>
          
        {/* Header */}
          <div className="bg-gradient-to-r from-[#4B2E83] to-[#EC4899] p-6 text-white text-center relative z-10">
            <h2 id="modal-title" className="text-2xl font-bold mb-2">
              {isNewUser ? 'ברוכה הבאה לסטודיו!' : 'אישור תנאי השימוש'}
            </h2>
            <p id="modal-description" className="text-white/90">
              {isNewUser 
                ? 'כדי להשלים את ההרשמה, עליך לאשר את תנאי השימוש' 
                : 'עליך לאשר את תנאי השימוש כדי להמשיך'
              }
            </p>
        </div>

        {/* Content */}
        <div className="p-6">
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
                ) : showSuccess ? (
                  <div className="flex items-center justify-center space-x-2">
                    <span>הושלם בהצלחה!</span>
                  </div>
                ) : (
                  <span>אני מאשרת - השלימי הרשמה</span>
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

            {/* Success Message */}
            {showSuccess && (
              <div 
                className="mt-4 p-4 bg-green-50 border-2 border-green-200 rounded-lg animate-in fade-in duration-300"
                role="alert"
                aria-live="assertive"
                aria-atomic="true"
              >
                <div className="flex items-center justify-center space-x-3">
                  <div className="text-center">
                    <p className="text-green-800 font-medium text-sm">
                      {isNewUser ? 'ההרשמה בוצעה בהצלחה! 🎉' : 'התנאים אושרו בהצלחה! ✅'}
                    </p>
                    <p className="text-green-600 text-xs mt-1">
                      מעביר אותך לאתר...
                    </p>
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
    </>
  );
};
