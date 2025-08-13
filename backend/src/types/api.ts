export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
  message?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateOrderRequest {
  user_id: string;
  items: Array<{
    product_id: string;
    quantity: number;
    price: number;
  }>;
  total: number;
}

export interface CreateClassRegistrationRequest {
  user_id: string;
  class_id: string;
}

export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  terms_accepted?: boolean;
  marketing_consent?: boolean;
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
  color_scheme?: string;
  registration_type?: 'standard' | 'appointment_only';
  class_type?: 'group' | 'private' | 'both'; // סוג הקרדיטים שהשיעור מציע
  group_credits?: number; // כמות הקרדיטים הקבוצתיים שהמשתמש מקבל
  private_credits?: number; // כמות הקרדיטים האישיים שהמשתמש מקבל
  is_active: boolean;
  start_time?: string;
  end_time?: string;
  created_at: string;
  updated_at: string;
} 