-- Enhance RLS policies for sessions tables
-- This migration adds additional security policies and optimizations

-- ===== ADDITIONAL SCHEDULE_SESSIONS POLICIES =====

-- Allow service role to bypass RLS (for backend operations)
CREATE POLICY "Allow service role to bypass RLS" ON public.schedule_sessions
    FOR ALL USING (auth.role() = 'service_role');

-- Allow users to read sessions they're registered for
CREATE POLICY "Allow users to read their registered sessions" ON public.schedule_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM registrations r
            WHERE r.session_id = schedule_sessions.id
            AND r.user_id = auth.uid()
        )
    );

-- ===== ADDITIONAL SESSION_CLASSES POLICIES =====

-- Allow service role to bypass RLS (for backend operations)
CREATE POLICY "Allow service role to bypass RLS" ON public.session_classes
    FOR ALL USING (auth.role() = 'service_role');

-- Allow users to read session classes they're registered for
CREATE POLICY "Allow users to read their registered session classes" ON public.session_classes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM registrations r
            WHERE r.session_class_id = session_classes.id
            AND r.user_id = auth.uid()
        )
    );

-- ===== OPTIMIZATION INDEXES =====

-- Add indexes for better performance with RLS policies
CREATE INDEX IF NOT EXISTS idx_schedule_sessions_is_active ON public.schedule_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_session_classes_is_active ON public.session_classes(is_active);
CREATE INDEX IF NOT EXISTS idx_registrations_session_id_user_id ON public.registrations(session_id, user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_session_class_id_user_id ON public.registrations(session_class_id, user_id);

-- ===== COMMENTS FOR DOCUMENTATION =====

COMMENT ON TABLE public.schedule_sessions IS 'Scheduled sessions for dance classes with RLS policies for security';
COMMENT ON TABLE public.session_classes IS 'Junction table linking sessions to classes with RLS policies for security';
COMMENT ON COLUMN public.schedule_sessions.is_active IS 'Whether this session is currently active and available for registration';
COMMENT ON COLUMN public.session_classes.is_active IS 'Whether this session-class combination is currently active'; 