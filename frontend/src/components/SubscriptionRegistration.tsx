import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaClock, FaCalendarAlt, FaSignInAlt, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';
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
import { subscriptionCreditsService } from '../lib/subscriptionCredits';
import { UserSubscriptionCredits, CreditGroup, CREDIT_GROUP_LABELS, CREDIT_GROUP_COLORS } from '../types/subscription';
import type { UserProfile } from '../types/auth';
import { SkeletonBox, SkeletonText, SkeletonIcon, SkeletonInput, SkeletonButton } from './skeleton/SkeletonComponents';
import { throttledApiFetch } from '../utils/api';
import { 
  getCreditGroupForClass, 
  getCreditAmountFromClass, 
  getAvailableCreditsForGroup,
  formatCreditMessage,
  formatSuccessMessage
} from '../lib/creditLogic';

interface SubscriptionRegistrationProps {
  classData: Class;
}

const SubscriptionRegistration: React.FC<SubscriptionRegistrationProps> = ({ classData }) => {
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

  // Cache for dates, times, spots
  const [datesCache, setDatesCache] = useState<{ [classId: string]: string[] }>({});
  const [timesCache, setTimesCache] = useState<{ [key: string]: string[] }>({}); // key: classId+date
  const [spotsCache, setSpotsCache] = useState<{ [key: string]: any }>({}); // key: classId+date
  const [datesMessage, setDatesMessage] = useState('');
  const [loadingDates, setLoadingDates] = useState(false);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [loadingSpots, setLoadingSpots] = useState<{ [key: string]: boolean }>({});
  const [registrations, setRegistrations] = useState<any[]>([]);

  // Subscription credits state
  const [userCredits, setUserCredits] = useState<UserSubscriptionCredits | null>(null);
  const [loadingCredits, setLoadingCredits] = useState(true);

  // Derived - memoized for performance
  const profile = useMemo(() => localProfile || contextProfile, [localProfile, contextProfile]);

  const colors = getColorScheme('pink');

  const creditGroup = getCreditGroupForClass(classData);

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
    if (selectedDate && classData.id) {
      const key = classData.id + '_' + selectedDate;
      if (!timesCache[key] && !loadingTimes) {
        fetchTimes();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, classData.id]);

  // Fetch available spots (with cache) - only when date is selected and not already cached
  useEffect(() => {
    if (selectedDate && classData.id) {
      const key = classData.id + '_' + selectedDate;
      if (!spotsCache[key] && !loadingSpots[key]) {
        fetchAllSpots();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, classData.id]);

  const fetchTimes = async () => {
    if (!selectedDate || !classData.id) return;
    
    try {
      setLoadingTimes(true);
      const times = await getAvailableTimesForDateFromSessions(classData.id, selectedDate);
      const key = classData.id + '_' + selectedDate;
      setTimesCache(prev => ({ ...prev, [key]: times }));
    } catch (error: any) {
      if (error.message?.includes('429') || error.message?.includes('Too Many Requests')) {
        clearSessionsCache();
        setUsingFallbackMode(true);
      }
      const key = classData.id + '_' + selectedDate;
      setTimesCache(prev => ({ ...prev, [key]: [] }));
    } finally {
      setLoadingTimes(false);
    }
  };

  const fetchAllSpots = async (retryCount = 0) => {
    if (!selectedDate || !classData.id) return;
    
    const spotsKey = classData.id + '_' + selectedDate;
    
    try {
      setLoadingSpots(prev => ({ ...prev, [spotsKey]: true }));
      
      const spots = await getAvailableSpotsBatchFromSessions(classData.id, selectedDate);
      setSpotsCache(prev => ({ ...prev, [spotsKey]: spots }));
      
    } catch (error: any) {
      if (error.message?.includes('429') || error.message?.includes('Too Many Requests')) {
        if (retryCount < 2) {
          const retryDelay = Math.pow(2, retryCount) * 2000;
          setTimeout(() => fetchAllSpots(retryCount + 1), retryDelay);
          return;
        }
        clearSessionsCache();
        setUsingFallbackMode(true);
      }
      setSpotsCache(prev => ({ ...prev, [spotsKey]: {} }));
    } finally {
      setLoadingSpots(prev => ({ ...prev, [spotsKey]: false }));
    }
  };

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
        loadProfileWithFetch();
      }
    }
  }, [user, authLoading, contextProfile]);

  const loadProfileWithFetch = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles?select=*&id=eq.${user!.id}`, {
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

  // Load registrations
  useEffect(() => {
    if (user && session) {
      loadRegistrations();
    }
  }, [user, session]);

  const loadRegistrations = async () => {
    try {
      const userRegistrations = await registrationsService.getMyRegistrations(user!.id);
      setRegistrations(userRegistrations);
    } catch (error) {
      console.error('Error loading registrations:', error);
    }
  };

  // Load subscription credits
  useEffect(() => {
    if (user && session) {
      loadUserCredits();
    }
  }, [user, session]);

  const loadUserCredits = async () => {
    try {
      setLoadingCredits(true);
      const credits = await subscriptionCreditsService.getUserCredits(user!.id);
      setUserCredits(credits);
    } catch (err) {
      console.error('Error loading user credits:', err);
      setRegistrationError('שגיאה בטעינת יתרת השיעורים');
    } finally {
      setLoadingCredits(false);
    }
  };

  const getAvailableCredits = (): number => {
    return getAvailableCreditsForGroup(userCredits, creditGroup);
  };

  const getCreditAmount = (): number => {
    return getCreditAmountFromClass(classData, creditGroup);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !session) {
      showPopup({ type: 'error', message: 'עליך להתחבר כדי להירשם לשיעור' });
      return;
    }

    if (!selectedDate || !selectedTime) {
      showPopup({ type: 'error', message: 'אנא בחרי תאריך ושעה לשיעור' });
      return;
    }

    if (!formData.first_name || !formData.last_name || !formData.phone) {
      showPopup({ type: 'error', message: 'אנא מלאי את כל השדות הנדרשים' });
      return;
    }

    // Format time for backend (handle cases with "עד" - until)
    const timeForBackend = selectedTime.includes('עד') ? 
      selectedTime.split('עד')[0].trim() : 
      selectedTime;

    // Check if user is already registered for this class at this time
    const existingRegistration = registrations.find(reg => 
      reg.class_id === classData.id && 
      reg.selected_date === selectedDate && 
      (reg.selected_time === selectedTime || reg.selected_time === timeForBackend) &&
      reg.status !== 'cancelled'
    );

    if (existingRegistration) {
      setRegistrationError('כבר נרשמת לשיעור זה בתאריך ובשעה שנבחרו. אנא בחרי תאריך או שעה אחרת.');
      return;
    }

    setIsSubmitting(true);
    setRegistrationError(null);

    try {
      // Get spots info for session data
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
      
      // Create registration first
      const registrationData = {
        class_id: classData.id,
        user_id: user.id, // Add user_id explicitly
        ...(spotsInfo?.sessionId && { session_id: spotsInfo.sessionId }),
        ...(spotsInfo?.sessionClassId && { session_class_id: spotsInfo.sessionClassId }),
        // Always include session_class_id - the backend will handle finding/creating it
        session_class_id: spotsInfo?.sessionClassId || null,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        email: user.email || '',
        selected_date: selectedDate,
        selected_time: timeForBackend,
        notes: '',
        used_credit: hasCredits, // Only true if user has credits
        credit_type: hasCredits ? creditGroup : undefined, // Only set if using credits
        purchase_price: classData.price // Store the actual price paid
      };

      await registrationsService.createRegistration(registrationData, session?.access_token);

      // Handle credits logic
      const availableCredits = getAvailableCredits();
      
      if (availableCredits > 0) {
        // Use existing credit
        console.log(`Using existing credit for user ${user.id}, credit_group: ${creditGroup}, available: ${availableCredits}`);
        try {
          await subscriptionCreditsService.useCredit(user.id, creditGroup);
          console.log(`Successfully used credit for user ${user.id}`);
        } catch (creditError) {
          console.error('Error using credit:', creditError);
          // Don't fail the registration, just log the error
        }
      } else {
        // Create new subscription with credits based on class data
        // User pays for the class and gets credits for future use
        const totalCredits = getCreditAmount();
        
        console.log(`Creating new subscription for user ${user.id}, credit_group: ${creditGroup}, total_credits: ${totalCredits}`);
        
        try {
          // First, create the subscription with full credits
          await subscriptionCreditsService.addCredits({
            user_id: user.id,
            credit_group: creditGroup,
            remaining_credits: totalCredits, // Full amount - they paid for all credits
            expires_at: undefined
          });
          
          // Then, immediately use one credit for this registration
          await subscriptionCreditsService.useCredit(user.id, creditGroup);
          console.log(`Successfully created subscription and used credit for user ${user.id}`);
        } catch (creditError) {
          console.error('Error creating subscription or using credit:', creditError);
          // Don't fail the registration, just log the error
        }
      }

      setShowRegistrationSuccess(true);
      
      // Reload data
      await Promise.all([
        loadRegistrations(),
        loadUserCredits()
      ]);

    } catch (error: any) {
      console.error('Error registering for class:', error);
      
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
        } else if (error.message.includes('פורמט שעה לא תקין')) {
          errorMessage = 'שגיאה בפורמט השעה. אנא נסי שוב או בחרי שעה אחרת.';
        } else if (error.message.includes('No authorization token provided')) {
          errorMessage = 'בעיית הרשאה. אנא התחברי מחדש ונסי שוב.';
        }
      }
      
      setRegistrationError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/class/${classData.slug}`
        }
      });
      
      if (error) {
        showPopup({ type: 'error', message: 'שגיאה בהתחברות: ' + error.message });
      }
    } catch (error: any) {
      showPopup({ type: 'error', message: 'שגיאה בהתחברות: ' + error.message });
    }
  };

  if (loadingCredits) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-lg h-fit">
        <div className="text-center">
          <FaSpinner className="animate-spin w-8 h-8 mx-auto mb-4 text-[#EC4899]" />
          <p className="text-[#4B2E83]/70">טוען יתרת שיעורים...</p>
        </div>
      </div>
    );
  }

  const availableCredits = getAvailableCredits();
  const hasCredits = availableCredits > 0;

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg h-fit">
      {user ? (
        <>
                      <h2 className={`text-3xl font-bold ${colors.textColor} mb-6 font-agrandir-grand`}>
              {hasCredits ? 'קביעת שיעור' : 'הרשמה למנוי חודשי'}
      </h2>

          {/* Credits Display - Only show if user has credits */}
          {hasCredits && (
            <div className="mb-6">
              <div className="bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5 rounded-xl p-6 mb-4">
                <h3 className="text-lg font-semibold text-[#4B2E83] mb-3">יתרת שיעורים שלך</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[#4B2E83]/70">{CREDIT_GROUP_LABELS[creditGroup]}:</span>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${CREDIT_GROUP_COLORS[creditGroup]}`}>
                        {availableCredits} שיעורים
                      </span>
                      <FaCheckCircle className="text-green-500 w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {registrationError && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6 animate-pulse">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-0.5">
                  <FaExclamationTriangle className="h-6 w-6 text-red-500" />
                </div>
                <div className="mr-4 flex-1">
                  <h3 className="text-lg font-bold text-red-800 mb-2">
                    שגיאה בהרשמה
        </h3>
                  <div className="text-sm text-red-700 leading-relaxed">
                    {registrationError}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => setRegistrationError(null)}
                      className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-sm font-medium transition-colors duration-200"
                    >
                      סגור
                    </button>
                    <button
                      onClick={() => {
                        setRegistrationError(null);
                        setSelectedDate('');
                        setSelectedTime('');
                      }}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors duration-200"
                    >
                      בחרי תאריך/שעה אחרת
                    </button>
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
                            setRegistrationError(null);
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

            {/* Price Summary - Only show if user needs to pay */}
            {!hasCredits && (
              <div className={`${colors.lightBg} rounded-xl p-4`}>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-[#2B2B2B]">מחיר {classData.name}:</span>
                  <span className={`text-2xl font-bold ${colors.textColor}`}>{classData.price} ש"ח</span>
                </div>
                
                <div className="mt-3 p-3 rounded-lg border-r-4 bg-orange-50 border-orange-400">
                  <div className="flex items-center gap-2 mb-1">
                    <FaExclamationTriangle className="text-orange-600 w-4 h-4 flex-shrink-0" />
                    <span className="text-sm font-semibold text-orange-800">תשלום חדש נדרש</span>
                  </div>
                  <p className="text-sm text-orange-700">
                    {formatCreditMessage(hasCredits, classData, creditGroup, getCreditAmount())}
                  </p>
                </div>
              </div>
            )}

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
                return hasCredits ? 'הרשמה' : `הזמיני ${classData.name}`;
              })()}
            </button>
          </form>

                {/* Additional Info */}
            <div className="mt-6 text-sm space-y-2">
              {hasCredits && (
                <p className="text-green-700 font-semibold text-base">✓ שימוש בקרדיט זמין</p>
              )}
              <p className="text-gray-600">✓ ביטול חינם עד 48 שעות לפני השיעור</p>
              <p className="text-gray-600">✓ גמישות בבחירת התאריך והשעה</p>
              {!hasCredits && (
                <p className="text-gray-600">✓ קבלת מנוי {creditGroup === 'group' ? 'קבוצתי' : 'פרטי'} עם {getCreditAmount()} שיעורים</p>
              )}
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
            
            <div className="mt-3 p-3 rounded-lg border-r-4 bg-blue-50 border-blue-400">
              <div className="flex items-center gap-2 mb-1">
                <FaSignInAlt className="text-blue-600 w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-semibold text-blue-800">שיעור מנוי</span>
              </div>
                            <p className="text-sm text-blue-700">
                ישולם באמצעות קרדיטים זמינים או תשלום {classData.price} ש"ח + קבלת מנוי {creditGroup === 'group' ? 'קבוצתי' : 'פרטי'} עם {getCreditAmount()} שיעורים
        </p>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl transform transition-all">
        <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-agrandir-grand">
                ההרשמה בוצעה בהצלחה! 🎉
          </h2>
              
              <p className="text-gray-600 mb-8 font-agrandir-regular leading-relaxed">
                ההרשמה שלך ל{classData?.name} נשמרה בהצלחה. 
                <br />
                {formatSuccessMessage(hasCredits, classData, creditGroup, getCreditAmount())}
              </p>
              
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
};

export default SubscriptionRegistration; 