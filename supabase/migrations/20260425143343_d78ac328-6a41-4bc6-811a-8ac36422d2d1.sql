-- ============================================================================
-- mcp_api_keys: per-org API keys for the @assembl/mcp npm package
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.mcp_api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  name text NOT NULL,
  key_hash text NOT NULL UNIQUE,
  key_prefix text NOT NULL,
  scopes text[] NOT NULL DEFAULT ARRAY[]::text[],
  last_used_at timestamptz,
  expires_at timestamptz,
  revoked_at timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS mcp_api_keys_org_idx ON public.mcp_api_keys (org_id) WHERE revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS mcp_api_keys_hash_idx ON public.mcp_api_keys (key_hash) WHERE revoked_at IS NULL;

ALTER TABLE public.mcp_api_keys ENABLE ROW LEVEL SECURITY;

-- Admin-only policies (service role bypasses RLS for runtime validation)
CREATE POLICY "Admins can view api keys"
  ON public.mcp_api_keys FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create api keys"
  ON public.mcp_api_keys FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update api keys"
  ON public.mcp_api_keys FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete api keys"
  ON public.mcp_api_keys FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Helper: mark a key as just-used (called by edge function via service role).
CREATE OR REPLACE FUNCTION public.mcp_touch_api_key(_key_hash text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.mcp_api_keys
     SET last_used_at = now()
   WHERE key_hash = _key_hash
     AND revoked_at IS NULL;
$$;

-- Helper: validate a key hash and return org_id + scopes if valid.
CREATE OR REPLACE FUNCTION public.mcp_validate_api_key(_key_hash text)
RETURNS TABLE(org_id uuid, scopes text[], key_id uuid)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT k.org_id, k.scopes, k.id
    FROM public.mcp_api_keys k
   WHERE k.key_hash = _key_hash
     AND k.revoked_at IS NULL
     AND (k.expires_at IS NULL OR k.expires_at > now())
   LIMIT 1;
$$;