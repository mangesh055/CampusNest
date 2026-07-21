-- Add video_url column to properties table
ALTER TABLE properties ADD COLUMN IF NOT EXISTS video_url TEXT;
