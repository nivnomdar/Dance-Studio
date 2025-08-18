import { Class, RegistrationType } from '../types/class';

export type RegistrationComponentKey = 'standard' | 'appointment_only' | 'subscription';

/**
 * Decide which registration flow to render based SOLELY on registration_type.
 * category is informational only (badges/labels/policies), not for flow.
 */
export function getRegistrationComponentKeyForClass(classData: Class): RegistrationComponentKey {
  const type: RegistrationType = classData.registration_type || 'standard';
  if (type === 'subscription') return 'subscription';
  if (type === 'appointment_only') return 'appointment_only';
  return 'standard';
}

/**
 * Helper flags for UI logic that should not affect the chosen flow.
 * Use these for badges/labels/policies only.
 */
export function getClassCategoryFlags(classData: Class) {
  const category = (classData.category || '').toLowerCase();
  return {
    isTrial: category === 'trial',
    isSingle: category === 'single',
    isPrivate: category === 'private',
    isSubscriptionCategory: category === 'subscription',
    raw: category
  };
}


