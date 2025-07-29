import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../hooks/useProfile';
import ProfileTabs from '../components/profile/ProfileTabs';
import type { UserProfile } from '../types/auth';
import { registrationsService } from '../lib/registrations';
import { subscriptionCreditsService } from '../lib/subscriptionCredits';
import { LoadingPage, ErrorPage, StatusModal } from '../components/common';

function UserProfile() {
  const { user, loading: authLoading, session, profile: contextProfile, profileLoading, loadProfile } = useAuth();
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
  const [subscriptionCredits, setSubscriptionCredits] = useState(0);
  const [isFetchingCount, setIsFetchingCount] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // איפוס מצב הטעינה כאשר המשתמש משתנה
    setIsLoadingProfile(true);
    setProfileError(null);
    
    // איפוס formData כאשר המשתמש משתנה
    setFormData({
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      postalCode: '',
    });
    
    // רק אם יש משתמש ולא בטעינה
    if (!user || authLoading) {
      if (!user && !authLoading) {
        setIsLoadingProfile(false);
      }
      return;
    }
    
    // אם יש פרופיל מה-context, נשתמש בו
    if (contextProfile) {
      const profileData = {
        firstName: contextProfile.first_name || '',
        lastName: contextProfile.last_name || '',
        phone: contextProfile.phone_number || '',
        email: contextProfile.email || user.email || '',
        address: contextProfile.address || '',
        city: contextProfile.city || '',
        postalCode: contextProfile.postal_code || '',
      };
      
      setFormData(profileData);
      setLocalProfile(contextProfile);
      setIsLoadingProfile(false);
    } else {
      // טעינת הפרופיל ישירות עם fetch
      const loadProfileWithFetch = async () => {
        try {
          // קריאה עם fetch
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
            // פרופיל לא קיים, נצור אחד חדש
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
                // הוספת השדה החדש
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
            setFormData({
              firstName: '',
              lastName: '',
              phone: '',
              email: user.email || '',
              address: '',
              city: '',
              postalCode: '',
            });
          } else {
            const profileData = profileDataArray[0];
            const formDataFromProfile = {
              firstName: profileData.first_name || '',
              lastName: profileData.last_name || '',
              phone: profileData.phone_number || '',
              email: profileData.email || user.email || '',
              address: profileData.address || '',
              city: profileData.city || '',
              postalCode: profileData.postal_code || '',
            };
            
            setFormData(formDataFromProfile);
            setLocalProfile(profileData);
          }
          
          setIsLoadingProfile(false);
        } catch (error) {
          console.error('Error loading profile:', error);
          setProfileError(`שגיאה בטעינת הפרופיל: ${error instanceof Error ? error.message : 'שגיאה לא ידועה'}`);
          setIsLoadingProfile(false);
        }
      };
      
      loadProfileWithFetch();
    }
  }, [user?.id, authLoading, contextProfile]);

  // useEffect נוסף לטיפול בפרופיל שנטען מאוחר יותר
  useEffect(() => {
    if (contextProfile && isLoadingProfile) {
      const profileData = {
        firstName: contextProfile.first_name || '',
        lastName: contextProfile.last_name || '',
        phone: contextProfile.phone_number || '',
        email: contextProfile.email || user?.email || '',
        address: contextProfile.address || '',
        city: contextProfile.city || '',
        postalCode: contextProfile.postal_code || '',
      };
      
      setFormData(profileData);
      setLocalProfile(contextProfile);
      setIsLoadingProfile(false);
    }
  }, [contextProfile, isLoadingProfile, user]);

  // useEffect לטעינת ספירת השיעורים ויתרת מנויים
  useEffect(() => {
    if (user && session && !authLoading) {
      fetchClassesCount();
      fetchSubscriptionCredits();
    }
  }, [user?.id, session, authLoading]);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // פונקציה לטעינת יתרת subscription credits
  const fetchSubscriptionCredits = async () => {
    if (!user || !session) return;
    
    try {
      const userCredits = await subscriptionCreditsService.getUserCredits(user.id);
      const totalCredits = userCredits.total_group_credits + userCredits.total_private_credits + userCredits.total_zoom_credits;
      setSubscriptionCredits(totalCredits);
    } catch (error) {
      console.error('Error fetching subscription credits:', error);
    }
  };

  // פונקציה לספירת השיעורים של המשתמש עם debouncing ו-retry
  const fetchClassesCount = async (retryCount = 0) => {
    if (!user || !session || isFetchingCount) return;
    
    // Add cache check to prevent unnecessary requests
    const cacheKey = `classesCount_${user.id}`;
    const cachedData = sessionStorage.getItem(cacheKey);
    const cacheTime = sessionStorage.getItem(`${cacheKey}_time`);
    
    // Check if we have recent cached data (less than 5 minutes old)
    if (cachedData && cacheTime) {
      const now = Date.now();
      const cacheAge = now - parseInt(cacheTime);
      if (cacheAge < 5 * 60 * 1000) { // 5 minutes
        setClassesCount(parseInt(cachedData));
        return;
      }
    }
    
    setIsFetchingCount(true);
    
    // Add debouncing to prevent too many requests
    const timeoutId = setTimeout(async () => {
      try {
        const registrations = await registrationsService.getMyRegistrations(user.id);
        
        // ספירת הרשמות פעילות ועבר (לא בוטלות)
        const validRegistrations = registrations.filter((registration: any) => {
          // בדיקה שההרשמה לא בוטלה
          if (registration.status === 'cancelled') return false;
          
          // בדיקה אם זה שיעור עבר או עתידי
          const registrationDate = new Date(registration.selected_date);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          // כולל שיעורים עתידיים ושיעורים שהסתיימו (עבר)
          return true;
        });
        
        const count = validRegistrations.length;
        setClassesCount(count);
        
        // Cache the result
        sessionStorage.setItem(cacheKey, count.toString());
        sessionStorage.setItem(`${cacheKey}_time`, Date.now().toString());
        
      } catch (error) {
        console.error('Error fetching classes count:', error);
        // Handle rate limiting gracefully
        if (error instanceof Error && error.message.includes('429')) {
          if (retryCount < 2) {
            const retryDelay = Math.pow(2, retryCount) * 2000;
            console.log(`Rate limited, retrying in ${retryDelay/1000} seconds...`);
            setTimeout(() => fetchClassesCount(retryCount + 1), retryDelay);
            return;
          }
          console.log('Rate limit exceeded, stopping retries');
        }
      } finally {
        setIsFetchingCount(false);
      }
    }, 2000); // Increased debounce to 2 seconds

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      setIsFetchingCount(false);
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (!user || !session) throw new Error('No user or session found');
      
      // עדכון ישיר עם fetch
      const profileData = {
        email: user.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone_number: formData.phone,
        address: formData.address,
        city: formData.city,
        postal_code: formData.postalCode,
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
      
      // עדכון הפרופיל המקומי
      setLocalProfile(updatedProfile[0]);
      
      setIsEditing(false);
      // הצגת הודעת הצלחה
      setShowSuccessPopup(true);
      // סגירת הפופאפ אחרי 3 שניות
      setTimeout(() => setShowSuccessPopup(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrorMessage(`אירעה שגיאה בעדכון הפרופיל: ${error instanceof Error ? error.message : 'שגיאה לא ידועה'}`);
      setShowErrorPopup(true);
      // סגירת הפופאפ אחרי 5 שניות
      setTimeout(() => setShowErrorPopup(false), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  // Auth loading state
  if (authLoading) {
    return <LoadingPage message="טוען..." />;
  }

  // No user state - redirect to home
  if (!user && !authLoading) {
    navigate('/');
    return null;
  }

  // Loading state
  if (isLoadingProfile) {
    return <LoadingPage message="טוען פרופיל..." />;
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
    <div className="min-h-screen bg-gradient-to-br from-[#FFF5F9] via-[#FDF9F6] to-[#FFF5F9] pt-16 sm:pt-20 lg:pt-24 pb-8 sm:pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#4B2E83] mb-3 sm:mb-4 font-agrandir-grand">
            הפרופיל שלי
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-[#4B2E83]/70 max-w-2xl mx-auto px-2">
            כאן תוכלי לנהל את הפרטים האישיים שלך ולעדכן את המידע שלך במערכת
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
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
                          alt="Profile" 
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
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 sm:h-12 sm:w-12 lg:h-16 lg:w-16 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                      </div>
                    </div>
                    {isEditing && (
                      <button
                        type="button"
                        className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 bg-white p-2 sm:p-3 rounded-full shadow-lg hover:bg-gray-50 transition-all duration-200 hover:scale-110"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-[#EC4899]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </button>
                    )}
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
                <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-[#EC4899]/5 to-[#4B2E83]/5 rounded-xl sm:rounded-2xl relative group">
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-[#EC4899]">{classesCount}</div>
                    <div className="text-xs sm:text-sm text-[#4B2E83]/70 mb-2 h-6 sm:h-8 flex items-center justify-center">השיעורים שלי</div>
                    <button
                      onClick={() => window.open(`${window.location.origin}/classes`, '_blank')}
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white text-xs rounded-lg font-medium hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300 hover:scale-105 shadow-md cursor-pointer"
                    >
                      הרשמה לשיעור
                    </button>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-[#4B2E83]/5 to-[#EC4899]/5 rounded-xl sm:rounded-2xl relative group">
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-[#4B2E83]">{subscriptionCredits}</div>
                    <div className="text-xs sm:text-sm text-[#4B2E83]/70 mb-2 h-6 sm:h-8 flex items-center justify-center">שיעורים זמינים</div>
                    <button
                      onClick={() => window.open(`${window.location.origin}/classes`, '_blank')}
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-[#4B2E83] to-[#EC4899] text-white text-xs rounded-lg font-medium hover:from-[#EC4899] hover:to-[#4B2E83] transition-all duration-300 hover:scale-105 shadow-md cursor-pointer"
                    >
                      הרשמה לשיעור
                    </button>
                  </div>
                </div>

                {/* Admin Dashboard Link - רק למנהלים */}
                {localProfile?.role === 'admin' && (
                  <div className="mb-4 sm:mb-6">
                    <Link
                      to="/admin"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xs sm:text-sm rounded-lg sm:rounded-xl font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-300 hover:scale-105 shadow-md flex items-center justify-center gap-2"
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
                    <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                      <span className="text-xs font-medium text-[#4B2E83]/60 uppercase tracking-wide">שיעור ניסיון</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${localProfile?.has_used_trial_class ? 'bg-red-400' : 'bg-green-400'}`}></div>
                        <span className="text-xs sm:text-sm text-[#4B2E83]/80">סטטוס שיעור ניסיון</span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className={`text-xs font-semibold ${localProfile?.has_used_trial_class ? 'text-red-500' : 'text-green-500'}`}>
                          {localProfile?.has_used_trial_class ? 'נוצל' : 'זמין לך'}
                        </span>
                        {!localProfile?.has_used_trial_class && user && (
                          <Link
                            to="/class/trial-class"
                            className="bg-green-500 text-white px-1.5 sm:px-2 py-0.5 rounded-md hover:bg-green-600 transition-colors text-xs font-medium"
                          >
                            הרשמה
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Credits Status */}
                  <div className="bg-white/50 backdrop-blur-sm rounded-lg sm:rounded-xl p-2.5 sm:p-3 border border-white/20">
                    <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                      <span className="text-xs font-medium text-[#4B2E83]/60 uppercase tracking-wide">יתרה</span>
                      <div className="flex items-center gap-1">
                        <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${subscriptionCredits > 0 ? 'bg-green-400' : 'bg-red-400'}`}></div>
                        <span className="text-xs text-[#4B2E83]/70">
                          {subscriptionCredits > 0 ? 'פעיל' : 'לא זמין'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm text-[#4B2E83]/80">שיעורים זמינים</span>
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="text-sm sm:text-lg font-bold text-[#4B2E83]">{subscriptionCredits}</span>
                        {subscriptionCredits > 0 && (
                          <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="lg:col-span-2">
            <ProfileTabs
              user={user}
              localProfile={localProfile}
              formData={formData}
              isEditing={isEditing}
              isLoading={isLoading}
              onInputChange={handleInputChange}
              onSubmit={handleSubmit}
              onToggleEdit={() => setIsEditing(!isEditing)}
              session={session}
              onClassesCountUpdate={fetchClassesCount}
              onCreditsUpdate={fetchSubscriptionCredits}
            />
          </div>
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
    </div>
  );
}

export default UserProfile; 