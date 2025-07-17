import { createContext, useContext, useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { 
  AuthContextType, 
  UserProfile, 
  SafeUser, 
  SafeSession, 
  SafeUserMetadata,
  AuthState,
  AuthEvent 
} from '../types/auth';
import {
  createSafeUser,
  createSafeSession,
  getSafeUserMetadata,
  getSafeFullName,
  getSafeAvatarUrl,
  getSafeEmail,
  validateUserForOperation,
  handleAuthError
} from '../utils/authUtils';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Utility functions are now imported from authUtils

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // console.log('AuthProvider render at:', new Date().toISOString(), 'render count:', Math.random()); // Debug log
  
  const [user, setUser] = useState<SafeUser | null>(null);
  const [session, setSession] = useState<SafeSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [authState, setAuthState] = useState<AuthState>(AuthState.LOADING);
  const lastProfileUpdateRef = useRef<number>(0);
  const profileUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Store functions in refs to prevent re-renders
  const loadProfileSafelyRef = useRef<((userId: string) => Promise<UserProfile | null>) | null>(null);
  const createProfileForUserRef = useRef<((safeUser: SafeUser) => Promise<UserProfile | null>) | null>(null);
  const updateProfileLoginTimeRef = useRef<((userId: string) => Promise<void>) | null>(null);

  // Computed properties
  const isAuthenticated = Boolean(user && session);
  const isAdmin = profile?.role === 'admin';
  
  // console.log('Computed properties at:', new Date().toISOString(), { isAuthenticated, isAdmin, user: user?.id, session: !!session, profile: profile?.id });

  // Debug: Track state changes
  useEffect(() => {
    // console.log('Auth state changed at:', new Date().toISOString(), { 
    //   user: user?.id, 
    //   session: !!session, 
    //   profile: profile?.id,
    //   authState 
    // });
  }, [user?.id, session, profile?.id, authState]);

  // Safe profile creation function
  const createProfileForUser = useCallback(async (safeUser: SafeUser): Promise<UserProfile | null> => {
    // console.log('createProfileForUser function called at:', new Date().toISOString(), 'for user:', safeUser?.id); // Debug log
    if (!validateUserForOperation(safeUser, 'create profile')) {
      return null;
    }

    try {
      const fullName = getSafeFullName(safeUser);
      const nameParts = fullName.split(' ').filter(Boolean);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      const email = getSafeEmail(safeUser);
      const avatarUrl = getSafeAvatarUrl(safeUser);

      if (!email) {
        console.error('Cannot create profile: user email is missing');
        return null;
      }

      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert([
          {
            id: safeUser.id,
            email,
            first_name: firstName,
            last_name: lastName,
            role: 'user',
            avatar_url: avatarUrl,
            created_at: new Date().toISOString(),
            is_active: true,
            terms_accepted: false,
            marketing_consent: false,
            last_login_at: new Date().toISOString(),
            language: 'he',
            has_used_trial_class: false
          }
        ])
        .select()
        .single();

      if (createError) {
        handleAuthError(createError, 'create profile');
        return null;
      }

      return newProfile;
    } catch (error) {
      handleAuthError(error, 'createProfileForUser');
      return null;
    }
  }, []);

  // Store function in ref immediately
  createProfileForUserRef.current = createProfileForUser;

  // Safe profile loading function
  const loadProfileSafely = useCallback(async (userId: string): Promise<UserProfile | null> => {
    // console.log('loadProfileSafely function called at:', new Date().toISOString(), 'for user:', userId); // Debug log
    if (!userId) {
      console.error('Cannot load profile: user ID is missing');
      return null;
    }

    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        
        // If profile doesn't exist, create it
        if (error.code === 'PGRST116') {
          // Get current user from state instead of dependency
          const currentUser = user;
          if (currentUser && createProfileForUserRef.current) {
            return await createProfileForUserRef.current(currentUser);
          }
        }
        return null;
      }

      return profileData;
    } catch (error) {
      console.error('Error in loadProfileSafely at:', new Date().toISOString(), error);
      return null;
    }
  }, []); // Remove dependencies to prevent infinite re-renders

  // Store function in ref immediately
  loadProfileSafelyRef.current = loadProfileSafely;

  // Safe profile update function
  const updateProfileLoginTime = useCallback(async (userId: string): Promise<void> => {
    // console.log('updateProfileLoginTime function called at:', new Date().toISOString(), 'for user:', userId); // Debug log
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) {
        console.error('Error updating last login at:', new Date().toISOString(), error);
      }
    } catch (error) {
      console.error('Error in updateProfileLoginTime at:', new Date().toISOString(), error);
    }
  }, []); // No dependencies needed

  // Store function in ref immediately
  updateProfileLoginTimeRef.current = updateProfileLoginTime;

  // Update all refs when functions are created - REMOVED TO PREVENT RE-RENDERS
  // useEffect(() => {
  //   console.log('Updating all function refs at:', new Date().toISOString()); // Debug log
  //   createProfileForUserRef.current = createProfileForUser;
  //   loadProfileSafelyRef.current = loadProfileSafely;
  //   updateProfileLoginTimeRef.current = updateProfileLoginTime;
  // }, [createProfileForUser, loadProfileSafely, updateProfileLoginTime]);

  // Handle profile operations with rate limiting
  const handleProfileOperations = useCallback(async (safeUser: SafeUser, event: AuthEvent) => {
    // console.log('handleProfileOperations function called at:', new Date().toISOString(), 'for user:', safeUser?.id, 'event:', event); // Debug log
    if (!safeUser?.id) {
      console.error('Cannot handle profile operations: user ID is missing');
      return;
    }

    // Rate limiting check
    const now = Date.now();
    if (now - lastProfileUpdateRef.current < 10000) {
      // console.log('Skipping profile update - too recent at:', new Date().toISOString());
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

        // Load or create profile
        const existingProfile = await loadProfileSafelyRef.current?.(safeUser.id);

        if (!existingProfile) {
          // Create new profile
          const newProfile = await createProfileForUserRef.current?.(safeUser);
          if (newProfile) {
            setProfile(newProfile);
          }
        } else {
          // Update existing profile login time
          await updateProfileLoginTimeRef.current?.(safeUser.id);
          setProfile(existingProfile);
        }
      } catch (error) {
        console.error('Error handling profile operations:', error);
      }
    }, 5000);
  }, []); // Remove dependencies to prevent infinite re-renders

  // Initialize auth state
  useEffect(() => {
    // console.log('Initializing auth at:', new Date().toISOString()); // Debug log
    const initializeAuth = async () => {
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
          setProfile(profileData || null);
        } else {
          setAuthState(AuthState.UNAUTHENTICATED);
        }
        // console.log('Auth initialization completed at:', new Date().toISOString()); // Debug log
      } catch (error) {
        console.error('Error initializing auth:', error);
        setAuthState(AuthState.ERROR);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
    
    return () => {
      // console.log('Cleaning up auth initialization at:', new Date().toISOString()); // Debug log
    };
  }, []); // Only run once on mount

  // Handle auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthEvent, session: Session | null) => {
        // console.log('Auth state change event at:', new Date().toISOString(), event, session?.user?.email);
        
        const safeSession = createSafeSession(session);
        const safeUser = safeSession?.user || null;

        setSession(safeSession);
        setUser(safeUser);
        
        // console.log('Setting auth state at:', new Date().toISOString(), { event, hasUser: !!safeUser, hasSession: !!safeSession });

        switch (event) {
          case 'SIGNED_OUT':
            setAuthState(AuthState.UNAUTHENTICATED);
            setProfile(null);
            setProfileLoading(false);
            // Clear timeouts
            if (profileUpdateTimeoutRef.current) {
              clearTimeout(profileUpdateTimeoutRef.current);
            }
            break;

          case 'SIGNED_IN':
          case 'INITIAL_SESSION':
            if (safeUser) {
              setAuthState(AuthState.AUTHENTICATED);
              setProfileLoading(true);
              await handleProfileOperations(safeUser, event);
              setProfileLoading(false);
            }
            break;

          case 'USER_UPDATED':
            if (safeUser) {
              setAuthState(AuthState.AUTHENTICATED);
            }
            break;

          default:
            // Handle other events if needed
            break;
        }

        setLoading(false);
        // console.log('Auth state change handler completed at:', new Date().toISOString()); // Debug log
      }
    );

    return () => {
      // console.log('Cleaning up auth state change subscription at:', new Date().toISOString()); // Debug log
      subscription.unsubscribe();
      if (profileUpdateTimeoutRef.current) {
        clearTimeout(profileUpdateTimeoutRef.current);
      }
    };
  }, []); // Only run once on mount

  // Safe sign out function
  const signOut = useCallback(async () => {
    // console.log('signOut function called at:', new Date().toISOString()); // Debug log
    try {
      // Immediate state cleanup
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
        Object.keys(localStorage).forEach(key => {
          if (key.includes('supabase') || key.includes('auth') || key.includes('avigail')) {
            localStorage.removeItem(key);
          }
        });
        sessionStorage.clear();
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

  // Safe profile loading function
  const loadProfile = useCallback(async () => {
    // console.log('loadProfile function called at:', new Date().toISOString()); // Debug log
    if (!user?.id) {
      console.error('Cannot load profile: no authenticated user');
      return;
    }

    setProfileLoading(true);
    try {
      const profileData = await loadProfileSafelyRef.current?.(user.id);
      setProfile(profileData || null);
    } catch (error) {
      console.error('Error in loadProfile:', error);
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  }, [user]); // Only depend on user, not loadProfileSafely

  const value: AuthContextType = useMemo(() => {
    // console.log('Creating new auth context value at:', new Date().toISOString(), 'with dependencies:', {
    //   user: user?.id,
    //   session: !!session,
    //   loading,
    //   profile: profile?.id,
    //   profileLoading,
    //   isAuthenticated,
    //   isAdmin,
    //   loadProfileFunction: !!loadProfile,
    //   signOutFunction: !!signOut
    // });
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
  // console.log('useAuth hook called at:', new Date().toISOString()); // Debug log
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 