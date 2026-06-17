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

-- An earlier migration (20260507100000) already created a DIFFERENT
-- public.vessel_generations, so the `create table if not exists` above no-ops
-- on a fresh replay and the index below would reference missing columns. Add
-- them idempotently (all nullable here). No-op where they already exist.
alter table public.vessel_generations add column if not exists ip_hash text;
alter table public.vessel_generations add column if not exists prompt text;
alter table public.vessel_generations add column if not exists fal_request_id text;
alter table public.vessel_generations add column if not exists cost_usd_estimate numeric(8,4);
alter table public.vessel_generations add column if not exists created_at timestamptz default now();

CREATE INDEX IF NOT EXISTS idx_vessel_gen_ip_created
  ON public.vessel_generations (ip_hash, created_at DESC);
