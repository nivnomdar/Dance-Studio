import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { logActivity } from '../utils/activityLogger';

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
    }, 5000); // Reduced to 5 seconds

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
          
          // Log re-authentication activity
          const logReauthSuccess = await logActivity(
            'User Re-authenticated',
            `Existing session found for ${existingSession.user.email || existingSession.user.id}`,
            {
              userId: existingSession.user.id,
              email: existingSession.user.email,
              provider: existingSession.user.app_metadata.provider,
            },
            existingSession.access_token,
            'info'
          );
          if (!logReauthSuccess) {
            console.error('AuthCallback: Failed to log re-authentication activity.');
          }
          
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
          const logOAuthError = await logActivity('User Login Failed', `OAuth error: ${error} - ${errorDescription}`, { error, errorDescription }, undefined, 'error');
          if (!logOAuthError) {
            console.error('AuthCallback: Failed to log OAuth error activity.');
          }
          return;
        }

        // If there's no code, redirect to home
        if (!code) {
          setHasNavigated(true);
          navigate('/', { replace: true });
          const logNoCode = await logActivity('User Login Failed', 'No auth code provided', {}, undefined, 'warn');
          if (!logNoCode) {
            console.error('AuthCallback: Failed to log no auth code activity.');
          }
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
          const logExchangeError = await logActivity('User Login Failed', `Error exchanging code for session: ${exchangeError.message}`, { code, error: exchangeError }, undefined, 'error');
          if (!logExchangeError) {
            console.error('AuthCallback: Failed to log exchange code error activity.');
          }
          return;
        }

        if (data.session) {
          // Session created successfully, redirect to home
          // TermsGuard will handle showing the terms modal if needed
          if (!hasNavigated) {
            setIsAuthenticated(true);
            setHasNavigated(true);
            navigate('/', { replace: true });

            const isNewUser = localStorage.getItem('is_new_user_registration') === 'true';
            localStorage.removeItem('is_new_user_registration'); // Clear the flag after checking

            const actionType = isNewUser ? 'New User Registration' : 'User Login';
            const details = isNewUser
              ? `New user registration for ${data.session.user.email} using ${data.session.user.app_metadata.provider}`
              : `Successful login for ${data.session.user.email} using ${data.session.user.app_metadata.provider}`;

            const logSuccess = await logActivity(
              actionType,
              details,
              {
                userId: data.session.user.id,
                email: data.session.user.email,
                provider: data.session.user.app_metadata.provider,
                isNewUser: isNewUser,
              },
              data.session.access_token,
              'info'
            );
            if (!logSuccess) {
              console.error(`AuthCallback: Failed to log ${actionType} activity.`);
            }
          }
        } else {
          console.error('No session returned from code exchange');
          setError('שגיאה בהתחברות. אנא נסה שוב.');
          setHasNavigated(true);
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 3000);
          const logFailure = await logActivity('User Login Failed', 'No session returned from code exchange', { code }, undefined, 'warn');
          if (!logFailure) {
            console.error('AuthCallback: Failed to log login failure (no session) activity.');
          }
        }

      } catch (error) {
        console.error('AuthCallback: Unexpected error in auth callback:', error); // Log the full error object
        setError('שגיאה לא צפויה. אנא נסה שוב.');
        setHasNavigated(true);
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 3000);
        
        const errorMessage = (error instanceof Error) ? error.message : String(error);
        const logUnexpectedFailure = await logActivity(
          'User Login Failed',
          `Unexpected error in auth callback: ${errorMessage}`,
          { error: errorMessage, fullError: error }, // Include full error object in metadata
          undefined,
          'error'
        );
        if (!logUnexpectedFailure) {
          console.error('AuthCallback: Failed to log unexpected login error activity.');
        }
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