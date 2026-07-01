-- ============================================================================
-- Happy Tails × Keeper — pilot tenant data + Franklin seed
-- ----------------------------------------------------------------------------
-- Fast-follow fix for PR #619: the original migration used timestamp
-- 20260701140000, which COLLIDES with #611's already-merged
-- 20260701140000_tenant_air_nz_pilot.sql (shared tenant_customers registry).
-- Bumped to 180000 — 150000 (kaitiaki/everyday-rewards), 160000 (lula inn) and
-- 170000 (air-nz ops) are all taken by already-merged pilots.
--
-- Reuses #611's shared public.tenant_customers registry (columns: slug,
-- display_name, status, brand, meta) — this migration only UPSERTS the
-- happy-tails row, it does not redefine the table.
--
-- Adds the Happy-Tails-specific tables (tenant_dogs, tenant_sms_threads) +
-- a dedicated admin-only tenant_xero_tokens table for OAuth secrets. Xero
-- tokens are NOT stored on tenant_customers because that table is anon-readable
-- (#611 grants anon SELECT for public workspace chrome); secrets must stay locked.
--
-- STATUS: demo · pending Liana sign-off. Owner is Kate Hudson. Nothing auto-sends.
-- PII (owner/parent names, phones, emails) lives in tenant_dogs / tenant_sms_threads,
-- both RLS-LOCKED (admin-only + service-role; NOT anon). The public
-- /customers/happy-tails/keeper routes render from lib/tenants/happy-tails/data.ts;
-- these tables are the seeded, RLS-locked mirror.
--
-- Idempotent + self-healing (safe to re-apply). Fresh-apply safe.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- tenant_dogs — the dog register (Franklin is record #1). FK to #611's registry.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tenant_dogs (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        uuid NOT NULL REFERENCES public.tenant_customers(id) ON DELETE CASCADE,
  slug             text NOT NULL,
  name             text NOT NULL,
  breed            text,
  size_tier        text CHECK (size_tier IN ('small','medium','large')),
  discount_pct     integer NOT NULL DEFAULT 0,
  medical_notes    jsonb NOT NULL DEFAULT '{}'::jsonb,
  addresses        jsonb NOT NULL DEFAULT '[]'::jsonb,
  weekly_schedule  jsonb NOT NULL DEFAULT '{}'::jsonb,
  vaccinations     jsonb NOT NULL DEFAULT '[]'::jsonb,
  owner_name       text,
  owner_email      text,
  owner_phone      text,
  xero_contact_id  text,
  welcomed_at      date,
  created_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, slug)
);
CREATE INDEX IF NOT EXISTS tenant_dogs_tenant_idx ON public.tenant_dogs (tenant_id);

-- ---------------------------------------------------------------------------
-- tenant_sms_threads — per-dog SMS thread (Mathis ⇄ owner), the reference voice
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tenant_sms_threads (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid NOT NULL REFERENCES public.tenant_customers(id) ON DELETE CASCADE,
  dog_id      uuid REFERENCES public.tenant_dogs(id) ON DELETE CASCADE,
  carer_name  text NOT NULL,
  phone       text,
  messages    jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS tenant_sms_threads_tenant_idx ON public.tenant_sms_threads (tenant_id);
CREATE INDEX IF NOT EXISTS tenant_sms_threads_dog_idx    ON public.tenant_sms_threads (dog_id);

-- ---------------------------------------------------------------------------
-- tenant_xero_tokens — OAuth tokens, admin-only. NOT on the anon-readable
-- tenant_customers registry. Encrypted at rest via Supabase Vault where available.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tenant_xero_tokens (
  tenant_slug text PRIMARY KEY,
  tokens      jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- RLS — locked. Admin-only read/write; service-role bypasses for server render.
-- NOT granted to anon (PII + secrets).
-- ---------------------------------------------------------------------------
ALTER TABLE public.tenant_dogs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_sms_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_xero_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant_dogs admin all" ON public.tenant_dogs;
CREATE POLICY "tenant_dogs admin all" ON public.tenant_dogs
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "tenant_sms_threads admin all" ON public.tenant_sms_threads;
CREATE POLICY "tenant_sms_threads admin all" ON public.tenant_sms_threads
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "tenant_xero_tokens admin all" ON public.tenant_xero_tokens;
CREATE POLICY "tenant_xero_tokens admin all" ON public.tenant_xero_tokens
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tenant_dogs        TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tenant_sms_threads TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tenant_xero_tokens TO service_role;

-- ---------------------------------------------------------------------------
-- Seed — upsert the happy-tails row into #611's shared registry (display_name /
-- brand / meta), then Franklin (record #1) + the Mathis SMS thread. Owner = Kate Hudson.
-- Real artefacts (INV-3031, Welcome Pack, Mathis SMS thread), Kate 2026-07-01.
-- ---------------------------------------------------------------------------
INSERT INTO public.tenant_customers (slug, display_name, status, brand, meta)
VALUES (
  'happy-tails',
  'Happy Tails Daycare & Boarding',
  'demo',
  jsonb_build_object(
    'logo', 'sketch-dachshund',
    'colors', jsonb_build_object(
      'bg', '#FAF7F2', 'ink', '#1a1712', 'canary', '#FFD42A',
      'canarySoft', '#fff4c9', 'brown', '#7a4e2c'
    ),
    'fonts', jsonb_build_object('serif', 'Cormorant Garamond', 'sans', 'Inter')
  ),
  jsonb_build_object(
    'workspace', 'keeper',
    'tagline', 'We care for every dog as if they were our own.',
    'location', 'Riverhead, West Auckland',
    'email', 'admin@happytailsdaycare.co.nz',
    'phone', '021 183 7956',
    'gst', '142-043-939',
    'website', 'www.happytailsdaycare.co.nz',
    'instagram', '@happytailsnz',
    'pricing', jsonb_build_object('daycareWithBus', 57.0, 'overnight', 95.0, 'smallPupDiscountPct', 10)
  )
)
ON CONFLICT (slug) DO UPDATE
  SET display_name = EXCLUDED.display_name, brand = EXCLUDED.brand, meta = EXCLUDED.meta, updated_at = now();

INSERT INTO public.tenant_dogs (
  tenant_id, slug, name, breed, size_tier, discount_pct,
  medical_notes, addresses, weekly_schedule, vaccinations,
  owner_name, owner_email, owner_phone, xero_contact_id, welcomed_at
)
SELECT
  tc.id, 'franklin', 'Franklin', 'Long-haired dachshund (black)', 'small', 10,
  '{"allergies": null, "notes": null}'::jsonb,
  '[{"label":"Default pickup","address":"802 / 70 Daldy St, Auckland CBD","isDefault":true},{"label":"Secondary — some days","address":"Kohimarama","days":["Tue"]}]'::jsonb,
  '{"summary":"Wednesday check-in / Thursday check-out","in":"Wed","out":"Thu"}'::jsonb,
  '[{"name":"DHPP","status":"current","expiry":"2026-08-14"},{"name":"Kennel cough (bordetella)","status":"due-soon","expiry":"2026-08-05"},{"name":"Leptospirosis","status":"current","expiry":"2026-08-14"}]'::jsonb,
  'Kate Hudson', NULL, NULL, 'ht-contact-kate-hudson', '2026-01-25'
FROM public.tenant_customers tc
WHERE tc.slug = 'happy-tails'
ON CONFLICT (tenant_id, slug) DO UPDATE
  SET breed = EXCLUDED.breed, size_tier = EXCLUDED.size_tier, discount_pct = EXCLUDED.discount_pct,
      addresses = EXCLUDED.addresses, weekly_schedule = EXCLUDED.weekly_schedule,
      vaccinations = EXCLUDED.vaccinations, owner_name = EXCLUDED.owner_name,
      xero_contact_id = EXCLUDED.xero_contact_id, welcomed_at = EXCLUDED.welcomed_at;

-- Mathis SMS thread with Kate (real artefact IMG_1527). Seed once; skip on re-apply.
INSERT INTO public.tenant_sms_threads (tenant_id, dog_id, carer_name, phone, messages)
SELECT
  tc.id, td.id, 'Mathis', NULL,
  '[
    {"from":"carer","carer":"Mathis","text":"Hi there, Pick for Franklin tomorrow will be between 7.30-8.00am. City address right? Thanks Mathis 😀","at":"Tue 7:42pm"},
    {"from":"owner","text":"Perfect, yes CBD tomorrow 🙏","at":"Tue 7:48pm"},
    {"from":"carer","carer":"Mathis","text":"Hi there, Franklin''s in and settled — on the couch already 😀 All good on this end, catch you at pickup. Mathis","at":"Wed 9:10am"},
    {"from":"carer","carer":"Mathis","text":"Hi there, Franklin''s home and washed, had a solid day with the small pack, ate his lunch, no issues. Same time next week — Wed in, Thu out? Thanks Mathis 😀","at":"Thu 4:02pm"},
    {"from":"owner","text":"He''s zonked, thank you both ❤️","at":"Thu 4:15pm"}
  ]'::jsonb
FROM public.tenant_customers tc
JOIN public.tenant_dogs td ON td.tenant_id = tc.id AND td.slug = 'franklin'
WHERE tc.slug = 'happy-tails'
  AND NOT EXISTS (
    SELECT 1 FROM public.tenant_sms_threads t
    WHERE t.tenant_id = tc.id AND t.dog_id = td.id AND t.carer_name = 'Mathis'
  );

-- ---------------------------------------------------------------------------
-- tenant_team_members — Happy Tails staff + per-member voice profile for Keeper
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tenant_team_members (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     uuid NOT NULL REFERENCES public.tenant_customers(id) ON DELETE CASCADE,
  name          text NOT NULL,
  role          text NOT NULL CHECK (role IN ('owner','carer','vet','bus driver','handler')),
  phone         text,
  email         text,
  shifts        jsonb NOT NULL DEFAULT '{}'::jsonb,       -- {mon:{am,pm}, ...}
  voice_profile jsonb NOT NULL DEFAULT '{}'::jsonb,       -- {channel, tone, samples[]}
  permissions   text NOT NULL DEFAULT 'draft only'
                  CHECK (permissions IN ('approve outgoing','draft only','read-only')),
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, name)
);
CREATE INDEX IF NOT EXISTS tenant_team_members_tenant_idx ON public.tenant_team_members (tenant_id);

-- ---------------------------------------------------------------------------
-- dog_events — the per-dog live timeline (bookings, SMS, packs, invoices,
-- incidents, notes, field edits). Every field edit also writes a note event so
-- the Mana Receipt trail captures who changed what when.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.dog_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid NOT NULL REFERENCES public.tenant_customers(id) ON DELETE CASCADE,
  dog_id      uuid NOT NULL REFERENCES public.tenant_dogs(id) ON DELETE CASCADE,
  event_type  text NOT NULL CHECK (event_type IN
                ('booking','sms','email','welcome_pack','invoice','incident','note','vaccination','field_edit')),
  actor       text,
  payload     jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS dog_events_dog_idx  ON public.dog_events (dog_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS dog_events_tenant_idx ON public.dog_events (tenant_id);

ALTER TABLE public.tenant_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dog_events          ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant_team_members admin all" ON public.tenant_team_members;
CREATE POLICY "tenant_team_members admin all" ON public.tenant_team_members
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "dog_events admin all" ON public.dog_events;
CREATE POLICY "dog_events admin all" ON public.dog_events
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tenant_team_members TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dog_events          TO service_role;

-- Seed the team — Liana (owner/email voice) + Mathis (carer/driver/SMS voice).
INSERT INTO public.tenant_team_members (tenant_id, name, role, phone, email, shifts, voice_profile, permissions)
SELECT tc.id, v.name, v.role, v.phone, v.email, v.shifts::jsonb, v.voice_profile::jsonb, v.permissions
FROM public.tenant_customers tc
CROSS JOIN (VALUES
  ('Liana Coleman', 'owner', NULL, 'admin@happytailsdaycare.co.nz',
   '{"mon":{"am":true,"pm":true},"tue":{"am":true,"pm":true},"wed":{"am":true,"pm":true},"thu":{"am":true,"pm":true},"fri":{"am":true,"pm":true},"sat":{"am":false,"pm":false},"sun":{"am":false,"pm":false}}',
   '{"channel":"email","tone":"warm, formal, considered","opener":"Kia ora","signoff":"Warmly, Liana × Happy Tails","samples":["We care for every dog as if they were our own.","We are so pleased to welcome your pup into the Happy Tails family."]}',
   'approve outgoing'),
  ('Mathis', 'carer', NULL, NULL,
   '{"mon":{"am":true,"pm":true},"tue":{"am":true,"pm":true},"wed":{"am":true,"pm":true},"thu":{"am":true,"pm":true},"fri":{"am":true,"pm":true},"sat":{"am":false,"pm":false},"sun":{"am":false,"pm":false}}',
   '{"channel":"sms","tone":"casual, brief, personal","opener":"Hi there","signoff":"Thanks Mathis 😀","samples":["Hi there, Pick for your pup tomorrow will be between 7.30-8.00am. City address right? Thanks Mathis 😀"]}',
   'draft only')
) AS v(name, role, phone, email, shifts, voice_profile, permissions)
WHERE tc.slug = 'happy-tails'
ON CONFLICT (tenant_id, name) DO UPDATE
  SET role = EXCLUDED.role, email = EXCLUDED.email, shifts = EXCLUDED.shifts,
      voice_profile = EXCLUDED.voice_profile, permissions = EXCLUDED.permissions;

-- Seed Franklin's opening timeline events (idempotent: only if he has none yet).
INSERT INTO public.dog_events (tenant_id, dog_id, event_type, actor, payload, occurred_at)
SELECT tc.id, td.id, e.event_type, e.actor, e.payload::jsonb, e.occurred_at::timestamptz
FROM public.tenant_customers tc
JOIN public.tenant_dogs td ON td.tenant_id = tc.id AND td.slug = 'franklin'
CROSS JOIN (VALUES
  ('welcome_pack', 'Liana', '{"title":"Welcome Pack sent","detail":"5-page pack emailed to Kate Hudson"}', '2026-01-25T08:12:00Z'),
  ('booking',      'System', '{"title":"Weekly recurring booked","detail":"Wed check-in / Thu check-out"}', '2026-01-25T09:00:00Z'),
  ('sms',          'Mathis', '{"title":"Pickup SMS","detail":"City address confirmed 7.30-8.00am"}', '2026-06-10T19:42:00Z'),
  ('invoice',      'Liana', '{"title":"INV-3031 issued","detail":"June — 4 daycare + 5 overnight = NZ$665"}', '2026-06-15T10:00:00Z'),
  ('vaccination',  'Keeper', '{"title":"Kennel cough reminder drafted","detail":"Due ~5 Aug 2026 — email awaiting Liana"}', '2026-07-01T08:41:00Z')
) AS e(event_type, actor, payload, occurred_at)
WHERE tc.slug = 'happy-tails'
  AND NOT EXISTS (SELECT 1 FROM public.dog_events de WHERE de.dog_id = td.id);
