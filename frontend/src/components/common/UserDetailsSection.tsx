import React from 'react';
import UserSearch from './UserSearch';

interface UserDetailsSectionProps {
  isNewRegistration: boolean;
  formData: any;
  registrationData: any;
  profiles: any[];
  errors: { [key: string]: string };
  onInputChange: (field: string, value: any) => void;
  onSearchProfiles?: (searchTerm: string) => Promise<void>;
  isLoadingProfiles?: boolean;
}

export default function UserDetailsSection({
  isNewRegistration,
  formData,
  registrationData,
  profiles,
  errors,
  onInputChange,
  onSearchProfiles,
  isLoadingProfiles = false
}: UserDetailsSectionProps) {
  const getSelectedUser = () => {
    if (!formData.user_id) return null;
    return profiles.find(p => p.id === formData.user_id);
  };

  const selectedUser = getSelectedUser();

  return (
    <section className="bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5 rounded-xl p-3 sm:p-4" aria-labelledby="user-details-title">
      <h3 id="user-details-title" className="text-sm sm:text-base font-bold text-[#4B2E83] mb-2 sm:mb-3 flex items-center gap-2">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
        בחירת משתמש
      </h3>
      <div className="space-y-3">
        {isNewRegistration ? (
          // New registration - show user search
          <div>
            <h4 className="text-sm font-semibold text-[#4B2E83] mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-[#EC4899] text-white rounded-full flex items-center justify-center text-xs" aria-hidden="true">1</span>
              בחירת משתמש
            </h4>
            <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">
              בחרי משתמש <span className="text-red-500" aria-label="שדה חובה">*</span>
            </label>
            <UserSearch
              selectedUserId={formData.user_id}
              onUserSelect={(userId) => onInputChange('user_id', userId)}
              profiles={profiles}
              error={errors.user_id}
              placeholder="חיפוש לפי שם או אימייל..."
              onSearch={onSearchProfiles}
              isLoading={isLoadingProfiles}
            />
            
            {/* Manual user details fields */}
            {selectedUser && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <h5 className="text-sm font-semibold text-[#4B2E83] mb-3">פרטי משתמש (אפשר לערוך)</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="first-name-input" className="block text-xs font-medium text-[#4B2E83] mb-1">
                      שם פרטי
                    </label>
                    <input
                      id="first-name-input"
                      type="text"
                      value={formData.first_name || selectedUser.first_name || ''}
                      onChange={(e) => onInputChange('first_name', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EC4899] focus:border-transparent"
                      placeholder="שם פרטי"
                      aria-describedby={errors.first_name ? 'first-name-error' : undefined}
                      aria-invalid={!!errors.first_name}
                    />
                    {errors.first_name && (
                      <p id="first-name-error" className="text-xs text-red-500 mt-1" role="alert">{errors.first_name}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="last-name-input" className="block text-xs font-medium text-[#4B2E83] mb-1">
                      שם משפחה
                    </label>
                    <input
                      id="last-name-input"
                      type="text"
                      value={formData.last_name || selectedUser.last_name || ''}
                      onChange={(e) => onInputChange('last_name', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EC4899] focus:border-transparent"
                      placeholder="שם משפחה"
                      aria-describedby={errors.last_name ? 'last-name-error' : undefined}
                      aria-invalid={!!errors.last_name}
                    />
                    {errors.last_name && (
                      <p id="last-name-error" className="text-xs text-red-500 mt-1" role="alert">{errors.last_name}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="email-input" className="block text-xs font-medium text-[#4B2E83] mb-1">
                      אימייל
                    </label>
                    <input
                      id="email-input"
                      type="email"
                      value={formData.email || selectedUser.email || ''}
                      readOnly
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                      placeholder="אימייל"
                      aria-label="אימייל (לא ניתן לעריכה)"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone-input" className="block text-xs font-medium text-[#4B2E83] mb-1">
                      טלפון <span className="text-red-500" aria-label="שדה חובה">*</span>
                    </label>
                    <input
                      id="phone-input"
                      type="tel"
                      value={formData.phone || selectedUser.phone || selectedUser.phone_number || ''}
                      onChange={(e) => onInputChange('phone', e.target.value)}
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-[#EC4899] focus:border-transparent ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="מספר טלפון *"
                      required
                      aria-required="true"
                      aria-describedby={errors.phone ? 'phone-error' : undefined}
                      aria-invalid={!!errors.phone}
                    />
                    {errors.phone && (
                      <p id="phone-error" className="text-xs text-red-500 mt-1" role="alert">{errors.phone}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Existing registration - show read-only user info
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="text-sm font-medium text-[#4B2E83]">שם מלא</p>
                <p className="text-sm text-[#4B2E83]/70">
                  {registrationData.user ? 
                    `${registrationData.user.first_name || ''} ${registrationData.user.last_name || ''}`.trim() || registrationData.user.email :
                    `${registrationData.first_name || ''} ${registrationData.last_name || ''}`.trim() || registrationData.email || 'לא ידוע'
                  }
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-[#4B2E83]">אימייל</p>
                <p className="text-sm text-[#4B2E83]/70">{registrationData.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-[#4B2E83]">טלפון</p>
                <p className="text-sm text-[#4B2E83]/70">{registrationData.phone || 'לא צוין'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
} 