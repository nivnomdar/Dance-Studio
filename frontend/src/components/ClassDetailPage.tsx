import React, { useState, useEffect, useRef, useCallback, memo, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FaClock, FaUserGraduate, FaMapMarkerAlt, FaArrowLeft, FaCalendarAlt, FaUsers, FaSignInAlt } from 'react-icons/fa';
import { FaWaze } from 'react-icons/fa';
import { classesService } from '../lib/classes';
import { Class } from '../types/class';
import { getColorScheme } from '../utils/colorUtils';
import { SkeletonBox, SkeletonText, SkeletonIcon, SkeletonInput, SkeletonButton } from './skeleton/SkeletonComponents';
import StandardRegistration from './StandardRegistration';
import RegistrationByAppointment from './RegistrationByAppointment';
import SubscriptionRegistration from './SubscriptionRegistration';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';


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
          <SkeletonBox key={index} className="h-16 rounded-xl" />
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

const ClassDetailPage = memo(function ClassDetailPage({ initialClass }: ClassDetailPageProps) {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  // State
  const [classData, setClassData] = useState<Class | null>(initialClass || null);
  const [loading, setLoading] = useState(!initialClass);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();

  const handleLogin = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/class/${classData?.slug}`
        }
      });
      
      if (error) {
        console.error('Error signing in:', error);
      }
    } catch (error) {
      console.error('Error signing in:', error);
    }
  }, [classData?.slug]);


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
        if (data) {
          setClassData(data);
        } else {
          setError('השיעור לא נמצא');
        }
      })
      .catch(err => setError(err instanceof Error ? err.message : 'שגיאה בטעינת השיעור'))
      .finally(() => setLoading(false));
  }, [slug, initialClass]);





  // הצג מסך טעינה רק אם טוענים את השיעור עצמו
  if (loading) {
    return <ClassDetailSkeleton />;
  }

  // אם אין נתוני שיעור עדיין, הצג skeleton
  if (!classData) {
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

          {/* Registration Component */}
          {!user ? (
            <div className="bg-white rounded-2xl p-8 shadow-lg h-fit">
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
                    <span className="text-2xl font-bold text-[#EC4899]">{classData.price} ש"ח</span>
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
            </div>
          ) : classData.category === 'subscription' ? (
            <SubscriptionRegistration classData={classData} />
          ) : classData.registration_type === 'appointment_only' ? (
            <RegistrationByAppointment classData={classData} />
          ) : (
            <StandardRegistration classData={classData} />
          )}
        </div>
      </div>
    </div>
  );
});

export default ClassDetailPage; 