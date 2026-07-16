-- Run this in your Supabase SQL Editor to add the missing columns
ALTER TABLE public.messes ADD COLUMN IF NOT EXISTS google_maps_url text;
ALTER TABLE public.messes ADD COLUMN IF NOT EXISTS photos text[];
