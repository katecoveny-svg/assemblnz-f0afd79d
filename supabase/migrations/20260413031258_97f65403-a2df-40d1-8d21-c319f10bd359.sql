
-- compliance_scan_log — tracks automated scans
CREATE TABLE IF NOT EXISTS public.compliance_scan_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_date date NOT NULL DEFAULT CURRENT_DATE,
  sources_checked int DEFAULT 0,
  changes_detected int DEFAULT 0,
  high_impact_count int DEFAULT 0,
  scan_duration_seconds int,
  errors text[],
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.compliance_scan_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read scan logs" ON public.compliance_scan_log FOR SELECT USING (true);

-- admin_notifications
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  priority text DEFAULT 'MEDIUM',
  title text NOT NULL,
  body text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage notifications" ON public.admin_notifications FOR ALL USING (true);

-- Add verified column to compliance_updates
ALTER TABLE public.compliance_updates ADD COLUMN IF NOT EXISTS verified boolean DEFAULT false;
