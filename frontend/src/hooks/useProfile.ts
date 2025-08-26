import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { UserProfile } from '../types/auth';
import { 
  setDataWithTimestamp, 
  getDataWithTimestamp, 
  hasCookie 
} from '../utils/cookieManager';

interface UseProfileReturn {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useProfile(): UseProfileReturn {
  const { user, session, loading: authLoading } = useAuth();
  const [localProfile, setLocalProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  const loadProfileWithFetch = useCallback(async () => {
    if (!user || !session?.access_token) {
      return;
    }

    try {
      // Check if we're already creating a profile to prevent race condition
      const creatingKey = `creating_profile_${user.id}`;
      if (hasCookie(creatingKey)) {
        // Another process is creating the profile, wait a bit and retry
        setTimeout(() => {
          loadProfileWithFetch();
        }, 500);
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles?select=*&id=eq.${user.id}`, {
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const profileDataArray = await response.json();
      
      if (profileDataArray && profileDataArray.length > 0) {
        const profileData = profileDataArray[0];
        // Cache the profile
        const cacheKey = `profile_${user.id}`;
        setDataWithTimestamp(cacheKey, profileData, 5 * 60 * 1000);
        
        setLocalProfile(profileData);
        setProfileError(null);
      } else {
        // Profile doesn't exist, try to create it
        await createProfile();
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setProfileError(`שגיאה בטעינת הפרופיל: ${error instanceof Error ? error.message : 'שגיאה לא ידועה'}`);
      setLocalProfile(null);
    } finally {
      setIsLoadingProfile(false);
    }
  }, [user, session]);

  const createProfile = useCallback(async () => {
    if (!user || !session?.access_token) return;

    try {
      // Set flag to prevent other processes from creating profile
      const creatingKey = `creating_profile_${user.id}`;
      setDataWithTimestamp(creatingKey, 'true', 5 * 60 * 1000);

      // Extract name from user metadata
      const fullName = user.user_metadata?.full_name || user.user_metadata?.name || '';
      const nameParts = fullName.split(' ').filter(Boolean);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const newProfile = {
        id: user.id,
        email: user.email || '',
        first_name: firstName,
        last_name: lastName,
        role: 'user',
        avatar_url: user.user_metadata?.avatar_url || '',
        created_at: new Date().toISOString(),
        is_active: true,
        terms_accepted: true,
        marketing_consent: true,
        last_login_at: new Date().toISOString(),
        language: 'he',
        has_used_trial_class: false
      };

      try {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles`, {
          method: 'POST',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify(newProfile)
        });

        if (response.ok) {
          // Profile created/updated successfully, cache it immediately
          const cacheKey = `profile_${user.id}`;
          setDataWithTimestamp(cacheKey, newProfile, 5 * 60 * 1000);
          
          setLocalProfile(newProfile as UserProfile);
          setProfileError(null);
        } else {
          const errorText = await response.text();
          throw new Error(`Failed to create profile: ${response.status} - ${errorText}`);
        }
      } catch (error) {
        // If upsert fails, try to load existing profile
        // Note: Cookie will be cleared by the finally block
        
        // Final attempt to load existing profile
        try {
          const finalResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles?select=*&id=eq.${user.id}`, {
            headers: {
              'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (finalResponse.ok) {
            const profileDataArray = await finalResponse.json();
            if (profileDataArray.length > 0) {
              const profileData = profileDataArray[0];
              // Cache the profile
              const cacheKey = `profile_${user.id}`;
              setDataWithTimestamp(cacheKey, profileData, 5 * 60 * 1000);
              
              setLocalProfile(profileData);
              setProfileError(null);
            } else {
              setProfileError('לא ניתן לטעון את הפרופיל');
            }
          } else {
            setProfileError('שגיאה בטעינת הפרופיל');
          }
        } catch (finalError) {
          console.error('Final error loading profile:', finalError);
          setProfileError('שגיאה בטעינת הפרופיל');
        }
      } finally {
        // Always remove the flag
        // Note: Cookie will be cleared automatically when expired
      }
    } catch (error) {
      console.error('Error in createProfile:', error);
      setProfileError(`שגיאה ביצירת הפרופיל: ${error instanceof Error ? error.message : 'שגיאה לא ידועה'}`);
    }
  }, [user, session]);

  useEffect(() => {
    if (!user || authLoading) {
      if (!user && !authLoading) {
        setIsLoadingProfile(false);
      }
      return;
    }
    
    // If we already have a profile for this user, don't fetch again
    if (localProfile && localProfile.id === user.id) {
      setIsLoadingProfile(false);
      return;
    }

    // Create temporary profile immediately for better UX
    const tempProfile: UserProfile = {
      id: user.id,
      email: user.email || '',
      first_name: user.user_metadata?.full_name?.split(' ')[0] || '',
      last_name: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
      role: 'user',
      avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true,
      terms_accepted: true,
      marketing_consent: true,
      last_login_at: new Date().toISOString(),
      language: 'he',
      has_used_trial_class: false,
      phone_number: '',
      address: '',
      city: '',
      postal_code: ''
    };

    // Set temporary profile immediately and set loading to false
    setLocalProfile(tempProfile);
    setIsLoadingProfile(false);
    
    // Load real profile in background
    loadProfileWithFetch();
  }, [user?.id, authLoading, session, loadProfileWithFetch]);

  return {
    profile: localProfile,
    isLoading: isLoadingProfile,
    error: profileError,
    refetch: loadProfileWithFetch
  };
} 