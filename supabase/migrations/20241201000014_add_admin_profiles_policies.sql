-- Add admin policies for profiles table
-- This migration adds admin policies that don't cause infinite recursion

-- ===== ADMIN POLICIES =====

-- Admins can view all profiles (using role check from auth context)
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    auth.uid() IS NOT NULL 
    AND 
    auth.jwt() ->> 'role' = 'admin'
  );

-- Admins can insert profiles (for creating admin accounts)
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
  );

-- Admins can delete profiles
CREATE POLICY "Admins can delete profiles"
  ON profiles FOR DELETE
  USING (
    auth.uid() IS NOT NULL 
    AND 
    auth.jwt() ->> 'role' = 'admin'
  );

-- ===== COMMENTS =====

COMMENT ON POLICY "Admins can view all profiles" ON profiles IS 'Admins can view all user profiles';
COMMENT ON POLICY "Admins can insert profiles" ON profiles IS 'Admins can create new profiles';
COMMENT ON POLICY "Admins can update all profiles" ON profiles IS 'Admins can update any user profile';
COMMENT ON POLICY "Admins can delete profiles" ON profiles IS 'Admins can delete any user profile';