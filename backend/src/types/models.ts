export interface Order {
  id: string;
  user_id: string;
  status: string;
  total: number;
  created_at: string;
  updated_at: string;
}

export interface ClassRegistration {
  id: string;
  user_id: string;
  class_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Registration {
  id: string;
  class_id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  experience?: string;
  selected_date: string;
  selected_time: string;
  notes?: string;
  status: string;
  payment_id?: string;
  used_credit?: boolean;
  credit_type?: 'group' | 'private';
  purchase_price?: number;
  // Enhanced fields
  payment_method?: 'cash' | 'credit' | 'card_online' | 'bit' | 'credit_usage';
  session_selection?: 'custom' | 'scheduled';
  session_id?: string;
  session_class_id?: string;
  created_at: string;
  updated_at: string;
}

export interface RegistrationWithDetails extends Registration {
  class: {
    id: string;
    name: string;
    price: number;
    duration?: number;
    level?: string;
    category?: string;
  };
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface RegistrationWithFullDetails extends RegistrationWithDetails {
}

export interface CreateRegistrationRequest {
  class_id: string;
  user_id?: string; // Add user_id as optional since it's set by the server
  session_id?: string;
  session_class_id?: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  experience?: string;
  selected_date: string;
  selected_time: string;
  notes?: string;
  payment_id?: string;
  used_credit?: boolean;
  credit_type?: 'group' | 'private';
  purchase_price?: number;
  // Enhanced fields
  payment_method?: 'cash' | 'credit' | 'online' | 'credit_usage';
  session_selection?: 'custom' | 'scheduled';
}

export interface UpdateRegistrationRequest extends Partial<CreateRegistrationRequest> {
  status?: string;
}

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

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  avatar_url?: string;
  role: 'user' | 'admin';
  is_active: boolean;
  terms_accepted: boolean;
  marketing_consent: boolean;
  last_login_at?: string;
  language: string;
  created_at: string;
  updated_at: string;
  has_used_trial_class: boolean;
}

export interface Class {
  id: string;
  name: string;
  slug: string;
  description: string;
  long_description?: string;
  price: number;
  duration?: number;
  level?: string;
  age_group?: string;
  max_participants?: number;
  location?: string;
  included?: string;
  image_url?: string;
  video_url?: string;
  category?: string;
  registration_type?: 'standard' | 'appointment_only';
  color_scheme?: string;
  group_credits?: number;
  private_credits?: number;
  is_active: boolean;
  start_time?: string;
  end_time?: string;
  available_dates?: (string | number)[]; // תאריכים זמינים או ימי שבוע
  created_at: string;
  updated_at: string;
}

export interface CreateClassRequest {
  name: string;
  slug: string;
  description: string;
  long_description?: string;
  price: number;
  duration?: number;
  level?: string;
  age_group?: string;
  max_participants?: number;
  location?: string;
  included?: string;
  image_url?: string;
  video_url?: string;
  category?: string;
  registration_type?: 'standard' | 'appointment_only';
  is_active?: boolean;
  start_time?: string;
  end_time?: string;
}

export interface UpdateClassRequest extends Partial<CreateClassRequest> {} 