-- Add mess_id to student_attendance if it doesn't exist
ALTER TABLE public.student_attendance ADD COLUMN IF NOT EXISTS mess_id text REFERENCES public.messes(id) ON DELETE CASCADE;

-- Add remaining_days to student_subscriptions if it doesn't exist
ALTER TABLE public.student_subscriptions ADD COLUMN IF NOT EXISTS remaining_days integer DEFAULT 30;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
