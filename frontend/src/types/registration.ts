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

export interface CreateRegistrationRequest {
  class_id: string;
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
}

export interface UpdateRegistrationRequest extends Partial<CreateRegistrationRequest> {
  status?: string;
} 