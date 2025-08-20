import React, { useState, useEffect } from 'react';
import ResponsiveSelect from '../../../components/ui/ResponsiveSelect';
import { WEEKDAYS_OPTIONS } from '../../../utils';
import { isTrialClass } from '../../../utils/categoryUtils';

interface SessionEditModalProps {
  sessionData: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (session: any) => Promise<void>;
  isLoading?: boolean;
  classes?: any[]; // Available classes to link
  sessionClasses?: any[]; // Existing session-class links
}

// Helper functions
const isEditingSession = (sessionData: any): boolean => {
  return sessionData && Object.keys(sessionData).length > 0;
};

const getDefaultFormData = () => ({
  id: '',
  name: '',
  description: '',
  weekdays: [] as number[],
  start_time: '',
  end_time: '',
  start_date: '',
  end_date: '',
  duration_minutes: 60,
  max_capacity: 5,
  min_capacity: 1,
  location_id: '',
  room_name: '',
  address: 'רחוב יוסף לישנסקי 6 ראשון לציון ישראל',
  is_active: true
});

export default function SessionEditModal({ sessionData, isOpen, onClose, onSave, isLoading = false, classes = [], sessionClasses = [] }: SessionEditModalProps) {
  const [formData, setFormData] = useState(getDefaultFormData());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [linkedClasses, setLinkedClasses] = useState<Array<{class_id: string, price: number, is_trial: boolean, max_uses_per_user?: number}>>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [maxUsesPerUser, setMaxUsesPerUser] = useState<number>(1);

  // Initialize form data when sessionData changes
  useEffect(() => {
    if (isEditingSession(sessionData)) {
      setFormData({
        id: sessionData.id || '',
        name: sessionData.name || '',
        description: sessionData.description || '',
        weekdays: sessionData.weekdays || [],
        start_time: sessionData.start_time || '',
        end_time: sessionData.end_time || '',
        start_date: sessionData.start_date || '',
        end_date: sessionData.end_date || '',
        duration_minutes: sessionData.duration_minutes || 60,
        max_capacity: sessionData.max_capacity || 5,
        min_capacity: sessionData.min_capacity || 1,
        location_id: sessionData.location_id || '',
        room_name: sessionData.room_name || '',
        address: sessionData.address || 'רחוב יוסף לישנסקי 6 ראשון לציון ישראל',
        is_active: sessionData.is_active !== undefined ? sessionData.is_active : true
      });

      // Initialize linked classes from sessionClasses
      if (sessionClasses && sessionData.id) {
        const sessionLinks = sessionClasses.filter(sc => sc.session_id === sessionData.id);
        setLinkedClasses(sessionLinks.map(sc => ({
          class_id: sc.class_id,
          price: sc.price,
          is_trial: sc.is_trial,
          max_uses_per_user: sc.max_uses_per_user
        })));
      }
    } else {
      // Reset form for new session
      setFormData(getDefaultFormData());
      setLinkedClasses([]);
    }
    setErrors({});
  }, [sessionData, sessionClasses]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleWeekdayToggle = (weekday: number) => {
    setFormData(prev => ({
      ...prev,
      weekdays: prev.weekdays.includes(weekday)
        ? prev.weekdays.filter(w => w !== weekday)
        : [...prev.weekdays, weekday].sort()
    }));
  };

  // Handle adding a class to the session
  const handleAddClass = () => {
    if (!selectedClassId) {
      alert('אנא בחרי שיעור');
      return;
    }

    const selectedClass = classes.find(c => c.id === selectedClassId);
    if (!selectedClass) {
      alert('שיעור לא נמצא');
      return;
    }

    // Check if class is already linked
    if (linkedClasses.some(lc => lc.class_id === selectedClassId)) {
      alert('שיעור זה כבר מקושר לקבוצה זו');
      return;
    }

    // זיהוי אוטומטי של שיעור ניסיון לפי הקטגוריה
    const isClassTrial = isTrialClass(selectedClass.category);
    
    const newLinkedClass = {
      class_id: selectedClassId,
      price: selectedClass.price || 0, // Use the class's default price
      is_trial: isClassTrial, // זיהוי אוטומטי לפי קטגוריה
      max_uses_per_user: isClassTrial ? maxUsesPerUser : undefined
    };

    setLinkedClasses(prev => [...prev, newLinkedClass]);
    
    // Reset form
    setSelectedClassId('');
    setMaxUsesPerUser(1);
  };

  // Handle removing a class from the session
  const handleRemoveClass = (classId: string) => {
    setLinkedClasses(prev => prev.filter(lc => lc.class_id !== classId));
  };

  // Get class name by ID
  const getClassName = (classId: string) => {
    const classData = classes.find(c => c.id === classId);
    return classData ? classData.name : 'שיעור לא ידוע';
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'שם הקבוצה הוא שדה חובה';
    }

    if (formData.weekdays.length === 0) {
      newErrors.weekdays = 'יש לבחור לפחות יום אחד';
    }

    if (!formData.start_time) {
      newErrors.start_time = 'שעת התחלה היא שדה חובה';
    }

    if (!formData.end_time) {
      newErrors.end_time = 'שעת סיום היא שדה חובה';
    }

    if (formData.start_time && formData.end_time && formData.start_time >= formData.end_time) {
      newErrors.end_time = 'שעת הסיום חייבת להיות מאוחרת משעת ההתחלה';
    }

    if (formData.max_capacity <= 0) {
      newErrors.max_capacity = 'תפוסה מקסימלית חייבת להיות גדולה מ-0';
    }

    // Validate linked classes
    if (linkedClasses.length === 0) {
      newErrors.linkedClasses = 'יש לקשר לפחות שיעור אחד לקבוצה';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const sessionDataWithLinkedClasses = {
        ...formData,
        linkedClasses
      };
      await onSave(sessionDataWithLinkedClasses);
      onClose();
    } catch (error) {
      console.error('Error saving session:', error);
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {isEditingSession(sessionData) ? 'עריכת קבוצה' : 'הוספת קבוצה חדשה'}
                </h2>
                <p className="text-white/80 text-sm mt-1">
                  {isEditingSession(sessionData) ? 'ערוך את פרטי הקבוצה' : 'צור קבוצה חדשה במערכת'}
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
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {/* פרטי בסיס */}
            <div className="bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5 rounded-xl p-4">
              <h3 className="text-lg font-bold text-[#4B2E83] mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                פרטי הקבוצה
              </h3>
              
              {/* שורה ראשונה - שם וסטטוס */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#4B2E83] mb-2">
                    שם הקבוצה <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none transition-all ${
                      errors.name ? 'border-red-500' : 'border-[#EC4899]/20'
                    }`}
                    placeholder="לדוגמה: קבוצת בוקר - ימי ראשון"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                  <ResponsiveSelect
                    label="סטטוס"
                    value={formData.is_active ? 'true' : 'false'}
                    onChange={(v) => handleInputChange('is_active', v === 'true')}
                    options={[
                      { value: 'true', label: 'פעיל' },
                      { value: 'false', label: 'לא פעיל' }
                    ]}
                    menuZIndex={70}
                  />
                </div>
              </div>

              {/* שורה שנייה - תיאור */}
              <div>
                <label className="block text-sm font-medium text-[#4B2E83] mb-2">
                  תיאור הקבוצה
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none transition-all"
                  placeholder="תיאור קצר של הקבוצה..."
                />
              </div>


            </div>

            {/* זמני פעילות */}
            <div className="bg-gradient-to-r from-[#4B2E83]/5 to-[#EC4899]/5 rounded-xl p-4">
              <h3 className="text-lg font-bold text-[#4B2E83] mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                זמני פעילות
              </h3>

              {/* שורה ראשונה - זמנים */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#4B2E83] mb-2">
                    שעת התחלה <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => handleInputChange('start_time', e.target.value)}
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none transition-all ${
                      errors.start_time ? 'border-red-500' : 'border-[#EC4899]/20'
                    }`}
                  />
                  {errors.start_time && <p className="text-red-500 text-xs mt-1">{errors.start_time}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#4B2E83] mb-2">
                    שעת סיום <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => handleInputChange('end_time', e.target.value)}
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none transition-all ${
                      errors.end_time ? 'border-red-500' : 'border-[#EC4899]/20'
                    }`}
                  />
                  {errors.end_time && <p className="text-red-500 text-xs mt-1">{errors.end_time}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#4B2E83] mb-2">
                    משך (דק')
                  </label>
                  <input
                    type="number"
                    min="15"
                    max="180"
                    value={formData.duration_minutes}
                    onChange={(e) => handleInputChange('duration_minutes', parseInt(e.target.value) || 60)}
                    className="w-full px-3 py-2 text-sm border border-[#EC4899]/20 rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none transition-all"
                    placeholder="60"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#4B2E83] mb-2">
                    תפוסה מקס' <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.max_capacity > 0 ? formData.max_capacity : ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '') {
                        handleInputChange('max_capacity', 5);
                      } else {
                        const numValue = parseInt(value);
                        if (numValue > 0) {
                          handleInputChange('max_capacity', numValue);
                        }
                      }
                    }}
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-[#EC4899]/20 focus:border-[#EC4899] outline-none transition-all ${
                      errors.max_capacity ? 'border-red-500' : 'border-[#EC4899]/20'
                    }`}
                    placeholder="5"
                    min="1"
                  />
                  {errors.max_capacity && <p className="text-red-500 text-xs mt-1">{errors.max_capacity}</p>}
                </div>
              </div>

              {/* שורה שנייה - ימי פעילות */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-[#4B2E83] mb-2">
                  ימי פעילות <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                  {WEEKDAYS_OPTIONS.map((weekday) => (
                    <button
                      key={weekday.value}
                      type="button"
                      onClick={() => handleWeekdayToggle(weekday.value)}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                        formData.weekdays.includes(weekday.value)
                          ? 'bg-[#EC4899] text-white border-[#EC4899]'
                          : 'bg-white text-[#4B2E83] border-[#EC4899]/20 hover:border-[#EC4899]/40'
                      }`}
                    >
                      <div className="text-xs font-medium">{weekday.label}</div>
                    </button>
                  ))}
                </div>
                {errors.weekdays && <p className="text-red-500 text-xs mt-2">{errors.weekdays}</p>}
              </div>
            </div>

            {/* שיעורים מקושרים */}
            <div className="bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5 rounded-xl p-4">
              {/* כותרת וכפתור עזרה */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-[#4B2E83] flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                    שיעורים מקושרים
                  </h3>
                  <p className="text-sm text-[#4B2E83]/70 mt-1">
                    השיעורים שיתקיימו בקבוצה זו בזמנים הנבחרים
                  </p>
                </div>
                
                {/* תיבת הסבר - רספונסיבית */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 w-full sm:max-w-xs">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-xs font-semibold text-blue-800">מה זה אומר?</span>
                  </div>
                  <div className="text-xs text-blue-700 leading-relaxed space-y-1">
                    <div className="flex flex-col sm:flex-row sm:gap-1">
                      <strong className="block sm:inline">קבוצה:</strong>
                      <span className="block sm:inline">מתי ואיפה השיעורים מתקיימים</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:gap-1">
                      <strong className="block sm:inline">שיעורים מקושרים:</strong>
                      <span className="block sm:inline">איזה סוגי שיעורים יתקיימו בקבוצה זו</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* הוסף שיעור חדש */}
              <div className="bg-white rounded-lg p-4 mb-4 border border-[#EC4899]/20">
                <h4 className="text-sm font-semibold text-[#4B2E83] mb-3">הוסיפי שיעור לקבוצה</h4>
                
                {/* בחירת שיעור - רספונסיבי */}
                <div className="space-y-3">
                  <div>
                    <ResponsiveSelect
                      label="בחר שיעור"
                      value={selectedClassId}
                      onChange={(v) => setSelectedClassId(v)}
                      options={[
                        { value: '', label: 'בחר שיעור...' }, 
                        ...classes.map((cls) => ({ 
                          value: String(cls.id), 
                          label: `${cls.name} - ₪${cls.price || 0}${isTrialClass(cls.category) ? ' (שיעור ניסיון)' : ''}` 
                        }))
                      ]}
                      menuZIndex={70}
                    />
                  </div>
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={handleAddClass}
                      disabled={!selectedClassId}
                      className="px-6 py-2 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded-lg font-medium hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      הוסף שיעור לקבוצה
                    </button>
                  </div>
                </div>

                {/* הגדרת מגבלות לשיעור ניסיון - רספונסיבי */}
                {selectedClassId && isTrialClass(classes.find(c => c.id === selectedClassId)?.category) && (
                  <div className="mt-3 p-3 bg-orange-50 border-l-4 border-orange-400 rounded-r-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex items-center gap-2 flex-1">
                        <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-orange-800">שיעור ניסיון נזהה אוטומטית</span>
                      </div>
                      <div className="flex items-center gap-2 justify-center sm:justify-start">
                        <label className="text-sm text-orange-700 whitespace-nowrap">מקס' שימושים:</label>
                        <input
                          type="number"
                          value={maxUsesPerUser}
                          onChange={(e) => setMaxUsesPerUser(Number(e.target.value) || 1)}
                          min="1"
                          className="w-16 px-2 py-1 border border-orange-300 rounded text-sm focus:ring-1 focus:ring-orange-200 focus:border-orange-400 outline-none text-center"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* רשימת שיעורים מקושרים */}
              <div className="space-y-3">
                {errors.linkedClasses && (
                  <div className="text-red-500 text-xs bg-red-50 p-2 rounded-lg border border-red-200">
                    {errors.linkedClasses}
                  </div>
                )}
                {linkedClasses.length === 0 ? (
                  <div className="text-center py-8 bg-white rounded-lg border border-[#EC4899]/20">
                    <div className="mx-auto mb-3 w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-sm text-[#4B2E83]/70">אין שיעורים מקושרים לקבוצה זו</p>
                  </div>
                ) : (
                  linkedClasses.map((linkedClass) => (
                    <div key={linkedClass.class_id} className="bg-white rounded-lg p-4 border border-[#EC4899]/20 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-[#EC4899]/10 to-[#4B2E83]/10 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-[#4B2E83]" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-medium text-[#4B2E83] text-base">{getClassName(linkedClass.class_id)}</h4>
                          <div className="flex items-center gap-4 text-xs text-[#4B2E83]/70">
                            <span>מחיר: ₪{linkedClass.price}</span>
                            {linkedClass.is_trial && (
                              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
                                שיעור ניסיון
                              </span>
                            )}
                            {linkedClass.max_uses_per_user && (
                              <span>מקסימום: {linkedClass.max_uses_per_user} שימושים</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveClass(linkedClass.class_id)}
                        className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* כפתורים */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-[#4B2E83] text-[#4B2E83] rounded-lg font-medium hover:bg-[#4B2E83] hover:text-white transition-all duration-300"
              >
                ביטול
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white rounded-lg font-medium hover:from-[#4B2E83] hover:to-[#EC4899] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    שומרת...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {isEditingSession(sessionData) ? 'עדכני קבוצה' : 'צרי קבוצה'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 