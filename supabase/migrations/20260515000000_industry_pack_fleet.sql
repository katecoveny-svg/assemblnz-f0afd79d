-- Stage 1: Industry Pack fleet wiring.
-- Adds fleet metadata only; does not write or replace specialist system prompts.

INSERT INTO public.kete_definitions
  (slug, display_name, te_reo_name, description, keywords, display_order, is_active)
VALUES
  ('waihanga', 'Construction', 'Waihanga', 'Construction consent, safety, quality, BIM, materials, and handover work.', ARRAY['construction','building','consent','safety'], 4, true),
  ('manaaki', 'Hospitality', 'Manaaki', 'Food safety, liquor licensing, guest operations, and shift evidence.', ARRAY['hospitality','food','licensing','guest'], 3, true),
  ('pikau', 'Customs & Freight', 'Pīkau', 'Customs entries, HS classification, broker records, and freight documents.', ARRAY['customs','freight','shipping','broker'], 7, true),
  ('arataki', 'Automotive & Fleet', 'Arataki', 'Workshop, dealer, fleet, WoF, CoF, CGA, and IPP 3A workflows.', ARRAY['automotive','fleet','workshop','dealer'], 6, true),
  ('auaha', 'Creative & Marketing', 'Auaha', 'Campaign, brand, rights, and creative operations records.', ARRAY['creative','brand','campaign','studio'], 5, true),
  ('ako', 'Early Childhood Education', 'Ako', 'ECE licensing, Te Whāriki, ratios, kaiako, ERO, and tamariki safety.', ARRAY['ece','education','licensing','ero'], 10, true),
  ('matauranga', 'Secondary Education', 'Mātauranga', 'Secondary-school operator workflows: NCEA, reporting, and board prep.', ARRAY['secondary','ncea','school','ero'], 13, true),
  ('hoko', 'Retail', 'Hoko', 'Retail and consumer-protection workflows.', ARRAY['retail','consumer','stock','cga'], 14, true)
ON CONFLICT (slug) DO NOTHING;

ALTER TABLE public.agent_prompts
  ADD COLUMN phase TEXT;

ALTER TABLE public.agent_prompts
  ADD CONSTRAINT agent_prompts_phase_check
  CHECK (phase IS NULL OR phase IN ('hunt', 'pitch', 'execution', 'ledger', 'infra'));

ALTER TABLE public.agent_prompts
  ADD COLUMN kete_slug TEXT;

ALTER TABLE public.agent_prompts
  ADD CONSTRAINT agent_prompts_kete_slug_fkey
  FOREIGN KEY (kete_slug) REFERENCES public.kete_definitions(slug);

ALTER TABLE public.agent_prompts
  ADD COLUMN is_draft BOOLEAN NOT NULL DEFAULT true;

-- Existing prompt rows have content; the new placeholders below are the drafts.
UPDATE public.agent_prompts
SET is_draft = false,
    updated_at = now()
WHERE system_prompt IS NOT NULL
  AND system_prompt <> 'DRAFT — content pending';

WITH canon(agent_name, pack, kete_slug, phase) AS (
  VALUES
    ('kaupapa', 'waihanga', 'waihanga', 'pitch'),
    ('ata', 'waihanga', 'waihanga', 'execution'),
    ('rawa', 'waihanga', 'waihanga', 'execution'),
    ('whakaae', 'waihanga', 'waihanga', 'execution'),
    ('pai', 'waihanga', 'waihanga', 'ledger'),
    ('arai', 'waihanga', 'waihanga', 'ledger'),
    ('aura', 'manaaki', 'manaaki', 'pitch'),
    ('motor', 'arataki', 'arataki', 'hunt'),
    ('muse', 'auaha', 'auaha', 'hunt'),
    ('prism', 'auaha', 'auaha', 'pitch'),
    ('saffron', 'auaha', 'auaha', 'execution'),
    ('gateway', 'pikau', 'pikau', 'pitch'),
    ('pikau', 'pikau', 'pikau', 'execution'),
    ('transit', 'pikau', 'pikau', 'execution'),
    ('transit-freight', 'pikau', 'pikau', 'execution'),
    ('hoko-cga', 'hoko', 'hoko', 'pitch'),
    ('ako-licence', 'ako', 'ako', 'pitch'),
    ('cellar', 'hoko', 'hoko', 'execution'),
    ('iho', 'shared', NULL, 'infra'),
    ('signal', 'shared', NULL, 'infra')
)
UPDATE public.agent_prompts ap
SET pack = canon.pack,
    kete_slug = canon.kete_slug,
    phase = canon.phase,
    is_draft = false,
    updated_at = now()
FROM canon
WHERE lower(ap.agent_name) = canon.agent_name;

WITH placeholders(agent_name, pack, display_name, icon, kete_slug, phase) AS (
  VALUES
    ('hapori', 'waihanga', 'Hāpori', 'Users', 'waihanga', 'hunt'),
    ('manuhiri', 'manaaki', 'Manuhiri', 'ConciergeBell', 'manaaki', 'hunt'),
    ('kai', 'manaaki', 'Kai', 'Utensils', 'manaaki', 'execution'),
    ('hau', 'manaaki', 'Hau', 'HeartPulse', 'manaaki', 'execution'),
    ('mahi', 'manaaki', 'Mahi', 'CalendarClock', 'manaaki', 'execution'),
    ('putea', 'manaaki', 'Pūtea', 'Landmark', 'manaaki', 'ledger'),
    ('morunga', 'pikau', 'Mōrunga', 'Radar', 'pikau', 'hunt'),
    ('whaikorero', 'arataki', 'Whaikōrero', 'MessagesSquare', 'arataki', 'pitch'),
    ('whare', 'arataki', 'Whare', 'Warehouse', 'arataki', 'execution'),
    ('aroha', 'ako', 'Aroha', 'HeartHandshake', 'ako', 'hunt'),
    ('kaiako', 'ako', 'Kaiako', 'GraduationCap', 'ako', 'execution'),
    ('tamariki', 'ako', 'Tamariki', 'Baby', 'ako', 'execution'),
    ('ero-pack', 'ako', 'ERO-pack', 'FileArchive', 'ako', 'ledger'),
    ('akonga', 'matauranga', 'Ākonga', 'School', 'matauranga', 'hunt'),
    ('kaiako-s', 'matauranga', 'Kaiako-S', 'BookOpenCheck', 'matauranga', 'pitch'),
    ('reo', 'matauranga', 'Reo', 'Languages', 'matauranga', 'execution'),
    ('ropu', 'matauranga', 'Rōpū', 'UsersRound', 'matauranga', 'execution'),
    ('ero-s', 'matauranga', 'ERO-S', 'FileCheck2', 'matauranga', 'ledger'),
    ('spark', 'hoko', 'Spark', 'Sparkles', 'hoko', 'hunt'),
    ('stock', 'hoko', 'Stock', 'Package', 'hoko', 'execution'),
    ('vessel-studio', 'auaha', 'Vessel-Studio', 'Shapes', 'auaha', 'execution')
)
INSERT INTO public.agent_prompts
  (agent_name, pack, display_name, icon, system_prompt, is_active, phase, kete_slug, is_draft)
SELECT
  p.agent_name,
  p.pack,
  p.display_name,
  p.icon,
  'DRAFT — content pending',
  false,
  p.phase,
  p.kete_slug,
  true
FROM placeholders p
WHERE NOT EXISTS (
  SELECT 1
  FROM public.agent_prompts ap
  WHERE lower(ap.agent_name) = p.agent_name
    AND ap.pack = p.pack
);

CREATE INDEX IF NOT EXISTS idx_agent_prompts_kete_slug ON public.agent_prompts(kete_slug);
CREATE INDEX IF NOT EXISTS idx_agent_prompts_phase ON public.agent_prompts(phase);

DROP POLICY IF EXISTS "Anyone can read active agent prompts" ON public.agent_prompts;

CREATE POLICY "Tenant members can read enabled agent prompts"
ON public.agent_prompts FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR EXISTS (
    SELECT 1
    FROM public.tenant_members tm
    JOIN public.agent_access aa
      ON aa.tenant_id = tm.tenant_id
    WHERE tm.user_id = auth.uid()
      AND COALESCE(aa.is_enabled, true) = true
      AND lower(aa.agent_code) = lower(agent_prompts.agent_name)
  )
);
