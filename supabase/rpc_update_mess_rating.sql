-- SQL Function to securely update the rating and review count of a mess
-- This runs with SECURITY DEFINER, allowing it to bypass Row Level Security (RLS)
-- so that any authenticated user (like a student) can submit a review and update the mess stats.

CREATE OR REPLACE FUNCTION update_mess_rating(mess_id text, new_rating numeric, new_count integer)
RETURNS void AS $$
BEGIN
  UPDATE public.messes
  SET 
    rating = new_rating,
    review_count = new_count
  WHERE id = mess_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
