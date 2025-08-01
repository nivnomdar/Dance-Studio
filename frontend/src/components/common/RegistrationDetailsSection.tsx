import React from 'react';
import { FaCalendar } from 'react-icons/fa';
import CalendarPicker from './CalendarPicker';
import TimePicker from './TimePicker';

interface RegistrationDetailsSectionProps {
  isNewRegistration: boolean;
  formData: any;
  registrationData: any;
  classes: any[];
  sessions?: any[];
  session_classes?: any[];
  errors: { [key: string]: string };
  onInputChange: (field: string, value: any) => void;
  useCustomDateTime: boolean;
  setUseCustomDateTime: (value: boolean) => void;
  showDatePicker: boolean;
  setShowDatePicker: (value: boolean) => void;
  showTimePicker: boolean;
  setShowTimePicker: (value: boolean) => void;
  showCustomTimePicker: boolean;
  setShowCustomTimePicker: (value: boolean) => void;
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void;
  availableDates: string[];
  availableTimes: string[];
  loadingDates: boolean;
  loadingTimes: boolean;
  datesMessage: string;
  onDateSelect: (date: Date) => void;
  onTimeSelect: (time: string) => void;
  onMonthChange: (direction: 'next' | 'prev') => void;
  userCredits?: any;
  loadingCredits?: boolean;
}

export default function RegistrationDetailsSection({
  isNewRegistration,
  formData,
  registrationData,
  classes,
  sessions = [],
  session_classes = [],
  errors,
  onInputChange,
  useCustomDateTime,
  setUseCustomDateTime,
  showDatePicker,
  setShowDatePicker,
  showTimePicker,
  setShowTimePicker,
  showCustomTimePicker,
  setShowCustomTimePicker,
  currentMonth,
  setCurrentMonth,
  availableDates,
  availableTimes,
  loadingDates,
  loadingTimes,
  datesMessage,
  onDateSelect,
  onTimeSelect,
  onMonthChange,
  userCredits,
  loadingCredits = false
}: RegistrationDetailsSectionProps) {
  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="bg-gradient-to-r from-[#4B2E83]/5 to-[#EC4899]/5 rounded-xl p-3 sm:p-4">
      <h3 className="text-sm sm:text-base font-bold text-[#4B2E83] mb-2 sm:mb-3 flex items-center gap-2">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {isNewRegistration && !formData.user_id ? 'בחרי משתמש תחילה' : 'פרטי הרשמה'}
      </h3>
      <div className="space-y-3">
        {isNewRegistration ? (
          <div className="space-y-4">
            <div className="space-y-4">
              {formData.user_id ? (
                <>
                  {/* Step 2: Group Selection */}
              <div className="bg-white rounded-lg p-4 border border-[#EC4899]/10">
                <h4 className="text-sm font-semibold text-[#4B2E83] mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 bg-[#EC4899] text-white rounded-full flex items-center justify-center text-xs">2</span>
                  בחירת קבוצה
                </h4>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">
                    קבוצה *
                  </label>
                  <select
                    required
                    value={formData.session_id}
                    onChange={(e) => onInputChange('session_id', e.target.value)}
                    className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg focus:ring-2 focus:outline-none transition-all ${
                      errors.session_id 
                        ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                        : 'border-[#EC4899]/20 focus:ring-[#EC4899]/20 focus:border-[#EC4899]'
                    }`}
                  >
                    <option value="">בחרי קבוצה</option>
                    {sessions
                      .filter((session: any) => session.is_active)
                      .map((session: any) => (
                        <option key={session.id} value={session.id}>
                          {session.name} - {session.weekdays?.map((day: number) => {
                            const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
                            return days[day];
                          }).join(', ')} {session.start_time}-{session.end_time}
                        </option>
                      ))}
                  </select>
                  {errors.session_id && (
                    <p className="text-red-500 text-xs mt-1">{errors.session_id}</p>
                  )}
                </div>
              </div>

                  {/* Step 3: Class Selection */}
                  {formData.user_id && formData.session_id && (
                <div className="bg-white rounded-lg p-4 border border-[#EC4899]/10">
                  <h4 className="text-sm font-semibold text-[#4B2E83] mb-3 flex items-center gap-2">
                        <span className="w-6 h-6 bg-[#EC4899] text-white rounded-full flex items-center justify-center text-xs">3</span>
                    בחירת שיעור
                  </h4>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">
                      שיעור *
                    </label>
                    {(() => {
                      const relevantSessionClasses = session_classes.filter((sessionClass: any) => 
                        sessionClass.session_id === formData.session_id && sessionClass.is_active
                      );
                      
                      const classIds = relevantSessionClasses.map((sc: any) => sc.class_id);
                      
                      const availableClasses = classes.filter((classItem: any) => 
                        classIds.includes(classItem.id) && classItem.is_active
                      );

                      if (availableClasses.length === 1) {
                        const singleClass = availableClasses[0];
                        if (formData.class_id !== singleClass.id) {
                          setTimeout(() => onInputChange('class_id', singleClass.id), 0);
                        }
                        
                        return (
                          <div className="w-full px-3 py-2.5 text-sm border border-[#EC4899]/20 rounded-lg bg-gray-50">
                            <div className="flex items-center justify-between">
                              <span className="text-[#4B2E83] font-medium">
                                {singleClass.name} - {singleClass.price} ש"ח
                              </span>
                              <span className="text-xs text-[#EC4899] bg-[#EC4899]/10 px-2 py-1 rounded-full">
                                נבחר אוטומטית
                              </span>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <select
                          required
                          value={formData.class_id}
                          onChange={(e) => onInputChange('class_id', e.target.value)}
                          className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg focus:ring-2 focus:outline-none transition-all ${
                            errors.class_id 
                              ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                              : 'border-[#EC4899]/20 focus:ring-[#EC4899]/20 focus:border-[#EC4899]'
                          }`}
                        >
                          <option value="">בחרי שיעור</option>
                          {availableClasses.map((classItem: any) => (
                            <option key={classItem.id} value={classItem.id}>
                              {classItem.name} - {classItem.price} ש"ח
                            </option>
                          ))}
                        </select>
                      );
                    })()}
                    {errors.class_id && (
                      <p className="text-red-500 text-xs mt-1">{errors.class_id}</p>
                    )}
                  </div>
                </div>
              )}

                  {/* Step 4: Date and Time Selection */}
                  {formData.user_id && formData.session_id && formData.class_id && (
                <div className="bg-white rounded-lg p-4 border border-[#EC4899]/10">
                  <h4 className="text-sm font-semibold text-[#4B2E83] mb-3 flex items-center gap-2">
                        <span className="w-6 h-6 bg-[#EC4899] text-white rounded-full flex items-center justify-center text-xs">4</span>
                    בחירת תאריך ושעה
                  </h4>
                  
                  <div className="mb-4">
                    <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-2">
                      שיטת בחירת תאריך ושעה
                    </label>
                    <div className="flex gap-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="dateTimeMethod"
                          value="automatic"
                          checked={!useCustomDateTime}
                          onChange={() => setUseCustomDateTime(false)}
                          className="w-4 h-4 text-[#EC4899] bg-gray-100 border-gray-300 focus:ring-[#EC4899] focus:ring-2"
                        />
                        <span className="text-sm text-[#4B2E83]">לפי הקבוצה</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="dateTimeMethod"
                          value="manual"
                          checked={useCustomDateTime}
                          onChange={() => setUseCustomDateTime(true)}
                          className="w-4 h-4 text-[#EC4899] bg-gray-100 border-gray-300 focus:ring-[#EC4899] focus:ring-2"
                        />
                        <span className="text-sm text-[#4B2E83]">התאמה אישית</span>
                      </label>
                    </div>
                  </div>

                  {useCustomDateTime ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-2">
                          תאריך מותאם אישית *
                        </label>
                        <div className="relative">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 relative">
                              <input
                                type="text"
                                required
                                value={formData.selected_date ? new Date(formData.selected_date).toLocaleDateString('he-IL') : ''}
                                onChange={(e) => onInputChange('selected_date', e.target.value)}
                                placeholder="בחרי תאריך"
                                readOnly
                                className={`w-full px-3 py-2.5 text-sm border rounded-xl focus:ring-2 focus:outline-none transition-all bg-white ${
                                  errors.selected_date 
                                    ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                                    : 'border-[#EC4899]/20 focus:ring-[#EC4899]/20 focus:border-[#EC4899]'
                                }`}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => setShowDatePicker(!showDatePicker)}
                              className="px-4 py-2.5 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded-xl hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                              <FaCalendar className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <CalendarPicker
                            currentMonth={currentMonth}
                            selectedDate={formData.selected_date}
                                availableDates={[]}
                            onDateSelect={onDateSelect}
                            onMonthChange={onMonthChange}
                            onClose={() => setShowDatePicker(false)}
                            isOpen={showDatePicker}
                          />
                        </div>
                        {errors.selected_date && (
                          <p className="text-red-500 text-xs mt-2">{errors.selected_date}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-2">
                          שעה מותאמת אישית *
                        </label>
                        <div className="relative">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 relative">
                              <input
                                type="text"
                                required
                                value={formData.selected_time}
                                onChange={(e) => onInputChange('selected_time', e.target.value)}
                                placeholder="בחרי שעה"
                                readOnly
                                className={`w-full px-3 py-2.5 text-sm border rounded-xl focus:ring-2 focus:outline-none transition-all bg-white ${
                                  errors.selected_time 
                                    ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                                    : 'border-[#EC4899]/20 focus:ring-[#EC4899]/20 focus:border-[#EC4899]'
                                }`}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => setShowCustomTimePicker(!showCustomTimePicker)}
                              className="px-4 py-2.5 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded-xl hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </button>
                          </div>
                          
                          <TimePicker
                            selectedTime={formData.selected_time}
                            availableTimes={[]}
                            onTimeSelect={onTimeSelect}
                            onClose={() => setShowCustomTimePicker(false)}
                            isOpen={showCustomTimePicker}
                            isCustom={true}
                          />
                        </div>
                        {errors.selected_time && (
                          <p className="text-red-500 text-xs mt-2">{errors.selected_time}</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-2">
                          תאריך זמין *
                        </label>
                        {loadingDates ? (
                          <div className="w-full px-3 py-2.5 text-sm border border-[#EC4899]/20 rounded-xl bg-gray-100 animate-pulse flex items-center justify-center">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-[#EC4899] border-t-transparent rounded-full animate-spin"></div>
                              <span className="text-[#4B2E83]">טוען תאריכים...</span>
                            </div>
                          </div>
                        ) : (
                          <div className="relative">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 relative">
                                <input
                                  type="text"
                                  required
                                  value={formData.selected_date ? new Date(formData.selected_date).toLocaleDateString('he-IL') : ''}
                                  onChange={(e) => onInputChange('selected_date', e.target.value)}
                                  placeholder="בחרי תאריך זמין"
                                  readOnly
                                  className={`w-full px-3 py-2.5 text-sm border rounded-xl focus:ring-2 focus:outline-none transition-all bg-white ${
                                    errors.selected_date 
                                      ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                                      : 'border-[#EC4899]/20 focus:ring-[#EC4899]/20 focus:border-[#EC4899]'
                                  }`}
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => setShowDatePicker(!showDatePicker)}
                                className="px-4 py-2.5 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded-xl hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300 shadow-lg hover:shadow-xl"
                              >
                                <FaCalendar className="w-4 h-4" />
                              </button>
                            </div>
                            
                            <CalendarPicker
                              currentMonth={currentMonth}
                              selectedDate={formData.selected_date}
                              availableDates={availableDates}
                              onDateSelect={onDateSelect}
                              onMonthChange={onMonthChange}
                              onClose={() => setShowDatePicker(false)}
                              isOpen={showDatePicker}
                            />
                          </div>
                        )}
                        {errors.selected_date && (
                          <p className="text-red-500 text-xs mt-2">{errors.selected_date}</p>
                        )}
                        {datesMessage && (
                          <p className="text-xs text-[#4B2E83]/60 mt-2 font-medium">{datesMessage}</p>
                        )}
                            {formData.selected_date && (
                              <p className="text-xs text-[#4B2E83]/80 mt-2 font-medium">
                                יום: {new Date(formData.selected_date).toLocaleDateString('he-IL', { weekday: 'long' })}
                              </p>
                            )}
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-2">
                          שעה זמינה *
                        </label>
                        {loadingTimes ? (
                          <div className="w-full px-3 py-2.5 text-sm border border-[#EC4899]/20 rounded-xl bg-gray-100 animate-pulse flex items-center justify-center">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-[#EC4899] border-t-transparent rounded-full animate-spin"></div>
                              <span className="text-[#4B2E83]">טוען שעות...</span>
                            </div>
                          </div>
                        ) : (
                          <div className="relative">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 relative">
                                <input
                                  type="text"
                                  required
                                  value={formData.selected_time}
                                  onChange={(e) => onInputChange('selected_time', e.target.value)}
                                  placeholder="בחרי שעה זמינה"
                                  readOnly
                                  className={`w-full px-3 py-2.5 text-sm border rounded-xl focus:ring-2 focus:outline-none transition-all bg-white ${
                                    errors.selected_time 
                                      ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                                      : 'border-[#EC4899]/20 focus:ring-[#EC4899]/20 focus:border-[#EC4899]'
                                  }`}
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => setShowTimePicker(!showTimePicker)}
                                className="px-4 py-2.5 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded-xl hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300 shadow-lg hover:shadow-xl"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </button>
                            </div>
                            
                            <TimePicker
                              selectedTime={formData.selected_time}
                              availableTimes={availableTimes}
                              onTimeSelect={onTimeSelect}
                              onClose={() => setShowTimePicker(false)}
                              isOpen={showTimePicker}
                              isCustom={false}
                            />
                          </div>
                        )}
                        {errors.selected_time && (
                          <p className="text-red-500 text-xs mt-2">{errors.selected_time}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

                  {/* Step 5: Payment & Additional Details */}
                  {formData.user_id && formData.session_id && formData.class_id && formData.selected_date && formData.selected_time && (
                <div className="bg-white rounded-lg p-4 border border-[#EC4899]/10">
                  <h4 className="text-sm font-semibold text-[#4B2E83] mb-3 flex items-center gap-2">
                        <span className="w-6 h-6 bg-[#EC4899] text-white rounded-full flex items-center justify-center text-xs">5</span>
                    פרטי תשלום ונוספים
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">
                        סטטוס הרשמה *
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => onInputChange('status', e.target.value)}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none transition-all"
                      >
                        <option value="active">פעיל</option>
                        <option value="pending">ממתין</option>
                        <option value="cancelled">בוטל</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">
                        מחיר רכישה *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={formData.purchase_price}
                        onChange={(e) => onInputChange('purchase_price', e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                        className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg focus:ring-2 focus:outline-none transition-all ${
                          errors.purchase_price 
                            ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                            : 'border-[#EC4899]/20 focus:ring-[#EC4899]/20 focus:border-[#EC4899]'
                        }`}
                        placeholder="המחיר יותאם אוטומטית לפי השיעור"
                      />
                      {errors.purchase_price && (
                        <p className="text-red-500 text-xs mt-1">{errors.purchase_price}</p>
                      )}
                      {formData.class_id && !errors.purchase_price && (
                        <p className="text-xs text-gray-600 mt-1">
                          מחיר השיעור: {classes.find(cls => cls.id === formData.class_id)?.price || 0} ש"ח
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">
                        שיטת תשלום *
                      </label>
                      <select
                        value={formData.payment_method}
                        onChange={(e) => onInputChange('payment_method', e.target.value)}
                        className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg focus:ring-2 focus:outline-none transition-all ${
                          errors.payment_method 
                            ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                            : 'border-[#EC4899]/20 focus:ring-[#EC4899]/20 focus:border-[#EC4899]'
                        }`}
                      >
                        <option value="">בחרי שיטת תשלום</option>
                        <option value="cash">מזומן</option>
                        <option value="credit">כרטיס אשראי</option>
                        <option value="card_online">כרטיס אשראי באתר</option>
                        <option value="bit">ביט</option>
                        <option value="credit_usage">שימוש בקרדיט</option>
                      </select>
                      {errors.payment_method && (
                        <p className="text-red-500 text-xs mt-1">{errors.payment_method}</p>
                      )}
                          
                          {/* Show available credits when credit_usage is selected */}
                          {formData.payment_method === 'credit_usage' && userCredits && (
                            <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                              <p className="text-xs text-blue-700 font-medium">קרדיטים זמינים למשתמש:</p>
                              {loadingCredits ? (
                                <p className="text-xs text-blue-600">טוען...</p>
                              ) : (
                                <div className="text-xs text-blue-600">
                                  {userCredits.credits && userCredits.credits.length > 0 ? (
                                    <>
                                      {userCredits.credits.map((credit: any, index: number) => (
                                        <div key={credit.id || index} className="flex justify-between">
                                          <span>{credit.credit_group === 'group' ? 'קבוצה' : 'פרטי'}:</span>
                                          <span className="font-medium">{credit.remaining_credits} זמינים</span>
                                        </div>
                                      ))}
                                      <div className="mt-1 pt-1 border-t border-blue-200">
                                        <div className="flex justify-between font-semibold">
                                          <span>סה"כ קרדיטים:</span>
                                          <span className="font-bold">
                                            {userCredits.credits.reduce((sum: number, credit: any) => sum + credit.remaining_credits, 0)}
                                          </span>
                                        </div>
                    </div>
                                    </>
                                  ) : (
                                    <p className="text-red-600 font-medium">אין קרדיטים זמינים</p>
                                  )}
                                </div>
                              )}
                            </div>
                            )}
                          </div>
                      </div>
                  </div>
                  )}
                </>
              ) : (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-[#4B2E83]/60 text-center">בחרי משתמש תחילה כדי להמשיך</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="text-sm font-medium text-[#4B2E83]">שיעור</p>
                <p className="text-sm text-[#4B2E83]/70">
                  {registrationData.class?.name || registrationData.class_name || 'שיעור לא ידוע'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-[#4B2E83]">קבוצה</p>
                <p className="text-sm text-[#4B2E83]/70">
                  {registrationData.session?.name || 'לא נבחרה קבוצה'}
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
  );
} 