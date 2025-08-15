import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaClock, FaUserGraduate, FaArrowLeft, FaRedo } from 'react-icons/fa';
import { classesService } from '../lib/classes';
import { Class } from '../types/class';
import { getSimpleColorScheme } from '../utils/colorUtils';
import { useAuth } from '../contexts/AuthContext';
import type { UserProfile } from '../types/auth';
import { SkeletonBox, SkeletonText, SkeletonIcon } from '../components/skeleton/SkeletonComponents';
import { TIMEOUTS } from '../utils/constants';
import { RefreshButton } from '../admin';

// Cache key for sessionStorage
const CLASSES_CACHE_KEY = 'classes_cache';
const CLASSES_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Class Card Skeleton Components
const ClassCardImageSkeleton = () => (
  <div className="relative h-32 sm:h-40 lg:h-48 hidden lg:block">
    <SkeletonBox className="w-full h-full rounded-t-2xl" />
    <div className="absolute bottom-3 right-3">
      <SkeletonBox className="w-16 h-6 rounded-full" />
    </div>
  </div>
);

const ClassCardContentSkeleton = () => (
  <div className="p-3 sm:p-4 lg:p-6 lg:flex lg:flex-col lg:h-full lg:pt-6 pt-3">
    {/* Title */}
    <SkeletonBox className="h-5 sm:h-6 mb-2 sm:mb-3" />
    
    {/* Description */}
    <div className="h-12 sm:h-16 lg:h-20 mb-3 sm:mb-4">
      <SkeletonText lines={3} />
    </div>
    
    {/* Details */}
    <div className="space-y-2 mb-4 sm:mb-6 h-10 sm:h-12 lg:h-14">
      <div className="flex items-center">
        <SkeletonIcon className="ml-2" />
        <SkeletonBox className="h-3 w-20" />
      </div>
      <div className="flex items-center">
        <SkeletonIcon className="ml-2" />
        <SkeletonBox className="h-3 w-16" />
      </div>
    </div>
    
    {/* Button */}
    <div className="lg:mt-auto">
      <SkeletonBox className="w-full h-7 sm:h-8 rounded-xl" />
    </div>
  </div>
);

const ClassCardSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-xl h-full lg:flex lg:flex-col">
    <ClassCardImageSkeleton />
    <ClassCardContentSkeleton />
  </div>
);

const ClassesSkeletonGrid = () => (
  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
    {Array.from({ length: 8 }).map((_, index) => (
      <ClassCardSkeleton key={index} />
    ))}
  </div>
);

function ClassesPage() {
  const { profile: contextProfile, user, session, loading: authLoading } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localProfile, setLocalProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  // Refs to prevent duplicate calls
  const hasFetchedRef = useRef(false);
  const isFetchingRef = useRef(false);

  // Get the correct profile (local or context)
  const profile = localProfile || contextProfile;

  // Helper function to get cached classes
  const getCachedClasses = (): Class[] | null => {
    try {
      const cached = sessionStorage.getItem(CLASSES_CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CLASSES_CACHE_DURATION) {
          // Filter cached data to show only active classes
          const activeCachedClasses = data.filter((cls: Class) => cls.is_active === true);
          return activeCachedClasses;
        }
      }
    } catch (error) {
      // Ignore cache errors
    }
    return null;
  };

  // Helper function to cache classes
  const cacheClasses = (data: Class[]) => {
    try {
      sessionStorage.setItem(CLASSES_CACHE_KEY, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (error) {
      // Ignore cache errors
    }
  };

  // Create a stable fetch function using useCallback
  const fetchClasses = useCallback(async (forceRefresh = false, retryAttempt = 0) => {
    // Prevent multiple simultaneous calls
    if (isFetchingRef.current) {
      return;
    }

    // Check cache first (unless forcing refresh)
    if (!forceRefresh && !hasFetchedRef.current) {
      const cachedClasses = getCachedClasses();
      if (cachedClasses) {
        setClasses(cachedClasses);
        setLoading(false);
        hasFetchedRef.current = true;
        return;
      }
    }

    try {
      isFetchingRef.current = true;
      setLoading(true);
      setError(null);
      
      const data = await classesService.getAllClasses();
      
      // Filter to show only active classes
      const activeClasses = data.filter(cls => cls.is_active === true);
      
      setClasses(activeClasses);
      cacheClasses(activeClasses);
      hasFetchedRef.current = true;
      setRetryCount(0);
      
    } catch (err: any) {

      
      // Handle rate limiting with exponential backoff
      if (err instanceof Error && (err.message.includes('429') || err.message.includes('Too Many Requests'))) {
        if (retryAttempt < 3) {
          const delay = Math.pow(2, retryAttempt + 1) * 1000; // 2s, 4s, 8s
          setError(`יותר מדי בקשות. מנסה שוב בעוד ${delay/1000} שניות... (ניסיון ${retryAttempt + 1}/4)`);
          
          setTimeout(() => {
            fetchClasses(false, retryAttempt + 1);
          }, delay);
          return;
        } else {
          setError('יותר מדי בקשות. אנא המתן מספר דקות ונסה שוב.');
          setRetryCount(retryAttempt);
        }
      } else if (err instanceof Error && err.message.includes('Failed to fetch')) {
        setError('השרת לא זמין. אנא ודא שהשרת פועל ונסה שוב.');
      } else if (err instanceof Error && err.message.includes('Request timeout')) {
        setError('הבקשה ארכה זמן רב מדי. אנא נסי שוב.');
      } else {
        setError(err instanceof Error ? err.message : 'שגיאה בטעינת השיעורים');
      }
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  // Load classes on mount - only once
  useEffect(() => {
    if (!hasFetchedRef.current) {
      fetchClasses();
    }
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
          const fullName = user.user_metadata?.full_name || user.user_metadata?.name || '';
          const nameParts = fullName.split(' ').filter(Boolean);
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';

          const createResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles`, {
            method: 'POST',
            headers: {
              'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${session?.access_token}`,
              'Content-Type': 'application/json',
              'Prefer': 'resolution=merge-duplicates'
            },
            body: JSON.stringify({
              id: user.id,
              email: user.email,
              first_name: firstName,
              last_name: lastName,
              role: 'user',
              avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
              created_at: new Date().toISOString(),
              is_active: true,
              terms_accepted: true,
              marketing_consent: true,
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
            first_name: firstName,
            last_name: lastName,
            role: 'user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_active: true,
            terms_accepted: true,
            marketing_consent: true,
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

        setIsLoadingProfile(false);
      }
    };
    
    loadProfileWithFetch();
  }, [user?.id, authLoading, contextProfile, session, isLoadingProfile]);

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
    hasFetchedRef.current = false;
    setError(null);
    fetchClasses(true); // Force refresh
  };

  const handleRefresh = () => {
    // Clear cache and force refresh
    try {
      sessionStorage.removeItem(CLASSES_CACHE_KEY);
    } catch (error) {
      // Ignore cache errors
    }
    hasFetchedRef.current = false;
    fetchClasses(true); // Force refresh
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF9F6] py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#4B2E83] mb-4 sm:mb-6 font-agrandir-grand">
              שיעורים
            </h1>
            <div className="w-16 sm:w-20 lg:w-24 h-1 bg-[#4B2E83] mx-auto mb-6 sm:mb-8"></div>
            <p className="text-base sm:text-lg lg:text-xl text-[#2B2B2B] max-w-3xl mx-auto font-agrandir-regular leading-relaxed px-4">
              בסטודיו שלי תמצאי שיעורי ריקוד עקב לקבוצת מתחילות. <br className="hidden sm:block"/>
              הצטרפי אלי לחוויה מקצועית ומהנה של ריקוד על עקבים.
            </p>
          </div>

          {/* Skeleton Loading */}
          <ClassesSkeletonGrid />
        </div>
      </div>
    );
  }

  // Error state with improved UI
  if (error) {
    return (
      <div className="min-h-screen bg-[#FDF9F6] flex items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 sm:p-8 shadow-lg">
            <div className="text-red-500 text-4xl sm:text-6xl mb-4">⚠️</div>
            <h1 className="text-xl sm:text-2xl font-bold text-red-600 mb-4 font-agrandir-grand">
              שגיאה בטעינת השיעורים
            </h1>
            <p className="text-red-700 mb-6 font-agrandir-regular text-sm sm:text-base">
              {error}
            </p>
            <div className="space-y-3">
              <button 
                onClick={handleRetry} 
                className="w-full bg-red-500 text-white px-4 sm:px-6 py-3 rounded-xl hover:bg-red-600 transition-colors duration-200 font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <FaRedo className="w-4 h-4" />
                נסה שוב
              </button>
              {retryCount > 0 && (
                <RefreshButton
                  onClick={handleRefresh}
                  isFetching={false}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF9F6] py-8 sm:py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#4B2E83] mb-4 sm:mb-6 font-agrandir-grand">
            שיעורים
          </h1>
          <div className="w-16 sm:w-20 lg:w-24 h-1 bg-[#4B2E83] mx-auto mb-6 sm:mb-8"></div>
          <p className="text-base sm:text-lg lg:text-xl text-[#2B2B2B] max-w-3xl mx-auto font-agrandir-regular leading-relaxed px-4">
            בסטודיו שלי תמצאי שיעורי ריקוד עקב לקבוצת מתחילות. <br className="hidden sm:block"/>
            הצטרפי אלי לחוויה מקצועית ומהנה של ריקוד על עקבים.
          </p>
        </div>

        {/* Classes Grid */}
        {classes.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <p className="text-[#2B2B2B] font-agrandir-regular text-base sm:text-lg">אין שיעורים זמינים כרגע</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
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
                  <div className="relative h-32 sm:h-40 lg:h-48 hidden lg:block">
                    <img
                      src={classItem.image_url || '/carousel/image1.png'}
                      alt={classItem.name}
                      className="w-full h-full object-cover rounded-t-2xl"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5OTk5IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPuaJp+ihjOaTjeS9nDwvdGV4dD4KPC9zdmc+';
                      }}
                    />
                    <div className="absolute bottom-3 right-3">
                      <span className={`${colorScheme.bgColor} text-white px-3 py-1 rounded-full text-xs font-medium`}>
                        {classItem.price} ש"ח
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-3 sm:p-4 lg:p-6 lg:flex lg:flex-col lg:h-full lg:pt-6 pt-3">
                    <h3 className={`text-base sm:text-lg lg:text-xl font-bold ${colorScheme.textColor} mb-2 sm:mb-3 font-agrandir-grand`}>
                      {classItem.name}
                    </h3>
                    
                    <div className="h-12 sm:h-16 lg:h-20 mb-3 sm:mb-4">
                      <p className="text-[#2B2B2B] font-agrandir-regular leading-relaxed text-xs sm:text-sm lg:text-sm line-clamp-3">
                        {classItem.description}
                      </p>
                    </div>
                    
                    {/* Class Details */}
                    <div className="space-y-2 mb-4 sm:mb-6 h-10 sm:h-12 lg:h-14">
                      {classItem.duration && (
                        <div className={`flex items-center ${colorScheme.textColor} text-xs sm:text-sm`}>
                          <FaClock className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
                          <span className="font-agrandir-regular">{classItem.duration} דקות</span>
                        </div>
                      )}
                      {classItem.level && (
                        <div className={`flex items-center ${colorScheme.textColor} text-xs sm:text-sm`}>
                          <FaUserGraduate className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
                          <span className="font-agrandir-regular">רמה: {classItem.level}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Action Button */}
                    <div className="lg:mt-auto">
                      {hasUsedTrial ? (
                        <div className="inline-flex items-center justify-center w-full bg-gray-500 text-white px-3 lg:px-4 py-2 rounded-xl font-medium text-xs sm:text-sm cursor-not-allowed opacity-90">
                          נוצל
                          <FaArrowLeft className="w-2.5 h-2.5 lg:w-3 lg:h-3 mr-2" />
                        </div>
                      ) : (
                        <Link
                          to={route}
                          className={`inline-flex items-center justify-center w-full ${colorScheme.bgColor} ${colorScheme.hoverColor} text-white px-3 lg:px-4 py-2 rounded-xl transition-colors duration-300 font-medium text-xs sm:text-sm`}
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


      </div>
    </div>
  );
}

export default ClassesPage; 