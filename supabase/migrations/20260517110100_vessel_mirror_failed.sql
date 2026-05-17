-- ─────────────────────────────────────────────────────────────────────────────
-- vessel_generations.mirror_failed
--
-- The /tools/vessel route handler now mirrors every Fal.ai image into the
-- `vessel-generations` Supabase Storage bucket so shareable links and OG
-- meta tags survive Fal URL expiry. When the mirror upload throws, we still
-- persist the row with the Fal URL and flip `mirror_failed=true` so a future
-- retry cron can sweep them.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.vessel_generations
  ADD COLUMN IF NOT EXISTS mirror_failed boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_vessel_generations_mirror_failed
  ON public.vessel_generations (created_at DESC)
  WHERE mirror_failed = true;
