-- Fix RLS policies for profiles table
-- Drop all existing policies first
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON profiles;
DROP POLICY IF EXISTS "Users can upsert their own profile." ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles." ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile." ON profiles;

-- Create new policies
-- Users can view their own profile
CREATE POLICY "Users can view their own profile."
  ON profiles FOR SELECT
  USING ( auth.uid() = id );

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile."
  ON profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

-- Users can update their own profile
CREATE POLICY "Users can update their own profile."
  ON profiles FOR UPDATE
  USING ( auth.uid() = id );

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles."
  ON profiles FOR SELECT
  USING ( 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles."
  ON profiles FOR UPDATE
  USING ( 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Combined policy: Users can view their own profile OR admins can view all profiles
CREATE POLICY "Users can view own profile or admins can view all."
  ON profiles FOR SELECT
  USING ( 
    auth.uid() = id 
    OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  ); 