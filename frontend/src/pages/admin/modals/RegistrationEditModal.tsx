import React, { useState, useEffect } from 'react';
import {
  getAvailableDatesForButtonsFromSessions,
  getAvailableTimesForDateFromSessions,
  getAvailableDatesMessageFromSessions
} from '../../../utils/sessionsUtils';

interface RegistrationEditModalProps {
  registrationData: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedRegistration: any) => void;
  isLoading: boolean;
  isNewRegistration?: boolean;
  classes?: any[];
  sessions?: any[];
  profiles?: any[];
}

export default function RegistrationEditModal({ 
  registrationData, 
  isOpen, 
  onClose, 
  onSave, 
  isLoading,
  isNewRegistration = false,
  classes = [],
  sessions = [],
  profiles = []
}: RegistrationEditModalProps) {
  const isNewReg = isNewRegistration || !registrationData.id;
  
  const [formData, setFormData] = useState({
    // User selection
    user_id: registrationData.user_id || '',
    
    // Registration details
    class_id: registrationData.class_id || '',
    session_id: registrationData.session_id || '',
    selected_date: registrationData.selected_date || '',
    selected_time: registrationData.selected_time || '',
    status: registrationData.status || 'active',
    
    // Credit and payment details
    purchase_price: registrationData.purchase_price || 0,
    
    // Additional fields for new registration
    notes: registrationData.notes || ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  // State for available dates and times
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loadingDates, setLoadingDates] = useState(false);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [datesMessage, setDatesMessage] = useState('');

  useEffect(() => {
    if (isNewReg) {
      // Reset form for new registration
      setFormData({
        user_id: '',
        class_id: '',
        session_id: '',
        selected_date: '',
        selected_time: '',
        status: 'active',
        purchase_price: 0,
        notes: ''
      });
    } else {
      // Set form for editing existing registration
    setFormData({
        user_id: registrationData.user_id || '',
        class_id: registrationData.class_id || '',
        session_id: registrationData.session_id || '',
        selected_date: registrationData.selected_date || '',
        selected_time: registrationData.selected_time || '',
        status: registrationData.status || 'active',
        purchase_price: registrationData.purchase_price || 0,
        notes: registrationData.notes || ''
      });
    }
    setErrors({});
  }, [registrationData, isNewReg]);

  // Load available dates when class is selected
  useEffect(() => {
    if (formData.class_id && isNewReg) {
      loadAvailableDates(formData.class_id);
    }
  }, [formData.class_id, isNewReg]);

  // Load available times when date is selected
  useEffect(() => {
    if (formData.class_id && formData.selected_date && isNewReg) {
      loadAvailableTimes(formData.class_id, formData.selected_date);
    }
  }, [formData.class_id, formData.selected_date, isNewReg]);

  const loadAvailableDates = async (classId: string) => {
    try {
      setLoadingDates(true);
      const [dates, message] = await Promise.all([
        getAvailableDatesForButtonsFromSessions(classId),
        getAvailableDatesMessageFromSessions(classId)
      ]);
      setAvailableDates(dates);
      setDatesMessage(message);
    } catch (error) {
      console.error('Error loading available dates:', error);
      setAvailableDates([]);
      setDatesMessage('שגיאה בטעינת התאריכים');
    } finally {
      setLoadingDates(false);
    }
  };

  const loadAvailableTimes = async (classId: string, date: string) => {
    try {
      setLoadingTimes(true);
      const times = await getAvailableTimesForDateFromSessions(classId, date);
      setAvailableTimes(times);
    } catch (error) {
      console.error('Error loading available times:', error);
      setAvailableTimes([]);
    } finally {
      setLoadingTimes(false);
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (isNewReg) {
      if (!formData.user_id) newErrors.user_id = 'בחירת משתמש היא שדה חובה';
      if (!formData.class_id) newErrors.class_id = 'בחירת שיעור היא שדה חובה';
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

    // Get selected user details
    const selectedUser = profiles.find(p => p.id === formData.user_id);
    
    const submissionData = {
      ...registrationData,
      ...formData,
      // Add user details for the API
      first_name: selectedUser?.first_name || '',
      last_name: selectedUser?.last_name || '',
      email: selectedUser?.email || '',
      phone: selectedUser?.phone_number || ''
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

  const getSelectedUser = () => {
    if (!formData.user_id) return null;
    return profiles.find(p => p.id === formData.user_id);
  };

  const selectedUser = getSelectedUser();

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
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3 sm:space-y-4">
            {/* בחירת משתמש */}
            <div className="bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5 rounded-xl p-3 sm:p-4">
              <h3 className="text-sm sm:text-base font-bold text-[#4B2E83] mb-2 sm:mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                בחירת משתמש
              </h3>
              <div className="space-y-3">
                {isNewReg ? (
                  // New registration - show user selection
          <div>
                    <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">
                      בחרי משתמש *
            </label>
                    <select
                      required
                      value={formData.user_id}
                      onChange={(e) => handleInputChange('user_id', e.target.value)}
                      className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg focus:ring-2 focus:outline-none transition-all ${
                        errors.user_id 
                          ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                          : 'border-[#EC4899]/20 focus:ring-[#EC4899]/20 focus:border-[#EC4899]'
                      }`}
                    >
                      <option value="">בחרי משתמש</option>
                      {profiles.map((profile: any) => (
                        <option key={profile.id} value={profile.id}>
                          {profile.first_name} {profile.last_name} - {profile.email}
                        </option>
                      ))}
                    </select>
                    {errors.user_id && (
                      <p className="text-red-500 text-xs mt-1">{errors.user_id}</p>
                    )}
                    
                    {/* Show selected user details */}
                    {selectedUser && (
                      <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="font-medium text-[#4B2E83]">שם מלא:</span>
                            <span className="text-[#4B2E83]/70 mr-2"> {selectedUser.first_name} {selectedUser.last_name}</span>
                          </div>
                          <div>
                            <span className="font-medium text-[#4B2E83]">אימייל:</span>
                            <span className="text-[#4B2E83]/70 mr-2"> {selectedUser.email}</span>
                          </div>
                          {selectedUser.phone_number && (
                            <div>
                              <span className="font-medium text-[#4B2E83]">טלפון:</span>
                              <span className="text-[#4B2E83]/70 mr-2"> {selectedUser.phone_number}</span>
                            </div>
                          )}
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
            </div>

            {/* פרטי הרשמה */}
            <div className="bg-gradient-to-r from-[#4B2E83]/5 to-[#EC4899]/5 rounded-xl p-3 sm:p-4">
              <h3 className="text-sm sm:text-base font-bold text-[#4B2E83] mb-2 sm:mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                פרטי הרשמה
              </h3>
              <div className="space-y-3">
                {isNewReg ? (
                  // New registration - show form fields
                  <div className="space-y-3">
                    {/* Class Selection */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">
                        שיעור *
                      </label>
                      <select
                        required
                        value={formData.class_id}
                        onChange={(e) => handleInputChange('class_id', e.target.value)}
                        className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg focus:ring-2 focus:outline-none transition-all ${
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

                    {/* Date and Time Selection */}
                    {formData.class_id && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">
                            תאריך *
                          </label>
                          {loadingDates ? (
                            <div className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-[#EC4899]/20 rounded-lg bg-gray-100 animate-pulse">
                              טוען תאריכים...
                            </div>
                          ) : (
                            <select
                              required
                              value={formData.selected_date}
                              onChange={(e) => handleInputChange('selected_date', e.target.value)}
                              className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg focus:ring-2 focus:outline-none transition-all ${
                                errors.selected_date 
                                  ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                                  : 'border-[#EC4899]/20 focus:ring-[#EC4899]/20 focus:border-[#EC4899]'
                              }`}
                            >
                              <option value="">בחרי תאריך</option>
                              {availableDates.map((date) => {
                                const dateObj = new Date(date);
                                const today = new Date().toISOString().split('T')[0];
                                const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                                const isToday = date === today;
                                const isTomorrow = date === tomorrow;
                                
                                return (
                                  <option key={date} value={date}>
                                    {dateObj.toLocaleDateString('he-IL', { 
                                      day: 'numeric', 
                                      month: 'numeric', 
                                      year: 'numeric',
                                      weekday: 'short'
                                    })}
                                    {isToday && ' - היום'}
                                    {isTomorrow && ' - מחר'}
                                  </option>
                                );
                              })}
                            </select>
                          )}
                          {errors.selected_date && (
                            <p className="text-red-500 text-xs mt-1">{errors.selected_date}</p>
                          )}
                          {datesMessage && (
                            <p className="text-xs text-gray-600 mt-1">{datesMessage}</p>
                          )}
          </div>

          <div>
                          <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">
                            שעה *
            </label>
                          {loadingTimes ? (
                            <div className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-[#EC4899]/20 rounded-lg bg-gray-100 animate-pulse">
                              טוען שעות...
                            </div>
                          ) : (
                            <select
                              required
                              value={formData.selected_time}
                              onChange={(e) => handleInputChange('selected_time', e.target.value)}
                              className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg focus:ring-2 focus:outline-none transition-all ${
                                errors.selected_time 
                                  ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                                  : 'border-[#EC4899]/20 focus:ring-[#EC4899]/20 focus:border-[#EC4899]'
                              }`}
                            >
                              <option value="">בחרי שעה</option>
                              {availableTimes.map((time) => (
                                <option key={time} value={time}>{time}</option>
                              ))}
                            </select>
                          )}
                          {errors.selected_time && (
                            <p className="text-red-500 text-xs mt-1">{errors.selected_time}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // Existing registration - show read-only info
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <p className="text-sm font-medium text-[#4B2E83]">שיעור</p>
              <p className="text-sm text-[#4B2E83]/70">
                {registrationData.class?.name || registrationData.class_name || 'שיעור לא ידוע'}
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

            {/* סטטוס ותשלום */}
            <div className="bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5 rounded-xl p-3 sm:p-4">
              <h3 className="text-sm sm:text-base font-bold text-[#4B2E83] mb-2 sm:mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                סטטוס ותשלום
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
                  <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">
              סטטוס הרשמה *
            </label>
            <select
              value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none transition-all"
            >
              <option value="active">פעיל</option>
              <option value="pending">ממתין</option>
              <option value="cancelled">בוטל</option>
            </select>
          </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">
                    מחיר רכישה
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.purchase_price}
                    onChange={(e) => handleInputChange('purchase_price', parseFloat(e.target.value) || 0)}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none transition-all"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* הערות (רק להרשמה חדשה) */}
            {isNewReg && (
              <div className="bg-gradient-to-r from-[#4B2E83]/5 to-[#EC4899]/5 rounded-xl p-3 sm:p-4">
                <h3 className="text-sm sm:text-base font-bold text-[#4B2E83] mb-2 sm:mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
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
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {/* כפתורים */}
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-200">
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