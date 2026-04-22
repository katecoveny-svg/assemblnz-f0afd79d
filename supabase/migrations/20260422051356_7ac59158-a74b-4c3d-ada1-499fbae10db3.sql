-- ============================================================
-- Developer site + MCP server v2 schema
-- ============================================================

-- 1. Public developer waitlist (Prompt 1)
CREATE TABLE IF NOT EXISTS public.developer_waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  industry text,
  use_case text,
  source text DEFAULT 'developers_page',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.developer_waitlist ENABLE ROW LEVEL SECURITY;

-- Anyone (anon + authed) can submit a waitlist entry
CREATE POLICY "Anyone can join developer waitlist"
  ON public.developer_waitlist
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(email) BETWEEN 3 AND 255
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND (industry IS NULL OR char_length(industry) <= 80)
    AND (use_case IS NULL OR char_length(use_case) <= 1000)
  );

-- Only admins can read/manage
CREATE POLICY "Admins can read developer waitlist"
  ON public.developer_waitlist
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'business'));

-- 2. MCP toolsets (Prompt 2)
CREATE TABLE IF NOT EXISTS public.mcp_toolsets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  display_name text NOT NULL,
  description text,
  industry_pack text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.mcp_toolsets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active toolsets"
  ON public.mcp_toolsets FOR SELECT TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Admins manage toolsets"
  ON public.mcp_toolsets FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'business'))
  WITH CHECK (public.has_role(auth.uid(), 'business'));

-- 3. MCP tools
CREATE TABLE IF NOT EXISTS public.mcp_tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  toolset_id uuid NOT NULL REFERENCES public.mcp_toolsets(id) ON DELETE CASCADE,
  name text NOT NULL UNIQUE,
  description text,
  agent_code text,
  edge_function_url text,
  input_schema_json jsonb DEFAULT '{}'::jsonb,
  is_ga boolean NOT NULL DEFAULT false,
  requires_auth_scope text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mcp_tools_toolset ON public.mcp_tools(toolset_id);

ALTER TABLE public.mcp_tools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read GA tools"
  ON public.mcp_tools FOR SELECT TO anon, authenticated
  USING (is_ga = true);

CREATE POLICY "Admins manage tools"
  ON public.mcp_tools FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'business'))
  WITH CHECK (public.has_role(auth.uid(), 'business'));

-- 4. MCP tool call log
CREATE TABLE IF NOT EXISTS public.mcp_tool_calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_name text NOT NULL,
  toolset_slug text,
  user_id uuid,
  org_id uuid,
  status text NOT NULL CHECK (status IN ('success','denied','error')),
  duration_ms integer,
  error_message text,
  called_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mcp_tool_calls_called_at ON public.mcp_tool_calls(called_at DESC);
CREATE INDEX IF NOT EXISTS idx_mcp_tool_calls_status ON public.mcp_tool_calls(status);

ALTER TABLE public.mcp_tool_calls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read tool calls"
  ON public.mcp_tool_calls FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'business'));

-- (Inserts come from service-role edge function — no anon insert policy.)

-- 5. Per-org toolset enablement
CREATE TABLE IF NOT EXISTS public.mcp_org_toolsets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  toolset_slug text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, toolset_slug)
);

ALTER TABLE public.mcp_org_toolsets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage org toolsets"
  ON public.mcp_org_toolsets FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'business'))
  WITH CHECK (public.has_role(auth.uid(), 'business'));

-- 6. Seed six toolsets (waihanga not hanga, per locked retired-names rule)
INSERT INTO public.mcp_toolsets (slug, display_name, description, industry_pack)
VALUES
  ('manaaki',  'Manaaki (Hospitality)',  'Bookings, food safety, alcohol licensing.', 'hospitality'),
  ('waihanga', 'Waihanga (Construction)', 'Site safety, payment claims, EOTs.',        'construction'),
  ('auaha',    'Auaha (Creative)',        'Brand scans, campaigns, social calendars.', 'creative'),
  ('pakihi',   'Pakihi (Business)',       'Pipeline, invoicing, hire workflows.',      'business'),
  ('hangarau', 'Hangarau (Technology)',   'Audit, health, deploy.',                    'technology'),
  ('core',     'Core (All Tiers)',        'Routing, tikanga checks, compliance.',      'core')
ON CONFLICT (slug) DO NOTHING;