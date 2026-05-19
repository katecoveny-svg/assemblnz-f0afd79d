CREATE TABLE IF NOT EXISTS public.food_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_name TEXT NOT NULL,
  recorded_by TEXT NOT NULL,
  recorded_date DATE NOT NULL,
  fridge_temps JSONB NOT NULL DEFAULT '[]',
  freezer_temps JSONB NOT NULL DEFAULT '[]',
  hot_hold_temps JSONB NOT NULL DEFAULT '[]',
  cooking_temps JSONB NOT NULL DEFAULT '[]',
  cleaning_checks JSONB NOT NULL DEFAULT '{}',
  notes TEXT,
  failed_readings JSONB NOT NULL DEFAULT '[]',
  photo_urls TEXT[],
  ip_hash TEXT,
  tenant_id UUID REFERENCES public.tenants(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_food_audit_logs_venue_recorded_date
  ON public.food_audit_logs (venue_name, recorded_date DESC);

CREATE INDEX IF NOT EXISTS idx_food_audit_logs_tenant_recorded_date
  ON public.food_audit_logs (tenant_id, recorded_date DESC);
