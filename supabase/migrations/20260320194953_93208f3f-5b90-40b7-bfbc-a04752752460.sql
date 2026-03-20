
-- HAVEN Property Management Platform Schema

-- Custom enums
CREATE TYPE public.job_status AS ENUM ('reported','contacted','scheduled','in_progress','completed','invoice_uploaded');
CREATE TYPE public.urgency_level AS ENUM ('low','medium','high','emergency');
CREATE TYPE public.compliance_status AS ENUM ('compliant','due_soon','overdue','not_checked');

-- Properties
CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  suburb TEXT NOT NULL,
  region TEXT NOT NULL DEFAULT 'Auckland',
  tenant_name TEXT,
  tenant_phone TEXT,
  tenant_email TEXT,
  notes TEXT,
  image_url TEXT,
  next_inspection_date DATE,
  inspection_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own properties" ON public.properties FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own properties" ON public.properties FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own properties" ON public.properties FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own properties" ON public.properties FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON public.properties FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Tradies
CREATE TABLE public.tradies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  trade TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  service_area TEXT,
  licence_number TEXT,
  rating NUMERIC(3,1) DEFAULT 0,
  jobs_completed INTEGER DEFAULT 0,
  availability_token TEXT UNIQUE,
  bio TEXT,
  tagline TEXT,
  specialties TEXT[],
  certifications TEXT[],
  insurance_provider TEXT,
  website TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tradies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tradies" ON public.tradies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tradies" ON public.tradies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tradies" ON public.tradies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tradies" ON public.tradies FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Public can view tradies by token" ON public.tradies FOR SELECT USING (availability_token IS NOT NULL);

CREATE TRIGGER update_tradies_updated_at BEFORE UPDATE ON public.tradies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Maintenance Jobs
CREATE TABLE public.maintenance_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  tradie_id UUID REFERENCES public.tradies(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  urgency public.urgency_level DEFAULT 'medium',
  status public.job_status DEFAULT 'reported',
  reported_date DATE DEFAULT CURRENT_DATE,
  scheduled_date DATE,
  completed_date DATE,
  invoice_amount NUMERIC(10,2),
  notes TEXT,
  budget_min NUMERIC(10,2),
  budget_max NUMERIC(10,2),
  requires_quote BOOLEAN DEFAULT false,
  access_instructions TEXT,
  category TEXT,
  job_size TEXT DEFAULT 'unknown',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.maintenance_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own jobs" ON public.maintenance_jobs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own jobs" ON public.maintenance_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own jobs" ON public.maintenance_jobs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own jobs" ON public.maintenance_jobs FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.maintenance_jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Compliance Items
CREATE TABLE public.compliance_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  status public.compliance_status DEFAULT 'not_checked',
  due_date DATE,
  last_completed DATE,
  reminder_enabled BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.compliance_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own compliance" ON public.compliance_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own compliance" ON public.compliance_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own compliance" ON public.compliance_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own compliance" ON public.compliance_items FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_compliance_updated_at BEFORE UPDATE ON public.compliance_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Tenant Requests
CREATE TABLE public.tenant_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  tenant_name TEXT,
  description TEXT NOT NULL,
  urgency public.urgency_level DEFAULT 'medium',
  photos TEXT[],
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tenant_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit tenant requests" ON public.tenant_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Property owners can view requests" ON public.tenant_requests FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.properties WHERE properties.id = tenant_requests.property_id AND properties.user_id = auth.uid())
);
CREATE POLICY "Property owners can update requests" ON public.tenant_requests FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.properties WHERE properties.id = tenant_requests.property_id AND properties.user_id = auth.uid())
);

-- Job Offers (Uber-style broadcasting)
CREATE TABLE public.job_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.maintenance_jobs(id) ON DELETE CASCADE,
  tradie_id UUID NOT NULL REFERENCES public.tradies(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  token TEXT UNIQUE,
  sent_at TIMESTAMPTZ DEFAULT now(),
  responded_at TIMESTAMPTZ
);

ALTER TABLE public.job_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own job offers" ON public.job_offers FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.maintenance_jobs WHERE maintenance_jobs.id = job_offers.job_id AND maintenance_jobs.user_id = auth.uid())
);
CREATE POLICY "Users can insert job offers" ON public.job_offers FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.maintenance_jobs WHERE maintenance_jobs.id = job_offers.job_id AND maintenance_jobs.user_id = auth.uid())
);
CREATE POLICY "Users can update job offers" ON public.job_offers FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.maintenance_jobs WHERE maintenance_jobs.id = job_offers.job_id AND maintenance_jobs.user_id = auth.uid())
);
CREATE POLICY "Public can view offers by token" ON public.job_offers FOR SELECT USING (token IS NOT NULL);
CREATE POLICY "Public can update offers by token" ON public.job_offers FOR UPDATE USING (token IS NOT NULL);

-- Tradie Availability
CREATE TABLE public.tradie_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tradie_id UUID NOT NULL REFERENCES public.tradies(id) ON DELETE CASCADE,
  available_date DATE NOT NULL,
  is_available BOOLEAN DEFAULT true,
  notes TEXT,
  UNIQUE(tradie_id, available_date)
);

ALTER TABLE public.tradie_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tradie availability" ON public.tradie_availability FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.tradies WHERE tradies.id = tradie_availability.tradie_id AND tradies.user_id = auth.uid())
);
CREATE POLICY "Users can manage own tradie availability" ON public.tradie_availability FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.tradies WHERE tradies.id = tradie_availability.tradie_id AND tradies.user_id = auth.uid())
);
CREATE POLICY "Users can update own tradie availability" ON public.tradie_availability FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.tradies WHERE tradies.id = tradie_availability.tradie_id AND tradies.user_id = auth.uid())
);
CREATE POLICY "Public can view availability by token" ON public.tradie_availability FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.tradies WHERE tradies.id = tradie_availability.tradie_id AND tradies.availability_token IS NOT NULL)
);
CREATE POLICY "Public can manage availability by token" ON public.tradie_availability FOR ALL USING (
  EXISTS (SELECT 1 FROM public.tradies WHERE tradies.id = tradie_availability.tradie_id AND tradies.availability_token IS NOT NULL)
);

-- Inspection Notes
CREATE TABLE public.inspection_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.inspection_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own inspection notes" ON public.inspection_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own inspection notes" ON public.inspection_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own inspection notes" ON public.inspection_notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own inspection notes" ON public.inspection_notes FOR DELETE USING (auth.uid() = user_id);

-- Notifications
CREATE TABLE public.haven_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  related_id UUID,
  related_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.haven_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.haven_notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.haven_notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notifications" ON public.haven_notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
