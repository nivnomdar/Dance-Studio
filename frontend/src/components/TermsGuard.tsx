import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { TermsAcceptanceModal } from './TermsAcceptanceModal';
import { useLocation } from 'react-router-dom';
import { TermsCookieManager } from '../utils/termsCookieManager';
import { supabase } from '../lib/supabase';

interface TermsGuardProps {
  children: React.ReactNode;
}

// Function to check terms status from backend in real-time
async function checkTermsStatusFromBackend(): Promise<{ terms_accepted: boolean; marketing_consent: boolean } | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.log('TermsGuard: No session, cannot check backend');
      return null;
    }

    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/terms-status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('TermsGuard: Backend terms status check failed:', response.status);
      return null;
    }

    const data = await response.json();
    console.log('TermsGuard: Backend terms status:', data);
    
    return {
      terms_accepted: data.terms_accepted,
      marketing_consent: data.marketing_consent
    };
  } catch (error) {
    console.error('TermsGuard: Error checking backend terms status:', error);
    return null;
  }
}

// Simple cookie reading function
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

// Check if terms are accepted by checking both client-side and httpOnly cookies
function isTermsAccepted(): boolean {
  // Check client-side cookie first
  const clientCookie = getCookie('ladance_terms_accepted');
  console.log('TermsGuard: Cookie check - ladance_terms_accepted =', clientCookie);
  
  if (clientCookie === 'true') {
    return true;
  }
  
  // If no client-side cookie, check if we have a profile with terms_accepted = true
  // This will be handled by the profile check below
  return false;
}

// Debug function to show all cookies
function debugCookies(): void {
  console.log('TermsGuard: All cookies:', document.cookie);
  console.log('TermsGuard: ladance_terms_accepted cookie:', getCookie('ladance_terms_accepted'));
}

export const TermsGuard: React.FC<TermsGuardProps> = ({ children }) => {
  const { profile, isAuthenticated, loading, profileLoading, loadProfile } = useAuth();
  const location = useLocation();
  const hasReloadedProfile = useRef(false);
  const [initialCookieCheck, setInitialCookieCheck] = useState<boolean | null>(null);
  const [modalClosedByUser, setModalClosedByUser] = useState(false);
  const [backendTermsStatus, setBackendTermsStatus] = useState<{ terms_accepted: boolean; marketing_consent: boolean } | null>(null);
  const [isCheckingBackend, setIsCheckingBackend] = useState(false);
  const backendCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastBackendCheckRef = useRef<number>(0);

  // Allow access to terms and privacy policy pages
  const allowedPaths = ['/terms-of-service', '/privacy-policy'];
  const isAllowedPath = allowedPaths.includes(location.pathname);

  // Check cookie only once during first render to prevent modal flash
  useEffect(() => {
    if (initialCookieCheck === null) {
      const cookieValue = isTermsAccepted();
      setInitialCookieCheck(cookieValue);
      console.log('TermsGuard: Initial cookie check:', cookieValue);
    }
  }, [initialCookieCheck]);
  
  // Check backend terms status in real-time with debouncing
  useEffect(() => {
    if (isAuthenticated && profile && !isCheckingBackend) {
      const now = Date.now();
      const timeSinceLastCheck = now - lastBackendCheckRef.current;
      
      // Rate limiting: don't check more than once every 5 seconds
      if (timeSinceLastCheck < 5000) {
        console.log('TermsGuard: Rate limiting - skipping backend check, last check was', timeSinceLastCheck, 'ms ago');
        return;
      }
      
      // Clear any existing timeout
      if (backendCheckTimeoutRef.current) {
        clearTimeout(backendCheckTimeoutRef.current);
      }
      
      // Debounce the check by 1 second
      backendCheckTimeoutRef.current = setTimeout(async () => {
        setIsCheckingBackend(true);
        lastBackendCheckRef.current = Date.now();
        console.log('TermsGuard: Checking backend terms status for user:', profile.id);
        
        const backendStatus = await checkTermsStatusFromBackend();
        if (backendStatus) {
          setBackendTermsStatus(backendStatus);
          console.log('TermsGuard: Backend validation result:', backendStatus);
          
          // If backend says terms are not accepted, clear any local cookie
          if (!backendStatus.terms_accepted) {
            console.log('TermsGuard: Backend says terms not accepted, clearing local cookie');
            TermsCookieManager.clearTermsCookie();
            setInitialCookieCheck(false);
          }
        }
        setIsCheckingBackend(false);
      }, 1000);
    }
    
    // Cleanup timeout on unmount
    return () => {
      if (backendCheckTimeoutRef.current) {
        clearTimeout(backendCheckTimeoutRef.current);
      }
    };
  }, [isAuthenticated, profile, isCheckingBackend]);
  
  // Debug cookies on first render
  useEffect(() => {
    debugCookies();
  }, []);

  // Reload profile only once when component mounts, and only if we don't have a valid profile
  useEffect(() => {
    if (isAuthenticated && !profileLoading && !hasReloadedProfile.current && !profile) {
      console.log('TermsGuard: Reloading profile once because no profile exists');
      hasReloadedProfile.current = true;
      
      // Emergency cleanup of old cookies on first load
      TermsCookieManager.emergencyCleanup();
      
      loadProfile(true).catch(console.error);
    }
  }, [isAuthenticated, profileLoading, loadProfile, profile]);

  // Determine if we should show the terms modal and synchronize cookie with profile status
  useEffect(() => {
    if (!isAuthenticated || profileLoading || !profile) {
      return;
    }

    // Validate and cleanup cookies for current user
    TermsCookieManager.validateAndCleanupTermsCookie(profile.id);

    // If profile says terms are accepted but cookie is not set, set the cookie.
    // This ensures consistency and prevents the "Cookie: false" issue.
    if (profile.terms_accepted === true && initialCookieCheck === false) {
      console.log('TermsGuard: Profile terms accepted, but cookie not set. Setting cookie.');
      TermsCookieManager.setTermsAccepted(profile.id);
      setInitialCookieCheck(true); // Update local state to reflect the cookie change
    }
    
    // Only clear the terms cookie if profile says terms are not accepted AND no cookie exists
    // This prevents clearing an existing valid cookie
    if (profile && profile.terms_accepted === false && !initialCookieCheck) {
      console.log('TermsGuard: Profile says terms not accepted and no cookie exists, clearing any stale cookie');
      TermsCookieManager.clearTermsCookie();
      setInitialCookieCheck(false);
    }

    // Log the current state for debugging
    console.log('TermsGuard Debug:', {
      loading,
      isAuthenticated,
      hasProfile: !!profile,
      profileTermsAccepted: profile?.terms_accepted,
      cookieTermsAccepted: initialCookieCheck,
      currentPath: location.pathname,
      isAllowedPath,
      profileLoading
    });
  }, [isAuthenticated, profile, profileLoading, isAllowedPath, location.pathname, initialCookieCheck]);

  // No need to prevent body scrolling - let the modal handle its own scrolling
  // This prevents the page from being frozen and changing its appearance
  
  // If still loading or not authenticated, show children (normal app flow)
  if (loading || !isAuthenticated) {
    return <>{children}</>;
  }

  // If profile is still loading, show children (wait for it to complete)
  if (profileLoading) {
    console.log('TermsGuard: Profile still loading, waiting...');
    return <>{children}</>;
  }

  // If no profile yet, show children (wait for profile to load)
  if (!profile) {
    console.log('TermsGuard: No profile yet, waiting...');
    return <>{children}</>;
  }

  // If profile is incomplete, show children (wait for profile to complete)
  if (!profile.id || !profile.email) {
    console.log('TermsGuard: Profile incomplete, waiting...');
    return <>{children}</>;
  }

  // If terms are already accepted (either by cookie or profile), show success modal for existing users
  // Priority: Backend validation > Local profile > Cookie
  const termsAccepted = backendTermsStatus?.terms_accepted ?? profile?.terms_accepted ?? initialCookieCheck;
  
  if (termsAccepted === true) {
    console.log('TermsGuard: Terms accepted - Backend:', backendTermsStatus?.terms_accepted, 'Profile:', profile?.terms_accepted, 'Cookie:', initialCookieCheck);
    
    // Show success modal for existing users who just logged in
    // Only if they haven't closed it yet and the cookie was just set in this session
    if (profile && !initialCookieCheck && !modalClosedByUser) {
      console.log('TermsGuard: Existing user logged in, showing welcome back modal');
      
      return (
        <>
          {/* Show the actual website content normally */}
          {children}

          {/* Overlay with welcome back modal */}
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] pointer-events-auto">
            <TermsAcceptanceModal
              isOpen={true}
              userId={profile.id}
              marketingConsent={backendTermsStatus?.marketing_consent ?? profile.marketing_consent ?? false}
              isNewUser={false}
              showWelcomeBack={true} // New prop to show welcome back message
              onAccept={() => {
                console.log('TermsGuard: Welcome back modal closed by user');
                
                // Mark that the user closed the modal
                setModalClosedByUser(true);
                
                // Update the cookie when the welcome back modal is closed
                // This prevents the modal from showing again
                TermsCookieManager.setTermsAccepted(profile.id);
                console.log('TermsGuard: Cookie updated for existing user:', profile.id);
                console.log('TermsGuard: Modal will now close and user can access the site normally');
                
                // Just close the modal, no need to reload profile
              }}
            />
          </div>
        </>
      );
    }
    
    // Normal flow for users with existing cookies or who closed the modal
    return <>{children}</>;
  }

  // If terms are explicitly not accepted, show the modal
  // Priority: Backend validation > Local profile
  const termsNotAccepted = backendTermsStatus?.terms_accepted === false || profile?.terms_accepted === false;
  
  if (profile && termsNotAccepted) {
    console.log('TermsGuard: Terms not accepted - Backend:', backendTermsStatus?.terms_accepted, 'Profile:', profile?.terms_accepted);
    
    // If user is on allowed paths, show the content without modal
    if (isAllowedPath) {
      console.log('TermsGuard: User on allowed path, showing content without modal');
      return <>{children}</>;
    }
    
    return (
      <>
        {/* Show the actual website content normally - no blur, no pointer-events-none */}
        {/* The modal overlay will handle the focus */}
        {children}

        {/* Overlay with terms modal */}
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] pointer-events-auto">
          <TermsAcceptanceModal
            isOpen={true}
            userId={profile.id}
            marketingConsent={backendTermsStatus?.marketing_consent ?? profile.marketing_consent ?? false}
            isNewUser={false}
            onAccept={() => {
              // Don't reload profile automatically - let the user see the success message first
              // The profile will be reloaded when they click the "Go to Home" button
              console.log('TermsGuard: Modal accepted, waiting for user to click home button');
              
              // Note: Profile reload will happen when user clicks "Go to Home" button
              // This prevents the modal from closing automatically
            }}
          />
        </div>
      </>
    );
  }

  // If we reach here, it means profile.terms_accepted is undefined/null
  // This happens with temporary profiles - wait for the real profile to load
  // But also check if backend validation is complete
  if (profile && profile.terms_accepted === undefined) {
    // If backend validation is still pending, wait
    if (isCheckingBackend) {
      console.log('TermsGuard: Backend validation in progress, waiting...');
      return <>{children}</>;
    }
    
    // If backend validation is complete but profile is still undefined, wait for profile
    if (backendTermsStatus === null) {
      console.log('TermsGuard: Profile terms_accepted is undefined (temporary profile), waiting for real profile to load');
      return <>{children}</>;
    }
    
    // Backend validation is complete, use that data
    console.log('TermsGuard: Using backend validation data for temporary profile');
    if (backendTermsStatus.terms_accepted === true) {
      // Terms accepted according to backend
      return <>{children}</>;
    } else {
      // Terms not accepted according to backend - show modal
      if (isAllowedPath) {
        console.log('TermsGuard: User on allowed path, showing content without modal');
        return <>{children}</>;
      }
      
      return (
        <>
          {children}
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] pointer-events-auto">
            <TermsAcceptanceModal
              isOpen={true}
              userId={profile.id}
              marketingConsent={backendTermsStatus.marketing_consent}
              isNewUser={false}
              onAccept={() => {
                console.log('TermsGuard: Modal accepted, waiting for user to click home button');
              }}
            />
          </div>
        </>
      );
    }
  }

  // This should not happen, but just in case, show children
  console.log('TermsGuard: Unexpected state, showing normal app');
  return <>{children}</>;
};
