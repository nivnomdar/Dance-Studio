import React from 'react';
import { FaPhone, FaWhatsapp, FaEnvelope, FaCalendarAlt, FaClock, FaMapMarkerAlt } from 'react-icons/fa';
import { FaWaze } from 'react-icons/fa';
import { Class } from '../types/class';
import { getColorScheme } from '../utils/colorUtils';

interface RegistrationByAppointmentProps {
  classData: Class;
}

const RegistrationByAppointment: React.FC<RegistrationByAppointmentProps> = ({ classData }) => {
  const colors = getColorScheme('pink'); // תמיד ורוד לפרטי שיעור

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg h-fit">
      <div className="text-center mb-8">
        <div className={`w-16 h-16 ${colors.bgColor} rounded-full flex items-center justify-center mx-auto mb-6`}>
          <FaCalendarAlt className="w-8 h-8 text-white" />
        </div>
        
                            <h2 className={`text-3xl font-bold ${colors.textColor} mb-4 font-agrandir-grand`}>
                      תיאום לשיעור: {classData.name}
                    </h2>

                    <p className="text-[#2B2B2B] mb-6 font-agrandir-regular leading-relaxed">
                      שיעור זה דורש תיאום מראש עם המורה.
                      <br />
                      אנא צרי קשר לתיאום זמן מתאים עבורך.
                    </p>
      </div>

      {/* Class Information */}
      <div className={`${colors.lightBg} rounded-xl p-6 mb-8`}>
        <h3 className={`text-xl font-bold ${colors.textColor} mb-4 font-agrandir-grand`}>
          פרטי השיעור
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center">
            <FaClock className={`w-5 h-5 ${colors.textColor} ml-3 flex-shrink-0`} />
            <div>
              <p className="font-bold text-[#2B2B2B]">משך השיעור</p>
              <p className="text-[#2B2B2B]">{classData.duration || 60} דקות</p>
            </div>
          </div>
          
          {classData.level && (
            <div className="flex items-center">
              <FaCalendarAlt className={`w-5 h-5 ${colors.textColor} ml-3 flex-shrink-0`} />
              <div>
                <p className="font-bold text-[#2B2B2B]">רמה</p>
                <p className="text-[#2B2B2B]">{classData.level}</p>
              </div>
            </div>
          )}
          
          <div className="flex items-center">
            <FaMapMarkerAlt className={`w-5 h-5 ${colors.textColor} ml-3 flex-shrink-0`} />
            <div>
              <p className="font-bold text-[#2B2B2B]">מיקום הסטודיו</p>
              <p className="text-[#2B2B2B]">יוסף לישנסקי 6, ראשון לציון</p>
              <a 
                href="https://ul.waze.com/ul?place=EitZb3NlZiBMaXNoYW5za2kgQmx2ZCwgUmlzaG9uIExlWmlvbiwgSXNyYWVsIi4qLAoUChIJyUzrhYSzAhURYAgXG887oa8SFAoSCf9mqyc4tAIVEbh6GldKxbwX&ll=31.99049600%2C34.76588500&navigate=yes&utm_campaign=default&utm_source=waze_website&utm_medium=lm_share_location" 
                target="_blank" 
                rel="noopener noreferrer"
                className={`${colors.textColor.replace('text-', 'text-').replace('-600', '-500')} hover:${colors.textColor} text-sm underline transition-colors duration-200 inline-flex items-center mt-1`}
              >
                <FaWaze className="w-4 h-4 ml-1" />
                מיקום בוויז
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Price Information */}
      <div className={`${colors.lightBg} rounded-xl p-4 mb-8`}>
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-[#2B2B2B]">מחיר {classData.name}:</span>
          <span className={`text-2xl font-bold ${colors.textColor}`}>{classData.price} ש"ח</span>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          המחיר נקבע בתיאום עם המורה
        </p>
      </div>

      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className={`text-xl font-bold ${colors.textColor} mb-4 font-agrandir-grand`}>
          צרי קשר לתיאום
        </h3>
        
        <div className="space-y-3">
          <a
            href="tel:+972-50-1234567"
            className={`flex items-center justify-center w-full ${colors.bgColor} ${colors.hoverColor} text-white py-3 px-6 rounded-xl transition-colors duration-300 font-bold shadow-lg hover:shadow-xl`}
          >
            <FaPhone className="w-5 h-5 ml-2" />
            התקשרי עכשיו
          </a>
          
          <a
            href="https://wa.me/972501234567?text=שלום! אני מעוניינת בתיאום שיעור אישי"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-full bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-xl transition-colors duration-300 font-bold shadow-lg hover:shadow-xl"
          >
            <FaWhatsapp className="w-5 h-5 ml-2" />
            שלחי הודעה בווטסאפ
          </a>
          
          <a
            href="mailto:info@ladances.com?subject=תיאום שיעור אישי"
            className="flex items-center justify-center w-full bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-xl transition-colors duration-300 font-bold shadow-lg hover:shadow-xl"
          >
            <FaEnvelope className="w-5 h-5 ml-2" />
            שלחי אימייל
          </a>
        </div>
      </div>

      {/* Additional Information */}
      <div className="mt-8 text-sm text-gray-600 space-y-2">
        <p>✓ גמישות בבחירת התאריך והשעה</p>
        <p>✓ התאמה אישית לצרכים שלך</p>
        <p>✓ תשומת לב מלאה מהמורה</p>
        <p>✓ התקדמות בקצב שלך</p>
      </div>
    </div>
  );
};

export default RegistrationByAppointment; 