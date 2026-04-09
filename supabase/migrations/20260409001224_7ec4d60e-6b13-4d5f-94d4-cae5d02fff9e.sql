ALTER TABLE public.contact_submissions
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS website text,
ADD COLUMN IF NOT EXISTS pain_area text,
ADD COLUMN IF NOT EXISTS interest text;