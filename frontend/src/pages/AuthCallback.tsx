import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasNavigated, setHasNavigated] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const hasRunRef = useRef(false);

  useEffect(() => {
    // Prevent multiple executions
    if (hasNavigated || isProcessing || hasRunRef.current) {
      return;
    }
    
    hasRunRef.current = true;

    // Add a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (!hasNavigated) {
        setHasNavigated(true);
        navigate('/', { replace: true });
      }
    }, 8000); // Reduced to 8 seconds

    const handleAuthCallback = async () => {
      try {
        setIsProcessing(true);
        
        // Get the current URL and extract the code parameter
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');

        // Quick check if we already have a session
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        if (existingSession && !hasNavigated) {
          setIsAuthenticated(true);
          setHasNavigated(true);
          navigate('/', { replace: true });
          return;
        }

        // If there's an error in the URL, handle it
        if (error) {
          console.error('OAuth error:', error, errorDescription);
          setError('שגיאה בהתחברות. אנא נסה שוב.');
          setHasNavigated(true);
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 3000);
          return;
        }

        // If there's no code, redirect to home
        if (!code) {
          setHasNavigated(true);
          navigate('/', { replace: true });
          return;
        }

        // Exchange the code for a session
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        
        if (exchangeError) {
          console.error('Error exchanging code for session:', exchangeError);
          setError('שגיאה בהתחברות. אנא נסה שוב.');
          setHasNavigated(true);
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 3000);
          return;
        }

        if (data.session) {
          // Set authenticated state and navigate immediately
          if (!hasNavigated) {
            setIsAuthenticated(true);
            setHasNavigated(true);
            navigate('/', { replace: true });
          }
          
          // Get consent values from localStorage
          const termsAccepted = localStorage.getItem('pending_terms_accepted') === 'true';
          const marketingConsent = localStorage.getItem('pending_marketing_consent') === 'true';
          
          // Clear localStorage
          localStorage.removeItem('pending_terms_accepted');
          localStorage.removeItem('pending_marketing_consent');
          
          // Update profile in background (non-blocking) with actual consent values
          supabase
            .from('profiles')
            .update({
              terms_accepted: termsAccepted,
              marketing_consent: marketingConsent,
              updated_at: new Date().toISOString()
            })
            .eq('id', data.session.user.id)
            .then(({ error }) => {
              if (error) {
                console.error('Error updating profile:', error);
              }
            });
        } else {
          console.error('No session returned from code exchange');
          setError('שגיאה בהתחברות. אנא נסה שוב.');
          setHasNavigated(true);
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 3000);
        }

      } catch (error) {
        console.error('Unexpected error in auth callback:', error);
        setError('שגיאה לא צפויה. אנא נסה שוב.');
        setHasNavigated(true);
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 3000);
      }
    };

    // Handle the callback immediately
    handleAuthCallback();

    return () => {
      clearTimeout(timeout);
    };
  }, [navigate]); // Removed hasNavigated from dependencies

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