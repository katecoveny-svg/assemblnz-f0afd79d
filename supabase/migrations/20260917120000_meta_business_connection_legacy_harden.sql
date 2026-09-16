-- ============================================================
-- META BUSINESS — harden against the April 2026 legacy shape
--
-- Prefer Kate verified draft 20260917103000_meta_business_connection.sql.
-- Problem: that migration uses CREATE TABLE IF NOT EXISTS, so on DBs
-- that already applied 20260403022215 (access_token on meta_connections
-- + ALL policy) the vaulted design never replaced the insecure table.
--
-- Fix (idempotent, PREVIEW-safe):
--   * If legacy access_token column is present, rename that table aside
--     (tokens are NOT migrated — reconnect required).
--   * Ensure the verified Sept vaulted schema exists.
-- ============================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'meta_connections'
      AND column_name = 'access_token'
  ) THEN
    ALTER TABLE public.meta_connections
      RENAME TO meta_connections_legacy_insecure_202604;

    DROP POLICY IF EXISTS "Users manage own meta"
      ON public.meta_connections_legacy_insecure_202604;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.meta_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  organisation_id UUID,

  -- selected assets (IDs are not secrets; they are org identifiers)
  business_id            TEXT,
  business_name          TEXT,
  page_id                TEXT,
  page_name              TEXT,
  instagram_id           TEXT,
  instagram_username     TEXT,
  ad_account_id          TEXT,
  ad_account_name        TEXT,

  -- health / capability surface
  scopes                 TEXT[] DEFAULT '{}',
  status                 TEXT   DEFAULT 'pending'
                         CHECK (status IN ('pending','connected','needs_reauth','revoked','error')),
  capability             JSONB  DEFAULT '{"pursuit_read":false,"studio_organic_publish":false,"paid_activation":false}'::jsonb,
  token_expires_at       TIMESTAMPTZ,
  last_verified_at       TIMESTAMPTZ,
  last_error             TEXT,

  created_at             TIMESTAMPTZ DEFAULT now(),
  updated_at             TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_meta_connections_user   ON public.meta_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_meta_connections_status ON public.meta_connections(status);

ALTER TABLE public.meta_connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users see own meta connection"    ON public.meta_connections;
DROP POLICY IF EXISTS "Users delete own meta connection" ON public.meta_connections;

CREATE POLICY "Users see own meta connection" ON public.meta_connections
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users delete own meta connection" ON public.meta_connections
  FOR DELETE USING (auth.uid() = user_id);
-- NOTE: no INSERT/UPDATE policy on purpose. Writes go through the
-- edge function with the service role, so the client cannot forge
-- a connection row or widen its own capability flags.


-- 2. Secret material (service-role only — RLS on, zero policies)
CREATE TABLE IF NOT EXISTS public.meta_credentials (
  connection_id  UUID PRIMARY KEY
                 REFERENCES public.meta_connections(id) ON DELETE CASCADE,
  access_token   TEXT NOT NULL,
  refresh_token  TEXT,
  token_type     TEXT DEFAULT 'bearer',
  expires_at     TIMESTAMPTZ,
  rotated_at     TIMESTAMPTZ DEFAULT now(),
  created_at     TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.meta_credentials ENABLE ROW LEVEL SECURITY;
-- Deliberately NO policies. With RLS enabled and no policy, anon/authenticated
-- get zero rows. Only the service role key bypasses RLS.

REVOKE ALL ON public.meta_credentials FROM anon, authenticated;


-- 3. Signed, single-use OAuth state
CREATE TABLE IF NOT EXISTS public.meta_oauth_states (
  nonce          TEXT PRIMARY KEY,
  user_id        UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  organisation_id UUID,
  redirect_after TEXT,
  requested_scopes TEXT[] DEFAULT '{}',
  created_at     TIMESTAMPTZ DEFAULT now(),
  expires_at     TIMESTAMPTZ DEFAULT (now() + INTERVAL '10 minutes'),
  used_at        TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_meta_oauth_states_expiry ON public.meta_oauth_states(expires_at);

ALTER TABLE public.meta_oauth_states ENABLE ROW LEVEL SECURITY;
-- No policies: state rows are written and consumed by the edge function only.
REVOKE ALL ON public.meta_oauth_states FROM anon, authenticated;


-- 4. Meta data-deletion requests (Meta Platform Terms requirement)
CREATE TABLE IF NOT EXISTS public.meta_deletion_requests (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  confirmation_code TEXT UNIQUE NOT NULL,
  meta_user_id    TEXT,
  user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status          TEXT DEFAULT 'received'
                  CHECK (status IN ('received','completed','failed')),
  requested_at    TIMESTAMPTZ DEFAULT now(),
  completed_at    TIMESTAMPTZ,
  detail          TEXT
);

CREATE INDEX IF NOT EXISTS idx_meta_deletion_code ON public.meta_deletion_requests(confirmation_code);

ALTER TABLE public.meta_deletion_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users see own deletion requests" ON public.meta_deletion_requests;

CREATE POLICY "Users see own deletion requests" ON public.meta_deletion_requests
  FOR SELECT USING (auth.uid() = user_id);


-- 5. Housekeeping: drop expired state rows
CREATE OR REPLACE FUNCTION public.purge_expired_meta_oauth_states()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.meta_oauth_states
  WHERE expires_at < now() - INTERVAL '1 hour';
$$;


-- 6. keep updated_at honest
CREATE OR REPLACE FUNCTION public.touch_meta_connection()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_touch_meta_connection ON public.meta_connections;
CREATE TRIGGER trg_touch_meta_connection
  BEFORE UPDATE ON public.meta_connections
  FOR EACH ROW EXECUTE FUNCTION public.touch_meta_connection();

DO $$
BEGIN
  IF to_regclass('public.meta_connections_legacy_insecure_202604') IS NOT NULL THEN
    EXECUTE $c$
      COMMENT ON TABLE public.meta_connections_legacy_insecure_202604 IS
        'Renamed April 2026 legacy table that stored access_token in a user-readable row. Not used by meta-business OAuth.'
    $c$;
  END IF;
END $$;

COMMENT ON TABLE public.meta_connections IS
  'Non-secret Meta Business connection metadata. Shared UI key: meta_connections.id (= meta_connection_id).';
COMMENT ON TABLE public.meta_credentials IS
  'Vaulted Meta tokens. RLS on, zero policies — service role only.';
