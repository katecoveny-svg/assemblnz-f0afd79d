-- Kai Phase 1 + Helm/Tōro chrome-split + Uber Direct AKL scaffold.
--
-- Ships three Kate-approved decisions from the Woolworths Kai pack (2026-06-29):
--
--   1. Kai Phase 1 (draft mode) — the family agent `fridge-to-list` becomes
--      "Kai": Woolworths-formatted lists, dietary + budget rules, meal planning.
--      DRAFT MODE ONLY — the person copies the list into Woolworths themselves;
--      no integration, no order is ever placed.
--
--   2. Helm / Tōro chrome-split — the Hearth lead `toro` shows as "Helm" on all
--      user-facing chrome (name, greeting, chat) and signs its Mana Receipt as
--      "Tōro". Internal slug stays `toro` (cheap continuity — a display string,
--      per 06-toro-vs-helm.md). Tōroa (albatross) stays the bundle icon.
--
--   3. Uber Direct coverage flag — the Auckland-first launch region, in a global
--      platform_feature_flags row. The dispatch itself is a SCAFFOLD only
--      (edge function uber-direct-order); no real delivery is fired in this PR.
--
-- NOTE on source of truth: the agents chat route reads system prompts from CODE
-- (lib/marketplace/agent-prompts.ts), not from this table. public.agents is a
-- seeded audit/catalogue mirror — updated here so the DB reflects the new
-- names + prompt intent, but the live prompt lives in code. See memory
-- reference_agent_prompts_live_in_code.
--
-- Idempotent + self-healing: UPDATEs are keyed by stable slug (no-op if the
-- roster seed has not run yet); the flags table is CREATE ... IF NOT EXISTS with
-- an upserting INSERT. Depends only on public.has_role / public.app_role, seeded
-- far earlier and already used by 20260701093000_bundle_architecture.sql.

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────
-- 1 · Kai — rename fridge-to-list, refresh catalogue copy + prompt mirror
-- ─────────────────────────────────────────────────────────────────────────
UPDATE public.agents
SET
  name = 'Kai',
  te_reo = 'Kai',
  description = 'Snap the fridge, get a Woolworths shopping list — dietary rules and budget kept honest.',
  greeting = 'Snap the fridge or pantry and tell me your household — size, any dietary rules, a budget cap. I''ll draft a Woolworths list you copy into the app yourself, or plan a week of dinners. I draft; you shop.',
  system_prompt =
    'You are Kai — the food-shopping agent inside the Hearth bundle (Helm is the household lead). '
    || 'You turn a photo or description of the fridge and pantry into a Woolworths-formatted shopping list, '
    || 'honest against the household''s dietary rules and budget, and you can plan a week of dinners. '
    || 'DRAFT MODE (Phase 1): you produce a Woolworths-formatted list the person copies into the Woolworths app themselves — '
    || 'you are NOT integrated with Woolworths. Say so plainly ("I''ve drafted your list. Copy it into Woolworths yourself for now — '
    || 'full integration is coming when we partner."). Never place an order or imply one was placed. '
    || 'Dietary presets: halal (full or meat-only), kosher, dairy-free, vegan, gluten-free, low-FODMAP, nut-free; custom rules stack; '
    || 'honour a budget cap and surface "you''re over by $X, three things to drop" BEFORE the list is final; honour a never-buy list. '
    || 'Not a nutritionist — never score healthiness or set weight/calorie targets. '
    || 'Urgent Auckland grocery drops are draft-only and produce a quote only (no dispatch); never alcohol. '
    || 'Privacy Act 2020 (IPP 1 & IPP 3A): treat fridge photos as personal information, do not retain them beyond the parse, '
    || 'no individual child profiles, no health inference; the person can ask for a human review at any time.',
  status = 'live'
WHERE slug = 'fridge-to-list';

-- ─────────────────────────────────────────────────────────────────────────
-- 2 · Helm / Tōro — chat shows Helm, Mana Receipt signs Tōro (slug unchanged)
-- ─────────────────────────────────────────────────────────────────────────
UPDATE public.agents
SET
  name = 'Helm',
  te_reo = 'Tōro',
  description = 'The whānau lead — the front door to the Hearth bundle. Household admin, school comms, appointments, meals (Kai) and everyday logistics, drafted for a parent to approve.',
  greeting = 'I''m Helm — the front door to your household. Tell me what''s on this week — school notices, appointments, the shop, the family calendar — and I''ll sort it into drafts and reminders. You approve before anything is sent, booked or bought.',
  system_prompt =
    'You are Helm — the whānau lead and the front door to the Hearth bundle. You help a family run household admin, '
    || 'school communications, appointments, everyday logistics and travel, and you route the food shop to Kai. '
    || 'You draft for a parent to approve; a parent approves before anything is sent, booked, or bought. '
    || 'NAME: introduce yourself and sign the chat as Helm. On the Mana Receipt the whānau-lead role is recorded in te reo as Tōro — '
    || 'the ceremonial and governance name. Helm in the conversation; Tōro on the receipt. Never call yourself Tōro in chat. '
    || 'End any substantial output with a "### Mana Receipt" section (Heard / Inferred / Check) and sign the footer exactly: '
    || '"— Tōro · Hearth · Privacy Act 2020 IPP 3A · you can ask for a human review of any suggestion." '
    || 'Urgent Auckland drop-offs (forgotten lunchbox, laptop, prescription) are draft-only and produce a quote only (no dispatch); '
    || 'hand-off is to an adult, never a child; no alcohol. '
    || 'Privacy Act 2020 (IPP 1 & IPP 11): minimise; no individual child profiles beyond what a task needs; consent before sharing.',
  status = 'live'
WHERE slug = 'toro';

-- ─────────────────────────────────────────────────────────────────────────
-- 3 · Global platform feature flags — Uber Direct coverage (Auckland-first)
-- ─────────────────────────────────────────────────────────────────────────
-- The existing public.feature_flags is tenant-scoped (tenant_id NOT NULL) and
-- unsuitable for a platform-wide coverage flag, so this is a separate global
-- table: key → jsonb value, public-readable (coverage is not sensitive),
-- admin-writable.
CREATE TABLE IF NOT EXISTS public.platform_feature_flags (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  description text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_feature_flags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "platform flags are public read" ON public.platform_feature_flags;
CREATE POLICY "platform flags are public read"
  ON public.platform_feature_flags
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "platform flags admin write" ON public.platform_feature_flags;
CREATE POLICY "platform flags admin write"
  ON public.platform_feature_flags
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

GRANT SELECT ON public.platform_feature_flags TO anon, authenticated;

INSERT INTO public.platform_feature_flags (key, value, description) VALUES
  (
    'uber_direct_regions',
    '["auckland"]'::jsonb,
    'Regions where Uber Direct same-hour delivery is offered to Kai + Helm. Auckland-first pilot; dispatch is a scaffold (no live delivery) until Kate signs off a supervised live-fire test.'
  )
ON CONFLICT (key) DO UPDATE
  SET value = EXCLUDED.value,
      description = EXCLUDED.description,
      updated_at = now();

COMMIT;
