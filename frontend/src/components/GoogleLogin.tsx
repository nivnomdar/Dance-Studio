import { supabase } from '../lib/supabase'
import { useEffect, useRef, useState, useCallback } from 'react'

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
      
      // console.log('OAuth sign in result:', { data, error });
      
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
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-gray-700 border-t-transparent rounded-full animate-spin" />
        ) : (
          <img
            src="https://www.google.com/favicon.ico"
            alt="Google"
            className="w-5 h-5"
          />
        )}
        {isLoading ? 'מתחבר...' : 'התחבר עם Google'}
      </button>
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  )
}

export const GoogleLoginModal = ({ isOpen, onClose }: GoogleLoginModalProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const previouslyFocusedRef = useRef<HTMLElement | null>(null)

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
      
      // The profile will be updated in the auth callback
      // marketing_consent and terms_accepted will be set to true
      
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
    const target = focusables[0] || dialogRef.current
    target?.focus()

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
    }
  }, [isOpen, onClose, getFocusableElements])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4" role="presentation" onClick={onClose}>
      <div ref={dialogRef} className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-sm sm:max-w-md w-full mx-auto overflow-hidden border border-white/20" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="google-login-title" aria-describedby="google-login-desc" tabIndex={-1}>
        {/* Header */}
        <div className="bg-gradient-to-r from-[#4B2E83] to-[#EC4899] p-4 sm:p-6 text-white text-center relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" aria-hidden="true"></div>
          
          {/* Logo */}
          <div className="relative z-10 mb-4 sm:mb-6">
            <img 
              src="/images/LOGOladance.png" 
              alt="Ladance Avigail" 
              className="h-17 sm:h-22 w-auto mx-auto drop-shadow-lg"
            />
          </div>
          
          {/* Welcome Text */}
          <div className="relative z-10">
            <h2 id="google-login-title" className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 font-agrandir-grand">ברוכה הבאה</h2>
            <p id="google-login-desc" className="text-sm sm:text-base text-white/90">התחברי לסטודיו אביגיל</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 text-gray-700 px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer group"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-gray-700 border-t-transparent rounded-full animate-spin" />
            ) : (
              <img
                src="https://www.google.com/favicon.ico"
                alt="Google"
                className="w-5 h-5 group-hover:scale-110 transition-transform duration-200"
              />
            )}
            <span className="group-hover:scale-105 transition-transform duration-200">
              {isLoading ? 'מתחברת...' : 'התחברי עם Google'}
            </span>
          </button>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg" role="alert" aria-live="assertive" id="google-login-error">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Terms and Privacy */}
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-100">
            <p className="text-xs sm:text-sm text-gray-600 text-center leading-relaxed">
            על ידי המשך הפעולה הנך מקבל/ת ומאשר/ת  את {' '}
              <a href="/terms-of-service" className="text-[#4B2E83] hover:underline font-medium hover:text-[#EC4899] transition-colors duration-200">
                תנאי השימוש
              </a>
              {' '}ו{' '}
              <a href="/privacy-policy" className="text-[#4B2E83] hover:underline font-medium hover:text-[#EC4899] transition-colors duration-200">
                מדיניות הפרטיות
              </a>
              {' '} ומסכים/ה לקבל עדכונים עתידיים מ-Ladances.com
            </p>
          </div>
        </div>

        {/* Close Button */}
        <div className="p-3 sm:p-4 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={onClose}
            className="w-full py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200 font-medium"
          >
            חזרה
          </button>
        </div>
      </div>
    </div>
  )
} 