import React from 'react';

interface PersonalDetailsTabProps {
  formData: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    postalCode: string;
  };
  loadingConsents: boolean;
  isEditing: boolean;
  isLoading: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onToggleEdit: () => void;
  localMarketingConsent: boolean;
  onLocalMarketingConsentChange: (checked: boolean) => void;
}

const PersonalDetailsTab: React.FC<PersonalDetailsTabProps> = ({
  formData,
  isEditing,
  isLoading,
  onInputChange,
  onSubmit,
  onToggleEdit,
  loadingConsents,
  localMarketingConsent,
  onLocalMarketingConsentChange,
}) => {
  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl overflow-hidden border border-[#EC4899]/10">
      {/* Form Header */}
      <div className="bg-gradient-to-r from-[#4B2E83] to-[#EC4899] px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6">
        <div className="flex flex-row items-center justify-between gap-3 sm:gap-0">
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
            } focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:border-2 focus:border-black`}
          >
            {isEditing ? 'ביטול עריכה' : 'עריכת פרופיל'}
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-4 sm:p-6 lg:p-8">
        <form onSubmit={onSubmit} className="space-y-4 sm:space-y-6 lg:space-y-8">
          {/* Form Fields */}
          <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
              {/* שם פרטי */}
              <div className="space-y-1 sm:space-y-2">
                <label htmlFor="firstName" className="block text-xs sm:text-sm font-semibold text-[#4B2E83] mb-2 sm:mb-3">
                  <span className="flex items-center">
                    שם פרטי
                  </span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={onInputChange}
                  disabled={!isEditing}
                  placeholder="הכניסי שם פרטי"
                  className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border-2 border-[#4B2E83]/10 focus:border-[#EC4899] focus:ring-2 sm:focus:ring-4 focus:ring-[#EC4899]/10 outline-none transition-all duration-200 disabled:bg-gray-50 disabled:text-gray-500 text-right text-sm focus:outline-none focus:ring-2 focus:ring-[#4B2E83] focus:ring-offset-2 focus:border-2 focus:border-[#4B2E83]"
                />
              </div>

              {/* שם משפחה */}
              <div className="space-y-1 sm:space-y-2">
                <label htmlFor="lastName" className="block text-xs sm:text-sm font-semibold text-[#4B2E83] mb-2 sm:mb-3">
                  <span className="flex items-center">
                    שם משפחה
                  </span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={onInputChange}
                  disabled={!isEditing}
                  placeholder="הכניסי שם משפחה"
                  className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border-2 border-[#4B2E83]/10 focus:border-[#EC4899] focus:ring-2 sm:focus:ring-4 focus:ring-[#EC4899]/10 outline-none transition-all duration-200 disabled:bg-gray-50 disabled:text-gray-500 text-right text-sm focus:outline-none focus:ring-2 focus:ring-[#4B2E83] focus:ring-offset-2 focus:border-2 focus:border-[#4B2E83]"
                />
              </div>
            </div>

            {/* Contact Fields */}
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
              {/* טלפון */}
              <div className="space-y-1 sm:space-y-2">
                <label htmlFor="phone" className="block text-xs sm:text-sm font-semibold text-[#4B2E83] mb-2 sm:mb-3">
                  <span className="flex items-center">
                    טלפון
                  </span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={onInputChange}
                  disabled={!isEditing}
                  placeholder="הכניסי מספר טלפון"
                  className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border-2 border-[#4B2E83]/10 focus:border-[#EC4899] focus:ring-2 sm:focus:ring-4 focus:ring-[#EC4899]/10 outline-none transition-all duration-200 disabled:bg-gray-50 disabled:text-gray-500 text-left text-sm focus:outline-none focus:ring-2 focus:ring-[#4B2E83] focus:ring-offset-2 focus:border-2 focus:border-[#4B2E83]"
                />
              </div>

              {/* אימייל */}
              <div className="space-y-1 sm:space-y-2">
                <label htmlFor="email" className="block text-xs sm:text-sm font-semibold text-[#4B2E83] mb-2 sm:mb-3">
                  <span className="flex items-center">
                    אימייל
                  </span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  disabled
                  aria-label="כתובת אימייל, לא ניתן לעריכה"
                  className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border-2 border-[#4B2E83]/10 bg-gray-50 text-gray-500 text-left cursor-not-allowed text-sm focus:outline-none focus:ring-2 focus:ring-[#4B2E83] focus:ring-offset-2 focus:border-2 focus:border-[#4B2E83]"
                />
              </div>
            </div>

            {/* Address Fields */}
            <div className="grid grid-cols-3 gap-4 sm:gap-6 lg:gap-8 col-span-full">
              {/* כתובת */}
              <div className="space-y-1 sm:space-y-2">
                <label htmlFor="address" className="block text-xs sm:text-sm font-semibold text-[#4B2E83] mb-2 sm:mb-3">
                  <span className="flex items-center">
                    כתובת
                  </span>
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={onInputChange}
                  disabled={!isEditing}
                  placeholder="הכניסי כתובת מלאה"
                  className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border-2 border-[#4B2E83]/10 focus:border-[#EC4899] focus:ring-2 sm:focus:ring-4 focus:ring-[#EC4899]/10 outline-none transition-all duration-200 disabled:bg-gray-50 disabled:text-gray-500 text-right text-sm focus:outline-none focus:ring-2 focus:ring-[#4B2E83] focus:ring-offset-2 focus:border-2 focus:border-[#4B2E83]"
                />
              </div>

              {/* עיר */}
              <div className="space-y-1 sm:space-y-2">
                <label htmlFor="city" className="block text-xs sm:text-sm font-semibold text-[#4B2E83] mb-2 sm:mb-3">
                  <span className="flex items-center">
                    עיר
                  </span>
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={onInputChange}
                  disabled={!isEditing}
                  placeholder="הכניסי שם העיר"
                  className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border-2 border-[#4B2E83]/10 focus:border-[#EC4899] focus:ring-2 sm:focus:ring-4 focus:ring-[#EC4899]/10 outline-none transition-all duration-200 disabled:bg-gray-50 disabled:text-gray-500 text-right text-sm focus:outline-none focus:ring-2 focus:ring-[#4B2E83] focus:ring-offset-2 focus:border-2 focus:border-[#4B2E83]"
                />
              </div>

              {/* מיקוד */}
              <div className="space-y-1 sm:space-y-2">
                <label htmlFor="postalCode" className="block text-xs sm:text-sm font-semibold text-[#4B2E83] mb-2 sm:mb-3">
                  <span className="flex items-center">
                    מיקוד
                  </span>
                </label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={onInputChange}
                  disabled={!isEditing}
                  placeholder="הכניסי מיקוד"
                  className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border-2 border-[#4B2E83]/10 focus:border-[#EC4899] focus:ring-2 sm:focus:ring-4 focus:ring-[#EC4899]/10 outline-none transition-all duration-200 disabled:bg-gray-50 disabled:text-gray-500 text-right text-sm focus:outline-none focus:ring-2 focus:ring-[#4B2E83] focus:ring-offset-2 focus:border-2 focus:border-[#4B2E83]"
                />
              </div>
            </div>
          </div>

          {/* Consent Fields */}
          <div className="space-y-4 sm:space-y-6 border-t border-[#4B2E83]/10 pt-4 sm:pt-6">
            <h4 className="text-sm sm:text-base font-semibold text-[#4B2E83] mb-3 sm:mb-4 flex items-center gap-2" id="consent-settings-heading">
              הגדרות הסכמה
            </h4>
            
            <div className="bg-gradient-to-r from-[#4B2E83]/5 to-[#EC4899]/5 rounded-xl p-4 sm:p-5 border border-[#4B2E83]/10" aria-labelledby="consent-settings-heading">
              {/* Marketing Consent - Editable */}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <input
                    type="checkbox"
                    id="marketing_consent"
                    name="marketing_consent"
                    checked={localMarketingConsent}
                    onChange={(e) => onLocalMarketingConsentChange(e.target.checked)}
                    disabled={!isEditing || isLoading || loadingConsents}
                    aria-describedby="marketing-consent-status"
                    className="w-4 h-4 text-[#EC4899] bg-white border-2 border-[#4B2E83]/30 rounded focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-[#4B2E83] focus:ring-offset-2 focus:border-2 focus:border-[#4B2E83]"
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="marketing_consent" className="text-sm sm:text-base text-[#4B2E83] font-medium leading-relaxed cursor-pointer">
                    אני מסכימה לקבל עדכונים ומבצעים מהסטודיו
                  </label>
                  <div id="marketing-consent-status" className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                      localMarketingConsent
                        ? 'bg-green-100 text-green-700 border-green-200' 
                        : 'bg-gray-100 text-gray-600 border-gray-200'
                    }`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      {localMarketingConsent ? 'רשומה לעדכונים' : 'לא רשומה לעדכונים'}
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#EC4899]/10 text-[#EC4899] border border-[#EC4899]/20">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      ניתן לשינוי
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          {isEditing && (
            <div className="flex justify-end pt-4 sm:pt-6 border-t border-[#4B2E83]/10">
              <button
                type="submit"
                disabled={isLoading}
                aria-label="שמור שינויים בפרופיל האישי"
                className="px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-4 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded-lg sm:rounded-xl font-semibold hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-[#4B2E83] focus:ring-offset-2 focus:border-2 focus:border-[#4B2E83]"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    שומר...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
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