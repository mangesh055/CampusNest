-- ============================================================
-- SQL Trigger to Automatically Update Property AND Mess Ratings
-- ============================================================

-- 1. Create the trigger function
CREATE OR REPLACE FUNCTION update_rating_trigger()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating numeric;
  total_reviews integer;
  target_property_id text;
  target_mess_id text;
BEGIN
  -- Determine IDs based on the operation
  IF TG_OP = 'DELETE' THEN
    target_property_id := OLD.property_id;
    target_mess_id := OLD.mess_id;
  ELSE
    target_property_id := NEW.property_id;
    target_mess_id := NEW.mess_id;
  END IF;

  -- 1. Update Properties Table if it's a property review
  IF target_property_id IS NOT NULL THEN
    SELECT COALESCE(ROUND(AVG(rating), 1), 5.0), COUNT(*)
    INTO avg_rating, total_reviews
    FROM public.reviews
    WHERE property_id = target_property_id;

    UPDATE public.properties
    SET rating = avg_rating, review_count = total_reviews
    WHERE id = target_property_id;
  END IF;

  -- 2. Update Messes Table if it's a mess review
  IF target_mess_id IS NOT NULL THEN
    SELECT COALESCE(ROUND(AVG(rating), 1), 5.0), COUNT(*)
    INTO avg_rating, total_reviews
    FROM public.reviews
    WHERE mess_id = target_mess_id;

    UPDATE public.messes
    SET rating = avg_rating, review_count = total_reviews
    WHERE id = target_mess_id;
  END IF;

  RETURN NULL; -- AFTER triggers return NULL
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Attach the trigger to the reviews table
DROP TRIGGER IF EXISTS trg_update_rating ON public.reviews;
-- Clean up old trigger
DROP TRIGGER IF EXISTS trg_update_property_rating ON public.reviews;

CREATE TRIGGER trg_update_rating
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION update_rating_trigger();

-- 3. One-time Sync: Update all existing properties AND messes
UPDATE public.properties p
SET 
  rating = COALESCE((SELECT ROUND(AVG(rating), 1) FROM public.reviews r WHERE r.property_id = p.id), 5.0),
  review_count = (SELECT COUNT(*) FROM public.reviews r WHERE r.property_id = p.id);

UPDATE public.messes m
SET 
  rating = COALESCE((SELECT ROUND(AVG(rating), 1) FROM public.reviews r WHERE r.mess_id = m.id), 5.0),
  review_count = (SELECT COUNT(*) FROM public.reviews r WHERE r.mess_id = m.id);
