CREATE TABLE IF NOT EXISTS public.vessel_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash TEXT,
  prompt TEXT,
  aspect_ratio TEXT,
  model TEXT,
  fal_request_id TEXT,
  cost_usd_estimate NUMERIC(8,4),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vessel_gen_ip_created
  ON public.vessel_generations (ip_hash, created_at DESC);
