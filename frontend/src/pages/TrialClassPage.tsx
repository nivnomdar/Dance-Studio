import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaClock, FaUserGraduate, FaMapMarkerAlt, FaArrowLeft, FaCalendarAlt, FaUsers } from 'react-icons/fa';

function TrialClassPage() {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    experience: 'beginner'
  });

  const availableTimes = [
    '10:00',
    '11:30', 
    '13:00',
    '14:30',
    '16:00',
    '17:30',
    '19:00',
    '20:30'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // כאן יהיה הלוגיקה לשליחת הטופס
    console.log('Trial class registration:', { selectedDate, selectedTime, formData });
  };

  return (
    <div className="min-h-screen bg-[#FDF9F6] py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Link 
            to="/classes" 
            className="inline-flex items-center text-[#EC4899] hover:text-[#EC4899]/80 mb-6 transition-colors duration-200"
          >
            <FaArrowLeft className="w-4 h-4 ml-2" />
            חזרה לשיעורים
          </Link>
          <h1 className="text-5xl font-bold text-[#EC4899] mb-6 font-agrandir-grand">
            שיעור ניסיון
          </h1>
          <div className="w-24 h-1 bg-[#E6C17C] mx-auto mb-8"></div>
          <p className="text-xl text-[#2B2B2B] max-w-3xl mx-auto font-agrandir-regular leading-relaxed">
            הזדמנות מושלמת להתנסות בריקוד על עקבים ולהכיר את הסטודיו שלנו
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Class Details */}
          <div className="space-y-8">
            {/* Hero Image */}
            <div className="relative h-80 rounded-2xl overflow-hidden shadow-xl">
              <img
                src="/carousel/image1.png"
                alt="שיעור ניסיון"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-pink-500/60 to-transparent"></div>
              <div className="absolute bottom-4 right-4">
                <span className="bg-pink-500 text-white px-6 py-3 rounded-full text-lg font-bold shadow-lg">
                  60 ש"ח
                </span>
              </div>
            </div>

            {/* Class Information */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-3xl font-bold text-pink-600 mb-6 font-agrandir-grand">
                על השיעור
              </h2>
              <div className="space-y-6">
                <p className="text-[#2B2B2B] text-lg leading-relaxed font-agrandir-regular">
                  שיעור ניסיון ראשון במחיר מיוחד! זהו השיעור המושלם להתחיל את המסע שלך בעולם ריקוד העקבים.
                  בשיעור תכירי את הטכניקות הבסיסיות, תקבלי טעימה מהאווירה המיוחדת של הסטודיו,
                  ותחווי חוויה מקצועית ומהנה.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center text-pink-600">
                    <FaClock className="w-6 h-6 ml-3" />
                    <div>
                      <p className="font-bold">משך השיעור</p>
                      <p className="text-[#2B2B2B]">60 דקות</p>
                    </div>
                  </div>
                  <div className="flex items-center text-pink-600">
                    <FaUserGraduate className="w-6 h-6 ml-3" />
                    <div>
                      <p className="font-bold">רמה</p>
                      <p className="text-[#2B2B2B]">מתחילות</p>
                    </div>
                  </div>
                  <div className="flex items-center text-pink-600">
                    <FaUsers className="w-6 h-6 ml-3" />
                    <div>
                      <p className="font-bold">גודל קבוצה</p>
                      <p className="text-[#2B2B2B]">עד 5 משתתפות</p>
                    </div>
                  </div>
                  <div className="flex items-center text-pink-600">
                    <FaMapMarkerAlt className="w-6 h-6 ml-3" />
                    <div>
                      <p className="font-bold">מיקום הסטודיו</p>
                      <p className="text-[#2B2B2B]">רחוב יוסף לישנסקי 6, ראשון לציון</p>
                    </div>
                  </div>
                </div>

                {/* What's Included */}
                <div className="bg-pink-50 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-pink-600 mb-4 font-agrandir-grand">
                    מה כלול בשיעור?
                  </h3>
                  <ul className="space-y-2 text-[#2B2B2B]">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-pink-500 rounded-full ml-3"></span>
                      היכרות עם טכניקות בסיסיות בריקוד על עקבים
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-pink-500 rounded-full ml-3"></span>
                      חימום והכנה נכונה לגוף
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-pink-500 rounded-full ml-3"></span>
                      לימוד צעדים בסיסיים וריקוד קצר
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-pink-500 rounded-full ml-3"></span>
                      היכרות עם הסטודיו והמדריכות
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-pink-500 rounded-full ml-3"></span>
                      ייעוץ אישי לבחירת מסלול מתאים
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Registration Form */}
          <div className="bg-white rounded-2xl p-8 shadow-lg h-fit">
            <h2 className="text-3xl font-bold text-pink-600 mb-6 font-agrandir-grand">
              הרשמה לשיעור ניסיון
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Date Selection */}
              <div>
                <label className="block text-sm font-bold text-[#2B2B2B] mb-3">
                  <FaCalendarAlt className="w-4 h-4 inline ml-2" />
                  בחרי תאריך
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors duration-200"
                  required
                />
              </div>

              {/* Time Selection */}
              <div>
                <label className="block text-sm font-bold text-[#2B2B2B] mb-3">
                  <FaClock className="w-4 h-4 inline ml-2" />
                  בחרי שעה
                </label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors duration-200"
                  required
                >
                  <option value="">בחרי שעה מתאימה</option>
                  {availableTimes.map((time) => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>

              {/* Personal Information */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-[#2B2B2B] mb-2">
                    שם מלא
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#2B2B2B] mb-2">
                    מספר טלפון
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#2B2B2B] mb-2">
                    אימייל (אופציונלי)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#2B2B2B] mb-2">
                    ניסיון בריקוד
                  </label>
                  <select
                    value={formData.experience}
                    onChange={(e) => setFormData({...formData, experience: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors duration-200"
                  >
                    <option value="beginner">מתחילה - אין ניסיון</option>
                    <option value="some">יש לי קצת ניסיון</option>
                    <option value="intermediate">רמה בינונית</option>
                    <option value="advanced">רמה מתקדמת</option>
                  </select>
                </div>
              </div>

              {/* Price Summary */}
              <div className="bg-pink-50 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-[#2B2B2B]">מחיר שיעור ניסיון:</span>
                  <span className="text-2xl font-bold text-pink-600">60 ש"ח</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  התשלום יתבצע במקום לפני השיעור
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-pink-500 hover:bg-pink-600 text-white py-4 px-6 rounded-xl transition-colors duration-300 font-bold text-lg shadow-lg hover:shadow-xl"
              >
                הזמיני שיעור ניסיון
              </button>
            </form>

            {/* Additional Info */}
            <div className="mt-6 text-sm text-gray-600 space-y-2">
              <p>✓ ביטול חינם עד 24 שעות לפני השיעור</p>
              <p>✓  נא להגיע עם נעליים נוחות</p>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrialClassPage; 