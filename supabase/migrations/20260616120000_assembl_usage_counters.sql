-- Access gating counters — discoverability without entitlement.
--
-- One row per (identity, surface, UTC day). `identity_hash` is
-- sha256(long-lived cookie id + client IP + salt) so we never store a raw IP.
-- Anonymous and email-captured visitors are both counted here; paid customers
-- are never gated (the server short-circuits before touching this table).
--
-- Surfaces are namespaced strings: 'hapai:<slug>', 'chat:<kete>',
-- 'agent:<kete>:<agent>', 'workflow:<slug>'.

BEGIN;

CREATE TABLE IF NOT EXISTS public.assembl_usage_counters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identity_hash text NOT NULL,
  surface text NOT NULL,
  window_date date NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (identity_hash, surface, window_date)
);

CREATE INDEX IF NOT EXISTS assembl_usage_counters_lookup_idx
  ON public.assembl_usage_counters (identity_hash, surface, window_date);

-- Atomic read-modify-write so concurrent requests from the same identity can't
-- race past the cap. Returns the new count after incrementing.
CREATE OR REPLACE FUNCTION public.assembl_bump_usage(p_identity text, p_surface text)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  v_count integer;
BEGIN
  INSERT INTO public.assembl_usage_counters (identity_hash, surface, window_date, count)
  VALUES (p_identity, p_surface, (now() AT TIME ZONE 'utc')::date, 1)
  ON CONFLICT (identity_hash, surface, window_date)
  DO UPDATE SET count = public.assembl_usage_counters.count + 1, updated_at = now()
  RETURNING count INTO v_count;
  RETURN v_count;
END;
$$;

-- RLS: gating runs server-side via the service role only. No anon access.
ALTER TABLE public.assembl_usage_counters ENABLE ROW LEVEL SECURITY;

COMMIT;

-- Verification:
-- SELECT public.assembl_bump_usage('test-identity', 'hapai:wishlist');
-- SELECT * FROM public.assembl_usage_counters WHERE identity_hash = 'test-identity';
