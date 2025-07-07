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