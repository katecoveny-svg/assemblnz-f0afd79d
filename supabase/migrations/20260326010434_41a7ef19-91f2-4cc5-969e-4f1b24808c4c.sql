CREATE TABLE public.food_safety_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  record_date DATE NOT NULL,
  shift TEXT CHECK (shift IN ('opening','during_service','closing')),
  record_type TEXT NOT NULL,
  item_name TEXT,
  temperature NUMERIC,
  is_compliant BOOLEAN,
  checked_by TEXT NOT NULL,
  notes TEXT,
  corrective_action TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.food_safety_checklists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  checklist_date DATE NOT NULL,
  shift TEXT CHECK (shift IN ('opening','closing')),
  items JSONB NOT NULL,
  completed_by TEXT NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.food_safety_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_safety_checklists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own food safety records" ON public.food_safety_records FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own food safety checklists" ON public.food_safety_checklists FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);