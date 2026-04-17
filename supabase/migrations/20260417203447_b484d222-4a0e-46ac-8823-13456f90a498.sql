-- Xero OAuth token storage
CREATE TABLE public.xero_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  xero_tenant_id TEXT NOT NULL,
  xero_org_name TEXT,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  scopes TEXT[],
  connected_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, xero_tenant_id)
);

CREATE INDEX idx_xero_tokens_tenant ON public.xero_tokens(tenant_id);

ALTER TABLE public.xero_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant members can view xero tokens metadata"
  ON public.xero_tokens FOR SELECT
  TO authenticated
  USING (tenant_id IN (
    SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Service role manages xero tokens"
  ON public.xero_tokens FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE TRIGGER update_xero_tokens_updated_at
  BEFORE UPDATE ON public.xero_tokens
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Short-lived OAuth state for CSRF
CREATE TABLE public.xero_oauth_state (
  state TEXT PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  return_url TEXT,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '10 minutes'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.xero_oauth_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages oauth state"
  ON public.xero_oauth_state FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- E-signature envelopes (DocuSign Path B - magic link)
CREATE TABLE public.esign_envelopes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  document_name TEXT NOT NULL,
  document_url TEXT NOT NULL,
  document_sha256 TEXT,
  signer_name TEXT NOT NULL,
  signer_email TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'sent',
  token TEXT NOT NULL UNIQUE,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  viewed_at TIMESTAMPTZ,
  signed_at TIMESTAMPTZ,
  signed_ip TEXT,
  signed_typed_name TEXT,
  signed_user_agent TEXT,
  signed_pdf_url TEXT,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 days'),
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_esign_envelopes_tenant ON public.esign_envelopes(tenant_id);
CREATE INDEX idx_esign_envelopes_token ON public.esign_envelopes(token);

ALTER TABLE public.esign_envelopes ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.validate_esign_status()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  IF NEW.status NOT IN ('sent','viewed','signed','declined','expired','revoked') THEN
    RAISE EXCEPTION 'status must be sent, viewed, signed, declined, expired, or revoked';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_esign_envelopes_status
  BEFORE INSERT OR UPDATE ON public.esign_envelopes
  FOR EACH ROW EXECUTE FUNCTION public.validate_esign_status();

CREATE TRIGGER update_esign_envelopes_updated_at
  BEFORE UPDATE ON public.esign_envelopes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Tenant members view esign envelopes"
  ON public.esign_envelopes FOR SELECT
  TO authenticated
  USING (tenant_id IN (
    SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Tenant admins create esign envelopes"
  ON public.esign_envelopes FOR INSERT
  TO authenticated
  WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM public.tenant_members
    WHERE user_id = auth.uid() AND role IN ('admin','manager')
  ));

CREATE POLICY "Tenant admins update esign envelopes"
  ON public.esign_envelopes FOR UPDATE
  TO authenticated
  USING (tenant_id IN (
    SELECT tenant_id FROM public.tenant_members
    WHERE user_id = auth.uid() AND role IN ('admin','manager')
  ));

CREATE POLICY "Service role manages esign envelopes"
  ON public.esign_envelopes FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- Audit trail (append-only)
CREATE TABLE public.esign_audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  envelope_id UUID NOT NULL REFERENCES public.esign_envelopes(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_esign_audit_envelope ON public.esign_audit_events(envelope_id);

ALTER TABLE public.esign_audit_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant members view audit events"
  ON public.esign_audit_events FOR SELECT
  TO authenticated
  USING (envelope_id IN (
    SELECT id FROM public.esign_envelopes
    WHERE tenant_id IN (
      SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Service role writes audit events"
  ON public.esign_audit_events FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);