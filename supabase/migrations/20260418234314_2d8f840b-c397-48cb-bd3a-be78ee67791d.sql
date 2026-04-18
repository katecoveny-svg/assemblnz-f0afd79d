-- Add missing columns to existing kete_definitions table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='kete_definitions' AND column_name='te_reo_name') THEN
    ALTER TABLE public.kete_definitions ADD COLUMN te_reo_name TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='kete_definitions' AND column_name='display_order') THEN
    ALTER TABLE public.kete_definitions ADD COLUMN display_order INT DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='kete_definitions' AND column_name='icon') THEN
    ALTER TABLE public.kete_definitions ADD COLUMN icon TEXT;
  END IF;
END $$;

-- Ensure tenant_phone_numbers has is_default + label
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='tenant_phone_numbers' AND column_name='is_default') THEN
    ALTER TABLE public.tenant_phone_numbers ADD COLUMN is_default BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='tenant_phone_numbers' AND column_name='label') THEN
    ALTER TABLE public.tenant_phone_numbers ADD COLUMN label TEXT;
  END IF;
END $$;

-- Seed/refresh the 12 kete definitions (uses display_name + is_active per existing schema)
INSERT INTO public.kete_definitions (slug, display_name, te_reo_name, description, keywords, display_order, is_active) VALUES
  ('toroa',    'Family & Personal',       'Toro',      'Family concierge — meals, school, logistics, health, finances',
   ARRAY['family','dinner','meal','school','kids','doctor','gp','health','budget','recipe','lunch','breakfast','whanau','pet','vet','medication','homework'], 1, true),
  ('pakihi',   'Business Operations',     'Pakihi',    'General business advisor — compliance, strategy, admin',
   ARRAY['business','company','tax','gst','ird','invoice','accounting','register','abn','nzbn','insurance','contract'], 2, true),
  ('manaaki',  'Hospitality',             'Manaaki',   'Food safety, liquor licensing, staff scheduling',
   ARRAY['food','restaurant','alcohol','hospitality','menu','cafe','bar','kitchen','chef','liquor','hygiene','fcp','food safety'], 3, true),
  ('waihanga', 'Construction',            'Waihanga',  'Payment claims, site safety, consent tracking',
   ARRAY['build','construct','safety','site','scaffold','consent','building code','h&s','worksafe','payment claim','retention','variation'], 4, true),
  ('auaha',    'Creative & Marketing',    'Auaha',     'Campaign workflows, brand compliance, lead generation',
   ARRAY['marketing','brand','campaign','social','content','design','creative','advertising','seo','email','newsletter'], 5, true),
  ('arataki',  'Automotive & Fleet',      'Arataki',   'Vehicle compliance, workshop scheduling, fleet management',
   ARRAY['vehicle','car','fleet','wof','rego','workshop','automotive','truck','van','mechanic','service','warrant'], 6, true),
  ('pikau',    'Customs & Freight',       'Pikau',     'Customs declarations, freight tracking, border compliance',
   ARRAY['customs','freight','import','export','shipping','container','border','tariff','cargo','logistics','tracking'], 7, true),
  ('aroha',    'HR & Employment',         'Aroha',     'Employment law, payroll, leave, recruitment',
   ARRAY['job','employ','wage','leave','hr','staff','hiring','recruit','redundan','holiday','sick leave','kiwisaver','payroll','performance'], 8, true),
  ('hoa',      'Property & Tenancy',      'Hoa',       'Tenancy agreements, property management, maintenance',
   ARRAY['rent','tenant','landlord','property','lease','bond','maintenance','flat','house','accommodation','rta'], 9, true),
  ('mahi',     'Trades & Services',       'Mahi',      'Quoting, job management, certification tracking',
   ARRAY['trade','plumber','electrician','quote','job','certification','apprentice','tools','site'], 10, true),
  ('hauora',   'Health & Wellness',       'Hauora',    'Health navigation, appointment booking, wellness tracking',
   ARRAY['health','medical','nurse','prescription','clinic','hospital','mental','wellbeing','physio','dental','dentist'], 11, true),
  ('whakaari', 'Events & Entertainment',  'Whakaari',  'Event planning, venue management, ticketing',
   ARRAY['event','venue','ticket','wedding','party','concert','conference','festival','booking','catering'], 12, true)
ON CONFLICT (slug) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  te_reo_name = EXCLUDED.te_reo_name,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- Ensure default Assembl tenant exists
INSERT INTO public.tenants (id, name, slug, status)
VALUES ('00000000-0000-0000-0000-000000000001', 'Assembl', 'assembl', 'active')
ON CONFLICT (id) DO NOTHING;

-- Ensure default router number exists
INSERT INTO public.tenant_phone_numbers (tenant_id, phone_number, channel, label, is_default)
VALUES ('00000000-0000-0000-0000-000000000001', '__default__', 'sms', 'Default Assembl Router', true)
ON CONFLICT (phone_number, channel) DO NOTHING;

-- Backfill tenant_id on existing messaging data
UPDATE public.messaging_conversations
SET tenant_id = '00000000-0000-0000-0000-000000000001'
WHERE tenant_id IS NULL;

UPDATE public.messaging_messages
SET tenant_id = '00000000-0000-0000-0000-000000000001'
WHERE tenant_id IS NULL;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tenant_phone_lookup ON public.tenant_phone_numbers(phone_number, channel);
CREATE INDEX IF NOT EXISTS idx_kete_slug ON public.kete_definitions(slug);
CREATE INDEX IF NOT EXISTS idx_tenant_ketes_tenant ON public.tenant_ketes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_conversations_tenant ON public.messaging_conversations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_messages_tenant ON public.messaging_messages(tenant_id);