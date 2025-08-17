import React from 'react';
import { Class } from '../types/class';
import { useAuth } from '../contexts/AuthContext';

interface SubscriptionRegistrationProps {
  classData: Class;
}

const SubscriptionRegistration: React.FC<SubscriptionRegistrationProps> = ({ classData }) => {
  const { user } = useAuth();

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg h-fit">
      <h2 className="text-2xl font-bold text-[#4B2E83] mb-4">הרשמה למנוי</h2>

      <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5 border border-[#EC4899]/20">
        <div className="flex items-center justify-between">
          <span className="text-[#4B2E83] font-medium">מחיר {classData.name}:</span>
          <span className="text-[#EC4899] font-bold text-xl">{classData.price} ש"ח</span>
        </div>
      </div>

      {!user ? (
        <div className="text-[#4B2E83]/80 text-sm">
          אנא התחברי כדי להירשם למנוי זה. לאחר ההתחברות תופיע אפשרות ההרשמה.
        </div>
      ) : (
        <div className="text-[#4B2E83]/80 text-sm">
          ההרשמה דרך קרדיטים תהיה זמינה בקרוב באתר. לביצוע הרשמה ידנית כעת, ניתן לפנות ב־Whatsapp.
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <a
          href="https://wa.me/972526646725"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full text-center bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white py-3 rounded-xl font-bold hover:from-[#4B2E83] hover:to-[#EC4899] transition-colors"
        >
          צרי קשר ב-Whatsapp
        </a>
        <a
          href="/contact"
          className="w-full text-center bg-gray-100 hover:bg-gray-200 text-[#4B2E83] py-3 rounded-xl font-medium transition-colors"
        >
          מעבר לצור קשר
        </a>
      </div>
    </div>
  );
};

export default SubscriptionRegistration;

