-- ============================================================
-- FULL DATABASE SCHEMA & RLS POLICIES FOR CAMPUSNEST
-- Run this ENTIRE file in your Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Create Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  phone text,
  role text DEFAULT 'student',
  college text,
  branch text,
  gender text,
  bio text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Create Properties Table
CREATE TABLE IF NOT EXISTS public.properties (
  id text PRIMARY KEY,
  owner_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  owner_name text,
  title text NOT NULL,
  description text,
  property_type text,
  rent numeric,
  deposit numeric,
  address text,
  city text,
  state text,
  pincode text,
  latitude numeric,
  longitude numeric,
  contact_phone text,
  contact_email text,
  availability boolean DEFAULT true,
  gender_preference text,
  total_rooms integer,
  available_rooms integer,
  verified boolean DEFAULT false,
  featured boolean DEFAULT false,
  rating numeric DEFAULT 5.0,
  review_count integer DEFAULT 0,
  images text[],
  video_url text,
  google_maps_url text,
  amenities jsonb,
  sharing_configs jsonb DEFAULT '[]'::jsonb,
  flat_config jsonb DEFAULT '{}'::jsonb,
  hostel_config jsonb DEFAULT '{}'::jsonb,
  pg_config jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Create Messes Table
CREATE TABLE IF NOT EXISTS public.messes (
  id text PRIMARY KEY,
  owner_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  address text,
  city text,
  state text,
  latitude numeric,
  longitude numeric,
  contact_phone text,
  contact_email text,
  monthly_charge numeric,
  per_meal_charge numeric,
  status text DEFAULT 'open',
  verified boolean DEFAULT false,
  featured boolean DEFAULT false,
  rating numeric DEFAULT 5.0,
  review_count integer DEFAULT 0,
  photos text[],
  meal_types text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messes ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PROFILES POLICIES
-- ============================================================
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
CREATE POLICY "profiles_select_policy"
  ON profiles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
CREATE POLICY "profiles_insert_policy"
  ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
CREATE POLICY "profiles_update_policy"
  ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- ============================================================
-- MESSES POLICIES
-- ============================================================
DROP POLICY IF EXISTS "messes_select_policy" ON messes;
CREATE POLICY "messes_select_policy"
  ON messes FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "messes_insert_policy" ON messes;
CREATE POLICY "messes_insert_policy"
  ON messes FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "messes_update_policy" ON messes;
CREATE POLICY "messes_update_policy"
  ON messes FOR UPDATE TO authenticated 
  USING (auth.uid() = owner_id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- ============================================================
-- PROPERTIES POLICIES
-- ============================================================
DROP POLICY IF EXISTS "properties_select_policy" ON properties;
CREATE POLICY "properties_select_policy"
  ON properties FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "properties_insert_policy" ON properties;
CREATE POLICY "properties_insert_policy"
  ON properties FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "properties_update_policy" ON properties;
CREATE POLICY "properties_update_policy"
  ON properties FOR UPDATE TO authenticated 
  USING (auth.uid() = owner_id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- ============================================================
-- AUTO-CREATE PROFILE TRIGGER FOR NEW SIGNUPS
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- PROPERTY VISITS TABLE & POLICIES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.property_visits (
  id text PRIMARY KEY,
  property_id text NOT NULL,
  property_title text NOT NULL,
  property_image text,
  owner_id text NOT NULL,
  student_id text NOT NULL,
  student_name text NOT NULL,
  student_phone text NOT NULL,
  visit_date text NOT NULL,
  day_label text NOT NULL,
  time_slot text NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.property_visits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "property_visits_select_policy" ON public.property_visits;
CREATE POLICY "property_visits_select_policy" ON public.property_visits FOR SELECT USING (true);

DROP POLICY IF EXISTS "property_visits_insert_policy" ON public.property_visits;
CREATE POLICY "property_visits_insert_policy" ON public.property_visits FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "property_visits_update_policy" ON public.property_visits;
CREATE POLICY "property_visits_update_policy" ON public.property_visits FOR UPDATE USING (true);

DROP POLICY IF EXISTS "property_visits_delete_policy" ON public.property_visits;
CREATE POLICY "property_visits_delete_policy" ON public.property_visits FOR DELETE USING (true);
