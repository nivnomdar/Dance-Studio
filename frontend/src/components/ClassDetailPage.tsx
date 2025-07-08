import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FaClock, FaUserGraduate, FaMapMarkerAlt, FaArrowLeft, FaCalendarAlt, FaUsers, FaStar, FaCheck, FaSignInAlt } from 'react-icons/fa';
import { FaWaze } from 'react-icons/fa';
import { classesService } from '../lib/classes';
import { Class, AvailableColorScheme } from '../types/class';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface ClassDetailPageProps {
  // אם לא מעבירים class, הקומפוננטה תטען אותו לפי slug
  initialClass?: Class;
}

function ClassDetailPage({ initialClass }: ClassDetailPageProps) {
  const { slug } = useParams<{ slug: string }>();
  const { user, loading: authLoading } = useAuth();
  const [classData, setClassData] = useState<Class | null>(initialClass || null);
  const [loading, setLoading] = useState(!initialClass);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    experience: 'beginner',
    message: ''
  });

  const availableTimes = [
    '18:00',
    '19:00',
    '20:00'
  ];

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

  // פונקציה לקבלת ערכת צבעים לפי שם הצבע
  const getColorScheme = (colorScheme?: AvailableColorScheme) => {
    const schemes = {
      pink: {
        gradient: 'from-pink-500 to-rose-500',
        textColor: 'text-pink-600',
        bgColor: 'bg-pink-500',
        hoverColor: 'hover:bg-pink-600',
        lightBg: 'bg-pink-50',
        focusRing: 'focus:ring-pink-500',
        focusBorder: 'focus:border-pink-500'
      },
      purple: {
        gradient: 'from-purple-500 to-indigo-500',
        textColor: 'text-purple-600',
        bgColor: 'bg-purple-500',
        hoverColor: 'hover:bg-purple-600',
        lightBg: 'bg-purple-50',
        focusRing: 'focus:ring-purple-500',
        focusBorder: 'focus:border-purple-500'
      },
      emerald: {
        gradient: 'from-emerald-500 to-teal-500',
        textColor: 'text-emerald-600',
        bgColor: 'bg-emerald-500',
        hoverColor: 'hover:bg-emerald-600',
        lightBg: 'bg-emerald-50',
        focusRing: 'focus:ring-emerald-500',
        focusBorder: 'focus:border-emerald-500'
      },
      blue: {
        gradient: 'from-blue-500 to-cyan-500',
        textColor: 'text-blue-600',
        bgColor: 'bg-blue-500',
        hoverColor: 'hover:bg-blue-600',
        lightBg: 'bg-blue-50',
        focusRing: 'focus:ring-blue-500',
        focusBorder: 'focus:border-blue-500'
      },
      red: {
        gradient: 'from-red-500 to-pink-500',
        textColor: 'text-red-600',
        bgColor: 'bg-red-500',
        hoverColor: 'hover:bg-red-600',
        lightBg: 'bg-red-50',
        focusRing: 'focus:ring-red-500',
        focusBorder: 'focus:border-red-500'
      },
      orange: {
        gradient: 'from-orange-500 to-red-500',
        textColor: 'text-orange-600',
        bgColor: 'bg-orange-500',
        hoverColor: 'hover:bg-orange-600',
        lightBg: 'bg-orange-50',
        focusRing: 'focus:ring-orange-500',
        focusBorder: 'focus:border-orange-500'
      },
      yellow: {
        gradient: 'from-yellow-500 to-orange-500',
        textColor: 'text-yellow-600',
        bgColor: 'bg-yellow-500',
        hoverColor: 'hover:bg-yellow-600',
        lightBg: 'bg-yellow-50',
        focusRing: 'focus:ring-yellow-500',
        focusBorder: 'focus:border-yellow-500'
      },
      green: {
        gradient: 'from-green-500 to-emerald-500',
        textColor: 'text-green-600',
        bgColor: 'bg-green-500',
        hoverColor: 'hover:bg-green-600',
        lightBg: 'bg-green-50',
        focusRing: 'focus:ring-green-500',
        focusBorder: 'focus:border-green-500'
      },
      teal: {
        gradient: 'from-teal-500 to-cyan-500',
        textColor: 'text-teal-600',
        bgColor: 'bg-teal-500',
        hoverColor: 'hover:bg-teal-600',
        lightBg: 'bg-teal-50',
        focusRing: 'focus:ring-teal-500',
        focusBorder: 'focus:border-teal-500'
      },
      cyan: {
        gradient: 'from-cyan-500 to-blue-500',
        textColor: 'text-cyan-600',
        bgColor: 'bg-cyan-500',
        hoverColor: 'hover:bg-cyan-600',
        lightBg: 'bg-cyan-50',
        focusRing: 'focus:ring-cyan-500',
        focusBorder: 'focus:border-cyan-500'
      },
      indigo: {
        gradient: 'from-indigo-500 to-purple-500',
        textColor: 'text-indigo-600',
        bgColor: 'bg-indigo-500',
        hoverColor: 'hover:bg-indigo-600',
        lightBg: 'bg-indigo-50',
        focusRing: 'focus:ring-indigo-500',
        focusBorder: 'focus:border-indigo-500'
      },
      violet: {
        gradient: 'from-violet-500 to-purple-500',
        textColor: 'text-violet-600',
        bgColor: 'bg-violet-500',
        hoverColor: 'hover:bg-violet-600',
        lightBg: 'bg-violet-50',
        focusRing: 'focus:ring-violet-500',
        focusBorder: 'focus:border-violet-500'
      },
      fuchsia: {
        gradient: 'from-fuchsia-500 to-pink-500',
        textColor: 'text-fuchsia-600',
        bgColor: 'bg-fuchsia-500',
        hoverColor: 'hover:bg-fuchsia-600',
        lightBg: 'bg-fuchsia-50',
        focusRing: 'focus:ring-fuchsia-500',
        focusBorder: 'focus:border-fuchsia-500'
      },
      rose: {
        gradient: 'from-rose-500 to-pink-500',
        textColor: 'text-rose-600',
        bgColor: 'bg-rose-500',
        hoverColor: 'hover:bg-rose-600',
        lightBg: 'bg-rose-50',
        focusRing: 'focus:ring-rose-500',
        focusBorder: 'focus:border-rose-500'
      },
      slate: {
        gradient: 'from-slate-500 to-gray-500',
        textColor: 'text-slate-600',
        bgColor: 'bg-slate-500',
        hoverColor: 'hover:bg-slate-600',
        lightBg: 'bg-slate-50',
        focusRing: 'focus:ring-slate-500',
        focusBorder: 'focus:border-slate-500'
      },
      gray: {
        gradient: 'from-gray-500 to-slate-500',
        textColor: 'text-gray-600',
        bgColor: 'bg-gray-500',
        hoverColor: 'hover:bg-gray-600',
        lightBg: 'bg-gray-50',
        focusRing: 'focus:ring-gray-500',
        focusBorder: 'focus:border-gray-500'
      },
      zinc: {
        gradient: 'from-zinc-500 to-gray-500',
        textColor: 'text-zinc-600',
        bgColor: 'bg-zinc-500',
        hoverColor: 'hover:bg-zinc-600',
        lightBg: 'bg-zinc-50',
        focusRing: 'focus:ring-zinc-500',
        focusBorder: 'focus:border-zinc-500'
      },
      neutral: {
        gradient: 'from-neutral-500 to-gray-500',
        textColor: 'text-neutral-600',
        bgColor: 'bg-neutral-500',
        hoverColor: 'hover:bg-neutral-600',
        lightBg: 'bg-neutral-50',
        focusRing: 'focus:ring-neutral-500',
        focusBorder: 'focus:border-neutral-500'
      },
      stone: {
        gradient: 'from-stone-500 to-gray-500',
        textColor: 'text-stone-600',
        bgColor: 'bg-stone-500',
        hoverColor: 'hover:bg-stone-600',
        lightBg: 'bg-stone-50',
        focusRing: 'focus:ring-stone-500',
        focusBorder: 'focus:border-stone-500'
      },
      amber: {
        gradient: 'from-amber-500 to-orange-500',
        textColor: 'text-amber-600',
        bgColor: 'bg-amber-500',
        hoverColor: 'hover:bg-amber-600',
        lightBg: 'bg-amber-50',
        focusRing: 'focus:ring-amber-500',
        focusBorder: 'focus:border-amber-500'
      },
      lime: {
        gradient: 'from-lime-500 to-green-500',
        textColor: 'text-lime-600',
        bgColor: 'bg-lime-500',
        hoverColor: 'hover:bg-lime-600',
        lightBg: 'bg-lime-50',
        focusRing: 'focus:ring-lime-500',
        focusBorder: 'focus:border-lime-500'
      }
    };
    
    return schemes[colorScheme || 'pink'] || schemes.pink;
  };



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // כאן יהיה הלוגיקה לשליחת הטופס
    console.log('Class registration:', { selectedDate, selectedTime, formData, classData });
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
      console.error('Error logging in with Google:', error);
    }
  };

  if (loading || authLoading) {
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

  const colors = getColorScheme(classData.color_scheme);

  return (
    <div className="min-h-screen bg-[#FDF9F6] py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Link 
            to="/classes" 
            className="inline-flex items-center text-[#EC4899] hover:text-[#EC4899]/80 mb-6 transition-colors duration-200 relative z-10"
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Class Details */}
          <div className="space-y-8">
            {/* Hero Image */}
            <div className="relative h-80 rounded-2xl overflow-hidden shadow-xl">
              <img
                src={classData.image_url || '/carousel/image1.png'}
                alt={classData.name}
                className="w-full h-full object-cover"
              />

              <div className="absolute bottom-4 right-4">
                <span className={`${colors.bgColor} text-white px-6 py-3 rounded-full text-lg font-bold shadow-lg`}>
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {classData.duration && (
                    <div className={`flex items-center ${colors.textColor}`}>
                      <FaClock className="w-6 h-6 ml-3" />
                      <div>
                        <p className="font-bold">משך השיעור</p>
                        <p className="text-[#2B2B2B]">{classData.duration} דקות</p>
                      </div>
                    </div>
                  )}
                  {classData.level && (
                    <div className={`flex items-center ${colors.textColor}`}>
                      <FaUserGraduate className="w-6 h-6 ml-3" />
                      <div>
                        <p className="font-bold">רמה</p>
                        <p className="text-[#2B2B2B]">{classData.level}</p>
                      </div>
                    </div>
                  )}
                  {classData.max_participants && (
                    <div className={`flex items-center ${colors.textColor}`}>
                      <FaUsers className="w-6 h-6 ml-3" />
                      <div>
                        <p className="font-bold">גודל קבוצה</p>
                        <p className="text-[#2B2B2B]">עד {classData.max_participants} משתתפות</p>
                      </div>
                    </div>
                  )}
                  <div className={`flex items-center ${colors.textColor}`}>
                    <FaMapMarkerAlt className="w-6 h-6 ml-3" />
                    <div>
                      <p className="font-bold">מיקום הסטודיו</p>
                      <p className="text-[#2B2B2B]">רחוב יוסף לישנסקי 6 ראשון לציון ישראל</p>
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
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Date and Time Selection */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-[#2B2B2B] mb-3">
                        <FaCalendarAlt className="w-4 h-4 inline ml-2" />
                        תאריך השיעור
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          onClick={(e) => e.currentTarget.showPicker?.()}
                          min={new Date().toISOString().split('T')[0]}
                          className={`w-full px-4 py-3 pl-12 pr-4 border-2 border-gray-200 rounded-xl ${colors.focusRing} ${colors.focusBorder} transition-all duration-200 bg-white hover:border-gray-300 focus:border-${colors.textColor.replace('text-', '')} focus:shadow-lg cursor-pointer`}
                          required
                          placeholder="בחרי תאריך"
                        />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <FaCalendarAlt className={`w-5 h-5 ${selectedDate ? colors.textColor : 'text-gray-400'}`} />
                        </div>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <svg className={`w-5 h-5 ${selectedDate ? colors.textColor : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                        {selectedDate && (
                          <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                            <div className={`w-2 h-2 ${colors.bgColor} rounded-full`}></div>
                          </div>
                        )}
                      </div>
                      {selectedDate && (
                        <p className="text-sm text-gray-600 mt-2 font-agrandir-regular">
                          נבחר: {new Date(selectedDate).toLocaleDateString('he-IL', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-[#2B2B2B] mb-3">
                        <FaClock className="w-4 h-4 inline ml-2" />
                        שעת השיעור
                      </label>
                      <div className="relative">
                        <select
                          value={selectedTime}
                          onChange={(e) => setSelectedTime(e.target.value)}
                          className={`w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl ${colors.focusRing} ${colors.focusBorder} transition-all duration-200 bg-white hover:border-gray-300 focus:border-${colors.textColor.replace('text-', '')} focus:shadow-lg appearance-none cursor-pointer`}
                          required
                        >
                          <option value="">בחרי שעה</option>
                          {availableTimes.map((time) => (
                            <option key={time} value={time}>{time}</option>
                          ))}
                        </select>
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <FaClock className={`w-5 h-5 ${selectedTime ? colors.textColor : 'text-gray-400'}`} />
                        </div>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <svg className={`w-5 h-5 ${selectedTime ? colors.textColor : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                        {selectedTime && (
                          <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                            <div className={`w-2 h-2 ${colors.bgColor} rounded-full`}></div>
                          </div>
                        )}
                      </div>
                      {selectedTime && (
                        <p className="text-sm text-gray-600 mt-2 font-agrandir-regular">
                          נבחרה: {selectedTime}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Personal Information */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-[#2B2B2B] mb-3">
                        שם מלא
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className={`w-full px-4 py-3 border-2 border-gray-200 rounded-xl ${colors.focusRing} ${colors.focusBorder} transition-all duration-200 bg-white hover:border-gray-300 focus:border-${colors.textColor.replace('text-', '')} focus:shadow-lg`}
                        placeholder="הכנסי את שמך המלא"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-[#2B2B2B] mb-3">
                        מספר טלפון
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className={`w-full px-4 py-3 border-2 border-gray-200 rounded-xl ${colors.focusRing} ${colors.focusBorder} transition-all duration-200 bg-white hover:border-gray-300 focus:border-${colors.textColor.replace('text-', '')} focus:shadow-lg`}
                        placeholder="הכנסי מספר טלפון"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-[#2B2B2B] mb-3">
                        אימייל (אופציונלי)
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className={`w-full px-4 py-3 border-2 border-gray-200 rounded-xl ${colors.focusRing} ${colors.focusBorder} transition-all duration-200 bg-white hover:border-gray-300 focus:border-${colors.textColor.replace('text-', '')} focus:shadow-lg`}
                        placeholder="הכנסי כתובת אימייל"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-[#2B2B2B] mb-3">
                        ניסיון בריקוד
                      </label>
                      <div className="relative">
                        <select
                          value={formData.experience}
                          onChange={(e) => setFormData({...formData, experience: e.target.value})}
                          className={`w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl ${colors.focusRing} ${colors.focusBorder} transition-all duration-200 bg-white hover:border-gray-300 focus:border-${colors.textColor.replace('text-', '')} focus:shadow-lg appearance-none cursor-pointer`}
                        >
                          <option value="beginner">מתחילה - אין ניסיון</option>
                          <option value="some">יש לי קצת ניסיון</option>
                          <option value="intermediate">רמה בינונית</option>
                          <option value="advanced">רמה מתקדמת</option>
                        </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-[#2B2B2B] mb-3">
                        הודעה נוספת (אופציונלי)
                      </label>
                      <textarea
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        rows={4}
                        placeholder="ספרי לי על המטרות שלך, סגנון מועדף, או כל דבר אחר שתרצי שאדע..."
                        className={`w-full px-4 py-3 border-2 border-gray-200 rounded-xl ${colors.focusRing} ${colors.focusBorder} transition-all duration-200 bg-white hover:border-gray-300 focus:border-${colors.textColor.replace('text-', '')} focus:shadow-lg resize-none`}
                      />
                    </div>
                  </div>

                  {/* Price Summary */}
                  <div className={`${colors.lightBg} rounded-xl p-4`}>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-[#2B2B2B]">מחיר {classData.name}:</span>
                      <span className={`text-2xl font-bold ${colors.textColor}`}>{classData.price} ש"ח</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      התשלום יתבצע במקום לפני השיעור
                    </p>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className={`w-full ${colors.bgColor} ${colors.hoverColor} text-white py-4 px-6 rounded-xl transition-colors duration-300 font-bold text-lg shadow-lg hover:shadow-xl`}
                  >
                    הזמיני {classData.name}
                  </button>
                </form>

                {/* Additional Info */}
                <div className="mt-6 text-sm text-gray-600 space-y-2">
                  <p>✓ ביטול חינם עד 24 שעות לפני השיעור</p>
                  <p>✓ נא להגיע עם נעליים נוחות</p>
                  <p>✓ השיעור מתאים לכל הרמות</p>
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