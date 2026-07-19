-- ============================================================
-- SQL Functions for updating Property Statistics (Bypasses RLS)
-- ============================================================

-- Function to safely increment property views
CREATE OR REPLACE FUNCTION increment_property_views(property_id text)
RETURNS void AS $$
BEGIN
  UPDATE public.properties
  SET views = COALESCE(views, 0) + 1
  WHERE id = property_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to safely update property rating and review count
CREATE OR REPLACE FUNCTION update_property_rating(property_id text, new_rating numeric, new_count integer)
RETURNS void AS $$
BEGIN
  UPDATE public.properties
  SET 
    rating = new_rating,
    review_count = new_count,
    updated_at = NOW()
  WHERE id = property_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
