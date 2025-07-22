import { User, Session } from '@supabase/supabase-js';
import { SafeUser, SafeSession, SafeUserMetadata } from '../types/auth';

/**
 * Safe utility functions for Supabase Auth
 * These functions provide null-safe access to user and session data
 */

/**
 * Safely extract user metadata with fallbacks
 */
export const getSafeUserMetadata = (user: User | SafeUser | null): SafeUserMetadata => {
  if (!user) return {};
  
  // Handle both User and SafeUser types
  const metadata = 'user_metadata' in user ? user.user_metadata : user.user_metadata;
  return (metadata as SafeUserMetadata) || {};
};

/**
 * Safely get user's full name
 */
export const getSafeFullName = (user: User | SafeUser | null): string => {
  const metadata = getSafeUserMetadata(user);
  return metadata.full_name || '';
};

/**
 * Safely get user's avatar URL
 */
export const getSafeAvatarUrl = (user: User | SafeUser | null): string | null => {
  const metadata = getSafeUserMetadata(user);
  return metadata.avatar_url || null;
};

/**
 * Safely get user's email
 */
export const getSafeEmail = (user: User | SafeUser | null): string => {
  if (!user) return '';
  
  // Handle both User and SafeUser types
  return 'email' in user ? (user.email || '') : (user.email || '');
};

/**
 * Safely get user's ID
 */
export const getSafeUserId = (user: User | SafeUser | null): string | null => {
  if (!user) return null;
  
  // Handle both User and SafeUser types
  return user.id;
};

/**
 * Check if user is authenticated
 */
export const isUserAuthenticated = (user: User | SafeUser | null): boolean => {
  return Boolean(user && getSafeUserId(user));
};

/**
 * Check if session is valid
 */
export const isSessionValid = (session: Session | SafeSession | null): boolean => {
  if (!session) return false;
  
  // Check if session has required properties
  const hasAccessToken = Boolean(session.access_token);
  const hasUser = Boolean(session.user);
  
  return hasAccessToken && hasUser;
};

/**
 * Safely parse user metadata
 */
export const parseUserMetadata = (metadata: any): SafeUserMetadata => {
  if (!metadata || typeof metadata !== 'object') {
    return {};
  }

  return {
    full_name: metadata.full_name || '',
    avatar_url: metadata.avatar_url || null,
    email: metadata.email || '',
    ...metadata
  };
};

/**
 * Create safe user object from Supabase User
 */
export const createSafeUser = (user: User | null): SafeUser | null => {
  if (!user) return null;
  
  return {
    id: user.id,
    email: user.email || undefined,
    user_metadata: parseUserMetadata(user.user_metadata),
    app_metadata: user.app_metadata || {},
    aud: user.aud,
    created_at: user.created_at,
    updated_at: user.updated_at || undefined
  };
};

/**
 * Create safe session object from Supabase Session
 */
export const createSafeSession = (session: Session | null): SafeSession | null => {
  if (!session) return null;
  
  const safeUser = createSafeUser(session.user);
  if (!safeUser) return null;
  
  return {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_in: session.expires_in,
    expires_at: session.expires_at,
    token_type: session.token_type,
    user: safeUser
  };
};

/**
 * Validate user data before operations
 */
export const validateUserForOperation = (user: User | SafeUser | null, operation: string): boolean => {
  if (!user) {
    console.error(`Cannot perform ${operation}: user is null`);
    return false;
  }

  const userId = getSafeUserId(user);
  if (!userId) {
    console.error(`Cannot perform ${operation}: user ID is missing`);
    return false;
  }

  return true;
};

/**
 * Validate session data before operations
 */
export const validateSessionForOperation = (session: Session | SafeSession | null, operation: string): boolean => {
  if (!session) {
    console.error(`Cannot perform ${operation}: session is null`);
    return false;
  }

  if (!isSessionValid(session)) {
    console.error(`Cannot perform ${operation}: session is invalid`);
    return false;
  }

  return true;
};

/**
 * Safe error handling for auth operations
 */
export const handleAuthError = (error: any, operation: string): void => {
  if (error?.message) {
    console.error(`Error in ${operation}:`, error.message);
  } else if (error?.code) {
    console.error(`Error in ${operation}:`, error.code);
  } else {
    console.error(`Unknown error in ${operation}:`, error);
  }
};

/**
 * Debounce function for auth operations
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function for auth operations
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}; 