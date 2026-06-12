-- ============================================================
-- FIX: Allow authenticated users to read all profiles
-- Run this in your Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Allow any authenticated user to read all profiles
-- (needed so Admin Dashboard can list all users)
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
CREATE POLICY "profiles_select_policy"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- 2. Allow users to insert/update their own profile
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
CREATE POLICY "profiles_insert_policy"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
CREATE POLICY "profiles_update_policy"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- 3. Make sure RLS is enabled on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- FIX: Allow authenticated users to read all messes
-- ============================================================
DROP POLICY IF EXISTS "messes_select_policy" ON messes;
CREATE POLICY "messes_select_policy"
  ON messes
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow mess owners to insert their own mess
DROP POLICY IF EXISTS "messes_insert_policy" ON messes;
CREATE POLICY "messes_insert_policy"
  ON messes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

-- Allow mess owners to update their own mess
DROP POLICY IF EXISTS "messes_update_policy" ON messes;
CREATE POLICY "messes_update_policy"
  ON messes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- ============================================================
-- FIX: Allow authenticated users to read all properties
-- ============================================================
DROP POLICY IF EXISTS "properties_select_policy" ON properties;
CREATE POLICY "properties_select_policy"
  ON properties
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow property owners to insert their own properties
DROP POLICY IF EXISTS "properties_insert_policy" ON properties;
CREATE POLICY "properties_insert_policy"
  ON properties
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

-- Allow property owners or admins to update
DROP POLICY IF EXISTS "properties_update_policy" ON properties;
CREATE POLICY "properties_update_policy"
  ON properties
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- ============================================================
-- Also ensure the profiles table has a trigger to auto-create
-- a profile row when a new auth user signs up
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    phone = COALESCE(EXCLUDED.phone, profiles.phone),
    role = COALESCE(EXCLUDED.role, profiles.role),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach the trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
