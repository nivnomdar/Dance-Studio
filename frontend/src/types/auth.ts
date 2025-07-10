import { User, Session } from '@supabase/supabase-js';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profile: UserProfile | null;
  profileLoading: boolean;
  loadProfile: () => Promise<void>;
  signOut: () => Promise<void>;
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