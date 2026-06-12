-- Run this in Supabase SQL Editor to copy all existing users from auth.users into your new profiles table

INSERT INTO public.profiles (id, email, full_name, phone, role, created_at, updated_at)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'full_name', 'Unknown User'), 
  COALESCE(raw_user_meta_data->>'phone', ''), 
  COALESCE(raw_user_meta_data->>'role', 'student'), 
  created_at, 
  COALESCE(last_sign_in_at, created_at)
FROM auth.users
ON CONFLICT (id) DO NOTHING;
