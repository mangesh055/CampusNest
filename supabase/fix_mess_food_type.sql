-- Migration: Add food_type to messes table
-- Options: 'veg', 'non_veg', 'both'

ALTER TABLE messes ADD COLUMN IF NOT EXISTS food_type text DEFAULT 'both';

-- Force any existing null or invalid values to 'both' to be safe
UPDATE messes SET food_type = 'both' WHERE food_type IS NULL OR food_type NOT IN ('veg', 'non_veg', 'both');
