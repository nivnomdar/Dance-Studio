import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { UserProfile } from '../types/auth';

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

  const loadProfileWithFetch = async () => {
    if (!user || !session?.access_token) {
      setIsLoadingProfile(false);
      return;
    }

    try {
      setIsLoadingProfile(true);
      setProfileError(null);

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
      
      if (profileDataArray.length === 0) {
        setProfileError('פרופיל לא נמצא');
        setLocalProfile(null);
      } else {
        const profileData = profileDataArray[0];
        setLocalProfile(profileData);
        setProfileError(null);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setProfileError(`שגיאה בטעינת הפרופיל: ${error instanceof Error ? error.message : 'שגיאה לא ידועה'}`);
      setLocalProfile(null);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  useEffect(() => {
    if (!user || authLoading) {
      if (!user && !authLoading) {
        setIsLoadingProfile(false);
      }
      return;
    }
    
    loadProfileWithFetch();
  }, [user?.id, authLoading, session]);

  return {
    profile: localProfile,
    isLoading: isLoadingProfile,
    error: profileError,
    refetch: loadProfileWithFetch
  };
} 