-- Snapshot columns for student_subscriptions to prevent historical data loss if a plan is changed/deleted
ALTER TABLE public.student_subscriptions ADD COLUMN IF NOT EXISTS plan_name text;
ALTER TABLE public.student_subscriptions ADD COLUMN IF NOT EXISTS plan_description text;
ALTER TABLE public.student_subscriptions ADD COLUMN IF NOT EXISTS total_meals integer;

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
