-- Fix admin policies for schedule_sessions and session_classes
-- This migration updates the admin policies to use EXISTS subqueries

-- ===== SCHEDULE_SESSIONS POLICIES =====

-- Drop existing admin policies for schedule_sessions
DROP POLICY IF EXISTS "Allow admins to read all sessions" ON schedule_sessions;
DROP POLICY IF EXISTS "Allow admins to insert sessions" ON schedule_sessions;
DROP POLICY IF EXISTS "Allow admins to update sessions" ON schedule_sessions;
DROP POLICY IF EXISTS "Allow admins to delete sessions" ON schedule_sessions;

-- Recreate admin policies using EXISTS
CREATE POLICY "Allow admins to read all sessions" ON schedule_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Allow admins to insert sessions" ON schedule_sessions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Allow admins to update sessions" ON schedule_sessions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Allow admins to delete sessions" ON schedule_sessions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- ===== SESSION_CLASSES POLICIES =====

-- Drop existing admin policies for session_classes
DROP POLICY IF EXISTS "Allow admins to read all session classes" ON session_classes;
DROP POLICY IF EXISTS "Allow admins to insert session classes" ON session_classes;
DROP POLICY IF EXISTS "Allow admins to update session classes" ON session_classes;
DROP POLICY IF EXISTS "Allow admins to delete session classes" ON session_classes;

-- Recreate admin policies using EXISTS
CREATE POLICY "Allow admins to read all session classes" ON session_classes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Allow admins to insert session classes" ON session_classes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Allow admins to update session classes" ON session_classes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Allow admins to delete session classes" ON session_classes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );