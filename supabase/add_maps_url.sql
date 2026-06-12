-- Run this in your Supabase SQL Editor to add the Google Maps URL fields
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS google_maps_url text;
ALTER TABLE public.messes ADD COLUMN IF NOT EXISTS google_maps_url text;
