
-- ═══════════════════════════════════════
-- IHO ARCHITECTURE: Core Pipeline Tables
-- ═══════════════════════════════════════

-- 1. TENANTS (Organizations)
CREATE TABLE IF NOT EXISTS public.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  plan text NOT NULL DEFAULT 'trial',
  billing_email text,
  credit_nzd numeric(10,2) DEFAULT 0,
  is_active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. TENANT MEMBERS (Users in Orgs with Roles)
CREATE TABLE IF NOT EXISTS public.tenant_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin','manager','operator','viewer','trial')),
  created_at timestamptz DEFAULT now(),
  UNIQUE (tenant_id, user_id)
);

-- 3. AGENT ACCESS (Which agents accessible per tenant)
CREATE TABLE IF NOT EXISTS public.agent_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  agent_code text NOT NULL,
  pack_id text NOT NULL,
  is_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE (tenant_id, agent_code)
);

-- 4. FEATURE FLAGS
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  feature_name text NOT NULL,
  is_enabled boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  UNIQUE (tenant_id, feature_name)
);

-- 5. AUDIT LOG (Tā — full pipeline audit)
CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tenant_id uuid REFERENCES public.tenants(id),
  agent_code text NOT NULL,
  agent_name text NOT NULL,
  pack_id text,
  model_used text NOT NULL,
  input_tokens integer DEFAULT 0,
  output_tokens integer DEFAULT 0,
  total_tokens integer DEFAULT 0,
  cost_nzd numeric(10,6) DEFAULT 0,
  compliance_passed boolean DEFAULT true,
  data_classification text DEFAULT 'PUBLIC',
  pii_detected boolean DEFAULT false,
  pii_masked boolean DEFAULT false,
  policies_checked text[] DEFAULT '{}',
  request_summary text,
  response_summary text,
  error_message text,
  duration_ms integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 6. BUSINESS MEMORY (Mahara)
CREATE TABLE IF NOT EXISTS public.business_memory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tenant_id uuid REFERENCES public.tenants(id),
  category text NOT NULL DEFAULT 'general',
  tags text[] DEFAULT '{}',
  content text NOT NULL,
  metadata jsonb DEFAULT '{}',
  relevance_score numeric(3,2) DEFAULT 0.5,
  ttl_days integer,
  is_archived boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

-- Enable RLS on all new tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_memory ENABLE ROW LEVEL SECURITY;

-- RLS: Tenants — members can view their own tenant
CREATE POLICY "Tenant members can view their tenant" ON public.tenants
  FOR SELECT TO authenticated
  USING (id IN (SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()));

-- RLS: Tenant Members — can view own membership
CREATE POLICY "Users can view their memberships" ON public.tenant_members
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- RLS: Agent Access — view own tenant's agent access
CREATE POLICY "View own tenant agent access" ON public.agent_access
  FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()));

-- RLS: Feature Flags — view own tenant's flags
CREATE POLICY "View own tenant feature flags" ON public.feature_flags
  FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()));

-- RLS: Audit Log — users see their own logs
CREATE POLICY "Users view own audit logs" ON public.audit_log
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- RLS: Audit Log — service role can insert
CREATE POLICY "Service role inserts audit logs" ON public.audit_log
  FOR INSERT TO service_role
  WITH CHECK (true);

-- RLS: Business Memory — users see and manage their own
CREATE POLICY "Users manage own business memory" ON public.business_memory
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS: Business Memory — service role full access
CREATE POLICY "Service role manages business memory" ON public.business_memory
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_tenant_id ON public.audit_log(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_log_agent_code ON public.audit_log(agent_code);
CREATE INDEX IF NOT EXISTS idx_business_memory_user_id ON public.business_memory(user_id);
CREATE INDEX IF NOT EXISTS idx_business_memory_tags ON public.business_memory USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_business_memory_category ON public.business_memory(category);
CREATE INDEX IF NOT EXISTS idx_tenant_members_user_id ON public.tenant_members(user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_members_tenant_id ON public.tenant_members(tenant_id);

-- Trigger for updated_at on business_memory
CREATE TRIGGER update_business_memory_updated_at
  BEFORE UPDATE ON public.business_memory
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updated_at on tenants
CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
