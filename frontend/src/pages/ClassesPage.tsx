import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaClock, FaUserGraduate, FaArrowLeft } from 'react-icons/fa';
import { classesService } from '../lib/classes';
import { Class } from '../types/class';
import { getSimpleColorScheme } from '../utils/colorUtils';
import { useAuth } from '../contexts/AuthContext';
import type { UserProfile } from '../types/auth';

function ClassesPage() {
  const { profile: contextProfile, user, session, loading: authLoading } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localProfile, setLocalProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  
  // Refs for API call management
  const classesFetchedRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const mountCountRef = useRef(0);

  // Get the correct profile (local or context)
  const profile = localProfile || contextProfile;

  // Create a stable fetch function using useCallback
  const fetchClasses = useCallback(async () => {
    if (classesFetchedRef.current) {
      console.log('Classes fetch already in progress, skipping...');
      return;
    }

    try {
      classesFetchedRef.current = true;
      setLoading(true);
      setError(null);
      
      // Cancel any previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Create new abort controller
      abortControllerRef.current = new AbortController();
      
      console.log('Fetching classes...');
      
      // In development mode, add a longer delay to account for Strict Mode double mounting
      const isDevelopment = import.meta.env.DEV;
      const delay = isDevelopment ? 500 : 200;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      const data = await classesService.getAllClasses();
      
      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        console.log('Classes fetch was aborted');
        return;
      }
      
      setClasses(data);
      console.log('Classes fetched successfully');
      
    } catch (err) {
      console.error('Error fetching classes:', err);
      
      // Don't set error if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        console.log('Classes fetch was aborted, not setting error');
        return;
      }
      
      // Check if it's a rate limit error
      if (err instanceof Error && err.message.includes('429')) {
        setError('יותר מדי בקשות. אנא המתן מספר דקות ונסה שוב.');
      } else if (err instanceof Error && err.message.includes('Failed to fetch')) {
        setError('השרת לא זמין. אנא ודא שהשרת פועל ונסה שוב.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch classes');
      }
      
      // Reset the ref on error so user can retry
      classesFetchedRef.current = false;
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  // Load classes on mount
  useEffect(() => {
    mountCountRef.current += 1;
    console.log(`ClassesPage mounted (mount #${mountCountRef.current}), fetching classes...`);
    
    // In development mode, only fetch on the second mount (after Strict Mode cleanup)
    const isDevelopment = import.meta.env.DEV;
    if (isDevelopment && mountCountRef.current === 1) {
      console.log('Development mode: skipping first mount due to Strict Mode');
      return;
    }
    
    fetchClasses();

    // Cleanup function
    return () => {
      console.log('ClassesPage cleanup - aborting any pending requests');
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      // Don't reset classesFetchedRef on cleanup in development mode
      if (!isDevelopment) {
        classesFetchedRef.current = false;
      }
    };
  }, [fetchClasses]);

  // Load profile if not available in context
  useEffect(() => {
    if (!user || authLoading) {
      return;
    }
    
    // Use context profile if available
    if (contextProfile) {
      setLocalProfile(contextProfile);
      return;
    }
    
    // Don't load if already loading
    if (isLoadingProfile) {
      return;
    }
    
    // Load profile directly from Supabase
    const loadProfileWithFetch = async () => {
      try {
        setIsLoadingProfile(true);
        
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles?select=*&id=eq.${user.id}`, {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        const profileDataArray = await response.json();
        
        if (profileDataArray.length === 0) {
          // Create new profile if doesn't exist
          const createResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles`, {
            method: 'POST',
            headers: {
              'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${session?.access_token}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation'
            },
            body: JSON.stringify({
              id: user.id,
              email: user.email,
              first_name: '',
              last_name: '',
              role: 'user',
              created_at: new Date().toISOString(),
              is_active: true,
              terms_accepted: false,
              marketing_consent: false,
              last_login_at: new Date().toISOString(),
              language: 'he',
              has_used_trial_class: false
            })
          });
          
          if (!createResponse.ok) {
            const createErrorText = await createResponse.text();
            throw new Error(`Create failed: ${createErrorText}`);
          }
          
          const newProfile: UserProfile = {
            id: user.id,
            email: user.email || '',
            first_name: '',
            last_name: '',
            role: 'user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_active: true,
            terms_accepted: false,
            marketing_consent: false,
            last_login_at: new Date().toISOString(),
            language: 'he',
            has_used_trial_class: false
          };
          
          setLocalProfile(newProfile);
        } else {
          const profileData = profileDataArray[0];
          setLocalProfile(profileData);
        }
        
        setIsLoadingProfile(false);
      } catch (error) {
        console.error('Error loading profile:', error);
        setIsLoadingProfile(false);
      }
    };
    
    loadProfileWithFetch();
  }, [user?.id, authLoading, contextProfile, session, isLoadingProfile]);

  // Update local profile when context profile becomes available
  useEffect(() => {
    if (contextProfile && !localProfile) {
      setLocalProfile(contextProfile);
    }
  }, [contextProfile, localProfile]);

  // Helper functions
  const getClassRoute = (slug: string) => `/class/${slug}`;

  const getTrialClassStatusBadge = (classItem: Class) => {
    if (classItem.slug !== 'trial-class') return null;

    if (profile) {
      const hasUsedTrial = profile.has_used_trial_class;
      
      return (
        <div className={`${
          hasUsedTrial 
            ? 'bg-gradient-to-r from-red-500 to-red-600' 
            : 'bg-gradient-to-r from-green-500 to-green-600'
        } text-white px-5 py-1.5 text-sm font-bold shadow-2xl border-3 border-white rounded-xl transform hover:scale-110 transition-all duration-200`}>
          <div className="flex items-center gap-1">
            {!hasUsedTrial && (
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            )}
            {hasUsedTrial ? 'נוצל' : 'זמין!'}
          </div>
        </div>
      );
    }

    // Error state for non-logged in users
    return (
      <div className="bg-gradient-to-r from-gray-400 to-gray-500 text-white px-5 py-2.5 text-sm font-bold shadow-2xl border-3 border-white rounded-xl transform hover:scale-110 transition-all duration-200">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-white rounded-full"></div>
          שגיאה
        </div>
      </div>
    );
  };

  const handleRetry = () => {
    console.log('Retrying classes fetch...');
    classesFetchedRef.current = false;
    setError(null);
    fetchClasses();
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF9F6] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EC4899] mx-auto mb-4"></div>
          <p className="text-[#2B2B2B] font-agrandir-regular">טוען שיעורים...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#FDF9F6] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-agrandir-regular mb-4">שגיאה בטעינת השיעורים</p>
          <p className="text-[#2B2B2B] font-agrandir-regular">{error}</p>
          <button 
            onClick={handleRetry} 
            className="mt-4 bg-[#EC4899] text-white px-4 py-2 rounded-lg hover:bg-[#EC4899]/90 transition-colors"
          >
            נסה שוב
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF9F6] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-[#EC4899] mb-6 font-agrandir-grand">
            שיעורים
          </h1>
          <div className="w-24 h-1 bg-[#EC4899] mx-auto mb-8"></div>
          <p className="text-xl text-[#2B2B2B] max-w-3xl mx-auto font-agrandir-regular leading-relaxed">
            בסטודיו שלי תמצאי שיעורי ריקוד עקב לקבוצת מתחילות. <br/>
            הצטרפי אלי לחוויה מקצועית ומהנה של ריקוד על עקבים.
          </p>
        </div>

        {/* Classes Grid */}
        {classes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#2B2B2B] font-agrandir-regular text-lg">אין שיעורים זמינים כרגע</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {[...classes].reverse().map((classItem) => {
              const colorScheme = getSimpleColorScheme(classItem);
              const route = getClassRoute(classItem.slug);
              const isTrialClass = classItem.slug === 'trial-class';
              const hasUsedTrial = isTrialClass && profile?.has_used_trial_class;
              
              return (
                <div 
                  key={classItem.id} 
                  className={`bg-white rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-300 h-full lg:flex lg:flex-col relative ${
                    hasUsedTrial ? 'lg:opacity-50 opacity-40 grayscale' : ''
                  }`}
                >
                  {/* Desktop Image */}
                  <div className="relative h-40 lg:h-48 hidden lg:block">
                    <img
                      src={classItem.image_url || '/carousel/image1.png'}
                      alt={classItem.name}
                      className="w-full h-full object-cover rounded-t-2xl"
                    />
                    <div className="absolute bottom-3 right-3">
                      <span className={`${colorScheme.bgColor} text-white px-3 py-1 rounded-full text-xs font-medium`}>
                        {classItem.price} ש"ח
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 lg:p-6 lg:flex lg:flex-col lg:h-full lg:pt-6 pt-4">
                    <h3 className={`text-lg lg:text-xl font-bold ${colorScheme.textColor} mb-3 font-agrandir-grand`}>
                      {classItem.name}
                    </h3>
                    
                    <div className="h-16 lg:h-20 mb-4">
                      <p className="text-[#2B2B2B] font-agrandir-regular leading-relaxed text-xs lg:text-sm line-clamp-3">
                        {classItem.description}
                      </p>
                    </div>
                    
                    {/* Class Details */}
                    <div className="space-y-2 mb-6 h-12 lg:h-14">
                      {classItem.duration && (
                        <div className={`flex items-center ${colorScheme.textColor} text-xs lg:text-sm`}>
                          <FaClock className="w-4 h-4 ml-2" />
                          <span className="font-agrandir-regular">{classItem.duration} דקות</span>
                        </div>
                      )}
                      {classItem.level && (
                        <div className={`flex items-center ${colorScheme.textColor} text-xs lg:text-sm`}>
                          <FaUserGraduate className="w-4 h-4 ml-2" />
                          <span className="font-agrandir-regular">רמה: {classItem.level}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Action Button */}
                    <div className="lg:mt-auto">
                      {hasUsedTrial ? (
                        <div className="inline-flex items-center justify-center w-full bg-gray-500 text-white px-3 lg:px-4 py-2 rounded-xl font-medium text-xs lg:text-sm cursor-not-allowed opacity-90">
                          נוצל
                          <FaArrowLeft className="w-2.5 h-2.5 lg:w-3 lg:h-3 mr-2" />
                        </div>
                      ) : (
                        <Link
                          to={route}
                          className={`inline-flex items-center justify-center w-full ${colorScheme.bgColor} ${colorScheme.hoverColor} text-white px-3 lg:px-4 py-2 rounded-xl transition-colors duration-300 font-medium text-xs lg:text-sm`}
                        >
                          הרשמה
                          <FaArrowLeft className="w-2.5 h-2.5 lg:w-3 lg:h-3 mr-2" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Login Prompt for Non-Authenticated Users */}
        {!user && (
          <div className="mt-20 bg-gradient-to-r from-blue-400 to-blue-500 rounded-2xl p-12 text-center shadow-xl">
            <h2 className="text-3xl font-bold text-white mb-6 font-agrandir-grand">
              התחברי כדי לבדוק סטטוס שיעור ניסיון
            </h2>
            <p className="text-white/90 text-xl mb-8 font-agrandir-regular max-w-2xl mx-auto">
              התחברי למערכת כדי לבדוק אם כבר השתמשת בשיעור ניסיון ולקבל המלצות מותאמות אישית
            </p>
            <Link
              to="/profile"
              className="inline-flex items-center justify-center bg-white text-blue-600 px-8 py-4 rounded-xl hover:bg-white/90 transition-colors duration-300 font-medium text-lg"
            >
              התחברי עכשיו
              <FaArrowLeft className="w-5 h-5 mr-2" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default ClassesPage; 