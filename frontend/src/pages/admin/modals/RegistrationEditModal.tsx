import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  getAvailableDatesForSession,
  getAvailableTimesForSessionAndDate,
  getAvailableDatesMessageForSession
} from '../../../utils/sessionsUtils';
import { FaCalendar } from 'react-icons/fa';
import UserDetailsSection from '../../../components/common/UserDetailsSection';
import RegistrationDetailsSection from '../../../components/common/RegistrationDetailsSection';
import { useAdminData } from '../../../contexts/AdminDataContext';

interface RegistrationEditModalProps {
  registrationData: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedRegistration: any) => void;
  isLoading: boolean;
  isNewRegistration?: boolean;
  classes?: any[];
  sessions?: any[];
  session_classes?: any[];
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
  session_classes = [],
  profiles = []
}: RegistrationEditModalProps) {
  const { fetchProfiles } = useAdminData();
  const isNewReg = isNewRegistration || !registrationData.id;
  
  const [formData, setFormData] = useState({
    user_id: registrationData.user_id || '',
    
    // Registration details
    class_id: registrationData.class_id || '',
    session_id: registrationData.session_id || '',
    session_class_id: registrationData.session_class_id || '',
    selected_date: registrationData.selected_date || '',
    selected_time: registrationData.selected_time || '',
    status: registrationData.status || 'active',
    
    // Credit and payment details
    purchase_price: registrationData.purchase_price || '',
    used_credit: registrationData.used_credit || false,
    credit_type: registrationData.credit_type || '',
    payment_method: registrationData.payment_method || 'cash',
    
    // Session selection
    session_selection: registrationData.session_selection || 'custom',
    
    // Manual user details fields
    first_name: registrationData.first_name || '',
    last_name: registrationData.last_name || '',
    email: registrationData.email || '',
    phone: registrationData.phone || ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  // State for available dates and times
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loadingDates, setLoadingDates] = useState(false);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [datesMessage, setDatesMessage] = useState('');
  const [useCustomDateTime, setUseCustomDateTime] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showCustomTimePicker, setShowCustomTimePicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isSearchingProfiles, setIsSearchingProfiles] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>(profiles || []);
  const previousProfilesRef = useRef<any[]>([]);
  
  // Add state for user credits
  const [userCredits, setUserCredits] = useState<any>(null);
  const [loadingCredits, setLoadingCredits] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Prevent modal from closing automatically
  useEffect(() => {
    if (showSuccessModal) {
      // Disable body scroll when modal is open
      document.body.style.overflow = 'hidden';
      
      return () => {
        // Re-enable body scroll when modal is closed
        document.body.style.overflow = 'unset';
      };
    }
  }, [showSuccessModal]);

  // Reset search results when opening modal or profiles prop changes
  useEffect(() => {
    const newProfiles = profiles || [];
    const currentIds = searchResults.map(p => p.id).sort();
    const newIds = newProfiles.map(p => p.id).sort();
    const previousIds = previousProfilesRef.current.map(p => p.id).sort();
    
    // Only update if profiles are actually different from previous
    if (JSON.stringify(currentIds) !== JSON.stringify(newIds) && 
        JSON.stringify(previousIds) !== JSON.stringify(newIds)) {
      setSearchResults(newProfiles);
      previousProfilesRef.current = newProfiles;
    }
  }, [profiles, isOpen]); // Remove searchResults from dependencies

  useEffect(() => {
    if (isNewReg) {
      // Reset form for new registration
      setFormData({
        user_id: '',
        class_id: '',
        session_id: '',
        session_class_id: '',
        selected_date: '',
        selected_time: '',
        status: 'active',
        purchase_price: '',
        used_credit: false,
        credit_type: '',
        payment_method: 'cash',
        session_selection: 'custom',
        first_name: '',
        last_name: '',
        email: '',
        phone: ''
      });
    } else {
      // Set form for editing existing registration
      setFormData({
        user_id: registrationData.user_id || '',
        class_id: registrationData.class_id || '',
        session_id: registrationData.session_id || '',
        session_class_id: registrationData.session_class_id || '',
        selected_date: registrationData.selected_date || '',
        selected_time: registrationData.selected_time || '',
        status: registrationData.status || 'active',
        purchase_price: registrationData.purchase_price || '',
        used_credit: registrationData.used_credit || false,
        credit_type: registrationData.credit_type || '',
        payment_method: registrationData.payment_method || 'cash',
        session_selection: registrationData.session_selection || 'custom',
        first_name: registrationData.first_name || '',
        last_name: registrationData.last_name || '',
        email: registrationData.email || '',
        phone: registrationData.phone || ''
      });
    }
    setErrors({});
  }, [registrationData, isNewReg]);

  // Load available dates and times when class changes
  useEffect(() => {
    if (isNewReg && formData.session_id && !useCustomDateTime) {
      loadAvailableDates(formData.session_id);
      if (formData.selected_date) {
        loadAvailableTimes(formData.session_id, formData.selected_date);
      }
    }
  }, [formData.session_id, formData.selected_date, isNewReg, useCustomDateTime]);

  // Load user credits when user is selected
  useEffect(() => {
    if (isNewReg && formData.user_id) {
      loadUserCredits(formData.user_id);
    }
  }, [formData.user_id, isNewReg]);

  const loadUserCredits = async (userId: string) => {
    try {
      setLoadingCredits(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/subscription-credits/user/${userId}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const credits = await response.json();
        setUserCredits(credits);
      } else {
        setUserCredits(null);
      }
    } catch (error) {
      console.error('Error loading user credits:', error);
      setUserCredits(null);
    } finally {
      setLoadingCredits(false);
    }
  };

  const loadAvailableDates = async (sessionId: string) => {
    try {
      setLoadingDates(true);
      // For now, we'll use the existing function but we should create session-specific functions
      const [dates, message] = await Promise.all([
        getAvailableDatesForSession(sessionId),
        getAvailableDatesMessageForSession(sessionId)
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

  const loadAvailableTimes = async (sessionId: string, date: string) => {
    try {
      setLoadingTimes(true);
      // For now, we'll use the existing function but we should create session-specific functions
      const times = await getAvailableTimesForSessionAndDate(sessionId, date);
      setAvailableTimes(times);
    } catch (error) {
      console.error('Error loading available times:', error);
      setAvailableTimes([]);
    } finally {
      setLoadingTimes(false);
    }
  };

  // Handle profile search
  const handleProfileSearch = useCallback(async (searchTerm: string) => {
    try {
      setIsSearchingProfiles(true);
      const results = await fetchProfiles(searchTerm);
      
      // Only update if results are different
      setSearchResults(prev => {
        const currentIds = prev.map(p => p.id).sort();
        const newIds = results.map(p => p.id).sort();
        
        if (JSON.stringify(currentIds) !== JSON.stringify(newIds)) {
          return results || [];
        }
        return prev;
      });
    } catch (error) {
      setSearchResults([]);
      console.error('Error searching profiles:', error);
    } finally {
      setIsSearchingProfiles(false);
    }
  }, [fetchProfiles]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (isNewReg) {
      // Step 1: User selection is always first
      if (!formData.user_id) newErrors.user_id = 'בחירת משתמש היא שדה חובה';
      
      // Step 2: Session selection (only if user is selected)
      if (formData.user_id && !formData.session_id) newErrors.session_id = 'בחירת קבוצה היא שדה חובה';
      
      // Step 3: Class selection (only if session is selected)
      if (formData.user_id && formData.session_id && !formData.class_id) newErrors.class_id = 'בחירת שיעור היא שדה חובה';
      
      // Step 4: Date and time (only if class is selected)
      if (formData.user_id && formData.session_id && formData.class_id && !formData.selected_date) newErrors.selected_date = 'תאריך הוא שדה חובה';
      if (formData.user_id && formData.session_id && formData.class_id && formData.selected_date && !formData.selected_time) newErrors.selected_time = 'שעה היא שדה חובה';
      
      // Step 5: Payment details (only if date and time are selected)
      if (formData.user_id && formData.session_id && formData.class_id && formData.selected_date && formData.selected_time) {
        if (!formData.purchase_price || formData.purchase_price <= 0) newErrors.purchase_price = 'מחיר רכישה הוא שדה חובה';
        if (!formData.payment_method) newErrors.payment_method = 'שיטת תשלום היא שדה חובה';
        
        // Check phone number
        const phone = formData.phone || searchResults.find(p => p.id === formData.user_id)?.phone || searchResults.find(p => p.id === formData.user_id)?.phone_number || '';
        if (!phone) newErrors.phone = 'מספר טלפון הוא שדה חובה';
        
        // Check credits if payment method is credit_usage
        if (formData.payment_method === 'credit_usage') {
          if (!userCredits || !userCredits.credits || userCredits.credits.length === 0) {
            newErrors.payment_method = 'אין קרדיטים זמינים למשתמש זה';
          } else {
            const totalCredits = userCredits.credits.reduce((sum: number, credit: any) => sum + credit.remaining_credits, 0);
            if (totalCredits <= 0) {
              newErrors.payment_method = 'אין קרדיטים זמינים למשתמש זה';
            }
          }
        }
      }
      
      // Conditional validation based on class type
      const selectedClass = classes.find(c => c.id === formData.class_id);
      if (selectedClass) {
        // Check if class requires credits
        if ((selectedClass.group_credits > 0 || selectedClass.private_credits > 0) && formData.used_credit && !formData.credit_type) {
          newErrors.credit_type = 'יש לבחור סוג קרדיט';
        }
        
        // Check if class is a trial class
        if (selectedClass.slug === 'trial-class') {
          // Additional validation for trial classes if needed
        }
      }
      
      // Validate session selection if using scheduled sessions
      if (formData.session_selection === 'scheduled' && !formData.session_id) {
        newErrors.session_id = 'יש לבחור מפגש קבוע';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkAvailability = async () => {
    if (!formData.session_id || !formData.selected_date || !formData.selected_time) {
      return { available: true, message: '' };
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/sessions/spots/${formData.session_id}/${formData.selected_date}/${formData.selected_time}`);
      
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        console.error('Failed to check availability');
        return { available: 0, message: 'שגיאה בבדיקת זמינות' };
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      return { available: 0, message: 'שגיאה בבדיקת זמינות' };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Check availability before saving
    if (isNewReg && formData.session_id && formData.selected_date && formData.selected_time) {
      const availability = await checkAvailability();
      
      if (availability.available <= 0) {
        setErrors(prev => ({
          ...prev,
          selected_time: `אין מקום פנוי בשעה זו. ${availability.message}`
        }));
        return;
      }
    }

    // Get selected user details
    const selectedUser = searchResults.find(p => p.id === formData.user_id);
    
    console.log('Selected user:', selectedUser);
    console.log('Search results:', searchResults);
    console.log('Form user_id:', formData.user_id);
    
    const submissionData = {
      ...registrationData,
      ...formData,
      // Use manual fields if provided, otherwise use user profile data
      first_name: formData.first_name || selectedUser?.first_name || '',
      last_name: formData.last_name || selectedUser?.last_name || '',
      email: selectedUser?.email || '', // Always use email from profile
      phone: formData.phone || selectedUser?.phone || selectedUser?.phone_number || '',
      // Ensure all new fields are included
      payment_method: formData.payment_method,
      used_credit: formData.used_credit,
      credit_type: formData.credit_type,
      session_selection: formData.session_selection,
      session_class_id: formData.session_class_id,
      // שלח רק את שעת ההתחלה
      selected_time: formData.selected_time?.split(' עד ')[0] || formData.selected_time
    };

    console.log('Sending registration data:', submissionData);

    onSave(submissionData);
    
    // הצג מודל הצלחה
    setShowSuccessModal(true);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Clear class when session changes
    if (field === 'session_id') {
      setFormData(prev => ({ 
        ...prev, 
        class_id: '', 
        purchase_price: '', 
        credit_type: '', 
        used_credit: false 
      }));
    }
    
    // Auto-set price when class is selected
    if (field === 'class_id' && value) {
      const selectedClass = classes.find(cls => cls.id === value);
      if (selectedClass && selectedClass.price) {
        setFormData(prev => ({ ...prev, purchase_price: selectedClass.price }));
      }
      
      // Reset credit type when class changes
      setFormData(prev => ({ ...prev, credit_type: '', used_credit: false }));
    }
    
    // Handle credit type selection
    if (field === 'credit_type' && value) {
      setFormData(prev => ({ ...prev, used_credit: true }));
    }
    
    // Handle session selection
    if (field === 'session_selection') {
      if (value === 'custom') {
        setFormData(prev => ({ ...prev, session_id: '', session_class_id: '' }));
      }
    }

    // Check availability when date or time changes
    if ((field === 'selected_date' || field === 'selected_time') && 
        formData.session_id && 
        (field === 'selected_date' ? value : formData.selected_date) && 
        (field === 'selected_time' ? value : formData.selected_time)) {
      
      const checkAvailabilityForSelection = async () => {
        const date = field === 'selected_date' ? value : formData.selected_date;
        const time = field === 'selected_time' ? value : formData.selected_time;
        
        try {
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/sessions/spots/${formData.session_id}/${date}/${time}`);
          
          if (response.ok) {
            const data = await response.json();
            if (data.available <= 0) {
              setErrors(prev => ({
                ...prev,
                selected_time: `אין מקום פנוי בשעה זו. ${data.message}`
              }));
            }
          }
        } catch (error) {
          console.error('Error checking availability:', error);
        }
      };
      
      checkAvailabilityForSelection();
    }

    // Check credits when payment method changes to credit_usage
    if (field === 'payment_method' && value === 'credit_usage') {
      if (userCredits && userCredits.credits && userCredits.credits.length > 0) {
        const totalCredits = userCredits.credits.reduce((sum: number, credit: any) => sum + credit.remaining_credits, 0);
        if (totalCredits <= 0) {
          setErrors(prev => ({
            ...prev,
            payment_method: 'אין קרדיטים זמינים למשתמש זה'
          }));
          // Reset payment method to empty
          setFormData(prev => ({ ...prev, payment_method: '' }));
        }
      } else {
        setErrors(prev => ({
          ...prev,
          payment_method: 'אין קרדיטים זמינים למשתמש זה'
        }));
        // Reset payment method to empty
        setFormData(prev => ({ ...prev, payment_method: '' }));
      }
    }
  };

  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateSelect = (date: Date) => {
      handleInputChange('selected_date', formatDateForInput(date));
      setShowDatePicker(false);
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleMonthChange = (direction: 'next' | 'prev') => {
    if (direction === 'next') {
      nextMonth();
    } else {
      prevMonth();
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
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3 sm:space-y-4">
            <UserDetailsSection
              isNewRegistration={isNewReg}
              formData={formData}
              registrationData={registrationData}
              profiles={searchResults}
              errors={errors}
              onInputChange={handleInputChange}
              onSearchProfiles={handleProfileSearch}
              isLoadingProfiles={isSearchingProfiles}
            />

            <RegistrationDetailsSection
              isNewRegistration={isNewReg}
              formData={formData}
              registrationData={registrationData}
              classes={classes}
              sessions={sessions}
              session_classes={session_classes}
              errors={errors}
              onInputChange={handleInputChange}
              useCustomDateTime={useCustomDateTime}
              setUseCustomDateTime={setUseCustomDateTime}
              showDatePicker={showDatePicker}
              setShowDatePicker={setShowDatePicker}
              showTimePicker={showTimePicker}
              setShowTimePicker={setShowTimePicker}
              showCustomTimePicker={showCustomTimePicker}
              setShowCustomTimePicker={setShowCustomTimePicker}
              currentMonth={currentMonth}
              setCurrentMonth={setCurrentMonth}
              availableDates={availableDates}
              availableTimes={availableTimes}
              loadingDates={loadingDates}
              loadingTimes={loadingTimes}
              datesMessage={datesMessage}
              onDateSelect={handleDateSelect}
              onTimeSelect={(time: string) => handleInputChange('selected_time', time)}
              onMonthChange={handleMonthChange}
              userCredits={userCredits}
              loadingCredits={loadingCredits}
            />

            {/* Registration Summary - Only show when all required fields are filled */}
            {isNewReg && formData.user_id && formData.session_id && formData.class_id && formData.selected_date && formData.selected_time && formData.purchase_price && formData.purchase_price > 0 && formData.payment_method && (
              <div className="bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5 border border-[#EC4899]/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#EC4899] to-[#4B2E83] rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-[#4B2E83]">סיכום ההרשמה</h3>
                </div>
                
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    קביעת{' '}
                    <span className="font-semibold text-[#4B2E83]">
                      {classes.find(c => c.id === formData.class_id)?.name}
                    </span>
                    {' '}בקבוצה{' '}
                    <span className="font-semibold text-[#4B2E83]">
                      {sessions.find(s => s.id === formData.session_id)?.name}
                    </span>
                    {' '}ל
                    <span className="font-semibold text-[#4B2E83]">
                      {searchResults.find(p => p.id === formData.user_id)?.first_name} {searchResults.find(p => p.id === formData.user_id)?.last_name}
                    </span>
                    {' '}בתאריך{' '}
                    <span className="font-semibold text-[#4B2E83]">
                      {new Date(formData.selected_date).toLocaleDateString('he-IL')}
                    </span>
                    {' '}ב
                    <span className="font-semibold text-[#4B2E83]">
                      {new Date(formData.selected_date).toLocaleDateString('he-IL', { weekday: 'long' })}
                    </span>
                    {' '}בשעה{' '}
                    <span className="font-semibold text-[#4B2E83]">
                      {formData.selected_time}
                    </span>
                    {' '}במחיר של{' '}
                    <span className="font-semibold text-[#EC4899]">
                      {formData.purchase_price} ש"ח
                    </span>
                    {' '}בתשלום{' '}
                    <span className="font-semibold text-[#4B2E83]">
                      {formData.payment_method === 'cash' ? 'מזומן' : 
                       formData.payment_method === 'credit' ? 'כרטיס אשראי' : 
                       formData.payment_method === 'card_online' ? 'כרטיס אשראי באתר' : 
                       formData.payment_method === 'bit' ? 'ביט' : 
                       formData.payment_method === 'credit_usage' ? 'קרדיט' : formData.payment_method}
                    </span>
                    ?
                  </p>
                </div>

                {/* Additional Details Summary */}
                {(formData.credit_type || formData.session_selection !== 'custom') && (
                  <div className="mt-4 pt-3 border-t border-[#EC4899]/20">
                    <h4 className="text-sm font-semibold text-[#4B2E83] mb-2">פרטים נוספים:</h4>
                    <div className="space-y-1 text-xs text-gray-600">
                      {formData.credit_type && (
                        <div className="flex justify-between">
                          <span>סוג קרדיט:</span>
                          <span className="font-medium">
                            {formData.credit_type === 'group' ? 'קבוצה' : 'פרטי'}
                          </span>
                        </div>
                      )}
                      {formData.session_selection === 'scheduled' && (
                        <div className="flex justify-between">
                          <span>סוג מפגש:</span>
                          <span className="font-medium">מפגש קבוע</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* כפתורים */}
                <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-3 border-t border-[#EC4899]/20">
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
              </div>
            )}

            {/* כפתורים - רק כשאין סיכום */}
            {(!isNewReg || !formData.user_id || !formData.class_id || !formData.selected_date || !formData.selected_time || !formData.purchase_price || formData.purchase_price <= 0) && (
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
            )}
        </form>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            // Prevent closing when clicking outside
            e.stopPropagation();
          }}
          onKeyDown={(e) => {
            // Prevent closing with Escape key
            if (e.key === 'Escape') {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
        >
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl transform transition-all">
            <div className="text-center">
              {/* Success Icon */}
              <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              {/* Title */}
              <h2 className="text-3xl font-bold text-gray-900 mb-4 font-agrandir-grand">
                {isNewReg ? 'הרשמה נוצרה בהצלחה! 🎉' : 'הרשמה עודכנה בהצלחה! ✅'}
              </h2>
              
              {/* Registration Details */}
              <div className="bg-gradient-to-r from-[#EC4899]/5 to-[#4B2E83]/5 border border-[#EC4899]/20 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-[#4B2E83] mb-4">פרטי ההרשמה:</h3>
                
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">משתמש:</span>
                    <span className="font-bold text-[#4B2E83]">
                      {searchResults.find(p => p.id === formData.user_id)?.first_name} {searchResults.find(p => p.id === formData.user_id)?.last_name}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-medium">שיעור:</span>
                    <span className="font-bold text-[#4B2E83]">
                      {classes.find(c => c.id === formData.class_id)?.name}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-medium">תאריך:</span>
                    <span className="font-bold text-[#4B2E83]">
                      {formData.selected_date ? new Date(formData.selected_date).toLocaleDateString('he-IL', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      }) : 'לא נבחר'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-medium">שעה:</span>
                    <span className="font-bold text-[#4B2E83]">
                      {formData.selected_time ? formData.selected_time.split(' עד ')[0] : 'לא נבחרה'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-medium">מחיר:</span>
                    <span className="font-bold text-[#EC4899]">{formData.purchase_price} ש"ח</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-medium">תשלום:</span>
                    <span className="font-bold text-[#4B2E83]">
                      {formData.payment_method === 'cash' ? 'מזומן' : 
                       formData.payment_method === 'credit' ? 'כרטיס אשראי' : 
                       formData.payment_method === 'card_online' ? 'כרטיס אשראי באתר' : 
                       formData.payment_method === 'bit' ? 'ביט' : 
                       formData.payment_method === 'credit_usage' ? 'קרדיט' : formData.payment_method}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Additional Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-right">
                    <h4 className="font-semibold text-blue-900 mb-2">מה הלאה?</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• ההרשמה נשמרה במערכת</li>
                      <li>• המשתמש יקבל אימייל אישור</li>
                      <li>• אפשר לערוך או לבטל מהפאנל הניהול</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    onClose();
                  }}
                  className="w-full bg-gradient-to-r from-[#EC4899] to-[#4B2E83] hover:from-[#4B2E83] hover:to-[#EC4899] text-white py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  סגור
                </button>
                
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    onClose();
                    // רענון הדף כדי לראות את ההרשמה החדשה
                    window.location.reload();
                  }}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-medium transition-colors duration-200"
                >
                  רענן דף
                </button>
              </div>
              
              {/* Close button in top-right corner */}
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  onClose();
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                aria-label="סגור"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 