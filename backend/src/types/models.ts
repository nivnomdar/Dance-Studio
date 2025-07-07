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

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface DanceClass {
  id: string;
  title: string;
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
  is_active: boolean;
  start_time?: string;
  end_time?: string;
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
  is_active?: boolean;
  start_time?: string;
  end_time?: string;
}

export interface UpdateClassRequest extends Partial<CreateClassRequest> {} 