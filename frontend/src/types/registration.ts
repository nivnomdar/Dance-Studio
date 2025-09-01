import { Class } from './class';
import { UserProfile } from './auth';

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
  status: 'active' | 'cancelled' | 'completed' | 'pending'; // Using specific frontend enum
  payment_id?: string;
  used_credit?: boolean;
  credit_type?: 'group' | 'private';
  purchase_price?: number;
  payment_method?: 'cash' | 'credit' | 'card_online' | 'bit' | 'credit_usage';
  session_selection?: 'custom' | 'scheduled';
  session_id?: string;
  session_class_id?: string;
  created_at: string;
  updated_at: string;
  registration_terms_accepted: boolean;
  health_declaration_accepted: boolean;
  age_confirmation_accepted: boolean; // New field
  class?: Class; // Added to resolve linter error with RegistrationWithDetails
  user?: UserProfile; // Added to resolve linter error with RegistrationWithDetails
}

export interface RegistrationWithDetails extends Registration {
  class: Class;
  user: UserProfile;
}

export interface RegistrationWithFullDetails extends RegistrationWithDetails {
}

export interface CreateRegistrationRequest {
  class_id: string;
  user_id?: string; // User ID is usually set by backend from auth context
  session_id?: string | null;
  session_class_id?: string | null;
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
  payment_method?: 'cash' | 'credit' | 'online' | 'credit_usage'; // Changed 'card_online' to 'online' to match backend
  session_selection?: 'custom' | 'scheduled';
  registration_terms_accepted: boolean;
  health_declaration_accepted: boolean;
  age_confirmation_accepted: boolean; // New field
}

export interface UpdateRegistrationRequest extends Partial<CreateRegistrationRequest> {
  status?: string;
} 