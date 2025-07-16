-- Add RLS policies for sessions tables
-- This migration adds the necessary RLS policies to allow frontend access to sessions data

-- Enable RLS on schedule_sessions table
ALTER TABLE public.schedule_sessions ENABLE ROW LEVEL SECURITY;

-- Enable RLS on session_classes table  
ALTER TABLE public.session_classes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to active sessions" ON public.schedule_sessions;
DROP POLICY IF EXISTS "Allow authenticated users to read all sessions" ON public.schedule_sessions;
DROP POLICY IF EXISTS "Allow public read access to active session classes" ON public.session_classes;
DROP POLICY IF EXISTS "Allow authenticated users to read all session classes" ON public.session_classes;

-- ===== SCHEDULE_SESSIONS POLICIES =====

-- Public read access to active sessions (for frontend display)
CREATE POLICY "Allow public read access to active sessions" ON public.schedule_sessions
    FOR SELECT USING (is_active = true);

-- Authenticated users can read all sessions
CREATE POLICY "Allow authenticated users to read all sessions" ON public.schedule_sessions
    FOR SELECT USING (auth.role() = 'authenticated');

-- Admins can read all sessions (including inactive ones)
CREATE POLICY "Allow admins to read all sessions" ON public.schedule_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Admins can insert new sessions
CREATE POLICY "Allow admins to insert sessions" ON public.schedule_sessions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Admins can update sessions
CREATE POLICY "Allow admins to update sessions" ON public.schedule_sessions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Admins can delete sessions
CREATE POLICY "Allow admins to delete sessions" ON public.schedule_sessions
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- ===== SESSION_CLASSES POLICIES =====

-- Public read access to active session classes
CREATE POLICY "Allow public read access to active session classes" ON public.session_classes
    FOR SELECT USING (is_active = true);

-- Authenticated users can read all session classes
CREATE POLICY "Allow authenticated users to read all session classes" ON public.session_classes
    FOR SELECT USING (auth.role() = 'authenticated');

-- Admins can read all session classes (including inactive ones)
CREATE POLICY "Allow admins to read all session classes" ON public.session_classes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Admins can insert new session classes
CREATE POLICY "Allow admins to insert session classes" ON public.session_classes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Admins can update session classes
CREATE POLICY "Allow admins to update session classes" ON public.session_classes
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Admins can delete session classes
CREATE POLICY "Allow admins to delete session classes" ON public.session_classes
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    ); 