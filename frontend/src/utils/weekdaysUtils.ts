// Weekdays utilities - centralized management for weekday handling

// Hebrew day names (0=Sunday, 1=Monday, etc.)
export const HEBREW_WEEKDAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

// English day names (0=Sunday, 1=Monday, etc.)
export const ENGLISH_WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

// Day names for API responses
export const DAY_NAMES_EN = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
export const DAY_NAMES_HE = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

// Weekdays options for form selects (value-label pairs)
export const WEEKDAYS_OPTIONS = [
  { value: 0, label: 'ראשון' },
  { value: 1, label: 'שני' },
  { value: 2, label: 'שלישי' },
  { value: 3, label: 'רביעי' },
  { value: 4, label: 'חמישי' },
  { value: 5, label: 'שישי' },
  { value: 6, label: 'שבת' }
];

/**
 * Convert number to Hebrew day name
 * @param dayNumber - Day number (0-6, where 0=Sunday)
 * @returns Hebrew day name
 */
export const numberToHebrewDay = (dayNumber: number): string => {
  if (dayNumber >= 0 && dayNumber <= 6) {
    return HEBREW_WEEKDAYS[dayNumber];
  }
  return `יום ${dayNumber}`;
};

/**
 * Convert number to English day name
 * @param dayNumber - Day number (0-6, where 0=Sunday)
 * @returns English day name
 */
export const numberToEnglishDay = (dayNumber: number): string => {
  if (dayNumber >= 0 && dayNumber <= 6) {
    return ENGLISH_WEEKDAYS[dayNumber];
  }
  return `day_${dayNumber}`;
};

/**
 * Convert English day name to Hebrew
 * @param englishDay - English day name (e.g., "monday", "Tuesday")
 * @returns Hebrew day name
 */
export const englishToHebrewDay = (englishDay: string): string => {
  const dayLower = englishDay.toLowerCase();
  const dayIndex = ENGLISH_WEEKDAYS.indexOf(dayLower);
  if (dayIndex !== -1) {
    return HEBREW_WEEKDAYS[dayIndex];
  }
  return englishDay; // Return as is if not found
};

/**
 * Convert Hebrew day name to English
 * @param hebrewDay - Hebrew day name
 * @returns English day name
 */
export const hebrewToEnglishDay = (hebrewDay: string): string => {
  const dayIndex = HEBREW_WEEKDAYS.indexOf(hebrewDay);
  if (dayIndex !== -1) {
    return ENGLISH_WEEKDAYS[dayIndex];
  }
  return hebrewDay; // Return as is if not found
};

/**
 * Convert mixed string to Hebrew day name
 * Handles cases like "שני Tuesday" by extracting Hebrew part
 * @param mixedString - String that might contain mixed Hebrew and English
 * @returns Hebrew day name
 */
export const mixedToHebrewDay = (mixedString: string): string => {
  // If it's already in Hebrew, return as is
  if (HEBREW_WEEKDAYS.includes(mixedString)) {
    return mixedString;
  }
  
  // If it's a mixed case like "שני Tuesday", extract only the Hebrew part
  const hebrewMatch = mixedString.match(/[\u0590-\u05FF]+/);
  if (hebrewMatch) {
    return hebrewMatch[0];
  }
  
  // Try to convert English to Hebrew
  return englishToHebrewDay(mixedString);
};

/**
 * Convert any weekday format to Hebrew day name
 * Handles numbers, strings, and mixed formats
 * @param weekday - Weekday in any format (number, string, or mixed)
 * @returns Hebrew day name
 */
export const anyToHebrewDay = (weekday: string | number): string => {
  // Handle number format (0-6) - this is the main case for schedule_sessions
  if (typeof weekday === 'number' && weekday >= 0 && weekday <= 6) {
    return numberToHebrewDay(weekday);
  }
  
  // Handle string format
  if (typeof weekday === 'string') {
    return mixedToHebrewDay(weekday);
  }
  
  // Handle any other format
  return `יום ${weekday}`;
};

/**
 * Convert array of weekdays to Hebrew day names
 * @param weekdays - Array of weekdays in any format
 * @returns Array of Hebrew day names
 */
export const weekdaysToHebrew = (weekdays: (string | number)[]): string[] => {
  return weekdays.map(anyToHebrewDay);
};

/**
 * Check if a session is active on a specific day
 * @param session - Session object with weekdays property
 * @param dayName - Day name to check (e.g., "monday")
 * @returns True if session is active on the day
 */
export const isSessionActiveOnDay = (session: any, dayName: string): boolean => {
  if (!session || !session.is_active) return false;
  
  return session.weekdays.some((weekday: any) => {
    // Handle number format (0-6) - this is the main case for schedule_sessions
    if (typeof weekday === 'number' && weekday >= 0 && weekday <= 6) {
      return ENGLISH_WEEKDAYS[weekday] === dayName.toLowerCase();
    }
    
    // Handle string format (e.g., "monday", "Tuesday")
    if (typeof weekday === 'string') {
      const weekdayLower = weekday.toLowerCase();
      const dayNameLower = dayName.toLowerCase();
      return weekdayLower === dayNameLower;
    }
    
    return false;
  });
};

/**
 * Get Hebrew day name from date
 * @param date - Date object or date string
 * @returns Hebrew day name
 */
export const getHebrewDayFromDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const dayOfWeek = dateObj.getDay(); // 0=Sunday, 1=Monday, etc.
  return numberToHebrewDay(dayOfWeek);
};

/**
 * Get English day name from date
 * @param date - Date object or date string
 * @returns English day name
 */
export const getEnglishDayFromDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const dayOfWeek = dateObj.getDay(); // 0=Sunday, 1=Monday, etc.
  return numberToEnglishDay(dayOfWeek);
};

/**
 * Format weekdays array to Hebrew string
 * @param weekdays - Array of weekdays in any format
 * @returns Comma-separated Hebrew day names
 */
export const formatWeekdaysToHebrew = (weekdays: (string | number)[]): string => {
  return weekdaysToHebrew(weekdays).join(', ');
};

/**
 * Get all weekdays as Hebrew array
 * @returns Array of all Hebrew day names
 */
export const getAllHebrewWeekdays = (): string[] => {
  return [...HEBREW_WEEKDAYS];
};

/**
 * Get all weekdays as English array
 * @returns Array of all English day names
 */
export const getAllEnglishWeekdays = (): string[] => {
  return [...ENGLISH_WEEKDAYS];
}; 