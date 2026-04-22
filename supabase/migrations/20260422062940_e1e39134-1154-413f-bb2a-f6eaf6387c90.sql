-- 1. Rename hangarau -> pikau in mcp_toolsets
UPDATE public.mcp_toolsets
SET slug = 'pikau',
    display_name = 'Pikau (Customs & Freight)',
    description = 'Customs declarations, MPI biosecurity, freight tracking, AIS vessel data, port logistics for NZ importers and brokers.',
    industry_pack = 'pikau'
WHERE slug = 'hangarau';

-- 2. Extend mcp_tools
ALTER TABLE public.mcp_tools
  ADD COLUMN IF NOT EXISTS tool_registry_id uuid REFERENCES public.tool_registry(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS deprecated boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deprecated_reason text,
  ADD COLUMN IF NOT EXISTS canonical_route text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_mcp_tools_tool_registry_id ON public.mcp_tools(tool_registry_id);
CREATE INDEX IF NOT EXISTS idx_mcp_tools_deprecated ON public.mcp_tools(deprecated) WHERE deprecated = false;

DROP TRIGGER IF EXISTS trg_mcp_tools_updated_at ON public.mcp_tools;
CREATE TRIGGER trg_mcp_tools_updated_at
  BEFORE UPDATE ON public.mcp_tools
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. mcp_policy_rules
CREATE TABLE IF NOT EXISTS public.mcp_policy_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_code text NOT NULL UNIQUE,
  rule_type text NOT NULL,
  applies_to_toolset text[],
  applies_to_tool text[],
  rule_logic jsonb NOT NULL DEFAULT '{}'::jsonb,
  enforcement_stage text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  reasoning_maori text,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.validate_mcp_policy_rule()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.rule_type NOT IN ('pii_mask','tier_gate','rate_limit','maori_data_sovereignty','tikanga_check','content_policy') THEN
    RAISE EXCEPTION 'rule_type must be one of pii_mask, tier_gate, rate_limit, maori_data_sovereignty, tikanga_check, content_policy';
  END IF;
  IF NEW.enforcement_stage NOT IN ('kahu_pre','ta_inflight','mana_post') THEN
    RAISE EXCEPTION 'enforcement_stage must be one of kahu_pre, ta_inflight, mana_post';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_validate_mcp_policy_rule ON public.mcp_policy_rules;
CREATE TRIGGER trg_validate_mcp_policy_rule
  BEFORE INSERT OR UPDATE ON public.mcp_policy_rules
  FOR EACH ROW EXECUTE FUNCTION public.validate_mcp_policy_rule();

DROP TRIGGER IF EXISTS trg_mcp_policy_rules_updated_at ON public.mcp_policy_rules;
CREATE TRIGGER trg_mcp_policy_rules_updated_at
  BEFORE UPDATE ON public.mcp_policy_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.mcp_policy_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read mcp_policy_rules"
  ON public.mcp_policy_rules FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can write mcp_policy_rules"
  ON public.mcp_policy_rules FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. mcp_subscription_tiers
CREATE TABLE IF NOT EXISTS public.mcp_subscription_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_name text NOT NULL UNIQUE,
  monthly_price_nzd numeric(10,2) NOT NULL,
  included_toolsets text[] NOT NULL DEFAULT '{}'::text[],
  included_calls_per_month integer,
  per_call_overage_nzd numeric(10,4) NOT NULL DEFAULT 0,
  stripe_price_id text,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.validate_mcp_tier_name()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.tier_name NOT IN ('starter','pro','business','industry_suite') THEN
    RAISE EXCEPTION 'tier_name must be starter, pro, business, or industry_suite';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_validate_mcp_tier_name ON public.mcp_subscription_tiers;
CREATE TRIGGER trg_validate_mcp_tier_name
  BEFORE INSERT OR UPDATE ON public.mcp_subscription_tiers
  FOR EACH ROW EXECUTE FUNCTION public.validate_mcp_tier_name();

DROP TRIGGER IF EXISTS trg_mcp_subscription_tiers_updated_at ON public.mcp_subscription_tiers;
CREATE TRIGGER trg_mcp_subscription_tiers_updated_at
  BEFORE UPDATE ON public.mcp_subscription_tiers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.mcp_subscription_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tiers are readable by authenticated users"
  ON public.mcp_subscription_tiers FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can write mcp_subscription_tiers"
  ON public.mcp_subscription_tiers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5. housekeeping_decisions
CREATE TABLE IF NOT EXISTS public.housekeeping_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  item_name text NOT NULL,
  decision text NOT NULL,
  decided_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  decided_at timestamptz NOT NULL DEFAULT now(),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_housekeeping_decisions_category ON public.housekeeping_decisions(category);

ALTER TABLE public.housekeeping_decisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read housekeeping_decisions"
  ON public.housekeeping_decisions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can write housekeeping_decisions"
  ON public.housekeeping_decisions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 6. billing_snapshots
CREATE TABLE IF NOT EXISTS public.billing_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_month date NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  total_calls integer NOT NULL DEFAULT 0,
  total_overage_nzd numeric(12,2) NOT NULL DEFAULT 0,
  tenant_count integer NOT NULL DEFAULT 0,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_billing_snapshots_month ON public.billing_snapshots(snapshot_month);

ALTER TABLE public.billing_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read billing_snapshots"
  ON public.billing_snapshots FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can write billing_snapshots"
  ON public.billing_snapshots FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 7. Seed mcp_subscription_tiers
INSERT INTO public.mcp_subscription_tiers
  (tier_name, monthly_price_nzd, included_toolsets, included_calls_per_month, per_call_overage_nzd, display_order)
VALUES
  ('starter', 49,  ARRAY['core'], 1000,  0.05, 1),
  ('pro',     149, ARRAY['core'], 10000, 0.03, 2),
  ('business',349, ARRAY['core','manaaki','waihanga','auaha','pakihi','pikau'], 50000, 0.02, 3),
  ('industry_suite', 799, ARRAY['core','manaaki','waihanga','auaha','pakihi','pikau','white_label'], NULL, 0.00, 4)
ON CONFLICT (tier_name) DO NOTHING;

-- 8. Seed mcp_policy_rules (12 starter rules — Mana Trust Layer)
INSERT INTO public.mcp_policy_rules
  (rule_code, rule_type, applies_to_toolset, applies_to_tool, rule_logic, enforcement_stage, reasoning_maori, description)
VALUES
  ('pii_mask_email', 'pii_mask', NULL, NULL,
   '{"pattern":"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}","replacement":"[email]","fields":["*"]}'::jsonb,
   'kahu_pre', NULL, 'Mask email addresses in inbound payloads before forwarding to tool handlers.'),
  ('pii_mask_phone', 'pii_mask', NULL, NULL,
   '{"pattern":"(\\+?64|0)[\\s-]?\\d{1,2}[\\s-]?\\d{3,4}[\\s-]?\\d{3,4}","replacement":"[phone]","fields":["*"]}'::jsonb,
   'kahu_pre', NULL, 'Mask NZ phone numbers in inbound payloads.'),
  ('pii_mask_ird_number', 'pii_mask', NULL, NULL,
   '{"pattern":"\\b\\d{2,3}[-\\s]?\\d{3}[-\\s]?\\d{3}\\b","replacement":"[ird]","fields":["*"]}'::jsonb,
   'kahu_pre', 'Kaitiakitanga — IRD numbers are taonga requiring guardianship. Tax identifiers belong to the person, not the tool.', 'Mask IRD numbers before any tool sees them.'),
  ('starter_tier_gate', 'tier_gate', NULL, NULL,
   '{"tier":"starter","allowed_toolsets":["core"],"max_calls_per_month":1000}'::jsonb,
   'kahu_pre', NULL, 'Starter tier — core toolset only, 1000 calls/month, $0.05 overage.'),
  ('pro_tier_gate', 'tier_gate', NULL, NULL,
   '{"tier":"pro","allowed_toolsets":["core","manaaki","waihanga","auaha","pakihi","pikau"],"choose_n":1,"max_calls_per_month":10000}'::jsonb,
   'kahu_pre', NULL, 'Pro tier — core plus one industry pack, 10000 calls/month, $0.03 overage.'),
  ('business_tier_gate', 'tier_gate', NULL, NULL,
   '{"tier":"business","allowed_toolsets":["core","manaaki","waihanga","auaha","pakihi","pikau"],"max_calls_per_month":50000}'::jsonb,
   'kahu_pre', NULL, 'Business tier — all six toolsets, 50000 calls/month, $0.02 overage.'),
  ('rate_limit_per_tier', 'rate_limit', NULL, NULL,
   '{"starter":{"per_minute":10,"per_hour":200},"pro":{"per_minute":60,"per_hour":2000},"business":{"per_minute":300,"per_hour":10000},"industry_suite":{"per_minute":1000,"per_hour":50000}}'::jsonb,
   'kahu_pre', NULL, 'Per-tier rate limits enforced before tool dispatch.'),
  ('maori_data_sovereignty_whakapapa', 'maori_data_sovereignty', NULL, NULL,
   '{"flag_terms":["whakapapa","iwi register","tribal lineage","hapū identifier"],"action":"require_iwi_consent","block_offshore":true}'::jsonb,
   'ta_inflight', 'Whakapapa is sacred. It cannot leave Aotearoa or be processed by offshore models without explicit iwi consent. The platform is the kaitiaki of this rule.', 'Block whakapapa data from leaving NZ infrastructure without iwi consent.'),
  ('tikanga_noa_tapu_check', 'tikanga_check', ARRAY['manaaki','core'], NULL,
   '{"check":"tapu_noa_classification","require_classification_when":["food","kai","wai","mate"],"default":"unclassified"}'::jsonb,
   'ta_inflight', 'Kai, wai, and mate carry tapu/noa weight. Outputs that touch them must respect classification, not just regulation.', 'Require tapu/noa classification on hospitality outputs involving food, water, or matters of death.'),
  ('te_reo_macron_normalize', 'content_policy', ARRAY['auaha','core'], NULL,
   '{"normalize":["a→ā in known kupu","o→ō in known kupu"],"dictionary":"te_aka","preserve_user_choice":true}'::jsonb,
   'mana_post', 'Te reo with correct macrons honours the language. Stripping them flattens meaning.', 'Auto-correct missing macrons on known te reo Māori words.'),
  ('citation_required_for_legal', 'content_policy', ARRAY['pakihi'], NULL,
   '{"trigger_terms":["the act","section","under nz law","the regulations"],"require":"legislation.govt.nz citation","fail_open":false}'::jsonb,
   'mana_post', NULL, 'Any legal claim in pakihi outputs must cite legislation.govt.nz.'),
  ('no_medical_advice_without_disclaimer', 'content_policy', NULL, NULL,
   '{"trigger_terms":["dose","prescribe","diagnosis","treatment for","take this medication"],"action":"append_disclaimer","disclaimer":"This is general information only — please consult a registered NZ healthcare professional for personal medical advice."}'::jsonb,
   'mana_post', NULL, 'Append a NZ healthcare disclaimer to outputs that stray into medical advice.')
ON CONFLICT (rule_code) DO NOTHING;