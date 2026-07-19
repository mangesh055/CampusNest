-- Add daily_scan_limit to mess_plans
ALTER TABLE mess_plans ADD COLUMN IF NOT EXISTS daily_scan_limit INT;
