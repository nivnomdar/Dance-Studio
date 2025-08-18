// Date utilities - centralized management for date handling and week navigation
import { WEEK_LENGTH_DAYS } from '../config/booking';

/**
 * Format date to Hebrew locale
 * @param dateString - Date string in ISO format
 * @returns Formatted date string in Hebrew
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('he-IL', {
    day: 'numeric',
    month: 'short'
  });
};

/**
 * Format date range to Hebrew locale
 * @param startDate - Start date string in ISO format
 * @param endDate - End date string in ISO format
 * @returns Formatted date range string in Hebrew
 */
export const formatDateRange = (startDate: string, endDate: string): string => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const startFormatted = start.toLocaleDateString('he-IL', {
    day: 'numeric',
    month: 'short'
  });
  
  const endFormatted = end.toLocaleDateString('he-IL', {
    day: 'numeric',
    month: 'short'
  });
  
  return `${startFormatted} - ${endFormatted}`;
};

/**
 * Get current week information
 * @returns Object with week start, end dates and current week indicator
 */
export const getCurrentWeekInfo = () => {
  const today = new Date();
  const currentDayOfWeek = today.getDay(); // 0=Sunday, 1=Monday, etc.
  const daysToSubtract = currentDayOfWeek; // Days to go back to Sunday
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - daysToSubtract);
  weekStart.setHours(0, 0, 0, 0);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + (WEEK_LENGTH_DAYS - 1));
  
  return {
    start: weekStart.toISOString().split('T')[0],
    end: weekEnd.toISOString().split('T')[0],
    startDate: weekStart,
    endDate: weekEnd
  };
};

/**
 * Get week information for a specific week number
 * @param weekNumber - Week number (1-4)
 * @returns Object with week start, end dates
 */
export const getWeekInfo = (weekNumber: number) => {
  const today = new Date();
  const currentDayOfWeek = today.getDay(); // 0=Sunday, 1=Monday, etc.
  const daysToSubtract = currentDayOfWeek; // Days to go back to Sunday
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - daysToSubtract + ((weekNumber - 1) * WEEK_LENGTH_DAYS));
  weekStart.setHours(0, 0, 0, 0);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + (WEEK_LENGTH_DAYS - 1));
  
  return {
    start: weekStart.toISOString().split('T')[0],
    end: weekEnd.toISOString().split('T')[0],
    startDate: weekStart,
    endDate: weekEnd
  };
};

/**
 * Check if a week is the current week
 * @param weekNumber - Week number to check
 * @returns True if it's the current week
 */
export const isCurrentWeek = (weekNumber: number): boolean => {
  const currentWeekInfo = getCurrentWeekInfo();
  const weekInfo = getWeekInfo(weekNumber);
  
  // Check if the week start dates match
  return currentWeekInfo.start === weekInfo.start;
};

/**
 * Get week range for display
 * @param weekStartDate - Week start date string
 * @returns Formatted week range string
 */
export const getWeekRange = (weekStartDate: string): string => {
  const startDate = new Date(weekStartDate);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + (WEEK_LENGTH_DAYS - 1));
  
  // Ensure we're working with the correct dates by setting time to noon
  startDate.setHours(12, 0, 0, 0);
  endDate.setHours(12, 0, 0, 0);
  
  return formatDateRange(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]);
};

/**
 * Get all dates in a week
 * @param weekStartDate - Week start date string
 * @returns Array of date strings for the week
 */
export const getWeekDates = (weekStartDate: string): string[] => {
  const startDate = new Date(weekStartDate);
  const dates: string[] = [];
  
  for (let i = 0; i < WEEK_LENGTH_DAYS; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }
  
  return dates;
};

/**
 * Get day name from date
 * @param dateString - Date string in ISO format
 * @returns Day name in English
 */
export const getDayNameFromDate = (dateString: string): string => {
  const date = new Date(dateString);
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return dayNames[date.getDay()];
};

/**
 * Get Hebrew day name from date
 * @param dateString - Date string in ISO format
 * @returns Day name in Hebrew
 */
export const getHebrewDayNameFromDate = (dateString: string): string => {
  const date = new Date(dateString);
  const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  return dayNames[date.getDay()];
};

/**
 * Check if a date is today
 * @param dateString - Date string in ISO format
 * @returns True if the date is today
 */
export const isToday = (dateString: string): boolean => {
  const today = new Date();
  const date = new Date(dateString);
  return today.toDateString() === date.toDateString();
};

/**
 * Check if a date is tomorrow
 * @param dateString - Date string in ISO format
 * @returns True if the date is tomorrow
 */
export const isTomorrow = (dateString: string): boolean => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const date = new Date(dateString);
  return tomorrow.toDateString() === date.toDateString();
};

/**
 * Check if a date is in the current week
 * @param dateString - Date string in ISO format
 * @returns True if the date is in the current week
 */
export const isInCurrentWeek = (dateString: string): boolean => {
  const weekInfo = getCurrentWeekInfo();
  const date = new Date(dateString);
  return date >= weekInfo.startDate && date <= weekInfo.endDate;
};

/**
 * Get relative date description
 * @param dateString - Date string in ISO format
 * @returns Relative date description in Hebrew
 */
export const getRelativeDateDescription = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'היום';
  } else if (diffDays === 1) {
    return 'מחר';
  } else if (diffDays === -1) {
    return 'אתמול';
  } else if (diffDays > 1 && diffDays <= WEEK_LENGTH_DAYS) {
    return `בעוד ${diffDays} ימים`;
  } else if (diffDays < -1 && diffDays >= -WEEK_LENGTH_DAYS) {
    return `לפני ${Math.abs(diffDays)} ימים`;
  } else {
    return formatDate(dateString);
  }
};

/**
 * Get month name in Hebrew
 * @param dateString - Date string in ISO format
 * @returns Month name in Hebrew
 */
export const getHebrewMonthName = (dateString: string): string => {
  const date = new Date(dateString);
  const monthNames = [
    'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
    'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
  ];
  return monthNames[date.getMonth()];
};

/**
 * Get full date in Hebrew
 * @param dateString - Date string in ISO format
 * @returns Full date in Hebrew format
 */
export const getFullHebrewDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = getHebrewMonthName(dateString);
  const year = date.getFullYear();
  const dayName = getHebrewDayNameFromDate(dateString);
  
  return `${dayName}, ${day} ב${month} ${year}`;
}; 