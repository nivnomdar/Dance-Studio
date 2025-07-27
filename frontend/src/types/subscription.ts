// Subscription Credits Types
export interface SubscriptionCredit {
  id: string;
  user_id: string;
  credit_group: string; // 'group' | 'private' | 'zoom' etc.
  remaining_credits: number;
  expires_at?: string;
  created_at: string;
}

export interface CreateSubscriptionCreditRequest {
  user_id: string;
  credit_group: string;
  remaining_credits: number;
  expires_at?: string;
}

export interface UpdateSubscriptionCreditRequest {
  remaining_credits?: number;
  expires_at?: string;
}

export interface UserSubscriptionCredits {
  user_id: string;
  credits: SubscriptionCredit[];
  total_group_credits: number;
  total_private_credits: number;
  total_zoom_credits: number;
}

// Credit group types
export type CreditGroup = 'group' | 'private' | 'zoom' | 'workshop' | 'intensive';

// Credit group labels
export const CREDIT_GROUP_LABELS: Record<CreditGroup, string> = {
  group: 'שיעורים קבוצתיים',
  private: 'שיעורים פרטיים',
  zoom: 'שיעורי זום',
  workshop: 'סדנאות',
  intensive: 'אינטנסיב'
};

// Credit group colors
export const CREDIT_GROUP_COLORS: Record<CreditGroup, string> = {
  group: 'bg-blue-100 text-blue-800',
  private: 'bg-purple-100 text-purple-800',
  zoom: 'bg-green-100 text-green-800',
  workshop: 'bg-orange-100 text-orange-800',
  intensive: 'bg-red-100 text-red-800'
}; 