-- Governed MCP access: explicit user -> tenant -> permission mapping.
--
-- Supabase OAuth proves identity. This table remains Assembl's source of truth
-- for what an authenticated MCP client may do inside a workspace. OAuth scopes
-- are intentionally not reused as business permissions because Supabase's OAuth
-- server currently supports only the standard OIDC scopes.

BEGIN;

CREATE TABLE IF NOT EXISTS public.mcp_tenant_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant text NOT NULL CHECK (char_length(tenant) BETWEEN 1 AND 120),
  permissions text[] NOT NULL DEFAULT ARRAY['work.read', 'proof.read']::text[],
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, tenant),
  CHECK (
    permissions <@ ARRAY[
      'work.read',
      'proof.read',
      'work.create',
      'approval.request'
    ]::text[]
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS mcp_tenant_memberships_one_default_per_user
  ON public.mcp_tenant_memberships (user_id)
  WHERE is_default = true AND status = 'active';

CREATE INDEX IF NOT EXISTS mcp_tenant_memberships_user_active
  ON public.mcp_tenant_memberships (user_id, status);

ALTER TABLE public.mcp_tenant_memberships ENABLE ROW LEVEL SECURITY;

-- Users may inspect only their own MCP access. Membership creation, permission
-- changes and revocation remain service-role/admin operations.
DROP POLICY IF EXISTS "mcp memberships read own" ON public.mcp_tenant_memberships;
CREATE POLICY "mcp memberships read own"
  ON public.mcp_tenant_memberships
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

REVOKE INSERT, UPDATE, DELETE ON public.mcp_tenant_memberships FROM authenticated, anon;
GRANT SELECT ON public.mcp_tenant_memberships TO authenticated;

COMMIT;

-- Example admin-only grant (replace UUID + tenant explicitly):
-- INSERT INTO public.mcp_tenant_memberships
--   (user_id, tenant, permissions, is_default)
-- VALUES
--   ('00000000-0000-0000-0000-000000000000', 'assembl',
--    ARRAY['work.read','proof.read','work.create','approval.request'], true);
