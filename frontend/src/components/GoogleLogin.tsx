import { supabase } from '../lib/supabase'
import { useEffect, useRef, useState, useCallback } from 'react'

// CSS ספציפי לצ'קבוקסים
const checkboxStyles: React.CSSProperties = {
  appearance: 'none',
  WebkitAppearance: 'none',
  MozAppearance: 'none',
  width: '16px',
  height: '16px',
  border: '2px solid #d1d5db',
  borderRadius: '4px',
  backgroundColor: 'white',
  cursor: 'pointer',
  position: 'relative',
  flexShrink: 0,
  margin: 0,
  padding: 0,
  boxSizing: 'border-box',
}

const checkedStyles: React.CSSProperties = {
  ...checkboxStyles,
  backgroundColor: '#4B2E83',
  borderColor: '#4B2E83',
}

// Check if user prefers reduced motion
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

interface GoogleLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleLogin = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/v1/callback`,
          queryParams: {
            access_type: 'offline', // נשאר לקבלת refresh token
          },
        }
      })
      
      if (error) throw error
      
      // If we get here, the sign in was successful
      // Google sign in successful
      
    } catch (error) {
      console.error('Error logging in with Google:', error)
      setError('אירעה שגיאה בהתחברות. אנא נסה שוב.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="flex items-center justify-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={isLoading ? 'מתחבר עם Google...' : 'התחבר עם Google'}
        aria-describedby={error ? 'google-login-error-simple' : undefined}
        aria-live="polite"
      >
        {isLoading ? (
          <div 
            className="w-5 h-5 border-2 border-gray-700 border-t-transparent rounded-full animate-spin" 
            aria-hidden="true"
            role="status"
          />
        ) : (
          <img
            src="https://www.google.com/favicon.ico"
            alt=""
            className="w-5 h-5"
            aria-hidden="true"
          />
        )}
        <span aria-live="polite">
          {isLoading ? 'מתחבר...' : 'התחבר עם Google'}
        </span>
      </button>
      {error && (
        <div 
          id="google-login-error-simple"
          className="text-red-500 text-sm" 
          role="alert" 
          aria-live="assertive"
          aria-describedby="error-description-simple"
        >
          {error}
        </div>
      )}
      <div id="error-description-simple" className="sr-only">
        הודעת שגיאה בהתחברות
      </div>
    </div>
  )
}

export const GoogleLoginModal = ({ isOpen, onClose }: GoogleLoginModalProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [marketingConsent, setMarketingConsent] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)
  const previouslyFocusedRef = useRef<HTMLElement | null>(null)

  const handleGoogleLogin = async () => {
    // Check if terms are accepted
    if (!termsAccepted) {
      setError('עליך לאשר את תנאי השימוש כדי להמשיך')
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      // Store consent values in localStorage for the auth callback
      localStorage.setItem('pending_terms_accepted', 'true')
      localStorage.setItem('pending_marketing_consent', marketingConsent.toString())
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/v1/callback`,
          queryParams: {
            access_type: 'offline', // נשאר לקבלת refresh token
          },
        }
      })
      
      if (error) throw error
      
      // The profile will be updated in the auth callback with the stored consent values
      
    } catch (error) {
      console.error('Error logging in with Google:', error)
      setError('אירעה שגיאה בהתחברות. אנא נסה שוב.')
    } finally {
      setIsLoading(false)
    }
  }

  const getFocusableElements = useCallback((): HTMLElement[] => {
    const container = dialogRef.current
    if (!container) return []
    const selectors = [
      'a[href]', 'button:not([disabled])', 'textarea:not([disabled])', 'input:not([disabled])', 'select:not([disabled])', '[tabindex]:not([tabindex="-1"])'
    ]
    return Array.from(container.querySelectorAll<HTMLElement>(selectors.join(','))).filter(el => !el.hasAttribute('disabled') && el.tabIndex !== -1 && el.offsetParent !== null)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    previouslyFocusedRef.current = document.activeElement as HTMLElement | null
    const focusables = getFocusableElements()
    // התמקדות בצ'קבוקס הראשון במקום בכפתור X
    const target = focusables.find(el => 
      el.tagName === 'INPUT' && 
      el.getAttribute('type') === 'checkbox' && 
      el.id === 'terms-accepted'
    ) || focusables[0] || dialogRef.current
    target?.focus()

    // חסימת גלילה בדף כשהמודל פתוח
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
        return
      }
      if (e.key === 'Tab') {
        const items = getFocusableElements()
        if (items.length === 0) {
          e.preventDefault()
          return
        }
        const first = items[0]
        const last = items[items.length - 1]
        const active = document.activeElement as HTMLElement | null
        if (e.shiftKey) {
          if (active === first || !items.includes(active as HTMLElement)) {
            e.preventDefault()
            last.focus()
          }
        } else {
          if (active === last) {
            e.preventDefault()
            first.focus()
          }
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown, true)
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true)
      previouslyFocusedRef.current?.focus?.()
      // החזרת גלילה בדף כשהמודל נסגר
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose, getFocusableElements])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4" role="presentation" onClick={onClose}>
      <div ref={dialogRef} className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-sm sm:max-w-md w-full mx-auto overflow-hidden border border-white/20" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="google-login-title" aria-describedby="google-login-desc" tabIndex={-1} aria-expanded={isOpen}>
        {/* Header */}
        <div className="bg-gradient-to-r from-[#4B2E83] to-[#EC4899] p-4 sm:p-6 text-white text-center relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" aria-hidden="true"></div>
          
          {/* Close Button - X */}
          <button
            onClick={onClose}
            className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200 group"
            aria-label="סגירת המודל"
            title="סגירה"
            aria-describedby="close-button-desc"
          >
            <svg 
              className={`w-5 h-5 sm:w-6 sm:h-6 text-white ${!prefersReducedMotion ? 'group-hover:scale-110 transition-transform duration-200' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
          
          {/* Hidden description for close button */}
          <div id="close-button-desc" className="sr-only">
            כפתור לסגירת המודל ולחזרה לדף הקודם
          </div>
          
          {/* Logo */}
          <div className="relative z-10 mb-4 sm:mb-6">
            <img 
              src="/images/LOGOladance.png" 
              alt="לוגו סטודיו אביגיל לדאנס" 
              className="h-17 sm:h-22 w-auto mx-auto drop-shadow-lg"
            />
          </div>
          
          {/* Welcome Text */}
          <div className="relative z-10">
            <h2 id="google-login-title" className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 font-agrandir-grand">ברוכה הבאה</h2>
            <p id="google-login-desc" className="text-sm sm:text-base text-white/90">התחברות או הרשמה </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {/* Terms Checkboxes */}
          <div className="mb-4 space-y-3">
            {/* Terms Accepted - Required */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms-accepted"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1 cursor-pointer"
                style={termsAccepted ? checkedStyles : checkboxStyles}
                required
                aria-required="true"
                aria-describedby={`terms-required-note ${error && !termsAccepted ? 'google-login-error' : ''}`}
                aria-invalid={error && !termsAccepted ? "true" : "false"}
                aria-label="הסכמה לתנאי השימוש ומדיניות הפרטיות"
              />
              <label htmlFor="terms-accepted" className="text-sm text-gray-700 leading-relaxed cursor-pointer">
                אני מאשרת ומסכימה ל{' '}
                <a 
                  href="/terms-of-service" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-[#4B2E83] hover:underline font-medium"
                  aria-label="תנאי השימוש (נפתח בחלון חדש)"
                >
                  תנאי השימוש
                </a>
                {' '}ו{' '}
                <a 
                  href="/privacy-policy" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-[#4B2E83] hover:underline font-medium"
                  aria-label="מדיניות הפרטיות (נפתח בחלון חדש)"
                >
                  מדיניות הפרטיות
                </a>
                {' '}של הסטודיו <span className="text-red-500" aria-label="שדה חובה">*</span>
              </label>
            </div>

            {/* Marketing Consent - Optional */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="marketing-consent"
                checked={marketingConsent}
                onChange={(e) => setMarketingConsent(e.target.checked)}
                className="mt-1 cursor-pointer"
                style={marketingConsent ? checkedStyles : checkboxStyles}
                aria-describedby="marketing-consent-desc"
                aria-label="הסכמה לקבלת עדכונים ושיווק מהסטודיו"
              />
              <label htmlFor="marketing-consent" className="text-sm text-gray-700 leading-relaxed cursor-pointer">
                אני מסכים/ה לקבל עדכונים, מבצעים וחדשות מהסטודיו <span className="text-gray-500">(אופציונלי)</span>
              </label>
            </div>
          </div>

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading || !termsAccepted}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 text-gray-700 px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer group"
            aria-label={isLoading ? 'מתחברת עם Google...' : 'התחברי עם Google'}
            aria-describedby={`${error ? 'google-login-error' : ''} ${!termsAccepted ? 'terms-required-note' : ''}`}
            aria-live="polite"
          >
            {isLoading ? (
              <div 
                className="w-5 h-5 border-2 border-gray-700 border-t-transparent rounded-full animate-spin" 
                aria-hidden="true"
                role="status"
                aria-label="טוען..."
              />
            ) : (
              <img
                src="https://www.google.com/favicon.ico"
                alt=""
                className={`w-5 h-5 ${!prefersReducedMotion ? 'group-hover:scale-110 transition-transform duration-200' : ''}`}
                aria-hidden="true"
              />
            )}
            <span className={!prefersReducedMotion ? 'group-hover:scale-105 transition-transform duration-200' : ''}>
              {isLoading ? 'מתחברת...' : 'התחברי עם Google'}
            </span>
          </button>

          {/* Error Message */}
          {error && (
            <div 
              className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg" 
              role="alert" 
              aria-live="assertive" 
              id="google-login-error"
              aria-describedby="error-description"
            >
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}
          
          {/* Hidden error description */}
          <div id="error-description" className="sr-only">
            הודעת שגיאה בהתחברות עם Google
          </div>

          {/* Note about required fields */}
          <div className="mt-3 text-xs text-gray-500 text-center" id="terms-required-note">
            <span className="text-red-500" aria-label="שדה חובה">*</span> שדה חובה
          </div>

          {/* Marketing consent description */}
          <div className="mt-2 text-xs text-gray-500 text-center" id="marketing-consent-desc">
            הסכמה לשיווק היא רשות ואינה נדרשת להתחברות
          </div>
        </div>

        {/* Close Button */}
        <div className="p-3 sm:p-4 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={onClose}
            className="w-full py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200 font-medium"
            aria-label="סגירת המודל וחזרה לדף הקודם"
            aria-describedby="back-button-desc"
          >
            חזרה
          </button>
          <div id="back-button-desc" className="sr-only">
            כפתור לסגירת המודל ולחזרה לדף הקודם
          </div>
        </div>
      </div>
    </div>
  )
} 