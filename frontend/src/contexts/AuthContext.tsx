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
import { logActivity } from '../utils/activityLogger'; // Added this import
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
      const creatingKey = `creating_profile_${safeUser.id}`;
      if (hasCookie(creatingKey)) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return await createProfileForUser(safeUser);
      }
      setDataWithTimestamp(creatingKey, 'true', 5 * 60 * 1000);

      let existingProfile = null;
      try {
        // First, try to fetch the profile. If it exists, it's not a *new* creation by this frontend call.
        const response = await throttledApiFetch(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles?select=*&id=eq.${safeUser.id}`,
          {
            method: 'GET',
            headers: {
              'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${session?.access_token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        if (!response.ok) {
          // If not found (404) or other error, assume no profile exists for now. Log and continue.
          const errorText = await response.text();
          console.error(`AuthContext: Error fetching existing profile (may not exist yet): Status ${response.status} - ${errorText}`);
          // console.log('AuthContext: Raw error from Supabase (fetch existing profile):', errorText); // Removed debug log
        } else {
          const data = await response.json();
          if (data && data.length > 0) {
            existingProfile = data[0];
          }
        }
      } catch (fetchError) {
        console.error('AuthContext: Unexpected error during initial profile fetch:', fetchError);
      }

      const avatarUrl = safeUser.user_metadata?.avatar_url || '';
      const profileData = {
        id: safeUser.id,
        email: safeUser.email || '',
        first_name: safeUser.user_metadata?.full_name?.split(' ')[0] || '',
        last_name: safeUser.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
        role: 'user',
        avatar_url: avatarUrl,
        is_active: true,
        last_login_at: new Date().toISOString(),
        language: 'he'
        // created_at should only be set on initial insert.
        // terms_accepted and marketing_consent are managed separately via user_consents.
      };

      let newProfile = null;

      if (existingProfile) {
        // If profile already exists (likely by trigger), perform an UPDATE.
        try {
          const response = await throttledApiFetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles?id=eq.${safeUser.id}`, {
            method: 'PATCH', // Use PATCH for update
            headers: {
              'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${session?.access_token}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation' // Return updated data
            },
            body: JSON.stringify(profileData) // Update with current data
          });
          if (!response.ok) {
            const errorText = await response.text();
            console.error('AuthContext: Error during profile PATCH:', { status: response.status, errorText });
            // console.log('AuthContext: Raw error from Supabase (PATCH profile):', errorText); // Removed debug log
            throw new Error(`Failed to update profile: ${response.status} - ${errorText}`);
          }
          newProfile = (await response.json())[0];
          localStorage.removeItem('is_new_user_registration'); // Not a new registration for this session

        } catch (patchError) {
          console.error('AuthContext: Unexpected error during profile PATCH operation:', patchError);
          throw patchError; // Re-throw to be caught by the outer catch
        }

      } else {
        // No profile found (trigger might be missing or delayed), perform initial INSERT.
        try {
          const response = await throttledApiFetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles`, {
            method: 'POST', // Use POST for insert
            headers: {
              'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${session?.access_token}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation' // Return created data
            },
            body: JSON.stringify({ ...profileData, created_at: new Date().toISOString() }) // Include created_at for new insert
          });
          if (!response.ok) {
            const errorText = await response.text();
            console.error('AuthContext: Error during profile POST:', { status: response.status, errorText });
            // console.log('AuthContext: Raw error from Supabase (POST profile):', errorText); // Removed debug log
            throw new Error(`Failed to create profile: ${response.status} - ${errorText}`);
          }
          newProfile = (await response.json())[0];
          localStorage.setItem('is_new_user_registration', 'true'); // This is a new registration by frontend

        } catch (postError) {
          console.error('AuthContext: Unexpected error during profile POST operation:', postError);
          throw postError; // Re-throw to be caught by the outer catch
        }
      }
      
      if (!newProfile) {
        throw new Error('Profile operation failed: no profile data returned.');
      }

      // Cache the new/updated profile immediately
      const cacheKey = `profile_${safeUser.id}`;
      setDataWithTimestamp(cacheKey, newProfile, 5 * 60 * 1000);

      return newProfile;
    } catch (error) {
      handleAuthError(error, 'createProfileForUser');
      localStorage.removeItem('is_new_user_registration'); // Clear flag on error
      return null;
    } finally {
      const creatingKey = `creating_profile_${safeUser.id}`;
      frontendCookieManager.removeCookie(creatingKey);
    }
  }, [session]); // Depend on session to get access_token. Note: user is passed as safeUser and is not a direct dependency of useCallback here. Adjust if needed. 

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
      const userId = user?.id; // Get user ID before clearing state
      const currentAccessToken = session?.access_token; // Capture access token before clearing session

      // Log logout activity directly before clearing session
      if (userId && currentAccessToken && user?.email && user.app_metadata?.provider) {
        const logSuccess = await logActivity(
          'User Logout',
          `Successful logout for user ${user.email || userId}`,
          { userId: userId, email: user.email, provider: user.app_metadata.provider },
          currentAccessToken,
          'info'
        );
        if (!logSuccess) {
          console.error('AuthContext: Failed to log logout activity during signOut.');
        }
      } else {
        console.error('AuthContext: User or session data missing for logging during signOut.');
      }

      // Immediate state cleanup with setTimeout to avoid setState during render
      setProfile(null);
      setUser(null);
      setSession(null);
      setAuthState(AuthState.UNAUTHENTICATED);

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
  }, [user, session]); // Added user and session to dependencies to capture latest values

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
        setSession(safeSession);
        setUser(safeUser);

        switch (event) {
          case 'SIGNED_OUT':
            // Removed direct logging here as it's handled in signOut
            
            // setTimeout(() => {
              setAuthState(AuthState.UNAUTHENTICATED);
              setProfile(null);
              setProfileLoading(false);
            // }, 0);
            // Clear timeouts
            if (profileUpdateTimeoutRef.current) {
              clearTimeout(profileUpdateTimeoutRef.current);
            }
            break;

          case 'SIGNED_IN':
          case 'INITIAL_SESSION':
            if (safeUser) {
              // setTimeout(() => {
                setAuthState(AuthState.AUTHENTICATED);
                // setProfileLoading(true);
              // }, 0);
              // Profile loading is handled by initializeAuth
              // await handleProfileOperations(safeUser, event);
              // setTimeout(() => {
              //   setProfileLoading(false);
              // }, 0);
            }
            break;

          case 'USER_UPDATED':
            if (safeUser) {
              // setTimeout(() => {
                setAuthState(AuthState.AUTHENTICATED);
              // }, 0);
            }
            break;

          default:
            // Handle other events if needed
            break;
        }

        // setTimeout(() => {
          setLoading(false);
        // }, 0);
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