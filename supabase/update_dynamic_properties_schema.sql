-- ============================================================
-- DATABASE SCHEMA MIGRATION: DYNAMIC PROPERTY CONFIGURATIONS
-- Run this script in Supabase Dashboard > SQL Editor
-- ============================================================

-- Add new JSONB and URL columns to public.properties table
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS sharing_configs jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS flat_config jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS hostel_config jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS pg_config jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS video_url text,
  ADD COLUMN IF NOT EXISTS google_maps_url text;

-- Comment on columns for Supabase documentation
COMMENT ON COLUMN public.properties.sharing_configs IS 'JSON Array of multi-sharing room tier configurations (sharing_type, rent, deposit, available_beds, total_beds, attached_bathroom, ac, balcony, study_desk, personal_wardrobe, images, video_url)';
COMMENT ON COLUMN public.properties.flat_config IS 'JSON Object for flat layout (bhk_type, furnishing, maintenance_charges, maintenance_type, tenant_preference, parking_type, floor_number, total_floors)';
COMMENT ON COLUMN public.properties.hostel_config IS 'JSON Object for hostel details (warden_phone, curfew_time, category_configs, mess_option, meals_offered)';
COMMENT ON COLUMN public.properties.pg_config IS 'JSON Object for PG details (sharing_configs, food_option, food_type, curfew_time, housekeeping, laundry)';
COMMENT ON COLUMN public.properties.video_url IS 'Direct URL or Cloudinary video link for virtual property walkthrough';
COMMENT ON COLUMN public.properties.google_maps_url IS 'Direct Google Maps web link for property navigation';
