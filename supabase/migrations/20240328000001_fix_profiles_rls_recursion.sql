-- Fix infinite recursion in profiles RLS policies
-- Drop all existing policies first
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON profiles;
DROP POLICY IF EXISTS "Users can upsert their own profile." ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles." ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile." ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles." ON profiles;
DROP POLICY IF EXISTS "Users can view own profile or admins can view all." ON profiles;
DROP POLICY IF EXISTS "Allow authenticated users to view profiles" ON profiles;
DROP POLICY IF EXISTS "Temporary: Allow all authenticated users to view profiles" ON profiles;

-- Create simple, non-recursive policies
-- Users can view their own profile (simple check)
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING ( auth.uid() = id );

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING ( auth.uid() = id );

-- Simple admin check - allow all authenticated users to view profiles
-- This is a temporary solution until we fix the admin role check
CREATE POLICY "Allow authenticated users to view profiles"
  ON profiles FOR SELECT
  USING ( auth.uid() IS NOT NULL ); 