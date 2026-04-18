-- ═══════════════════════════════════════════════════════════════
-- Iho Multi-Tenant Architecture (adapted to existing tenants table)
-- ═══════════════════════════════════════════════════════════════

-- ── 1. Extend existing tenants table ────────────────────────
ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';

-- Backfill slug for existing rows from name (lowercase, hyphenated) where null
UPDATE public.tenants
SET slug = lower(regexp_replace(coalesce(name, id::text), '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL;

-- Add unique constraint if not present
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'tenants_slug_unique'
  ) THEN
    ALTER TABLE public.tenants ADD CONSTRAINT tenants_slug_unique UNIQUE (slug);
  END IF;
END $$;

-- ── 2. tenant_phone_numbers ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tenant_phone_numbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'sms',
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (phone_number, channel)
);

CREATE INDEX IF NOT EXISTS idx_tenant_phone_numbers_lookup
  ON public.tenant_phone_numbers (phone_number, channel);

ALTER TABLE public.tenant_phone_numbers ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Tenant phone numbers readable by everyone"
    ON public.tenant_phone_numbers FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Tenant phone numbers writable by service role"
    ON public.tenant_phone_numbers FOR ALL TO service_role USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── 3. kete_definitions ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.kete_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  handler_fn TEXT,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  category TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.kete_definitions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Kete definitions readable by everyone"
    ON public.kete_definitions FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Kete definitions writable by service role"
    ON public.kete_definitions FOR ALL TO service_role USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_kete_definitions_updated_at
    BEFORE UPDATE ON public.kete_definitions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── 4. tenant_ketes ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tenant_ketes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  kete_id UUID NOT NULL REFERENCES public.kete_definitions(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT true,
  display_name TEXT,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, kete_id)
);

ALTER TABLE public.tenant_ketes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Tenant ketes readable by everyone"
    ON public.tenant_ketes FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Tenant ketes writable by service role"
    ON public.tenant_ketes FOR ALL TO service_role USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── 5. Add tenant_id columns to existing tables ─────────────
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='messaging_conversations') THEN
    ALTER TABLE public.messaging_conversations ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);
    CREATE INDEX IF NOT EXISTS idx_messaging_conversations_tenant ON public.messaging_conversations (tenant_id);
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='messaging_messages') THEN
    ALTER TABLE public.messaging_messages ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);
    CREATE INDEX IF NOT EXISTS idx_messaging_messages_tenant ON public.messaging_messages (tenant_id);
  END IF;
END $$;

ALTER TABLE public.agent_prompts ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='toroa_families') THEN
    ALTER TABLE public.toroa_families ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);
  END IF;
END $$;

-- ── 6. Seed Assembl as default tenant ───────────────────────
INSERT INTO public.tenants (id, name, slug, status)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Assembl',
  'assembl',
  'active'
)
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, status = EXCLUDED.status;

-- ── 7. Seed 12 kete definitions ─────────────────────────────
INSERT INTO public.kete_definitions (slug, display_name, description, keywords, category) VALUES
  ('toroa',    'TŌRO / Whānau',          'Family life navigator — meals, schedules, reminders',  ARRAY['toroa','toro','family','whanau'], 'family'),
  ('hoa',      'HOA / Personal',          'Personal companion and life admin',                    ARRAY['hoa','personal','me'],            'personal'),
  ('whakaari', 'WHAKAARI / Events',       'Events, bookings, hospitality',                        ARRAY['whakaari','event','booking'],     'events'),
  ('pakihi',   'PAKIHI / Business',       'Small business operations',                            ARRAY['pakihi','business','biz'],        'business'),
  ('mahi',     'MAHI / Work',             'Work, jobs, contractors',                              ARRAY['mahi','work','job'],              'work'),
  ('manaaki',  'MANAAKI / Hospitality',   'Hospitality, accommodation, guest care',               ARRAY['manaaki','hospitality','hotel'],  'hospitality'),
  ('waihanga', 'WAIHANGA / Construction', 'Construction, trades, projects',                       ARRAY['waihanga','build','construction'],'construction'),
  ('auaha',    'AUAHA / Creative',        'Creative studio — content, design, video',             ARRAY['auaha','creative','design'],      'creative'),
  ('arataki',  'ARATAKI / Automotive',    'Fleet, vehicles, drivers',                             ARRAY['arataki','fleet','vehicle'],      'automotive'),
  ('pikau',    'PIKAU / Logistics',       'Customs, shipping, logistics',                         ARRAY['pikau','logistics','shipping'],   'logistics'),
  ('ako',      'AKO / Education',         'Education, training, learning',                        ARRAY['ako','education','learn'],        'education'),
  ('kainga',   'KĀINGA / Property',       'Property, rentals, compliance',                        ARRAY['kainga','property','rental'],     'property')
ON CONFLICT (slug) DO NOTHING;

-- ── 8. Bind default phone-number sentinel to Assembl ────────
INSERT INTO public.tenant_phone_numbers (tenant_id, phone_number, channel, is_default)
VALUES
  ('00000000-0000-0000-0000-000000000001'::uuid, '__default__', 'sms', true),
  ('00000000-0000-0000-0000-000000000001'::uuid, '__default__', 'whatsapp', true)
ON CONFLICT (phone_number, channel) DO NOTHING;

-- ── 9. resolve_tenant_from_phone RPC ────────────────────────
CREATE OR REPLACE FUNCTION public.resolve_tenant_from_phone(p_phone TEXT, p_channel TEXT)
RETURNS UUID
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id FROM (
    SELECT tenant_id, 1 AS rank FROM public.tenant_phone_numbers
      WHERE phone_number = p_phone AND channel = p_channel
    UNION ALL
    SELECT tenant_id, 2 AS rank FROM public.tenant_phone_numbers
      WHERE phone_number = '__default__' AND channel = p_channel
    UNION ALL
    SELECT '00000000-0000-0000-0000-000000000001'::uuid AS tenant_id, 3 AS rank
  ) t
  ORDER BY rank
  LIMIT 1;
$$;