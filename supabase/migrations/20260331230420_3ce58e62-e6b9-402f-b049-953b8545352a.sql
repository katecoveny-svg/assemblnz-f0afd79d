
CREATE TABLE public.toroa_waitlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'waiting'
);

ALTER TABLE public.toroa_waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can join waitlist"
  ON public.toroa_waitlist FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can count waitlist"
  ON public.toroa_waitlist FOR SELECT TO anon, authenticated
  USING (true);
