// Utility functions for handling class schedules

import { ClassSchedule, DaySchedule } from '../types/class';

console.log('📦 dateUtils.ts loaded');

/**
 * קבלת הודעה על התאריכים הזמינים
 */
export const getAvailableDatesMessage = (schedule?: ClassSchedule): string => {
  if (!schedule) {
    return 'כל התאריכים זמינים';
  }
  
  const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  const availableDays = [];
  
  for (let i = 0; i < 7; i++) {
    const dayKey = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][i] as keyof ClassSchedule;
    if (schedule[dayKey]?.available) {
      availableDays.push(dayNames[i]);
    }
  }
  
  if (availableDays.length === 0) {
    return 'אין ימים זמינים';
  }
  
  return `השיעורים מתקיימים בימים: ${availableDays.join(', ')}`;
};

/**
 * קבלת תאריכים זמינים לכפתורים
 */
export const getAvailableDatesForButtons = (schedule?: ClassSchedule): string[] => {
  if (!schedule) {
    // אם אין לוח זמנים, החזר את 7 הימים הבאים (שבוע אחד)
    const dates: string[] = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  }
  
  // החזר את התאריכים הבאים של הימים הזמינים (עד שבוע אחד)
  const dates: string[] = [];
  const today = new Date();
  
  for (let i = 0; i < 7; i++) { // חיפוש עד שבוע אחד קדימה
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dayOfWeek = date.getDay();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[dayOfWeek] as keyof ClassSchedule;
    
    if (schedule[dayName]?.available) {
      dates.push(date.toISOString().split('T')[0]);
    }
  }
  
  return dates;
};

/**
 * קבלת שעות זמינות לפי תאריך
 */
export const getAvailableTimesForDate = (selectedDate: string, schedule?: ClassSchedule): string[] => {
  if (!schedule) {
    return ['18:00', '19:00', '20:00'];
  }
  
  const date = new Date(selectedDate);
  const dayOfWeek = date.getDay();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayName = dayNames[dayOfWeek] as keyof ClassSchedule;
  
  return schedule[dayName]?.times || ['18:00', '19:00', '20:00'];
};

/**
 * בדיקת מקומות זמינים לשיעור בתאריך ושעה מסוימים
 */
export const getAvailableSpots = async (
  classId: string, 
  selectedDate: string, 
  selectedTime: string,
  maxParticipants: number
): Promise<{ available: number; message: string }> => {
  try {
    const { supabase } = await import('../lib/supabase');
    
    // בדיקה אם זה שיעור פרטי
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('slug, category')
      .eq('id', classId)
      .single();
    
    if (classError) {
      console.error('Error fetching class data:', classError);
      return { available: maxParticipants, message: '' };
    }
    
    // אם זה שיעור פרטי, אין צורך לבדוק מקומות
    if (classData.slug === 'private-lesson' || classData.category === 'private') {
      return { available: 1, message: 'זמין' };
    }
    
    // ספירת רשומות קיימות לשיעור זה בתאריך ושעה אלה
    const { count, error } = await supabase
      .from('registrations')
      .select('*', { count: 'exact', head: true })
      .eq('class_id', classId)
      .eq('selected_date', selectedDate)
      .eq('selected_time', selectedTime)
      .eq('status', 'active'); // רק רשומות פעילות נחשבות
    
    if (error) {
      console.error('Error checking available spots:', error);
      return { available: maxParticipants, message: '' };
    }
    
    const takenSpots = count || 0;
    const availableSpots = maxParticipants - takenSpots;
    
    let message = '';
    if (availableSpots <= 0) {
      message = 'מלא';
    } else if (availableSpots === 1) {
      message = 'נותר מקום אחרון';
    } else if (availableSpots <= 3) {
      message = `נותרו ${availableSpots} מקומות אחרונים`;
    }
    
    return { available: availableSpots, message };
  } catch (error) {
    console.error('Error checking available spots:', error);
    return { available: maxParticipants, message: '' };
  }
}; 