// Safe user metadata type
export interface SafeUserMetadata {
  full_name?: string;
  avatar_url?: string;
  email?: string;
  [key: string]: any;
}

// Safe user type with null checks
export interface SafeUser {
  id: string;
  email?: string;
  user_metadata?: SafeUserMetadata;
  app_metadata?: Record<string, any>;
  aud: string;
  created_at: string;
  updated_at?: string;
}

// Safe session type
export interface SafeSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
  token_type: string;
  user: SafeUser;
}

export interface AuthContextType {
  user: SafeUser | null;
  session: SafeSession | null;
  loading: boolean;
  profile: UserProfile | null;
  profileLoading: boolean;
  loadProfile: (forceRefresh?: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
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
  last_login_at?: string;
  language: string;
  created_at: string;
  updated_at: string;
  has_used_trial_class?: boolean; // deprecated; kept optional for backward compatibility
}

export interface UserConsent {
  id: number;
  user_id: string;
  consent_type: 'terms_and_privacy' | 'age_18' | 'health_declaration' | 'marketing_consent' | 'registration_terms_and_privacy';
  version: string | null;
  consented_at: string;
  registration_id: string | null;
}

// Auth state enum for better type safety
export enum AuthState {
  LOADING = 'LOADING',
  AUTHENTICATED = 'AUTHENTICATED',
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  ERROR = 'ERROR'
}

// Auth event types
export type AuthEvent = 
  | 'SIGNED_IN'
  | 'SIGNED_OUT'
  | 'TOKEN_REFRESHED'
  | 'USER_UPDATED'
  | 'USER_DELETED'
  | 'MFA_CHALLENGE_VERIFIED'
  | 'PASSWORD_RECOVERY'
  | 'INITIAL_SESSION'; 