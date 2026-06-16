-- Trust Centre security-pack requests — captured from the /trust request form.
-- Written server-side via the service-role client (POST /api/trust-pack-request),
-- so RLS stays fully closed: no anon/authenticated read or write. The service
-- role bypasses RLS; everyone else is denied.

BEGIN;

CREATE TABLE IF NOT EXISTS public.trust_pack_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  org text NOT NULL,
  role text NOT NULL,
  intended_use text NOT NULL,
  nda_signed boolean NOT NULL DEFAULT false,
  notify_email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS trust_pack_requests_created_at_idx
  ON public.trust_pack_requests (created_at DESC);

-- RLS enabled with no policies: locked to the service role only. This is a
-- procurement-lead capture for the security team, never a public read surface.
ALTER TABLE public.trust_pack_requests ENABLE ROW LEVEL SECURITY;

COMMIT;
