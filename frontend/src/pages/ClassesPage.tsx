import { useState, useEffect, useRef, useCallback } from 'react';
 
import { FaRedo } from 'react-icons/fa';
import { classesService } from '../lib/classes';
import { Class } from '../types/class';
 
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { UserProfile } from '../types/auth';
// import { SkeletonBox, SkeletonText, SkeletonIcon } from '../components/skeleton/SkeletonComponents';
import { RefreshButton } from '../admin';
import ClassCard from '../components/ClassCard';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/swiper-bundle.css';
import { 
  setDataWithTimestamp, 
  getDataWithTimestamp, 
} from '../utils/cookieManager';
import { motion } from 'framer-motion';

// Cache key for cookies
const CLASSES_CACHE_KEY = 'classes_cache';
const CLASSES_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function ClassesPage() {
  const { profile: contextProfile, user, session, loading: authLoading } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [, setLocalProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [usedTrialClassIds, setUsedTrialClassIds] = useState<Set<string>>(new Set());
  const [showSwipeHint, setShowSwipeHint] = useState(true);
  
  
  // Refs to prevent duplicate calls
  const hasFetchedRef = useRef(false);
  const isFetchingRef = useRef(false);
  const didRefetchWithUserRef = useRef(false);

  

  // Helper function to get cached classes
  const getCachedClasses = (): Class[] | null => {
    try {
      const cached = getDataWithTimestamp<{ data: Class[]; timestamp: number }>(CLASSES_CACHE_KEY, CLASSES_CACHE_DURATION);
      if (cached) {
        // Filter cached data to show only active classes
        const activeCachedClasses = cached.data.filter((cls: Class) => cls.is_active === true);
        return activeCachedClasses;
      }
    } catch (error) {
      // Ignore cache errors
    }
    return null;
  };

  // Helper function to cache classes
  const cacheClasses = (data: Class[]) => {
    try {
      setDataWithTimestamp(CLASSES_CACHE_KEY, {
        data,
        timestamp: Date.now()
      }, CLASSES_CACHE_DURATION);
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
        return;
      }
    }

    try {
      isFetchingRef.current = true;
      
      // If user is logged in, fetch per-user filtered classes (exclude used trials)
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
      isFetchingRef.current = false;
    }
  }, [user]);

  // Load classes on mount - only once
  useEffect(() => {
    if (!hasFetchedRef.current) {
      fetchClasses();
    }
  }, [fetchClasses]);

  // Mobile swipe hint – auto-hide after 5s
  useEffect(() => {
    const timer = setTimeout(() => setShowSwipeHint(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  // When user becomes available, refetch per-user filtered classes once
  useEffect(() => {
    if (user && !didRefetchWithUserRef.current) {
      didRefetchWithUserRef.current = true;
      hasFetchedRef.current = false;
      fetchClasses(true);
    }
  }, [user, fetchClasses]);

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

          // Check if profile already exists to avoid overwriting existing values
          const existingProfileResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}&select=terms_accepted,marketing_consent`, {
            headers: {
              'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${session?.access_token}`,
            }
          });

          let existingTermsAccepted = false;
          let existingMarketingConsent = false;

          if (existingProfileResponse.ok) {
            const existingProfileData = await existingProfileResponse.json();
            if (existingProfileData.length > 0) {
              existingTermsAccepted = existingProfileData[0].terms_accepted ?? false;
              existingMarketingConsent = existingProfileData[0].marketing_consent ?? false;
            }
          }

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
              // Preserve existing values if they exist, otherwise use defaults
              terms_accepted: existingTermsAccepted,
              marketing_consent: existingMarketingConsent,
              last_login_at: new Date().toISOString(),
              language: 'he'
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
            terms_accepted: false, // User must explicitly accept terms
            marketing_consent: false, // User must explicitly consent to marketing
            last_login_at: new Date().toISOString(),
            language: 'he'
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

  // Load per-class trial usage for current user
  useEffect(() => {
    const loadUsedTrials = async () => {
      try {
        if (!user?.id || !session?.access_token) {
          setUsedTrialClassIds(new Set());
          return;
        }
        const { data, error } = await supabase
          .from('user_trial_classes')
          .select('class_id')
          .eq('user_id', user.id);
        if (error) {
          setUsedTrialClassIds(new Set());
          return;
        }
        const ids = new Set<string>((data || []).map((r: any) => r.class_id));
        setUsedTrialClassIds(ids);
      } catch {
        setUsedTrialClassIds(new Set());
      }
    };
    loadUsedTrials();
  }, [user?.id, session?.access_token]);

  // Helper functions
  

  

  const handleRetry = () => {
    hasFetchedRef.current = false;
    setError(null);
    fetchClasses(true); // Force refresh
  };

  const handleRefresh = () => {
    // Clear cache and force refresh
    try {
      // Note: Cookies will be cleared automatically when expired
    } catch (error) {
      // Ignore cache errors
    }
    hasFetchedRef.current = false;
    fetchClasses(true); // Force refresh
  };

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

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };
  
  const fadeInUp = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] } }
  };

  return (
    <motion.div
      className="min-h-screen bg-[#FDF9F6] overflow-x-hidden py-8 sm:py-12 lg:py-16"
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div variants={fadeInUp} className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#4B2E83] to-[#EC4899] mb-4 sm:mb-6 font-agrandir-grand flex items-center justify-center gap-2 sm:gap-3">
            <span>בחרי שיעור</span>
            <span id="classes-scroll-arrow" className="relative h-7 sm:h-8 w-6 sm:w-7 flex items-start" aria-hidden="true">
              <span className="arrow-chev absolute inset-x-0 top-0 flex justify-center">
                <svg className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 20 20" fill="none">
                  <defs>
                    <linearGradient id="classesArrowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#4B2E83" />
                      <stop offset="100%" stopColor="#EC4899" />
                    </linearGradient>
                  </defs>
                  <path fill="url(#classesArrowGrad)" fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
                </svg>
              </span>
            </span>
          </h1>
          
          <style>{`
            @keyframes arrowDown {
              0% { transform: translateY(0); }
              50% { transform: translateY(10px); }
              100% { transform: translateY(0); }
            }
            #classes-scroll-arrow .arrow-chev {
              animation: arrowDown .7s cubic-bezier(.22,.61,.36,1) infinite;
            }
          `}</style>
          
        </motion.div>

        

        {/* Inline Classes Carousel */}
        <motion.section variants={fadeInUp} className="pt-4 sm:pt-6 lg:pt-8 pb-8 sm:pb-12 lg:pb-12" id="classes-carousel">
          <style>{`
            .swiper-button-next, .swiper-button-prev { color: #EC4899 !important; }
            .swiper-pagination { display: none !important; }
            /* Remove card shadow only inside the carousel to avoid gray cast */
            #classes-carousel .shadow-xl { box-shadow: none !important; border: 1px solid #E5E7EB !important; }
            /* Ensure arrows are visible and sized nicely on small screens */
            @media (max-width: 767px) {
              .swiper-button-next, .swiper-button-prev { display: none !important; }
            }
            /* Symmetric arrow positioning around centered card on small screens */
            @media (max-width: 639px) {
              #classes-carousel { --card-w: 360px; }
              #classes-carousel .swiper-button-prev, #classes-carousel .swiper-button-next {
                top: 50% !important;
                transform: translate(-50%, -50%) !important;
                right: auto !important;
              }
              /* Swap sides so visual left/right match arrows on mobile */
              #classes-carousel .swiper-button-prev { left: calc(50% + var(--card-w) / 2 + 20px) !important; }
              #classes-carousel .swiper-button-next { left: calc(50% - var(--card-w) / 2 - 20px) !important; }
              /* Mobile peeks: set slide widths to show edges */
              #classes-carousel .swiper { overflow: visible !important; }
              #classes-carousel .swiper-slide { width: 56vw !important; }
            }
            @media (min-width: 640px) and (max-width: 1023px) {
              #classes-carousel { --card-w: 420px; }
              #classes-carousel .swiper-button-prev, #classes-carousel .swiper-button-next {
                top: 50% !important;
                transform: translate(-50%, -50%) !important;
                right: auto !important;
              }
              /* Swap sides so visual left/right match arrows on tablet */
              #classes-carousel .swiper-button-prev { left: calc(50% + var(--card-w) / 2 + 20px) !important; }
              #classes-carousel .swiper-button-next { left: calc(50% - var(--card-w) / 2 - 20px) !important; }
            }
          `}</style>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-visible md:overflow-hidden pb-15">
               {showSwipeHint && classes.length > 3 && (
                 <div className="absolute inset-x-0 bottom-0 z-40 flex justify-center md:hidden pointer-events-none">
                   <div className="backdrop-blur-sm bg-black/50 text-white text-xs px-3.5 py-1.5 rounded-full flex items-center gap-2 border border-white/20 shadow-lg">
                   <svg className="w-4 h-4 opacity-90 animate-pulse" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                       <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L13.586 11H4a1 1 0 110-2h9.586l-3.293-3.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                     </svg>
                     <span className="font-agrandir-regular">החליקי שמאלה או ימינה כדי לראות עוד שיעורים</span>
                   
                     <svg className="w-4 h-4 opacity-90 transform -scale-x-100 animate-pulse" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                       <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L13.586 11H4a1 1 0 110-2h9.586l-3.293-3.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                     </svg>
                   </div>
                 </div>
               )}
              {classes.length > 3 ? (
                <>
                  {/* Mobile-only Swiper with loop and peeking slides */}
                  <div className="sm:hidden">
                    <Swiper
                      modules={[Navigation]}
                      spaceBetween={16}
                      slidesPerView={'auto'}
                      centeredSlides={true}
                      centeredSlidesBounds={true}
                      loop={classes.length > 1}
                      watchSlidesProgress
                      virtualTranslate={false}
                      onSwiper={(swiper) => {
                        const mid = Math.floor(classes.length / 2);
                        // Use slideToLoop to respect looped indexes
                        swiper.slideToLoop(Math.min(Math.max(mid, 0), classes.length - 1), 0);
                      }}
                      className="rounded-lg overflow-visible w-full mx-auto"
                    >
                      {classes.map((classItem) => (
                        <SwiperSlide key={classItem.id}>
                          {({ isActive }) => (
                            <div className={`transition-transform duration-300 flex justify-center py-4 ${isActive ? 'scale-[1.08]' : 'scale-[0.94]'}`}
                              style={{ transformOrigin: 'center center' }}
                            >
                              <ClassCard classItem={classItem} usedTrialClassIds={usedTrialClassIds} />
                            </div>
                          )}
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>
                  {/* Tablet/Desktop: keep Swiper as-is */}
                  <div className="hidden sm:block">
                    <Swiper
                      modules={[Navigation]}
                      spaceBetween={20}
                      slidesPerView={1}
                      centeredSlides={true}
                      centeredSlidesBounds={true}
                      loop={classes.length > 2}
                      navigation
                      breakpoints={{
                        640: { slidesPerView: 1, spaceBetween: 20 },
                        768: { slidesPerView: 1, spaceBetween: 24 },
                        1024: { slidesPerView: 3, spaceBetween: 30 },
                      }}
                      className="rounded-lg overflow-visible w-full mx-auto"
                    >
                      {classes.map((classItem) => (
                        <SwiperSlide key={classItem.id}>
                          {({ isActive }) => (
                            <div
                              className={`transition-transform duration-300 flex justify-center py-4 sm:py-5 lg:py-6 mx-auto w-full max-w-[360px] sm:max-w-[420px] lg:max-w-none px-4 ${
                                isActive ? 'scale-[1.04]' : 'scale-[0.95]'
                              }`}
                              style={{ transformOrigin: 'center center' }}
                            >
                              <ClassCard classItem={classItem} usedTrialClassIds={usedTrialClassIds} />
                            </div>
                          )}
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>
                </>
              ) : (
                <>
                  {/* Mobile-only Swiper for up to 3 classes with loop and peeking slides */}
                  <div className="sm:hidden">
                    <Swiper
                      modules={[Navigation]}
                      spaceBetween={16}
                      slidesPerView={'auto'}
                      centeredSlides={true}
                      centeredSlidesBounds={true}
                      loop={classes.length > 1}
                      watchSlidesProgress
                      virtualTranslate={false}
                      onSwiper={(swiper) => {
                        const n = Math.min(classes.length, 3);
                        const mid = Math.floor(n / 2);
                        swiper.slideToLoop(Math.min(Math.max(mid, 0), n - 1), 0);
                      }}
                      className="rounded-lg overflow-visible w-full mx-auto"
                    >
                      {classes.slice(0, 3).map((classItem) => (
                        <SwiperSlide key={classItem.id}>
                          {({ isActive }) => (
                            <div className={`transition-transform duration-300 flex justify-center py-4 ${isActive ? 'scale-[1.08]' : 'scale-[0.94]'}`}
                              style={{ transformOrigin: 'center center' }}
                            >
                              <ClassCard classItem={classItem} usedTrialClassIds={usedTrialClassIds} />
                            </div>
                          )}
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>
                  {/* Tablet-only keep Swiper; Desktop keep grid */}
                  <div className="hidden sm:block lg:hidden">
                    <Swiper
                      modules={[Navigation]}
                      spaceBetween={20}
                      slidesPerView={1}
                      centeredSlides={true}
                      centeredSlidesBounds={true}
                      loop={classes.length > 1}
                      navigation
                      breakpoints={{
                        640: { slidesPerView: 1, spaceBetween: 20 },
                        768: { slidesPerView: 1, spaceBetween: 24 },
                      }}
                      className="rounded-lg overflow-visible w-full mx-auto"
                    >
                      {classes.slice(0, 3).map((classItem) => (
                        <SwiperSlide key={classItem.id}>
                          {({ isActive }) => (
                            <div
                              className={`transition-transform duration-300 flex justify-center py-4 sm:py-5 lg:py-6 mx-auto w-full max-w-[360px] sm:max-w-[420px] px-4 ${
                                isActive ? 'scale-[1.04]' : 'scale-[0.95]'
                              }`}
                              style={{ transformOrigin: 'center center' }}
                            >
                              <ClassCard classItem={classItem} usedTrialClassIds={usedTrialClassIds} />
                            </div>
                          )}
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>
                  <div className="hidden lg:grid lg:grid-cols-3 gap-0">
                    {classes.slice(0, 3).map((classItem, index) => (
                      <div
                        key={classItem.id}
                        className={`transition-transform duration-300 flex justify-center py-4 sm:py-5 lg:py-6 mx-auto w-full max-w-[360px] sm:max-w-[420px] lg:max-w-none px-4 ${
                          index === 1 ? 'lg:scale-[1.04]' : 'lg:scale-[0.95]'
                        }`}
                        style={{ transformOrigin: 'center center' }}
                      >
                        <ClassCard classItem={classItem} usedTrialClassIds={usedTrialClassIds} />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.section>


      </div>
    </motion.div>
  );
}

export default ClassesPage;