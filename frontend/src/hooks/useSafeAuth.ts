import { useAuth } from '../contexts/AuthContext';
import { 
  getSafeUserMetadata, 
  getSafeFullName, 
  getSafeAvatarUrl, 
  getSafeEmail,
  validateUserForOperation,
  validateSessionForOperation
} from '../utils/authUtils';
// Note: keep imports minimal; types are inferred where possible

/**
 * Safe auth hook that provides null-safe access to auth data
 * This hook wraps the useAuth hook and provides additional safety checks
 */
export const useSafeAuth = () => {
  // console.log('useSafeAuth hook called at:', new Date().toISOString()); // Debug log
  const auth = useAuth();
  
  // Safe getters with null checks
  const safeUser = auth.user;
  const safeSession = auth.session;
  
  // Safe metadata access
  const userMetadata = getSafeUserMetadata(safeUser);
  const fullName = getSafeFullName(safeUser);
  const avatarUrl = getSafeAvatarUrl(safeUser);
  const email = getSafeEmail(safeUser);
  
  // Validation helpers
  const isUserValid = (operation?: string): boolean => {
    if (operation) {
      return validateUserForOperation(safeUser, operation);
    }
    return Boolean(safeUser?.id);
  };
  
  const isSessionValid = (operation?: string): boolean => {
    if (operation) {
      return validateSessionForOperation(safeSession, operation);
    }
    return Boolean(safeSession?.access_token && safeSession?.user);
  };
  
  // Safe profile access
  const profile = auth.profile;
  const isAdmin = profile?.role === 'admin';
  const hasUsedTrialClass = false; // deprecated global flag; per-class logic now
  
  // Safe user info
  const userInfo = {
    id: safeUser?.id || null,
    email: email,
    fullName: fullName,
    avatarUrl: avatarUrl,
    metadata: userMetadata
  };
  
  // Safe session info
  const sessionInfo = {
    accessToken: safeSession?.access_token || null,
    refreshToken: safeSession?.refresh_token || null,
    expiresIn: safeSession?.expires_in || 0,
    expiresAt: safeSession?.expires_at || null,
    tokenType: safeSession?.token_type || null
  };
  
  return {
    // Original auth context
    ...auth,
    
    // Safe user data
    safeUser,
    safeSession,
    userInfo,
    sessionInfo,
    
    // Safe metadata
    userMetadata,
    fullName,
    avatarUrl,
    email,
    
    // Validation helpers
    isUserValid,
    isSessionValid,
    
    // Safe profile data
    profile,
    isAdmin,
    hasUsedTrialClass,
    
    // Computed properties
    isAuthenticated: auth.isAuthenticated,
    loading: auth.loading,
    profileLoading: auth.profileLoading
  };
};

/**
 * Hook for conditional auth operations
 * Only executes the operation if user is valid
 */
export const useConditionalAuth = () => {
  // console.log('useConditionalAuth hook called at:', new Date().toISOString()); // Debug log
  const { isUserValid, isSessionValid, safeUser, safeSession } = useSafeAuth();
  
  const withValidUser = <T extends any[], R>(
    operation: (...args: T) => R,
    fallback?: R
  ) => {
    return (...args: T): R | undefined => {
      if (isUserValid()) {
        return operation(...args);
      }
      return fallback;
    };
  };
  
  const withValidSession = <T extends any[], R>(
    operation: (...args: T) => R,
    fallback?: R
  ) => {
    return (...args: T): R | undefined => {
      if (isSessionValid()) {
        return operation(...args);
      }
      return fallback;
    };
  };
  
  return {
    withValidUser,
    withValidSession,
    isUserValid,
    isSessionValid,
    safeUser,
    safeSession
  };
}; 