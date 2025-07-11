import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FaClock, FaUserGraduate, FaMapMarkerAlt, FaArrowLeft, FaCalendarAlt, FaUsers, FaSignInAlt } from 'react-icons/fa';
import { FaWaze } from 'react-icons/fa';
import { classesService } from '../lib/classes';
import { registrationsService } from '../lib/registrations';
import { Class } from '../types/class';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { getAvailableDatesMessage, getAvailableDatesForButtons, getAvailableTimesForDate, getAvailableSpots } from '../utils/dateUtils';
import { getColorScheme } from '../utils/colorUtils';

interface ClassDetailPageProps {
  // אם לא מעבירים class, הקומפוננטה תטען אותו לפי slug
  initialClass?: Class;
}

function ClassDetailPage({ initialClass }: ClassDetailPageProps) {
  const { slug } = useParams<{ slug: string }>();
  const { user, loading: authLoading, session, profile, loadProfile } = useAuth();
  const [classData, setClassData] = useState<Class | null>(initialClass || null);
  const [loading, setLoading] = useState(!initialClass);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSpots, setAvailableSpots] = useState<{ [key: string]: { available: number; message: string } }>({});
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: ''
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error' | null; text: string }>({ type: null, text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // קבלת תאריכים זמינים לכפתורים
  const availableDates = getAvailableDatesForButtons(classData?.schedule);

  // פונקציה לבדיקת מקומות זמינים
  const checkAvailableSpots = async (date: string, time: string) => {
    if (!classData) return;
    
    const key = `${date}-${time}`;
    const spots = await getAvailableSpots(
      classData.id, 
      date, 
      time, 
      classData.max_participants || 10
    );
    
    setAvailableSpots(prev => ({
      ...prev,
      [key]: spots
    }));
  };

  // טעינת נתוני השיעור אם לא הועברו
  useEffect(() => {
    if (!initialClass && slug) {
      const fetchClass = async () => {
        try {
          setLoading(true);
          const data = await classesService.getClassBySlug(slug);
          if (data) {
            setClassData(data);
          } else {
            setError('השיעור לא נמצא');
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'שגיאה בטעינת השיעור');
        } finally {
          setLoading(false);
        }
      };
      fetchClass();
    }
  }, [slug, initialClass]);

  // טעינת מקומות זמינים כשנבחר תאריך
  useEffect(() => {
    if (selectedDate && classData) {
      const times = getAvailableTimesForDate(selectedDate, classData.schedule);
      times.forEach(time => {
        checkAvailableSpots(selectedDate, time);
      });
    }
  }, [selectedDate, classData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!classData) return;
    
    // בדיקה אם זה שיעור ניסיון והמשתמש כבר השתמש בו
    if (classData.slug === 'trial-class' && profile?.has_used_trial_class) {
      setMessage({ type: 'error', text: 'כבר השתמשת בשיעור ניסיון. לא ניתן להזמין שיעור ניסיון נוסף.' });
      return;
    }
    
    setIsSubmitting(true);
    setMessage({ type: null, text: '' });
    
    try {
      const registrationData = {
        class_id: classData.id,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        email: user?.email || '',
        selected_date: selectedDate,
        selected_time: selectedTime
      };
      
      // שליחה לשרת
      const result = await registrationsService.createRegistration(registrationData);
      
      // אם זה שיעור ניסיון, עדכן את הפרופיל
      if (classData.slug === 'trial-class') {
        await updateProfileTrialClass();
      }
      
      // הצגת הודעת הצלחה
      setMessage({ type: 'success', text: 'ההרשמה בוצעה בהצלחה!' });
      
      // איפוס הטופס
      setFormData({ first_name: '', last_name: '', phone: '' });
      setSelectedDate('');
      setSelectedTime('');
      
    } catch (error) {
      setMessage({ type: 'error', text: 'שגיאה בהרשמה. נסי שוב.' });
    } finally {
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

  // הצג מסך טעינה רק אם טוענים את השיעור עצמו, לא את ה-auth
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF9F6] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EC4899] mx-auto mb-4"></div>
          <p className="text-[#2B2B2B] font-agrandir-regular">טוען שיעור...</p>
        </div>
      </div>
    );
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
                
                {/* הודעות הצלחה/שגיאה */}
                {message.type && (
                  <div className={`p-4 rounded-xl border-2 ${
                    message.type === 'success' 
                      ? 'bg-green-50 border-green-200 text-green-800' 
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}>
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full mr-3 ${
                        message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <span className="font-bold">{message.text}</span>
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
                      {availableDates.map((date) => {
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
                              setSelectedTime(''); // איפוס השעה כשמשנים תאריך
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
                      })}
                    </div>
                    <p className="text-sm text-gray-500 mt-3 font-agrandir-regular">
                      {getAvailableDatesMessage(classData?.schedule)}
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
                        {getAvailableTimesForDate(selectedDate, classData.schedule).map((time) => {
                          const isSelected = selectedTime === time;
                          const spotsKey = `${selectedDate}-${time}`;
                          const spotsInfo = availableSpots[spotsKey];
                          
                          return (
                            <button
                              key={time}
                              type="button"
                              onClick={() => {
                                setSelectedTime(time);
                                if (!spotsInfo) {
                                  checkAvailableSpots(selectedDate, time);
                                }
                              }}
                              disabled={spotsInfo?.available === 0}
                              className={`
                                p-3 lg:p-4 rounded-xl border-2 transition-all duration-200 text-base lg:text-lg font-bold relative
                                ${isSelected 
                                  ? `${colors.bgColor} ${colors.hoverColor} text-white border-transparent shadow-lg` 
                                  : spotsInfo?.available === 0
                                  ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                                  : 'bg-white border-gray-200 hover:border-gray-300 text-[#2B2B2B] hover:shadow-md'
                                }
                              `}
                            >
                                                            <div className="text-center">
                                <div>{time}</div>
                                {spotsInfo?.message && (
                                  <div className={`text-xs mt-1 font-bold ${
                                    spotsInfo.available === 0 
                                      ? 'text-red-500' 
                                      : spotsInfo.available === 1 
                                        ? 'text-orange-500' 
                                        : 'text-green-500'
                                  }`}>
                                    {spotsInfo.message}
                                  </div>
                                )}
                              </div>
                            </button>
                          );
                        })}
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
                        placeholder="עדכני את מספר הטלפון שלך"
                        dir="rtl"
                        required
                      />
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
                      const spotsKey = `${selectedDate}-${selectedTime}`;
                      const spotsInfo = availableSpots[spotsKey];
                      return spotsInfo?.available === 0;
                    })()}
                    className={`w-full py-4 px-6 rounded-xl transition-colors duration-300 font-bold text-lg shadow-lg hover:shadow-xl ${
                      selectedDate && selectedTime && formData.first_name && formData.last_name && formData.phone && !isSubmitting && (() => {
                        const spotsKey = `${selectedDate}-${selectedTime}`;
                        const spotsInfo = availableSpots[spotsKey];
                        return spotsInfo?.available !== 0;
                      })()
                        ? `${colors.bgColor} ${colors.hoverColor} text-white`
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white ml-2"></div>
                        שולחת...
                      </div>
                    ) : !selectedDate ? 'בחרי תאריך תחילה' : !selectedTime ? 'בחרי שעה' : !formData.first_name ? 'מלאי שם פרטי' : !formData.last_name ? 'מלאי שם משפחה' : !formData.phone ? 'מלאי מספר טלפון' : (() => {
                      const spotsKey = `${selectedDate}-${selectedTime}`;
                      const spotsInfo = availableSpots[spotsKey];
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
    </div>
  );
}

export default ClassDetailPage; 