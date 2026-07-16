-- ============================================================
-- CAMPUSNEST FULL BOOTSTRAP
-- Run this in Supabase SQL Editor after at least one auth user exists.
-- It creates the extra sample-data tables used by the app and seeds
-- all current mock/local sample records into Supabase tables.
-- ============================================================

-- ============================================================
-- EXISTING CORE TABLES
-- ============================================================
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

CREATE TABLE IF NOT EXISTS public.properties (
  id text PRIMARY KEY,
  owner_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
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
  amenities jsonb,
  google_maps_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

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
  google_maps_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
CREATE POLICY "profiles_select_policy"
  ON profiles FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
CREATE POLICY "profiles_insert_policy"
  ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
CREATE POLICY "profiles_update_policy"
  ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "messes_select_policy" ON messes;
CREATE POLICY "messes_select_policy"
  ON messes FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "messes_insert_policy" ON messes;
CREATE POLICY "messes_insert_policy"
  ON messes FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "messes_update_policy" ON messes;
CREATE POLICY "messes_update_policy"
  ON messes FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

DROP POLICY IF EXISTS "properties_select_policy" ON properties;
CREATE POLICY "properties_select_policy"
  ON properties FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "properties_insert_policy" ON properties;
CREATE POLICY "properties_insert_policy"
  ON properties FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "properties_update_policy" ON properties;
CREATE POLICY "properties_update_policy"
  ON properties FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- ============================================================
-- ADDITIONAL TABLES FOR CURRENT APP SAMPLE DATA
-- ============================================================
CREATE TABLE IF NOT EXISTS public.mess_plans (
  id text PRIMARY KEY,
  mess_id text NOT NULL REFERENCES public.messes(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  duration_days integer NOT NULL,
  meal_types text[] NOT NULL,
  is_custom boolean DEFAULT false,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.roommate_profiles (
  id text PRIMARY KEY,
  student_id text NOT NULL,
  budget_min integer NOT NULL,
  budget_max integer NOT NULL,
  city text NOT NULL,
  college text NOT NULL,
  branch text NOT NULL,
  gender text NOT NULL,
  food_preference text NOT NULL,
  smoking boolean NOT NULL DEFAULT false,
  sleep_schedule text NOT NULL,
  looking_for text NOT NULL,
  description text,
  active boolean NOT NULL DEFAULT true,
  full_name text,
  email text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.community_posts (
  id text PRIMARY KEY,
  author_id text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL,
  price numeric,
  likes integer NOT NULL DEFAULT 0,
  comment_count integer NOT NULL DEFAULT 0,
  full_name text,
  email text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.reviews (
  id text PRIMARY KEY,
  reviewer_id text NOT NULL,
  property_id text,
  mess_id text,
  rating numeric NOT NULL,
  comment text NOT NULL,
  full_name text,
  email text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.mess_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roommate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mess_plans_select_policy" ON mess_plans;
CREATE POLICY "mess_plans_select_policy"
  ON mess_plans FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "mess_plans_write_policy" ON mess_plans;
CREATE POLICY "mess_plans_write_policy"
  ON mess_plans FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "roommate_profiles_select_policy" ON roommate_profiles;
CREATE POLICY "roommate_profiles_select_policy"
  ON roommate_profiles FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "roommate_profiles_write_policy" ON roommate_profiles;
CREATE POLICY "roommate_profiles_write_policy"
  ON roommate_profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "community_posts_select_policy" ON community_posts;
CREATE POLICY "community_posts_select_policy"
  ON community_posts FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "community_posts_write_policy" ON community_posts;
CREATE POLICY "community_posts_write_policy"
  ON community_posts FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "reviews_select_policy" ON reviews;
CREATE POLICY "reviews_select_policy"
  ON reviews FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS public.community_comments (
  id text PRIMARY KEY,
  post_id text NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  author_id text NOT NULL,
  content text NOT NULL,
  full_name text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.mess_payment_settings (
  owner_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  upi_id text NOT NULL DEFAULT '',
  phone_number text DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.student_attendance (
  id text PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date date NOT NULL,
  breakfast boolean NOT NULL DEFAULT false,
  lunch boolean NOT NULL DEFAULT false,
  dinner boolean NOT NULL DEFAULT false,
  snack boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.active_tokens (
  id text PRIMARY KEY,
  meal text NOT NULL,
  is_guest boolean NOT NULL DEFAULT false,
  amount numeric,
  time text,
  date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.student_subscriptions (
  id text PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mess_id text NOT NULL REFERENCES public.messes(id) ON DELETE CASCADE,
  plan_id text NOT NULL REFERENCES public.mess_plans(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active',
  start_date date NOT NULL,
  end_date date NOT NULL,
  amount_paid numeric NOT NULL,
  payment_status text NOT NULL DEFAULT 'paid',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.mess_menus (
  id text PRIMARY KEY,
  owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date date NOT NULL,
  breakfast text[],
  lunch text[],
  dinner text[],
  snack text[],
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.mess_transactions (
  id text PRIMARY KEY,
  owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_name text NOT NULL,
  amount numeric NOT NULL,
  date date NOT NULL,
  method text NOT NULL,
  status text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mess_payment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.active_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mess_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mess_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "community_comments_select_policy" ON community_comments;
CREATE POLICY "community_comments_select_policy"
  ON community_comments FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "community_comments_write_policy" ON community_comments;
CREATE POLICY "community_comments_write_policy"
  ON community_comments FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "mess_payment_settings_select_policy" ON mess_payment_settings;
CREATE POLICY "mess_payment_settings_select_policy"
  ON mess_payment_settings FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "mess_payment_settings_write_policy" ON mess_payment_settings;
CREATE POLICY "mess_payment_settings_write_policy"
  ON mess_payment_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "student_attendance_select_policy" ON student_attendance;
CREATE POLICY "student_attendance_select_policy"
  ON student_attendance FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "student_attendance_write_policy" ON student_attendance;
CREATE POLICY "student_attendance_write_policy"
  ON student_attendance FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "active_tokens_select_policy" ON active_tokens;
CREATE POLICY "active_tokens_select_policy"
  ON active_tokens FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "active_tokens_write_policy" ON active_tokens;
CREATE POLICY "active_tokens_write_policy"
  ON active_tokens FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "student_subscriptions_select_policy" ON student_subscriptions;
CREATE POLICY "student_subscriptions_select_policy"
  ON student_subscriptions FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "student_subscriptions_write_policy" ON student_subscriptions;
CREATE POLICY "student_subscriptions_write_policy"
  ON student_subscriptions FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "mess_menus_select_policy" ON mess_menus;
CREATE POLICY "mess_menus_select_policy"
  ON mess_menus FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "mess_menus_write_policy" ON mess_menus;
CREATE POLICY "mess_menus_write_policy"
  ON mess_menus FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "mess_transactions_select_policy" ON mess_transactions;
CREATE POLICY "mess_transactions_select_policy"
  ON mess_transactions FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "mess_transactions_write_policy" ON mess_transactions;
CREATE POLICY "mess_transactions_write_policy"
  ON mess_transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "reviews_write_policy" ON reviews;
CREATE POLICY "reviews_write_policy"
  ON reviews FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- SEED EXISTING SUPABASE-RELATION TABLES
-- ============================================================
DO $$
DECLARE
  first_user_id uuid;
BEGIN
  SELECT id INTO first_user_id FROM auth.users ORDER BY created_at ASC LIMIT 1;

  IF first_user_id IS NULL THEN
    RAISE NOTICE 'No auth.users row found yet; skipping property/mess seed rows.';
    RETURN;
  END IF;

  -- Ensure the user actually exists in the profiles table to avoid foreign key constraint errors
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (first_user_id, 'seed_owner@example.com', 'Seed Owner', 'admin')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.properties
    (id, owner_id, title, description, property_type, rent, deposit, address, city, state, pincode, latitude, longitude, contact_phone, availability, gender_preference, total_rooms, available_rooms, verified, featured, rating, review_count, images, amenities, created_at, updated_at)
  VALUES
    ('prop-1', first_user_id, 'Sunshine PG for Boys – Near MIT College', 'Premium PG accommodation with all modern facilities. Clean, safe and student-friendly environment with 24/7 security and CCTV surveillance.', 'pg', 8500, 17000, '45/2 Kothrud, Near MIT College', 'Pune', 'Maharashtra', '411038', 18.5074, 73.8077, '+91 98765 43210', true, 'male', 20, 5, true, true, 4.5, 48, ARRAY['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600'], jsonb_build_object('wifi', true, 'ac', true, 'laundry', true, 'water', true, 'electricity', true, 'cctv', true, 'security', true, 'parking', false, 'attached_bathroom', false, 'study_table', true, 'furnished', true), '2024-01-15T10:00:00Z', '2024-01-15T10:00:00Z'),
    ('prop-2', first_user_id, 'Green Valley Girls Hostel – Viman Nagar', 'Comfortable and secure girls hostel with homely food, study areas, and excellent connectivity to colleges and IT hubs.', 'hostel', 7000, 14000, '12 Viman Nagar, Near Phoenix Mall', 'Pune', 'Maharashtra', '411014', 18.5642, 73.9017, '+91 87654 32109', true, 'female', 40, 8, true, false, 4.2, 32, ARRAY['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600'], jsonb_build_object('wifi', true, 'ac', false, 'laundry', true, 'water', true, 'electricity', true, 'cctv', true, 'security', true, 'parking', false, 'attached_bathroom', true, 'study_table', true, 'furnished', true), '2024-01-20T10:00:00Z', '2024-01-20T10:00:00Z'),
    ('prop-3', first_user_id, 'Modern 2BHK Flat – Baner Road', 'Spacious 2BHK flat perfect for 2 students. Fully furnished with modern kitchen, high-speed internet and peaceful neighborhood.', 'flat', 22000, 44000, '8 Baner Road, Above Cafe Coffee Day', 'Pune', 'Maharashtra', '411021', 18.5593, 73.7853, '+91 76543 21098', true, 'any', 2, 1, true, true, 4.8, 15, ARRAY['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600'], jsonb_build_object('wifi', true, 'ac', true, 'laundry', true, 'water', true, 'electricity', true, 'cctv', false, 'security', false, 'parking', true, 'attached_bathroom', true, 'study_table', true, 'furnished', true), '2024-02-01T10:00:00Z', '2024-02-01T10:00:00Z'),
    ('prop-4', first_user_id, 'Budget Shared Room – Hadapsar', 'Affordable shared accommodation for students on a budget. Clean, well-maintained with all basic amenities.', 'shared_room', 4500, 9000, 'Hadapsar, Near Infopark', 'Pune', 'Maharashtra', '411028', 18.5089, 73.9260, '+91 65432 10987', false, 'male', 10, 0, true, false, 3.8, 22, ARRAY['https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600'], jsonb_build_object('wifi', true, 'ac', false, 'laundry', false, 'water', true, 'electricity', true, 'cctv', false, 'security', false, 'parking', false, 'attached_bathroom', false, 'study_table', false, 'furnished', false), '2024-02-10T10:00:00Z', '2024-02-10T10:00:00Z'),
    ('prop-5', first_user_id, 'Elite Private Room – Wakad', 'Premium private room with attached bathroom, AC, and WiFi. Ideal for working professionals and students.', 'private_room', 12000, 24000, 'Wakad, Near Dmart', 'Pune', 'Maharashtra', '411057', 18.5985, 73.7619, '+91 54321 09876', true, 'any', 6, 2, true, false, 4.6, 9, ARRAY['https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600', 'https://images.unsplash.com/photo-1616047006789-b7af5afb8c20?w=600'], jsonb_build_object('wifi', true, 'ac', true, 'laundry', true, 'water', true, 'electricity', true, 'cctv', true, 'security', true, 'parking', true, 'attached_bathroom', true, 'study_table', true, 'furnished', true), '2024-02-15T10:00:00Z', '2024-02-15T10:00:00Z'),
    ('prop-6', first_user_id, 'Campus View Hostel – Hinjewadi', 'Budget-friendly hostel with great connectivity to IT parks and engineering colleges. Community living with great atmosphere.', 'hostel', 5500, 11000, 'Hinjewadi Phase 1, IT Park Road', 'Pune', 'Maharashtra', '411057', 18.5974, 73.7381, '+91 43210 98765', true, 'male', 60, 12, true, false, 4.0, 67, ARRAY['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600'], jsonb_build_object('wifi', true, 'ac', false, 'laundry', true, 'water', true, 'electricity', true, 'cctv', true, 'security', true, 'parking', true, 'attached_bathroom', false, 'study_table', true, 'furnished', false), '2024-03-01T10:00:00Z', '2024-03-01T10:00:00Z')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.messes
    (id, owner_id, name, description, address, city, state, latitude, longitude, contact_phone, monthly_charge, per_meal_charge, status, verified, featured, rating, review_count, photos, meal_types, created_at, updated_at)
  VALUES
    ('m1', first_user_id, 'Maa Ki Rasoi', 'Authentic home-cooked meals with a warm family atmosphere. Daily fresh vegetables, pure ghee rotis and nutritious food.', 'Kothrud, Near Garware College', 'Pune', 'Maharashtra', 18.5074, 73.8077, '+91 98765 11111', 3500, 80, 'open', true, true, 4.7, 124, ARRAY['https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600', 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600'], ARRAY['breakfast', 'lunch', 'dinner'], '2024-01-01T10:00:00Z', '2024-01-01T10:00:00Z'),
    ('m2', first_user_id, 'Student Bite', 'Affordable and hygienic mess service specifically designed for college students. Unlimited meals, great taste.', 'Viman Nagar, Near D-Mart', 'Pune', 'Maharashtra', 18.5642, 73.9017, '+91 87654 22222', 2800, 60, 'open', true, false, 4.3, 89, ARRAY['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600', 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=600'], ARRAY['lunch', 'dinner'], '2024-01-10T10:00:00Z', '2024-01-10T10:00:00Z'),
    ('m3', first_user_id, 'Tiffin Express', 'Premium tiffin service with delivery option. Fresh, hot meals prepared by experienced chefs. Jain food available.', 'Baner, Near Anand Nagar', 'Pune', 'Maharashtra', 18.5593, 73.7853, '+91 76543 33333', 4200, 100, 'busy', true, true, 4.9, 56, ARRAY['https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600'], ARRAY['breakfast', 'lunch', 'dinner', 'snack'], '2024-01-20T10:00:00Z', '2024-01-20T10:00:00Z'),
    ('m4', first_user_id, 'Sharma Bhojanalaya', 'Traditional Rajasthani and North Indian thali. Dal baati churma, kadhi pakoda and more authentic dishes.', 'Wakad, Near IT Park', 'Pune', 'Maharashtra', 18.5985, 73.7619, '+91 65432 44444', 3000, 70, 'closed', false, false, 4.1, 41, ARRAY['https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600'], ARRAY['lunch', 'dinner'], '2024-02-01T10:00:00Z', '2024-02-01T10:00:00Z')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.mess_plans (id, mess_id, name, description, price, duration_days, meal_types, is_custom, active, created_at)
  VALUES
    ('p1', 'm1', 'Full Day Plan', 'Breakfast + Lunch + Dinner. Best value for money!', 3500, 30, ARRAY['breakfast', 'lunch', 'dinner'], false, true, '2024-01-01T10:00:00Z'),
    ('p2', 'm1', 'Lunch Plan', 'Lunch only. Perfect for hostel students.', 1800, 30, ARRAY['lunch'], false, true, '2024-01-01T10:00:00Z'),
    ('p3', 'm1', 'Dinner Plan', 'Dinner only. Great for working students.', 1500, 30, ARRAY['dinner'], false, true, '2024-01-01T10:00:00Z'),
    ('p4', 'm1', 'Lunch + Dinner', 'Two meals per day combo.', 2800, 30, ARRAY['lunch', 'dinner'], false, true, '2024-01-01T10:00:00Z')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.roommate_profiles
    (id, student_id, budget_min, budget_max, city, college, branch, gender, food_preference, smoking, sleep_schedule, looking_for, description, active, full_name, email, created_at)
  VALUES
    ('room-1', 'stud-1', 4000, 7000, 'Pune', 'MIT WPU', 'Computer Science', 'male', 'veg', false, 'night_owl', 'flat', 'Looking for a flatmate in Kothrud. I stay up late studying or coding. Prefer someone clean and quiet.', true, 'Rahul Sharma', 'rahul@example.com', now()),
    ('room-2', 'stud-2', 5000, 9000, 'Pune', 'VIT Pune', 'Mechanical Engineering', 'male', 'both', false, 'flexible', 'pg', 'Hey! Friendly guy here. Looking for a room partner in VIT hostel or PG nearby. Love gaming and football.', true, 'Amit Deshmukh', 'amit@example.com', now()),
    ('room-3', 'stud-3', 6000, 10000, 'Pune', 'COEP Tech', 'Electronics', 'female', 'veg', false, 'early_bird', 'flat', 'Looking to rent a 2BHK flat in Shivajinagar. I am clean, organized, and wake up early. Looking for a female flatmate.', true, 'Priya Joshi', 'priya@example.com', now()),
    ('room-4', 'stud-4', 3000, 6000, 'Pune', 'Pune University', 'MBA', 'female', 'both', false, 'flexible', 'any', 'Looking for budget-friendly housing near PU. I am social, love cooking, and open to flat sharing or PG rooms.', true, 'Sneha Patel', 'sneha@example.com', now()),
    ('r1', 's1', 5000, 8000, 'Pune', 'MIT College of Engineering', 'Computer Science', 'male', 'veg', false, 'night_owl', 'flat', 'Final year CSE student, clean and organized. Looking for a studious roommate.', true, null, null, '2024-03-01T10:00:00Z'),
    ('r2', 's2', 4000, 6000, 'Pune', 'Pune University', 'MBA', 'female', 'both', false, 'early_bird', 'pg', 'MBA student, friendly and responsible. Love cooking and movies on weekends.', true, null, null, '2024-03-05T10:00:00Z'),
    ('r3', 's3', 6000, 10000, 'Pune', 'Symbiosis', 'Engineering', 'male', 'non-veg', false, 'flexible', 'flat', 'Engineering student who loves gaming and sports. Looking for a chill roommate.', true, null, null, '2024-03-10T10:00:00Z')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.community_posts
    (id, author_id, title, content, category, price, likes, comment_count, full_name, email, created_at)
  VALUES
    ('post-1', 'stud-1', 'Selling 3rd Semester IT Notes (Covers DS, OOP, DLD)', 'Complete handwritten and typed notes with exam solutions. Very neat and easy to understand. Price is negotiable.', 'notes', 150, 12, 3, 'Rahul Sharma', 'rahul@example.com', '2026-07-16T03:00:00Z'),
    ('post-2', 'stud-2', 'Hero Sprint Cycle for Sale - Good Condition', 'Bought last year. Single-owner, 18-speed gears. Perfect for college commuting. Rear tyre is newly replaced.', 'cycles', 3200, 24, 2, 'Amit Deshmukh', 'amit@example.com', '2026-07-15T22:00:00Z'),
    ('post-3', 'admin-1', 'Important: Hostel In-time Extended to 10:30 PM', 'Official notice from college administration: The weekend hostel curfew has been extended starting this Friday. Please carry your student IDs.', 'announcements', null, 56, 1, 'Campus Administrator', 'admin@demo.com', '2026-07-15T02:00:00Z'),
    ('post-4', 'stud-3', 'Hiring React Native Intern at Campus Startup', 'Looking for a student intern who has built at least one React Native app. Stipend: ₹8,000/month. 3 months duration. Flexible hours.', 'events', 8000, 18, 0, 'Priya Joshi', 'priya@example.com', '2026-07-14T20:00:00Z'),
    ('cp1', 's1', 'Selling Data Structures & Algorithms book – Cormen', 'Selling CLRS (Introduction to Algorithms) 3rd edition. Book is in excellent condition, minimal highlighting. Price: ₹800 (original: ₹2000)', 'books', 800, 12, 5, 'Rahul Sharma', 'rahul@example.com', '2024-03-15T10:00:00Z'),
    ('cp2', 's2', 'Bicycle for Sale – Hero Sprint', 'Selling my Hero Sprint bicycle, used for 1 year. Perfect condition, new tyres, good brakes. Ideal for campus commute.', 'cycles', 3500, 8, 3, 'Priya Patel', 'priya@example.com', '2024-03-12T10:00:00Z'),
    ('cp3', 's3', '📢 Cultural Fest – TechFusion 2024', 'Annual Cultural & Technical Fest happening on 25th March! Coding competitions, dance, music, and lots of prizes. All students welcome!', 'events', null, 45, 18, 'Aarav Deshmukh', 'aarav@example.com', '2024-03-10T10:00:00Z'),
    ('cp4', 's4', 'Machine Learning Notes – Complete Semester', 'Sharing complete handwritten notes for Machine Learning (Mumbai University syllabus). Covers all units with examples and past papers.', 'notes', null, 67, 22, 'Neha Kulkarni', 'neha@example.com', '2024-03-08T10:00:00Z')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.reviews
    (id, reviewer_id, property_id, mess_id, rating, comment, full_name, email, created_at)
  VALUES
    ('rv1', 's1', '1', null, 5, 'Amazing place! The owner is very cooperative and the facilities are top-notch. WiFi speed is great and the room is always clean.', 'Rahul Sharma', 'rahul@example.com', '2024-02-20T10:00:00Z'),
    ('rv2', 's2', '1', null, 4, 'Good location, close to college. Minor maintenance issues but overall a great experience. Recommend to all students!', 'Priya Patel', 'priya@example.com', '2024-02-15T10:00:00Z'),
    ('r1', 'anon-1', null, 'm1', 5, 'Amazing food! Best mess in the area. Pure ghee rotis are a delight.', 'Rahul S.', null, '2026-03-12T00:00:00Z'),
    ('r2', 'anon-2', null, 'm1', 4, 'Great value for money. Lunch is always fresh and tasty. Highly recommend.', 'Priya M.', null, '2026-03-08T00:00:00Z'),
    ('r3', 'anon-3', null, 'm1', 5, 'Been eating here for 6 months. Never disappointed. Owner is very cooperative.', 'Arjun K.', null, '2026-03-01T00:00:00Z')
  ON CONFLICT (id) DO NOTHING;
END $$;
