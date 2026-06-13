-- Wishlist requests — captured when a business "claims" their tailored spec.
-- Part C of the launch brief. (The brief referenced wishlist-schema.sql, which
-- was not present in the repo, so this defines the canonical table.)

BEGIN;

CREATE TABLE IF NOT EXISTS public.wishlist_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  business text NOT NULL,
  wish text NOT NULL,
  spec jsonb NOT NULL DEFAULT '{}'::jsonb,   -- the tailored WishlistSpec snapshot
  source text,
  consent boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS wishlist_requests_email_idx ON public.wishlist_requests (email);
CREATE INDEX IF NOT EXISTS wishlist_requests_created_at_idx ON public.wishlist_requests (created_at DESC);

-- RLS: open INSERT for anon (the claim form), no public read. Service role only.
ALTER TABLE public.wishlist_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS wishlist_requests_insert_anon ON public.wishlist_requests;
CREATE POLICY wishlist_requests_insert_anon ON public.wishlist_requests
  FOR INSERT TO anon, authenticated WITH CHECK (true);

COMMIT;
