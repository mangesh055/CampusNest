-- ============================================================
-- RUN THIS ENTIRE SCRIPT IN YOUR SUPABASE SQL EDITOR
-- Go to: Supabase Dashboard → SQL Editor → New Query → Paste → Run
-- ============================================================

-- Step 1: Create the notifications table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.app_notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  read boolean DEFAULT false,
  link text,
  created_at timestamptz DEFAULT now()
);

-- Step 2: Enable Row Level Security
ALTER TABLE public.app_notifications ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop old/broken policies if they exist
DROP POLICY IF EXISTS "Users can view their own notifications" ON app_notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON app_notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON app_notifications;
DROP POLICY IF EXISTS "Admins can insert notifications" ON app_notifications;
DROP POLICY IF EXISTS "Authenticated users can insert notifications for others" ON app_notifications;
DROP POLICY IF EXISTS "Authenticated users can insert any notification" ON app_notifications;
DROP POLICY IF EXISTS "Service role can insert any notification" ON app_notifications;

-- Step 4: Create correct policies

-- Users can only read their own notifications
CREATE POLICY "Users can view their own notifications"
  ON app_notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Users can mark their own notifications as read
CREATE POLICY "Users can update their own notifications"
  ON app_notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- ✅ CRITICAL: Users can delete their own notifications
-- Without this, deleted notifications come back on refresh!
CREATE POLICY "Users can delete their own notifications"
  ON app_notifications FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ANY authenticated user (including mess owners) can send notifications to any user
-- This is needed so mess owners can notify students when assigning plans
CREATE POLICY "Authenticated users can insert any notification"
  ON app_notifications FOR INSERT TO authenticated
  WITH CHECK (true);

-- Step 5: Enable Realtime on app_notifications
-- This makes live notification delivery work instantly
ALTER PUBLICATION supabase_realtime ADD TABLE public.app_notifications;

-- Step 6: Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_app_notifications_user_id ON app_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_app_notifications_created_at ON app_notifications(created_at DESC);

-- ============================================================
-- DONE! After running this script:
-- 1. Supabase Dashboard → Database → Replication
-- 2. Make sure "app_notifications" table is checked/enabled
-- ============================================================
