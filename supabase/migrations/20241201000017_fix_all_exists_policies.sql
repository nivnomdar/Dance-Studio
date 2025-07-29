-- Fix all EXISTS subquery policies that cause infinite recursion
-- This migration replaces all EXISTS subqueries with auth.jwt() ->> 'role' = 'admin'

-- ===== CLASSES POLICIES =====

-- Drop existing admin policies for classes
DROP POLICY IF EXISTS "Admins can insert classes." ON classes;
DROP POLICY IF EXISTS "Admins can update classes." ON classes;
DROP POLICY IF EXISTS "Admins can delete classes." ON classes;

-- Recreate admin policies using auth.jwt() ->> 'role' = 'admin'
CREATE POLICY "Admins can insert classes." ON classes
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL 
    AND 
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Admins can update classes." ON classes
  FOR UPDATE USING (
    auth.uid() IS NOT NULL 
    AND 
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Admins can delete classes." ON classes
  FOR DELETE USING (
    auth.uid() IS NOT NULL 
    AND 
    auth.jwt() ->> 'role' = 'admin'
  );

-- ===== SUBSCRIPTION_CREDITS POLICIES =====

-- Drop existing admin policies for subscription_credits
DROP POLICY IF EXISTS "Admins can view all subscription credits" ON subscription_credits;
DROP POLICY IF EXISTS "Admins can insert any subscription credits" ON subscription_credits;
DROP POLICY IF EXISTS "Admins can update any subscription credits" ON subscription_credits;
DROP POLICY IF EXISTS "Admins can delete any subscription credits" ON subscription_credits;

-- Recreate admin policies using auth.jwt() ->> 'role' = 'admin'
CREATE POLICY "Admins can view all subscription credits" ON subscription_credits
  FOR SELECT USING (
    auth.uid() IS NOT NULL 
    AND 
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Admins can insert any subscription credits" ON subscription_credits
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL 
    AND 
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Admins can update any subscription credits" ON subscription_credits
  FOR UPDATE USING (
    auth.uid() IS NOT NULL 
    AND 
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Admins can delete any subscription credits" ON subscription_credits
  FOR DELETE USING (
    auth.uid() IS NOT NULL 
    AND 
    auth.jwt() ->> 'role' = 'admin'
  );

-- ===== SCHEDULE_SESSIONS POLICIES =====

-- Drop existing admin policies for schedule_sessions
DROP POLICY IF EXISTS "Allow admins to read all sessions" ON schedule_sessions;
DROP POLICY IF EXISTS "Allow admins to insert sessions" ON schedule_sessions;
DROP POLICY IF EXISTS "Allow admins to update sessions" ON schedule_sessions;
DROP POLICY IF EXISTS "Allow admins to delete sessions" ON schedule_sessions;

-- Recreate admin policies using auth.jwt() ->> 'role' = 'admin'
CREATE POLICY "Allow admins to read all sessions" ON schedule_sessions
  FOR SELECT USING (
    auth.uid() IS NOT NULL 
    AND 
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Allow admins to insert sessions" ON schedule_sessions
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL 
    AND 
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Allow admins to update sessions" ON schedule_sessions
  FOR UPDATE USING (
    auth.uid() IS NOT NULL 
    AND 
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Allow admins to delete sessions" ON schedule_sessions
  FOR DELETE USING (
    auth.uid() IS NOT NULL 
    AND 
    auth.jwt() ->> 'role' = 'admin'
  );

-- ===== SESSION_CLASSES POLICIES =====

-- Drop existing admin policies for session_classes
DROP POLICY IF EXISTS "Allow admins to read all session classes" ON session_classes;
DROP POLICY IF EXISTS "Allow admins to insert session classes" ON session_classes;
DROP POLICY IF EXISTS "Allow admins to update session classes" ON session_classes;
DROP POLICY IF EXISTS "Allow admins to delete session classes" ON session_classes;

-- Recreate admin policies using auth.jwt() ->> 'role' = 'admin'
CREATE POLICY "Allow admins to read all session classes" ON session_classes
  FOR SELECT USING (
    auth.uid() IS NOT NULL 
    AND 
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Allow admins to insert session classes" ON session_classes
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL 
    AND 
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Allow admins to update session classes" ON session_classes
  FOR UPDATE USING (
    auth.uid() IS NOT NULL 
    AND 
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Allow admins to delete session classes" ON session_classes
  FOR DELETE USING (
    auth.uid() IS NOT NULL 
    AND 
    auth.jwt() ->> 'role' = 'admin'
  );

-- ===== REGISTRATIONS POLICIES =====

-- Drop existing admin policies for registrations
DROP POLICY IF EXISTS "Admins can manage all registrations." ON registrations;
DROP POLICY IF EXISTS "Admins can view all registrations." ON registrations;

-- Recreate admin policies using auth.jwt() ->> 'role' = 'admin'
CREATE POLICY "Admins can manage all registrations." ON registrations
  FOR ALL USING (
    auth.uid() IS NOT NULL 
    AND 
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Admins can view all registrations." ON registrations
  FOR SELECT USING (
    auth.uid() IS NOT NULL 
    AND 
    auth.jwt() ->> 'role' = 'admin'
  );