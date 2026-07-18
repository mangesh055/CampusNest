-- 1. First, delete all authentication users. 
-- (This usually cascades and deletes most of the data in your public tables if foreign keys are set to CASCADE)
DELETE FROM auth.users;

-- 2. Truncate the profiles table and CASCADE. 
-- CASCADE ensures that all related records (messes, posts, etc) are automatically deleted as well.
TRUNCATE TABLE public.profiles CASCADE;
