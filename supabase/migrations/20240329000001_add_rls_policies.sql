-- Add RLS policies for sessions tables
-- This migration adds the necessary RLS policies to allow frontend access to sessions data

-- Enable RLS on schedule_sessions table
ALTER TABLE public.schedule_sessions ENABLE ROW LEVEL SECURITY;

-- Enable RLS on session_classes table  
ALTER TABLE public.session_classes ENABLE ROW LEVEL SECURITY;

-- Policies for schedule_sessions - allow public read access to active sessions
CREATE POLICY "Allow public read access to active sessions" ON public.schedule_sessions
    FOR SELECT USING (is_active = true);

-- Policies for session_classes - allow public read access to active session classes
CREATE POLICY "Allow public read access to active session classes" ON public.session_classes
    FOR SELECT USING (is_active = true);

-- Additional policies for authenticated users (if needed in the future)
CREATE POLICY "Allow authenticated users to read all sessions" ON public.schedule_sessions
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read all session classes" ON public.session_classes
    FOR SELECT USING (auth.role() = 'authenticated'); 