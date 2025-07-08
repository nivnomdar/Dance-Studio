// צבעים זמינים לשיעורים - פלטה מוגדרת מראש
export type AvailableColorScheme = 
  | 'pink' 
  | 'purple' 
  | 'emerald' 
  | 'blue'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'teal'
  | 'cyan'
  | 'indigo'
  | 'violet'
  | 'fuchsia'
  | 'rose'
  | 'slate'
  | 'gray'
  | 'zinc'
  | 'neutral'
  | 'stone'
  | 'amber'
  | 'lime';

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
  is_active: boolean;
  start_time?: string;
  end_time?: string;
  created_at: string;
  updated_at: string;
} 