import { createClient } from '@supabase/supabase-js';
import { config } from '../config';
import { AppError } from '../middleware/errorHandler';
import { logger } from './logger';
import { 
  ClassCreditInfo, 
  CreditValidationResult, 
  CreditTypeInfo 
} from './creditValidationTypes';

// Create admin client for this utility
const supabase = createClient(
  config.supabase.url,
  config.supabase.serviceKey
);

/**
 * Get class credit information from database
 */
export async function getClassCreditInfo(classId: string): Promise<ClassCreditInfo> {
  const { data: classData, error } = await supabase
    .from('classes')
    .select('class_type, category, group_credits, private_credits, price')
    .eq('id', classId)
    .eq('is_active', true)
    .single();

  if (error || !classData) {
    throw new AppError('Class not found or inactive', 404);
  }

  return {
    class_type: classData.class_type || 'group',
    category: classData.category || '',
    group_credits: classData.group_credits || 0,
    private_credits: classData.private_credits || 0,
    price: classData.price || 0
  };
}

/**
 * Validate credit usage based on class configuration
 */
export function validateCreditUsage(
  classInfo: ClassCreditInfo,
  usedCredit: boolean,
  creditType?: string,
  userCredits?: any[]
): CreditValidationResult {
  // If not using credits, always valid
  if (!usedCredit) {
    return {
      isValid: true,
      allowedCreditTypes: [],
      requiredCredits: 0
    };
  }

  // Must specify credit type when using credits
  if (!creditType) {
    return {
      isValid: false,
      errorMessage: 'יש לבחור סוג קרדיט כאשר משתמשים בקרדיט',
      allowedCreditTypes: [],
      requiredCredits: 0
    };
  }

  // Check if class supports the selected credit type
  const allowedCreditTypes = getAllowedCreditTypes(classInfo);
  
  if (!allowedCreditTypes.includes(creditType)) {
    return {
      isValid: false,
      errorMessage: `סוג קרדיט '${creditType}' אינו נתמך בשיעור זה. סוגי קרדיטים נתמכים: ${allowedCreditTypes.join(', ')}`,
      allowedCreditTypes,
      requiredCredits: 0
    };
  }

  // Check if user has enough credits (only when we actually loaded credits)
  if (Array.isArray(userCredits) && userCredits.length > 0) {
    const userCredit = userCredits.find(c => c.credit_group === creditType);
    if (!userCredit || userCredit.remaining_credits <= 0) {
      return {
        isValid: false,
        errorMessage: `אין מספיק קרדיטים זמינים מסוג '${creditType}'`,
        allowedCreditTypes,
        requiredCredits: 1
      };
    }
  }

  return {
    isValid: true,
    allowedCreditTypes,
    requiredCredits: 1
  };
}

/**
 * Get allowed credit types for a class based on class_type and category
 */
export function getAllowedCreditTypes(classInfo: ClassCreditInfo): string[] {
  const { class_type, category, group_credits, private_credits } = classInfo;
  
  const allowedTypes: string[] = [];

  // Check group credits
  if (class_type === 'group' || class_type === 'both') {
    if (category === 'subscription' && group_credits > 0) {
      allowedTypes.push('group');
    }
  }

  // Check private credits
  if (class_type === 'private' || class_type === 'both') {
    if (category === 'private' && private_credits > 0) {
      allowedTypes.push('private');
    }
  }

  return allowedTypes;
}

/**
 * Validate class-category compatibility
 */
export function validateClassCategoryCompatibility(
  classInfo: ClassCreditInfo,
  creditType: string
): boolean {
  const { class_type, category } = classInfo;

  // Group credits can only be used with subscription classes
  if (creditType === 'group' && category !== 'subscription') {
    return false;
  }

  // Private credits can only be used with private classes
  if (creditType === 'private' && category !== 'private') {
    return false;
  }

  return true;
}

/**
 * Get required credits for a class
 */
export function getRequiredCredits(classInfo: ClassCreditInfo, creditType: string): number {
  if (creditType === 'group') {
    return classInfo.group_credits;
  } else if (creditType === 'private') {
    return classInfo.private_credits;
  }
  return 0;
}

/**
 * Comprehensive validation function for class registration with credits
 */
export async function validateClassRegistration(
  classId: string,
  usedCredit: boolean,
  creditType?: string,
  userId?: string
): Promise<CreditValidationResult> {
  try {
    // Get class information
    const classInfo = await getClassCreditInfo(classId);
    
    // Get user credits if using credits
    let userCredits: any[] = [];
    if (usedCredit && userId) {
      const { data: credits, error } = await supabase
        .from('subscription_credits')
        .select('*')
        .eq('user_id', userId);
      
      if (!error) {
        userCredits = credits || [];
      }
    }

    // Validate credit usage
    const creditValidation = validateCreditUsage(classInfo, usedCredit, creditType, userCredits);
    
    if (!creditValidation.isValid) {
      return creditValidation;
    }

    // If using credits, validate class-category compatibility
    if (usedCredit && creditType) {
      if (!validateClassCategoryCompatibility(classInfo, creditType)) {
        return {
          isValid: false,
          errorMessage: `סוג הקרדיט '${creditType}' אינו תואם לסוג השיעור '${classInfo.category}'`,
          allowedCreditTypes: creditValidation.allowedCreditTypes,
          requiredCredits: creditValidation.requiredCredits
        };
      }
    }

    return creditValidation;
  } catch (error) {
    logger.error('Error validating class registration:', error);
    throw error;
  }
}

/**
 * Get available credit types for a class (for frontend display)
 */
export function getAvailableCreditTypes(classInfo: ClassCreditInfo): CreditTypeInfo[] {
  const availableTypes = getAllowedCreditTypes(classInfo);
  
  return [
    {
      type: 'group',
      label: 'קרדיט קבוצתי',
      available: availableTypes.includes('group'),
      credits: classInfo.group_credits
    },
    {
      type: 'private',
      label: 'קרדיט פרטי',
      available: availableTypes.includes('private'),
      credits: classInfo.private_credits
    }
  ];
}
