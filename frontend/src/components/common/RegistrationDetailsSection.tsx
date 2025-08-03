import React, { useEffect, useState } from 'react';
import { FaCalendar, FaCalendarAlt, FaClock } from 'react-icons/fa';
import CalendarPicker from './CalendarPicker';
import TimePicker from './TimePicker';
import { useAuth } from '../../contexts/AuthContext';
import { getAvailableSpotsBatchFromSessions } from '../../utils/sessionsUtils';

interface RegistrationDetailsSectionProps {
  isNewRegistration: boolean;
  formData: any;
  registrationData: any;
  classes: any[];
  sessions?: any[];
  session_classes?: any[];
  errors: { [key: string]: string };
  onInputChange: (field: string, value: any) => void;
  useCustomDateTime: boolean;
  setUseCustomDateTime: (value: boolean) => void;
  showDatePicker: boolean;
  setShowDatePicker: (value: boolean) => void;
  showTimePicker: boolean;
  setShowTimePicker: (value: boolean) => void;
  showCustomTimePicker: boolean;
  setShowCustomTimePicker: (value: boolean) => void;
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void;
  availableDates: string[];
  availableTimes: string[];
  loadingDates: boolean;
  loadingTimes: boolean;
  datesMessage: string;
  onDateSelect: (date: Date) => void;
  onTimeSelect: (time: string) => void;
  onMonthChange: (direction: 'next' | 'prev') => void;
  userCredits?: any;
  loadingCredits?: boolean;
}

export default function RegistrationDetailsSection({
  isNewRegistration,
  formData,
  registrationData,
  classes,
  sessions = [],
  session_classes = [],
  errors,
  onInputChange,
  useCustomDateTime,
  setUseCustomDateTime,
  showDatePicker,
  setShowDatePicker,
  showTimePicker,
  setShowTimePicker,
  showCustomTimePicker,
  setShowCustomTimePicker,
  currentMonth,
  setCurrentMonth,
  availableDates,
  availableTimes,
  loadingDates,
  loadingTimes,
  datesMessage,
  onDateSelect,
  onTimeSelect,
  onMonthChange,
  userCredits,
  loadingCredits = false
}: RegistrationDetailsSectionProps) {
  const { session } = useAuth();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // הוספת useEffect לבחירה אוטומטית של class_id
  useEffect(() => {
    if (formData.session_id && session_classes && classes) {
      // מצא את השיעורים שמקושרים לקבוצה שנבחרה
      const relatedSessionClasses = session_classes.filter(sc => sc.session_id === formData.session_id);
      const relatedClassIds = relatedSessionClasses.map(sc => sc.class_id);
      const relatedClasses = classes.filter(cls => relatedClassIds.includes(cls.id));
      
      // אם יש רק שיעור אחד מקושר, בחר אותו אוטומטית
      if (relatedClasses.length === 1) {
        const onlyClassId = relatedClasses[0].id;
        if (formData.class_id !== onlyClassId) {
          onInputChange('class_id', onlyClassId);
        }
      }
    }
    // eslint-disable-next-line
  }, [formData.session_id, session_classes, classes]);

  // בדיקת הרשמות קיימות של המשתמש
  const [userRegistrations, setUserRegistrations] = useState<any[]>([]);
  const [loadingUserRegistrations, setLoadingUserRegistrations] = useState(false);

  useEffect(() => {
    if (formData.user_id && formData.class_id) {
      loadUserRegistrations();
    }
  }, [formData.user_id, formData.class_id]);

  const loadUserRegistrations = async () => {
    if (!formData.user_id || !formData.class_id) {
      console.log('Missing user_id or class_id, skipping user registrations check');
      return;
    }
    const token = session?.access_token;
    if (!token) {
      console.warn('No access token found, skipping user registrations check');
      return;
    }
    try {
      setLoadingUserRegistrations(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/registrations/user/${formData.user_id}?class_id=${formData.class_id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const registrations = await response.json();
        setUserRegistrations(registrations);
      } else {
        console.error('Failed to load user registrations:', response.status);
        setUserRegistrations([]);
      }
    } catch (error) {
      console.error('Error loading user registrations:', error);
      setUserRegistrations([]);
    } finally {
      setLoadingUserRegistrations(false);
    }
  };

  // בדיקה אם תאריך/שעה כבר הוזמן
  const isAlreadyBooked = (date: string, time: string) => {
    return userRegistrations.some(reg => 
      reg.selected_date === date && 
      reg.selected_time === time && 
      reg.status === 'active'
    );
  };

  // בדיקת זמינות קבוצה
  const [sessionAvailability, setSessionAvailability] = useState<{ [date: string]: { [time: string]: any } }>({});
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  useEffect(() => {
    if (formData.session_id && formData.class_id && availableDates.length > 0 && availableTimes.length > 0) {
      loadSessionAvailability();
    }
  }, [formData.session_id, formData.class_id, availableDates, availableTimes]);

  const loadSessionAvailability = async () => {
    // בדוק שיש session_id לפני הקריאה
    if (!formData.session_id) {
      console.log('No session_id, skipping availability check');
      return;
    }
    
    // בדוק שיש class_id לפני הקריאה
    if (!formData.class_id) {
      console.log('No class_id, skipping availability check');
      return;
    }
    
    // בדוק שיש שעות זמינות לפני הקריאה
    if (availableTimes.length === 0) {
      console.log('No available times, skipping availability check');
      return;
    }
    
    try {
      setLoadingAvailability(true);
      
      console.log('🔍 Starting availability check for class:', formData.class_id);
      console.log('📅 Available dates:', availableDates);
      console.log('⏰ Available times:', availableTimes);
      
      const availabilityPromises = availableDates.map(async (date) => {
        console.log(`📅 Checking availability for date: ${date}`);
        
        try {
          // השתמש באותו API כמו ב-StandardRegistration
          const spotsData = await getAvailableSpotsBatchFromSessions(formData.class_id, date);
          console.log(`✅ Spots data for ${date}:`, spotsData);
          
          return { date, timeAvailability: spotsData };
        } catch (error) {
          console.error(`💥 Error checking availability for ${date}:`, error);
          return { date, timeAvailability: {} };
        }
      });
      
      const results = await Promise.all(availabilityPromises);
      const availabilityMap = results.reduce((acc, { date, timeAvailability }) => {
        acc[date] = timeAvailability;
        return acc;
      }, {} as {[key: string]: any});
      
      console.log('🎯 Final availability map:', availabilityMap);
      setSessionAvailability(availabilityMap);
    } catch (error) {
      console.error('💥 Error loading session availability:', error);
    } finally {
      setLoadingAvailability(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-[#4B2E83]/5 to-[#EC4899]/5 rounded-xl p-3 sm:p-4">
      <h3 className="text-sm sm:text-base font-bold text-[#4B2E83] mb-2 sm:mb-3 flex items-center gap-2">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {isNewRegistration && !formData.user_id ? 'בחרי משתמש תחילה' : 'פרטי הרשמה'}
      </h3>
      <div className="space-y-3">
        {isNewRegistration ? (
            <div className="space-y-4">
              {formData.user_id ? (
                <>
                  {/* Step 2: Group Selection */}
              <div className="bg-white rounded-lg p-4 border border-[#EC4899]/10">
                <h4 className="text-sm font-semibold text-[#4B2E83] mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 bg-[#EC4899] text-white rounded-full flex items-center justify-center text-xs">2</span>
                  בחירת קבוצה
                </h4>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">
                    קבוצה *
                  </label>
                  <select
                    required
                    value={formData.session_id}
                    onChange={(e) => onInputChange('session_id', e.target.value)}
                      className={`w-full px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm border rounded-xl focus:ring-2 focus:outline-none transition-all bg-white max-h-32 overflow-y-auto ${
                      errors.session_id 
                        ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                        : 'border-[#EC4899]/20 focus:ring-[#EC4899]/20 focus:border-[#EC4899]'
                    }`}
                  >
                      <option value="" className="text-xs sm:text-sm">בחרי קבוצה</option>
                      {sessions.map((session) => {
                        // מצא את השיעור הקשור לקבוצה זו
                        const sessionClass = session_classes.find(sc => sc.session_id === session.id);
                        const classInfo = sessionClass ? classes.find(c => c.id === sessionClass.class_id) : null;
                        
                        // צור תיאור מפורט עם התאמה למסכים קטנים
                        let description = session.name || session.session_name || 'קבוצה ללא שם';
                        if (classInfo) {
                          description += ` - ${classInfo.name}`;
                        }
                        
                        // הוסף ימים ושעות אם קיימים
                        if (session.weekdays && session.weekdays.length > 0) {
                          const days = session.weekdays.map((day: number) => {
                            const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
                            return dayNames[day];
                          }).join(', ');
                          description += ` (${days})`;
                        }
                        
                        if (session.start_time && session.end_time) {
                          description += ` ${session.start_time}-${session.end_time}`;
                        }
                        
                        // צור תיאור קצר למסכים קטנים - רק שם קבוצה, ימים ושעות
                        let shortDescription = session.name || session.session_name || 'קבוצה';
                        
                        // הוסף ימים לשני התיאורים
                        if (session.weekdays && session.weekdays.length > 0) {
                          const days = session.weekdays.map((day: number) => {
                            const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
                            return dayNames[day];
                          }).join(', ');
                          shortDescription += ` (${days})`;
                        }
                        
                        // הוסף שעות לשני התיאורים
                        if (session.start_time && session.end_time) {
                          shortDescription += ` ${session.start_time}-${session.end_time}`;
                        }
                        
                        return (
                          <option key={session.id} value={session.id} className="text-xs sm:text-sm py-1">
                            {isMobile ? shortDescription : description}
                          </option>
                        );
                      })}
                  </select>
                  {errors.session_id && (
                      <p className="text-red-500 text-xs mt-2">{errors.session_id}</p>
                  )}
                </div>
              </div>

                  {/* Step 3: Class Selection */}
                {formData.session_id && (
                <div className="bg-white rounded-lg p-4 border border-[#EC4899]/10">
                  <h4 className="text-sm font-semibold text-[#4B2E83] mb-3 flex items-center gap-2">
                        <span className="w-6 h-6 bg-[#EC4899] text-white rounded-full flex items-center justify-center text-xs">3</span>
                    בחירת שיעור
                  </h4>
                  <div>
                    {(() => {
                          // מצא את השיעורים שמקושרים לקבוצה שנבחרה
                          const relatedSessionClasses = session_classes.filter(sc => sc.session_id === formData.session_id);
                          const relatedClassIds = relatedSessionClasses.map(sc => sc.class_id);
                          const relatedClasses = classes.filter(cls => relatedClassIds.includes(cls.id));
                          
                          if (relatedClasses.length === 1) {
                            const onlyClass = relatedClasses[0];
                        return (
                              <div className="flex items-center gap-2 px-3 py-2.5 text-sm border rounded-xl bg-gray-50 text-[#4B2E83] font-semibold">
                                {onlyClass ? `${onlyClass.name} - ${onlyClass.price} ש"ח` : 'שיעור אחד'}
                                <span className="ml-2 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs font-normal">נבחר אוטומטית</span>
                          </div>
                        );
                          } else {
                      return (
                        <select
                          required
                          value={formData.class_id}
                          onChange={(e) => onInputChange('class_id', e.target.value)}
                                className={`w-full px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm border rounded-xl focus:ring-2 focus:outline-none transition-all bg-white max-h-32 overflow-y-auto ${
                            errors.class_id 
                              ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                              : 'border-[#EC4899]/20 focus:ring-[#EC4899]/20 focus:border-[#EC4899]'
                          }`}
                        >
                                <option value="" className="text-xs sm:text-sm">בחרי שיעור</option>
                                {relatedClasses.map((cls) => (
                                  <option key={cls.id} value={cls.id} className="text-xs sm:text-sm py-1">
                                    {cls.name} - {cls.price} ש"ח
                            </option>
                          ))}
                        </select>
                      );
                          }
                    })()}
                    {errors.class_id && (
                        <p className="text-red-500 text-xs mt-2">{errors.class_id}</p>
                    )}
                  </div>
                </div>
              )}

                  {/* Step 4: Date and Time Selection */}
                {formData.class_id && (
                <div className="bg-white rounded-lg p-4 border border-[#EC4899]/10">
                  <h4 className="text-sm font-semibold text-[#4B2E83] mb-3 flex items-center gap-2">
                        <span className="w-6 h-6 bg-[#EC4899] text-white rounded-full flex items-center justify-center text-xs">4</span>
                    בחירת תאריך ושעה
                  </h4>
                  
                  <div className="mb-4">
                    <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-2">
                      שיטת בחירת תאריך ושעה
                    </label>
                    <div className="flex gap-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="dateTimeMethod"
                          value="automatic"
                          checked={!useCustomDateTime}
                          onChange={() => setUseCustomDateTime(false)}
                          className="w-4 h-4 text-[#EC4899] bg-gray-100 border-gray-300 focus:ring-[#EC4899] focus:ring-2"
                        />
                        <span className="text-sm text-[#4B2E83]">לפי הקבוצה</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="dateTimeMethod"
                          value="manual"
                          checked={useCustomDateTime}
                          onChange={() => setUseCustomDateTime(true)}
                          className="w-4 h-4 text-[#EC4899] bg-gray-100 border-gray-300 focus:ring-[#EC4899] focus:ring-2"
                        />
                        <span className="text-sm text-[#4B2E83]">התאמה אישית</span>
                      </label>
                    </div>
                  </div>

                  {useCustomDateTime ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-2">
                          תאריך מותאם אישית *
                        </label>
                        <div className="relative">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 relative">
                              <input
                                type="text"
                                required
                                value={formData.selected_date ? new Date(formData.selected_date).toLocaleDateString('he-IL') : ''}
                                onChange={(e) => onInputChange('selected_date', e.target.value)}
                                placeholder="בחרי תאריך"
                                readOnly
                                className={`w-full px-3 py-2.5 text-sm border rounded-xl focus:ring-2 focus:outline-none transition-all bg-white ${
                                  errors.selected_date 
                                    ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                                    : 'border-[#EC4899]/20 focus:ring-[#EC4899]/20 focus:border-[#EC4899]'
                                }`}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => setShowDatePicker(!showDatePicker)}
                              className="px-4 py-2.5 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded-xl hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                              <FaCalendar className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <CalendarPicker
                            currentMonth={currentMonth}
                            selectedDate={formData.selected_date}
                                availableDates={[]}
                            onDateSelect={onDateSelect}
                            onMonthChange={onMonthChange}
                            onClose={() => setShowDatePicker(false)}
                            isOpen={showDatePicker}
                          />
                        </div>
                        {errors.selected_date && (
                          <p className="text-red-500 text-xs mt-2">{errors.selected_date}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-2">
                          שעה מותאמת אישית *
                        </label>
                        <div className="relative">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 relative">
                              <input
                                type="text"
                                required
                                value={formData.selected_time}
                                onChange={(e) => onInputChange('selected_time', e.target.value)}
                                placeholder="בחרי שעה"
                                readOnly
                                className={`w-full px-3 py-2.5 text-sm border rounded-xl focus:ring-2 focus:outline-none transition-all bg-white ${
                                  errors.selected_time 
                                    ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                                    : 'border-[#EC4899]/20 focus:ring-[#EC4899]/20 focus:border-[#EC4899]'
                                }`}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => setShowCustomTimePicker(!showCustomTimePicker)}
                              className="px-4 py-2.5 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded-xl hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </button>
                          </div>
                          
                          <TimePicker
                            selectedTime={formData.selected_time}
                            availableTimes={[]}
                            onTimeSelect={onTimeSelect}
                            onClose={() => setShowCustomTimePicker(false)}
                            isOpen={showCustomTimePicker}
                            isCustom={true}
                          />
                        </div>
                        {errors.selected_time && (
                          <p className="text-red-500 text-xs mt-2">{errors.selected_time}</p>
                        )}
                      </div>
                    </div>
                  ) : (
                      <div className="space-y-4">
                        {/* Date Selection - Professional Style */}
                      <div>
                          <label className="block text-sm font-bold text-[#4B2E83] mb-3">
                            <FaCalendarAlt className="w-4 h-4 inline ml-2" />
                            בחרי תאריך לשיעור *
                        </label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 lg:gap-3 px-1 sm:px-0">
                        {loadingDates ? (
                              Array.from({ length: 3 }).map((_, index) => (
                                <div key={index} className="h-16 bg-gray-100 rounded-xl animate-pulse"></div>
                              ))
                            ) : availableDates.length > 0 ? (
                              availableDates.map((date) => {
                                const dateObj = new Date(date);
                                const isSelected = formData.selected_date === date;
                                const today = new Date().toISOString().split('T')[0];
                                const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                                const isToday = date === today;
                                const isTomorrow = date === tomorrow;
                                const isBooked = isAlreadyBooked(date, availableTimes[0] || '');
                                const availability = sessionAvailability[date];
                                const isFull = availability && availability.available <= 0;
                                
                                return (
                                  <button
                                    key={date}
                                    type="button"
                                    onClick={() => {
                                      onInputChange('selected_date', date);
                                      onInputChange('selected_time', '');
                                    }}
                                    disabled={isBooked || isFull}
                                    className={`
                                      p-1 lg:p-3 py-3 lg:py-5 rounded-xl border-2 transition-all duration-200 text-xs lg:text-sm font-bold relative h-16 flex items-center justify-center
                                      ${isSelected 
                                        ? 'bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white border-transparent shadow-lg' 
                                        : isBooked
                                        ? 'bg-red-100 border-red-300 text-red-700 cursor-not-allowed opacity-75'
                                        : isFull
                                        ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed opacity-75'
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
                                    {isBooked && (
                                      <div className="absolute -top-2 -left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                                        הוזמן
                                      </div>
                                    )}
                                    {isFull && (
                                      <div className="absolute -top-2 -left-2 bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                                        מלא
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
                              <div className="col-span-2 sm:col-span-3 text-center text-gray-500">אין תאריכים זמינים</div>
                            )}
                          </div>
                        {errors.selected_date && (
                          <p className="text-red-500 text-xs mt-2">{errors.selected_date}</p>
                        )}
                        {datesMessage && (
                          <p className="text-xs text-[#4B2E83]/60 mt-2 font-medium">{datesMessage}</p>
                        )}
                            {formData.selected_date && (
                              <p className="text-xs text-[#4B2E83]/80 mt-2 font-medium">
                              {new Date(formData.selected_date).toLocaleDateString('he-IL', { weekday: 'long' })}
                              </p>
                            )}
                      </div>

                        {/* Time Selection - Professional Style */}
                        {formData.selected_date && (
                      <div>
                            <label className="block text-sm font-bold text-[#4B2E83] mb-3">
                              <FaClock className="w-4 h-4 inline ml-2" />
                              בחרי שעה לשיעור *
                        </label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 lg:gap-3 px-1 sm:px-0">
                        {loadingTimes ? (
                                Array.from({ length: 3 }).map((_, index) => (
                                  <div key={index} className="h-16 bg-gray-100 rounded-xl animate-pulse"></div>
                                ))
                              ) : availableTimes.length > 0 ? (
                                availableTimes.map((time) => {
                                  const isSelected = formData.selected_time === time;
                                  const isBooked = isAlreadyBooked(formData.selected_date, time);
                                  const dateAvailability = sessionAvailability[formData.selected_date];
                                  const timeAvailability = dateAvailability ? dateAvailability[time] : null;
                                  const isFull = timeAvailability && timeAvailability.available <= 0;
                                  
                                  console.log(`🎯 Rendering time ${time}:`, {
                                    isSelected,
                                    isBooked,
                                    dateAvailability: !!dateAvailability,
                                    timeAvailability,
                                    isFull,
                                    availableTimes
                                  });
                                  
                                  return (
                                    <button
                                      key={time}
                                      type="button"
                                      onClick={() => onInputChange('selected_time', time)}
                                      disabled={isBooked || isFull}
                                      className={`
                                        p-1 lg:p-3 py-3 lg:py-5 rounded-xl border-2 transition-all duration-200 text-xs lg:text-sm font-bold relative h-16 flex items-center justify-center
                                        ${isSelected 
                                          ? 'bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white border-transparent shadow-lg' 
                                          : isBooked
                                          ? 'bg-red-100 border-red-300 text-red-700 cursor-not-allowed opacity-75'
                                          : isFull
                                          ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed opacity-75'
                                          : 'bg-white border-gray-200 hover:border-gray-300 text-[#2B2B2B] hover:shadow-md'
                                        }
                                      `}
                                    >
                                      {isBooked && (
                                        <div className="absolute -top-2 -left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                                          הוזמן
                                        </div>
                                      )}
                                      {isFull && (
                                        <div className="absolute -top-2 -left-2 bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                                          מלא
                                        </div>
                                      )}
                                      {!isBooked && !isFull && timeAvailability && (
                                        <div className={`absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs font-bold shadow-md transform rotate-12 ${
                                          timeAvailability.available === 0 
                                            ? 'bg-red-500 text-white' 
                                            : timeAvailability.available === 1 
                                              ? 'bg-orange-500 text-white' 
                                              : 'bg-green-500 text-white'
                                        }`}>
                                          {(() => {
                                            const message = timeAvailability.available === 0 
                                              ? 'מלא' 
                                              : timeAvailability.available === 1 
                                                ? 'מקום אחרון' 
                                                : `${timeAvailability.available} מקומות`;
                                            console.log(`🏷️ Availability tag for ${time}:`, {
                                              available: timeAvailability.available,
                                              message,
                                              timeAvailability
                                            });
                                            return message;
                                          })()}
                                        </div>
                                      )}
                                      <div className="text-center leading-tight">
                                        <div className="text-xs lg:text-sm">{time}</div>
                                      </div>
                                    </button>
                                  );
                                })
                              ) : (
                                <div className="col-span-2 sm:col-span-3 text-center text-gray-500">אין שעות זמינות</div>
                              )}
                            </div>
                            {errors.selected_time && (
                              <p className="text-red-500 text-xs mt-2">{errors.selected_time}</p>
                            )}
                            {formData.selected_time && (
                              <p className="text-sm text-gray-600 mt-2 font-medium">
                                השעה שנבחרה: {formData.selected_time}
                              </p>
                            )}
                          </div>
                        )}
                    </div>
                  )}
                </div>
              )}

                {/* Step 5: Payment Details */}
                {formData.selected_date && formData.selected_time && (
                <div className="bg-white rounded-lg p-4 border border-[#EC4899]/10">
                  <h4 className="text-sm font-semibold text-[#4B2E83] mb-3 flex items-center gap-2">
                        <span className="w-6 h-6 bg-[#EC4899] text-white rounded-full flex items-center justify-center text-xs">5</span>
                      פרטי תשלום
                  </h4>
                  
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">
                        מחיר רכישה *
                      </label>
                      <input
                        type="number"
                        required
                        value={formData.purchase_price}
                          onChange={(e) => onInputChange('purchase_price', parseFloat(e.target.value))}
                          placeholder="הכנסי מחיר"
                          className={`w-full px-3 py-2.5 text-sm border rounded-xl focus:ring-2 focus:outline-none transition-all bg-white ${
                          errors.purchase_price 
                            ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                            : 'border-[#EC4899]/20 focus:ring-[#EC4899]/20 focus:border-[#EC4899]'
                        }`}
                      />
                      {errors.purchase_price && (
                          <p className="text-red-500 text-xs mt-2">{errors.purchase_price}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">
                        שימוש בקרדיט
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.used_credit}
                          onChange={(e) => onInputChange('used_credit', e.target.checked)}
                          disabled={!userCredits || !userCredits.credits || userCredits.credits.length === 0 || userCredits.credits.reduce((sum: number, credit: any) => sum + credit.remaining_credits, 0) <= 0}
                          className="w-4 h-4 text-[#EC4899] bg-gray-100 border-gray-300 focus:ring-[#EC4899] focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <span className={`text-sm ${(!userCredits || !userCredits.credits || userCredits.credits.length === 0 || userCredits.credits.reduce((sum: number, credit: any) => sum + credit.remaining_credits, 0) <= 0) ? 'text-gray-500' : 'text-[#4B2E83]'}`}>
                          השתמש בקרדיט
                        </span>
                      </div>
                      
                      {/* הצג מידע על קרדיטים זמינים */}
                      {userCredits && userCredits.credits && userCredits.credits.length > 0 && (
                        <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center gap-2 mb-1">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-xs font-medium text-blue-800">קרדיטים זמינים:</span>
                          </div>
                          <div className="text-xs text-blue-700 space-y-1">
                                      {userCredits.credits.map((credit: any, index: number) => (
                              <div key={credit.id || index} className="flex justify-between items-center">
                                          <span>{credit.credit_group === 'group' ? 'קבוצה' : 'פרטי'}:</span>
                                          <span className="font-medium">{credit.remaining_credits} זמינים</span>
                                        </div>
                                      ))}
                            <div className="pt-1 border-t border-blue-200">
                              <div className="flex justify-between items-center font-semibold">
                                          <span>סה"כ קרדיטים:</span>
                                          <span className="font-bold">
                                            {userCredits.credits.reduce((sum: number, credit: any) => sum + credit.remaining_credits, 0)}
                                          </span>
                                        </div>
                    </div>
                          </div>
                                </div>
                              )}
                      
                      {/* הצג הודעה כשאין קרדיטים */}
                      {(!userCredits || !userCredits.credits || userCredits.credits.length === 0 || userCredits.credits.reduce((sum: number, credit: any) => sum + credit.remaining_credits, 0) <= 0) && (
                        <div className="mt-2 p-2 bg-amber-50 rounded-lg border border-amber-200">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <span className="text-xs font-medium text-amber-800">
                              {!userCredits || !userCredits.credits || userCredits.credits.length === 0 
                                ? 'אין קרדיטים זמינים למשתמש זה' 
                                : 'אין קרדיטים זמינים לשימוש'
                              }
                            </span>
                          </div>
                            </div>
                            )}
                          </div>
                      </div>

                  {formData.used_credit && userCredits && userCredits.credits && userCredits.credits.length > 0 && userCredits.credits.reduce((sum: number, credit: any) => sum + credit.remaining_credits, 0) > 0 && (
                    <div className="mt-3">
                      <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">
                        סוג קרדיט *
                      </label>
                      <select
                        required
                        value={formData.credit_type}
                        onChange={(e) => onInputChange('credit_type', e.target.value)}
                        className={`w-full px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm border rounded-xl focus:ring-2 focus:outline-none transition-all bg-white max-h-32 overflow-y-auto ${
                          errors.credit_type 
                            ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                            : 'border-[#EC4899]/20 focus:ring-[#EC4899]/20 focus:border-[#EC4899]'
                        }`}
                      >
                        <option value="" className="text-xs sm:text-sm">בחרי סוג קרדיט</option>
                        {userCredits.credits.filter((credit: any) => credit.remaining_credits > 0).map((credit: any) => (
                          <option key={credit.id} value={credit.credit_group} className="text-xs sm:text-sm py-1">
                            {credit.credit_group === 'group' ? 'קבוצה' : 'פרטי'} - {credit.remaining_credits} זמינים
                          </option>
                        ))}
                      </select>
                      {errors.credit_type && (
                        <p className="text-red-500 text-xs mt-2">{errors.credit_type}</p>
                      )}
                  </div>
                  )}
                </div>
              )}
              </>
            ) : (
              <div className="text-center text-gray-500 py-4">
                יש לבחור משתמש תחילה
            </div>
            )}
          </div>
        ) : (
          // Editing existing registration
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 border border-[#EC4899]/10">
              <h4 className="text-sm font-semibold text-[#4B2E83] mb-3">פרטי הרשמה קיימת</h4>
              
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                  <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">
                    תאריך
                  </label>
                  <input
                    type="text"
                    value={formData.selected_date ? new Date(formData.selected_date).toLocaleDateString('he-IL') : ''}
                    onChange={(e) => onInputChange('selected_date', e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-[#EC4899]/20 rounded-xl bg-white"
                  />
              </div>
                
              <div>
                  <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">
                    שעה
                  </label>
                  <input
                    type="text"
                    value={formData.selected_time}
                    onChange={(e) => onInputChange('selected_time', e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-[#EC4899]/20 rounded-xl bg-white"
                  />
              </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 