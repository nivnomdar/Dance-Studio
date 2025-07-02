-- Add missing columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS first_name text,
ADD COLUMN IF NOT EXISTS last_name text,
ADD COLUMN IF NOT EXISTS role text DEFAULT 'user',
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS terms_accepted boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS marketing_consent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS last_login_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS language text DEFAULT 'he',
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS address text; 