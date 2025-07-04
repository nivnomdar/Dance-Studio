-- Update profiles table to match the new structure
-- Add missing columns if they don't exist

-- Add phone_number column (rename from phone if exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'phone') THEN
        ALTER TABLE public.profiles RENAME COLUMN phone TO phone_number;
    ELSE
        ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_number text null;
    END IF;
END $$;

-- Add city column
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city text null;

-- Add postal_code column
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS postal_code text null;

-- Add referral_code column
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_code text null;

-- Add notes column
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notes text null;

-- Remove full_name column if it exists (we're using first_name + last_name instead)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS full_name;

-- Remove updated_at column if it exists (we'll handle this differently)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS updated_at;

-- Update constraints to match the new structure
ALTER TABLE public.profiles ALTER COLUMN email SET NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN role SET NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'user'::text;

-- Update language default
ALTER TABLE public.profiles ALTER COLUMN language SET DEFAULT 'he'::text;

-- Update last_login_at to be without time zone
ALTER TABLE public.profiles ALTER COLUMN last_login_at TYPE timestamp without time zone; 