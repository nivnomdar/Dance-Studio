import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { TermsAcceptanceModal } from './TermsAcceptanceModal';
import { useLocation } from 'react-router-dom';
import { TermsCookieManager } from '../utils/termsCookieManager';
import { supabase } from '../lib/supabase';
import { throttledApiFetch } from '../utils/api';
import type { UserConsent } from '../types/auth';

interface TermsGuardProps {
  children: React.ReactNode;
}

// Function to check terms status from backend in real-time
async function checkTermsStatusFromBackend(): Promise<{ terms_accepted: boolean; marketing_consent: boolean } | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return null;
    }

    const response = await throttledApiFetch(`${import.meta.env.VITE_API_BASE_URL}/profiles/consents`, {
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

    const consents: UserConsent[] = await response.json();
    
    const termsAccepted = consents.some(c => c.consent_type === 'terms_and_privacy' && c.version === null);
    const marketingConsent = consents.some(c => c.consent_type === 'marketing' && c.version === null);
    
    return {
      terms_accepted: termsAccepted,
      marketing_consent: marketingConsent
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
  
  if (clientCookie === 'true') {
    return true;
  }
  
  return false;
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
    }
  }, [initialCookieCheck]);
  
  // Check backend terms status in real-time with debouncing
  useEffect(() => {
    if (isAuthenticated && profile && !isCheckingBackend) {
      const now = Date.now();
      const timeSinceLastCheck = now - lastBackendCheckRef.current;
      
      // Rate limiting: don't check more than once every 5 seconds
      if (timeSinceLastCheck < 5000) {
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
        
        const backendStatus = await checkTermsStatusFromBackend();
        if (backendStatus) {
          setBackendTermsStatus(backendStatus);
          
          // If backend says terms are not accepted, clear any local cookie
          if (!backendStatus.terms_accepted) {
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
  
  // Reload profile only once when component mounts, and only if we don't have a valid profile
  useEffect(() => {
    if (isAuthenticated && !profileLoading && !hasReloadedProfile.current && !profile) {
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

    // If backend says terms are accepted but cookie is not set, set the cookie.
    // This ensures consistency and prevents the "Cookie: false" issue.
    if (backendTermsStatus?.terms_accepted === true && initialCookieCheck === false) {
      TermsCookieManager.setTermsAccepted(profile.id);
      setInitialCookieCheck(true); // Update local state to reflect the cookie change
    }
    
    // Only clear the terms cookie if backend says terms are not accepted AND no cookie exists
    // This prevents clearing an existing valid cookie
    if (backendTermsStatus?.terms_accepted === false && !initialCookieCheck) {
      TermsCookieManager.clearTermsCookie();
      setInitialCookieCheck(false);
    }

  }, [isAuthenticated, profile, profileLoading, isAllowedPath, location.pathname, initialCookieCheck, backendTermsStatus]);

  // If still loading or not authenticated, show children (normal app flow)
  if (loading || !isAuthenticated) {
    return <>{children}</>;
  }

  // If profile is still loading or no profile yet, or profile is incomplete, wait
  if (profileLoading || !profile || !profile.id || !profile.email) {
    return <>{children}</>;
  }

  // Determine the effective terms accepted status
  // Priority: Backend validation > Cookie
  const effectiveTermsAccepted = backendTermsStatus?.terms_accepted ?? initialCookieCheck;
  const effectiveMarketingConsent = backendTermsStatus?.marketing_consent ?? false;
  
  // If user is on allowed paths, always show the content without modal
  if (isAllowedPath) {
    return <>{children}</>;
  }

  // Case 1: Terms are accepted
  if (effectiveTermsAccepted === true) {
    
    // Show welcome back modal for existing users who just logged in
    // Only if they haven't closed it yet and the cookie was just set in this session (meaning they were redirected after login)
    // Note: initialCookieCheck becomes true when a cookie is set, but this specific modal should only show if cookie was false before backend confirmed acceptance
    if (isAuthenticated && !initialCookieCheck && !modalClosedByUser) {
      
      return (
        <>
          {/* Show the actual website content normally */}
          {children}

          {/* Overlay with welcome back modal */}
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] pointer-events-auto">
            <TermsAcceptanceModal
              isOpen={true}
              userId={profile.id}
              marketingConsent={effectiveMarketingConsent}
              isNewUser={false}
              showWelcomeBack={true} // New prop to show welcome back message
              onAccept={() => {
                
                // Mark that the user closed the modal
                setModalClosedByUser(true);
                
                // Update the cookie when the welcome back modal is closed
                // This prevents the modal from showing again
                TermsCookieManager.setTermsAccepted(profile.id);
                
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

  // Case 2: Terms are not accepted (or still pending backend check if it's the first time)
  // This covers initial state where backendTermsStatus is null or terms_accepted is false
  if (effectiveTermsAccepted === false || backendTermsStatus === null) {
    // If backend validation is still pending, wait (unless it's null because of no session, already handled)
    if (isCheckingBackend && backendTermsStatus === null) {
      return <>{children}</>;
    }

    // If backend confirmed terms not accepted OR it's a first load and no cookie, show modal
    
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
            marketingConsent={effectiveMarketingConsent}
            isNewUser={false} // Assume false for existing users, NewUser logic is handled by auth flow
            onAccept={() => {
            }}
          />
        </div>
      </>
    );
  }

  // Fallback: This should ideally not be reached if the logic covers all cases
  return <>{children}</>;
};
