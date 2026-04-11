
-- ===== SIGNAL RBAC =====
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Roles readable by authenticated users"
  ON public.roles FOR SELECT TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  kete TEXT NOT NULL,
  action TEXT NOT NULL,
  allowed BOOLEAN DEFAULT true,
  UNIQUE(role_id, kete, action)
);

ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permissions readable by authenticated users"
  ON public.permissions FOR SELECT TO authenticated USING (true);

-- Seed default roles
INSERT INTO public.roles (name, description) VALUES
  ('admin', 'Full access to all kete functions'),
  ('operator', 'Can execute actions and view results'),
  ('analyst', 'Read-only access to reports and evidence'),
  ('viewer', 'View-only access to dashboards')
ON CONFLICT (name) DO NOTHING;

-- ===== PRIVACY & BREACH MANAGEMENT =====
CREATE TABLE IF NOT EXISTS public.breach_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  breach_id TEXT NOT NULL UNIQUE,
  discovery_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  description TEXT NOT NULL,
  affected_data_types TEXT[] DEFAULT '{}',
  estimated_affected INTEGER DEFAULT 0,
  harm_likelihood TEXT NOT NULL DEFAULT 'low',
  containment_actions TEXT[] DEFAULT '{}',
  is_notifiable BOOLEAN DEFAULT false,
  level TEXT DEFAULT 'minor',
  deadline_72h TIMESTAMPTZ,
  notify_commissioner BOOLEAN DEFAULT false,
  notify_individuals BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.breach_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Breach reports readable by authenticated users"
  ON public.breach_reports FOR SELECT TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS public.sar_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  request_type TEXT NOT NULL DEFAULT 'access',
  subject_description TEXT,
  status TEXT DEFAULT 'received',
  response_deadline TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sar_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own SAR requests"
  ON public.sar_requests FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create SAR requests"
  ON public.sar_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.ipp_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  consented BOOLEAN DEFAULT false,
  consented_at TIMESTAMPTZ,
  ipp_numbers INTEGER[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, action_type)
);

ALTER TABLE public.ipp_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own consents"
  ON public.ipp_consents FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own consents"
  ON public.ipp_consents FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own consents"
  ON public.ipp_consents FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- ===== ARATAKI (AUTOMOTIVE) =====
CREATE TABLE IF NOT EXISTS public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id TEXT NOT NULL UNIQUE,
  fleet_id TEXT,
  registration TEXT,
  make TEXT,
  model TEXT,
  year INTEGER,
  wof_expiry DATE,
  cof_expiry DATE,
  status TEXT DEFAULT 'active',
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own vehicles"
  ON public.vehicles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create vehicles"
  ON public.vehicles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vehicles"
  ON public.vehicles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.workshop_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id TEXT NOT NULL UNIQUE DEFAULT 'job_' || gen_random_uuid(),
  vehicle_id TEXT NOT NULL,
  fleet_id TEXT,
  job_type TEXT,
  scheduled_start TIMESTAMPTZ,
  scheduled_end TIMESTAMPTZ,
  status TEXT DEFAULT 'scheduled',
  notes TEXT,
  user_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.workshop_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workshop jobs readable by authenticated users"
  ON public.workshop_jobs FOR SELECT TO authenticated USING (true);

CREATE POLICY "Workshop jobs insertable by authenticated users"
  ON public.workshop_jobs FOR INSERT TO authenticated WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.wof_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id TEXT NOT NULL,
  fleet_id TEXT,
  booked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT DEFAULT 'confirmed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.wof_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "WoF bookings readable by authenticated users"
  ON public.wof_bookings FOR SELECT TO authenticated USING (true);

CREATE POLICY "WoF bookings insertable by authenticated users"
  ON public.wof_bookings FOR INSERT TO authenticated WITH CHECK (true);

-- ===== PIKAU (FREIGHT) =====
CREATE TABLE IF NOT EXISTS public.tariff_classification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hs_code TEXT NOT NULL UNIQUE,
  description TEXT,
  tariff_rate NUMERIC DEFAULT 0,
  dual_use_flag BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tariff_classification ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tariff data readable by authenticated users"
  ON public.tariff_classification FOR SELECT TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS public.mpi_import_standards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_category TEXT NOT NULL,
  origin_country TEXT NOT NULL,
  clearance_required BOOLEAN DEFAULT false,
  prohibited BOOLEAN DEFAULT false,
  standard_reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.mpi_import_standards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "MPI standards readable by authenticated users"
  ON public.mpi_import_standards FOR SELECT TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS public.hsno_classification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hazard_class TEXT NOT NULL,
  description TEXT,
  special_handling BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.hsno_classification ENABLE ROW LEVEL SECURITY;

CREATE POLICY "HSNO data readable by authenticated users"
  ON public.hsno_classification FOR SELECT TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS public.customs_declarations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id TEXT NOT NULL,
  importer_id TEXT,
  item_description TEXT,
  hs_code TEXT,
  value_nzd NUMERIC,
  tariff_rate NUMERIC DEFAULT 0,
  estimated_duties NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.customs_declarations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customs declarations readable by authenticated users"
  ON public.customs_declarations FOR SELECT TO authenticated USING (true);

CREATE POLICY "Customs declarations insertable by authenticated users"
  ON public.customs_declarations FOR INSERT TO authenticated WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.biosecurity_clearances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id TEXT NOT NULL,
  mpi_standards_applied TEXT[] DEFAULT '{}',
  clearance_time INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.biosecurity_clearances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Biosecurity clearances readable by authenticated users"
  ON public.biosecurity_clearances FOR SELECT TO authenticated USING (true);

CREATE POLICY "Biosecurity clearances insertable by authenticated users"
  ON public.biosecurity_clearances FOR INSERT TO authenticated WITH CHECK (true);

-- Update timestamps triggers
CREATE TRIGGER update_breach_reports_updated_at BEFORE UPDATE ON public.breach_reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sar_requests_updated_at BEFORE UPDATE ON public.sar_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ipp_consents_updated_at BEFORE UPDATE ON public.ipp_consents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON public.vehicles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_workshop_jobs_updated_at BEFORE UPDATE ON public.workshop_jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
