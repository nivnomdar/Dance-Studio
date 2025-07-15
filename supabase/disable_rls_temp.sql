-- Temporary: Disable RLS for testing sessions functionality
-- Run this in Supabase SQL Editor if you don't want to run migrations

-- Disable RLS on schedule_sessions table
ALTER TABLE public.schedule_sessions DISABLE ROW LEVEL SECURITY;
 
-- Disable RLS on session_classes table
ALTER TABLE public.session_classes DISABLE ROW LEVEL SECURITY; 