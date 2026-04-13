
-- ========================================
-- TŌROA MODULE TABLES
-- ========================================

-- Pets module
CREATE TABLE public.toroa_pets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES public.toroa_families(id) ON DELETE CASCADE,
  name text NOT NULL,
  species text NOT NULL DEFAULT 'dog',
  breed text,
  date_of_birth date,
  weight_kg numeric,
  microchip_number text,
  vet_clinic text,
  vet_phone text,
  insurance_provider text,
  insurance_policy text,
  vaccinations jsonb DEFAULT '[]'::jsonb,
  medications jsonb DEFAULT '[]'::jsonb,
  notes text,
  photo_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.toroa_pets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Family members manage pets" ON public.toroa_pets FOR ALL USING (true) WITH CHECK (true);

-- Uniforms module
CREATE TABLE public.toroa_uniforms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES public.toroa_families(id) ON DELETE CASCADE,
  child_id uuid REFERENCES public.toroa_children(id) ON DELETE CASCADE,
  item_type text NOT NULL,
  size text,
  quantity int NOT NULL DEFAULT 1,
  condition text DEFAULT 'good',
  color text,
  school text,
  purchase_date date,
  cost_cents int,
  needs_replacement boolean DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.toroa_uniforms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Family members manage uniforms" ON public.toroa_uniforms FOR ALL USING (true) WITH CHECK (true);

-- Appointments module
CREATE TABLE public.toroa_appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES public.toroa_families(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  appointment_at timestamptz NOT NULL,
  duration_minutes int DEFAULT 30,
  location text,
  category text DEFAULT 'general',
  status text DEFAULT 'upcoming',
  member_id uuid REFERENCES public.toroa_members(id) ON DELETE SET NULL,
  pet_id uuid REFERENCES public.toroa_pets(id) ON DELETE SET NULL,
  child_id uuid REFERENCES public.toroa_children(id) ON DELETE SET NULL,
  reminder_sent boolean DEFAULT false,
  recurrence text,
  is_overdue boolean DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.toroa_appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Family members manage appointments" ON public.toroa_appointments FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX idx_toroa_appointments_family_date ON public.toroa_appointments(family_id, appointment_at);

-- Shopping module
CREATE TABLE public.toroa_shopping (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES public.toroa_families(id) ON DELETE CASCADE,
  item text NOT NULL,
  quantity int DEFAULT 1,
  category text DEFAULT 'groceries',
  estimated_cost_cents int,
  actual_cost_cents int,
  purchased boolean DEFAULT false,
  purchased_at timestamptz,
  store text,
  added_by text,
  priority text DEFAULT 'normal',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.toroa_shopping ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Family members manage shopping" ON public.toroa_shopping FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX idx_toroa_shopping_family ON public.toroa_shopping(family_id, purchased);

-- ========================================
-- MANAAKI / HOSPITALITY ADD-ON
-- ========================================

CREATE TABLE public.manaaki_food_diary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  business_name text,
  entry_date date NOT NULL DEFAULT CURRENT_DATE,
  entry_type text NOT NULL DEFAULT 'opening_check',
  temperature_logs jsonb DEFAULT '[]'::jsonb,
  supplier_records jsonb DEFAULT '[]'::jsonb,
  corrective_actions text,
  completed_by text,
  verified boolean DEFAULT false,
  verifier_notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.manaaki_food_diary ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own food diary" ON public.manaaki_food_diary FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.manaaki_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  platform text NOT NULL DEFAULT 'google',
  reviewer_name text,
  rating int,
  review_text text,
  review_date timestamptz,
  response_draft text,
  response_status text DEFAULT 'pending',
  response_sent_at timestamptz,
  sentiment text,
  themes text[],
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.manaaki_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own reviews" ON public.manaaki_reviews FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.manaaki_pricing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  target_date date NOT NULL,
  current_rate_cents int,
  recommended_rate_cents int,
  reasoning text,
  occupancy_pct numeric,
  local_events jsonb DEFAULT '[]'::jsonb,
  competitor_rates jsonb DEFAULT '[]'::jsonb,
  accepted boolean,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.manaaki_pricing ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own pricing" ON public.manaaki_pricing FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ========================================
-- WAKA / AUTOMOTIVE ADD-ON
-- ========================================

CREATE TABLE public.waka_vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  rego text NOT NULL,
  make text,
  model text,
  year int,
  vin text,
  colour text,
  fuel_type text DEFAULT 'petrol',
  current_location text,
  odometer_km int,
  wof_expiry date,
  rego_expiry date,
  ruc_balance_km int,
  ruc_avg_weekly_km int,
  purchase_date date,
  purchase_price_cents int,
  status text DEFAULT 'in_stock',
  service_history jsonb DEFAULT '[]'::jsonb,
  photos text[],
  listing_url text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.waka_vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own vehicles" ON public.waka_vehicles FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.waka_customer_vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  customer_name text NOT NULL,
  customer_phone text,
  customer_email text,
  vehicle_id uuid REFERENCES public.waka_vehicles(id) ON DELETE SET NULL,
  rego text,
  make_model text,
  last_service_date date,
  next_service_due date,
  wof_expiry date,
  finance_balloon_date date,
  churn_risk_pct int,
  last_contact_date date,
  lifetime_value_cents int,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.waka_customer_vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own customer vehicles" ON public.waka_customer_vehicles FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ========================================
-- WHENUA / PROPERTY ADD-ON
-- ========================================

CREATE TABLE public.whenua_properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  address text NOT NULL,
  suburb text,
  city text,
  property_type text DEFAULT 'residential',
  bedrooms int,
  bathrooms int,
  weekly_rent_cents int,
  current_tenant_name text,
  lease_start date,
  lease_end date,
  bond_cents int,
  healthy_homes_heating text DEFAULT 'unknown',
  healthy_homes_insulation text DEFAULT 'unknown',
  healthy_homes_ventilation text DEFAULT 'unknown',
  healthy_homes_moisture text DEFAULT 'unknown',
  healthy_homes_draught text DEFAULT 'unknown',
  healthy_homes_drainage text DEFAULT 'unknown',
  insurance_provider text,
  insurance_renewal date,
  insurance_premium_cents int,
  rates_annual_cents int,
  gross_yield_pct numeric,
  net_yield_pct numeric,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.whenua_properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own properties" ON public.whenua_properties FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.whenua_tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  property_id uuid REFERENCES public.whenua_properties(id) ON DELETE CASCADE,
  tenant_name text NOT NULL,
  tenant_email text,
  tenant_phone text,
  lease_start date,
  lease_end date,
  weekly_rent_cents int,
  bond_lodged boolean DEFAULT false,
  bond_reference text,
  communication_log jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.whenua_tenants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own tenants" ON public.whenua_tenants FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.whenua_maintenance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  property_id uuid REFERENCES public.whenua_properties(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  contractor_name text,
  contractor_phone text,
  cost_cents int,
  status text DEFAULT 'pending',
  reported_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  photos text[],
  warranty_until date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.whenua_maintenance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own maintenance" ON public.whenua_maintenance FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ========================================
-- PAKIHI / PROFESSIONAL SERVICES ADD-ON
-- ========================================

CREATE TABLE public.pakihi_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  client_name text NOT NULL,
  contact_name text,
  contact_email text,
  contact_phone text,
  industry text,
  stage text DEFAULT 'prospect',
  engagement_type text,
  fee_estimate_cents int,
  probability_pct int DEFAULT 50,
  source text,
  engagement_letter_sent boolean DEFAULT false,
  engagement_signed_date date,
  renewal_date date,
  total_billed_cents int DEFAULT 0,
  total_paid_cents int DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.pakihi_clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own clients" ON public.pakihi_clients FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.pakihi_time_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  client_id uuid REFERENCES public.pakihi_clients(id) ON DELETE CASCADE,
  matter text,
  description text NOT NULL,
  hours numeric NOT NULL,
  rate_cents int,
  billable boolean DEFAULT true,
  entry_date date NOT NULL DEFAULT CURRENT_DATE,
  invoiced boolean DEFAULT false,
  invoice_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.pakihi_time_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own time entries" ON public.pakihi_time_entries FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_toroa_pets_updated_at BEFORE UPDATE ON public.toroa_pets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_toroa_uniforms_updated_at BEFORE UPDATE ON public.toroa_uniforms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_toroa_appointments_updated_at BEFORE UPDATE ON public.toroa_appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_waka_vehicles_updated_at BEFORE UPDATE ON public.waka_vehicles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_waka_customer_vehicles_updated_at BEFORE UPDATE ON public.waka_customer_vehicles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_whenua_properties_updated_at BEFORE UPDATE ON public.whenua_properties FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_whenua_tenants_updated_at BEFORE UPDATE ON public.whenua_tenants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pakihi_clients_updated_at BEFORE UPDATE ON public.pakihi_clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
