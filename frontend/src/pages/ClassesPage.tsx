import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaClock, FaUserGraduate, FaArrowLeft, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { classesService } from '../lib/classes';
import { Class } from '../types/class';
import { getSimpleColorScheme } from '../utils/colorUtils';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { UserProfile } from '../types/auth';

function ClassesPage() {
  const { profile: contextProfile, user, session, loading: authLoading } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localProfile, setLocalProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const data = await classesService.getAllClasses();
        setClasses(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch classes');
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  // טעינת פרופיל - כמו ב-UserProfile
  useEffect(() => {
    // איפוס מצב הטעינה כאשר המשתמש משתנה
    setIsLoadingProfile(false);
    
    // רק אם יש משתמש ולא בטעינה
    if (!user || authLoading) {
      return;
    }
    
    // אם יש פרופיל מה-context, נשתמש בו
    if (contextProfile) {
      setLocalProfile(contextProfile);
      return;
    }
    
    // אם אין פרופיל מה-context, נטען ישירות
    const loadProfileWithFetch = async () => {
      try {
        setIsLoadingProfile(true);
        
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
  }, [user?.id, authLoading, contextProfile, session]);

  // useEffect נוסף לטיפול בפרופיל שנטען מאוחר יותר
  useEffect(() => {
    if (contextProfile && !localProfile) {
      setLocalProfile(contextProfile);
    }
  }, [contextProfile, localProfile]);

  // Helper function to get route based on slug
  const getClassRoute = (slug: string) => {
    return `/class/${slug}`;
  };

  // Helper function to render trial class status
  const renderTrialClassStatus = (classItem: Class) => {
    if (classItem.slug !== 'trial-class') return null;

    // אם המשתמש לא מחובר
    if (!user) {
      return (
        <div className="mt-3 p-2 bg-gray-100 rounded-lg">
          <div className="flex items-center justify-center text-gray-600 text-xs">
            <FaTimesCircle className="w-3 h-3 ml-1" />
            התחברי כדי לבדוק סטטוס
          </div>
        </div>
      );
    }

    // אם בטעינת פרופיל
    if (isLoadingProfile) {
      return (
        <div className="mt-3 p-2 bg-gray-100 rounded-lg">
          <div className="flex items-center justify-center text-gray-600 text-xs">
            <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-600 ml-1"></div>
            בודק סטטוס...
          </div>
        </div>
      );
    }

    // אם אין פרופיל אחרי ניסיון טעינה
    if (!localProfile && !contextProfile) {
      return (
        <div className="mt-3 p-2 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-center justify-center text-red-600 text-xs">
            <FaTimesCircle className="w-3 h-3 ml-1" />
            שגיאה בטעינת סטטוס
          </div>
        </div>
      );
    }

    // אם יש profile - הצג סטטוס
    const profile = localProfile || contextProfile;
    const hasUsedTrial = profile?.has_used_trial_class;
    
    return (
      <div className="mt-3 p-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600 font-medium">סטטוס שיעור ניסיון:</span>
          <div className="flex items-center">
            {hasUsedTrial ? (
              <>
                <FaTimesCircle className="w-3 h-3 text-red-500 ml-1" />
                <span className="text-xs text-red-600 font-semibold">נוצל</span>
              </>
            ) : (
              <>
                <FaCheckCircle className="w-3 h-3 text-green-500 ml-1" />
                <span className="text-xs text-green-600 font-semibold">זמין</span>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

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

  if (error) {
    return (
      <div className="min-h-screen bg-[#FDF9F6] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-agrandir-regular mb-4">שגיאה בטעינת השיעורים</p>
          <p className="text-[#2B2B2B] font-agrandir-regular">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-[#EC4899] text-white px-4 py-2 rounded-lg hover:bg-[#EC4899]/90 transition-colors"
          >
            נסה שוב
          </button>
        </div>
      </div>
    );
  }

  // קבל את הפרופיל הנכון (local או context)
  const profile = localProfile || contextProfile;

  return (
    <div className="min-h-screen bg-[#FDF9F6] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              
              return (
                <div 
                  key={classItem.id} 
                  className={`bg-white rounded-2xl overflow-hidden shadow-xl transform hover:scale-105 transition-all duration-300 h-full lg:flex lg:flex-col ${
                    isTrialClass && profile?.has_used_trial_class ? 'opacity-75' : ''
                  }`}
                >
                  <div className="relative h-40 lg:h-48 hidden lg:block">
                    <img
                      src={classItem.image_url || '/carousel/image1.png'}
                      alt={classItem.name}
                      className="w-full h-full object-cover"
                    />

                    <div className="absolute bottom-3 right-3">
                      <span className={`${colorScheme.bgColor} text-white px-3 py-1 rounded-full text-xs font-medium`}>
                        {classItem.price} ש"ח
                      </span>
                    </div>
                    
                    {/* סטטוס שיעור ניסיון על התמונה */}
                    {isTrialClass && user && profile && (
                      <div className="absolute top-3 right-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          profile.has_used_trial_class 
                            ? 'bg-red-500 text-white' 
                            : 'bg-green-500 text-white'
                        }`}>
                          {profile.has_used_trial_class ? 'נוצל' : 'זמין'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4 lg:p-6 lg:flex lg:flex-col lg:h-full lg:pt-6 pt-4">
                    <h3 className={`text-lg lg:text-xl font-bold ${colorScheme.textColor} mb-3 font-agrandir-grand`}>
                      {classItem.name}
                    </h3>
                    <div className="h-16 lg:h-20 mb-4">
                      <p className="text-[#2B2B2B] font-agrandir-regular leading-relaxed text-xs lg:text-sm line-clamp-3">
                        {classItem.description}
                      </p>
                    </div>
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
                    
                    {/* הצג סטטוס שיעור ניסיון בתוך הכרטיס */}
                    {isTrialClass && renderTrialClassStatus(classItem)}
                    
                    <div className="lg:mt-auto">
                      <Link
                        to={route}
                        className={`inline-flex items-center justify-center w-full ${colorScheme.bgColor} ${colorScheme.hoverColor} text-white px-3 lg:px-4 py-2 rounded-xl transition-colors duration-300 font-medium text-xs lg:text-sm ${
                          isTrialClass && profile?.has_used_trial_class ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        onClick={(e) => {
                          if (isTrialClass && profile?.has_used_trial_class) {
                            e.preventDefault();
                            alert('כבר השתמשת בשיעור ניסיון. לא ניתן להזמין שיעור ניסיון נוסף.');
                          }
                        }}
                      >
                        {isTrialClass && profile?.has_used_trial_class ? 'נוצל' : 'הרשמה'}
                        <FaArrowLeft className="w-2.5 h-2.5 lg:w-3 lg:h-3 mr-2" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* הצג שיעור ניסיון רק אם המשתמש לא השתמש בו עדיין */}
        {user && profile && !profile.has_used_trial_class && (
          <div className="mt-20 bg-gradient-to-r from-[#EC4899] to-[#EC4899] rounded-2xl p-12 text-center shadow-xl">
            <h2 className="text-3xl font-bold text-white mb-6 font-agrandir-grand">
              רוצה להתנסות?
            </h2>
            <p className="text-white/90 text-xl mb-8 font-agrandir-regular max-w-2xl mx-auto">
              הזמיני שיעור ניסיון במחיר מיוחד של 60 ש"ח וקבלי טעימה מחוויה מקצועית
            </p>
            <Link
              to="/class/trial-class"
              className="inline-flex items-center justify-center bg-white text-[#EC4899] px-8 py-4 rounded-xl hover:bg-white/90 transition-colors duration-300 font-medium text-lg"
            >
              הזמיני שיעור ניסיון
              <FaArrowLeft className="w-5 h-5 mr-2" />
            </Link>
          </div>
        )}
        
        {/* הצג הודעה אם כבר השתמש בשיעור ניסיון */}
        {user && profile && profile.has_used_trial_class && (
          <div className="mt-20 bg-gradient-to-r from-gray-400 to-gray-500 rounded-2xl p-12 text-center shadow-xl">
            <h2 className="text-3xl font-bold text-white mb-6 font-agrandir-grand">
              כבר התנסית?
            </h2>
            <p className="text-white/90 text-xl mb-8 font-agrandir-regular max-w-2xl mx-auto">
              כבר השתמשת בשיעור ניסיון. הזמיני שיעור רגיל כדי להמשיך להתקדם
            </p>
            <Link
              to="/classes"
              className="inline-flex items-center justify-center bg-white text-gray-600 px-8 py-4 rounded-xl hover:bg-white/90 transition-colors duration-300 font-medium text-lg"
            >
              לכל השיעורים
              <FaArrowLeft className="w-5 h-5 mr-2" />
            </Link>
          </div>
        )}

        {/* הצג הודעה למשתמש לא מחובר */}
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