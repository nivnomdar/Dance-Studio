import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaClock, FaCalendarAlt, FaSignInAlt, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import { registrationsService } from '../lib/registrations';
import { Class } from '../types/class';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  getAvailableDatesForButtonsFromSessions,
  getAvailableTimesForDateFromSessions,
  getAvailableSpotsFromSessions,
  getAvailableDatesMessageFromSessions,
  getAvailableSpotsBatchFromSessions,
  clearSessionsCache
} from '../utils/sessionsUtils';
import { logActivity } from '../utils/activityLogger'; // Added this import
import { getColorScheme } from '../utils/colorUtils';
import { SkeletonBox } from './skeleton/SkeletonComponents';
import { throttledApiFetch } from '../utils/api';
import type { UserConsent } from '../types/auth';

interface StandardRegistrationProps {
  classData: Class;
}

const StandardRegistration: React.FC<StandardRegistrationProps> = ({ classData }) => {
  const navigate = useNavigate();
  const { user, loading: authLoading, session, profile: contextProfile } = useAuth();
  
  // State
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [formData, setFormData] = useState({ first_name: '', last_name: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRegistrationSuccess, setShowRegistrationSuccess] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [usingFallbackMode, setUsingFallbackMode] = useState(false);
  const [savedRegistrationData, setSavedRegistrationData] = useState<{ date: string; time: string } | null>(null);
  const [healthDeclarationAccepted, setHealthDeclarationAccepted] = useState(false);
  const [generalTermsAccepted, setGeneralTermsAccepted] = useState(false);
  const [ageConfirmationAccepted, setAgeConfirmationAccepted] = useState(false); // New state
  const [showFullHealthTerms, setShowFullHealthTerms] = useState(false);
  // Removed userConsents state
  const [loadingConsents, setLoadingConsents] = useState(true); // New state for loading consents
  const [hasAcceptedAgeConsentPreviously, setHasAcceptedAgeConsentPreviously] = useState(false); // New state

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
  const [hasUsedThisTrial, setHasUsedThisTrial] = useState(false);

  // Derived - memoized for performance
  // const profile = useMemo(() => localProfile || contextProfile, [localProfile, contextProfile]);

  // Fetch and set user consents
  useEffect(() => {
    const fetchConsentStatuses = async () => {
      if (!user?.id || !session?.access_token) {
        setLoadingConsents(false);
        return;
      }
      try {
        setLoadingConsents(true);
        const response = await throttledApiFetch(`${import.meta.env.VITE_API_BASE_URL}/profiles/consents`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session!.access_token}`, // Added non-null assertion
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const consents: UserConsent[] = await response.json();
          // Removed setUserConsents(consents);

          // Update checkbox states based on fetched consents (for one-time consents)
          setHasAcceptedAgeConsentPreviously(consents.some(c => c.consent_type === 'age_18' && c.version === null));
          // The generalTermsAccepted checkbox must always be false by default for new registrations
          // setGeneralTermsAccepted(false); // This was already done but will ensure no other logic interferes
          // health_declaration and registration_terms_and_privacy are per-registration, no global state needed
        } else {
          console.error('Failed to fetch consent statuses:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error fetching consent statuses:', error);
      } finally {
        setLoadingConsents(false);
      }
    };

    fetchConsentStatuses();
  }, [user?.id, session?.access_token]); // Depend on user and session for re-fetch

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

  // Load per-class trial usage for this class
  useEffect(() => {
    const loadTrialUsage = async () => {
      try {
        if (!user?.id || !session?.access_token) {
          setHasUsedThisTrial(false);
          return;
        }
        if ((classData?.category || '').toLowerCase() !== 'trial') {
          setHasUsedThisTrial(false);
          return;
        }
        const { data, error } = await supabase
          .from('user_trial_classes')
          .select('id')
          .eq('user_id', user.id)
          .eq('class_id', classData.id)
          .maybeSingle();
        if (error && error.code !== 'PGRST116') {
          setHasUsedThisTrial(false);
        } else {
          setHasUsedThisTrial(Boolean(data));
        }
      } catch {
        setHasUsedThisTrial(false);
      }
    };
    loadTrialUsage();
  }, [user?.id, session?.access_token, classData?.id, classData?.category]);

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
              return { time, available: 10, message: 'זמין' }; // Default capacity
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
            const retryDelay = Math.pow(2, retryCount) * 2000;
            setTimeout(() => fetchAllSpots(retryCount + 1), retryDelay);
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
              return { time, available: 10, message: 'זמין' }; // Default capacity
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
            acc[time] = { available: 10, message: 'זמין' }; // Default capacity
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
        setFormData({
          first_name: contextProfile.first_name || '',
          last_name: contextProfile.last_name || '',
          phone: contextProfile.phone_number || ''
        });
      } else {
        const loadProfileWithFetch = async () => {
          try {
            const response = await throttledApiFetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles?select=*&id=eq.${user.id}`, {
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
            'Authorization': `Bearer ${session!.access_token}`, // Added non-null assertion
            'Content-Type': 'application/json'
          }
        });
        if (response.ok && isMounted) {
          const profileData = await response.json();
          setRegistrations(profileData);
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
    if (phoneDigits.length !== 10) {
      setRegistrationError('מספר הטלפון חייב להכיל 10 ספרות'); // Updated message
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
    
    if (!generalTermsAccepted) {
      setRegistrationError('עליך לאשר את תנאי השימוש ומדיניות הפרטיות כדי להמשיך בהרשמה.');
      return;
    }
    
    if (!healthDeclarationAccepted) {
      setRegistrationError('עליך לאשר את הצהרת הבריאות כדי להמשיך בהרשמה.'); // Updated message
      return;
    }
    
    if (!ageConfirmationAccepted && !hasAcceptedAgeConsentPreviously) {
      setRegistrationError('עליך לאשר שגילך הוא 18 ומעלה כדי להמשיך בהרשמה.'); // New validation
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
    
    // בדיקה אם זה שיעור ניסיון והמשתמש כבר השתמש בו (פר-שיעור)
    if ((classData.category || '').toLowerCase() === 'trial' && hasUsedThisTrial) {
      setRegistrationError('כבר השתמשת בשיעור הניסיון הזה. לא ניתן להזמין אותו שוב.');
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
            available: 10, 
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
        user_id: user.id,
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
        purchase_price: classData.price, // Store the actual price paid
      };
      
      const newRegistration = await registrationsService.createRegistration(registrationData, session!.access_token); // Added non-null assertion

      // Log the class registration activity
      await logActivity(
        'Class Registration',
        `הרשמה לשיעור ${classData.name} בתאריך ${selectedDate} בשעה ${timeForBackend}. נרשמה: ${formData.first_name} ${formData.last_name}, טלפון: ${formData.phone}, אימייל: ${user.email}. מחיר: ${classData.price} ש"ח.`,
        {
          userId: user.id,
          classId: classData.id,
          sessionId: spotsInfo?.sessionId,
          sessionClassId: spotsInfo?.sessionClassId,
          registrationId: newRegistration.id,
          price: classData.price,
          email: user.email,
          firstName: formData.first_name,
          lastName: formData.last_name,
          phone: formData.phone,
        },
        session!.access_token,
        'info'
      );

      // Handle consents after successful registration
      const consentPromises = [];

      // Age confirmation (one-time, no registration_id, version: null)
      if (ageConfirmationAccepted) {
        consentPromises.push(throttledApiFetch(`${import.meta.env.VITE_API_BASE_URL}/profiles/accept-consent`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${session!.access_token}`, 'Content-Type': 'application/json' }, // Added non-null assertion
          body: JSON.stringify({ consent_type: 'age_18', version: null }),
        }));
      }

      // Health declaration (per-registration, requires registration_id and version)
      if (healthDeclarationAccepted && newRegistration?.id) {
        consentPromises.push(throttledApiFetch(`${import.meta.env.VITE_API_BASE_URL}/profiles/accept-consent`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${session!.access_token}`, 'Content-Type': 'application/json' }, // Added non-null assertion
          body: JSON.stringify({ 
            consent_type: 'health_declaration',
            registration_id: newRegistration.id,
            version: '1.0' // Assuming 1.0 for initial version
          }),
        }));
      }

      // General terms and privacy (per-registration, requires registration_id and version)
      // For standard registration, this is also a per-registration consent.
      if (generalTermsAccepted && newRegistration?.id) {
        consentPromises.push(throttledApiFetch(`${import.meta.env.VITE_API_BASE_URL}/profiles/accept-terms`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${session!.access_token}`, 'Content-Type': 'application/json' }, // Added non-null assertion
          body: JSON.stringify({ 
            consent_type: 'registration_terms_and_privacy', // Explicitly setting consent type for /accept-terms
            registration_id: newRegistration.id,
            version: '1.0' // Assuming 1.0 for initial version
          }),
        }));
      }

      // Execute all consent updates in parallel
      const consentResponses = await Promise.allSettled(consentPromises);
      consentResponses.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`Error accepting consent ${index}:`, result.reason);
          // Decide how to handle this: show a warning to the user, log it, etc.
          // For now, we proceed with registration success even if consent fails, but log the error.
        }
      });
      
      // שמירת הנתונים לפני האיפוס
      setSavedRegistrationData({
        date: selectedDate,
        time: selectedTime
      });
      
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
      
      await logActivity(
        'Class Registration Failed',
        `Standard registration error for ${user?.email || 'unknown user'}: ${errorMessage}`,
        {
          userId: user?.id,
          classId: classData.id,
          selectedDate,
          selectedTime,
          error: (error as Error).message || String(error),
        },
        session?.access_token,
        'error'
      );
    }
  };

  // removed profile trial flag updater; handled per-class on backend

  const handleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/class/${classData.slug}` // Changed redirect to class slug
        }
      });
      
      if (error) throw error;
    } catch (error) {
      // Handle login error silently or show user-friendly message
    }
  };

  // בדיקה אם זה שיעור ניסיון והמשתמש כבר השתמש בו - חסימת גישה (פר-שיעור)
  if ((classData?.category || '').toLowerCase() === 'trial' && user && !authLoading && hasUsedThisTrial) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-lg h-fit">
        <div className="text-center">
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-red-600 mb-4 font-agrandir-grand">
              גישה נחסמה
            </h1>
            <p className="text-red-700 mb-6 font-agrandir-regular">
              כבר השתמשת בשיעור הניסיון הזה. לא ניתן לגשת לשיעור ניסיון זה שוב.
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
            הרשמה לשיעור
          </h2>
          
          {registrationError && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaExclamationTriangle className="h-5 w-5 text-red-400" />
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
                  setRegistrationError(null); // Clear error on close
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
                {(loadingDates || loadingConsents) ? ( // Added loadingConsents
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
                          setRegistrationError(null);
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
                  {(loadingTimes || loadingConsents) ? ( // Added loadingConsents
                    Array.from({ length: 3 }).map((_, index) => (
                      <SkeletonBox key={index} className="h-16 rounded-xl" />
                    ))
                  ) : timesCache[classData.id + '_' + selectedDate] ? (
                    timesCache[classData.id + '_' + selectedDate].map((time) => {
                      const isSelected = selectedTime === time;
                      const spotsKey = classData.id + '_' + selectedDate;
                      const spotsData = spotsCache[spotsKey] || {};
                      const spotsInfo = spotsData[time] || { available: 10, message: 'זמין' };
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
                  minLength={10} // Updated minLength to 10
                  maxLength={10} // Added maxLength to 10 for consistency
                  required
                />
                <p className="text-xs text-gray-500 mt-1 font-agrandir-regular">
                  מספר טלפון חייב להכיל 10 ספרות
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

            {/* General Terms Checkbox */}
            <div className="mt-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={generalTermsAccepted}
                  onChange={(e) => setGeneralTermsAccepted(e.target.checked)}
                  required
                  className="form-checkbox h-5 w-5 text-[#EC4899] rounded border-gray-300 focus:ring-[#EC4899]"
                />
               <span className="text-sm font-medium text-gray-700 text-right mr-2 leading-relaxed">
                  קראתי ואני מאשרת ומסכימה ל- <Link to="/terms-of-service" className="text-[#EC4899] hover:underline" target="_blank">תנאי השימוש</Link> ו- <Link to="/privacy-policy" className="text-[#EC4899] hover:underline" target="_blank">מדיניות הפרטיות</Link> של הסטודיו.
                </span>
              </label>
            </div>

            {/* Health Declaration Checkbox */}
            <div className="mt-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={healthDeclarationAccepted}
                  onChange={(e) => setHealthDeclarationAccepted(e.target.checked)}
                  required
                  className="form-checkbox h-5 w-5 text-[#EC4899] rounded border-gray-300 focus:ring-[#EC4899]"
                />
                <span className="text-sm font-medium text-gray-700 text-right mr-2 leading-relaxed">
                  {showFullHealthTerms ? (
                    <>
                      אני מצהירה כי מצבי הבריאותי תקין. ההשתתפות בשיעור מתקיימת על אחריות המשתתפת בלבד. בכניסה לשיעורים את מצהירה כי מצבך הבריאותי מאפשר השתתפות בפעילות גופנית, וכי אין מניעה רפואית לכך. במקרה של ספק או מגבלה רפואית האחריות לפנות לייעוץ רפואי היא עלייך בלבד.
                      <button
                        type="button"
                        onClick={() => setShowFullHealthTerms(false)}
                        className="text-[#EC4899] hover:underline mr-1 font-bold"
                      >
                        קראי פחות
                      </button>
                    </>
                  ) : (
                    <>
                      אני מצהירה כי מצבי הבריאותי תקין.
                      <button
                        type="button"
                        onClick={() => setShowFullHealthTerms(true)}
                        className="text-[#EC4899] hover:underline mr-1 font-bold"
                      >
                        קראי עוד
                      </button>
                    </>
                  )}
                </span>
              </label>
            </div>

            {/* Age Confirmation Checkbox - New Field */}
            {!hasAcceptedAgeConsentPreviously && (
              <div className="mt-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ageConfirmationAccepted}
                    onChange={(e) => setAgeConfirmationAccepted(e.target.checked)}
                    required
                    className="form-checkbox h-5 w-5 text-[#EC4899] rounded border-gray-300 focus:ring-[#EC4899]"
                  />
                  <span className="text-sm font-medium text-gray-700 text-right mr-2 leading-relaxed">
                    בהרשמה לשיעורים אני מאשרת כי גילי הוא 18+.
                  </span>
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!selectedDate || !selectedTime || !formData.first_name || !formData.last_name || !formData.phone || formData.phone.replace(/\D/g, '').length !== 10 || isSubmitting || !generalTermsAccepted || !healthDeclarationAccepted || (!hasAcceptedAgeConsentPreviously && !ageConfirmationAccepted) || loadingConsents} // Added loadingConsents and conditional check for ageConfirmationAccepted
              className={`w-full py-4 px-6 rounded-xl transition-colors duration-300 font-bold text-lg shadow-lg hover:shadow-xl mt-6 ${
                selectedDate && selectedTime && formData.first_name && formData.last_name && formData.phone && generalTermsAccepted && healthDeclarationAccepted && (hasAcceptedAgeConsentPreviously || ageConfirmationAccepted) && !isSubmitting && !loadingConsents // Corrected conditional check for ageConfirmationAccepted
                  ? `${colors.bgColor} ${colors.hoverColor} text-white`
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {(isSubmitting || loadingConsents) ? ( // Added loadingConsents
                <div className="flex items-center justify-center">
                  <FaSpinner className="animate-spin h-5 w-5 text-white ml-2" />
                  {loadingConsents ? 'טוען הסכמות...' : 'מבצע זימון שיעור...'}
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-3 md:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-2xl max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-md xl:max-w-sm 2xl:max-w-xs w-full mx-auto overflow-hidden border border-white/20 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#4B2E83] to-[#EC4899] p-3 sm:p-4 md:p-4 lg:p-3 xl:p-2 text-white text-center relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              
              {/* Logo */}
              <div className="relative z-10 mb-2 sm:mb-3 md:mb-4 lg:mb-2 xl:mb-1">
                <img 
                  src="https://login.ladances.com/storage/v1/object/public/homePage/navbar/ladances-LOGO.svg" 
                  alt="Ladance Avigail" 
                  className="h-10 sm:h-12 md:h-14 lg:h-12 xl:h-10 w-auto mx-auto drop-shadow-lg"
                  loading="eager"
                />
              </div>
              
              {/* Success Icon */}
              <div className="relative z-10 mb-2 sm:mb-3 md:mb-2 lg:mb-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-12 lg:h-12 xl:w-10 xl:h-10 bg-green-500/20 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-6 lg:h-6 xl:w-5 xl:h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              
              {/* Title */}
              <div className="relative z-10">
                <h2 className="text-base sm:text-lg md:text-xl lg:text-lg xl:text-base font-bold mb-1 font-agrandir-grand leading-tight">
                  הרשמה מוצלחת! 🎉
                </h2>
                <p className="text-xs sm:text-sm md:text-sm lg:text-xs text-white/90">הפרטים נשמרו במערכת</p>
              </div>
            </div>

            {/* Content */}
            <div className="p-2 sm:p-3 md:p-4 lg:p-3 xl:p-2">
              {/* Registration Details */}
              <div className="bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5 border border-[#EC4899]/20 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 lg:p-3 xl:p-2 mb-2 sm:mb-3 md:mb-3 lg:mb-2">
                <h3 className="text-sm sm:text-base md:text-lg lg:text-base xl:text-sm font-semibold text-[#4B2E83] mb-2 sm:mb-3 md:mb-3 lg:mb-2 text-center">פרטי ההרשמה שלך</h3>
                
                <div className="space-y-1.5 sm:space-y-2 md:space-y-2.5 lg:space-y-1.5 xl:space-y-1 text-xs sm:text-sm md:text-sm lg:text-xs text-gray-700">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-0.5 sm:gap-0">
                    <span className="font-medium text-right sm:text-left">שיעור:</span>
                    <span className="font-bold text-[#4B2E83] text-right sm:text-left">{classData?.name}</span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-0.5 sm:gap-0">
                    <span className="font-medium text-right sm:text-left">תאריך:</span>
                    <span className="font-bold text-[#4B2E83] text-right sm:text-left">
                      {savedRegistrationData?.date ? new Date(savedRegistrationData.date).toLocaleDateString('he-IL', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      }) : 'לא נבחר'}
                    </span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-0.5 sm:gap-0">
                    <span className="font-medium text-right sm:text-left">שעה:</span>
                    <span className="font-bold text-[#4B2E83] text-right sm:text-left">
                      {savedRegistrationData?.time ? savedRegistrationData.time.split(' עד ')[0] : 'לא נבחרה'}
                    </span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-0.5 sm:gap-0">
                    <span className="font-medium text-right sm:text-left">מחיר:</span>
                    <span className="font-bold text-[#EC4899] text-right sm:text-left">{classData?.price} ש"ח</span>
                  </div>
                </div>
              </div>
              
              {/* Additional Info */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-3 lg:p-2 xl:p-1.5 mb-2 sm:mb-3 md:mb-3 lg:mb-2">
                <div className="flex items-start gap-1.5 sm:gap-2 md:gap-2.5 lg:gap-1.5 xl:gap-1">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5 lg:w-4 lg:h-4 xl:w-3 xl:h-3 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3 md:h-3 lg:w-2.5 lg:h-2.5 xl:w-2 xl:h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-right flex-1">
                    <h4 className="font-semibold text-blue-900 mb-1 text-xs sm:text-sm md:text-sm lg:text-xs">מה הלאה?</h4>
                    <ul className="text-xs sm:text-xs md:text-xs lg:text-xs text-blue-800 space-y-0.5">
                      <li>• תקבלי אימייל אישור עם פרטי השיעור</li>
                      <li>• פרטי ההרשמה שלך זמינים בפרופיל האישי</li>
                      <li>• אפשר לבטל עד 48 שעות לפני השיעור</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* Buttons */}
              <div className="space-y-1.5 sm:space-y-2 md:space-y-2.5 lg:space-y-1.5 xl:space-y-1">
                <button
                  onClick={() => {
                    setShowRegistrationSuccess(false);
                    setSavedRegistrationData(null);
                    navigate('/profile');
                  }}
                  className="w-full bg-gradient-to-r from-[#EC4899] to-[#4B2E83] hover:from-[#4B2E83] hover:to-[#EC4899] text-white py-2 sm:py-2.5 md:py-3 lg:py-2 xl:py-1.5 px-3 sm:px-4 md:px-5 lg:px-3 xl:px-2 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm md:text-sm lg:text-xs transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  עבור לפרופיל שלי
                </button>
                
                <button
                  onClick={() => {
                    setShowRegistrationSuccess(false);
                    setSavedRegistrationData(null);
                    navigate('/classes');
                  }}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 sm:py-2.5 md:py-3 lg:py-2 xl:py-1.5 px-3 sm:px-4 md:px-5 lg:px-3 xl:px-2 rounded-lg sm:rounded-xl font-medium transition-colors duration-200 text-xs sm:text-sm md:text-sm lg:text-xs"
                >
                  הרשמה לשיעור נוסף
                </button>
                
                <button
                  onClick={() => {
                    setShowRegistrationSuccess(false);
                    setSavedRegistrationData(null);
                    navigate('/');
                  }}
                  className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-600 py-2 sm:py-2.5 md:py-3 lg:py-2 xl:py-1.5 px-3 sm:px-4 md:px-5 lg:px-3 xl:px-2 rounded-lg sm:rounded-xl font-medium transition-colors duration-200 text-xs sm:text-sm md:text-sm lg:text-xs"
                >
                  חזור לדף הבית
                </button>
              </div>
            </div>

            {/* Close Button */}
            <div className="p-1.5 sm:p-2 md:p-3 lg:p-2 xl:p-1 border-t border-gray-100 bg-gray-50/50">
              <button
                onClick={() => {
                  setShowRegistrationSuccess(false);
                  setSavedRegistrationData(null);
                }}
                className="w-full py-1.5 sm:py-2 md:py-2.5 lg:py-1.5 xl:py-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200 font-medium text-xs sm:text-sm md:text-sm lg:text-xs"
              >
                חזרה
              </button>
            </div>
          </div>
      </div>
      )}
    </div>
  );
};

export default StandardRegistration;