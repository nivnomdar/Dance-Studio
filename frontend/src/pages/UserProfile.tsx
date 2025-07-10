import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { UserProfile } from '../types/auth';

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
                    <div className="text-2xl font-bold text-[#EC4899]">0</div>
                    <div className="text-sm text-[#4B2E83]/70 mb-2 h-8 flex items-center justify-center">השיעורים שלי</div>
                    <button
                      onClick={() => window.open('http://localhost:5173/classes', '_blank')}
                      className="w-full px-3 py-2 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white text-xs rounded-lg font-medium hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300 hover:scale-105 shadow-md cursor-pointer"
                    >
                      הרשמה לשיעור
                    </button>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-[#4B2E83]/5 to-[#EC4899]/5 rounded-2xl relative group">
                    <div className="text-2xl font-bold text-[#4B2E83]">0</div>
                    <div className="text-sm text-[#4B2E83]/70 mb-2 h-8 flex items-center justify-center">הזמנות שהזמנתי</div>
                    <button
                      onClick={() => window.open('http://localhost:5173/shop', '_blank')}
                      className="w-full px-3 py-2 bg-gradient-to-r from-[#4B2E83] to-[#EC4899] text-white text-xs rounded-lg font-medium hover:from-[#EC4899] hover:to-[#4B2E83] transition-all duration-300 hover:scale-105 shadow-md cursor-pointer"
                    >
                      לקנייה בחנות
                    </button>
                  </div>
                </div>

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
                        {localProfile?.has_used_trial_class ? 'נוצל בעבר' : 'לא נוצל עדיין'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#EC4899]/10">
              {/* Form Header */}
              <div className="bg-gradient-to-r from-[#4B2E83] to-[#EC4899] px-8 py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-white font-agrandir-grand">
                      פרטים אישיים
                    </h3>
                    <p className="text-white/80 text-sm mt-1">
                      עדכני את המידע האישי שלך
                    </p>
                  </div>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                      isEditing 
                        ? 'bg-red-500 text-white hover:bg-red-600' 
                        : 'bg-white text-[#4B2E83] hover:bg-gray-50 hover:scale-105'
                    }`}
                  >
                    {isEditing ? 'ביטול עריכה' : 'עריכת פרופיל'}
                  </button>
                </div>
              </div>

              {/* Form Content */}
              <div className="p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">


                    {/* שם פרטי */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-[#4B2E83] mb-3">
                        <span className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          שם פרטי
                        </span>
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="הכניסי שם פרטי"
                        className="w-full px-3 py-2 rounded-xl border-2 border-[#4B2E83]/10 focus:border-[#EC4899] focus:ring-4 focus:ring-[#EC4899]/10 outline-none transition-all duration-200 disabled:bg-gray-50 disabled:text-gray-500 text-right"
                      />
                    </div>

                    {/* שם משפחה */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-[#4B2E83] mb-3">
                        <span className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          שם משפחה
                        </span>
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="הכניסי שם משפחה"
                        className="w-full px-3 py-2 rounded-xl border-2 border-[#4B2E83]/10 focus:border-[#EC4899] focus:ring-4 focus:ring-[#EC4899]/10 outline-none transition-all duration-200 disabled:bg-gray-50 disabled:text-gray-500 text-right"
                      />
                    </div>

                    {/* טלפון */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-[#4B2E83] mb-3">
                        <span className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          טלפון
                        </span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="הכניסי מספר טלפון"
                        className="w-full px-3 py-2 rounded-xl border-2 border-[#4B2E83]/10 focus:border-[#EC4899] focus:ring-4 focus:ring-[#EC4899]/10 outline-none transition-all duration-200 disabled:bg-gray-50 disabled:text-gray-500 text-right"
                      />
                    </div>

                    {/* אימייל */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-[#4B2E83] mb-3">
                        <span className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          אימייל
                        </span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        disabled
                        className="w-full px-3 py-2 rounded-xl border-2 border-[#4B2E83]/10 bg-gray-50 text-gray-500 text-right cursor-not-allowed"
                      />
                    </div>

                    {/* כתובת */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-[#4B2E83] mb-3">
                        <span className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          כתובת
                        </span>
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="הכניסי כתובת מלאה"
                        className="w-full px-3 py-2 rounded-xl border-2 border-[#4B2E83]/10 focus:border-[#EC4899] focus:ring-4 focus:ring-[#EC4899]/10 outline-none transition-all duration-200 disabled:bg-gray-50 disabled:text-gray-500 text-right"
                      />
                    </div>

                    {/* עיר */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-[#4B2E83] mb-3">
                        <span className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          עיר
                        </span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="הכניסי שם העיר"
                        className="w-full px-3 py-2 rounded-xl border-2 border-[#4B2E83]/10 focus:border-[#EC4899] focus:ring-4 focus:ring-[#EC4899]/10 outline-none transition-all duration-200 disabled:bg-gray-50 disabled:text-gray-500 text-right"
                      />
                    </div>

                    {/* מיקוד */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-[#4B2E83] mb-3">
                        <span className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          מיקוד
                        </span>
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="הכניסי מיקוד"
                        className="w-full px-3 py-2 rounded-xl border-2 border-[#4B2E83]/10 focus:border-[#EC4899] focus:ring-4 focus:ring-[#EC4899]/10 outline-none transition-all duration-200 disabled:bg-gray-50 disabled:text-gray-500 text-right"
                      />
                    </div>


                  </div>



                  {/* Submit Button */}
                  {isEditing && (
                    <div className="flex justify-end pt-6 border-t border-[#4B2E83]/10">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="px-8 py-4 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded-xl font-semibold hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        {isLoading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            שומר...
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            שמור שינויים
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>
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