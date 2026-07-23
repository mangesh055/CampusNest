-- ============================================================
-- FLATSNFOOD (CAMPUSNEST) MASTER DATABASE SETUP & MIGRATION SCRIPT
-- Copy & Paste this entire file into the Supabase SQL Editor to set up
-- your new Supabase project from scratch!
-- ============================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 2. CORE TABLES
-- ============================================================

-- PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  phone text,
  gender text DEFAULT 'male',
  role text DEFAULT 'student',
  college text,
  branch text,
  bio text,
  is_profile_completed boolean DEFAULT false,
  status text DEFAULT 'active', -- 'active' | 'suspended'
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ensure all required columns exist in profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender text DEFAULT 'male';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_profile_completed boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

-- PROPERTIES TABLE
CREATE TABLE IF NOT EXISTS public.properties (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  owner_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  owner_name text,
  title text NOT NULL,
  description text,
  property_type text NOT NULL, -- 'pg' | 'hostel' | 'flat'
  rent numeric NOT NULL DEFAULT 0,
  deposit numeric DEFAULT 0,
  address text NOT NULL,
  city text NOT NULL,
  state text,
  pincode text,
  latitude numeric,
  longitude numeric,
  contact_phone text,
  contact_email text,
  availability boolean DEFAULT true,
  gender_preference text DEFAULT 'any',
  total_rooms integer DEFAULT 1,
  available_rooms integer DEFAULT 1,
  verified boolean DEFAULT false,
  rejected boolean DEFAULT false,
  featured boolean DEFAULT false,
  views integer DEFAULT 0,
  inquiries integer DEFAULT 0,
  rating numeric DEFAULT 4.5,
  review_count integer DEFAULT 0,
  images text[],
  video_url text,
  amenities jsonb DEFAULT '{}'::jsonb,
  google_maps_url text,
  sharing_configs jsonb DEFAULT '[]'::jsonb,
  flat_config jsonb DEFAULT '{}'::jsonb,
  hostel_config jsonb DEFAULT '{}'::jsonb,
  pg_config jsonb DEFAULT '{}'::jsonb,
  flat_details jsonb DEFAULT '{}'::jsonb,
  hostel_details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS owner_name text;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS video_url text;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS views integer DEFAULT 0;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS inquiries integer DEFAULT 0;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS rejected boolean DEFAULT false;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS flat_details jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS hostel_details jsonb DEFAULT '{}'::jsonb;

-- MESSES TABLE
CREATE TABLE IF NOT EXISTS public.messes (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  owner_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  address text NOT NULL,
  city text NOT NULL,
  state text,
  pincode text,
  latitude numeric,
  longitude numeric,
  contact_phone text,
  contact_email text,
  food_type text DEFAULT 'both', -- 'veg' | 'non_veg' | 'both'
  monthly_charge numeric DEFAULT 0,
  per_meal_charge numeric DEFAULT 0,
  status text DEFAULT 'open',
  verified boolean DEFAULT false,
  rejected boolean DEFAULT false,
  featured boolean DEFAULT false,
  rating numeric DEFAULT 4.5,
  review_count integer DEFAULT 0,
  photos text[],
  meal_types text[],
  google_maps_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.messes ADD COLUMN IF NOT EXISTS food_type text DEFAULT 'both';
ALTER TABLE public.messes ADD COLUMN IF NOT EXISTS rejected boolean DEFAULT false;

-- MESS PLANS TABLE
CREATE TABLE IF NOT EXISTS public.mess_plans (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  mess_id text REFERENCES public.messes(id) ON DELETE CASCADE,
  title text NOT NULL,
  price numeric NOT NULL,
  duration_days integer DEFAULT 30,
  total_meals integer DEFAULT 60,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.mess_plans ADD COLUMN IF NOT EXISTS total_meals integer DEFAULT 60;

-- MESS SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.mess_subscriptions (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  student_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  mess_id text REFERENCES public.messes(id) ON DELETE CASCADE,
  plan_id text REFERENCES public.mess_plans(id) ON DELETE SET NULL,
  plan_name text,
  status text DEFAULT 'active', -- 'active' | 'expired' | 'paused'
  start_date timestamptz DEFAULT now(),
  end_date timestamptz,
  meals_remaining integer DEFAULT 60,
  plan_snapshot jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.mess_subscriptions ADD COLUMN IF NOT EXISTS plan_snapshot jsonb DEFAULT '{}'::jsonb;

-- MESS ATTENDANCE TABLE
CREATE TABLE IF NOT EXISTS public.mess_attendance (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  subscription_id text REFERENCES public.mess_subscriptions(id) ON DELETE CASCADE,
  student_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  mess_id text REFERENCES public.messes(id) ON DELETE CASCADE,
  meal_type text NOT NULL, -- 'breakfast' | 'lunch' | 'dinner'
  scan_time timestamptz DEFAULT now(),
  status text DEFAULT 'verified'
);

-- ROOMMATES / ROOMMATE PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.roommate_profiles (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  gender text DEFAULT 'male',
  age integer DEFAULT 20,
  occupation text DEFAULT 'Student',
  college_or_company text,
  budget numeric DEFAULT 5000,
  preferred_location text,
  move_in_date text,
  habits jsonb DEFAULT '[]'::jsonb,
  bio text,
  verified boolean DEFAULT false,
  rejected boolean DEFAULT false,
  contact_phone text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.roommate_profiles ADD COLUMN IF NOT EXISTS rejected boolean DEFAULT false;

-- COMMUNITY POSTS / MARKETPLACE TABLE
CREATE TABLE IF NOT EXISTS public.community_posts (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_name text,
  author_avatar text,
  title text NOT NULL,
  content text NOT NULL,
  category text DEFAULT 'marketplace', -- 'marketplace' | 'study_group' | 'general' | 'lost_found'
  price numeric DEFAULT 0,
  item_condition text,
  images text[],
  verified boolean DEFAULT false,
  rejected boolean DEFAULT false,
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.community_posts ADD COLUMN IF NOT EXISTS verified boolean DEFAULT false;
ALTER TABLE public.community_posts ADD COLUMN IF NOT EXISTS rejected boolean DEFAULT false;

-- PROPERTY VISITS TABLE
CREATE TABLE IF NOT EXISTS public.property_visits (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  property_id text REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  owner_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text NOT NULL,
  visit_date date NOT NULL,
  visit_time text NOT NULL,
  notes text,
  status text DEFAULT 'pending', -- 'pending' | 'confirmed' | 'cancelled'
  created_at timestamptz DEFAULT now()
);

-- REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  property_id text REFERENCES public.properties(id) ON DELETE CASCADE,
  mess_id text REFERENCES public.messes(id) ON DELETE CASCADE,
  rating numeric NOT NULL,
  comment text,
  created_at timestamptz DEFAULT now()
);

-- APP NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.app_notifications (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info',
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- FAVORITES TABLE
CREATE TABLE IF NOT EXISTS public.favorites (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  property_id text REFERENCES public.properties(id) ON DELETE CASCADE,
  mess_id text REFERENCES public.messes(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- 3. AUTOMATIC PROFILE CREATION TRIGGER ON AUTH.USERS
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role, is_profile_completed)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'student'),
    false
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- ENABLE RLS ON ALL TABLES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mess_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mess_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mess_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roommate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- PERMISSIVE RLS POLICIES FOR PUBLIC & AUTHENTICATED ACCESS
DROP POLICY IF EXISTS "Allow public read on profiles" ON public.profiles;
CREATE POLICY "Allow public read on profiles" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow user update profile" ON public.profiles;
CREATE POLICY "Allow user update profile" ON public.profiles FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public read on properties" ON public.properties;
CREATE POLICY "Allow public read on properties" ON public.properties FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow auth user insert/update properties" ON public.properties;
CREATE POLICY "Allow auth user insert/update properties" ON public.properties FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public read on messes" ON public.messes;
CREATE POLICY "Allow public read on messes" ON public.messes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow auth user insert/update messes" ON public.messes;
CREATE POLICY "Allow auth user insert/update messes" ON public.messes FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public read on mess_plans" ON public.mess_plans;
CREATE POLICY "Allow public read on mess_plans" ON public.mess_plans FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow auth user all mess_plans" ON public.mess_plans;
CREATE POLICY "Allow auth user all mess_plans" ON public.mess_plans FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow auth user all subscriptions" ON public.mess_subscriptions;
CREATE POLICY "Allow auth user all subscriptions" ON public.mess_subscriptions FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow auth user all attendance" ON public.mess_attendance;
CREATE POLICY "Allow auth user all attendance" ON public.mess_attendance FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public read on roommates" ON public.roommate_profiles;
CREATE POLICY "Allow public read on roommates" ON public.roommate_profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow auth user all roommates" ON public.roommate_profiles;
CREATE POLICY "Allow auth user all roommates" ON public.roommate_profiles FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public read on community" ON public.community_posts;
CREATE POLICY "Allow public read on community" ON public.community_posts FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow auth user all community" ON public.community_posts;
CREATE POLICY "Allow auth user all community" ON public.community_posts FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow auth user all visits" ON public.property_visits;
CREATE POLICY "Allow auth user all visits" ON public.property_visits FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public read on reviews" ON public.reviews;
CREATE POLICY "Allow public read on reviews" ON public.reviews FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow auth user all reviews" ON public.reviews;
CREATE POLICY "Allow auth user all reviews" ON public.reviews FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow auth user all notifications" ON public.app_notifications;
CREATE POLICY "Allow auth user all notifications" ON public.app_notifications FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow auth user all favorites" ON public.favorites;
CREATE POLICY "Allow auth user all favorites" ON public.favorites FOR ALL USING (true);

-- ============================================================
-- 5. SAMPLE SEED DATA FOR DEMO & TESTING
-- ============================================================

INSERT INTO public.properties (id, title, owner_name, description, property_type, rent, deposit, address, city, state, pincode, availability, verified, featured, rating, review_count, images, amenities)
VALUES 
(
  'prop-sample-1',
  'Skyline Luxury PG for Boys',
  'Rajesh Sharma',
  'Premium fully furnished PG near Ferguson College with Wi-Fi, 3 meals daily, daily housekeeping, and 24/7 security.',
  'pg',
  8500,
  15000,
  'FC Road, Near Goodluck Cafe',
  'Pune',
  'Maharashtra',
  '411004',
  true,
  true,
  true,
  4.8,
  24,
  ARRAY['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80'],
  '{"wifi": true, "ac": true, "food": true, "cleaning": true, "laundry": true}'::jsonb
),
(
  'prop-sample-2',
  'Serenity Women Hostel & PG',
  'Priya Deshmukh',
  'Safe, homely hostel for female students and working professionals. Includes biometric entrance and study room.',
  'hostel',
  7200,
  10000,
  'Kothrud, Opposite MIT College',
  'Pune',
  'Maharashtra',
  '411038',
  true,
  true,
  false,
  4.6,
  18,
  ARRAY['https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80'],
  '{"wifi": true, "ac": false, "food": true, "security": true}'::jsonb
),
(
  'prop-sample-3',
  'Modern 2BHK Apartment for Students',
  'Sanjay Kulkarni',
  'Spacious 2BHK flat available for rent. Ideal for group of 4 students. Kitchen equipped with gas stove & fridge.',
  'flat',
  18000,
  35000,
  'Viman Nagar, Near Symbiosis Campus',
  'Pune',
  'Maharashtra',
  '411014',
  true,
  true,
  true,
  4.9,
  31,
  ARRAY['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'],
  '{"wifi": true, "parking": true, "fridge": true, "washing_machine": true}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.messes (id, name, description, address, city, food_type, monthly_charge, per_meal_charge, verified, featured, rating, review_count, photos, meal_types)
VALUES
(
  'mess-sample-1',
  'Annapurna Homely Mess',
  'Authentic Maharashtrian and North Indian thali. Unlimited chapati and rice.',
  'FC Road, Opposite Garware College',
  'Pune',
  'both',
  3200,
  80,
  true,
  true,
  4.7,
  45,
  ARRAY['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'],
  ARRAY['lunch', 'dinner']
),
(
  'mess-sample-2',
  'Green Leaf Pure Veg Mess',
  'Hygienic 100% vegetarian meal service. Special Sunday feast menu included.',
  'Kothrud, Near Karve Statue',
  'Pune',
  'veg',
  2800,
  70,
  true,
  false,
  4.5,
  29,
  ARRAY['https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80'],
  ARRAY['breakfast', 'lunch', 'dinner']
)
ON CONFLICT (id) DO NOTHING;

-- Done!
