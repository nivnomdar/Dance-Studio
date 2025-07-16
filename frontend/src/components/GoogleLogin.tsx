import { supabase } from '../lib/supabase'
import { useState } from 'react'

export const GoogleLogin = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      })
      
      console.log('OAuth sign in result:', { data, error });
      
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