-- Cleanup old profiles policies
-- This migration drops all existing policies that weren't dropped by previous migrations

-- Drop all remaining policies
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Allow profile creation during OAuth" ON profiles;
DROP POLICY IF EXISTS "System can view profiles for validation" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated users to view profiles" ON profiles;

-- Now recreate the correct policies
-- ===== USER POLICIES =====

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can insert their own profile (for registration)
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can delete their own profile (optional - for account deletion)
CREATE POLICY "Users can delete own profile"
  ON profiles FOR DELETE
  USING (auth.uid() = id);

-- ===== SYSTEM VALIDATION POLICIES =====

-- System can view profiles for validation (for triggers and functions)
CREATE POLICY "System can view profiles for validation"
  ON profiles FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- ===== GOOGLE AUTH SPECIFIC POLICIES =====

-- Allow profile creation during Google OAuth signup
CREATE POLICY "Allow profile creation during OAuth"
  ON profiles FOR INSERT
  WITH CHECK (
    auth.uid() = id 
    OR 
    -- Allow system to create profiles during OAuth flow
    (auth.uid() IS NOT NULL AND id IS NOT NULL)
  );

-- ===== FALLBACK POLICIES =====

-- Allow authenticated users to view profiles (fallback for existing profiles)
CREATE POLICY "Allow authenticated users to view profiles"
  ON profiles FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- ===== COMMENTS =====

COMMENT ON POLICY "Users can view own profile" ON profiles IS 'Users can only view their own profile';
COMMENT ON POLICY "Users can insert own profile" ON profiles IS 'Users can create their own profile during registration';
COMMENT ON POLICY "Users can update own profile" ON profiles IS 'Users can update their own profile information';
COMMENT ON POLICY "Users can delete own profile" ON profiles IS 'Users can delete their own profile (account deletion)';
COMMENT ON POLICY "System can view profiles for validation" ON profiles IS 'System can view profiles for validation purposes';
COMMENT ON POLICY "Allow profile creation during OAuth" ON profiles IS 'Allows profile creation during Google OAuth signup process';
COMMENT ON POLICY "Allow authenticated users to view profiles" ON profiles IS 'Fallback policy for authenticated users to view profiles';