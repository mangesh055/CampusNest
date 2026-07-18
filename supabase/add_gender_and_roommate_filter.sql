-- Add gender column to profiles if it doesn't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender text;

-- Enable RLS on roommate_profiles if not already enabled
ALTER TABLE public.roommate_profiles ENABLE ROW LEVEL SECURITY;

-- Drop any existing SELECT policies that might conflict (optional, but good for clean slate)
-- DROP POLICY IF EXISTS "Anyone can view active roommate profiles" ON public.roommate_profiles;

-- Create a new SELECT policy that enforces gender matching
CREATE POLICY "Users can only view roommate profiles of their own gender"
ON public.roommate_profiles
FOR SELECT
USING (
  -- If user is logged in, their gender from `profiles` must match the `roommate_profiles.gender`
  -- If the user's gender is null or 'other', or they are an admin, you might want to allow it, 
  -- but per requirements: males see males, females see females.
  gender = (SELECT gender FROM public.profiles WHERE id = auth.uid())
);

-- Note: You may need to create a bypass policy for Admins if you have an admin dashboard:
-- CREATE POLICY "Admins can view all roommate profiles" ON public.roommate_profiles
-- FOR SELECT USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
