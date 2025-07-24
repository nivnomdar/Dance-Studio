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
          // Check session again before redirecting
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            setIsAuthenticated(true);
            setHasNavigated(true);
            navigate('/', { replace: true });
          } else {
            navigate('/', { replace: true });
          }
          return;
        }

        // Exchange the code for a session
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        
        if (exchangeError) {
          console.error('Error exchanging code for session:', exchangeError);
          setError('שגיאה בהתחברות. אנא נסה שוב.');
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 3000);
          return;
        }

        if (data.session) {
          // Update profile with marketing consent and terms acceptance
          try {
            const { error: profileError } = await supabase
              .from('profiles')
              .update({
                marketing_consent: true,
                terms_accepted: true,
                updated_at: new Date().toISOString()
              })
              .eq('id', data.session.user.id)
            
            if (profileError) {
              console.error('Error updating profile:', profileError)
            }
          } catch (profileError) {
            console.error('Error updating profile:', profileError)
          }
          
          // Set authenticated state and navigate
          if (!hasNavigated) {
            setIsAuthenticated(true);
            setHasNavigated(true);
            navigate('/', { replace: true });
          }
        } else {
          console.error('No session returned from code exchange');
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session && !hasNavigated) {
        // Update profile with marketing consent and terms acceptance
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              marketing_consent: true,
              terms_accepted: true,
              updated_at: new Date().toISOString()
            })
            .eq('id', session.user.id)
          
          if (profileError) {
            console.error('Error updating profile:', profileError)
          }
        } catch (profileError) {
          console.error('Error updating profile:', profileError)
        }
        
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