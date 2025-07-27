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
  user?: {
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
}

export interface UpdateRegistrationRequest extends Partial<CreateRegistrationRequest> {
  status?: string;
} 