// Types for class-related data

export type AvailableColorScheme = 'pink' | 'purple' | 'emerald' | 'blue' | 'orange' | 'teal' | 'indigo' | 'rose';

export type RegistrationType = 'standard' | 'appointment_only';

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
  color_scheme?: AvailableColorScheme; // פשוט שם הצבע
  registration_type?: RegistrationType; // סוג ההרשמה: standard או appointment_only
  group_credits?: number;
  private_credits?: number;
  is_active: boolean;
  start_time?: string;
  end_time?: string;
  created_at: string;
  updated_at: string;
} 