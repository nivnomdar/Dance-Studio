import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasNavigated, setHasNavigated] = useState(false);

  useEffect(() => {
    // Add a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.log('AuthCallback timeout - redirecting to home');
      if (!hasNavigated) {
        setHasNavigated(true);
        navigate('/', { replace: true });
      }
    }, 10000); // 10 seconds timeout

    const handleAuthCallback = async () => {
      try {
        // First, check if user is already authenticated
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (currentSession && !hasNavigated) {
          console.log('User already authenticated, navigating...');
          setIsAuthenticated(true);
          setHasNavigated(true);
          navigate('/', { replace: true });
          return;
        }

        // Get the current URL and extract the code parameter
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');

        // If there's an error in the URL, handle it
        if (error) {
          console.error('OAuth error:', error, errorDescription);
          setError('שגיאה בהתחברות. אנא נסה שוב.');
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 3000);
          return;
        }

        // If there's no code, redirect to home
        if (!code) {
          console.log('No authorization code found in URL - user might already be authenticated');
          // Check session again before redirecting
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            console.log('User is authenticated, navigating...');
            setIsAuthenticated(true);
            setHasNavigated(true);
            navigate('/', { replace: true });
          } else {
            console.log('No session found, redirecting to home');
            navigate('/', { replace: true });
          }
          return;
        }

        // Exchange the code for a session
        console.log('Exchanging code for session...');
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        
        console.log('Exchange result:', { data, error: exchangeError });
        
        if (exchangeError) {
          console.error('Error exchanging code for session:', exchangeError);
          setError('שגיאה בהתחברות. אנא נסה שוב.');
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 3000);
          return;
        }

        if (data.session) {
          console.log('Successfully authenticated:', data.session.user.email);
          console.log('Session data:', data.session);
          
          // Set authenticated state and navigate
          if (!hasNavigated) {
            setIsAuthenticated(true);
            setHasNavigated(true);
            console.log('Navigating to home page...');
            navigate('/', { replace: true });
          }
        } else {
          console.error('No session returned from code exchange');
          console.log('Full exchange data:', data);
          setError('שגיאה בהתחברות. אנא נסה שוב.');
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 3000);
        }

      } catch (error) {
        console.error('Unexpected error in auth callback:', error);
        setError('שגיאה לא צפויה. אנא נסה שוב.');
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 3000);
      }
    };

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('AuthCallback: Auth state change:', event, session?.user?.email);
      if (event === 'SIGNED_IN' && session && !hasNavigated) {
        console.log('AuthCallback: User signed in, navigating...');
        setIsAuthenticated(true);
        setHasNavigated(true);
        navigate('/', { replace: true });
      }
    });

    // Handle the callback
    handleAuthCallback();

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [navigate, hasNavigated]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDF9F6]">
      <div className="text-center">
        {error ? (
          <>
            <h2 className="text-2xl font-bold text-red-600 mb-4">שגיאה בהתחברות</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
          </>
        ) : isAuthenticated ? (
          <>
            <h2 className="text-2xl font-bold text-green-600 mb-4">התחברות מוצלחת!</h2>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-[#4B2E83]/70">מעביר אותך לדף הבית...</p>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-[#4B2E83] mb-4">מתחבר...</h2>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4B2E83] mx-auto"></div>
            <p className="text-[#4B2E83]/70 mt-4">מעבד את ההתחברות שלך</p>
          </>
        )}
      </div>
    </div>
  );
} 