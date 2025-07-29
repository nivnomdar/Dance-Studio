-- Fix infinite recursion in profiles RLS policies
-- This migration reverts the admin policies to use auth.jwt() ->> 'role' = 'admin'
-- instead of the problematic EXISTS subquery that causes infinite recursion

-- Drop the problematic admin policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;

-- Recreate admin policies using auth.jwt() ->> 'role' = 'admin' (no recursion)
-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    auth.uid() IS NOT NULL 
    AND 
    auth.jwt() ->> 'role' = 'admin'
  );

-- Admins can insert profiles
CREATE POLICY "Admins can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND 
    auth.jwt() ->> 'role' = 'admin'
  );

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (
    auth.uid() IS NOT NULL 
    AND 
    auth.jwt() ->> 'role' = 'admin'
  )
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND 
    auth.jwt() ->> 'role' = 'admin'
  );

-- Admins can delete profiles
CREATE POLICY "Admins can delete profiles"
  ON profiles FOR DELETE
  USING (
    auth.uid() IS NOT NULL 
    AND 
    auth.jwt() ->> 'role' = 'admin'
  );