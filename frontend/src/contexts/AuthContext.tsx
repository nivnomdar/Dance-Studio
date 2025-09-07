import { createContext, useContext, useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import {
  AuthContextType,
  UserProfile,
  SafeUser,
  SafeSession,
  AuthState,
  AuthEvent
} from '../types/auth';
import {
  createSafeSession,
  handleAuthError
} from '../utils/authUtils';
import {
  setDataWithTimestamp,
  getDataWithTimestamp,
  hasCookie,
  clearAllCookies,
  frontendCookieManager // Added this import
} from '../utils/cookieManager';
import { TermsCookieManager } from '../utils/termsCookieManager';
import { throttledApiFetch } from '../utils/api'; // Added this import

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {

  // State
  const [user, setUser] = useState<SafeUser | null>(null);
  const [session, setSession] = useState<SafeSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [, setAuthState] = useState<AuthState>(AuthState.LOADING);

  // Refs for rate limiting and timeouts
  const profileUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Function refs to prevent re-renders
  const loadProfileSafelyRef = useRef<((userId: string, forceRefresh?: boolean) => Promise<UserProfile | null>) | null>(null);
  const createProfileForUserRef = useRef<((safeUser: SafeUser) => Promise<UserProfile | null>) | null>(null);
  const updateProfileLoginTimeRef = useRef<((userId: string) => Promise<void>) | null>(null);

  // Computed properties
  const isAuthenticated = Boolean(user && session);
  const isAdmin = profile?.role === 'admin';

  // Profile creation function
  const createProfileForUser = useCallback(async (safeUser: SafeUser): Promise<UserProfile | null> => {
    if (!safeUser?.id) {
      console.error('Cannot create profile: user ID is missing');
      return null;
    }

    try {
      // Check if we're already creating a profile to prevent race condition
      const creatingKey = `creating_profile_${safeUser.id}`;
      if (hasCookie(creatingKey)) {
        // Another process is creating the profile, wait a bit and retry
        await new Promise(resolve => setTimeout(resolve, 500));
        return await createProfileForUser(safeUser);
      }

      // Set flag to prevent other processes from creating profile
      setDataWithTimestamp(creatingKey, 'true', 5 * 60 * 1000); // 5 דקות

      // Check if profile already exists to avoid overwriting existing values - removed terms_accepted, marketing_consent
      // No need to fetch existingProfile explicitly, upsert handles conflicts by 'id'
      // Removed explicit select of 'id' and 'maybeSingle()' as it's redundant with upsert on 'id'

      const avatarUrl = safeUser.user_metadata?.avatar_url || '';
      const profileData = {
        id: safeUser.id,
        email: safeUser.email || '',
        first_name: safeUser.user_metadata?.full_name?.split(' ')[0] || '',
        last_name: safeUser.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
        role: 'user',
        avatar_url: avatarUrl,
        created_at: new Date().toISOString(),
        is_active: true,
        // Removed explicit setting of terms_accepted and marketing_consent as they are managed in user_consents table
        last_login_at: new Date().toISOString(),
        language: 'he'
      };

      // Use throttledApiFetch for profile creation
      const { data: newProfile, error: createError } = await (async () => {
        const response = await throttledApiFetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles`, {
          method: 'POST',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify(profileData)
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to create profile: ${response.status} - ${errorText}`);
        }
        const data = await response.json();
        return { data: data[0], error: null }; // Supabase returns an array for inserts
      })();
      
      if (createError) {
        handleAuthError(createError, 'create profile');
        return null;
      }

      // Cache the new profile immediately
      if (newProfile) {
        const cacheKey = `profile_${safeUser.id}`;
        setDataWithTimestamp(cacheKey, newProfile, 5 * 60 * 1000); // 5 דקות
      }

      return newProfile;
    } catch (error) {
      handleAuthError(error, 'createProfileForUser');
      return null;
    } finally {
      // Always remove the flag
      const creatingKey = `creating_profile_${safeUser.id}`;
      frontendCookieManager.removeCookie(creatingKey); // Remove only the specific flag cookie
    }
  }, []);

  // Store function in ref immediately
  createProfileForUserRef.current = createProfileForUser;

  // Profile loading function
  const loadProfileSafely = useCallback(async (userId: string, forceRefresh: boolean = false): Promise<UserProfile | null> => {
    if (!userId) {
      console.error('Cannot load profile: user ID is missing');
      return null;
    }

    try {
      // Check cache first (unless forcing refresh)
      const cacheKey = `profile_${userId}`;
      if (!forceRefresh) {
        const cachedProfile = getDataWithTimestamp<UserProfile>(cacheKey, 5 * 60 * 1000);
        if (cachedProfile) {
          return cachedProfile;
        }
      } else {
        // Clear cache if forcing refresh
        try {
          localStorage.removeItem(cacheKey);
        } catch (error) {
          console.warn('Could not clear profile cache:', error);
        }
      }

      // Use throttledApiFetch for profile loading
      const { data: profileData, error } = await (async () => {
        const response = await throttledApiFetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles?select=*&id=eq.${userId}`, {
          method: 'GET',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch profile: ${response.status} - ${errorText}`);
        }
        const data = await response.json();
        return { data: data[0], error: null }; // Supabase returns an array for selects
      })();
      
      if (error) {
        console.error('Error loading profile:', error);
        return null;
      }

      // If no profile found, create one
      if (!profileData) {
        const currentUser = user;
        if (currentUser && createProfileForUserRef.current) {
          const newProfile = await createProfileForUserRef.current(currentUser);
          if (newProfile) {
            // Cache the new profile
            setDataWithTimestamp(cacheKey, newProfile, 5 * 60 * 1000);
          }
          return newProfile;
        }
        return null;
      }

      // Cache the profile
      setDataWithTimestamp(cacheKey, profileData, 5 * 60 * 1000);

      return profileData;
    } catch (error) {
      console.error('Error in loadProfileSafely:', error);
      return null;
    }
  }, [user]);

  // Store function in ref immediately
  loadProfileSafelyRef.current = loadProfileSafely;

  // Profile update function
  const updateProfileLoginTime = useCallback(async (userId: string): Promise<void> => {
    if (!userId) return;

    try {
      // Use throttledApiFetch for updating last_login_at
      const response = await throttledApiFetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, {
        method: 'PATCH',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal' // No need to return data for this update
        },
        body: JSON.stringify({ last_login_at: new Date().toISOString() })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error updating last login time:', response.status, errorText);
      }
    } catch (error) {
      console.error('Error in updateProfileLoginTime:', error);
    }
  }, [session]); // Depend on session to get access_token

  // Store function in ref immediately
  updateProfileLoginTimeRef.current = updateProfileLoginTime;

  // Initialize auth state
  const initializeAuth = useCallback(async () => {
    try {
      setLoading(true);
      setAuthState(AuthState.LOADING);

      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error getting session:', error);
        setAuthState(AuthState.ERROR);
        return;
      }

      const safeSession = createSafeSession(session);
      const safeUser = safeSession?.user || null;

      setSession(safeSession);
      setUser(safeUser);

      if (safeUser) {
        setAuthState(AuthState.AUTHENTICATED);
        // Load profile here, this is the main place to do it.
        const profileData = await loadProfileSafelyRef.current?.(safeUser.id, false);
        if (profileData) {
          // Clean up old cookies and validate current user data
          TermsCookieManager.validateAndCleanupTermsCookie(safeUser.id);
        }
        setProfile(profileData || null);
      } else {
        setAuthState(AuthState.UNAUTHENTICATED);
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      setAuthState(AuthState.ERROR);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign out function
  const signOut = useCallback(async () => {
    try {
      // Immediate state cleanup with setTimeout to avoid setState during render
      setTimeout(() => {
        setProfile(null);
        setUser(null);
        setSession(null);
        setAuthState(AuthState.UNAUTHENTICATED);
      }, 0);

      // Clear timeouts
      if (profileUpdateTimeoutRef.current) {
        clearTimeout(profileUpdateTimeoutRef.current);
      }

              // Clear storage
        try {
          // Clear all profile cache entries
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('profile_') || key.includes('supabase') || key.includes('auth') || key.includes('avigail')) {
              localStorage.removeItem(key);
            }
          });

          // Clear all cookies
          clearAllCookies();

          // Clear terms cookie
          TermsCookieManager.clearTermsCookie();

          // Clear any remaining profile cookies
          const cookies = document.cookie.split(';');
          cookies.forEach(cookie => {
            const trimmedCookie = cookie.trim();
            if (trimmedCookie.startsWith('profile_')) {
              const cookieName = trimmedCookie.split('=')[0];
              document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
            }
          });
        } catch (e) {
          console.error('Could not clear storage:', e);
        }

      // Background sign out
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error in signOut:', error);
      throw error;
    }
  }, []);

  // Load profile function
  const loadProfile = useCallback(async (forceRefresh: boolean = false) => {
    if (!user?.id) {
      console.error('Cannot load profile: no authenticated user');
      return;
    }

    setProfileLoading(true);
    try {
      const profileData = await loadProfileSafelyRef.current?.(user.id, forceRefresh);
      if (profileData) {
        // Clean up old cookies and validate current user data
        TermsCookieManager.validateAndCleanupTermsCookie(user.id);

        // Don't auto-update terms cookie for existing users
        // This allows the welcome back modal to stay open
        // Cookie will be updated when user closes the modal

      }
      setProfile(profileData || null);
    } catch (error) {
      console.error('Error in loadProfile:', error);
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  }, [user]);

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Handle auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthEvent, session: Session | null) => {

        const safeSession = createSafeSession(session);
        const safeUser = safeSession?.user || null;

        // Use setTimeout to avoid setState during render
        setTimeout(() => {
          setSession(safeSession);
          setUser(safeUser);
        }, 0);

        switch (event) {
          case 'SIGNED_OUT':
            setTimeout(() => {
              setAuthState(AuthState.UNAUTHENTICATED);
              setProfile(null);
              setProfileLoading(false);
            }, 0);
            // Clear timeouts
            if (profileUpdateTimeoutRef.current) {
              clearTimeout(profileUpdateTimeoutRef.current);
            }
            break;

          case 'SIGNED_IN':
          case 'INITIAL_SESSION':
            if (safeUser) {
              setTimeout(() => {
                setAuthState(AuthState.AUTHENTICATED);
                // setProfileLoading(true);
              }, 0);
              // Profile loading is handled by initializeAuth
              // await handleProfileOperations(safeUser, event);
              // setTimeout(() => {
              //   setProfileLoading(false);
              // }, 0);
            }
            break;

          case 'USER_UPDATED':
            if (safeUser) {
              setTimeout(() => {
                setAuthState(AuthState.AUTHENTICATED);
              }, 0);
            }
            break;

          default:
            // Handle other events if needed
            break;
        }

        setTimeout(() => {
          setLoading(false);
        }, 0);
      }
    );

    return () => {
      subscription.unsubscribe();
      if (profileUpdateTimeoutRef.current) {
        clearTimeout(profileUpdateTimeoutRef.current);
      }
    };
  }, []);

  // Context value
  const value: AuthContextType = useMemo(() => {
    return {
      user,
      session,
      loading,
      profile,
      profileLoading,
      loadProfile,
      signOut,
      isAuthenticated,
      isAdmin
    };
  }, [
    user,
    session,
    loading,
    profile,
    profileLoading,
    loadProfile,
    signOut,
    isAuthenticated,
    isAdmin
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 