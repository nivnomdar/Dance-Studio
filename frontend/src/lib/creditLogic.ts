import { Class } from '../types/class';
import { CreditGroup } from '../types/subscription';

/**
 * Determines which credit group a class uses based on its properties
 */
export const getCreditGroupForClass = (classData: Class): CreditGroup => {
  // If the class has specific credit types defined, use them
  if (classData.group_credits && classData.group_credits > 0) {
    return 'group';
  }
  if (classData.private_credits && classData.private_credits > 0) {
    return 'private';
  }
  
  // Fallback to category-based logic
  if (classData.category === 'subscription') {
    return 'group';
  }
  
  // For non-subscription classes, determine based on registration type
  switch (classData.registration_type) {
    case 'appointment_only':
      return 'private';
    default:
      return 'group';
  }
};

/**
 * Calculates the total credit amount for a subscription class
 */
export const getCreditAmountFromClass = (classData: Class, creditGroup: CreditGroup): number => {
  if (creditGroup === 'group' && classData.group_credits) {
    return classData.group_credits;
  }
  if (creditGroup === 'private' && classData.private_credits) {
    return classData.private_credits;
  }
  
  // Fallback to price-based calculation
  return Math.max(4, Math.ceil(classData.price / 50));
};

/**
 * Gets available credits for a specific credit group from user credits
 */
export const getAvailableCreditsForGroup = (
  userCredits: any, 
  creditGroup: CreditGroup
): number => {
  if (!userCredits) return 0;
  
  switch (creditGroup) {
    case 'group':
      return userCredits.total_group_credits;
    case 'private':
      return userCredits.total_private_credits;
    case 'zoom':
      return userCredits.total_zoom_credits;
    default:
      return 0;
  }
};

/**
 * Formats credit messages for UI display
 */
export const formatCreditMessage = (
  hasCredits: boolean,
  classData: Class,
  creditGroup: CreditGroup,
  creditAmount: number
): string => {
  if (hasCredits) {
    return 'השיעור ינוכה מיתרת השיעורים שלך';
  }
  
  return `תשלמי ${classData.price} ש"ח ותקבלי מנוי ${creditGroup === 'group' ? 'קבוצתי' : 'פרטי'} עם ${creditAmount} שיעורים (כולל השיעור הנוכחי)`;
};

/**
 * Formats success message for registration completion
 */
export const formatSuccessMessage = (
  hasCredits: boolean,
  classData: Class,
  creditGroup: CreditGroup,
  creditAmount: number
): string => {
  if (hasCredits) {
    return 'שיעור אחד יורד מיתרת השיעורים שלך.';
  }
  
  return `שילמת ${classData.price} ש"ח על השיעור וקיבלת מנוי ${creditGroup === 'group' ? 'קבוצתי' : 'פרטי'} חדש עם ${creditAmount} שיעורים (כולל השיעור הנוכחי).`;
}; 