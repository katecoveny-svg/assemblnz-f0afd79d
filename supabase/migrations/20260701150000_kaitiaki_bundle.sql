-- Kaitiaki — the eighth bundle (animal health, welfare, service & conservation).
--
-- Per KAITIAKI-VERTICAL-SPEC-2026-06-29-v2 and memory
-- project_bundle_architecture_v4_locked_2026-06-29. Kaitiaki is a STANDALONE
-- eighth bundle, sibling to Practice (not a Practice sub-bundle). Lead agent is
-- **Keeper** (locked 2026-07-01). Twelve NZ-first specialists across three
-- groups: vet clinical (4), welfare & service (3), conservation & wildlife (5).
--
-- This migration is a schema + data mirror only. The LIVE roster, prompts and
-- marketplace surface are driven by lib/marketplace/{agents,agent-prompts}.ts and
-- app/bundles/kaitiaki — the DB agents/bundles rows are a seeded catalogue mirror
-- (see reference_agent_prompts_live_in_code). Chats read agent.systemPrompt from
-- CODE, never agents.system_prompt (left NULL here).
--
-- Depends on 20260701093000_bundle_architecture.sql (bundles table +
-- bundle/is_bundle_lead/parent_slug columns + agents_bundle_check). Runs AFTER
-- the 20260627120000 canon roster seed, so the keeper + specialty rows it inserts
-- survive that seed's prune (which only ran once, on the 54-slug list).
--
-- Idempotent + self-healing: bundle + agent rows upsert ON CONFLICT (slug);
-- Kate's all-access installs upsert ON CONFLICT (user_id, agent_slug). Re-running
-- is a no-op. Only references objects created by earlier migrations. No drops.

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────
-- 1 · Admit 'kaitiaki' to the agents.bundle CHECK (was the 7 locked values).
-- ─────────────────────────────────────────────────────────────────────────
ALTER TABLE public.agents DROP CONSTRAINT IF EXISTS agents_bundle_check;
ALTER TABLE public.agents
  ADD CONSTRAINT agents_bundle_check
  CHECK (bundle IS NULL OR bundle IN (
    'assembler', 'forge', 'ensemble', 'practice', 'hearth', 'counsel', 'visa',
    'kaitiaki'
  ));

-- ─────────────────────────────────────────────────────────────────────────
-- 2 · The Kaitiaki bundle row (buying unit; Keeper is the front door).
-- ─────────────────────────────────────────────────────────────────────────
-- Price per spec §1.2: Business $199/clinic-or-seat · bundle $399/org/mo.
-- accent = cream (#FFF7EC, canary+cream palette per canon); icon 'paw'.
INSERT INTO public.bundles
  (slug, name, te_reo, category, lead_agent_slug, short_pitch, monthly_nzd, icon, accent)
VALUES
  ('kaitiaki', 'Kaitiaki', 'Kaitiakitanga', 'animal', 'keeper',
   'Animal care, welfare and conservation, drafted for a licensed vet or authorised welfare officer to sign. Keeper routes an animal question to the right kind of care — companion vet, farm, equine, exotic, doggy daycare, welfare triage, wildlife rehab or Threatened Species Recovery.',
   399, 'paw', '#FFF7EC')
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
-- 3 · Keeper (lead) + the twelve specialists — catalogue mirror rows.
-- ─────────────────────────────────────────────────────────────────────────
-- price_tier: keeper 'free' (front door), specialists 'business' ($199/seat).
-- status: kakapo-recovery + kiwi-conservation ship 'draft' — the two taonga-bird
--   specialties held behind kaumātua + DOC sign-off (spec §6.4 taonga rule,
--   §7 Phase D). Every wildlife/conservation specialty carries the kaitiaki-review
--   hard rule in its CODE prompt regardless of status. zoo-vet ships LIVE — it is
--   the Auckland Zoo pilot flagship (spec §5.6); its taonga OUTPUTS are gated
--   in-prompt (whakapapa/naming held for iwi). system_prompt stays NULL (code).
INSERT INTO public.agents
  (slug, name, te_reo, description, category, model_tier, pricing_tier,
   price_tier, price_monthly_nzd, icon, accent, greeting, status,
   bundle, is_bundle_lead, parent_slug)
VALUES
  -- ── Lead ──────────────────────────────────────────────────────────────
  ('keeper', 'Keeper', 'Kaitiaki',
   'The front door to Kaitiaki. Routes an animal question to the right kind of care — companion vet, farm, equine, exotic, doggy daycare, welfare triage, wildlife rehab or Threatened Species Recovery. Every output is a draft for a registered vet, an authorised welfare officer, a licensed daycare operator or a named kaitiaki reviewer to sign.',
   'animal', 'premium', 'per_agent', 'free', 0, 'paw', '#FFF7EC',
   'Kia ora, I''m your Keeper. Tell me about the animal — a pet, a farm animal, a wild animal, or your daycare — and I''ll route it to the right specialist. Every reply is a draft for a registered vet, welfare officer, licensed operator or kaitiaki reviewer to sign.',
   'live', 'kaitiaki', true, NULL),

  -- ── Group A · Vet clinical ─────────────────────────────────────────────
  ('vet-small-animal', 'Small Animal Vet', '',
   'Companion-animal consults for dogs, cats, rabbits and small mammals — vaccination, dental, desex, acute and chronic disease, surgical prep and discharge, pain and EoL support. A draft for a registered veterinarian to examine and sign.',
   'animal', 'premium', 'per_agent', 'business', 199, 'scribe', '#FFF7EC',
   'Tell me the presentation and I''ll draft a SOAP, a differential list and a treatment plan — cross-checked against the VetMed NZ formulary. I never diagnose from a photo; a registered vet examines and signs.',
   'live', 'kaitiaki', false, 'keeper'),

  ('vet-large-animal', 'Large Animal Vet', '',
   'Production-animal herd health for dairy, beef, sheep, goats and deer — mastitis, calving, lameness, M.bovis and TB surveillance, drench resistance, withholding periods, NAIT and notifiable-disease pathways. A draft for a registered production-animal vet to sign.',
   'animal', 'premium', 'per_agent', 'business', 199, 'careCaptain', '#FFF7EC',
   'Give me the herd or animal and the signs. I''ll draft the plan with milk + meat withholding periods, a NAIT check, and an MPI notifiable-disease flag if one fires — that flag can never be suppressed.',
   'live', 'kaitiaki', false, 'keeper'),

  ('vet-equine', 'Equine Vet', '',
   'Horse work across thoroughbred, harness, sport and leisure — lameness, colic triage, respiratory, reproduction, pre-purchase exams, and racing/FEI drug management with live withdrawal-time checks. A draft for a registered equine vet to sign.',
   'animal', 'premium', 'per_agent', 'business', 199, 'paw', '#FFF7EC',
   'Tell me the horse, the discipline and the signs. I''ll draft the workup with a withdrawal-time table cross-checked against the current NZTR, HRNZ and FEI prohibited-substance lists before any prescription.',
   'live', 'kaitiaki', false, 'keeper'),

  ('vet-exotic', 'Exotic, Avian & Reptile Vet', '',
   'A credible second opinion on birds, reptiles, small mammals beyond rabbit, and companion fish — most presentations trace to husbandry, so every consult reviews enclosure, diet, UVB and temperature. Native species incorrectly presented as exotic route straight to Rescue Coordination. A draft for a registered vet to sign.',
   'animal', 'premium', 'per_agent', 'business', 199, 'fish', '#FFF7EC',
   'Tell me the species and the signs. I''ll draft the consult with a husbandry review, a species-appropriate plan and a zoonotic-risk flag. If your "exotic" turns out to be a NZ native, I route it to DOC.',
   'live', 'kaitiaki', false, 'keeper'),

  -- ── Group B · Welfare & service ────────────────────────────────────────
  ('spca-workflow', 'SPCA Workflow', '',
   'Welfare case triage under the Animal Welfare Act 1999 — severity grading, jurisdiction (SPCA vs MPI vs council), inspector-brief and MPI-referral drafting, and the adoption + foster pipeline. Only an authorised inspector can enter a property under AWA s127. A draft for an authorised welfare officer to sign.',
   'animal', 'premium', 'per_agent', 'business', 199, 'shield', '#FFF7EC',
   'Describe the complaint. I''ll draft a severity grade, a jurisdiction check and an inspector brief — and the MPI referral if it''s triggered. I never advise anyone to enter another person''s property; those powers vest in the authorised inspector.',
   'live', 'kaitiaki', false, 'keeper'),

  ('rescue-coordination', 'Rescue Coordination', '',
   'Multi-agency coordination for injured, orphaned or displaced animals — beached marine mammals (Project Jonah + DOC), injured native wildlife (DOC + Wildbase), displaced companions and weather-event response. Human safety first; native species handled by an untrained person is a Wildlife Act 1953 offence. A draft for the right responders to act on.',
   'animal', 'premium', 'per_agent', 'business', 199, 'anchor', '#FFF7EC',
   'Tell me what''s been found and where. I''ll confirm the species, check jurisdiction and draft the responder sequence with a chain-of-custody note. Never handle a marine mammal or native yourself — I route you to trained responders.',
   'live', 'kaitiaki', false, 'keeper'),

  ('doggy-daycare', 'Doggy Daycare', '',
   'The operating system for a boutique NZ doggy daycare — enrolment to Welcome Pack, SMS-native pickup coordination with 30-minute windows and address-per-day, channel-aware owner comms (email in the owner-operator''s voice, SMS in the carer''s), Xero-connected monthly invoicing, vaccination + council-registration tracking, and AWA-compliant incident reports. Every message and invoice is a draft the operator approves and sends.',
   'animal', 'premium', 'per_agent', 'business', 199, 'paw', '#FFF7EC',
   'Tell me about the dog, the roster or the pickup. I''ll draft the Welcome Pack, the next-day SMS in your carer''s voice, the monthly Xero invoice, or the owner email in your voice — you review and send. I never send on anyone''s behalf.',
   'live', 'kaitiaki', false, 'keeper'),

  -- ── Group C · Conservation & wildlife ──────────────────────────────────
  ('kakapo-recovery', 'Kākāpō Recovery', '',
   'Field-ops support for the DOC Kākāpō Recovery Programme — tracked-bird records, breeding-season workflow, aspergillosis surveillance. Coming soon: ships only under a Ngāi Tahu + DOC tripartite sign-off. The model never generates whakapapa and never surfaces a tracked-bird location.',
   'animal', 'premium', 'per_agent', 'business', 199, 'koru', '#FFF7EC',
   'Coming soon — pending iwi + DOC sign-off. When live, every output touching a named bird routes to a named Ngāi Tahu + DOC kaitiaki reviewer, and I never generate whakapapa or surface transmitter data.',
   'draft', 'kaitiaki', false, 'keeper'),

  ('kiwi-conservation', 'Kiwi Conservation', '',
   'National Kiwi Recovery Plan support — Operation Nest Egg logistics, community trap programmes, dog-avoidance in kiwi zones. Coming soon: ships only after a Kiwis for Kiwi MOU and rohe-appropriate kaumātua sign-off. Uncontrolled dogs near kiwi are a Wildlife Act 1953 offence.',
   'animal', 'premium', 'per_agent', 'business', 199, 'koru', '#FFF7EC',
   'Coming soon — pending iwi sign-off for the translocation rohe. When live, any translocation or whakapapa reference routes to a named kaitiaki reviewer, and I refuse to produce handling content for an unpermitted person.',
   'draft', 'kaitiaki', false, 'keeper'),

  ('wildbase-recovery', 'Wildbase Recovery', '',
   'The wildlife-hospital pathway — admission protocols, orthopaedic repair planning, oiled-seabird and lead-toxicity care, rehab and soft-release. Defined by the hospital pathway, not the species; every admission drafts a DOC notification and cites the Wildlife Act permit. A draft for a registered vet + named kaitiaki reviewer where taonga.',
   'animal', 'premium', 'per_agent', 'business', 199, 'careCaptain', '#FFF7EC',
   'Tell me the casualty and its condition. I''ll draft the admission decision, a rehab plan with a release-site coordination note, and the DOC notification — with the radio-transmitter mass limit checked before any tag.',
   'live', 'kaitiaki', false, 'keeper'),

  ('zoo-vet', 'Zoo Vet', '',
   'Ex-situ collection support for NZ zoos — NZCCM-style clinical note drafting for the resident collection and wild-native casualties, species-management dashboards, ZAA + MPI Code of Welfare compliance, and visitor-education content. Built with Auckland Zoo as the pilot design partner (concept · pilot pending). A draft for a zoo vet, keeper or education-team member to sign.',
   'animal', 'premium', 'per_agent', 'business', 199, 'paw', '#FFF7EC',
   'Tell me the animal and the moment — a clinical note, a species-management query, or a "meet the animal" card. I draft inside your zoo''s voice; naming and whakapapa for taonga species are held for iwi consultation, never generated.',
   'live', 'kaitiaki', false, 'keeper'),

  ('species-recovery', 'DOC Species Recovery', '',
   'General support across the ~200 published Threatened Species Recovery Plans — tuatara, whio, takahē, kōkako, kākā, kea, tuna and more. Recovery-plan interpretation, translocation logistics, predator-control review and community-sanctuary support. Taonga species route to a named kaitiaki reviewer. A draft for a DOC + iwi partner to sign.',
   'animal', 'premium', 'per_agent', 'business', 199, 'koru', '#FFF7EC',
   'Tell me the species and the kaupapa. I''ll draft the recovery-plan brief, survey or translocation logistics — with 1080/brodifacoum consultation rules surfaced loudly and taonga content routed to a named kaitiaki reviewer.',
   'live', 'kaitiaki', false, 'keeper')
ON CONFLICT (slug) DO UPDATE SET
  name              = EXCLUDED.name,
  te_reo            = EXCLUDED.te_reo,
  description       = EXCLUDED.description,
  category          = EXCLUDED.category,
  model_tier        = EXCLUDED.model_tier,
  pricing_tier      = EXCLUDED.pricing_tier,
  price_tier        = EXCLUDED.price_tier,
  price_monthly_nzd = EXCLUDED.price_monthly_nzd,
  icon              = EXCLUDED.icon,
  accent            = EXCLUDED.accent,
  greeting          = EXCLUDED.greeting,
  status            = EXCLUDED.status,
  bundle            = EXCLUDED.bundle,
  is_bundle_lead    = EXCLUDED.is_bundle_lead,
  parent_slug       = EXCLUDED.parent_slug,
  updated_at        = now();

-- ─────────────────────────────────────────────────────────────────────────
-- 4 · Kate's all-access — one install row per Kaitiaki agent (Keeper + 12).
-- ─────────────────────────────────────────────────────────────────────────
-- Kate = 893f40dc-2b51-4f10-bcfe-91fa6e952f32. plan 'all_access' is admitted by
-- the ladder relaxed in 20260623170000. Guarded on the user existing so a fresh
-- apply without Kate's auth row doesn't fail.
INSERT INTO public.agent_installs (user_id, agent_slug, plan)
SELECT u.id, s.slug, 'all_access'
FROM (VALUES ('893f40dc-2b51-4f10-bcfe-91fa6e952f32'::uuid)) AS u(id)
JOIN auth.users au ON au.id = u.id
CROSS JOIN (VALUES
  ('keeper'), ('vet-small-animal'), ('vet-large-animal'), ('vet-equine'),
  ('vet-exotic'), ('spca-workflow'), ('rescue-coordination'), ('doggy-daycare'),
  ('kakapo-recovery'), ('kiwi-conservation'), ('wildbase-recovery'), ('zoo-vet'),
  ('species-recovery')
) AS s(slug)
ON CONFLICT (user_id, agent_slug) DO UPDATE SET plan = 'all_access';

COMMIT;

-- ─────────────────────────────────────────────────────────────────────────
-- Verification
-- ─────────────────────────────────────────────────────────────────────────
--   SELECT slug, status, is_bundle_lead FROM public.agents
--     WHERE bundle = 'kaitiaki' ORDER BY is_bundle_lead DESC, slug;
--   -> 13 rows: keeper (lead, live) + 10 live specialists + kakapo-recovery,
--      kiwi-conservation (draft).
--   SELECT * FROM public.bundles WHERE slug = 'kaitiaki';  -- 1 row, lead=keeper.
--   SELECT count(*) FROM public.agent_installs
--     WHERE user_id = '893f40dc-2b51-4f10-bcfe-91fa6e952f32'
--       AND agent_slug IN (SELECT slug FROM public.agents WHERE bundle='kaitiaki');
--   -> 13 (all plan 'all_access'), IF Kate's auth.users row exists in this env.
