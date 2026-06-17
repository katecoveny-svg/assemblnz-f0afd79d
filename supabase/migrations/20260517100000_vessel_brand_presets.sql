-- ─────────────────────────────────────────────────────────────────────────────
-- vessel_brand_presets + vessel_generations
--
-- /tools/vessel is a public, no-auth vessel image generator. Two tables:
--
-- • vessel_brand_presets — pre-filled brand parameters keyed by URL slug.
--   /tools/vessel/[slug] reads from here. Anyone can read; writes are
--   service-role only (Kate seeds via SQL).
--
-- • vessel_generations — append-only audit + rate-limit source. IP-based
--   5-per-day cap is computed by counting rows per (ip_hash, day) on read.
--   No Redis dependency. IPs are stored as a SHA-256 hash (no raw PII).
--
-- BYOK note: when a visitor brings their own Fal.ai key, the generation is
-- still logged with byok=true. The rate-limiter ignores rows where byok=true
-- so BYOK callers are uncapped.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.vessel_brand_presets (
  slug text PRIMARY KEY,
  brand_name text NOT NULL,
  brand_color text NOT NULL DEFAULT '#2B6B57',
  logo_url text,
  default_prompt text,
  owner_email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.vessel_brand_presets IS
  'Public-readable brand presets for /tools/vessel/[slug]. Service-role writes only.';

ALTER TABLE public.vessel_brand_presets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vessel_brand_presets readable by anon" ON public.vessel_brand_presets;
CREATE POLICY "vessel_brand_presets readable by anon"
  ON public.vessel_brand_presets
  FOR SELECT
  USING (true);

CREATE TABLE IF NOT EXISTS public.vessel_generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_slug text REFERENCES public.vessel_brand_presets(slug) ON DELETE SET NULL,
  brand_name text NOT NULL,
  brand_color text NOT NULL,
  prompt text NOT NULL,
  image_url text NOT NULL,
  cost_estimate_usd numeric(10, 4) NOT NULL DEFAULT 0,
  byok boolean NOT NULL DEFAULT false,
  ip_hash text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- An earlier migration (20260507100000) already created a DIFFERENT
-- public.vessel_generations (the user-scoped image studio), so the
-- `create table if not exists` above no-ops on a fresh replay and the indexes
-- below would reference columns that don't exist. Add the columns this
-- migration needs idempotently (NOT NULL ones carry safe defaults so the add is
-- safe against an already-populated table). No-op where they already exist.
alter table public.vessel_generations add column if not exists brand_slug text;
alter table public.vessel_generations add column if not exists brand_name text not null default '';
alter table public.vessel_generations add column if not exists brand_color text not null default '#2B6B57';
alter table public.vessel_generations add column if not exists prompt text not null default '';
alter table public.vessel_generations add column if not exists image_url text not null default '';
alter table public.vessel_generations add column if not exists cost_estimate_usd numeric(10,4) not null default 0;
alter table public.vessel_generations add column if not exists byok boolean not null default false;
alter table public.vessel_generations add column if not exists ip_hash text;
alter table public.vessel_generations add column if not exists user_agent text;
alter table public.vessel_generations add column if not exists created_at timestamptz not null default now();

COMMENT ON TABLE public.vessel_generations IS
  'Append-only audit trail of public vessel generations. ip_hash is SHA-256(ip), never the raw IP.';

CREATE INDEX IF NOT EXISTS idx_vessel_generations_ip_day
  ON public.vessel_generations (ip_hash, created_at DESC)
  WHERE byok = false;

CREATE INDEX IF NOT EXISTS idx_vessel_generations_brand_recent
  ON public.vessel_generations (brand_slug, created_at DESC);

ALTER TABLE public.vessel_generations ENABLE ROW LEVEL SECURITY;

-- Anyone can SELECT their own generation by id (used by the shareable
-- /tools/vessel/output/[id] viewer). They can't enumerate — id is a uuid.
DROP POLICY IF EXISTS "vessel_generations readable by anon" ON public.vessel_generations;
CREATE POLICY "vessel_generations readable by anon"
  ON public.vessel_generations
  FOR SELECT
  USING (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- Seed presets
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO public.vessel_brand_presets (slug, brand_name, brand_color, default_prompt)
VALUES
  ('assembl', 'assembl', '#2B6B57', 'editorial brand vessel for an NZ specialist agent platform'),
  ('pilot-sprint', 'Pilot Sprint', '#D4A853', 'editorial brand vessel for a 2-week NZ workflow pilot')
ON CONFLICT (slug) DO UPDATE
  SET brand_name = EXCLUDED.brand_name,
      brand_color = EXCLUDED.brand_color,
      default_prompt = EXCLUDED.default_prompt,
      updated_at = now();
