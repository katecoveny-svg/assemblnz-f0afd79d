-- Marketplace cull V4 — the LOCKED 8-bundle + 1-standalone architecture.
--
-- This migration is the DB half of the code changes in feature/marketplace-cull-registry:
--   1. Extends public.agents with the bundle taxonomy (idempotent — matches
--      20260701093000_bundle_architecture.sql shape, adds `kaitiaki` to the CHECK
--      constraint so the eighth bundle is expressible).
--   2. Creates public.bundles (idempotent) and upserts the seven bundle rows +
--      the Visa standalone with the LOCKED pitches and prices.
--   3. Applies the renames (name + slug where the slug column exists) and rewrites
--      name references inside system_prompt via regexp_replace.
--   4. Soft-retires the KILLED agents (building-consent, whanau-help, customs-entry,
--      maritime-brief, meeting-records, motor, transit, transit-freight) with
--      status = 'coming_soon' and a parent_slug pointer to the survivor. FKs are
--      preserved — nothing is DELETEd.
--   5. Assigns every non-killed agent to its bundle.
--
-- All of the above is wrapped in a transaction and re-runnable — every UPDATE
-- keys off the stable slug. Safe on both an empty DB and a live one.

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────
-- 1 · Schema — extend public.agents (idempotent with prior migration)
-- ─────────────────────────────────────────────────────────────────────────

ALTER TABLE public.agents
  ADD COLUMN IF NOT EXISTS bundle text,
  ADD COLUMN IF NOT EXISTS is_bundle_lead boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS parent_slug text;

-- Rebuild the bundle CHECK to include 'kaitiaki'. Prior migration only
-- included the seven original bundles.
ALTER TABLE public.agents DROP CONSTRAINT IF EXISTS agents_bundle_check;
ALTER TABLE public.agents
  ADD CONSTRAINT agents_bundle_check
  CHECK (bundle IS NULL OR bundle IN (
    'assembler', 'forge', 'ensemble', 'practice', 'kaitiaki',
    'hearth', 'counsel', 'visa'
  ));

CREATE INDEX IF NOT EXISTS agents_bundle_lead_idx
  ON public.agents (bundle, is_bundle_lead);

-- Anon/authenticated read grant covers the taxonomy columns (system_prompt
-- stays excluded, as in the prior migration).
GRANT SELECT (bundle, is_bundle_lead, parent_slug)
  ON public.agents TO anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────
-- 2 · Schema — public.bundles
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.bundles (
  slug            text PRIMARY KEY,
  name            text NOT NULL,
  te_reo          text NOT NULL DEFAULT '',
  category        text NOT NULL,
  lead_agent_slug text NOT NULL,
  short_pitch     text NOT NULL,
  monthly_nzd     numeric NOT NULL,
  icon            text,
  accent          text,
  status          text NOT NULL DEFAULT 'live',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.bundles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS bundles_select_live ON public.bundles;
CREATE POLICY bundles_select_live ON public.bundles
  FOR SELECT TO anon, authenticated
  USING (status = 'live');

DROP POLICY IF EXISTS bundles_admin_write ON public.bundles;
CREATE POLICY bundles_admin_write ON public.bundles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- ─────────────────────────────────────────────────────────────────────────
-- 3 · Seed — the seven bundles + Kaitiaki (8) + Visa standalone
-- ─────────────────────────────────────────────────────────────────────────
-- Pitches + prices are LOCKED (mirror lib/marketplace/bundles.ts). Kaitiaki is
-- the eighth bundle — its row is added here so the DB matches the code.
-- Visa is standalone (pack-priced $49.99 headline; not a monthly bundle).

INSERT INTO public.bundles
  (slug, name, te_reo, category, lead_agent_slug, short_pitch, monthly_nzd, icon, accent)
VALUES
  ('assembler', 'Assembler', '', 'construction', 'foreman',
   'The site foreman who routes safety, consents, project admin and quality — without you having to think about which agent owns which job.',
   399, 'shield', '#F4A261'),

  ('forge', 'Forge', '', 'automotive', 'arataki',
   'Service manager for dealerships, workshops and heavy transport. One front door for WoF/CoF, CCCFA finance, GPS consent, RUC, VDAM and freight admin.',
   349, 'car', '#E76F51'),

  ('ensemble', 'Ensemble', '', 'creative', 'creative-director',
   'A creative director who briefs, drafts, brand-redlines and ships — copy, image, video, 3D, podcast, schedule. ASA + Fair Trading + Copyright compliance on every artefact.',
   299, 'spark', '#E9C46A'),

  ('practice', 'Practice', '', 'health', 'duty-doctor',
   'A duty doctor who triages the request to GP, oncology, mental health, paeds, women''s, aged care, ACC, allied health or vet — and always sends the work to a registered practitioner for review.',
   499, 'scribe', '#2A9D8F'),

  ('kaitiaki', 'Kaitiaki', 'Kaitiakitanga', 'animal', 'keeper',
   'Animal health, welfare, service and conservation — one front door. Keeper routes to a companion vet, farm, equine or exotic specialist, doggy daycare, welfare triage, wildlife rehab or Threatened Species Recovery.',
   399, 'paw', '#FFF7EC'),

  ('hearth', 'Hearth', '', 'family', 'toro',
   'The whānau navigator. School notices, meals, calendar, elder check-ins, power bills, weather, catch logs. Tōro is the lead, no longer a peer.',
   24.99, 'whanau', '#EFB366'),

  ('counsel', 'Counsel', '', 'legal', 'solicitor',
   'The solicitor. Routes to family, employment, property, wills/trusts, immigration appeals, tenancy, consumer, Te Tiriti, tax or Disputes Tribunal. Every output ends: this is a model-assisted draft — have a registered NZ lawyer review and sign.',
   499, 'shield', '#264653'),

  ('visa', 'Visa', '', 'immigration', 'visa',
   'One agent, one job. AEWV, partnership, dependent child, student. INZ form-pack, Schedule of Documents, fee table, refusal-risk flags. Refers to a licensed adviser before submitting.',
   49.99, 'panui', '#457B9D')
ON CONFLICT (slug) DO UPDATE SET
  name            = EXCLUDED.name,
  te_reo          = EXCLUDED.te_reo,
  category        = EXCLUDED.category,
  lead_agent_slug = EXCLUDED.lead_agent_slug,
  short_pitch     = EXCLUDED.short_pitch,
  monthly_nzd     = EXCLUDED.monthly_nzd,
  icon            = EXCLUDED.icon,
  accent          = EXCLUDED.accent,
  updated_at      = now();

-- ─────────────────────────────────────────────────────────────────────────
-- 4 · Renames — surviving agents (name + slug + system_prompt name refs)
-- ─────────────────────────────────────────────────────────────────────────
-- The slug column is stable — we UPDATE by the OLD slug and set both name and
-- (if the column exists) slug. system_prompt has the agent's own name inline in
-- several places; a regexp_replace keeps the prompts self-consistent.

-- 9am Brief → Dawn
UPDATE public.agents
  SET slug = 'dawn',
      name = 'Dawn',
      system_prompt = regexp_replace(system_prompt, '\m9am Brief\M', 'Dawn', 'g'),
      updated_at = now()
  WHERE slug = '9am-brief';

-- Care Captain → Awhi
UPDATE public.agents
  SET slug = 'awhi',
      name = 'Awhi',
      system_prompt = regexp_replace(system_prompt, '\mCare Captain\M', 'Awhi', 'g'),
      updated_at = now()
  WHERE slug = 'care-captain';

-- Hui Notes → Hui (and Meeting Records merges here — handled in step 5)
UPDATE public.agents
  SET slug = 'hui',
      name = 'Hui',
      system_prompt = regexp_replace(system_prompt, '\mHui Notes\M', 'Hui', 'g'),
      updated_at = now()
  WHERE slug = 'hui-notes';

-- Roster Sorter → Pipeline
UPDATE public.agents
  SET slug = 'pipeline',
      name = 'Pipeline',
      system_prompt = regexp_replace(system_prompt, '\mRoster Sorter\M', 'Pipeline', 'g'),
      updated_at = now()
  WHERE slug = 'roster-sorter';

-- Inbox Triage → Sweep
UPDATE public.agents
  SET slug = 'sweep',
      name = 'Sweep',
      system_prompt = regexp_replace(system_prompt, '\mInbox Triage\M', 'Sweep', 'g'),
      updated_at = now()
  WHERE slug = 'inbox-triage';

-- Tax Tidy → Treasury
UPDATE public.agents
  SET slug = 'treasury',
      name = 'Treasury',
      system_prompt = regexp_replace(system_prompt, '\mTax Tidy\M', 'Treasury', 'g'),
      updated_at = now()
  WHERE slug = 'tax-tidy';

-- Power Watch → Switch
UPDATE public.agents
  SET slug = 'switch',
      name = 'Switch',
      system_prompt = regexp_replace(system_prompt, '\mPower Watch\M', 'Switch', 'g'),
      updated_at = now()
  WHERE slug = 'power-watch';

-- Care Scribe → Quill
UPDATE public.agents
  SET slug = 'quill',
      name = 'Quill',
      system_prompt = regexp_replace(system_prompt, '\mCare Scribe\M', 'Quill', 'g'),
      updated_at = now()
  WHERE slug = 'care-scribe';

-- Voice CS → Front
UPDATE public.agents
  SET slug = 'front',
      name = 'Front',
      system_prompt = regexp_replace(system_prompt, '\mVoice CS\M', 'Front', 'g'),
      updated_at = now()
  WHERE slug = 'voice-cs';

-- ─────────────────────────────────────────────────────────────────────────
-- 5 · Consolidations — soft-kill duplicates / absorbed agents
-- ─────────────────────────────────────────────────────────────────────────
-- KILLED agents keep their rows (FKs) but flip to status = 'coming_soon' and
-- get a parent_slug pointing at the survivor. `status = 'coming_soon'` is what
-- the marketplace UI reads to hide them from the shelf.

-- Building Consent (KILLED — duplicate of Whakaaē).
UPDATE public.agents
  SET status = 'coming_soon',
      parent_slug = 'whakaae',
      updated_at = now()
  WHERE slug = 'building-consent';

-- Whānau Help (KILLED — absorbed into Tōro / the Hearth bundle lead).
UPDATE public.agents
  SET status = 'coming_soon',
      bundle = 'hearth',
      parent_slug = 'toro',
      updated_at = now()
  WHERE slug = 'whanau-help';

-- Customs Entry (KILLED — duplicate of Pīkau).
UPDATE public.agents
  SET status = 'coming_soon',
      bundle = 'forge',
      parent_slug = 'pikau',
      updated_at = now()
  WHERE slug = 'customs-entry';

-- Maritime Brief (KILLED — merged into Tide (tide-weather) as the surviving weather agent).
UPDATE public.agents
  SET status = 'coming_soon',
      bundle = 'hearth',
      parent_slug = 'tide-weather',
      updated_at = now()
  WHERE slug = 'maritime-brief';

-- Meeting Records (KILLED — merged into Hui).
UPDATE public.agents
  SET status = 'coming_soon',
      parent_slug = 'hui',
      updated_at = now()
  WHERE slug = 'meeting-records';

-- Motor, Transit, Transit-Freight (KILLED — absorbed into Arataki / the Forge bundle lead).
UPDATE public.agents
  SET status = 'coming_soon',
      bundle = 'forge',
      parent_slug = 'arataki',
      updated_at = now()
  WHERE slug IN ('motor', 'transit', 'transit-freight');

-- ─────────────────────────────────────────────────────────────────────────
-- 6 · Bundle assignments — live agents
-- ─────────────────────────────────────────────────────────────────────────

-- Hearth (Family/Whānau) — Tōro leads.
UPDATE public.agents SET bundle = 'hearth', is_bundle_lead = true, updated_at = now()
  WHERE slug = 'toro';
UPDATE public.agents SET bundle = 'hearth', updated_at = now()
  WHERE slug IN (
    'dawn', 'fridge-to-list', 'panui-parser', 'school-notice',
    'awhi', 'switch', 'catch-log', 'voyage', 'tide-weather'
  );

-- Forge (Automotive/Freight) — Arataki leads.
UPDATE public.agents SET bundle = 'forge', is_bundle_lead = true, updated_at = now()
  WHERE slug = 'arataki';
UPDATE public.agents SET bundle = 'forge', updated_at = now()
  WHERE slug IN ('pikau', 'gateway');

-- Assembler (Construction) — six build specialists (Foreman is the provisional lead,
-- built as a thin routing agent in a follow-up; no is_bundle_lead is set here
-- because there is no existing agent row for `foreman`).
UPDATE public.agents SET bundle = 'assembler', updated_at = now()
  WHERE slug IN ('arai', 'ata', 'kaupapa', 'pai', 'rawa', 'whakaae');

-- Ensemble (Creative).
UPDATE public.agents SET bundle = 'ensemble', updated_at = now()
  WHERE slug IN ('auaha', 'prism', 'muse', 'saffron', 'social-manager');

-- Practice (Health).
UPDATE public.agents SET bundle = 'practice', updated_at = now()
  WHERE slug IN ('quill', 'front');

-- Kaitiaki (Animal) — Keeper leads. Members are the 12 specialists.
UPDATE public.agents SET bundle = 'kaitiaki', is_bundle_lead = true, updated_at = now()
  WHERE slug = 'keeper';
UPDATE public.agents SET bundle = 'kaitiaki', updated_at = now()
  WHERE slug IN (
    'vet-small-animal', 'vet-large-animal', 'vet-equine', 'vet-exotic',
    'spca-workflow', 'rescue-coordination', 'doggy-daycare',
    'kakapo-recovery', 'kiwi-conservation', 'wildbase-recovery',
    'zoo-vet', 'species-recovery'
  );

-- Counsel + Visa: no existing agents to assign yet; their specialists are built
-- as a follow-up. Bundle rows exist so the /agents shelf renders the card.

COMMIT;

-- ─────────────────────────────────────────────────────────────────────────
-- Verification
-- ─────────────────────────────────────────────────────────────────────────
-- Expected shape after this migration:
--   select slug, count(*) from public.bundles group by slug;
--     -> 8 rows (assembler, counsel, ensemble, forge, hearth, kaitiaki,
--                practice, visa).
--
--   select bundle, count(*) from public.agents where status = 'live'
--     group by bundle order by bundle nulls last;
--     -> assembler | 6   (arai, ata, kaupapa, pai, rawa, whakaae)
--        ensemble  | 5   (auaha, prism, muse, saffron, social-manager)
--        forge     | 3   (arataki + pikau + gateway)
--        hearth    | 10  (toro + 9 specialists incl. tide-weather)
--        kaitiaki  | 13  (keeper + 12 specialists)
--        practice  | 2   (quill, front)
--        (null)    | remaining standalones (atlas, pilot, echo, aura, …)
--
--   Killed and soft-retired: building-consent, whanau-help, customs-entry,
--   maritime-brief, meeting-records, motor, transit, transit-freight.
