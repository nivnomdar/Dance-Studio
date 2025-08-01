import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaClock, FaCalendarAlt, FaSignInAlt } from 'react-icons/fa';
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
import { throttledApiFetch } from '../utils/api';

interface StandardRegistrationProps {
  classData: Class;
}

const StandardRegistration: React.FC<StandardRegistrationProps> = ({ classData }) => {
  const navigate = useNavigate();
  const { showPopup } = usePopup();
  const { user, loading: authLoading, session, profile: contextProfile, loadProfile } = useAuth();
  
  // State
  const [localProfile, setLocalProfile] = useState<UserProfile | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [formData, setFormData] = useState({ first_name: '', last_name: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRegistrationSuccess, setShowRegistrationSuccess] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [usingFallbackMode, setUsingFallbackMode] = useState(false);

  // Prevent modal from closing automatically
  useEffect(() => {
    if (showRegistrationSuccess) {
      // Disable body scroll when modal is open
      document.body.style.overflow = 'hidden';
      
      return () => {
        // Re-enable body scroll when modal is closed
        document.body.style.overflow = 'unset';
      };
    }
  }, [showRegistrationSuccess]);

  // Cache for dates, times, spots
  const [datesCache, setDatesCache] = useState<{ [classId: string]: string[] }>({});
  const [timesCache, setTimesCache] = useState<{ [key: string]: string[] }>({}); // key: classId+date
  const [spotsCache, setSpotsCache] = useState<{ [key: string]: any }>({}); // key: classId+date
  const [datesMessage, setDatesMessage] = useState('');
  const [loadingDates, setLoadingDates] = useState(false);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [loadingSpots, setLoadingSpots] = useState<{ [key: string]: boolean }>({});
  const [registrations, setRegistrations] = useState<any[]>([]);

  // Derived - memoized for performance
  const profile = useMemo(() => localProfile || contextProfile, [localProfile, contextProfile]);

  // Function to load all data at once for better performance
  const loadAllData = useCallback(async (classId: string) => {
    try {
      setLoadingDates(true);
      setLoadingTimes(true);
      
      // Load dates and times in parallel
      const [dates, message] = await Promise.all([
        getAvailableDatesForButtonsFromSessions(classId),
        getAvailableDatesMessageFromSessions(classId)
      ]);
      
      setDatesCache(prev => ({ ...prev, [classId]: dates }));
      setDatesMessage(message);
      
      // If we have dates, load times for the first date
      if (dates.length > 0) {
        const firstDate = dates[0];
        const times = await getAvailableTimesForDateFromSessions(classId, firstDate);
        const key = classId + '_' + firstDate;
        setTimesCache(prev => ({ ...prev, [key]: times }));
      }
      
    } catch (error: any) {
      if (error.message?.includes('429') || error.message?.includes('Too Many Requests')) {
        clearSessionsCache();
        setUsingFallbackMode(true);
        setSpotsCache({});
        setLoadingSpots({});
      }
      setDatesCache(prev => ({ ...prev, [classId]: [] }));
      setDatesMessage('אין תאריכים זמינים');
    } finally {
      setLoadingDates(false);
      setLoadingTimes(false);
    }
  }, []);

  // Load data on component mount
  useEffect(() => {
    if (classData.id) {
      loadAllData(classData.id);
    }
  }, [classData.id, loadAllData]);

  // Fetch available times (with cache) - only when date is selected and not already cached
  useEffect(() => {
    if (!classData || !selectedDate) return;
    const classId = classData.id;
    const key = classId + '_' + selectedDate;
    if (timesCache[key]) return; // already cached
    
    setLoadingTimes(true);
    const fetchTimes = async () => {
      try {
        const times = await getAvailableTimesForDateFromSessions(classId, selectedDate);
        setTimesCache(prev => ({ ...prev, [key]: times }));
      } catch (error: any) {
        if (error.message?.includes('429') || error.message?.includes('Too Many Requests')) {
          clearSessionsCache();
          setUsingFallbackMode(true);
          setSpotsCache({});
          setLoadingSpots({});
        }
        setTimesCache(prev => ({ ...prev, [key]: [] }));
      } finally {
        setLoadingTimes(false);
      }
    };
    
    fetchTimes();
  }, [classData, selectedDate, usingFallbackMode, timesCache]);

  // Fetch available spots for all times when date is selected (with batch API)
  useEffect(() => {
    if (!classData || !selectedDate) return;
    const classId = classData.id;
    const key = classId + '_' + selectedDate;
    if (spotsCache[key]) return; // Already cached
    
    setLoadingSpots(prev => ({ ...prev, [key]: true }));
    
    const fetchAllSpots = async (retryCount = 0) => {
      try {
        let spotsData;
        if (usingFallbackMode) {
          // Fallback: fetch spots individually for each time
          const times = timesCache[key] || [];
          const spotsPromises = times.map(async (time) => {
            try {
              const spots = await getAvailableSpotsFromSessions(classId, selectedDate, time);
              return { time, ...spots };
            } catch (spotsError) {
              console.error('Error fetching spots for time:', time, spotsError);
              return { time, available: classData.max_participants || 10, message: 'זמין' };
            }
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
        console.error('Error in fetchAllSpots:', error);
        
        // Handle rate limiting
        if (error?.message?.includes('429') || error?.message?.includes('Too Many Requests')) {
          if (retryCount < 2) {
            setTimeout(() => fetchAllSpots(retryCount + 1), 5000 * (retryCount + 1));
            return;
          }
          
          // Switch to fallback mode after max retries
          clearSessionsCache();
          setUsingFallbackMode(true);
          setSpotsCache({});
          setLoadingSpots({});
          
          // Retry with fallback mode
          const times = timesCache[key] || [];
          const spotsPromises = times.map(async (time) => {
            try {
              const spots = await getAvailableSpotsFromSessions(classId, selectedDate, time);
              return { time, ...spots };
            } catch (spotsError) {
              console.error('Error fetching spots for time:', time, spotsError);
              return { time, available: classData.max_participants || 10, message: 'זמין' };
            }
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
    
    fetchAllSpots();
  }, [classData, selectedDate, usingFallbackMode, spotsCache, timesCache]);

  // Load profile data
  useEffect(() => {
    if (user && !authLoading) {
      if (contextProfile) {
        setLocalProfile(contextProfile);
        setFormData({
          first_name: contextProfile.first_name || '',
          last_name: contextProfile.last_name || '',
          phone: contextProfile.phone_number || ''
        });
      } else {
        const loadProfileWithFetch = async () => {
          try {
            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles?select=*&id=eq.${user.id}`, {
              headers: {
                'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${session?.access_token}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (response.ok) {
              const profileData = await response.json();
              if (profileData.length > 0) {
                const profile = profileData[0];
                setLocalProfile(profile);
                setFormData({
                  first_name: profile.first_name || '',
                  last_name: profile.last_name || '',
                  phone: profile.phone_number || ''
                });
              }
            }
          } catch (error) {
            console.error('Error loading profile:', error);
          }
        };
        loadProfileWithFetch();
      }
    }
  }, [user, authLoading, contextProfile, session?.access_token]);



  // Load user's registrations - only once per user session
  const registrationsLoadedRef = useRef(false);
  
  // Reset ref when user changes
  useEffect(() => {
    registrationsLoadedRef.current = false;
  }, [user?.id]);
  
  useEffect(() => {
    if (!user?.id || !session?.access_token || registrationsLoadedRef.current) return;
    let isMounted = true;
    const loadRegistrations = async () => {
      try {
        const response = await throttledApiFetch(`${import.meta.env.VITE_API_BASE_URL}/registrations/my`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });
        if (response.ok && isMounted) {
          const data = await response.json();
          setRegistrations(data);
          registrationsLoadedRef.current = true;
        }
      } catch (error) {
        if (isMounted) console.error('Error loading registrations:', error);
      }
    };
    loadRegistrations();
    return () => { isMounted = false; };
  }, [user?.id, session?.access_token]);

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
    const timeForBackend = selectedTime.includes('עד') ? 
      selectedTime.split('עד')[0].trim() : 
      selectedTime;
    
    const existingRegistration = registrations?.find((reg: any) => {
      if (reg.class_id !== classData.id || reg.selected_date !== selectedDate) {
        return false;
      }
      
      const regTime = reg.selected_time;
      const selectedTimeNormalized = timeForBackend;
      
      if (regTime === selectedTimeNormalized || 
          regTime === selectedTime ||
          regTime.includes(selectedTimeNormalized) ||
          selectedTimeNormalized.includes(regTime)) {
        return reg.status === 'active';
      }
      
      return false;
    });
    
    if (existingRegistration) {
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
      const spotsKey = classData.id + '_' + selectedDate;
      const spotsData = spotsCache[spotsKey] || {};
      let spotsInfo = spotsData[selectedTime];
      
      if (!spotsInfo) {
        try {
          spotsInfo = await getAvailableSpotsFromSessions(classData.id, selectedDate, selectedTime);
        } catch (spotsError) {
          spotsInfo = { 
            available: classData.max_participants || 10, 
            message: 'זמין',
            sessionId: undefined,
            sessionClassId: undefined
          };
        }
      }
      
      if (!user?.email) {
        setRegistrationError('אין אימייל תקין לחשבון שלך. אנא ודאי שהחשבון שלך מקושר לאימייל תקין.');
        setIsSubmitting(false);
        return;
      }

      const timeForBackend = selectedTime.includes('עד') ? 
        selectedTime.split('עד')[0].trim() : 
        selectedTime;
      
      const registrationData = {
        class_id: classData.id,
        ...(spotsInfo?.sessionId && { session_id: spotsInfo.sessionId }),
        ...(spotsInfo?.sessionClassId && { session_class_id: spotsInfo.sessionClassId }),
        // Always include session_class_id - the backend will handle finding/creating it
        session_class_id: spotsInfo?.sessionClassId || null,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        email: user.email,
        selected_date: selectedDate,
        selected_time: timeForBackend,
        used_credit: false, // Standard registration doesn't use credits
        credit_type: undefined, // No credit type for standard registrations
        purchase_price: classData.price // Store the actual price paid
      };
      
      const result = await registrationsService.createRegistration(registrationData, session?.access_token);
      
      if (classData.slug === 'trial-class') {
        updateProfileTrialClass().catch(error => {
          console.error('Error updating trial class status:', error);
        });
      }
      
      setShowRegistrationSuccess(true);
      
      setTimeout(() => {
        registrationsLoadedRef.current = false;
        setRegistrations(prev => [...(prev || [])]);
      }, 2000);
      
      setFormData({ first_name: '', last_name: '', phone: '' });
      setSelectedDate('');
      setSelectedTime('');
      
      setIsSubmitting(false);
      
    } catch (error) {
      console.error('StandardRegistration: Registration error:', error);
      
      let errorMessage = 'אירעה שגיאה בעת ביצוע ההרשמה. אנא נסי שוב.';
      
      if (error instanceof Error) {
        if (error.message.includes('Already registered') || error.message.includes('Already registered for this class')) {
          errorMessage = 'כבר נרשמת לשיעור זה בתאריך ובשעה שנבחרו. אנא בחרי תאריך או שעה אחרת.';
        } else if (error.message.includes('Failed to create registration')) {
          const match = error.message.match(/Failed to create registration: (.+)/);
          if (match) {
            errorMessage = match[1];
          }
        } else if (error.message.includes('HTTP 400')) {
          if (error.message.includes('Already registered for this class on this date and time')) {
            errorMessage = 'כבר נרשמת לשיעור זה בתאריך ובשעה שנבחרו. אנא בחרי תאריך או שעה אחרת.';
          } else {
            errorMessage = 'שגיאה בהרשמה. ייתכן שכבר נרשמת לשיעור זה או שיש בעיה בנתונים.';
          }
        }
      }
      
      setRegistrationError(errorMessage);
      setIsSubmitting(false);
    }
  };

  const updateProfileTrialClass = async () => {
    if (!user || !session) return;
    
    try {
      console.log(`Updating trial class status for user ${user.id}`);
      
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
        console.log(`Successfully updated trial class status for user ${user.id}`);
        await loadProfile();
      } else {
        console.error(`Failed to update trial class status for user ${user.id}:`, updateResponse.status, updateResponse.statusText);
      }
    } catch (error) {
      console.error('Error updating trial class status:', error);
    }
  };

  const handleLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/v1/callback`,
          queryParams: {
            access_type: 'offline',
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
      <div className="bg-white rounded-2xl p-8 shadow-lg h-fit">
        <div className="text-center">
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8">
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
              חזרה לשיעורים
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const colors = getColorScheme('pink');

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg h-fit">
      {user ? (
        <>
          <h2 className={`text-3xl font-bold ${colors.textColor} mb-6 font-agrandir-grand`}>
            הרשמה ל{classData.name}
          </h2>
          
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
              
              {/* Close button in top-right corner */}
              <button
                onClick={() => {
                  setShowRegistrationSuccess(false);
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                aria-label="סגור"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
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
                  Array.from({ length: 3 }).map((_, index) => (
                    <SkeletonBox key={index} className="h-16 rounded-xl" />
                  ))
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
                          setSpotsCache({});
                          setLoadingSpots({});
                        }}
                        className={`
                          p-1 lg:p-3 py-3 lg:py-5 rounded-xl border-2 transition-all duration-200 text-xs lg:text-sm font-bold relative h-16 flex items-center justify-center
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
                        <div className="text-center leading-tight">
                          <div className="text-xs lg:text-sm">
                            <div className="hidden sm:block">
                              {dateObj.toLocaleDateString('he-IL', { 
                                day: 'numeric', 
                                month: 'numeric', 
                                year: 'numeric' 
                              })} - {dateObj.toLocaleDateString('he-IL', { weekday: 'short' })}
                            </div>
                            <div className="sm:hidden">
                              <div>{dateObj.toLocaleDateString('he-IL', { 
                                day: 'numeric', 
                                month: 'numeric' 
                              })}</div>
                              <div className="text-xs">{dateObj.toLocaleDateString('he-IL', { weekday: 'short' })}</div>
                            </div>
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

            {/* Time Selection */}
            {selectedDate && (
              <div>
                <label className="block text-sm font-bold text-[#2B2B2B] mb-3">
                  <FaClock className="w-4 h-4 inline ml-2" />
                  בחרי שעה לשיעור *
                </label>
                <div className="grid grid-cols-3 gap-2 lg:gap-3">
                  {loadingTimes ? (
                    Array.from({ length: 3 }).map((_, index) => (
                      <SkeletonBox key={index} className="h-16 rounded-xl" />
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
                            p-1 lg:p-3 py-3 lg:py-5 rounded-xl border-2 transition-all duration-200 text-xs lg:text-sm font-bold relative h-16 flex items-center justify-center
                            ${isSelected 
                              ? `${colors.bgColor} ${colors.hoverColor} text-white border-transparent shadow-lg` 
                              : spotsInfo?.available === 0
                              ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                              : 'bg-white border-gray-200 hover:border-gray-300 text-[#2B2B2B] hover:shadow-md'
                            }
                          `}
                        >
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
                          
                          {isLoading && (
                            <div className="absolute -top-2 -right-2 bg-gray-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-md transform rotate-12">
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mx-auto"></div>
                            </div>
                          )}
                          
                          <div className="text-center leading-tight">
                            <div className="text-xs lg:text-sm">{time}</div>
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

      {/* Registration Success Modal */}
      {showRegistrationSuccess && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            // Prevent closing when clicking outside
            e.stopPropagation();
          }}
          onKeyDown={(e) => {
            // Prevent closing with Escape key
            if (e.key === 'Escape') {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
        >
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl transform transition-all">
            <div className="text-center">
              {/* Success Icon */}
              <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              {/* Title */}
              <h2 className="text-3xl font-bold text-gray-900 mb-4 font-agrandir-grand">
                הרשמה מוצלחת! 🎉
              </h2>
              
              {/* Registration Details */}
              <div className="bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5 border border-[#EC4899]/20 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-[#4B2E83] mb-4">פרטי ההרשמה שלך:</h3>
                
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">שיעור:</span>
                    <span className="font-bold text-[#4B2E83]">{classData?.name}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-medium">תאריך:</span>
                    <span className="font-bold text-[#4B2E83]">
                      {selectedDate ? new Date(selectedDate).toLocaleDateString('he-IL', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      }) : 'לא נבחר'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-medium">שעה:</span>
                    <span className="font-bold text-[#4B2E83]">
                      {selectedTime ? selectedTime.split(' עד ')[0] : 'לא נבחרה'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-medium">מחיר:</span>
                    <span className="font-bold text-[#EC4899]">{classData?.price} ש"ח</span>
                  </div>
                </div>
              </div>
              
              {/* Additional Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-right">
                    <h4 className="font-semibold text-blue-900 mb-2">מה הלאה?</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• תקבלי אימייל אישור עם פרטי השיעור</li>
                      <li>• פרטי ההרשמה שלך זמינים בפרופיל האישי</li>
                      <li>• אפשר לבטל עד 48 שעות לפני השיעור</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowRegistrationSuccess(false);
                    navigate('/profile');
                  }}
                  className="w-full bg-gradient-to-r from-[#EC4899] to-[#4B2E83] hover:from-[#4B2E83] hover:to-[#EC4899] text-white py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  עבור לפרופיל שלי
                </button>
                
                <button
                  onClick={() => {
                    setShowRegistrationSuccess(false);
                    navigate('/classes');
                  }}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-medium transition-colors duration-200"
                >
                  הרשמה לשיעור נוסף
                </button>
                
                <button
                  onClick={() => {
                    setShowRegistrationSuccess(false);
                    navigate('/');
                  }}
                  className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-600 py-3 px-6 rounded-xl font-medium transition-colors duration-200"
                >
                  חזור לדף הבית
                </button>
              </div>
              
              {/* Close button in top-right corner */}
              <button
                onClick={() => {
                  setShowRegistrationSuccess(false);
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                aria-label="סגור"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StandardRegistration; 