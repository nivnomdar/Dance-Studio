import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FaClock, FaUserGraduate, FaMapMarkerAlt, FaArrowLeft, FaCalendarAlt, FaUsers, FaSignInAlt } from 'react-icons/fa';
import { FaWaze } from 'react-icons/fa';
import { classesService } from '../lib/classes';
import { registrationsService } from '../lib/registrations';
import { Class } from '../types/class';
import { useAuth } from '../contexts/AuthContext';
import { usePopup } from '../contexts/PopupContext';
import { supabase } from '../lib/supabase';
import {
  getAvailableDatesForButtonsFromSessions,
  getAvailableTimesForDateFromSessions,
  getAvailableSpotsFromSessions,
  getAvailableDatesMessageFromSessions,
  getAvailableSpotsBatchFromSessions,
  clearSessionsCache
} from '../utils/sessionsUtils';

import { getColorScheme } from '../utils/colorUtils';
import type { UserProfile } from '../types/auth';
import { SkeletonBox, SkeletonText, SkeletonIcon, SkeletonInput, SkeletonButton } from './skeleton/SkeletonComponents';
import { apiService } from '../lib/api';
import { DEBOUNCE_DELAYS } from '../utils/constants';

// Class Detail Skeleton Components
const ClassDetailHeaderSkeleton = () => (
  <div className="text-center mb-8 lg:mb-12">
    {/* Back button */}
    <div className="flex items-center justify-center mb-4 lg:mb-6">
      <SkeletonIcon className="ml-2" />
      <SkeletonBox className="h-4 w-24" />
    </div>
    
    {/* Title */}
    <SkeletonBox className="h-12 mb-6 w-3/4 mx-auto" />
    
    {/* Divider */}
    <SkeletonBox className="w-24 h-1 mx-auto mb-8" />
    
    {/* Description */}
    <div className="space-y-2 max-w-3xl mx-auto">
      <SkeletonBox className="h-4" />
      <SkeletonBox className="h-4 w-5/6" />
    </div>
  </div>
);

const ClassDetailInfoSkeleton = () => (
  <div className="space-y-6 lg:space-y-8">
    {/* Hero Image */}
    <SkeletonBox className="h-80 rounded-2xl hidden lg:block" />

    {/* Class Information */}
    <div className="bg-white rounded-2xl p-8 shadow-lg">
      <SkeletonBox className="h-8 mb-6 w-1/3" />
      <div className="space-y-6">
        <SkeletonText lines={3} />
        
        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 lg:gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-start">
              <SkeletonBox className="w-6 h-6 ml-3 mt-1" />
              <div className="flex-1">
                <SkeletonBox className="h-4 mb-2 w-3/4" />
                <SkeletonBox className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>

        {/* What's Included */}
        <div className="bg-gray-50 rounded-xl p-6">
          <SkeletonBox className="h-6 mb-4 w-1/2" />
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center">
                <SkeletonBox className="w-2 h-2 rounded-full ml-3" />
                <SkeletonBox className="h-3 w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const RegistrationFormSkeleton = () => (
  <div className="bg-white rounded-2xl p-8 shadow-lg h-fit">
    <SkeletonBox className="h-8 mb-6 w-2/3" />
    
    {/* Date Selection */}
    <div className="mb-6">
      <SkeletonBox className="h-4 mb-3 w-1/2" />
      <div className="grid grid-cols-3 gap-2 lg:gap-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <SkeletonBox key={index} className="h-16 rounded-xl" />
        ))}
      </div>
    </div>

    {/* Time Selection */}
    <div className="mb-6">
      <SkeletonBox className="h-4 mb-3 w-1/3" />
      <div className="grid grid-cols-3 gap-2 lg:gap-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <SkeletonBox key={index} className="h-12 rounded-xl" />
        ))}
      </div>
    </div>

    {/* Form Fields */}
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index}>
            <SkeletonBox className="h-4 mb-3 w-1/2" />
            <SkeletonInput />
          </div>
        ))}
      </div>
      
      <div>
        <SkeletonBox className="h-4 mb-3 w-1/3" />
        <SkeletonInput />
      </div>
      
      <div>
        <SkeletonBox className="h-4 mb-3 w-1/4" />
        <SkeletonInput />
      </div>
    </div>

    {/* Price Summary */}
    <div className="bg-gray-50 rounded-xl p-4 mb-6">
      <div className="flex justify-between items-center">
        <SkeletonBox className="h-5 w-1/3" />
        <SkeletonBox className="h-6 w-1/4" />
      </div>
    </div>

    {/* Submit Button */}
    <SkeletonButton className="h-14 w-full" />
  </div>
);

const ClassDetailSkeleton = () => (
  <div className="min-h-screen bg-[#FDF9F6] py-8 lg:py-16">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <ClassDetailHeaderSkeleton />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <ClassDetailInfoSkeleton />
        <RegistrationFormSkeleton />
      </div>
    </div>
  </div>
);

interface ClassDetailPageProps {
  initialClass?: Class;
}

function ClassDetailPage({ initialClass }: ClassDetailPageProps) {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { showPopup } = usePopup();
  const { user, loading: authLoading, session, profile: contextProfile, loadProfile } = useAuth();
  
  // State
  const [classData, setClassData] = useState<Class | null>(initialClass || null);
  const [loading, setLoading] = useState(!initialClass);
  const [error, setError] = useState<string | null>(null);
  const [localProfile, setLocalProfile] = useState<UserProfile | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [formData, setFormData] = useState({ first_name: '', last_name: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRegistrationSuccess, setShowRegistrationSuccess] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [usingFallbackMode, setUsingFallbackMode] = useState(false);

  // Cache for dates, times, spots
  const [datesCache, setDatesCache] = useState<{ [classId: string]: string[] }>({});
  const [timesCache, setTimesCache] = useState<{ [key: string]: string[] }>({}); // key: classId+date
  const [spotsCache, setSpotsCache] = useState<{ [key: string]: any }>({}); // key: classId+date
  const [datesMessage, setDatesMessage] = useState('');
  const [loadingDates, setLoadingDates] = useState(false);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [loadingSpots, setLoadingSpots] = useState<{ [key: string]: boolean }>({});
  const [registrations, setRegistrations] = useState<any[]>([]);

  // Derived
  const profile = localProfile || contextProfile;

  // Fetch class data
  useEffect(() => {
    if (initialClass) {
      setClassData(initialClass);
      setLoading(false);
      return;
    }
    if (!slug) {
      setError('לא נמצא מזהה שיעור');
      setLoading(false);
      return;
    }
    setLoading(true);
    classesService.getClassBySlug(slug)
      .then(data => {
        if (data) setClassData(data);
        else setError('השיעור לא נמצא');
      })
      .catch(err => setError(err instanceof Error ? err.message : 'שגיאה בטעינת השיעור'))
      .finally(() => setLoading(false));
  }, [slug, initialClass]);

  // Fetch available dates (with cache)
  useEffect(() => {
    if (!classData) return;
    const classId = classData.id;
    if (datesCache[classId]) return; // already cached
    setLoadingDates(true);
    const fetchDates = async () => {
      try {
        const dates = await getAvailableDatesForButtonsFromSessions(classId);
        const message = await getAvailableDatesMessageFromSessions(classId);
        setDatesCache(prev => ({ ...prev, [classId]: dates }));
        setDatesMessage(message);
      } catch (error: any) {
        if (error.message?.includes('429') || error.message?.includes('Too Many Requests')) {
          clearSessionsCache();
          setUsingFallbackMode(true);
          // Clear spots cache when switching to fallback mode
          setSpotsCache({});
          setLoadingSpots({});
        }
        // If sessions fail, show empty dates
        setDatesCache(prev => ({ ...prev, [classId]: [] }));
        setDatesMessage('אין תאריכים זמינים');
      } finally {
        setLoadingDates(false);
      }
    };
    fetchDates();
  }, [classData, usingFallbackMode, datesCache]);

  // Fetch available times (with cache)
  useEffect(() => {
    if (!classData || !selectedDate) return;
    const classId = classData.id;
    const key = classId + '_' + selectedDate;
    if (timesCache[key]) return;
    setLoadingTimes(true);
    const fetchTimes = async () => {
      try {
        const times = await getAvailableTimesForDateFromSessions(classId, selectedDate);
        setTimesCache(prev => ({ ...prev, [key]: times }));
      } catch (error: any) {
        if (error.message?.includes('429') || error.message?.includes('Too Many Requests')) {
          clearSessionsCache();
          setUsingFallbackMode(true);
          // Clear spots cache when switching to fallback mode
          setSpotsCache({});
          setLoadingSpots({});
        }
        // If sessions fail, show empty times
        setTimesCache(prev => ({ ...prev, [key]: [] }));
      } finally {
        setLoadingTimes(false);
      }
    };
    // Debounce
    const timeout = setTimeout(fetchTimes, 150);
    return () => clearTimeout(timeout);
  }, [classData, selectedDate, usingFallbackMode, timesCache]);

  // Fetch available spots for all times when date is selected (with batch API)
  useEffect(() => {
    if (!classData || !selectedDate) return;
    const classId = classData.id;
    const key = classId + '_' + selectedDate;
    if (spotsCache[key]) return; // Already cached
    
    setLoadingSpots(prev => ({ ...prev, [key]: true }));
    
    const fetchAllSpots = async () => {
      try {
        let spotsData;
        if (usingFallbackMode) {
          // Fallback: fetch spots individually for each time
          const times = timesCache[key] || [];
          const spotsPromises = times.map(async (time) => {
            const spots = await getAvailableSpotsFromSessions(classId, selectedDate, time);
            return { time, ...spots };
          });
          const spotsArray = await Promise.all(spotsPromises);
          spotsData = spotsArray.reduce((acc, spot) => {
            acc[spot.time] = { available: spot.available, message: spot.message };
            return acc;
          }, {} as any);
        } else {
          // Use new batch API
          spotsData = await getAvailableSpotsBatchFromSessions(classId, selectedDate);
        }
        
        setSpotsCache(prev => ({ ...prev, [key]: spotsData }));
      } catch (error: any) {
        if (error.message?.includes('429') || error.message?.includes('Too Many Requests')) {
          clearSessionsCache();
          setUsingFallbackMode(true);
          setSpotsCache({});
          setLoadingSpots({});
          // Retry with fallback mode
          const times = timesCache[key] || [];
          const spotsPromises = times.map(async (time) => {
            const spots = await getAvailableSpotsFromSessions(classId, selectedDate, time);
            return { time, ...spots };
          });
          const spotsArray = await Promise.all(spotsPromises);
          const spotsData = spotsArray.reduce((acc, spot) => {
            acc[spot.time] = { available: spot.available, message: spot.message };
            return acc;
          }, {} as any);
          setSpotsCache(prev => ({ ...prev, [key]: spotsData }));
        } else {
          // On other errors, show as available
          const times = timesCache[key] || [];
          const spotsData = times.reduce((acc, time) => {
            acc[time] = { available: classData.max_participants || 10, message: 'זמין' };
            return acc;
          }, {} as any);
          setSpotsCache(prev => ({ ...prev, [key]: spotsData }));
        }
      } finally {
        setLoadingSpots(prev => ({ ...prev, [key]: false }));
      }
    };
    
    // No debounce for batch API - load immediately
    fetchAllSpots();
  }, [classData, selectedDate, usingFallbackMode, spotsCache, timesCache]);

  // Load profile for trial class
  useEffect(() => {
    if (!user || authLoading || classData?.slug !== 'trial-class' || localProfile || contextProfile) return;
    const loadProfileWithFetch = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles?select=*&id=eq.${user.id}`, {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const profileDataArray = await response.json();
        if (profileDataArray.length > 0) setLocalProfile(profileDataArray[0]);
      } catch (error) { console.error('Error loading profile:', error); }
    };
    loadProfileWithFetch();
  }, [user?.id, authLoading, localProfile, contextProfile, session, classData?.slug]);

  // Load user's registrations
  useEffect(() => {
    if (!user || authLoading) return;
    const loadRegistrations = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/registrations/my`, {
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json'
          }
        });
        if (response.ok) {
          const data = await response.json();
          setRegistrations(data);
        }
      } catch (error) {
        console.error('Error loading registrations:', error);
      }
    };
    loadRegistrations();
  }, [user?.id, authLoading, session]);

  // Check available spots when time is selected
  useEffect(() => {
    if (selectedDate && selectedTime && classData && !usingFallbackMode) {
      // The spots are now fetched in the useEffect above, so we just need to update the cache
      // and the state if it's not already there.
      const key = classData.id + '_' + selectedDate + '_' + selectedTime;
      if (!spotsCache[key]) {
        // This case should ideally not happen if spots are fetched correctly,
        // but as a fallback, we can re-fetch if the cache is empty.
        // For now, we rely on the useEffect above to handle this.
      }
    }
  }, [selectedDate, selectedTime, classData, usingFallbackMode, spotsCache]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // No need to clear timeouts here as they are managed by useEffect dependencies
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!classData) return;
    
    // Clear any previous errors
    setRegistrationError(null);
    
    // Client-side validation
    if (!formData.first_name.trim()) {
      setRegistrationError('שם פרטי הוא שדה חובה');
      return;
    }
    
    if (!formData.last_name.trim()) {
      setRegistrationError('שם משפחה הוא שדה חובה');
      return;
    }
    
    if (!formData.phone.trim()) {
      setRegistrationError('מספר טלפון הוא שדה חובה');
      return;
    }
    
    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length < 8) {
      setRegistrationError('מספר הטלפון חייב להכיל לפחות 8 ספרות');
      return;
    }
    
    if (!user?.email) {
      setRegistrationError('אין אימייל תקין לחשבון שלך. אנא ודאי שהחשבון שלך מקושר לאימייל תקין.');
      return;
    }
    
    if (!selectedDate) {
      setRegistrationError('יש לבחור תאריך לשיעור');
      return;
    }
    
    if (!selectedTime) {
      setRegistrationError('יש לבחור שעה לשיעור');
      return;
    }
    
    // בדיקה אם כבר נרשמת לשיעור זה בתאריך ובשעה האלה
    const existingRegistration = registrations?.find((reg: any) => 
      reg.class_id === classData.id && 
      reg.selected_date === selectedDate && 
      reg.selected_time === selectedTime &&
      reg.status === 'active'
    );
    
    if (existingRegistration) {
      // המרת פורמט התאריך מ-YYYY-MM-DD ל-DD-MM-YYYY
      const dateParts = selectedDate.split('-');
      const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
      setRegistrationError(`כבר נרשמת לשיעור זה בתאריך ${formattedDate} בשעה ${selectedTime}. אנא בחרי תאריך או שעה אחרת.`);
      return;
    }
    
    // בדיקה אם זה שיעור ניסיון והמשתמש כבר השתמש בו
    if (classData.slug === 'trial-class' && profile?.has_used_trial_class) {
      setRegistrationError('כבר השתמשת בשיעור ניסיון. לא ניתן להזמין שיעור ניסיון נוסף.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // קבלת session_id ו-session_class_id (אם קיימים)
      const spotsKey = classData.id + '_' + selectedDate;
      const spotsData = spotsCache[spotsKey] || {};
      let spotsInfo = spotsData[selectedTime];
      
      // אם אין spotsInfo, ננסה לקבל אותו שוב
      if (!spotsInfo) {
        try {
          spotsInfo = await getAvailableSpotsFromSessions(classData.id, selectedDate, selectedTime);
        } catch (spotsError) {
          // Create a fallback spotsInfo with basic data
          spotsInfo = { 
            available: classData.max_participants || 10, 
            message: 'זמין',
            sessionId: undefined,
            sessionClassId: undefined
          };
        }
      }
      
      // בדיקה שיש email תקין
      if (!user?.email) {
        setRegistrationError('אין אימייל תקין לחשבון שלך. אנא ודאי שהחשבון שלך מקושר לאימייל תקין.');
        setIsSubmitting(false);
        return;
      }

      const registrationData = {
        class_id: classData.id,
        ...(spotsInfo?.sessionId && { session_id: spotsInfo.sessionId }),
        ...(spotsInfo?.sessionClassId && { session_class_id: spotsInfo.sessionClassId }),
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        email: user.email,
        selected_date: selectedDate,
        selected_time: selectedTime
      };
      
      // שליחה לשרת
      const result = await registrationsService.createRegistration(registrationData, session?.access_token);
      
      // אם זה שיעור ניסיון, עדכן את הפרופיל בצורה אסינכרונית
      if (classData.slug === 'trial-class') {
        updateProfileTrialClass().catch(error => {
          console.error('Error updating trial class status:', error);
        });
      }
      
      // הצגת אישור הרשמה במרכז המסך
      setShowRegistrationSuccess(true);
      
      // רענון רשימת ההרשמות
      const loadRegistrations = async () => {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/registrations/my`, {
            headers: {
              'Authorization': `Bearer ${session?.access_token}`,
              'Content-Type': 'application/json'
            }
          });
          if (response.ok) {
            const data = await response.json();
            setRegistrations(data);
          }
        } catch (error) {
          console.error('Error refreshing registrations:', error);
        }
      };
      loadRegistrations();
      
      // איפוס הטופס
      setFormData({ first_name: '', last_name: '', phone: '' });
      setSelectedDate('');
      setSelectedTime('');
      
      // איפוס מצב הטעינה
      setIsSubmitting(false);
      
    } catch (error) {
      console.error('ClassDetailPage: Registration error:', error);
      
      // Parse error message
      let errorMessage = 'אירעה שגיאה בעת ביצוע ההרשמה. אנא נסי שוב.';
      
      if (error instanceof Error) {
        if (error.message.includes('Already registered') || error.message.includes('Already registered for this class')) {
          errorMessage = 'כבר נרשמת לשיעור זה בתאריך ובשעה שנבחרו. אנא בחרי תאריך או שעה אחרת.';
        } else if (error.message.includes('Failed to create registration')) {
          // Extract the actual error message from the backend
          const match = error.message.match(/Failed to create registration: (.+)/);
          if (match) {
            errorMessage = match[1];
          }
        } else if (error.message.includes('HTTP 400')) {
          // Try to get more specific error from the response
          errorMessage = 'שגיאה בהרשמה. ייתכן שכבר נרשמת לשיעור זה או שיש בעיה בנתונים.';
        }
      }
      
      setRegistrationError(errorMessage);
      setIsSubmitting(false);
    }
  };

  // פונקציה חדשה לעדכון הפרופיל
  const updateProfileTrialClass = async () => {
    if (!user || !session) return;
    
    try {
      const updateResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          has_used_trial_class: true
        })
      });
      
      if (updateResponse.ok) {
        // רענון הפרופיל בקונטקסט
        await loadProfile();
      }
    } catch (error) {
      console.error('Error updating trial class status:', error);
    }
  };

  // פונקציה לטיפול בהתחברות
  const handleLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });
      
      if (error) throw error;
    } catch (error) {
      // Handle login error silently or show user-friendly message
    }
  };

  // בדיקה אם זה שיעור ניסיון והמשתמש כבר השתמש בו - חסימת גישה
  if (classData?.slug === 'trial-class' && user && !authLoading && profile?.has_used_trial_class) {
    return (
      <div className="min-h-screen bg-[#FDF9F6] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 shadow-lg">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-red-600 mb-4 font-agrandir-grand">
              גישה נחסמה
            </h1>
            <p className="text-red-700 mb-6 font-agrandir-regular">
              כבר השתמשת בשיעור ניסיון. לא ניתן לגשת לשיעור ניסיון נוסף.
            </p>
            <Link 
              to="/classes" 
              className="inline-flex items-center bg-red-500 text-white px-6 py-3 rounded-xl hover:bg-red-600 transition-colors duration-200 font-medium"
            >
              <FaArrowLeft className="w-4 h-4 ml-2" />
              חזרה לשיעורים
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // הצג מסך טעינה רק אם טוענים את השיעור עצמו
  if (loading) {
    return <ClassDetailSkeleton />;
  }

  // אם אין נתוני שיעור עדיין, הצג skeleton
  if (!classData) {
    return <ClassDetailSkeleton />;
  }

  // אם זה שיעור ניסיון והמשתמש מחובר אבל אין פרופיל - חכה לטעינת הפרופיל
  if (classData.slug === 'trial-class' && user && !localProfile && !contextProfile && !authLoading) {
    return <ClassDetailSkeleton />;
  }

  if (error || !classData) {
    return (
      <div className="min-h-screen bg-[#FDF9F6] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-agrandir-regular mb-4">שגיאה בטעינת השיעור</p>
          <p className="text-[#2B2B2B] font-agrandir-regular">{error}</p>
          <Link 
            to="/classes" 
            className="mt-4 bg-[#EC4899] text-white px-4 py-2 rounded-lg hover:bg-[#EC4899]/90 transition-colors"
          >
            חזרה לשיעורים
          </Link>
        </div>
      </div>
    );
  }

  // בדף פרטי שיעור - תמיד ורוד
  const colors = getColorScheme('pink');

  return (
    <div className="min-h-screen bg-[#FDF9F6] py-8 lg:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 lg:mb-12">
          <Link 
            to="/classes" 
            className="inline-flex items-center text-[#EC4899] hover:text-[#EC4899]/80 mb-4 lg:mb-6 transition-colors duration-200 relative z-10"
          >
            <FaArrowLeft className="w-4 h-4 ml-2" />
            חזרה לשיעורים
          </Link>
          <h1 className="text-5xl font-bold text-[#EC4899] mb-6 font-agrandir-grand">
            {classData.name}
          </h1>
          <div className="w-24 h-1 bg-[#EC4899] mx-auto mb-8"></div>
          <p className="text-xl text-[#2B2B2B] max-w-3xl mx-auto font-agrandir-regular leading-relaxed">
            {classData.description}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Class Details */}
          <div className="space-y-6 lg:space-y-8">
            {/* Hero Image */}
            <div className="relative h-80 rounded-2xl overflow-hidden shadow-xl hidden lg:block">
              <img
                src={classData.image_url || '/carousel/image1.png'}
                alt={classData.name}
                className="w-full h-full object-cover"
              />

              <div className="absolute top-4 right-4">
                <span className={`${colors.bgColor} text-white px-5 py-1 rounded-xl text-lg font-bold shadow-lg`}>
                  {classData.price} ש"ח
                </span>
              </div>
            </div>

            {/* Class Information */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className={`text-3xl font-bold ${colors.textColor} mb-6 font-agrandir-grand`}>
                על השיעור
              </h2>
              <div className="space-y-6">
                <p className="text-[#2B2B2B] text-lg leading-relaxed font-agrandir-regular">
                  {classData.long_description || classData.description}
                </p>
                
                <div className="grid grid-cols-2 lg:grid-cols-2 gap-4 lg:gap-6">
                  {classData.duration && (
                    <div className={`flex items-start ${colors.textColor}`}>
                      <FaClock className="w-6 h-6 ml-3 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-bold">משך השיעור</p>
                        <p className="text-[#2B2B2B]">{classData.duration} דקות</p>
                      </div>
                    </div>
                  )}
                  {classData.level && (
                    <div className={`flex items-start ${colors.textColor}`}>
                      <FaUserGraduate className="w-6 h-6 ml-3 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-bold">רמה</p>
                        <p className="text-[#2B2B2B]">{classData.level}</p>
                      </div>
                    </div>
                  )}
                  {classData.max_participants && (
                    <div className={`flex items-start ${colors.textColor}`}>
                      <FaUsers className="w-6 h-6 ml-3 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-bold">גודל קבוצה</p>
                        <p className="text-[#2B2B2B]">עד {classData.max_participants} משתתפות</p>
                      </div>
                    </div>
                  )}
                  <div className={`flex items-start ${colors.textColor}`}>
                    <FaMapMarkerAlt className="w-6 h-6 ml-3 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-bold">מיקום הסטודיו</p>
                      <p className="text-[#2B2B2B]"> יוסף לישנסקי 6, ראשון לציון</p>
                      <a 
                        href="https://ul.waze.com/ul?place=EitZb3NlZiBMaXNoYW5za2kgQmx2ZCwgUmlzaG9uIExlWmlvbiwgSXNyYWVsIi4qLAoUChIJyUzrhYSzAhURYAgXG887oa8SFAoSCf9mqyc4tAIVEbh6GldKxbwX&ll=31.99049600%2C34.76588500&navigate=yes&utm_campaign=default&utm_source=waze_website&utm_medium=lm_share_location" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`${colors.textColor.replace('text-', 'text-').replace('-600', '-500')} hover:${colors.textColor} text-sm underline transition-colors duration-200 inline-flex items-center`}
                      >
                        <FaWaze className="w-4 h-4 ml-1" />
                        מיקום בוויז
                      </a>
                    </div>
                  </div>
                </div>

                {/* What's Included */}
                {classData.included && (
                  <div className={`${colors.lightBg} rounded-xl p-6`}>
                    <h3 className={`text-xl font-bold ${colors.textColor} mb-4 font-agrandir-grand`}>
                      מה כלול בשיעור?
                    </h3>
                    <ul className="space-y-2 text-[#2B2B2B]">
                      {classData.included.split('\n').map((item, index) => (
                        <li key={index} className="flex items-center">
                          <span className={`w-2 h-2 ${colors.bgColor} rounded-full ml-3`}></span>
                          {item.trim()}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Registration Form or Login Prompt */}
          <div className="bg-white rounded-2xl p-8 shadow-lg h-fit">
            {user ? (
              // משתמש מחובר - הצג טופס הרשמה
              <>
                <h2 className={`text-3xl font-bold ${colors.textColor} mb-6 font-agrandir-grand`}>
                  הרשמה ל{classData.name}
                </h2>
                
                {/* Error Display */}
                {registrationError && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="mr-3">
                        <h3 className="text-sm font-medium text-red-800">
                          שגיאה בהרשמה
                        </h3>
                        <div className="mt-2 text-sm text-red-700">
                          {registrationError}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Date Selection */}
                    <div>
                      <label className="block text-sm font-bold text-[#2B2B2B] mb-3">
                        <FaCalendarAlt className="w-4 h-4 inline ml-2" />
                        בחרי תאריך לשיעור *
                      </label>
                      <div className="grid grid-cols-3 gap-2 lg:gap-3">
                        {loadingDates ? (
                          <SkeletonBox className="h-16 rounded-xl" />
                        ) : datesCache[classData.id] ? (
                          datesCache[classData.id].map((date) => {
                            const dateObj = new Date(date);
                            const isSelected = selectedDate === date;
                            const today = new Date().toISOString().split('T')[0];
                            const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                            const isToday = date === today;
                            const isTomorrow = date === tomorrow;
                            
                            return (
                              <button
                                key={date}
                                type="button"
                                onClick={() => {
                                  setSelectedDate(date);
                                  setSelectedTime('');
                                  // Clear spots cache when changing date
                                  setSpotsCache({});
                                  setLoadingSpots({});
                                }}
                                className={`
                                  p-2 lg:p-3 py-4 lg:py-5 rounded-xl border-2 transition-all duration-200 text-xs lg:text-sm font-bold relative
                                  ${isSelected 
                                    ? `${colors.bgColor} ${colors.hoverColor} text-white border-transparent shadow-lg` 
                                    : 'bg-white border-gray-200 hover:border-gray-300 text-[#2B2B2B] hover:shadow-md'
                                  }
                                `}
                              >
                                {isToday && (
                                  <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md transform rotate-12">
                                    היום
                                  </div>
                                )}
                                {isTomorrow && (
                                  <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md transform rotate-12">
                                    מחר
                                  </div>
                                )}
                                <div className="text-center">
                                  <div>
                                    {dateObj.toLocaleDateString('he-IL', { 
                                      day: 'numeric', 
                                      month: 'numeric', 
                                      year: 'numeric' 
                                    })} - {dateObj.toLocaleDateString('he-IL', { weekday: 'short' })}
                                  </div>
                                </div>
                              </button>
                            );
                          })
                        ) : (
                          <div className="col-span-3 text-center text-gray-500">טוען תאריכים...</div>
                        )}
                      </div>
                    <p className="text-sm text-gray-500 mt-3 font-agrandir-regular">
                      {datesMessage}
                        </p>
                    </div>

                  {/* Time Selection - מוצג רק אחרי בחירת תאריך */}
                  {selectedDate && (
                    <div>
                      <label className="block text-sm font-bold text-[#2B2B2B] mb-3">
                        <FaClock className="w-4 h-4 inline ml-2" />
                        בחרי שעה לשיעור *
                      </label>
                      <div className="grid grid-cols-3 gap-2 lg:gap-3">
                        {loadingTimes ? (
                          Array.from({ length: 3 }).map((_, index) => (
                            <SkeletonBox key={index} className="h-12 rounded-xl" />
                          ))
                        ) : timesCache[classData.id + '_' + selectedDate] ? (
                          timesCache[classData.id + '_' + selectedDate].map((time) => {
                            const isSelected = selectedTime === time;
                            const spotsKey = classData.id + '_' + selectedDate;
                            const spotsData = spotsCache[spotsKey] || {};
                            const spotsInfo = spotsData[time] || { available: classData.max_participants || 10, message: 'זמין' };
                            const isLoading = loadingSpots[spotsKey];
                            
                            return (
                              <button
                                key={time}
                                type="button"
                                onClick={() => {
                                  setSelectedTime(time);
                                }}
                                disabled={spotsInfo?.available === 0}
                                title={spotsInfo?.message || ''}
                                className={`
                                  p-3 lg:p-4 py-4 lg:py-4 rounded-xl border-2 transition-all duration-200 text-base lg:text-lg font-bold relative
                                  ${isSelected 
                                    ? `${colors.bgColor} ${colors.hoverColor} text-white border-transparent shadow-lg` 
                                    : spotsInfo?.available === 0
                                    ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-white border-gray-200 hover:border-gray-300 text-[#2B2B2B] hover:shadow-md'
                                  }
                                `}
                              >
                                {/* Availability Patch - Top Right */}
                                {!isLoading && (
                                  <div className={`absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs font-bold shadow-md transform rotate-12 ${
                                    spotsInfo.available === 0 
                                      ? 'bg-red-500 text-white' 
                                      : spotsInfo.available === 1 
                                        ? 'bg-orange-500 text-white' 
                                        : 'bg-green-500 text-white'
                                  }`}>
                                    {spotsInfo.message?.includes('מקומות זמינים') 
                                      ? spotsInfo.message.replace(' מקומות זמינים', '') 
                                      : (spotsInfo.message || 'זמין')}
                                  </div>
                                )}
                                
                                {/* Loading Spinner - Top Right */}
                                {isLoading && (
                                  <div className="absolute -top-2 -right-2 bg-gray-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-md transform rotate-12">
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mx-auto"></div>
                                  </div>
                                )}
                                
                                <div className="text-center">
                                  <div>{time}</div>
                                </div>
                              </button>
                            );
                          })
                        ) : (
                          <div className="col-span-3 text-center text-gray-500">טוען שעות...</div>
                        )}
                      </div>
                      {selectedTime && (
                        <p className="text-sm text-gray-600 mt-2 font-agrandir-regular">
                          השעה שנבחרה: {selectedTime}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Personal Information */}
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-[#2B2B2B] mb-3">
                          שם פרטי *
                        </label>
                        <input
                          type="text"
                          value={formData.first_name}
                          onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                          className={`w-full px-4 py-3 border-2 border-gray-200 rounded-xl ${colors.focusRing} ${colors.focusBorder} transition-all duration-200 bg-white hover:border-gray-300 focus:border-${colors.textColor.replace('text-', '')} focus:shadow-lg text-right`}
                          placeholder="עדכני את שמך הפרטי"
                          dir="rtl"
                          required
                        />
                      </div>
                    <div>
                      <label className="block text-sm font-bold text-[#2B2B2B] mb-3">
                          שם משפחה *
                      </label>
                      <input
                        type="text"
                          value={formData.last_name}
                          onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                          className={`w-full px-4 py-3 border-2 border-gray-200 rounded-xl ${colors.focusRing} ${colors.focusBorder} transition-all duration-200 bg-white hover:border-gray-300 focus:border-${colors.textColor.replace('text-', '')} focus:shadow-lg text-right`}
                          placeholder="עדכני את שם המשפחה"
                          dir="rtl"
                        required
                      />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-[#2B2B2B] mb-3">
                        מספר טלפון *
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className={`w-full px-4 py-3 border-2 border-gray-200 rounded-xl ${colors.focusRing} ${colors.focusBorder} transition-all duration-200 bg-white hover:border-gray-300 focus:border-${colors.textColor.replace('text-', '')} focus:shadow-lg text-right`}
                        placeholder="למשל: 050-1234567"
                        dir="rtl"
                        pattern="[0-9\-\(\)\s]+"
                        minLength={8}
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1 font-agrandir-regular">
                        מספר טלפון עם לפחות 8 ספרות
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-[#2B2B2B] mb-3">
                        אימייל
                      </label>
                      <div className={`w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-right text-[#2B2B2B]`}>
                        {user?.email || 'לא זמין'}
                      </div>
                      <p className="text-xs text-gray-500 mt-1 font-agrandir-regular">
                        האימייל שלך מהחשבון המקושר
                      </p>
                    </div>
                  </div>

                  {/* Price Summary */}
                  <div className={`${colors.lightBg} rounded-xl p-4`}>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-[#2B2B2B]">מחיר {classData.name}:</span>
                      <span className={`text-2xl font-bold ${colors.textColor}`}>{classData.price} ש"ח</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      התשלום יתבצע בדף הבא
                    </p>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={!selectedDate || !selectedTime || !formData.first_name || !formData.last_name || !formData.phone || isSubmitting || (() => {
                      const spotsKey = classData.id + '_' + selectedDate;
                      const spotsData = spotsCache[spotsKey] || {};
                      const spotsInfo = spotsData[selectedTime];
                      return spotsInfo?.available === 0;
                    })()}
                    className={`w-full py-4 px-6 rounded-xl transition-colors duration-300 font-bold text-lg shadow-lg hover:shadow-xl ${
                      selectedDate && selectedTime && formData.first_name && formData.last_name && formData.phone && !isSubmitting && (() => {
                        const spotsKey = classData.id + '_' + selectedDate;
                        const spotsData = spotsCache[spotsKey] || {};
                        const spotsInfo = spotsData[selectedTime];
                        return spotsInfo?.available !== 0;
                      })()
                        ? `${colors.bgColor} ${colors.hoverColor} text-white`
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white ml-2"></div>
                        מבצע זימון שיעור...
                      </div>
                    ) : !selectedDate ? 'בחרי תאריך תחילה' : !selectedTime ? 'בחרי שעה' : !formData.first_name ? 'מלאי שם פרטי' : !formData.last_name ? 'מלאי שם משפחה' : !formData.phone ? 'מלאי מספר טלפון' : (() => {
                      const spotsKey = classData.id + '_' + selectedDate;
                      const spotsData = spotsCache[spotsKey] || {};
                      const spotsInfo = spotsData[selectedTime];
                      if (spotsInfo?.available === 0) {
                        return 'מלא - אין מקומות זמינים';
                      }
                      return `הזמיני ${classData.name}`;
                    })()}
                  </button>
                </form>

                {/* Additional Info */}
                <div className="mt-6 text-sm text-gray-600 space-y-2">
                  <p>✓ ביטול חינם עד 48 שעות לפני השיעור</p>
                  <p>✓ גמישות בבחירת התאריך והשעה</p>
                </div>
              </>
            ) : (
              // משתמש לא מחובר - הצג הודעת התחברות
              <div className="text-center py-8">
                <div className={`w-16 h-16 ${colors.bgColor} rounded-full flex items-center justify-center mx-auto mb-6`}>
                  <FaSignInAlt className="w-8 h-8 text-white" />
                </div>
                
                <h2 className={`text-2xl font-bold ${colors.textColor} mb-4 font-agrandir-grand`}>
                  התחברי להזמנת שיעור
                </h2>
                
                <p className="text-[#2B2B2B] mb-6 font-agrandir-regular leading-relaxed">
                  כדי להזמין שיעור, עלייך להתחבר למערכת תחילה. 
                  ההתחברות מהירה ובטוחה באמצעות Google.
                </p>

                <div className={`${colors.lightBg} rounded-xl p-4 mb-6`}>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-[#2B2B2B]">מחיר {classData.name}:</span>
                    <span className={`text-2xl font-bold ${colors.textColor}`}>{classData.price} ש"ח</span>
                  </div>
                </div>

                <button
                  onClick={handleLogin}
                  className={`w-full ${colors.bgColor} ${colors.hoverColor} text-white py-4 px-6 rounded-xl transition-colors duration-300 font-bold text-lg shadow-lg hover:shadow-xl flex items-center justify-center gap-3`}
                >
                  <img
                    src="https://www.google.com/favicon.ico"
                    alt="Google"
                    className="w-5 h-5"
                  />
                  התחברי עם Google להזמנה
                </button>

                <div className="mt-6 text-sm text-gray-600 space-y-2">
                  <p>✓ התחברות מהירה ובטוחה</p>
                  <p>✓ שמירת פרטי ההזמנה שלך</p>
                  <p>✓ גישה להיסטוריית השיעורים</p>
                  <p>✓ עדכונים על שיעורים חדשים</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Registration Success Modal */}
      {showRegistrationSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl transform transition-all">
            <div className="text-center">
              {/* Success Icon */}
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              {/* Title */}
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-agrandir-grand">
                ההרשמה בוצעה בהצלחה! 🎉
              </h2>
              
              {/* Message */}
              <p className="text-gray-600 mb-8 font-agrandir-regular leading-relaxed">
                ההרשמה שלך ל{classData?.name} נשמרה בהצלחה. 
                <br />
                פרטי ההזמנה שלך יהיו זמינים בדף הפרופיל האישי שלך.
              </p>
              
              {/* Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowRegistrationSuccess(false);
                    navigate('/profile');
                  }}
                  className="w-full bg-[#EC4899] hover:bg-[#EC4899]/90 text-white py-3 px-6 rounded-xl font-bold transition-colors duration-200"
                >
                  עבור לפרופיל שלי
                </button>
                
                <button
                  onClick={() => {
                    setShowRegistrationSuccess(false);
                    navigate('/');
                  }}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-medium transition-colors duration-200"
                >
                  חזור לדף הבית
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClassDetailPage; 