import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { TermsAcceptanceModal } from './TermsAcceptanceModal';
import { useLocation } from 'react-router-dom';
import { TermsCookieManager } from '../utils/termsCookieManager';

interface TermsGuardProps {
  children: React.ReactNode;
}

export const TermsGuard: React.FC<TermsGuardProps> = ({ children }) => {
  const { profile, isAuthenticated, loading, profileLoading, loadProfile } = useAuth();
  const location = useLocation();
  const hasReloadedProfile = useRef(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Allow access to terms and privacy policy pages
  const allowedPaths = ['/terms-of-service', '/privacy-policy'];
  const isAllowedPath = allowedPaths.includes(location.pathname);

  // Reload profile only once when component mounts, and only if we don't have a valid profile
  useEffect(() => {
    if (isAuthenticated && !profileLoading && !hasReloadedProfile.current && !profile) {
      console.log('TermsGuard: Reloading profile once because no profile exists');
      hasReloadedProfile.current = true;
      loadProfile().catch(console.error);
    }
  }, [isAuthenticated, profileLoading, loadProfile, profile]);

  // Determine if we should show the terms modal
  useEffect(() => {
    if (!isAuthenticated || profileLoading || !profile) {
      setShowTermsModal(false);
      return;
    }

    // Check if terms are already accepted
    const termsAccepted = profile.terms_accepted === true || 
                         TermsCookieManager.isTermsAcceptedForUser(profile.id);

    // Show modal if:
    // 1. Not on allowed path
    // 2. Terms not accepted
    // 3. Profile exists and has required fields
    const shouldShow = !isAllowedPath && 
                      !termsAccepted && 
                      !!profile.id && 
                      !!profile.email &&
                      profile.terms_accepted !== undefined &&
                      profile.terms_accepted !== null;

    // Only update showTermsModal if it's different from current state
    if (showTermsModal !== shouldShow) {
      console.log('TermsGuard: Updating modal state from', showTermsModal, 'to', shouldShow);
      setShowTermsModal(!!shouldShow);
    }

    // Debug cookie status
    const cookieData = TermsCookieManager.getTermsAccepted();
    console.log('TermsGuard: Cookie status:', {
      cookieData,
      cookieAccepted: TermsCookieManager.isTermsAcceptedForUser(profile.id),
      profileTermsAccepted: profile.terms_accepted,
      finalTermsAccepted: termsAccepted,
      currentModalState: showTermsModal,
      newModalState: shouldShow
    });

    console.log('TermsGuard Debug:', {
      loading,
      isAuthenticated,
      hasProfile: !!profile,
      profileTermsAccepted: profile?.terms_accepted,
      cookieTermsAccepted: TermsCookieManager.isTermsAcceptedForUser(profile?.id),
      shouldShowModal: shouldShow,
      currentPath: location.pathname,
      isAllowedPath,
      profileLoading
    });
  }, [isAuthenticated, profile, profileLoading, isAllowedPath, location.pathname, showTermsModal]);

  // Prevent body scrolling when terms modal is shown
  useEffect(() => {
    if (showTermsModal) {
      // Prevent scrolling
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${window.scrollY}px`;
    } else {
      // Restore scrolling
      const scrollY = document.body.style.top;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }

    return () => {
      // Cleanup: restore scrolling
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
    };
  }, [showTermsModal]);

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

  // If terms are already accepted, show the normal app
  if (profile.terms_accepted === true || TermsCookieManager.isTermsAcceptedForUser(profile.id)) {
    console.log('TermsGuard: Terms already accepted (profile or cookie), showing normal app');
    return <>{children}</>;
  }

  // If we should show the terms modal
  if (showTermsModal) {
    console.log('TermsGuard: Showing terms modal - forcing modal to stay open');
    
    // Force the modal to stay open by preventing any state changes
    // that might hide it
    return (
      <>
        {/* Show the actual website content but blurred and prevent scrolling */}
        <div className="blur-[2px] pointer-events-none select-none transition-all duration-300 overflow-hidden">
          {children}
        </div>

        {/* Overlay with terms modal */}
        <div className="fixed inset-0 flex items-center justify-center z-[60] pointer-events-auto overflow-hidden">
          <TermsAcceptanceModal
            isOpen={true}
            userId={profile.id}
            marketingConsent={profile.marketing_consent}
            isNewUser={profile.created_at === profile.updated_at}
            onAccept={() => {
              // The modal will close and TermsGuard will re-evaluate
              console.log('TermsGuard: Modal accepted, profile should be updated');
              
              // Force a profile reload to ensure we get the latest data
              setTimeout(() => {
                loadProfile().then(() => {
                  console.log('TermsGuard: Profile reloaded after terms acceptance');
                }).catch(console.error);
              }, 1000);
            }}
          />
        </div>
      </>
    );
  }

  // If accessing allowed pages or any other case, show the normal app
  console.log('TermsGuard: Normal flow - terms accepted or allowed path');
  return <>{children}</>;
};
