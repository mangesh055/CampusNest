-- ============================================================
-- CREATE PROPERTY VISITS TABLE FOR CAMPUSNEST / FLATSNFOOD
-- Run this in Supabase Dashboard > SQL Editor to create the visits table
-- ============================================================

-- Drop FK constraint if it exists from previous run to avoid foreign key errors
ALTER TABLE IF EXISTS public.property_visits DROP CONSTRAINT IF EXISTS property_visits_property_id_fkey;

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
  status text DEFAULT 'pending', -- 'pending', 'accepted', 'declined', 'completed'
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.property_visits ENABLE ROW LEVEL SECURITY;

-- 1. Select Policy - Allow all users to read visit requests
DROP POLICY IF EXISTS "property_visits_select_policy" ON public.property_visits;
CREATE POLICY "property_visits_select_policy" ON public.property_visits
  FOR SELECT USING (true);

-- 2. Insert Policy - Allow users to submit visit requests
DROP POLICY IF EXISTS "property_visits_insert_policy" ON public.property_visits;
CREATE POLICY "property_visits_insert_policy" ON public.property_visits
  FOR INSERT WITH CHECK (true);

-- 3. Update Policy - Allow owners to accept/decline visit requests
DROP POLICY IF EXISTS "property_visits_update_policy" ON public.property_visits;
CREATE POLICY "property_visits_update_policy" ON public.property_visits
  FOR UPDATE USING (true);

-- 4. Delete Policy - Allow deleting visit requests
DROP POLICY IF EXISTS "property_visits_delete_policy" ON public.property_visits;
CREATE POLICY "property_visits_delete_policy" ON public.property_visits
  FOR DELETE USING (true);

-- Insert Sample Initial Mock Visits for Testing
INSERT INTO public.property_visits (id, property_id, property_title, property_image, owner_id, student_id, student_name, student_phone, visit_date, day_label, time_slot, status)
VALUES
  ('visit-101', 'prop-1', 'Sunrise Heights Luxury PG', 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600', 'owner1', 'student-1', 'Rahul Sharma', '9876543210', 'Jul 24, 2026', 'Tomorrow', '11:00 AM', 'pending'),
  ('visit-102', 'prop-2', 'Green View 2BHK Apartment', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600', 'owner1', 'student-2', 'Ananya Patel', '9812345678', 'Jul 25, 2026', 'Sat', '03:00 PM', 'accepted'),
  ('visit-103', 'prop-1', 'Sunrise Heights Luxury PG', 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600', 'owner1', 'student-3', 'Vikas Kulkarni', '9765432109', 'Jul 26, 2026', 'Sun', '06:00 PM', 'pending')
ON CONFLICT (id) DO NOTHING;
