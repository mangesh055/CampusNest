-- Add analytics columns to properties table
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS views integer DEFAULT 0;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS inquiries integer DEFAULT 0;
