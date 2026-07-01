-- Auckland Zoo × Keeper — hosted-pilot workspace scaffold + demo seed.
--
-- Ships the multi-tenant scaffold for white-labelled customer pilot workspaces
-- (Kaitiaki spec 2026-06-29 §5.6 — the cold-outreach flagship for the zoo-vet +
-- conservation half of Keeper) plus the Auckland Zoo demo dataset.
--
-- CONCEPT · PENDING. Not a live Auckland Zoo partnership. Every seeded record is
-- either drawn from Auckland Zoo PUBLIC materials (marked 'public') or is an
-- assembl-authored demo scenario from the spec's own §5.6.5 mockups (marked
-- 'scenario'). No clinical or welfare data is fabricated. Whakapapa / cultural
-- content for taonga species is HELD for iwi consultation — never seeded, never
-- model-generated (see the `naming_held` + `taonga` flags).
--
-- SOURCE OF TRUTH NOTE: the workspace pages render from CODE
-- (lib/customers/auckland-zoo/data.ts + lib/customers/tenant-registry.ts), so
-- the pilot renders deterministically on deploy regardless of whether this seed
-- has been applied. These tables are the durable mirror, matching the
-- established repo pattern (memory reference_agent_prompts_live_in_code).
--
-- Idempotent + self-healing: every table is CREATE ... IF NOT EXISTS; every
-- seed is an upsert keyed by a stable natural key. RLS is enabled with no anon
-- policy — the app never reads these from the browser; server-side access is via
-- the service role, which bypasses RLS (the arataki operator pattern).

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────
-- 1 · tenant_customers — reusable hosted-pilot registry
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tenant_customers (
  slug         text PRIMARY KEY,
  name         text NOT NULL,
  agent        text NOT NULL DEFAULT 'keeper',
  bundle       text,
  status       text NOT NULL DEFAULT 'concept-pending',
  tagline      text,
  brand        jsonb NOT NULL DEFAULT '{}'::jsonb,
  mark_label   text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.tenant_customers (slug, name, agent, bundle, status, tagline, brand, mark_label)
VALUES (
  'auckland-zoo',
  'Auckland Zoo',
  'keeper',
  'Kaitiaki',
  'concept-pending',
  'Keeper — animal-first drafting for the NZCCM, keepers and education team',
  jsonb_build_object(
    'primary', '#1F5132',
    'primaryDeep', '#12341F',
    'primarySoft', '#E4EBE0',
    'accent', '#B5732E',
    'cream', '#F7F3E9',
    'surface', '#FFFFFF',
    'ink', '#22271F',
    'muted', '#5E655A',
    'line', '#E1DCCB'
  ),
  'AZ'
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  bundle = EXCLUDED.bundle,
  status = EXCLUDED.status,
  tagline = EXCLUDED.tagline,
  brand = EXCLUDED.brand,
  mark_label = EXCLUDED.mark_label,
  updated_at = now();

-- ─────────────────────────────────────────────────────────────────────────
-- 2 · tenant_zoo_species — Zoo Threatened Species Recovery participation
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tenant_zoo_species (
  tenant_slug        text NOT NULL REFERENCES public.tenant_customers(slug) ON DELETE CASCADE,
  slug               text NOT NULL,
  name               text NOT NULL,
  scientific_name    text,
  species_group      text,                     -- 'megafauna' | 'native-taonga'
  taonga             boolean NOT NULL DEFAULT false,
  recovery_programme text,
  breeding_plan      text,
  breeding_progress  int NOT NULL DEFAULT 0,
  welfare_status     text NOT NULL DEFAULT 'compliant',
  blurb              text,
  created_at         timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_slug, slug)
);

INSERT INTO public.tenant_zoo_species
  (tenant_slug, slug, name, scientific_name, species_group, taonga, recovery_programme, breeding_plan, breeding_progress, welfare_status, blurb)
VALUES
  ('auckland-zoo', 'kiwi', 'North Island brown kiwi', 'Apteryx mantelli', 'native-taonga', true,
   'Operation Nest Egg · Te Wao Nui kōhanga · 410+ hatched & released', 'Kōhanga crèche — chicks reared to ~1200g before island release', 78, 'compliant',
   'Every kiwi chick hatched at the NZCCM kōhanga is reared until strong enough to face life on a predator-free island.'),
  ('auckland-zoo', 'tuatara', 'Tuatara', 'Sphenodon punctatus', 'native-taonga', true,
   'Headstart programme (wrapped after 30+ years — population targets met)', 'Resident collection · Te Wao Nui native-reptile precinct', 100, 'compliant',
   'A living link to the age of dinosaurs, cared for in the Te Wao Nui native-reptile precinct.'),
  ('auckland-zoo', 'orangutan', 'Sumatran orangutan', 'Pongo abelii', 'megafauna', false,
   'ZAA / regional studbook — critically endangered ex-situ programme', 'Regional breeding recommendation — studbook-managed', 55, 'review-due',
   'A family of critically endangered Sumatran orangutans, part of a regionally-managed breeding programme.'),
  ('auckland-zoo', 'giraffe', 'Giraffe', 'Giraffa camelopardalis', 'megafauna', false,
   'ZAA regional collection plan', 'Regional herd management — studbook-managed', 40, 'compliant',
   'The Auckland Zoo giraffe herd is part of a regional collection plan and a favourite of the daily keeper talks.'),
  ('auckland-zoo', 'rhino', 'Southern white rhinoceros', 'Ceratotherium simum simum', 'megafauna', false,
   'ZAA regional collection plan — near-threatened', 'Regional herd management — studbook-managed', 35, 'gap-flagged',
   'Southern white rhinos are among the flagship megafauna, cared for by the NZCCM veterinary team.')
ON CONFLICT (tenant_slug, slug) DO UPDATE SET
  name = EXCLUDED.name,
  recovery_programme = EXCLUDED.recovery_programme,
  breeding_plan = EXCLUDED.breeding_plan,
  breeding_progress = EXCLUDED.breeding_progress,
  welfare_status = EXCLUDED.welfare_status,
  blurb = EXCLUDED.blurb;

-- ─────────────────────────────────────────────────────────────────────────
-- 3 · tenant_zoo_animals — individual named animals (demo records)
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tenant_zoo_animals (
  id            text PRIMARY KEY,
  tenant_slug   text NOT NULL REFERENCES public.tenant_customers(slug) ON DELETE CASCADE,
  species_slug  text NOT NULL,
  name          text NOT NULL,
  naming_held   boolean NOT NULL DEFAULT false,  -- true = held for iwi consultation
  sex           text,
  age           text,
  status        text,
  status_tone   text NOT NULL DEFAULT 'ok',
  provenance    text NOT NULL,                   -- 'public' | 'scenario' descriptor
  created_at    timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.tenant_zoo_animals
  (id, tenant_slug, species_slug, name, naming_held, sex, age, status, status_tone, provenance)
VALUES
  ('kiwi-kohanga-chick', 'auckland-zoo', 'kiwi', 'Kōhanga chick (naming held for iwi)', true, 'unknown', 'Hatched 2026-06-30 · 320 g at hatch',
   'Bright, alert, feeding — early-life kōhanga care', 'ok', 'mock draft — demo scenario (Kaitiaki spec §5.6.5)'),
  ('tuatara-demo-01', 'auckland-zoo', 'tuatara', 'Te Wao Nui resident (demo)', false, 'unknown', 'Adult',
   'Routine husbandry — no clinical entries in demo workspace', 'ok', 'demo record — Auckland Zoo public data'),
  ('orangutan-anouk', 'auckland-zoo', 'orangutan', 'Anouk', false, 'F', 'Adult female',
   'Routine health monitoring — annual check scheduled', 'ok', 'demo record — Auckland Zoo public data (widely published orangutan)'),
  ('giraffe-demo-01', 'auckland-zoo', 'giraffe', 'Herd member (demo)', false, 'unknown', 'Adult',
   'Routine husbandry — no clinical entries in demo workspace', 'ok', 'demo record — Auckland Zoo public data'),
  ('rhino-zambezi', 'auckland-zoo', 'rhino', 'Zambezi', false, 'F', '24 yo',
   'Acute front-left lameness post-transfer — NZCCM assessment pending', 'urgent', 'mock draft — demo scenario (Kaitiaki spec §5.6.5)')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  status = EXCLUDED.status,
  status_tone = EXCLUDED.status_tone,
  provenance = EXCLUDED.provenance;

-- ─────────────────────────────────────────────────────────────────────────
-- 4 · tenant_zoo_clinical_notes — unsigned SOAP drafts (scenario only)
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tenant_zoo_clinical_notes (
  id            text PRIMARY KEY,
  tenant_slug   text NOT NULL REFERENCES public.tenant_customers(slug) ON DELETE CASCADE,
  animal_id     text NOT NULL,
  species_slug  text NOT NULL,
  note_type     text NOT NULL,                   -- 'routine' | 'procedure' | 'incident'
  note_date     text,
  reviewer      text NOT NULL,                   -- who the unsigned draft is FOR
  status        text NOT NULL DEFAULT 'draft-for-review',
  soap          jsonb NOT NULL,
  stamps        jsonb NOT NULL DEFAULT '{}'::jsonb,
  provenance    text NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.tenant_zoo_clinical_notes
  (id, tenant_slug, animal_id, species_slug, note_type, note_date, reviewer, status, soap, stamps, provenance)
VALUES (
  'cn-zambezi-2026-07-01', 'auckland-zoo', 'rhino-zambezi', 'rhino', 'incident', '2026-07-01 10:14',
  'James Chatterton (Manager of Veterinary Services) or on-shift NZCCM vet', 'draft-for-review',
  jsonb_build_object(
    's', 'Non weight-bearing front left forelimb, observed by keeper on shift after morning transfer to outer paddock. Loading normally on RH, LH, RF. Appetite normal. Annual TB re-check due next week.',
    'o', 'Not yet examined. NZCCM vet to complete standing assessment ± hoist-crush if lameness grade > 3/5.',
    'a', 'Acute-onset unilateral forelimb lameness post-transfer. Differentials: soft-tissue injury (most likely), sole abscess / nail-bed infection, foreign body, and less likely septic pedal osteitis or DJD. TB not interpreted as related unless systemic signs emerge.',
    'p', 'Confine; withhold transfer; NZCCM standing assessment today; consider NSAID after exam per AZWMP formulary cross-checked against VetMed NZ; foot lift + inspection; re-assess 24h; TB re-check next week unless deferred for welfare.'
  ),
  jsonb_build_object(
    'disclaimer', 'Unsigned draft for a registered veterinarian to review and sign. assembl is not a veterinary practice and has not examined this animal.',
    'tikangaGate', 'pass',
    'kaitiakiReviewer', 'N/A (no taonga species implicated)'
  ),
  'mock draft — demo scenario (Kaitiaki spec §5.6.5)'
)
ON CONFLICT (id) DO UPDATE SET
  soap = EXCLUDED.soap,
  stamps = EXCLUDED.stamps,
  reviewer = EXCLUDED.reviewer;

-- ─────────────────────────────────────────────────────────────────────────
-- 5 · tenant_zoo_welfare_records — MPI Code of Welfare (Zoos) tracker (illustrative)
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tenant_zoo_welfare_records (
  id            text PRIMARY KEY,
  tenant_slug   text NOT NULL REFERENCES public.tenant_customers(slug) ON DELETE CASCADE,
  species_slug  text NOT NULL,
  enclosure     text NOT NULL,
  code_ref      text NOT NULL,
  requirement   text NOT NULL,
  status        text NOT NULL DEFAULT 'compliant',   -- compliant | review-due | gap-flagged
  note          text,
  last_checked  text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.tenant_zoo_welfare_records
  (id, tenant_slug, species_slug, enclosure, code_ref, requirement, status, note, last_checked)
VALUES
  ('wr-rhino-1', 'auckland-zoo', 'rhino', 'Rhino outer paddock',
   'MPI Code of Welfare (Zoos) — handling & transfer',
   'Welfare grade of large-mammal transfers must be assessable if a repeat pattern emerges.', 'gap-flagged',
   'Post-transfer lameness event (Zambezi) flagged against the transfer-handling standard. Illustrative only.', '2026-07-01'),
  ('wr-orangutan-1', 'auckland-zoo', 'orangutan', 'Orangutan habitat',
   'ZAA Accreditation Manual — enclosure enrichment',
   'Enrichment programme documented and reviewed for great apes.', 'review-due',
   'Quarterly enrichment review falls due this month. Illustrative only.', '2026-06-15'),
  ('wr-kiwi-1', 'auckland-zoo', 'kiwi', 'NZCCM kōhanga crèche',
   'MPI Code of Welfare (Zoos) — early-life care of native species',
   'Early-life husbandry parameters logged for reared chicks.', 'compliant',
   'Kōhanga chick husbandry log current. Taonga species — cultural content held for iwi.', '2026-07-01'),
  ('wr-tuatara-1', 'auckland-zoo', 'tuatara', 'Te Wao Nui native-reptile precinct',
   'MPI Code of Welfare (Zoos) — thermal & habitat provision (reptiles)',
   'Thermal gradient and habitat provision meet native-reptile standard.', 'compliant',
   'Precinct within standard. Taonga species — cultural content held for iwi.', '2026-06-20'),
  ('wr-giraffe-1', 'auckland-zoo', 'giraffe', 'Giraffe habitat',
   'ZAA Accreditation Manual — herd social structure',
   'Herd social grouping appropriate to species.', 'compliant',
   'Herd structure within standard. Illustrative only.', '2026-06-18')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  note = EXCLUDED.note,
  last_checked = EXCLUDED.last_checked;

-- ─────────────────────────────────────────────────────────────────────────
-- 6 · tenant_zoo_ops_modules — durable mirror of the operational modules
--     (staff/rosters, payroll, breeding calendar, transfers, events,
--      volunteers, enclosure H&S, visitor comms, recognition, finance,
--      leadership daily brief). The full demo dataset renders from CODE
--      (lib/customers/auckland-zoo/ops-data.ts); this table records that each
--      module exists so the pilot scope is durable and queryable. Payloads are
--      illustrative descriptors, not real operational, staffing, payroll or
--      financial records.
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tenant_zoo_ops_modules (
  tenant_slug  text NOT NULL REFERENCES public.tenant_customers(slug) ON DELETE CASCADE,
  module       text NOT NULL,
  title        text NOT NULL,
  summary      text,
  compliance   text,
  payload      jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_slug, module)
);

INSERT INTO public.tenant_zoo_ops_modules (tenant_slug, module, title, summary, compliance) VALUES
  ('auckland-zoo', 'roster', 'Staff & rosters', 'Shifts, on-call rotations and cover requests across enclosures.', 'Holidays Act 2003 (public holiday 1.5× + alternative day; weekend loading per collective agreement)'),
  ('auckland-zoo', 'payroll', 'Payroll', 'Timesheet coding + penalty-rate flags, drafted for approval.', 'Auckland Council payroll — read-only ITSM stub (Keeper never writes)'),
  ('auckland-zoo', 'breeding', 'Breeding programme calendar', 'Species-recovery breeding schedules and studbook milestones.', 'AZA / ZAA programme management; taonga content kaumātua-gated'),
  ('auckland-zoo', 'transfers', 'Animal transfer records', 'Incoming acquisitions and outgoing releases.', 'CITES permits · MPI Import Health Standard biosecurity · DOC Wildlife Act'),
  ('auckland-zoo', 'events', 'Events & programmes', 'School groups, night tours, keeper-for-a-day, corporate hires.', 'Health and Safety at Work Act 2015 briefings drafted'),
  ('auckland-zoo', 'volunteers', 'Volunteer management', 'Docents, education volunteers and backup keepers.', 'Police vetting (safety check) tracked; renewal reminders drafted'),
  ('auckland-zoo', 'enclosures', 'Enclosure H&S', 'Daily barrier, water-quality and feed-temp checks.', 'WorkSafe (HSWA 2015) / MPI notifiable-event drafting for a named manager to lodge'),
  ('auckland-zoo', 'visitor_comms', 'Visitor comms', 'Booking confirmations, group quotes, review responses.', 'Unsigned drafts for the comms/visitor-services team to send'),
  ('auckland-zoo', 'recognition', 'Staff recognition & CPD', 'Keeper-of-the-month, tenure milestones, CPD tracker.', 'Drafted for the people-and-culture lead to confirm'),
  ('auckland-zoo', 'finance', 'Finance & funding', 'Council reporting rollup, donations, grant applications.', 'DOC + philanthropic grants; Keeper drafts, finance approves — never moves money'),
  ('auckland-zoo', 'daily_brief', 'Leadership daily brief', 'Auto-drafted 07:00 brief for the Director + Vet Services Manager.', 'Unsigned draft; every underlying item links to a reviewable draft')
ON CONFLICT (tenant_slug, module) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  compliance = EXCLUDED.compliance;

-- ─────────────────────────────────────────────────────────────────────────
-- 7 · RLS — enable, no anon policy (server/service-role access only)
-- ─────────────────────────────────────────────────────────────────────────
ALTER TABLE public.tenant_customers           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_zoo_species         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_zoo_animals         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_zoo_clinical_notes  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_zoo_welfare_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_zoo_ops_modules     ENABLE ROW LEVEL SECURITY;

COMMIT;
