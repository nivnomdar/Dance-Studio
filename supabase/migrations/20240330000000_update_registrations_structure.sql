-- Update registrations table structure to support sessions and separate name fields
-- This migration fixes the mismatch between the frontend expectations and database structure

-- Add new columns for sessions support
ALTER TABLE public.registrations 
ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES public.schedule_sessions(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS session_class_id UUID REFERENCES public.session_classes(id) ON DELETE CASCADE;

-- Add separate name fields
ALTER TABLE public.registrations 
ADD COLUMN IF NOT EXISTS first_name text,
ADD COLUMN IF NOT EXISTS last_name text;

-- Update existing records to split full_name into first_name and last_name
UPDATE public.registrations 
SET 
  first_name = CASE 
    WHEN full_name IS NOT NULL AND full_name != '' THEN 
      CASE 
        WHEN position(' ' in full_name) > 0 THEN 
          substring(full_name from 1 for position(' ' in full_name) - 1)
        ELSE full_name
      END
    ELSE NULL
  END,
  last_name = CASE 
    WHEN full_name IS NOT NULL AND full_name != '' THEN 
      CASE 
        WHEN position(' ' in full_name) > 0 THEN 
          substring(full_name from position(' ' in full_name) + 1)
        ELSE NULL
      END
    ELSE NULL
  END
WHERE first_name IS NULL OR last_name IS NULL;

-- Make first_name and last_name required for new registrations
ALTER TABLE public.registrations 
ALTER COLUMN first_name SET NOT NULL,
ALTER COLUMN last_name SET NOT NULL;

-- Add indexes for better performance with sessions
CREATE INDEX IF NOT EXISTS idx_registrations_session_id ON public.registrations(session_id);
CREATE INDEX IF NOT EXISTS idx_registrations_session_class_id ON public.registrations(session_class_id);

-- Add comment to explain the new structure
COMMENT ON COLUMN public.registrations.session_id IS 'Reference to schedule_sessions table for session-based registrations';
COMMENT ON COLUMN public.registrations.session_class_id IS 'Reference to session_classes table for specific class-session combination';
COMMENT ON COLUMN public.registrations.first_name IS 'First name of the registrant (replaces full_name)';
COMMENT ON COLUMN public.registrations.last_name IS 'Last name of the registrant (replaces full_name)';

-- Update status check constraint to include 'active' status
ALTER TABLE public.registrations 
DROP CONSTRAINT IF EXISTS registrations_status_check;

ALTER TABLE public.registrations 
ADD CONSTRAINT registrations_status_check 
CHECK (status IN ('pending', 'confirmed', 'cancelled', 'active')); 