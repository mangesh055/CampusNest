-- 1. Add the missing columns to the messes table (if they don't exist)
ALTER TABLE public.messes
ADD COLUMN IF NOT EXISTS rating numeric DEFAULT 5.0,
ADD COLUMN IF NOT EXISTS review_count integer DEFAULT 0;

-- 2. Create the Trigger Function to auto-calculate rating and count
CREATE OR REPLACE FUNCTION update_mess_rating_trigger()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating numeric;
  total_reviews integer;
  target_mess_id text;
BEGIN
  -- Determine the mess_id based on the operation
  IF TG_OP = 'DELETE' THEN
    target_mess_id := OLD.mess_id;
  ELSE
    target_mess_id := NEW.mess_id;
  END IF;

  -- Only run if this review actually belongs to a mess
  IF target_mess_id IS NOT NULL THEN
    SELECT COALESCE(ROUND(AVG(rating), 1), 5.0), COUNT(*)
    INTO avg_rating, total_reviews
    FROM public.reviews
    WHERE mess_id = target_mess_id;

    -- Update the messes table
    UPDATE public.messes
    SET rating = avg_rating, review_count = total_reviews
    WHERE id = target_mess_id;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Attach the trigger to the reviews table
DROP TRIGGER IF EXISTS trg_update_mess_rating_on_reviews ON public.reviews;

CREATE TRIGGER trg_update_mess_rating_on_reviews
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION update_mess_rating_trigger();

-- 4. One-Time Sync: Calculate for all existing messes!
UPDATE public.messes m
SET 
  rating = COALESCE((SELECT ROUND(AVG(rating), 1) FROM public.reviews r WHERE r.mess_id = m.id), 5.0),
  review_count = (SELECT COUNT(*) FROM public.reviews r WHERE r.mess_id = m.id);
