import React, { useState, useEffect } from 'react';

interface AddRegistrationModalProps {
  registrationData: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedRegistration: any) => void;
  isLoading: boolean;
  isNewRegistration?: boolean;
  classes?: any[];
  sessions?: any[];
}

export default function AddRegistrationModal({ 
  registrationData, 
  isOpen, 
  onClose, 
  onSave, 
  isLoading,
  isNewRegistration = false,
  classes = [],
  sessions = []
}: AddRegistrationModalProps) {
  const isNewReg = isNewRegistration || !registrationData.id;
  
  const [formData, setFormData] = useState({
    // User details
    first_name: registrationData.first_name || registrationData.user?.first_name || '',
    last_name: registrationData.last_name || registrationData.user?.last_name || '',
    email: registrationData.email || registrationData.user?.email || '',
    phone: registrationData.phone || registrationData.user?.phone || '',
    
    // Registration details
    class_id: registrationData.class_id || '',
    session_id: registrationData.session_id || '',
    selected_date: registrationData.selected_date || '',
    selected_time: registrationData.selected_time || '',
    status: registrationData.status || 'active',
    
    // Additional fields for new registration
    user_id: registrationData.user_id || '',
    notes: registrationData.notes || ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (isNewReg) {
      // Reset form for new registration
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        class_id: '',
        session_id: '',
        selected_date: '',
        selected_time: '',
        status: 'active',
        user_id: '',
        notes: ''
      });
    } else {
      // Set form for editing existing registration
      setFormData({
        first_name: registrationData.first_name || registrationData.user?.first_name || '',
        last_name: registrationData.last_name || registrationData.user?.last_name || '',
        email: registrationData.email || registrationData.user?.email || '',
        phone: registrationData.phone || registrationData.user?.phone || '',
        class_id: registrationData.class_id || '',
        session_id: registrationData.session_id || '',
        selected_date: registrationData.selected_date || '',
        selected_time: registrationData.selected_time || '',
        status: registrationData.status || 'active',
        user_id: registrationData.user_id || '',
        notes: registrationData.notes || ''
      });
    }
    setErrors({});
  }, [registrationData, isNewReg]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (isNewReg) {
      if (!formData.first_name.trim()) newErrors.first_name = 'שם פרטי הוא שדה חובה';
      if (!formData.last_name.trim()) newErrors.last_name = 'שם משפחה הוא שדה חובה';
      if (!formData.email.trim()) newErrors.email = 'אימייל הוא שדה חובה';
      if (!formData.class_id) newErrors.class_id = 'בחירת שיעור היא שדה חובה';
      if (!formData.session_id) newErrors.session_id = 'בחירת קבוצה היא שדה חובה';
      if (!formData.selected_date) newErrors.selected_date = 'תאריך הוא שדה חובה';
      if (!formData.selected_time) newErrors.selected_time = 'שעה היא שדה חובה';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submissionData = {
      ...registrationData,
      ...formData
    };

    onSave(submissionData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-[95vw] sm:max-w-4xl max-h-[95vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#4B2E83] to-[#EC4899] p-6 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {isNewReg ? 'הוספת הרשמה חדשה' : 'עריכת הרשמה'}
                </h2>
                <p className="text-white/80 text-sm mt-1">
                  {isNewReg ? 'צור הרשמה חדשה במערכת' : 'ערוך את פרטי ההרשמה'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-3xl font-light transition-colors duration-200 hover:bg-white/10 rounded-full w-10 h-10 flex items-center justify-center"
            >
              ×
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(95vh-140px)]">
          <form onSubmit={handleSubmit} className="p-3 sm:p-6 space-y-4 sm:space-y-6">
            {/* פרטי משתמש */}
            <div className="bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5 rounded-xl p-3 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold text-[#4B2E83] mb-3 sm:mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                פרטי משתמש
              </h3>
              <div className="space-y-4 sm:space-y-6">
                {isNewReg ? (
                  // New registration - show form fields
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">
                        שם פרטי *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.first_name}
                        onChange={(e) => handleInputChange('first_name', e.target.value)}
                        placeholder="שם פרטי"
                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:outline-none transition-all ${
                          errors.first_name 
                            ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                            : 'border-[#EC4899]/20 focus:ring-[#EC4899]/20 focus:border-[#EC4899]'
                        }`}
                      />
                      {errors.first_name && (
                        <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">
                        שם משפחה *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.last_name}
                        onChange={(e) => handleInputChange('last_name', e.target.value)}
                        placeholder="שם משפחה"
                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:outline-none transition-all ${
                          errors.last_name 
                            ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                            : 'border-[#EC4899]/20 focus:ring-[#EC4899]/20 focus:border-[#EC4899]'
                        }`}
                      />
                      {errors.last_name && (
                        <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">
                        אימייל *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="example@email.com"
                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:outline-none transition-all ${
                          errors.email 
                            ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                            : 'border-[#EC4899]/20 focus:ring-[#EC4899]/20 focus:border-[#EC4899]'
                        }`}
                      />
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">
                        טלפון
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="050-1234567"
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none transition-all"
                      />
                    </div>
                  </div>
                ) : (
                  // Existing registration - show read-only info
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            </div>

            {/* פרטי הרשמה */}
            <div className="bg-gradient-to-r from-[#4B2E83]/5 to-[#EC4899]/5 rounded-xl p-3 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold text-[#4B2E83] mb-3 sm:mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                פרטי הרשמה
              </h3>
              <div className="space-y-4 sm:space-y-6">
                {isNewReg ? (
                  // New registration - show form fields
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">
                        שיעור *
                      </label>
                      <select
                        required
                        value={formData.class_id}
                        onChange={(e) => handleInputChange('class_id', e.target.value)}
                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:outline-none transition-all ${
                          errors.class_id 
                            ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                            : 'border-[#EC4899]/20 focus:ring-[#EC4899]/20 focus:border-[#EC4899]'
                        }`}
                      >
                        <option value="">בחרי שיעור</option>
                        {classes.map((cls: any) => (
                          <option key={cls.id} value={cls.id}>{cls.name}</option>
                        ))}
                      </select>
                      {errors.class_id && (
                        <p className="text-red-500 text-xs mt-1">{errors.class_id}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">
                        קבוצה *
                      </label>
                      <select
                        required
                        value={formData.session_id}
                        onChange={(e) => handleInputChange('session_id', e.target.value)}
                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:outline-none transition-all ${
                          errors.session_id 
                            ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                            : 'border-[#EC4899]/20 focus:ring-[#EC4899]/20 focus:border-[#EC4899]'
                        }`}
                      >
                        <option value="">בחרי קבוצה</option>
                        {sessions.map((session: any) => (
                          <option key={session.id} value={session.id}>{session.name}</option>
                        ))}
                      </select>
                      {errors.session_id && (
                        <p className="text-red-500 text-xs mt-1">{errors.session_id}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">
                        תאריך *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.selected_date}
                        onChange={(e) => handleInputChange('selected_date', e.target.value)}
                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:outline-none transition-all ${
                          errors.selected_date 
                            ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                            : 'border-[#EC4899]/20 focus:ring-[#EC4899]/20 focus:border-[#EC4899]'
                        }`}
                      />
                      {errors.selected_date && (
                        <p className="text-red-500 text-xs mt-1">{errors.selected_date}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">
                        שעה *
                      </label>
                      <input
                        type="time"
                        required
                        value={formData.selected_time}
                        onChange={(e) => handleInputChange('selected_time', e.target.value)}
                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:outline-none transition-all ${
                          errors.selected_time 
                            ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                            : 'border-[#EC4899]/20 focus:ring-[#EC4899]/20 focus:border-[#EC4899]'
                        }`}
                      />
                      {errors.selected_time && (
                        <p className="text-red-500 text-xs mt-1">{errors.selected_time}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  // Existing registration - show read-only info
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-[#4B2E83]">שיעור</p>
                        <p className="text-sm text-[#4B2E83]/70">
                          {registrationData.class?.name || registrationData.class_name || 'שיעור לא ידוע'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#4B2E83]">קבוצה</p>
                        <p className="text-sm text-[#4B2E83]/70">
                          {registrationData.session?.name || registrationData.session_name || 'קבוצה לא ידועה'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#4B2E83]">תאריך</p>
                        <p className="text-sm text-[#4B2E83]/70">
                          {registrationData.selected_date ? new Date(registrationData.selected_date).toLocaleDateString('he-IL') : 'לא מוגדר'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#4B2E83]">שעה</p>
                        <p className="text-sm text-[#4B2E83]/70">
                          {registrationData.selected_time || 'לא מוגדר'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* סטטוס הרשמה */}
            <div className="bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5 rounded-xl p-3 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold text-[#4B2E83] mb-3 sm:mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                סטטוס הרשמה
              </h3>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">
                  סטטוס הרשמה *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none transition-all"
                >
                  <option value="active">פעיל</option>
                  <option value="pending">ממתין</option>
                  <option value="cancelled">בוטל</option>
                </select>
              </div>
            </div>

            {/* הערות (רק להרשמה חדשה) */}
            {isNewReg && (
              <div className="bg-gradient-to-r from-[#4B2E83]/5 to-[#EC4899]/5 rounded-xl p-3 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold text-[#4B2E83] mb-3 sm:mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  הערות נוספות
                </h3>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">
                    הערות
                  </label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="הערות נוספות על ההרשמה..."
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {/* כפתורים */}
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 sm:px-6 py-2 border border-[#4B2E83] text-[#4B2E83] rounded-lg font-medium hover:bg-[#4B2E83] hover:text-white transition-all duration-300 text-sm sm:text-base"
              >
                ביטול
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 sm:px-6 py-2 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded-lg font-medium hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {isLoading ? 'שומר...' : (isNewReg ? 'צור הרשמה' : 'שמור שינויים')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 