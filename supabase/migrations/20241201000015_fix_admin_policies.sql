-- Fix admin policies for profiles table
-- This migration fixes the admin policies to work correctly

-- Drop existing admin policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;

-- Create new admin policies that work correctly
-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    auth.uid() IS NOT NULL 
    AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Admins can insert profiles
CREATE POLICY "Admins can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (
    auth.uid() IS NOT NULL 
    AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Admins can delete profiles
CREATE POLICY "Admins can delete profiles"
  ON profiles FOR DELETE
  USING (
    auth.uid() IS NOT NULL 
    AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Add comments
COMMENT ON POLICY "Admins can view all profiles" ON profiles IS 'Admins can view all user profiles';
COMMENT ON POLICY "Admins can insert profiles" ON profiles IS 'Admins can create new profiles';
COMMENT ON POLICY "Admins can update all profiles" ON profiles IS 'Admins can update any user profile';
COMMENT ON POLICY "Admins can delete profiles" ON profiles IS 'Admins can delete any user profile';