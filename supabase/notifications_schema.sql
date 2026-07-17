-- Run this SQL in your Supabase Dashboard to create the notifications table

CREATE TABLE IF NOT EXISTS public.app_notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info',
  read boolean DEFAULT false,
  link text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.app_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON app_notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON app_notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can insert notifications"
  ON app_notifications FOR INSERT TO authenticated 
  WITH CHECK (
    auth.uid() = user_id OR 
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );
