import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../hooks/useProfile';
import ProfileTabs from '../components/profile/ProfileTabs';
import type { UserProfile } from '../types/auth';
import { registrationsService } from '../lib/registrations';

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

  // useEffect לטעינת ספירת השיעורים
  useEffect(() => {
    if (user && session && !authLoading) {
      fetchClassesCount();
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFF5F9] via-[#FDF9F6] to-[#FFF5F9] pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#EC4899] mx-auto mb-4"></div>
            <p className="text-lg text-[#4B2E83]/70">טוען...</p>
          </div>
        </div>
      </div>
    );
  }

  // No user state - redirect to home
  if (!user && !authLoading) {
    navigate('/');
    return null;
  }

  // Loading state
  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFF5F9] via-[#FDF9F6] to-[#FFF5F9] pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#EC4899] mx-auto mb-4"></div>
            <p className="text-lg text-[#4B2E83]/70">טוען פרופיל...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (profileError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFF5F9] via-[#FDF9F6] to-[#FFF5F9] pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#4B2E83] mb-2">שגיאה בטעינת הפרופיל</h3>
            <p className="text-[#4B2E83]/70 mb-6">{profileError}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded-xl font-medium hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300"
            >
              נסה שוב
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF5F9] via-[#FDF9F6] to-[#FFF5F9] pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#4B2E83] mb-4 font-agrandir-grand">
            הפרופיל שלי
          </h1>
          <p className="text-lg text-[#4B2E83]/70 max-w-2xl mx-auto">
            כאן תוכלי לנהל את הפרטים האישיים שלך ולעדכן את המידע שלך במערכת
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#EC4899]/10">
              {/* Profile Header */}
              <div className="bg-gradient-to-r from-[#EC4899] to-[#4B2E83] px-8 py-12 text-center relative">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10">
                  {/* Profile Picture */}
                  <div className="relative mx-auto mb-6 flex justify-center">
                    <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30 shadow-2xl overflow-hidden">
                      {(user?.user_metadata?.avatar_url || user?.user_metadata?.picture) ? (
                        <img 
                          src={user.user_metadata?.avatar_url || user.user_metadata?.picture} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // אם התמונה לא נטענת, נציג אייקון ברירת מחדל
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`w-full h-full bg-gradient-to-br from-white/30 to-white/10 flex items-center justify-center ${(user?.user_metadata?.avatar_url || user?.user_metadata?.picture) ? 'hidden' : ''}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                      </div>
                    </div>
                    {isEditing && (
                      <button
                        type="button"
                        className="absolute bottom-2 right-2 bg-white p-3 rounded-full shadow-lg hover:bg-gray-50 transition-all duration-200 hover:scale-110"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#EC4899]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </button>
                    )}
                  </div>
                  
                  {/* User Info */}
                  <h2 className="text-2xl font-bold text-white mb-2 font-agrandir-grand">
                    {`${formData.firstName} ${formData.lastName}`.trim() || 'משתמשת חדשה'}
                  </h2>
                  <p className="text-white/80 text-sm">
                    {formData.email}
                  </p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-4 bg-gradient-to-br from-[#EC4899]/5 to-[#4B2E83]/5 rounded-2xl relative group">
                    <div className="text-2xl font-bold text-[#EC4899]">{classesCount}</div>
                    <div className="text-sm text-[#4B2E83]/70 mb-2 h-8 flex items-center justify-center">השיעורים שלי</div>
                    <button
                      onClick={() => window.open(`${window.location.origin}/classes`, '_blank')}
                      className="w-full px-3 py-2 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white text-xs rounded-lg font-medium hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300 hover:scale-105 shadow-md cursor-pointer"
                    >
                      הרשמה לשיעור
                    </button>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-[#4B2E83]/5 to-[#EC4899]/5 rounded-2xl relative group">
                    <div className="text-2xl font-bold text-[#4B2E83]">0</div>
                    <div className="text-sm text-[#4B2E83]/70 mb-2 h-8 flex items-center justify-center">הזמנות שהזמנתי</div>
                    <button
                      onClick={() => window.open(`${window.location.origin}/shop`, '_blank')}
                      className="w-full px-3 py-2 bg-gradient-to-r from-[#4B2E83] to-[#EC4899] text-white text-xs rounded-lg font-medium hover:from-[#EC4899] hover:to-[#4B2E83] transition-all duration-300 hover:scale-105 shadow-md cursor-pointer"
                    >
                      לקנייה בחנות
                    </button>
                  </div>
                </div>

                {/* Admin Dashboard Link - רק למנהלים */}
                {localProfile?.role === 'admin' && (
                  <div className="mb-6">
                    <Link
                      to="/admin"
                      className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm rounded-xl font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-300 hover:scale-105 shadow-md flex items-center justify-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      דשבורד מנהלים
                    </Link>
                  </div>
                )}

                {/* Additional Info */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5 rounded-xl">
                    <span className="text-sm text-[#4B2E83]/70">תאריך הצטרפות:</span>
                    <span className="text-sm font-semibold text-[#4B2E83]">
                      {user ? new Date(user.created_at).toLocaleDateString('he-IL') : ''}
                    </span>
                  </div>
                  
                  {/* הוספת סטטוס שיעור ניסיון */}
                  <div className="relative p-3 bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5 rounded-xl">
                    {/* כפתור הרשמה בפינה השמאלית העליונה */}
                    {!localProfile?.has_used_trial_class && user && (
                      <Link
                        to="/class/trial-class"
                        className="absolute top-2 left-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1.5 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 text-xs font-medium shadow-md hover:shadow-lg transform hover:scale-105"
                      >
                        הרשמה לשיעור ניסיון                       </Link>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#4B2E83]/70">שיעור ניסיון:</span>
                      <span className={`text-sm font-semibold ${localProfile?.has_used_trial_class ? 'text-red-600' : 'text-green-600'}`}>
                        {localProfile?.has_used_trial_class ? 'נוצל' : 'לא נוצל עדיין'}
                      </span>
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
            />
          </div>
        </div>
      </div>

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl border border-[#EC4899]/10">
            <div className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#4B2E83] mb-2">הצלחה!</h3>
              <p className="text-[#4B2E83]/70 mb-6">הפרופיל עודכן בהצלחה</p>
              <button
                onClick={() => setShowSuccessPopup(false)}
                className="px-6 py-3 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded-xl font-medium hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300"
              >
                אישור
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Popup */}
      {showErrorPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl border border-red-200">
            <div className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#4B2E83] mb-2">שגיאה</h3>
              <p className="text-[#4B2E83]/70 mb-6">{errorMessage}</p>
              <button
                onClick={() => setShowErrorPopup(false)}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium hover:from-red-600 hover:to-red-700 transition-all duration-300"
              >
                אישור
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserProfile; 