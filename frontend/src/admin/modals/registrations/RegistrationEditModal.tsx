import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  getAvailableDatesForSession,
  getAvailableTimesForSessionAndDate,
  getAvailableDatesMessageForSession
} from '../../../utils/sessionsUtils';
import UserDetailsSection from '../../../components/common/UserDetailsSection';

import { SuccessModal } from '../../../components/common';
import { useAdminData } from '../../contexts/AdminDataContext';

// Define specific types instead of using 'any'
interface Class {
  id: string;
  name: string;
  price: number;
  category: string;
  slug: string;
  class_type?: 'group' | 'private' | 'both';
  group_credits?: number; // total credits included for group (if relevant)
  private_credits?: number; // total credits included for private (if relevant)
}

interface Session {
  id: string;
  name: string;
  session_name: string;
  weekdays: number[];
  start_time: string;
  end_time: string;
}

interface SessionClass {
  id: string;
  session_id: string;
  class_id: string;
  is_active: boolean;
}

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  phone_number: string;
}

interface SubscriptionCredit {
  id: string;
  user_id: string;
  credit_group: 'group' | 'private';
  remaining_credits: number;
  total_credits: number;
  used_credits: number;
}

interface UserCredits {
  group_credits: SubscriptionCredit[];
  private_credits: SubscriptionCredit[];
  total_group_credits: number;
  total_private_credits: number;
  available_group_credits: number;
  available_private_credits: number;
}

interface RegistrationData {
  id?: string;
  user_id?: string;
  class_id?: string;
  session_id?: string;
  session_class_id?: string;
  selected_date?: string;
  selected_time?: string;
  status?: string;
  purchase_price?: number;
  used_credit?: boolean;
  credit_type?: string;
  session_selection?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
}

interface FormData {
  user_id: string;
  class_id: string;
  session_id: string;
  session_class_id: string;
  selected_date: string;
  selected_time: string;
  status: string;
  purchase_price: number;
  used_credit: boolean;
  credit_type: string;
  session_selection: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

interface RegistrationEditModalProps {
  registrationData: RegistrationData;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedRegistration: RegistrationData, returnCredit?: boolean) => void;
  isLoading: boolean;
  isNewRegistration?: boolean;
  classes?: Class[];
  sessions?: Session[];
  session_classes?: SessionClass[];
  profiles?: Profile[];
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

  // Helper: determine allowed credit types per class_type/category
  const getAllowedCreditTypesForClass = (cls?: Class): Array<'group' | 'private'> => {
    if (!cls) return [];
    if (cls.class_type === 'group') return ['group'];
    if (cls.class_type === 'private') return ['private'];
    if (cls.class_type === 'both') {
      return cls.category === 'private' ? ['private'] : ['group'];
    }
    // Fallback if class_type missing
    if (cls.category === 'private') return ['private'];
    if (cls.category === 'subscription') return ['group'];
    return [];
  };
  
  const [formData, setFormData] = useState<FormData>({
    user_id: registrationData.user_id || '',
    
    // Registration details
    class_id: registrationData.class_id || '',
    session_id: registrationData.session_id || '',
    session_class_id: registrationData.session_class_id || '',
    selected_date: registrationData.selected_date || '',
    selected_time: registrationData.selected_time || '',
    status: registrationData.status || 'active',
    
    // Credit and payment details
    purchase_price: registrationData.purchase_price || 0,
    used_credit: registrationData.used_credit || false,
    credit_type: registrationData.credit_type || '',
    
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
  const [searchResults, setSearchResults] = useState<Profile[]>(profiles || []);
  const previousProfilesRef = useRef<Profile[]>([]);
  
  // Add state for user credits
  const [userCredits, setUserCredits] = useState<UserCredits | null>(null);
  const [loadingCredits, setLoadingCredits] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [returnCredit, setReturnCredit] = useState<boolean>(true); // Default to return credit
  const [successFormData, setSuccessFormData] = useState<any>(null);

  // Auto-select class if only one class is available for the chosen session
  useEffect(() => {
    if (!formData.session_id) return;
    const relatedSessionClasses = session_classes.filter(sc => sc.session_id === formData.session_id);
    const relatedClassIds = relatedSessionClasses.map(sc => sc.class_id);
    const relatedClasses = classes.filter(cls => relatedClassIds.includes(cls.id));
    if (relatedClasses.length === 1 && formData.class_id !== relatedClasses[0].id) {
      setFormData(prev => ({ ...prev, class_id: relatedClasses[0].id }));
    }
  }, [formData.session_id, session_classes, classes]);

  // Auto-select credit type if only one possible and user chose to use credit
  useEffect(() => {
    if (!formData.used_credit || !formData.class_id) return;
    const selectedClass = classes.find(c => c.id === formData.class_id);
    const allowed = getAllowedCreditTypesForClass(selectedClass);
    const hasGroup = allowed.includes('group') && (userCredits?.available_group_credits || 0) > 0;
    const hasPrivate = allowed.includes('private') && (userCredits?.available_private_credits || 0) > 0;
    const onlyOne = (hasGroup ? 1 : 0) + (hasPrivate ? 1 : 0) === 1;
    if (onlyOne) {
      const type = hasGroup ? 'group' : 'private';
      if (formData.credit_type !== type) setFormData(prev => ({ ...prev, credit_type: type }));
    }
  }, [formData.used_credit, formData.class_id, userCredits, classes]);

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

  // Listen for close event from success modal
  useEffect(() => {
    const handleCloseModal = () => {
      onClose();
    };

    window.addEventListener('closeRegistrationModal', handleCloseModal);
    
    return () => {
      window.removeEventListener('closeRegistrationModal', handleCloseModal);
    };
  }, [onClose]);

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
        purchase_price: 0,
        used_credit: false,
        credit_type: '',
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
        purchase_price: registrationData.purchase_price || 0,
        used_credit: registrationData.used_credit || false,
        credit_type: registrationData.credit_type || '',
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

  // Check credit availability when class changes
  useEffect(() => {
    if (formData.class_id && formData.used_credit && userCredits) {
      const selectedClass = classes.find(c => c.id === formData.class_id);
      if (selectedClass) {
        const allowedTypes = getAllowedCreditTypesForClass(selectedClass);
        const supportsCredits = allowedTypes.length > 0;
        if (!supportsCredits) {
          setFormData(prev => ({ ...prev, used_credit: false, credit_type: '' }));
        } else if (formData.credit_type) {
          const hasEnoughCredits = (() => {
            if (formData.credit_type === 'group' && allowedTypes.includes('group')) {
              return (userCredits.available_group_credits || 0) > 0;
            } else if (formData.credit_type === 'private' && allowedTypes.includes('private')) {
              return (userCredits.available_private_credits || 0) > 0;
            }
            return false;
          })();
          if (!hasEnoughCredits) {
            setFormData(prev => ({ ...prev, credit_type: '' }));
          }
        }
      }
    }
  }, [formData.class_id, formData.used_credit, formData.credit_type, userCredits, classes]);

  const loadUserCredits = async (userId: string) => {
    try {
      setLoadingCredits(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/subscription-credits/user/${userId}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // API may return either an array of credits or an object { credits, total_* }
        const creditsArray = Array.isArray(data) ? data : (data?.credits || []);
        const totalGroupFromApi = Array.isArray(data) ? undefined : data?.total_group_credits;
        const totalPrivateFromApi = Array.isArray(data) ? undefined : data?.total_private_credits;

        const total_group_credits = typeof totalGroupFromApi === 'number'
          ? totalGroupFromApi
          : creditsArray.filter((c: any) => c.credit_group === 'group').reduce((s: number, c: any) => s + (c.remaining_credits || 0), 0);

        const total_private_credits = typeof totalPrivateFromApi === 'number'
          ? totalPrivateFromApi
          : creditsArray.filter((c: any) => c.credit_group === 'private').reduce((s: number, c: any) => s + (c.remaining_credits || 0), 0);

        const available_group_credits = creditsArray.filter((c: any) => c.credit_group === 'group').reduce((s: number, c: any) => s + (c.remaining_credits || 0), 0);
        const available_private_credits = creditsArray.filter((c: any) => c.credit_group === 'private').reduce((s: number, c: any) => s + (c.remaining_credits || 0), 0);

        const transformedCredits: UserCredits = {
          group_credits: creditsArray.filter((c: any) => c.credit_group === 'group'),
          private_credits: creditsArray.filter((c: any) => c.credit_group === 'private'),
          total_group_credits,
          total_private_credits,
          available_group_credits,
          available_private_credits
        };
        
        setUserCredits(transformedCredits);
      } else {
        setUserCredits(null);
      }
    } catch (error) {
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
        
        // Check phone number
        const phone = formData.phone || searchResults.find(p => p.id === formData.user_id)?.phone || searchResults.find(p => p.id === formData.user_id)?.phone_number || '';
        if (!phone) newErrors.phone = 'מספר טלפון הוא שדה חובה';
      }
      
      // Conditional validation based on class type
      const selectedClass = classes.find(c => c.id === formData.class_id);
      if (selectedClass) {
        // Check if class supports credits
        const isSubscriptionClass = selectedClass.category === 'subscription';
        const supportsCredits = isSubscriptionClass && (selectedClass.group_credits || selectedClass.private_credits);
        
        if (supportsCredits && formData.used_credit) {
          // Validate credit type selection
          if (!formData.credit_type) {
          newErrors.credit_type = 'יש לבחור סוג קרדיט';
          } else {
            // Validate credit availability
            const hasEnoughCredits = (() => {
              if (formData.credit_type === 'group' && selectedClass.group_credits) {
                return userCredits && userCredits.available_group_credits > 0;
              } else if (formData.credit_type === 'private' && selectedClass.private_credits) {
                return userCredits && userCredits.available_private_credits > 0;
              }
              return false;
            })();
            
            if (!hasEnoughCredits) {
              newErrors.credit_type = 'אין מספיק קרדיטים זמינים מהסוג הנבחר';
            }
          }
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
        return { available: 0, message: 'שגיאה בבדיקת זמינות' };
      }
    } catch (error) {
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
    
    // Ensure we have all required data
    if (!selectedUser) {
      console.error('No selected user found');
      return;
    }

    const submissionData = {
      ...registrationData,
      ...formData,
      // Use manual fields if provided, otherwise use user profile data
      first_name: formData.first_name || selectedUser?.first_name || '',
      last_name: formData.last_name || selectedUser?.last_name || '',
      email: selectedUser?.email || '', // Always use email from profile
      phone: formData.phone || selectedUser?.phone || selectedUser?.phone_number || '',
      // Ensure all new fields are included
      used_credit: formData.used_credit,
      credit_type: formData.credit_type,
      session_selection: formData.session_selection,
      session_class_id: formData.session_class_id,
      // שלח רק את שעת ההתחלה
      selected_time: formData.selected_time?.split(' עד ')[0] || formData.selected_time,
      // Ensure user_id is always included
      user_id: formData.user_id
    };

    // Validate that all required fields are present
    if (!submissionData.first_name || !submissionData.last_name || !submissionData.phone || !submissionData.email || !submissionData.selected_date || !submissionData.selected_time || !submissionData.user_id) {
      console.error('Missing required fields:', submissionData);
      return;
    }

    // Clean up empty strings and convert them to undefined for backend
    const cleanedSubmissionData = {
      ...submissionData,
      first_name: submissionData.first_name?.trim() || undefined,
      last_name: submissionData.last_name?.trim() || undefined,
      phone: submissionData.phone?.trim() || undefined,
      email: submissionData.email?.trim() || undefined,
      selected_date: submissionData.selected_date?.trim() || undefined,
      selected_time: submissionData.selected_time?.trim() || undefined,
      class_id: submissionData.class_id || undefined,
      session_id: submissionData.session_id || undefined,
      session_class_id: submissionData.session_class_id || undefined,
      user_id: submissionData.user_id || undefined,
      // Ensure credit fields are preserved
      used_credit: Boolean(submissionData.used_credit),
      credit_type: submissionData.credit_type
    };

    // Log the data being sent
    console.log('=== REGISTRATION EDIT MODAL: SENDING DATA ===');
    console.log('Is new registration:', isNewReg);
    console.log('Used credit:', cleanedSubmissionData.used_credit);
    console.log('Credit type:', cleanedSubmissionData.credit_type);
    console.log('User ID:', cleanedSubmissionData.user_id);
    console.log('Used credit type:', typeof cleanedSubmissionData.used_credit);
    console.log('Credit type type:', typeof cleanedSubmissionData.credit_type);
    console.log('Full data:', cleanedSubmissionData);
    
    // Additional validation for credits
    if (cleanedSubmissionData.used_credit && !cleanedSubmissionData.credit_type) {
      console.error('Used credit is true but no credit type specified');
    }
    
    if (cleanedSubmissionData.credit_type && !cleanedSubmissionData.used_credit) {
      console.error('Credit type specified but used_credit is false');
    }
    
    // Check if this is a subscription class and user has no credits
      const selectedClass = classes.find(c => c.id === cleanedSubmissionData.class_id);
      const allowedTypes = getAllowedCreditTypesForClass(selectedClass);
      const supportsCredits = allowedTypes.length > 0;
    
    if (supportsCredits && cleanedSubmissionData.used_credit) {
      // Validate that user has enough credits
      const hasEnoughCredits = (() => {
        if (cleanedSubmissionData.credit_type === 'group' && allowedTypes.includes('group')) {
          return userCredits && userCredits.available_group_credits > 0;
        } else if (cleanedSubmissionData.credit_type === 'private' && allowedTypes.includes('private')) {
          return userCredits && userCredits.available_private_credits > 0;
        }
        return false;
      })();
      
      if (!hasEnoughCredits) {
        console.error('User does not have enough credits for this class');
        setErrors(prev => ({
          ...prev,
          credit_type: 'אין מספיק קרדיטים זמינים מהסוג הנבחר'
        }));
        return;
      }
      
      // Set purchase price to 0 when using credits
      cleanedSubmissionData.purchase_price = 0;
      
      console.log('Using credits for class:', {
        used_credit: cleanedSubmissionData.used_credit,
        credit_type: cleanedSubmissionData.credit_type,
        purchase_price: cleanedSubmissionData.purchase_price
      });
    } else if (supportsCredits && !cleanedSubmissionData.used_credit) {
      // If it's a subscription class but user chose not to use credits, ensure purchase price is set
      if (!cleanedSubmissionData.purchase_price || cleanedSubmissionData.purchase_price <= 0) {
        cleanedSubmissionData.purchase_price = selectedClass?.price || 0;
      }
    }

    // Send returnCredit parameter if it's an existing registration with credits
    if (!isNewReg && registrationData.used_credit && registrationData.credit_type) {
      onSave(cleanedSubmissionData, returnCredit);
    } else {
      onSave(cleanedSubmissionData);
    }
    
    // שמור את הנתונים למודל ההצלחה
    setSuccessFormData(cleanedSubmissionData);
    
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
        purchase_price: 0, 
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
      console.log('Credit type selected:', value);
      setFormData(prev => ({ 
        ...prev, 
        used_credit: true,
        credit_type: value 
      }));
      console.log('Updated form data - used_credit: true, credit_type:', value);
    }
  
  // Handle class selection - check credit eligibility
    if (field === 'class_id' && value) {
      const selectedClass = classes.find(cls => cls.id === value);
      if (selectedClass) {
        if (selectedClass.price) {
          setFormData(prev => ({ ...prev, purchase_price: selectedClass.price }));
        }
        const allowedTypes = getAllowedCreditTypesForClass(selectedClass);
        if (allowedTypes.length === 0) {
          setFormData(prev => ({ ...prev, used_credit: false, credit_type: '' }));
        } else {
          // Reset credit_type on class change
          setFormData(prev => ({ ...prev, credit_type: '' }));
        }
      }
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
          // console.error('Error checking availability:', error); // Removed console.error
        }
      };
      
      checkAvailabilityForSelection();
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

            {/* Registration Details Section */}
            <div className="bg-gradient-to-r from-[#4B2E83]/5 to-[#EC4899]/5 rounded-xl p-3 sm:p-4">
              <h3 className="text-sm sm:text-base font-bold text-[#4B2E83] mb-2 sm:mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {isNewReg && !formData.user_id ? 'בחרי משתמש תחילה' : 'פרטי הרשמה'}
              </h3>
              <div className="space-y-3">
                {isNewReg ? (
                  <div className="space-y-4">
                    {formData.user_id ? (
                      <>
                        {/* Step 2 & 3: Group and Class Selection */}
                        <div className="bg-white rounded-lg p-4 border border-[#EC4899]/10">
                          <h4 className="text-sm font-semibold text-[#4B2E83] mb-3 flex items-center gap-2">
                            <span className="w-6 h-6 bg-[#EC4899] text-white rounded-full flex items-center justify-center text-xs">2</span>
                            בחירת קבוצה ושיעור
                          </h4>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* Group Selection */}
                            <div>
                              <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">
                                קבוצה *
                              </label>
                              <select
                                required
                                value={formData.session_id}
                                onChange={(e) => handleInputChange('session_id', e.target.value)}
                                className="w-full px-3 py-2.5 text-sm border border-[#EC4899]/20 rounded-xl focus:ring-2 focus:outline-none transition-all bg-white"
                              >
                                <option value="">בחרי קבוצה...</option>
                                {sessions.map((session) => {
                                  let label = session.name || session.session_name || 'קבוצה ללא שם';
                                  if (session.weekdays && session.weekdays.length > 0) {
                                    const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
                                    label += ' (' + session.weekdays.map(d => dayNames[d]).join(', ') + ')';
                                  }
                                  if (session.start_time && session.end_time) label += ` ${session.start_time}-${session.end_time}`;
                                  return (
                                    <option key={session.id} value={session.id}>
                                      {label}
                                    </option>
                                  );
                                })}
                              </select>
                              {errors.session_id && (
                                <p className="text-red-500 text-xs mt-2">{errors.session_id}</p>
                              )}
                            </div>

                            {/* Class Selection */}
                            {formData.session_id && (
                              <div>
                                <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">
                                  שיעור *
                                </label>
                                {(() => {
                                  const relatedSessionClasses = session_classes.filter(sc => sc.session_id === formData.session_id);
                                  const relatedClassIds = relatedSessionClasses.map(sc => sc.class_id);
                                  const relatedClasses = classes.filter(cls => relatedClassIds.includes(cls.id));
                                  const single = relatedClasses.length === 1;
                                  if (single) {
                                    const only = relatedClasses[0];
                                    return (
                                      <input
                                        type="text"
                                        value={`${only.name} - ${only.price} ש"ח`}
                                        readOnly
                                        className="w-full px-3 py-2.5 text-sm border border-[#EC4899]/20 rounded-xl bg-gray-50 text-gray-700"
                                      />
                                    );
                                  }
                                  return (
                                    <select
                                      required
                                      value={formData.class_id}
                                      onChange={(e) => handleInputChange('class_id', e.target.value)}
                                      className="w-full px-3 py-2.5 text-sm border border-[#EC4899]/20 rounded-xl focus:ring-2 focus:outline-none transition-all bg-white"
                                    >
                                      <option value="">בחרי שיעור...</option>
                                      {relatedClasses.map(cls => (
                                        <option key={cls.id} value={cls.id}>
                                          {cls.name} - {cls.price} ש"ח
                                        </option>
                                      ))}
                                    </select>
                                  );
                                })()}
                                {errors.class_id && (
                                  <p className="text-red-500 text-xs mt-2">{errors.class_id}</p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Step 4: Date and Time Selection */}
                        {formData.class_id && (
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
                                          onChange={(e) => handleInputChange('selected_date', e.target.value)}
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
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                      </button>
                                    </div>
                                    
                                    {/* Calendar Picker would go here */}
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
                                          onChange={(e) => handleInputChange('selected_time', e.target.value)}
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
                                    
                                    {/* Time Picker would go here */}
                                  </div>
                                  {errors.selected_time && (
                                    <p className="text-red-500 text-xs mt-2">{errors.selected_time}</p>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {/* Date Selection */}
                                <div>
                                  <label className="block text-sm font-bold text-[#4B2E83] mb-3">
                                    <svg className="w-4 h-4 inline ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    בחרי תאריך לשיעור *
                                  </label>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 lg:gap-3 px-1 sm:px-0">
                                    {loadingDates ? (
                                      Array.from({ length: 3 }).map((_, index) => (
                                        <div key={index} className="h-16 bg-gray-100 rounded-xl animate-pulse"></div>
                                      ))
                                    ) : availableDates.length > 0 ? (
                                      availableDates.map((date) => {
                                        const dateObj = new Date(date);
                                        const isSelected = formData.selected_date === date;
                                        const today = new Date().toISOString().split('T')[0];
                                        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                                        const isToday = date === today;
                                        const isTomorrow = date === tomorrow;
                                        
                                        return (
                                          <button
                                            key={date}
                                            type="button"
                                            onClick={() => {
                                              handleInputChange('selected_date', date);
                                              handleInputChange('selected_time', '');
                                            }}
                                            className={`
                                              p-1 lg:p-3 py-3 lg:py-5 rounded-xl border-2 transition-all duration-200 text-xs lg:text-sm font-bold relative h-16 flex items-center justify-center
                                              ${isSelected 
                                                ? 'bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white border-transparent shadow-lg' 
                                                : 'bg-white border-gray-200 hover:border-gray-300 text-[#2B2B2B] hover:shadow-md'
                                              }
                                            `}
                                          >
                                            {isToday && (
                                              <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md transform rotate-12">
                                                היום
                                              </div>
                                            )}
                                            {isTomorrow && (
                                              <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md transform rotate-12">
                                                מחר
                                              </div>
                                            )}

                                            <div className="text-center leading-tight">
                                              <div className="text-xs lg:text-sm">
                                                <div className="hidden sm:block">
                                                  {dateObj.toLocaleDateString('he-IL', { 
                                                    day: 'numeric', 
                                                    month: 'numeric', 
                                                    year: 'numeric' 
                                                  })} - {dateObj.toLocaleDateString('he-IL', { weekday: 'short' })}
                                                </div>
                                                <div className="sm:hidden">
                                                  <div>{dateObj.toLocaleDateString('he-IL', { 
                                                    day: 'numeric', 
                                                    month: 'numeric' 
                                                  })}</div>
                                                  <div className="text-xs">{dateObj.toLocaleDateString('he-IL', { weekday: 'short' })}</div>
                                                </div>
                                              </div>
                                            </div>
                                          </button>
                                        );
                                      })
                                    ) : (
                                      <div className="col-span-2 sm:col-span-3 text-center text-gray-500">אין תאריכים זמינים</div>
                                    )}
                                  </div>
                                  {errors.selected_date && (
                                    <p className="text-red-500 text-xs mt-2">{errors.selected_date}</p>
                                  )}
                                  {datesMessage && (
                                    <p className="text-xs text-[#4B2E83]/60 mt-2 font-medium">{datesMessage}</p>
                                  )}
                                  {formData.selected_date && (
                                    <p className="text-xs text-[#4B2E83]/80 mt-2 font-medium">
                                      {new Date(formData.selected_date).toLocaleDateString('he-IL', { weekday: 'long' })}
                                    </p>
                                  )}
                                </div>

                                {/* Time Selection */}
                                {formData.selected_date && (
                                  <div>
                                    <label className="block text-sm font-bold text-[#4B2E83] mb-3">
                                      <svg className="w-4 h-4 inline ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      בחרי שעה לשיעור *
                                    </label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 lg:gap-3 px-1 sm:px-0">
                                      {loadingTimes ? (
                                        Array.from({ length: 3 }).map((_, index) => (
                                          <div key={index} className="h-16 bg-gray-100 rounded-xl animate-pulse"></div>
                                        ))
                                      ) : availableTimes.length > 0 ? (
                                        availableTimes.map((time) => {
                                          const isSelected = formData.selected_time === time;
                                          
                                          return (
                                            <button
                                              key={time}
                                              type="button"
                                              onClick={() => handleInputChange('selected_time', time)}
                                              className={`
                                                p-1 lg:p-3 py-3 lg:py-5 rounded-xl border-2 transition-all duration-200 text-xs lg:text-sm font-bold relative h-16 flex items-center justify-center
                                                ${isSelected 
                                                  ? 'bg-gradient-to-r from-[#EC4899] to-[#4B2E83] text-white border-transparent shadow-lg' 
                                                  : 'bg-white border-gray-200 hover:border-gray-300 text-[#2B2B2B] hover:shadow-md'
                                                }
                                              `}
                                            >
                                              <div className="text-center leading-tight">
                                                <div className="text-xs lg:text-sm">{time}</div>
                                              </div>
                                            </button>
                                          );
                                        })
                                      ) : (
                                        <div className="col-span-2 sm:col-span-3 text-center text-gray-500">אין שעות זמינות</div>
                                      )}
                                    </div>
                                    {errors.selected_time && (
                                      <p className="text-red-500 text-xs mt-2">{errors.selected_time}</p>
                                    )}
                                    {formData.selected_time && (
                                      <p className="text-sm text-gray-600 mt-2 font-medium">
                                        השעה שנבחרה: {formData.selected_time}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Step 5: Payment Details */}
                        {formData.selected_date && formData.selected_time && (
                          <div className="bg-white rounded-lg p-4 border border-[#EC4899]/10">
                            <h4 className="text-sm font-semibold text-[#4B2E83] mb-3 flex items-center gap-2">
                              <span className="w-6 h-6 bg-[#EC4899] text-white rounded-full flex items-center justify-center text-xs">5</span>
                              פרטי תשלום
                            </h4>
                            
                            {/* Credit Eligibility Check */}
                            {(() => {
                              const selectedClass = classes.find(c => c.id === formData.class_id);
                              const allowedTypes = getAllowedCreditTypesForClass(selectedClass);
                              const supportsGroupCredits = allowedTypes.includes('group');
                              const supportsPrivateCredits = allowedTypes.includes('private');
                              const canUseCredits = allowedTypes.length > 0;
                              
                              if (!canUseCredits) {
                                return (
                                  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                      <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                      </svg>
                                      <span className="text-sm font-medium text-amber-800">שיעור זה אינו תומך בקרדיטים</span>
                                    </div>
                                  </div>
                                );
                              }
                              
                              return (
                                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                  <div className="flex items-center gap-2 mb-2">
                                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-sm font-medium text-blue-800">שיעור זה תומך בקרדיטים</span>
                                  </div>
                                  <div className="text-xs text-blue-700 space-y-1">
                                     {supportsGroupCredits && (
                                      <div className="flex justify-between">
                                        <span>קרדיטים קבוצתיים:</span>
                                        <span className={`font-medium ${(userCredits?.available_group_credits || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                          {userCredits?.available_group_credits || 0} זמינים
                                          {(userCredits?.available_group_credits || 0) === 0 && ' (לא זמינים)'}
                                        </span>
                                      </div>
                                    )}
                                     {supportsPrivateCredits && (
                                      <div className="flex justify-between">
                                        <span>קרדיטים פרטיים:</span>
                                        <span className={`font-medium ${(userCredits?.available_private_credits || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                          {userCredits?.available_private_credits || 0} זמינים
                                          {(userCredits?.available_private_credits || 0) === 0 && ' (לא זמינים)'}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  {(userCredits?.available_group_credits || 0) === 0 && (userCredits?.available_private_credits || 0) === 0 && (
                                    <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700">
                                      למשתמשת אין קרדיטים זמינים.
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">
                                  מחיר רכישה *
                                </label>
                                <input
                                  type="number"
                                  required
                                  value={formData.purchase_price}
                                  onChange={(e) => handleInputChange('purchase_price', parseFloat(e.target.value))}
                                  placeholder="הכנסי מחיר"
                                  className={`w-full px-3 py-2.5 text-sm border rounded-xl focus:ring-2 focus:outline-none transition-all bg-white ${
                                    errors.purchase_price 
                                      ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                                      : 'border-[#EC4899]/20 focus:ring-[#EC4899]/20 focus:border-[#EC4899]'
                                  }`}
                                />
                                {errors.purchase_price && (
                                  <p className="text-red-500 text-xs mt-2">{errors.purchase_price}</p>
                                )}
                              </div>

                              <div>
                                <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">
                                  שימוש בקרדיט
                                </label>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={formData.used_credit}
                                    onChange={(e) => handleInputChange('used_credit', e.target.checked)}
                                    disabled={(() => {
                                     const selectedClass = classes.find(c => c.id === formData.class_id);
                                     const supportsCredits = getAllowedCreditTypesForClass(selectedClass).length > 0;
                                      return !supportsCredits;
                                    })()}
                                    className="w-4 h-4 text-[#EC4899] bg-gray-100 border-gray-300 focus:ring-[#EC4899] focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                  />
                                  <span className={`text-sm ${(() => {
                                    const selectedClass = classes.find(c => c.id === formData.class_id);
                                    const isSubscriptionClass = selectedClass?.category === 'subscription';
                                    const supportsCredits = isSubscriptionClass && (selectedClass?.group_credits || selectedClass?.private_credits);
                                    return supportsCredits ? 'text-[#4B2E83]' : 'text-gray-500';
                                  })()}`}>
                                    השתמשי בקרדיט
                                  </span>
                                </div>
                              </div>
                            </div>

                            {formData.used_credit && (() => {
                               const selectedClass = classes.find(c => c.id === formData.class_id);
                               const allowedTypes = getAllowedCreditTypesForClass(selectedClass);
                               const supportsGroupCredits = allowedTypes.includes('group');
                               const supportsPrivateCredits = allowedTypes.includes('private');
                              const availableGroupCredits = userCredits?.available_group_credits || 0;
                              const availablePrivateCredits = userCredits?.available_private_credits || 0;
                              
                              // Check if user has any available credits
                              const hasGroupCredits = supportsGroupCredits && availableGroupCredits > 0;
                              const hasPrivateCredits = supportsPrivateCredits && availablePrivateCredits > 0;
                              
                              if (!hasGroupCredits && !hasPrivateCredits) {
                                return (
                                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                      </svg>
                                      <span className="text-sm font-medium text-red-800">אין קרדיטים זמינים</span>
                                    </div>
                                    <p className="text-xs text-red-700">
                                      למשתמש אין קרדיטים זמינים מהסוג הנדרש לשיעור זה. יש לבחור בתשלום במזומן.
                                    </p>
                                    <div className="mt-2 text-xs text-red-600">
                                      <p><strong>סוגי קרדיטים נדרשים לשיעור זה:</strong></p>
                                      <ul className="list-disc list-inside ml-2 mt-1">
                                        {supportsGroupCredits && <li>קרדיט קבוצתי</li>}
                                        {supportsPrivateCredits && <li>קרדיט פרטי</li>}
                                      </ul>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleInputChange('used_credit', false)}
                                      className="mt-2 px-3 py-1 bg-red-100 text-red-700 text-xs rounded-lg hover:bg-red-200 transition-colors"
                                    >
                                      עבור לתשלום במזומן
                                    </button>
                                  </div>
                                );
                              }
                              
                              return (
                                <div className="mt-3">
                                  <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">
                                    סוג קרדיט *
                                  </label>
                                  {(() => {
                                    const selectable = [
                                      hasGroupCredits ? { value: 'group', label: `קרדיט קבוצתי (${availableGroupCredits} זמינים)` } : null,
                                      hasPrivateCredits ? { value: 'private', label: `קרדיט פרטי (${availablePrivateCredits} זמינים)` } : null
                                    ].filter(Boolean) as Array<{value:string;label:string}>;
                                    if (selectable.length === 1 && formData.used_credit) {
                                      const only = selectable[0];
                                      return (
                                        <input
                                          type="text"
                                          value={only.label}
                                          readOnly
                                          className="w-full px-3 py-2.5 text-sm border border-[#EC4899]/20 rounded-xl bg-gray-50 text-gray-700"
                                        />
                                      );
                                    }
                                    return (
                                      <select
                                        required
                                        value={formData.credit_type}
                                        onChange={(e) => handleInputChange('credit_type', e.target.value)}
                                        className="w-full px-3 py-2.5 text-sm border border-[#EC4899]/20 rounded-xl focus:ring-2 focus:outline-none transition-all bg-white"
                                      >
                                        <option value="">בחרי סוג קרדיט</option>
                                        {hasGroupCredits && (
                                          <option value="group">קרדיט קבוצתי ({availableGroupCredits} זמינים)</option>
                                        )}
                                        {hasPrivateCredits && (
                                          <option value="private">קרדיט פרטי ({availablePrivateCredits} זמינים)</option>
                                        )}
                                      </select>
                                    );
                                  })()}
                                  {errors.credit_type && (
                                    <p className="text-red-500 text-xs mt-2">{errors.credit_type}</p>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center text-gray-500 py-4">
                        יש לבחור משתמש תחילה
                      </div>
                    )}
                  </div>
                ) : (
                  // Editing existing registration
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 border border-[#EC4899]/10">
                      <h4 className="text-sm font-semibold text-[#4B2E83] mb-3">פרטי הרשמה קיימת</h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">
                            תאריך
                          </label>
                          <input
                            type="text"
                            value={formData.selected_date ? new Date(formData.selected_date).toLocaleDateString('he-IL') : ''}
                            onChange={(e) => handleInputChange('selected_date', e.target.value)}
                            className="w-full px-3 py-2.5 text-sm border border-[#EC4899]/20 rounded-xl bg-white"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-[#4B2E83] mb-1 sm:mb-2">
                            שעה
                          </label>
                          <input
                            type="text"
                            value={formData.selected_time}
                            onChange={(e) => handleInputChange('selected_time', e.target.value)}
                            className="w-full px-3 py-2.5 text-sm border border-[#EC4899]/20 rounded-xl bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Registration Summary - Only show when all required fields are filled */}
            {isNewReg && formData.user_id && formData.session_id && formData.class_id && formData.selected_date && formData.selected_time && (
              (formData.purchase_price && formData.purchase_price > 0) || (formData.used_credit && formData.credit_type)
            ) && (
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
            {''} ב-
                    <span className="font-semibold text-[#4B2E83]">
                      {sessions.find(s => s.id === formData.session_id)?.name}
                    </span>
                    {' '}ל-
                    <span className="font-semibold text-[#4B2E83]">
                      {searchResults.find(p => p.id === formData.user_id)?.first_name} {searchResults.find(p => p.id === formData.user_id)?.last_name}
                    </span>
                    {' '}בתאריך{' '}
                    <span className="font-semibold text-[#4B2E83]">
                      {new Date(formData.selected_date).toLocaleDateString('he-IL')}
                    </span>
                    {' '}ב-
                    <span className="font-semibold text-[#4B2E83]">
                      {new Date(formData.selected_date).toLocaleDateString('he-IL', { weekday: 'long' })}
                    </span>
                    {' '}בשעה{' '}
                    <span className="font-semibold text-[#4B2E83]">
                      {formData.selected_time}
                    </span>
                    {formData.used_credit && formData.credit_type ? (
                      <>
                        {' '}בשימוש ב-
                        <span className="font-semibold text-[#EC4899]">
                          {formData.credit_type === 'group' ? 'קרדיט קבוצתי' : 'קרדיט פרטי'}
                        </span>
                        {' '}(ללא עלות)
                      </>
                    ) : (
                      <>
                    {' '}במחיר של{' '}
                    <span className="font-semibold text-[#EC4899]">
                      {formData.purchase_price} ש"ח
                    </span>
                      </>
                    )}
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
                            {formData.credit_type === 'group' ? 'קרדיט קבוצתי' : 'קרדיט פרטי'}
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

                {/* Credit Return Option - Only for existing registrations with credits */}
                {!isNewReg && registrationData.used_credit && registrationData.credit_type && (
                  <div className="mt-4 pt-3 border-t border-[#EC4899]/20">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="returnCredit"
                        checked={returnCredit}
                        onChange={(e) => setReturnCredit(e.target.checked)}
                        className="w-4 h-4 text-[#EC4899] bg-gray-100 border-gray-300 rounded focus:ring-[#EC4899] focus:ring-2"
                      />
                      <label htmlFor="returnCredit" className="text-sm font-medium text-[#4B2E83]">
                        החזר קרדיט {registrationData.credit_type === 'group' ? 'קבוצתי' : 'פרטי'} למשתמש
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {returnCredit 
                        ? 'הקרדיט יוחזר ליתרת הקרדיטים של המשתמש' 
                        : 'הקרדיט לא יוחזר למשתמש'
                      }
                    </p>
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
            {(!isNewReg || !formData.user_id || !formData.class_id || !formData.selected_date || !formData.selected_time || (
              !formData.purchase_price || formData.purchase_price <= 0
            ) && !formData.used_credit) && (
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
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        isNewRegistration={isNewReg}
        formData={successFormData || formData}
        searchResults={searchResults}
        classes={classes}
        sessions={sessions}
      />
    </div>
  );
} 