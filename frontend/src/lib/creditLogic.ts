import { Class } from '../types/class';
import { CreditGroup } from '../types/subscription';

/**
 * Determines which credit group a class uses based on its class_type
 */
export const getCreditGroupForClass = (classData: Class): CreditGroup => {
  // If the class has a specific class_type defined, use it
  if (classData.class_type) {
    switch (classData.class_type) {
      case 'group':
        return 'group';
      case 'private':
        return 'private';
      case 'both':
        // For 'both' type, determine by category per spec
        return classData.category === 'private' ? 'private' : 'group';
      default:
        return 'group';
    }
  }
  
  // Fallback to legacy logic based on credit amounts
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
 * Gets all available credit types for a class based on its class_type
 */
export const getAvailableCreditTypesForClass = (classData: Class): CreditGroup[] => {
  if (classData.class_type === 'both') {
    // Per spec: choose by category, not both at the same time
    return classData.category === 'private' ? ['private'] : ['group'];
  }
  
  if (classData.class_type === 'group') {
    return ['group'];
  }
  
  if (classData.class_type === 'private') {
    return ['private'];
  }
  
  // Fallback to legacy logic
  const types: CreditGroup[] = [];
  if (classData.group_credits && classData.group_credits > 0) {
    types.push('group');
  }
  if (classData.private_credits && classData.private_credits > 0) {
    types.push('private');
  }
  
  return types.length > 0 ? types : ['group'];
};

/**
 * Checks if a specific credit type is valid for a class
 */
export const isCreditTypeValidForClass = (classData: Class, creditType: CreditGroup): boolean => {
  const availableTypes = getAvailableCreditTypesForClass(classData);
  return availableTypes.includes(creditType);
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
  
  const classTypeLabel = classData.class_type === 'both' ? 'קבוצתי או פרטי' : 
                        classData.class_type === 'group' ? 'קבוצתי' : 'פרטי';
  
  return `תשלמי ${classData.price} ש"ח ותקבלי מנוי ${classTypeLabel} עם ${creditAmount} שיעורים (כולל השיעור הנוכחי)`;
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
  
  const classTypeLabel = classData.class_type === 'both' ? 'קבוצתי או פרטי' : 
                        classData.class_type === 'group' ? 'קבוצתי' : 'פרטי';
  
  return `שילמת ${classData.price} ש"ח על השיעור וקיבלת מנוי ${classTypeLabel} חדש עם ${creditAmount} שיעורים (כולל השיעור הנוכחי).`;
}; 