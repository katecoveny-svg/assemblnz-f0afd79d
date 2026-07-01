-- ============================================================================
-- Happy Tails × Keeper — pilot tenant tables + Franklin seed
-- ----------------------------------------------------------------------------
-- Multi-tenant scaffolding for the Kaitiaki bundle's doggy-daycare pilot.
-- Keeper (lead agent, bundle: Kaitiaki) drafts owner comms, Welcome Packs, bus
-- routes and Xero invoices for a licensed daycare operator. Every output is a
-- draft a human approves + sends — Keeper never sends.
--
-- STATUS: demo · pending Liana sign-off. No message is ever auto-sent.
--
-- PRIVACY: all owner/parent PII (Kate Hudson / Mathis / Franklin) lives inside
-- the tenant row and is RLS-LOCKED — admin-only read/write, service-role for
-- server rendering. NOT granted to anon. The public /customers/happy-tails/keeper
-- routes render from a code module (lib/tenants/happy-tails/data.ts); these tables
-- are the seeded, RLS-locked mirror for the real multi-tenant path.
--
-- Idempotent + self-healing (safe to re-apply). Fresh-apply safe.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- tenant_customers — one row per pilot tenant, brand tokens + Xero OAuth tokens
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tenant_customers (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         text UNIQUE NOT NULL,
  name         text NOT NULL,
  brand_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  xero_tokens  jsonb NOT NULL DEFAULT '{}'::jsonb,  -- encrypted at rest via Supabase Vault where available
  status       text NOT NULL DEFAULT 'demo' CHECK (status IN ('demo','active','paused')),
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- tenant_dogs — the dog register (Franklin is record #1)
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
-- RLS — locked. Admin-only read/write; service-role bypasses for server render.
-- NOT granted to anon: this is PII (owner/parent names, phones, emails).
-- ---------------------------------------------------------------------------
ALTER TABLE public.tenant_customers  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_dogs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_sms_threads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant_customers admin all" ON public.tenant_customers;
CREATE POLICY "tenant_customers admin all" ON public.tenant_customers
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

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

-- Service role (server components / edge functions) bypasses RLS by design.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tenant_customers  TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tenant_dogs       TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tenant_sms_threads TO service_role;

-- ---------------------------------------------------------------------------
-- Seed — Happy Tails tenant + Franklin (record #1) + the Mathis SMS thread.
-- Real artefacts (invoice INV-3031, Welcome Pack, Mathis SMS thread), Kate 2026-07-01.
-- Owner is Kate Hudson.
-- ---------------------------------------------------------------------------
INSERT INTO public.tenant_customers (slug, name, brand_config, status)
VALUES (
  'happy-tails',
  'Happy Tails Daycare & Boarding',
  jsonb_build_object(
    'tagline', 'We care for every dog as if they were our own.',
    'location', 'Riverhead, West Auckland',
    'email', 'admin@happytailsdaycare.co.nz',
    'phone', '021 183 7956',
    'gst', '142-043-939',
    'website', 'www.happytailsdaycare.co.nz',
    'instagram', '@happytailsnz',
    'logo', 'sketch-dachshund',
    'colors', jsonb_build_object(
      'bg', '#FAF7F2', 'ink', '#1a1712', 'canary', '#FFD42A',
      'canarySoft', '#fff4c9', 'brown', '#7a4e2c'
    ),
    'fonts', jsonb_build_object('serif', 'Cormorant Garamond', 'sans', 'Inter'),
    'pricing', jsonb_build_object('daycareWithBus', 57.0, 'overnight', 95.0, 'smallPupDiscountPct', 10)
  ),
  'demo'
)
ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, brand_config = EXCLUDED.brand_config, updated_at = now();

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
