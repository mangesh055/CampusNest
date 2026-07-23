-- ============================================================
-- ADD OWNER_NAME COLUMN TO PROPERTIES TABLE FOR DYNAMIC OWNER CONTACT
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================================

ALTER TABLE IF EXISTS public.properties
ADD COLUMN IF NOT EXISTS owner_name text;
