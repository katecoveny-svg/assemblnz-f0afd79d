
-- ============================================================
-- WAIHANGA: photo_docs + safety_audits
-- ============================================================
CREATE TABLE IF NOT EXISTS public.photo_docs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  project_id UUID,
  caption TEXT,
  photo_url TEXT NOT NULL,
  taken_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  gps_lat NUMERIC,
  gps_lng NUMERIC,
  tags TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.photo_docs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "photo_docs_owner_all" ON public.photo_docs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER photo_docs_updated BEFORE UPDATE ON public.photo_docs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.safety_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  project_id UUID,
  audit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  inspector TEXT NOT NULL,
  findings TEXT,
  pass BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.safety_audits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "safety_audits_owner_all" ON public.safety_audits FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER safety_audits_updated BEFORE UPDATE ON public.safety_audits FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- ARATAKI: extend workshop_jobs + new loan_cars
-- ============================================================
ALTER TABLE public.workshop_jobs
  ADD COLUMN IF NOT EXISTS vehicle_make TEXT,
  ADD COLUMN IF NOT EXISTS vehicle_model TEXT,
  ADD COLUMN IF NOT EXISTS rego TEXT,
  ADD COLUMN IF NOT EXISTS customer_name TEXT,
  ADD COLUMN IF NOT EXISTS technician TEXT,
  ADD COLUMN IF NOT EXISTS due_date DATE;

-- workshop_jobs has user_id but no RLS guarantee — ensure it
ALTER TABLE public.workshop_jobs ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='workshop_jobs' AND policyname='workshop_jobs_owner_all') THEN
    CREATE POLICY "workshop_jobs_owner_all" ON public.workshop_jobs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.loan_cars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  rego TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available',
  borrower_name TEXT,
  borrower_phone TEXT,
  return_date DATE,
  linked_job_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.loan_cars ENABLE ROW LEVEL SECURITY;
CREATE POLICY "loan_cars_owner_all" ON public.loan_cars FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER loan_cars_updated BEFORE UPDATE ON public.loan_cars FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- AUAHA: content_queue
-- ============================================================
CREATE TABLE IF NOT EXISTS public.content_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'social',
  author TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'queued',
  rejection_reason TEXT,
  content_body TEXT,
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.content_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "content_queue_owner_all" ON public.content_queue FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER content_queue_updated BEFORE UPDATE ON public.content_queue FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- PIKAU: extend shipments + new customs_entries
-- ============================================================
ALTER TABLE public.shipments
  ADD COLUMN IF NOT EXISTS shipment_ref TEXT,
  ADD COLUMN IF NOT EXISTS eta DATE;

ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='shipments' AND policyname='shipments_owner_all') THEN
    CREATE POLICY "shipments_owner_all" ON public.shipments FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.customs_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  entry_number TEXT NOT NULL,
  importer TEXT,
  hs_code TEXT,
  duty_rate NUMERIC,
  gst_amount NUMERIC,
  status TEXT NOT NULL DEFAULT 'draft',
  broker_name TEXT,
  lodged_date DATE,
  cleared_date DATE,
  shipment_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.customs_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "customs_entries_owner_all" ON public.customs_entries FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER customs_entries_updated BEFORE UPDATE ON public.customs_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- FLUX: deals
-- ============================================================
CREATE TABLE IF NOT EXISTS public.deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  account_name TEXT NOT NULL,
  value_nzd NUMERIC NOT NULL DEFAULT 0,
  stage TEXT NOT NULL DEFAULT 'discovery',
  next_action TEXT,
  days_in_stage INTEGER DEFAULT 0,
  owner TEXT,
  contact_name TEXT,
  contact_email TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "deals_owner_all" ON public.deals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER deals_updated BEFORE UPDATE ON public.deals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- TORO: school + transport
-- ============================================================
CREATE TABLE IF NOT EXISTS public.school_newsletters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  school_id TEXT,
  school_name TEXT,
  title TEXT NOT NULL,
  body TEXT,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.school_newsletters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "school_newsletters_owner_all" ON public.school_newsletters FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER school_newsletters_updated BEFORE UPDATE ON public.school_newsletters FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.permission_slips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  school_id TEXT,
  event_name TEXT NOT NULL,
  event_date DATE,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  child_name TEXT,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.permission_slips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "permission_slips_owner_all" ON public.permission_slips FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER permission_slips_updated BEFORE UPDATE ON public.permission_slips FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.school_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  school_id TEXT,
  title TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_time TEXT,
  location TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.school_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "school_events_owner_all" ON public.school_events FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER school_events_updated BEFORE UPDATE ON public.school_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.transport_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  route_number TEXT NOT NULL,
  route_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'on_time',
  delay_minutes INTEGER DEFAULT 0,
  next_departure TEXT,
  child_stop TEXT,
  stops_json JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.transport_routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "transport_routes_owner_all" ON public.transport_routes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER transport_routes_updated BEFORE UPDATE ON public.transport_routes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.transport_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  route_id UUID,
  alert_type TEXT NOT NULL DEFAULT 'info',
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.transport_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "transport_alerts_owner_all" ON public.transport_alerts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Useful indexes
CREATE INDEX IF NOT EXISTS idx_photo_docs_project ON public.photo_docs(project_id);
CREATE INDEX IF NOT EXISTS idx_safety_audits_project ON public.safety_audits(project_id);
CREATE INDEX IF NOT EXISTS idx_loan_cars_status ON public.loan_cars(status);
CREATE INDEX IF NOT EXISTS idx_content_queue_status ON public.content_queue(status);
CREATE INDEX IF NOT EXISTS idx_customs_entries_status ON public.customs_entries(status);
CREATE INDEX IF NOT EXISTS idx_deals_stage ON public.deals(stage);
CREATE INDEX IF NOT EXISTS idx_school_events_date ON public.school_events(event_date);
CREATE INDEX IF NOT EXISTS idx_transport_alerts_route ON public.transport_alerts(route_id);
