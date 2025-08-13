// Types for credit validation system

export interface ClassCreditInfo {
  class_type: 'group' | 'private' | 'both';
  category: string;
  group_credits: number;
  private_credits: number;
  price: number;
}

export interface CreditValidationResult {
  isValid: boolean;
  errorMessage?: string;
  allowedCreditTypes: string[];
  requiredCredits: number;
}

export interface CreditTypeInfo {
  type: string;
  label: string;
  available: boolean;
  credits: number;
}

export interface CreditValidationRules {
  class_id: string;
  class_type: 'group' | 'private' | 'both';
  category: string;
  group_credits: number;
  private_credits: number;
  price: number;
  validation_rules: {
    can_use_group_credits: boolean;
    can_use_private_credits: boolean;
    requires_subscription_category: boolean;
    requires_private_category: boolean;
    min_group_credits: boolean;
    min_private_credits: boolean;
  };
  allowed_combinations: Array<{
    credit_type: string;
    category: string;
    description: string;
  }>;
}
