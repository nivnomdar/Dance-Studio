import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
// import { useProfile } from '../hooks/useProfile';
import ProfileTabs from '../components/profile/ProfileTabs';
import type { UserProfile, UserConsent } from '../types/auth';
import { registrationsService } from '../lib/registrations';
import { subscriptionCreditsService } from '../lib/subscriptionCredits';
import { LoadingPage, ErrorPage, StatusModal } from '../components/common';
import { CreditGroup } from '../types/subscription';
import { throttledApiFetch } from '../utils/api'; // Import throttledApiFetch
import { getDataWithTimestamp, setDataWithTimestamp } from '../utils/cookieManager'; // New import
import { motion } from 'framer-motion';

function UserProfile() {
  const { user, loading: authLoading, session, profile: contextProfile, loadProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
  });
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [localProfile, setLocalProfile] = useState<UserProfile | null>(null);
  const [classesCount, setClassesCount] = useState(0);
  const [creditsTotals, setCreditsTotals] = useState<Record<CreditGroup, number>>({ group: 0, private: 0, zoom: 0, workshop: 0, intensive: 0 });
  const [isFetchingCount, setIsFetchingCount] = useState(false);
  const [trialStatuses, setTrialStatuses] = useState<Array<{ id: string; name: string; used: boolean }>>([]);
  const [userConsents, setUserConsents] = useState<UserConsent[]>([]); // New state for consents
  const [loadingConsents, setLoadingConsents] = useState(true); // New state for loading consents
  const [localMarketingConsent, setLocalMarketingConsent] = useState(false); // New state for local marketing consent
  const navigate = useNavigate();
  
  // Refs to track loaded data
  const dataLoadedRef = useRef(false);
  const currentUserIdRef = useRef<string | null>(null);
  const profileDataLoadedRef = useRef<string | null>(null); // New ref to track profile data loading

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

  // Move profile loading logic to useCallback to avoid setState during render
  const loadProfileData = useCallback(async () => {
    if (!user || !session?.access_token) return;
    
    try {
      setIsLoadingProfile(true); // Set loading to true at the start
      // No need for creatingKey logic, throttledApiFetch handles rate limiting

      const [profileResponse, consentsResponse] = await Promise.all([
        fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles?select=*&id=eq.${user.id}`, {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        }),
        throttledApiFetch(`${import.meta.env.VITE_API_BASE_URL}/profiles/consents`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        })
      ]);
      
      if (!profileResponse.ok) {
        const errorText = await profileResponse.text();
        throw new Error(`HTTP ${profileResponse.status}: ${errorText}`);
      }

      if (!consentsResponse.ok) {
        const errorText = await consentsResponse.text();
        throw new Error(`HTTP ${consentsResponse.status}: ${errorText}`);
      }
      
      const profileDataArray = await profileResponse.json();
      const fetchedConsents: UserConsent[] = await consentsResponse.json();
      setUserConsents(fetchedConsents);
      const hasMarketingConsent = fetchedConsents.some(c => c.consent_type === 'marketing_consent' && c.version === null);
      setLocalMarketingConsent(hasMarketingConsent);

      if (profileDataArray.length === 0) {
        // Profile doesn't exist, create a new one
        const fullName = user.user_metadata?.full_name || user.user_metadata?.name || '';
        const nameParts = fullName.split(' ').filter(Boolean);
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        // First, try to create the profile using upsert
        try {
          const createResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles`, {
            method: 'POST',
            headers: {
              'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${session.access_token}`,
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
              last_login_at: new Date().toISOString(),
              language: 'he'
            })
          });

          if (createResponse.ok) {
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
            setFormData({
              firstName: newProfile.first_name || '',
              lastName: newProfile.last_name || '',
              phone: newProfile.phone_number || '',
              email: newProfile.email || '',
              address: newProfile.address || '',
              city: newProfile.city || '',
              postalCode: newProfile.postal_code || '',
            });
            // For new users, terms and marketing consents are false by default until accepted
            setUserConsents([]); 
            setLocalMarketingConsent(false); // Also initialize local state for new users
          } else {
            throw new Error(`Failed to create profile: ${createResponse.status}`);
          }
        } catch (error) {
          // If upsert fails, try to load existing profile
          
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
                setLocalProfile(profileData);
                setFormData({
                  firstName: profileData.first_name || '',
                  lastName: profileData.last_name || '',
                  phone: profileData.phone_number || '',
                  email: profileData.email || user.email || '',
                  address: profileData.address || '',
                  city: profileData.city || '',
                  postalCode: profileData.postal_code || '',
                });
                // Update consents from fetched data
                setUserConsents(fetchedConsents);
                const hasMarketingConsent = fetchedConsents.some(c => c.consent_type === 'marketing_consent' && c.version === null);
                setLocalMarketingConsent(hasMarketingConsent);
              } else {
                throw new Error('Profile not found in final attempt');
              }
            } else {
              throw new Error(`Final attempt failed: ${finalResponse.status}`);
            }
          } catch (finalError) {
            console.error('Final error loading profile:', finalError);
            setProfileError(`שגיאה בטעינת הפרופיל: ${finalError instanceof Error ? finalError.message : 'שגיאה לא ידועה'}`);
            setLocalProfile(null);
          }
        }
      } else {
        const profileData = profileDataArray[0];
        setLocalProfile(profileData);
        setFormData({
          firstName: profileData.first_name || '',
          lastName: profileData.last_name || '',
          phone: profileData.phone_number || '',
          email: profileData.email || user.email || '',
          address: profileData.address || '',
          city: profileData.city || '',
          postalCode: profileData.postal_code || '',
        });
        // Update consents from fetched data
        setUserConsents(fetchedConsents);
        const hasMarketingConsent = fetchedConsents.some(c => c.consent_type === 'marketing_consent' && c.version === null);
        setLocalMarketingConsent(hasMarketingConsent);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setProfileError(`שגיאה בטעינת הפרופיל: ${error instanceof Error ? error.message : 'שגיאה לא ידועה'}`);
      setLocalProfile(null);
      profileDataLoadedRef.current = null; // Reset ref on error
    } finally {
      setIsLoadingProfile(false);
      setLoadingConsents(false);
    }
  }, [user, session]);

  useEffect(() => {
    if (!user || authLoading) {
      if (!user && !authLoading) {
        setIsLoadingProfile(false);
      }
      return;
    }

    // If profile data for this user has already been loaded, skip
    if (profileDataLoadedRef.current === user.id) {
      return;
    }

    loadProfileData();
    profileDataLoadedRef.current = user.id; // Mark as loaded for this user

  }, [user?.id, authLoading, loadProfileData]);

  // Handle navigation when no user
  useEffect(() => {
    if (!user && !authLoading) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  // פונקציה לטעינת יתרת subscription credits
  const fetchSubscriptionCredits = useCallback(async () => {
    if (!user || !session) return;
    
    try {
      // const userCredits = await subscriptionCreditsService.getUserCredits(user.id);
      const totals = await subscriptionCreditsService.getTotalCredits(user.id);
      // Use setTimeout to avoid setState during render
      setCreditsTotals(totals);
    } catch (error) {
      console.error('Error fetching subscription credits:', error);
    }
  }, [user, session]);

  // Detailed trial usage: per trial class (category = 'trial'), each can be used once per user
  const fetchTrialStatus = useCallback(async () => {
    if (!user?.id) return;
    try {
      const [{ data: trials, error: trialsErr }, { data: usedRows, error: usedErr }] = await Promise.all([
        supabase.from('classes').select('id, name').eq('category', 'trial').eq('is_active', true),
        supabase.from('user_trial_classes').select('class_id').eq('user_id', user.id)
      ]);
      if (trialsErr) throw trialsErr;
      if (usedErr) throw usedErr;
      const usedSet = new Set((usedRows || []).map((r: any) => r.class_id));
      const statuses = (trials || []).map((c: any) => ({ id: c.id as string, name: (c.name as string) || 'Trial', used: usedSet.has(c.id) }));
      setTrialStatuses(statuses);
    } catch (e) {
      console.error('Error fetching trial status:', e);
      setTrialStatuses([]);
    }
  }, [user?.id]);

  // פונקציה לספירת השיעורים של המשתמש עם debouncing ו-retry
  const fetchClassesCount = useCallback(async (retryCount = 0) => {
    if (!user || !session || isFetchingCount) return;
    
    // Add cache check to prevent unnecessary requests
    const cacheKey = `classesCount_${user.id}`;
    const cachedData = getDataWithTimestamp<string>(cacheKey, 5 * 60 * 1000); // 5 דקות

    if (cachedData !== null) {
      // Use setTimeout to avoid setState during render
      setClassesCount(parseInt(cachedData, 10) || 0);
      return;
    }
    
    // Use setTimeout to avoid setState during render
    setIsFetchingCount(true);
    
    // Add debouncing to prevent too many requests
    const timeoutId = setTimeout(async () => {
      try {
        const registrations = await registrationsService.getMyRegistrations(user.id);
        
        // Count only completed (past) lessons, exclude cancelled and future
        const now = new Date();
        const completedRegistrations = registrations.filter((registration: any) => {
          if (registration.status === 'cancelled') return false;
          const dateValue = registration.selected_date || registration.date || registration.created_at;
          if (!dateValue) return false;
          const d = new Date(dateValue);
          return d < now;
        });

        const count = completedRegistrations.length;
        // Use setTimeout to avoid setState during render
        setClassesCount(count);
        
        // Cache the result
        setDataWithTimestamp(cacheKey, count.toString(), 5 * 60 * 1000); // 5 דקות
        
      } catch (error) {
        console.error('Error fetching classes count:', error);
        // Handle rate limiting gracefully
        if (error instanceof Error && error.message.includes('429')) {
          // Retry after a delay
          if (retryCount < 3) {
            setTimeout(() => {
              fetchClassesCount(retryCount + 1);
            }, 1000 * (retryCount + 1));
          }
        }
      } finally {
        // Use setTimeout to avoid setState during render
        setIsFetchingCount(false);
      }
    }, 100); // 100ms debounce
    
    return () => clearTimeout(timeoutId);
  }, [user, session, isFetchingCount]);

  // useEffect לטעינת ספירת השיעורים ויתרת מנויים
  useEffect(() => {
    if (user?.id && session?.access_token && !authLoading) {
      // Reset if user changed
      if (currentUserIdRef.current !== user.id) {
        dataLoadedRef.current = false;
        currentUserIdRef.current = user.id;
      }
      
      // Only load if not already loaded for this user
      if (!dataLoadedRef.current) {
        dataLoadedRef.current = true;
        
        fetchClassesCount();
        fetchSubscriptionCredits();
        fetchTrialStatus();
      }
    }
  }, [user?.id, session?.access_token, authLoading]);

  // Load if user has any trial usage records for status badge (UI only)
  useEffect(() => {
    const loadAnyTrialUsage = async () => {
      try {
        if (!user?.id || !session?.access_token) {
          return;
        }
        const { error } = await supabase
          .from('user_trial_classes')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id);
        if (error) {
          return;
        }
        // when head:true, data is null; rely on count in response (not returned by supabase-js v2 select?). Fallback: simple select
      } catch {
        // Fallback simple select since count with head may not populate count directly
      }
      try {
        if (!user?.id) return;
        const { error: selErr } = await supabase
          .from('user_trial_classes')
          .select('id')
          .eq('user_id', user.id)
          .limit(1);
        if (selErr) {
          return;
        }
      } catch {
      }
    };
    loadAnyTrialUsage();
  }, [user?.id, session?.access_token]);

  // Remove the redundant focus event listener that was causing additional API calls
  // useEffect לעדכון הספירה כאשר הדף נטען מחדש
  // useEffect(() => {
  //   const handleFocus = () => {
  //     if (user && session && !authLoading) {
  //       fetchClassesCount();
  //     }
  //   };

  //   window.addEventListener('focus', handleFocus);
  //   return () => window.removeEventListener('focus', handleFocus);
  // }, [user?.id, session, authLoading]);

  // Callback to refresh data
  // const refreshData = useCallback(() => {
  //   if (user?.id) {
  //     dataLoadedRef.current = false;
  //     setTimeout(() => {
  //       fetchClassesCount();
  //       fetchSubscriptionCredits();
  //       fetchTrialStatus();
  //     }, 0);
  //   }
  // }, [user?.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Removed handleMarketingConsentChange function, its logic is now in handleSubmit

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    // Special handling for marketing_consent
    if (name === 'marketing_consent') {
      setLocalMarketingConsent(checked); // Directly update local state
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (!user || !session) throw new Error('No user or session found');
      
      // Handle marketing consent update if changed
      const currentMarketingConsent = userConsents.some(c => c.consent_type === 'marketing_consent' && c.version === null);
      if (localMarketingConsent !== currentMarketingConsent) {
        const consentPayload = JSON.stringify({ consent_type: 'marketing_consent', version: null, consented: localMarketingConsent });
        const consentResponse = await throttledApiFetch(`${import.meta.env.VITE_API_BASE_URL}/profiles/accept-consent`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
            body: consentPayload,
        });
        if (!consentResponse.ok) {
            const errorText = await consentResponse.text();
            throw new Error(`Failed to update marketing consent during submit: ${errorText}`);
        }
      }

      const profileData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone_number: formData.phone,
        address: formData.address,
        city: formData.city,
        postal_code: formData.postalCode,
        // marketing_consent ו-terms_accepted מטופלים בנפרד דרך טבלת user_consents
      };
      
      const updateResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(profileData)
      });
      
      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        throw new Error(`Update failed: ${errorText}`);
      }
      
      const updatedProfile = await updateResponse.json();
      
      // עדכון הפרופיל המקומי עם הנתונים המעודכנים
      const newLocalProfile = {
        ...localProfile,
        ...updatedProfile[0]
      };
      setLocalProfile(newLocalProfile);
      
      // עדכון ה-formData עם הנתונים המעודכנים מיד (למעט הסכמות)
      setFormData(prev => ({
        ...prev,
        firstName: newLocalProfile.first_name || '',
        lastName: newLocalProfile.last_name || '',
        phone: newLocalProfile.phone_number || '',
        address: newLocalProfile.address || '',
        city: newLocalProfile.city || '',
        postalCode: newLocalProfile.postal_code || '',
      }));
      
      // עדכון מיד של הפרופיל בקונטקסט
      if (contextProfile) {
        loadProfile().catch(console.error);
      }
      await loadProfileData(); // Reload consents and profile to reflect all changes
      
      setIsEditing(false); // Exit edit mode only after successful submit
      setShowSuccessPopup(true);
      setTimeout(() => setShowSuccessPopup(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrorMessage(`אירעה שגיאה בעדכון הפרופיל: ${error instanceof Error ? error.message : 'שגיאה לא ידועה'}`);
      setShowErrorPopup(true);
      setTimeout(() => setShowErrorPopup(false), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  // Auth loading state
  if (authLoading || isLoadingProfile || loadingConsents) {
    return <LoadingPage message="טוען..." />;
  }

  // No user state - redirect to home
  if (!user && !authLoading) {
    return null;
  }

  // Error state
  if (profileError) {
    return (
      <ErrorPage
        title="שגיאה בטעינת הפרופיל"
        message={profileError}
        onRetry={() => window.location.reload()}
        retryText="נסה שוב"
      />
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-[#FFF5F9] via-[#FDF9F6] to-[#FFF5F9] pt-16 sm:pt-20 lg:pt-24 pb-8 sm:pb-12"
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div variants={fadeInUp} className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#4B2E83] mb-3 sm:mb-4 font-agrandir-grand">
            הפרופיל שלי
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-[#4B2E83]/70 max-w-2xl mx-auto px-2">
            כאן תוכלי לנהל את הפרטים האישיים שלך ולעדכן את המידע שלך במערכת
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Profile Card */}
          <motion.div variants={fadeInUp} className="lg:col-span-1">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl overflow-hidden border border-[#EC4899]/10">
              {/* Profile Header */}
              <div className="bg-gradient-to-r from-[#EC4899] to-[#4B2E83] px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12 text-center relative">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10">
                  {/* Profile Picture */}
                  <div className="relative mx-auto mb-4 sm:mb-6 flex justify-center">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 sm:border-4 border-white/30 shadow-xl sm:shadow-2xl overflow-hidden">
                      {(user?.user_metadata?.avatar_url || user?.user_metadata?.picture) ? (
                        <img 
                          src={user.user_metadata?.avatar_url || user.user_metadata?.picture} 
                          alt="תמונת פרופיל של המשתמש" 
                          className="w-full h-full object-cover"
                          loading="eager"
                          onError={(e) => {
                            // אם התמונה לא נטענת, נציג אייקון ברירת מחדל
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`w-full h-full bg-gradient-to-br from-white/30 to-white/10 flex items-center justify-center ${(user?.user_metadata?.avatar_url || user?.user_metadata?.picture) ? 'hidden' : ''}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 sm:h-12 sm:w-12 lg:h-16 lg:w-16 text-white" viewBox="0 0 24 24" fill="currentColor" role="img" aria-hidden="true">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                      </div>
                    </div>
                    {/* Disable avatar editing per requirements: no image change in edit mode */}
                  </div>
                  
                  {/* User Info */}
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-1 sm:mb-2 font-agrandir-grand">
                    {`${formData.firstName} ${formData.lastName}`.trim() || 'משתמשת חדשה'}
                  </h2>
                  <p className="text-white/80 text-xs sm:text-sm mb-1">
                    {formData.email}
                  </p>
                  <p className="text-white/60 text-xs">
                    חברה מאז {user ? new Date(user.created_at).toLocaleDateString('he-IL') : ''}
                  </p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-[#EC4899]/5 to-[#4B2E83]/5 rounded-xl sm:rounded-2xl relative group">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-[#4B2E83]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5V8H2v12h5m10 0V4a2 2 0 00-2-2H9a2 2 0 00-2 2v16m10 0H7" />
                      </svg>
                      <h3 className="text-xs sm:text-sm text-[#4B2E83]/80 font-semibold whitespace-nowrap">השיעורים שלי</h3>
                    </div>
                    <div className="inline-flex items-baseline gap-3 px-4 py-2 rounded-lg bg-white/80 border border-[#4B2E83]/10">
                    <span className="text-[12px] sm:text-sm text-[#4B2E83]/70 whitespace-nowrap">השתתפת ב-</span>

                      <span className="text-2xl sm:text-3xl font-extrabold text-[#EC4899]">{classesCount}</span>
                      <span className="text-[12px] sm:text-sm text-[#4B2E83]/70 whitespace-nowrap">שיעורים</span>
                    </div>
                  </div>
              
                </div>

                {/* Admin Dashboard Link - רק למנהלים */}
                {localProfile?.role === 'admin' && (
                  <div className="mb-4 sm:mb-6">
                    <Link
                      to="/admin"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xs sm:text-sm rounded-lg sm:rounded-xl font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-300 hover:scale-105 shadow-md flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#EC4899] focus:ring-offset-2 focus:border-2 focus:border-black"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      דשבורד מנהלים
                    </Link>
                  </div>
                )}

                {/* Additional Info */}
                <div className="space-y-2 sm:space-y-3">
                  {/* Trial Class Status */}
                  <div className="bg-white/50 backdrop-blur-sm rounded-lg sm:rounded-xl p-2.5 sm:p-3 border border-white/20">
                    <div className="mb-1.5 sm:mb-2 text-center">
                      <h3 className="text-sm font-semibold text-[#4B2E83]">שיעור ניסיון</h3>
                    </div>
                    <div className="space-y-1.5">
                      {trialStatuses.length === 0 ? (
                        <div className="text-xs sm:text-sm text-[#4B2E83]/70">אין שיעורי ניסיון זמינים כרגע.</div>
                      ) : (
                        trialStatuses.map((t) => (
                          <div key={t.id} className="flex items-center justify-between rounded-md px-2 py-1 bg-white/60">
                            <span className="text-xs sm:text-sm text-[#4B2E83]/80 line-clamp-1">{t.name}</span>
                            <span className={`text-xs font-semibold ${t.used ? 'text-red-500' : 'text-green-600'}`}>{t.used ? 'נוצל' : 'זמין'}</span>
                          </div>
                        ))
                      )}
                    </div>
                    {trialStatuses.some(t => !t.used) && (
                      <div className="mt-2 text-center">
                        <Link to="/classes" className="bg-green-500 text-white px-2 py-1 rounded-md hover:bg-green-600 transition-colors text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#4B2E83] focus:ring-offset-2 focus:border-2 focus:border-[#4B2E83]">בחירת שיעור ניסיון</Link>
                      </div>
                    )}
                  </div>

                  {/* Credits Status */}
                  <div className="bg-white/50 backdrop-blur-sm rounded-lg sm:rounded-xl p-2.5 sm:p-3 border border-[#4B2E83]/10">
                    <div className="text-center">
                      <h3 className="text-sm font-semibold text-[#4B2E83]">יתרת שיעורים</h3>
                      <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-2">
                        <div className="inline-flex items-baseline gap-2 px-3 py-1.5 rounded-lg bg-white/70 border border-[#EC4899]/10 shadow-sm">
                          <span className="text-lg sm:text-xl font-extrabold text-[#EC4899]">{creditsTotals['group'] || 0}</span>
                          <span className="text-[11px] sm:text-xs text-gray-600">שיעורי מנוי</span>
                        </div>
                        {/* ניתן להוסיף סוגי שיעורים נוספים כמו זום, סדנה וכו' */}
                      </div>
                      {creditsTotals.group === 0 && (
                        <p className="mt-3 text-xs text-gray-500">אין לך שיעורי מנוי זמינים. לרכישת מנוי, לחצי <Link to="/pricing" className="text-[#EC4899] font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-[#4B2E83] focus:ring-offset-2 focus:border-2 focus:border-[#4B2E83]">לרכישת מנוי</Link>.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tabs Section */}
          <motion.div variants={fadeInUp} className="lg:col-span-2">
            <ProfileTabs
              user={user}
              localProfile={localProfile}
              formData={formData}
              isEditing={isEditing}
              isLoading={isLoading}
              onInputChange={handleInputChange}
              onCheckboxChange={handleCheckboxChange}
              onSubmit={handleSubmit}
              onToggleEdit={() => setIsEditing(!isEditing)}
              session={session}
              onClassesCountUpdate={fetchClassesCount}
              onCreditsUpdate={fetchSubscriptionCredits}
              userConsents={userConsents} // Pass consents to ProfileTabs
              loadingConsents={loadingConsents} // Pass loading state to ProfileTabs
              localMarketingConsent={localMarketingConsent} // Pass new local state
              onLocalMarketingConsentChange={setLocalMarketingConsent} // Pass setter directly
            />
          </motion.div>
        </div>
      </div>

      {/* Success Popup */}
      <StatusModal
        isOpen={showSuccessPopup}
        onClose={() => setShowSuccessPopup(false)}
        type="success"
        title="הצלחה!"
        message="הפרופיל עודכן בהצלחה"
      />

      {/* Error Popup */}
      <StatusModal
        isOpen={showErrorPopup}
        onClose={() => setShowErrorPopup(false)}
        type="error"
        title="שגיאה"
        message={errorMessage}
      />
    </motion.div>
  );
}

export default UserProfile; 