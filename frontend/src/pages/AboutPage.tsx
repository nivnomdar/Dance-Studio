import React from 'react';
import { FaInstagram, FaWhatsapp, FaFacebook } from 'react-icons/fa';

function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FDF9F6] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-[#EC4899] mb-6 font-agrandir-grand">
            אודות הסטודיו
          </h1>
          <div className="w-24 h-1 bg-[#EC4899] mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <p className="text-lg text-[#2B2B2B] font-agrandir-regular">
              סטודיו Avigail Dance הוא בית חם ומקצועי לרקדניות המעוניינות ללמוד ריקוד על עקבים.
              הסטודיו שלנו מציע חוויה ייחודית המשלבת טכניקה, ביטחון עצמי והנאה.
            </p>
            <p className="text-lg text-[#2B2B2B] font-agrandir-regular">
              אנו מאמינים שכל אחת יכולה לרקוד, ומציעים שיעורים ברמות שונות - ממתחילות ועד מתקדמות.
              הצוות המקצועי שלנו מלווה כל רקדנית באופן אישי ומסייע לה להגיע להישגים.
            </p>
            <p className="text-lg text-[#2B2B2B] font-agrandir-regular">
              בסטודיו שלנו תמצאו אווירה תומכת, ציוד מקצועי, ומרחב נוח ללמידה ולתרגול.
              אנו מזמינים אתכן להצטרף למשפחת Avigail Dance ולגלות את הקסם של ריקוד על עקבים.
            </p>
          </div>
          <div className="relative h-[400px] rounded-lg overflow-hidden">
            <img
              src="/images/AboutMe.png"
              alt="סטודיו ריקוד"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-xl transform hover:scale-105 transition-transform duration-300">
            <div className="w-16 h-16 bg-[#4B2E83] rounded-full flex items-center justify-center mb-6 mx-auto">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-[#4B2E83] mb-4 font-agrandir-grand text-center">חזון</h3>
            <p className="text-[#2B2B2B] font-agrandir-regular text-center">
              לפתח דור חדש של רקדניות חזקות, בטוחות בעצמן ומוכשרות, המשלבות טכניקה מתקדמת עם ביטוי אישי ייחודי.
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-xl transform hover:scale-105 transition-transform duration-300">
            <div className="w-16 h-16 bg-[#4B2E83] rounded-full flex items-center justify-center mb-6 mx-auto">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-[#4B2E83] mb-4 font-agrandir-grand text-center">מטרה</h3>
            <p className="text-[#2B2B2B] font-agrandir-regular text-center">
              לספק חווית למידה מקצועית ואיכותית, המשלבת טכניקה מתקדמת עם פיתוח אישי, לכל רקדנית בכל רמה.
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-xl transform hover:scale-105 transition-transform duration-300">
            <div className="w-16 h-16 bg-[#4B2E83] rounded-full flex items-center justify-center mb-6 mx-auto">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-[#4B2E83] mb-4 font-agrandir-grand text-center">ערכים</h3>
            <p className="text-[#2B2B2B] font-agrandir-regular text-center">
              מקצועיות ברמה הגבוהה ביותר, מצוינות בכל היבט, תמיכה הדדית בקהילה חמה, ופיתוח אישי מתמיד.
            </p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-[#4B2E83] mb-8 font-agrandir-grand">צרו איתנו קשר</h2>
          <div className="flex justify-center space-x-6">
            <a
              href="https://www.instagram.com/avigailladani?igsh=MXc4ZXU5cGdsM3U2cw=="
              target="_blank"
              rel="noopener noreferrer"
              className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform duration-300"
            >
              <FaInstagram className="w-7 h-7" />
            </a>
            <a
              href="https://www.facebook.com/alina.ladani.2025?locale=he_IL"
              target="_blank"
              rel="noopener noreferrer"
              className="w-14 h-14 bg-[#1877F2] rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform duration-300"
            >
              <FaFacebook className="w-7 h-7" />
            </a>
            {/* WhatsApp Button */}
            <a 
              href="https://wa.me/972501234567" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex flex-col items-center p-3 rounded-lg group transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:-rotate-2 relative"
            >
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502.998l-2.497.832c-1.96.65-3.25 2.44-3.25 4.54v2a3 3 0 00.879 2.121c.387.25.81.379 1.23.379H19a2 2 0 002-2v-2.101a7 7 0 00-.08-.2L18.92 8.05a1 1 0 00-.502-.998l-2.497-.832A3 3 0 0014.72 4H11.44a1 1 0 01-.948-.684L9.4 1.684A3 3 0 007.905 1H4.72a2 2 0 01-2-2z" />
              </svg>
              <span className="text-white text-sm font-agrandir-regular mt-2">צור קשר</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutPage; 