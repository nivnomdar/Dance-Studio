// Example usage of the credit validation system

import { validateClassRegistration } from './classCreditValidator';

/**
 * Example: How to use the credit validation system
 */
export async function exampleCreditValidation() {
  try {
    // Example 1: Validate group credit usage
    const groupCreditValidation = await validateClassRegistration(
      'class-id-123',
      true, // used_credit
      'group', // credit_type
      'user-id-456' // userId
    );

    if (!groupCreditValidation.isValid) {
      console.log('Group credit validation failed:', groupCreditValidation.errorMessage);
      return;
    }

    console.log('Group credit validation passed');
    console.log('Allowed credit types:', groupCreditValidation.allowedCreditTypes);

    // Example 2: Validate private credit usage
    const privateCreditValidation = await validateClassRegistration(
      'class-id-789',
      true, // used_credit
      'private', // credit_type
      'user-id-456' // userId
    );

    if (!privateCreditValidation.isValid) {
      console.log('Private credit validation failed:', privateCreditValidation.errorMessage);
      return;
    }

    console.log('Private credit validation passed');

    // Example 3: No credit usage (always valid)
    const noCreditValidation = await validateClassRegistration(
      'class-id-123',
      false, // used_credit
      undefined, // credit_type
      'user-id-456' // userId
    );

    console.log('No credit validation result:', noCreditValidation);

  } catch (error) {
    console.error('Error in credit validation example:', error);
  }
}

/**
 * Example: Frontend integration
 */
export function exampleFrontendIntegration() {
  // Example API call to get available credit types
  const getAvailableCreditTypes = async (classId: string) => {
    try {
      const response = await fetch(`/api/registrations/class/${classId}/credit-types`);
      const data = await response.json();
      
      console.log('Available credit types for class:', data);
      
      // Use the data to show/hide credit options in the UI
      data.available_credit_types.forEach((creditType: any) => {
        if (creditType.available) {
          console.log(`User can use ${creditType.type} credits (${creditType.credits} available)`);
        }
      });
      
      return data;
    } catch (error) {
      console.error('Error fetching credit types:', error);
    }
  };

  // Example: Validate before form submission
  const validateBeforeSubmit = async (formData: any) => {
    try {
      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Registration failed:', errorData);
        
        // Show error message to user
        if (errorData.message) {
          alert(`שגיאה בהרשמה: ${errorData.message}`);
        }
        return false;
      }

      const result = await response.json();
      console.log('Registration successful:', result);
      return true;
    } catch (error) {
      console.error('Error during registration:', error);
      return false;
    }
  };

  return {
    getAvailableCreditTypes,
    validateBeforeSubmit
  };
}
