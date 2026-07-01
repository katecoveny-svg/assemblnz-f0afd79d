-- Phase 1A — Bundle architecture.
--
-- Moves the marketplace from a flat 54-agent grid to the LOCKED (per Kate,
-- BUNDLES-V4-SPEC-2026-06-29) 7-bundle + 1-standalone architecture:
--
--   Assembler — Construction   (lead: Foreman*)
--   Forge     — Automotive     (lead: Arataki — existing agent)
--   Ensemble  — Creative       (lead: Creative Director*)
--   Practice  — Health         (lead: Duty Doctor*)      + Vet sub-bundle (Phase 2)
--   Hearth    — Family/Whānau   (lead: Tōro — existing agent, becomes Whānau Navigator)
--   Counsel   — Legal           (lead: Solicitor*)        multi-specialty
--   Visa      — Immigration     (standalone; lead: its own Visa agent*)
--
--   * = provisional lead-agent slug. Lead-agent NAMES are still open questions
--     (spec §11 blockers 2 & 3). These new thin routing agents are built in
--     Phase 2; no agent rows are created for them here — bundles.lead_agent_slug
--     is plain text with no FK, so a provisional slug is safe. Where the spec
--     LOCKS an existing agent as the lead (Tōro for Hearth; Arataki for Forge),
--     that real slug is used and the agent is flagged is_bundle_lead = true.
--
-- This is a schema + data migration only. Agent system prompts are left
-- untouched — Phase 2 refreshes them. The code registry (lib/marketplace) and
-- the marketplace floor swap are separate later phases.
--
-- The `bundle` column is nullable: null = a standalone card or a not-yet-mapped
-- agent. Counsel and Visa have no existing agents to assign in Phase 1A (their
-- specialists are built in Phase 2), so those bundles start with 0 live members
-- — expected, and verified below.
--
-- Idempotent: re-running upserts bundle rows (ON CONFLICT DO UPDATE) and
-- re-applies every agent UPDATE (all keyed by stable slug). Self-healing on a
-- fresh apply: it only ever references slugs already seeded by
-- 20260627120000_seed_canon_unified_roster.sql and helpers created far earlier
-- (public.has_role / public.app_role). No columns are dropped.

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────
-- 1 · Schema — extend public.agents
-- ─────────────────────────────────────────────────────────────────────────

ALTER TABLE public.agents
  ADD COLUMN IF NOT EXISTS bundle text,                              -- null = standalone
  ADD COLUMN IF NOT EXISTS is_bundle_lead boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS parent_slug text;                         -- sub-specialist → survivor/lead

-- Constrain bundle to the seven locked values (visa is its own value — its
-- "bundle" IS the standalone). NULL stays allowed (standalone / unmapped).
ALTER TABLE public.agents DROP CONSTRAINT IF EXISTS agents_bundle_check;
ALTER TABLE public.agents
  ADD CONSTRAINT agents_bundle_check
  CHECK (bundle IS NULL OR bundle IN (
    'assembler', 'forge', 'ensemble', 'practice', 'hearth', 'counsel', 'visa'
  ));

CREATE INDEX IF NOT EXISTS agents_bundle_lead_idx
  ON public.agents (bundle, is_bundle_lead);

-- The catalogue locked reads to an explicit column list (see
-- 20260623140000_agent_catalogue_columns.sql: REVOKE SELECT + GRANT SELECT
-- (cols)). New columns are not in that grant, so extend it — otherwise the
-- bundle taxonomy is invisible to anon/authenticated reads. system_prompt
-- stays out of the grant, as before.
GRANT SELECT (bundle, is_bundle_lead, parent_slug)
  ON public.agents TO anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────
-- 2 · Schema — public.bundles (the buying unit; the lead is the front door)
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.bundles (
  slug            text PRIMARY KEY,
  name            text NOT NULL,
  te_reo          text NOT NULL DEFAULT '',
  category        text NOT NULL,          -- the vertical (construction, legal, …)
  lead_agent_slug text NOT NULL,          -- front-door agent (may be provisional)
  short_pitch     text NOT NULL,
  monthly_nzd     numeric NOT NULL,       -- headline bundle price (see Visa note)
  icon            text,
  accent          text,
  status          text NOT NULL DEFAULT 'live',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.bundles ENABLE ROW LEVEL SECURITY;

-- Public read on LIVE bundles only.
DROP POLICY IF EXISTS bundles_select_live ON public.bundles;
CREATE POLICY bundles_select_live ON public.bundles
  FOR SELECT TO anon, authenticated
  USING (status = 'live');

-- Write is admin only (matches the established has_role() convention). The
-- service role bypasses RLS, so seeds/back-office jobs still write freely.
DROP POLICY IF EXISTS bundles_admin_write ON public.bundles;
CREATE POLICY bundles_admin_write ON public.bundles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- ─────────────────────────────────────────────────────────────────────────
-- 3 · Seed — the seven bundles
-- ─────────────────────────────────────────────────────────────────────────
-- Prices + one-line pitches from spec §1.1. Lead names are provisional (§11).
-- Visa is a STANDALONE, not a monthly bundle — it is pack-priced
-- (free first consult / $49.99 application pack / $199 advisor mode). The
-- NOT NULL monthly_nzd carries the headline paid unit ($49.99); revisit when
-- Visa pricing is finalised.

INSERT INTO public.bundles
  (slug, name, te_reo, category, lead_agent_slug, short_pitch, monthly_nzd, icon, accent)
VALUES
  ('assembler', 'Assembler', '', 'construction', 'foreman',
   'The site foreman who routes safety, consents, project admin and quality — without you having to think about which agent owns which job.',
   399, 'hard-hat', '#F4A261'),

  ('forge', 'Forge', '', 'automotive', 'arataki',
   'Service manager for dealerships, workshops and heavy transport. One front door for WoF/CoF, CCCFA finance, GPS consent, RUC, VDAM and freight admin.',
   349, 'wrench', '#E76F51'),

  ('ensemble', 'Ensemble', '', 'creative', 'creative-director',
   'A creative director who briefs, drafts, brand-redlines and ships — copy, image, video, 3D, podcast, schedule. ASA + Fair Trading + Copyright compliance on every artefact.',
   299, 'palette', '#E9C46A'),

  ('practice', 'Practice', '', 'health', 'duty-doctor',
   'A duty doctor who triages the request to GP, oncology, mental health, paeds, women''s, aged care, ACC, allied health or vet — and always sends the work to a registered practitioner for review.',
   499, 'stethoscope', '#2A9D8F'),

  ('hearth', 'Hearth', '', 'family', 'toro',
   'The whānau navigator. School notices, meals, calendar, elder check-ins, power bills, weather, catch logs. Tōro is the lead, no longer a peer.',
   24.99, 'home', '#EFB366'),

  ('counsel', 'Counsel', '', 'legal', 'solicitor',
   'The solicitor. Routes to family, employment, property, wills/trusts, immigration appeals, tenancy, consumer, Te Tiriti, tax or Disputes Tribunal. Every output ends: this is a model-assisted draft — have a registered NZ lawyer review and sign.',
   499, 'scale', '#264653'),

  ('visa', 'Visa', '', 'immigration', 'visa',
   'One agent, one job. AEWV, partnership, dependent child, student. INZ form-pack, Schedule of Documents, fee table, refusal-risk flags. Refers to a licensed adviser before submitting.',
   49.99, 'plane', '#457B9D')
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
-- 4 · Assign bundles to existing agents (spec §1 mapping)
-- ─────────────────────────────────────────────────────────────────────────

-- Bundle leads that are existing agents (spec-locked).
UPDATE public.agents SET bundle = 'hearth', is_bundle_lead = true, updated_at = now()
  WHERE slug = 'toro';                         -- Tōro becomes the Whānau Navigator
UPDATE public.agents SET bundle = 'forge',  is_bundle_lead = true, updated_at = now()
  WHERE slug = 'arataki';                      -- Arataki is the Forge lead (§ consolidations)

-- Assembler (Construction) — the six build specialists.
UPDATE public.agents SET bundle = 'assembler', updated_at = now()
  WHERE slug IN ('arai', 'ata', 'kaupapa', 'pai', 'rawa', 'whakaae');

-- Ensemble (Creative). social-manager is not named in §1.1 but is the only
-- other creative-category agent and fits alongside Saffron (always-on
-- publishing); folded in here rather than left orphaned.
UPDATE public.agents SET bundle = 'ensemble', updated_at = now()
  WHERE slug IN ('auaha', 'prism', 'muse', 'saffron', 'social-manager');

-- Practice (Health) — existing members only. Clinical + vet specialists are
-- built in Phase 2. Aura is NOT here — it stays a hospitality standalone (§1.4).
UPDATE public.agents SET bundle = 'practice', updated_at = now()
  WHERE slug IN ('care-scribe', 'voice-cs');

-- Hearth (Family/Whānau) — live members (Tōro handled above as lead).
-- power-watch (business cat) and catch-log (trades cat) are pulled in per §1.1.
-- voyage (family cat) is not named in §1.1 but has no other home; assigned here.
UPDATE public.agents SET bundle = 'hearth', updated_at = now()
  WHERE slug IN (
    '9am-brief', 'fridge-to-list', 'panui-parser', 'school-notice',
    'care-captain', 'power-watch', 'catch-log', 'voyage'
  );

-- Counsel + Visa: no existing agents to assign in Phase 1A (Phase 2 builds the
-- specialists). Their bundle rows exist; live membership is 0 for now.

-- Standalones / not-yet-mapped keep bundle = NULL (the column default):
--   Platform/onboarding: atlas, pilot, echo         (spec §1.3)
--   Hospitality solo:    aura                        (spec §1.4)
--   Held tiny-bundles (Storefront / Border — not in the 7 locked values, so
--   left NULL pending Kate's §11 Q7 decision): cellar, hoko-cga, pikau, gateway
--   Unmapped SME/ops agents (no vertical bundle in the locked map): invoice-tidy,
--   hui-notes, roster-sorter, inbox-triage, travel-logs, tax-tidy, chief, roster,
--   counter, aroha, ako-licence, food-temp-logs, stock-count, compliance-check,
--   maritime-brief. These surface in the NULL group of the verification query.

-- ─────────────────────────────────────────────────────────────────────────
-- 5 · Consolidations — kill / merge (spec §1.2 + task brief)
-- ─────────────────────────────────────────────────────────────────────────

-- KILLED outright (no survivor). building-consent is a duplicate of Whakaaē and
-- customs-entry is superseded by the (held) Border customs pair — but the task
-- brief lists both under "Killed", so no parent_slug is set (parent_slug is for
-- live sub-specialists inside a bundle). Phase 3 can 301 these to whakaae / pikau.
UPDATE public.agents SET status = 'retired', updated_at = now()
  WHERE slug IN ('building-consent', 'customs-entry');

-- MERGED / absorbed — retire and point parent_slug at the survivor.
-- Forge: Motor, Transit, Transit-Freight all fold into Arataki.
UPDATE public.agents
  SET status = 'retired', bundle = 'forge', parent_slug = 'arataki', updated_at = now()
  WHERE slug IN ('motor', 'transit', 'transit-freight');

-- Hearth: Whānau Help folds into Tōro.
UPDATE public.agents
  SET status = 'retired', bundle = 'hearth', parent_slug = 'toro', updated_at = now()
  WHERE slug = 'whanau-help';

-- Hearth: Tide & Weather folds into Catch Log as the combined marine agent.
-- (Task offered "→ catch-log OR just retire"; chose the merge so the marine
-- function survives under one Hearth card. Reverse by dropping parent_slug if
-- Kate prefers a clean retire.)
UPDATE public.agents
  SET status = 'retired', bundle = 'hearth', parent_slug = 'catch-log', updated_at = now()
  WHERE slug = 'tide-weather';

-- Meeting Records folds into Hui Notes. Hui Notes stays live but unbundled for
-- now (no vertical bundle fits a generic meeting tool); a follow-up renames
-- hui-notes → hui per the task brief.
UPDATE public.agents
  SET status = 'retired', parent_slug = 'hui-notes', updated_at = now()
  WHERE slug = 'meeting-records';

COMMIT;

-- ─────────────────────────────────────────────────────────────────────────
-- Verification
-- ─────────────────────────────────────────────────────────────────────────
-- Expected distribution of LIVE agents by bundle:
--
--   select bundle, count(*) from public.agents where status='live'
--   group by bundle order by bundle nulls last;
--
--     assembler | 6     (arai, ata, kaupapa, pai, rawa, whakaae)
--     ensemble  | 5     (auaha, prism, muse, saffron, social-manager)
--     forge     | 1     (arataki — motor/transit/transit-freight retired)
--     hearth    | 9     (toro, 9am-brief, fridge-to-list, panui-parser,
--                        school-notice, care-captain, power-watch, catch-log, voyage)
--     practice  | 2     (care-scribe, voice-cs)
--     (null)    | 23    (standalones + unmapped SME/ops agents)
--   counsel / visa: 0 live members in Phase 1A (built in Phase 2).
--
--   Totals: 46 live + 8 retired = 54.
--   Retired: building-consent, customs-entry, motor, transit, transit-freight,
--            whanau-help, tide-weather, meeting-records.
--
-- Bundle rows:
--   select slug, lead_agent_slug, monthly_nzd from public.bundles order by slug;
--   -> 7 rows (assembler, counsel, ensemble, forge, hearth, practice, visa).
