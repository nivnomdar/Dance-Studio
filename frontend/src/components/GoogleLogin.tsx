import { supabase } from '../lib/supabase'

export const GoogleLogin = () => {
  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) throw error
    } catch (error) {
      console.error('Error logging in with Google:', error)
    }
  }

  return (
    <button
      onClick={handleGoogleLogin}
      className="flex items-center justify-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-shadow"
    >
      <img
        src="https://www.google.com/favicon.ico"
        alt="Google"
        className="w-5 h-5"
      />
      התחבר עם Google
    </button>
  )
} 