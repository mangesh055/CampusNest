-- Add total_meals column to mess_plans
ALTER TABLE public.mess_plans ADD COLUMN IF NOT EXISTS total_meals integer;

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
