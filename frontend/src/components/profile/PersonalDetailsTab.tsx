import React, { useState } from 'react';
import type { UserProfile } from '../../types/auth';

interface PersonalDetailsTabProps {
  user: any;
  localProfile: UserProfile | null;
  formData: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    postalCode: string;
    termsAccepted: boolean;
    marketingConsent: boolean;
  };
  isEditing: boolean;
  isLoading: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onToggleEdit: () => void;
}

const PersonalDetailsTab: React.FC<PersonalDetailsTabProps> = ({
  user,
  localProfile,
  formData,
  isEditing,
  isLoading,
  onInputChange,
  onCheckboxChange,
  onSubmit,
  onToggleEdit
}) => {
  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl overflow-hidden border border-[#EC4899]/10">
      {/* Form Header */}
      <div className="bg-gradient-to-r from-[#4B2E83] to-[#EC4899] px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white font-agrandir-grand">
              פרטים אישיים
            </h3>
            <p className="text-white/80 text-xs sm:text-sm mt-1">
              עדכני את המידע האישי שלך
            </p>
          </div>
          <button
            onClick={onToggleEdit}
            className={`px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-lg sm:rounded-xl font-medium transition-all duration-200 text-xs sm:text-sm ${
              isEditing 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-white text-[#4B2E83] hover:bg-gray-50 hover:scale-105'
            }`}
          >
            {isEditing ? 'ביטול עריכה' : 'עריכת פרופיל'}
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-4 sm:p-6 lg:p-8">
        <form onSubmit={onSubmit} className="space-y-4 sm:space-y-6 lg:space-y-8">
          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {/* שם פרטי */}
            <div className="space-y-1 sm:space-y-2">
              <label className="block text-xs sm:text-sm font-semibold text-[#4B2E83] mb-2 sm:mb-3">
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  שם פרטי
                </span>
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={onInputChange}
                disabled={!isEditing}
                placeholder="הכניסי שם פרטי"
                className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border-2 border-[#4B2E83]/10 focus:border-[#EC4899] focus:ring-2 sm:focus:ring-4 focus:ring-[#EC4899]/10 outline-none transition-all duration-200 disabled:bg-gray-50 disabled:text-gray-500 text-right text-sm"
              />
            </div>

            {/* שם משפחה */}
            <div className="space-y-1 sm:space-y-2">
              <label className="block text-xs sm:text-sm font-semibold text-[#4B2E83] mb-2 sm:mb-3">
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  שם משפחה
                </span>
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={onInputChange}
                disabled={!isEditing}
                placeholder="הכניסי שם משפחה"
                className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border-2 border-[#4B2E83]/10 focus:border-[#EC4899] focus:ring-2 sm:focus:ring-4 focus:ring-[#EC4899]/10 outline-none transition-all duration-200 disabled:bg-gray-50 disabled:text-gray-500 text-right text-sm"
              />
            </div>

            {/* טלפון */}
            <div className="space-y-1 sm:space-y-2">
              <label className="block text-xs sm:text-sm font-semibold text-[#4B2E83] mb-2 sm:mb-3">
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  טלפון
                </span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={onInputChange}
                disabled={!isEditing}
                placeholder="הכניסי מספר טלפון"
                className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border-2 border-[#4B2E83]/10 focus:border-[#EC4899] focus:ring-2 sm:focus:ring-4 focus:ring-[#EC4899]/10 outline-none transition-all duration-200 disabled:bg-gray-50 disabled:text-gray-500 text-right text-sm"
              />
            </div>

            {/* אימייל */}
            <div className="space-y-1 sm:space-y-2">
              <label className="block text-xs sm:text-sm font-semibold text-[#4B2E83] mb-2 sm:mb-3">
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  אימייל
                </span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border-2 border-[#4B2E83]/10 bg-gray-50 text-gray-500 text-right cursor-not-allowed text-sm"
              />
            </div>

            {/* כתובת */}
            <div className="space-y-1 sm:space-y-2">
              <label className="block text-xs sm:text-sm font-semibold text-[#4B2E83] mb-2 sm:mb-3">
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  כתובת
                </span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={onInputChange}
                disabled={!isEditing}
                placeholder="הכניסי כתובת מלאה"
                className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border-2 border-[#4B2E83]/10 focus:border-[#EC4899] focus:ring-2 sm:focus:ring-4 focus:ring-[#EC4899]/10 outline-none transition-all duration-200 disabled:bg-gray-50 disabled:text-gray-500 text-right text-sm"
              />
            </div>

            {/* עיר */}
            <div className="space-y-1 sm:space-y-2">
              <label className="block text-xs sm:text-sm font-semibold text-[#4B2E83] mb-2 sm:mb-3">
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  עיר
                </span>
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={onInputChange}
                disabled={!isEditing}
                placeholder="הכניסי שם העיר"
                className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border-2 border-[#4B2E83]/10 focus:border-[#EC4899] focus:ring-2 sm:focus:ring-4 focus:ring-[#EC4899]/10 outline-none transition-all duration-200 disabled:bg-gray-50 disabled:text-gray-500 text-right text-sm"
              />
            </div>

            {/* מיקוד */}
            <div className="space-y-1 sm:space-y-2">
              <label className="block text-xs sm:text-sm font-semibold text-[#4B2E83] mb-2 sm:mb-3">
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  מיקוד
                </span>
              </label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={onInputChange}
                disabled={!isEditing}
                placeholder="הכניסי מיקוד"
                className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border-2 border-[#4B2E83]/10 focus:border-[#EC4899] focus:ring-2 sm:focus:ring-4 focus:ring-[#EC4899]/10 outline-none transition-all duration-200 disabled:bg-gray-50 disabled:text-gray-500 text-right text-sm"
              />
            </div>
          </div>

          {/* Consent Fields */}
          <div className="space-y-4 sm:space-y-6 border-t border-[#4B2E83]/10 pt-4 sm:pt-6">
            <h4 className="text-sm sm:text-base font-semibold text-[#4B2E83] mb-3 sm:mb-4">
              הגדרות הסכמה
            </h4>
            
            {/* Terms Accepted - Read Only */}
            <div className="flex items-start space-x-3 space-x-reverse">
              <input
                type="checkbox"
                id="termsAccepted"
                name="termsAccepted"
                checked={formData.termsAccepted}
                disabled={true}
                className="mt-1 w-4 h-4 text-[#EC4899] bg-gray-100 border-gray-300 rounded opacity-50 cursor-not-allowed"
              />
              <label htmlFor="termsAccepted" className="text-sm text-gray-700 leading-relaxed">
                אני מסכימה לתנאי השימוש של הסטודיו
                <span className="text-xs text-gray-500 block mt-1">(לא ניתן לשינוי - terms_accepted)</span>
              </label>
            </div>

            {/* Marketing Consent - Editable */}
            <div className="flex items-start space-x-3 space-x-reverse">
              <input
                type="checkbox"
                id="marketingConsent"
                name="marketingConsent"
                checked={formData.marketingConsent}
                onChange={onCheckboxChange}
                disabled={!isEditing}
                className="mt-1 w-4 h-4 text-[#EC4899] bg-gray-100 border-gray-300 rounded focus:ring-[#EC4899] focus:ring-2 disabled:opacity-50"
              />
              <label htmlFor="marketingConsent" className="text-sm text-gray-700 leading-relaxed">
                אני מסכימה לקבל עדכונים ומבצעים מהסטודיו
                <span className="text-xs text-gray-500 block mt-1">(ניתן לשינוי - marketing_consent)</span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          {isEditing && (
            <div className="flex justify-end pt-4 sm:pt-6 border-t border-[#4B2E83]/10">
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-4 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded-lg sm:rounded-xl font-semibold hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    שומר...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    שמור שינויים
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default PersonalDetailsTab; 