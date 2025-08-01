-- Add enhanced registration fields for comprehensive registration management
-- This migration adds new fields to support detailed registration information

-- Add new columns to registrations table
ALTER TABLE public.registrations 
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'cash',
ADD COLUMN IF NOT EXISTS session_selection TEXT DEFAULT 'custom';

-- Add comments to explain the new columns
COMMENT ON COLUMN public.registrations.payment_method IS 'Method of payment: cash, credit, online, credit_usage';
COMMENT ON COLUMN public.registrations.session_selection IS 'Type of session: custom or scheduled';

-- Create indexes for better performance on new fields
CREATE INDEX IF NOT EXISTS idx_registrations_payment_method ON public.registrations(payment_method);
CREATE INDEX IF NOT EXISTS idx_registrations_session_selection ON public.registrations(session_selection);

-- Add constraints for payment_method
ALTER TABLE public.registrations 
ADD CONSTRAINT check_payment_method 
CHECK (payment_method IN ('cash', 'credit', 'online', 'credit_usage'));

-- Add constraints for session_selection
ALTER TABLE public.registrations 
ADD CONSTRAINT check_session_selection 
CHECK (session_selection IN ('custom', 'scheduled')); 