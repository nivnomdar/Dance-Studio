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
  clearAllCookies 
} from '../utils/cookieManager';
import { TermsCookieManager } from '../utils/termsCookieManager';

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
  const lastProfileUpdateRef = useRef<number>(0);
  const profileUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Function refs to prevent re-renders
  const loadProfileSafelyRef = useRef<((userId: string) => Promise<UserProfile | null>) | null>(null);
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

      // Check if profile already exists to avoid overwriting existing values
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('terms_accepted, marketing_consent')
        .eq('id', safeUser.id)
        .maybeSingle();

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
        // Preserve existing values if they exist, otherwise use defaults
        terms_accepted: existingProfile?.terms_accepted ?? false,
        marketing_consent: existingProfile?.marketing_consent ?? false,
        last_login_at: new Date().toISOString(),
        language: 'he'
      };

      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .upsert([profileData], { 
          onConflict: 'id',
          ignoreDuplicates: false 
        })
        .select()
        .maybeSingle();

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
      clearAllCookies(); // זה ימחק את כל ה-cookies כולל הדגל
    }
  }, []);

  // Store function in ref immediately
  createProfileForUserRef.current = createProfileForUser;

  // Profile loading function
  const loadProfileSafely = useCallback(async (userId: string): Promise<UserProfile | null> => {
    if (!userId) {
      console.error('Cannot load profile: user ID is missing');
      return null;
    }

    try {
      // Check cache first
      const cacheKey = `profile_${userId}`;
      const cachedProfile = getDataWithTimestamp<UserProfile>(cacheKey, 5 * 60 * 1000);
      if (cachedProfile) {
        return cachedProfile;
      }

      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

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
  }, []);

  // Store function in ref immediately
  loadProfileSafelyRef.current = loadProfileSafely;

  // Profile update function
  const updateProfileLoginTime = useCallback(async (userId: string): Promise<void> => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) {
        console.error('Error updating last login time:', error);
      }
    } catch (error) {
      console.error('Error in updateProfileLoginTime:', error);
    }
  }, []);

  // Store function in ref immediately
  updateProfileLoginTimeRef.current = updateProfileLoginTime;

  // Handle profile operations with rate limiting
  const handleProfileOperations = useCallback(async (safeUser: SafeUser, _event: AuthEvent) => {
    if (!safeUser?.id) {
      console.error('Cannot handle profile operations: user ID is missing');
      return;
    }

    // Create a temporary profile immediately for better UX
    const tempProfile: UserProfile = {
      id: safeUser.id,
      email: safeUser.email || '',
      first_name: safeUser.user_metadata?.full_name?.split(' ')[0] || '',
      last_name: safeUser.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
      role: 'user',
      avatar_url: safeUser.user_metadata?.avatar_url || safeUser.user_metadata?.picture || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true,
      // Don't set hardcoded values for consent fields - they will be loaded from database
      terms_accepted: false, // Will be updated when real profile loads
      marketing_consent: false, // Will be updated when real profile loads
      last_login_at: new Date().toISOString(),
      language: 'he',
      has_used_trial_class: false,
      phone_number: '',
      address: '',
      city: '',
      postal_code: ''
    };

    // Set temporary profile immediately
    setProfile(tempProfile);

    // Rate limiting check
    const now = Date.now();
    if (now - lastProfileUpdateRef.current < 15000) {
      return;
    }
    lastProfileUpdateRef.current = now;

    // Clear existing timeout
    if (profileUpdateTimeoutRef.current) {
      clearTimeout(profileUpdateTimeoutRef.current);
    }

    // Delay profile operations to prevent rate limiting
    profileUpdateTimeoutRef.current = setTimeout(async () => {
      try {
        // Test connection first
        const { error: testError } = await supabase
          .from('profiles')
          .select('count')
          .limit(1);

        if (testError) {
          console.error('Connection test failed:', testError);
          return;
        }

        // Load or create profile in background
        const profileData = await loadProfileSafelyRef.current?.(safeUser.id);
        if (profileData) {
          setProfile(profileData);
          
          // Update terms cookie if terms are accepted
          if (profileData.terms_accepted) {
            TermsCookieManager.setTermsAccepted(profileData.id);
          }
          
          // Cache the profile
          const cacheKey = `profile_${safeUser.id}`;
          setDataWithTimestamp(cacheKey, profileData, 5 * 60 * 1000);
        }

        // Update last login time
        await updateProfileLoginTimeRef.current?.(safeUser.id);
      } catch (error) {
        console.error('Error in handleProfileOperations:', error);
      }
    }, 1000);
  }, []);

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
        // Load profile
        const profileData = await loadProfileSafelyRef.current?.(safeUser.id);
        if (profileData) {
          // Update terms cookie if terms are accepted
          if (profileData.terms_accepted) {
            TermsCookieManager.setTermsAccepted(profileData.id);
          }
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
        Object.keys(localStorage).forEach(key => {
          if (key.includes('supabase') || key.includes('auth') || key.includes('avigail')) {
            localStorage.removeItem(key);
          }
        });
        clearAllCookies();
        
        // Clear terms cookie
        TermsCookieManager.clearTermsCookie();
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
  const loadProfile = useCallback(async () => {
    if (!user?.id) {
      console.error('Cannot load profile: no authenticated user');
      return;
    }

    setProfileLoading(true);
    try {
      const profileData = await loadProfileSafelyRef.current?.(user.id);
      if (profileData) {
        // Update terms cookie if terms are accepted
        if (profileData.terms_accepted) {
          TermsCookieManager.setTermsAccepted(profileData.id);
        }
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
                setProfileLoading(true);
              }, 0);
              await handleProfileOperations(safeUser, event);
              setTimeout(() => {
                setProfileLoading(false);
              }, 0);
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
  }, [handleProfileOperations]);

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