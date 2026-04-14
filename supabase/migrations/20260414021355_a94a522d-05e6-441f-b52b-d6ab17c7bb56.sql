
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS notify_channel text DEFAULT 'sms',
  ADD COLUMN IF NOT EXISTS notify_enabled boolean DEFAULT false;
