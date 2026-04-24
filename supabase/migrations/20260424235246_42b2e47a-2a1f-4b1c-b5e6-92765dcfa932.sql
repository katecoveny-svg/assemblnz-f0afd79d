-- ============================================================
-- ASSEMBL INTEGRATIONS LAYER
-- ============================================================

-- 1.1 Supported providers
CREATE TABLE IF NOT EXISTS public.assembl_integration_providers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  auth_type TEXT DEFAULT 'oauth2',
  auth_url TEXT,
  token_url TEXT,
  scopes TEXT[],
  is_active BOOLEAN DEFAULT true,
  kete_codes TEXT[],
  setup_guide TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.assembl_integration_providers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Providers readable by everyone" ON public.assembl_integration_providers
  FOR SELECT USING (true);

INSERT INTO public.assembl_integration_providers (code, name, category, description, auth_type, auth_url, token_url, scopes, kete_codes) VALUES
  ('xero', 'Xero', 'accounting',
   'Accounting, invoicing, payroll, contacts, and bank reconciliation',
   'oauth2',
   'https://login.xero.com/identity/connect/authorize',
   'https://identity.xero.com/connect/token',
   ARRAY['openid', 'profile', 'email', 'offline_access', 'accounting.transactions.read', 'accounting.contacts.read', 'payroll.employees.read', 'payroll.timesheets.read'],
   ARRAY['MANAAKI', 'WAIHANGA', 'PIKAU', 'ARATAKI', 'AUAHA']),
  ('deputy', 'Deputy', 'rostering',
   'Shift scheduling, timesheets, employee management, and leave tracking',
   'oauth2',
   'https://once.deputy.com/my/oauth/login',
   'https://once.deputy.com/my/oauth/access_token',
   ARRAY['longlife_refresh_token'],
   ARRAY['MANAAKI', 'WAIHANGA']),
  ('google', 'Google Workspace', 'productivity',
   'Calendar, Drive, Gmail, and Contacts',
   'oauth2',
   'https://accounts.google.com/o/oauth2/v2/auth',
   'https://oauth2.googleapis.com/token',
   ARRAY['openid', 'profile', 'email',
          'https://www.googleapis.com/auth/calendar',
          'https://www.googleapis.com/auth/drive.file',
          'https://www.googleapis.com/auth/gmail.readonly'],
   ARRAY['MANAAKI', 'WAIHANGA', 'PIKAU', 'ARATAKI', 'AUAHA', 'TORO']),
  ('myob', 'MYOB', 'accounting',
   'Accounting and payroll for NZ businesses',
   'oauth2',
   'https://secure.myob.com/oauth2/account/authorize',
   'https://secure.myob.com/oauth2/v1/authorize',
   ARRAY['CompanyFile'],
   ARRAY['MANAAKI', 'WAIHANGA', 'PIKAU']),
  ('tanda', 'Tanda', 'rostering',
   'Workforce management, rostering, time and attendance',
   'oauth2',
   'https://my.tanda.co/api/oauth/authorize',
   'https://my.tanda.co/api/oauth/token',
   ARRAY['cost', 'department', 'financial', 'leave', 'roster', 'timesheet', 'user'],
   ARRAY['MANAAKI', 'WAIHANGA']),
  ('stripe', 'Stripe', 'payments',
   'Payment processing and subscription billing',
   'oauth2',
   'https://connect.stripe.com/oauth/authorize',
   'https://connect.stripe.com/oauth/token',
   ARRAY['read_write'],
   ARRAY['MANAAKI', 'WAIHANGA', 'AUAHA', 'PIKAU']),
  ('whatsapp', 'WhatsApp Business', 'messaging',
   'Customer messaging and notifications via WhatsApp',
   'api_key', NULL, NULL, ARRAY[]::TEXT[],
   ARRAY['MANAAKI', 'WAIHANGA', 'TORO', 'ARATAKI']),
  ('tnz', 'TNZ Messaging', 'messaging',
   'SMS and WhatsApp messaging for NZ',
   'api_key', NULL, NULL, ARRAY[]::TEXT[],
   ARRAY['MANAAKI', 'WAIHANGA', 'TORO', 'ARATAKI', 'PIKAU'])
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  scopes = EXCLUDED.scopes,
  kete_codes = EXCLUDED.kete_codes;


-- 1.2 Customer connections
CREATE TABLE IF NOT EXISTS public.assembl_integrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organisation_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  provider_code TEXT NOT NULL REFERENCES public.assembl_integration_providers(code),
  status TEXT DEFAULT 'pending',
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  external_org_id TEXT,
  external_org_name TEXT,
  scopes_granted TEXT[],
  last_sync_at TIMESTAMPTZ,
  last_sync_status TEXT,
  last_sync_error TEXT,
  sync_frequency_minutes INTEGER DEFAULT 60,
  metadata JSONB DEFAULT '{}',
  connected_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organisation_id, provider_code)
);

CREATE INDEX IF NOT EXISTS idx_integrations_org ON public.assembl_integrations(organisation_id);
CREATE INDEX IF NOT EXISTS idx_integrations_provider ON public.assembl_integrations(provider_code);
CREATE INDEX IF NOT EXISTS idx_integrations_status ON public.assembl_integrations(status);
CREATE INDEX IF NOT EXISTS idx_integrations_sync ON public.assembl_integrations(last_sync_at)
  WHERE status = 'active';

ALTER TABLE public.assembl_integrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own integrations" ON public.assembl_integrations
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own integrations" ON public.assembl_integrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own integrations" ON public.assembl_integrations
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own integrations" ON public.assembl_integrations
  FOR DELETE USING (auth.uid() = user_id);


-- 1.3 OAuth state tracking
CREATE TABLE IF NOT EXISTS public.assembl_oauth_states (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  state TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  organisation_id UUID NOT NULL,
  provider_code TEXT NOT NULL,
  code_verifier TEXT,
  redirect_after TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '10 minutes'),
  used BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_oauth_states_state ON public.assembl_oauth_states(state);

ALTER TABLE public.assembl_oauth_states ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own oauth states" ON public.assembl_oauth_states
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own oauth states" ON public.assembl_oauth_states
  FOR INSERT WITH CHECK (auth.uid() = user_id);


-- 1.4 Synced data cache
CREATE TABLE IF NOT EXISTS public.assembl_synced_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integration_id UUID REFERENCES public.assembl_integrations(id) ON DELETE CASCADE,
  organisation_id UUID NOT NULL,
  provider_code TEXT NOT NULL,
  data_type TEXT NOT NULL,
  external_id TEXT,
  data JSONB NOT NULL,
  is_stale BOOLEAN DEFAULT false,
  synced_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '1 hour'),
  UNIQUE(integration_id, data_type, external_id)
);

CREATE INDEX IF NOT EXISTS idx_synced_data_org ON public.assembl_synced_data(organisation_id, data_type);
CREATE INDEX IF NOT EXISTS idx_synced_data_integration ON public.assembl_synced_data(integration_id, data_type);
CREATE INDEX IF NOT EXISTS idx_synced_data_stale ON public.assembl_synced_data(is_stale, expires_at)
  WHERE is_stale = false;

ALTER TABLE public.assembl_synced_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see synced data for own integrations" ON public.assembl_synced_data
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.assembl_integrations i
      WHERE i.id = assembl_synced_data.integration_id
        AND i.user_id = auth.uid()
    )
  );


-- 1.5 Integration activity log
CREATE TABLE IF NOT EXISTS public.assembl_integration_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integration_id UUID REFERENCES public.assembl_integrations(id) ON DELETE SET NULL,
  organisation_id UUID,
  provider_code TEXT NOT NULL,
  action TEXT NOT NULL,
  direction TEXT NOT NULL,
  status TEXT NOT NULL,
  records_processed INTEGER DEFAULT 0,
  error_message TEXT,
  request_metadata JSONB DEFAULT '{}',
  duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_integration_logs_org ON public.assembl_integration_logs(organisation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_integration_logs_provider ON public.assembl_integration_logs(provider_code, created_at DESC);

ALTER TABLE public.assembl_integration_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see logs for own integrations" ON public.assembl_integration_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.assembl_integrations i
      WHERE i.id = assembl_integration_logs.integration_id
        AND i.user_id = auth.uid()
    )
  );


-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION public.assembl_needs_token_refresh(p_integration_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_expires_at TIMESTAMPTZ;
  v_status TEXT;
BEGIN
  SELECT token_expires_at, status INTO v_expires_at, v_status
  FROM public.assembl_integrations WHERE id = p_integration_id;
  IF v_status != 'active' THEN RETURN false; END IF;
  IF v_expires_at IS NULL THEN RETURN true; END IF;
  RETURN v_expires_at < (now() + INTERVAL '5 minutes');
END;
$$;

CREATE OR REPLACE FUNCTION public.assembl_get_integration(
  p_organisation_id UUID,
  p_provider_code TEXT
)
RETURNS TABLE(
  id UUID,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  external_org_id TEXT,
  metadata JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT i.id, i.access_token, i.refresh_token,
    i.token_expires_at, i.external_org_id, i.metadata
  FROM public.assembl_integrations i
  WHERE i.organisation_id = p_organisation_id
    AND i.provider_code = p_provider_code
    AND i.status = 'active';
END;
$$;

CREATE OR REPLACE FUNCTION public.assembl_mark_stale_data()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE public.assembl_synced_data
  SET is_stale = true
  WHERE expires_at < now() AND is_stale = false;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.assembl_get_or_sync(
  p_organisation_id UUID,
  p_provider_code TEXT,
  p_data_type TEXT
)
RETURNS TABLE(
  data JSONB,
  is_fresh BOOLEAN,
  synced_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT sd.data,
    NOT sd.is_stale AND sd.expires_at > now() AS is_fresh,
    sd.synced_at
  FROM public.assembl_synced_data sd
  JOIN public.assembl_integrations i ON sd.integration_id = i.id
  WHERE sd.organisation_id = p_organisation_id
    AND sd.provider_code = p_provider_code
    AND sd.data_type = p_data_type
    AND i.status = 'active'
  ORDER BY sd.synced_at DESC;
END;
$$;


-- ============================================================
-- AGENT ACCESS LAYER
-- ============================================================

CREATE OR REPLACE FUNCTION public.assembl_agent_get_employees(p_organisation_id UUID)
RETURNS TABLE(
  external_id TEXT,
  name TEXT,
  email TEXT,
  role TEXT,
  start_date DATE,
  hourly_rate NUMERIC,
  provider TEXT,
  raw_data JSONB,
  is_fresh BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT sd.external_id,
    sd.data->>'name' AS name,
    sd.data->>'email' AS email,
    sd.data->>'role' AS role,
    (sd.data->>'start_date')::DATE AS start_date,
    (sd.data->>'hourly_rate')::NUMERIC AS hourly_rate,
    sd.provider_code AS provider,
    sd.data AS raw_data,
    NOT sd.is_stale AND sd.expires_at > now() AS is_fresh
  FROM public.assembl_synced_data sd
  JOIN public.assembl_integrations i ON sd.integration_id = i.id
  WHERE sd.organisation_id = p_organisation_id
    AND sd.data_type = 'employees'
    AND i.status = 'active'
  ORDER BY sd.data->>'name';
END;
$$;

CREATE OR REPLACE FUNCTION public.assembl_agent_get_invoices(
  p_organisation_id UUID,
  p_status TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE(
  external_id TEXT,
  invoice_number TEXT,
  contact_name TEXT,
  amount NUMERIC,
  currency TEXT,
  status TEXT,
  due_date DATE,
  provider TEXT,
  raw_data JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT sd.external_id,
    sd.data->>'invoice_number' AS invoice_number,
    sd.data->>'contact_name' AS contact_name,
    (sd.data->>'amount')::NUMERIC AS amount,
    COALESCE(sd.data->>'currency', 'NZD') AS currency,
    sd.data->>'status' AS status,
    (sd.data->>'due_date')::DATE AS due_date,
    sd.provider_code AS provider,
    sd.data AS raw_data
  FROM public.assembl_synced_data sd
  JOIN public.assembl_integrations i ON sd.integration_id = i.id
  WHERE sd.organisation_id = p_organisation_id
    AND sd.data_type = 'invoices'
    AND i.status = 'active'
    AND (p_status IS NULL OR sd.data->>'status' = p_status)
  ORDER BY (sd.data->>'due_date')::DATE
  LIMIT p_limit;
END;
$$;

CREATE OR REPLACE FUNCTION public.assembl_agent_get_shifts(
  p_organisation_id UUID,
  p_from DATE DEFAULT CURRENT_DATE,
  p_to DATE DEFAULT CURRENT_DATE + 7
)
RETURNS TABLE(
  external_id TEXT,
  employee_name TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  role TEXT,
  location TEXT,
  provider TEXT,
  raw_data JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT sd.external_id,
    sd.data->>'employee_name' AS employee_name,
    (sd.data->>'start_time')::TIMESTAMPTZ AS start_time,
    (sd.data->>'end_time')::TIMESTAMPTZ AS end_time,
    sd.data->>'role' AS role,
    sd.data->>'location' AS location,
    sd.provider_code AS provider,
    sd.data AS raw_data
  FROM public.assembl_synced_data sd
  JOIN public.assembl_integrations i ON sd.integration_id = i.id
  WHERE sd.organisation_id = p_organisation_id
    AND sd.data_type = 'shifts'
    AND i.status = 'active'
    AND (sd.data->>'start_time')::DATE >= p_from
    AND (sd.data->>'start_time')::DATE <= p_to
  ORDER BY (sd.data->>'start_time')::TIMESTAMPTZ;
END;
$$;