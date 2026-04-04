
-- ============================================================
-- TŌROA FAMILY NAVIGATOR — FULL SCHEMA
-- ============================================================

-- 1. Upgrade toroa_families with new columns
ALTER TABLE public.toroa_families
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'starter',
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS monthly_sms_limit INT NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS sms_used_this_month INT NOT NULL DEFAULT 0;

-- 2. toroa_members
CREATE TABLE IF NOT EXISTS public.toroa_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.toroa_families(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'parent',
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.toroa_members ENABLE ROW LEVEL SECURITY;

-- 3. toroa_children
CREATE TABLE IF NOT EXISTS public.toroa_children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.toroa_families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INT,
  school TEXT,
  school_id TEXT,
  year_level INT,
  activities JSONB DEFAULT '[]'::jsonb,
  dietary_requirements JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.toroa_children ENABLE ROW LEVEL SECURITY;

-- 4. toroa_conversations (replaces toroa_messages for richer tracking)
CREATE TABLE IF NOT EXISTS public.toroa_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.toroa_families(id) ON DELETE CASCADE,
  member_id UUID REFERENCES public.toroa_members(id) ON DELETE SET NULL,
  direction TEXT NOT NULL DEFAULT 'incoming',
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  intent TEXT,
  response TEXT,
  tokens_used INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.toroa_conversations ENABLE ROW LEVEL SECURITY;

-- Validate direction
CREATE OR REPLACE FUNCTION public.validate_toroa_conv_direction()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.direction NOT IN ('incoming', 'outgoing') THEN
    RAISE EXCEPTION 'direction must be incoming or outgoing';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_toroa_conv_direction
  BEFORE INSERT OR UPDATE ON public.toroa_conversations
  FOR EACH ROW EXECUTE FUNCTION public.validate_toroa_conv_direction();

-- 5. toroa_newsletters
CREATE TABLE IF NOT EXISTS public.toroa_newsletters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.toroa_families(id) ON DELETE CASCADE,
  raw_text TEXT NOT NULL,
  school_name TEXT,
  action_items JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.toroa_newsletters ENABLE ROW LEVEL SECURITY;

-- 6. toroa_budgets
CREATE TABLE IF NOT EXISTS public.toroa_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.toroa_families(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  categories JSONB DEFAULT '{}'::jsonb,
  total_income DECIMAL(12,2) DEFAULT 0,
  total_expenses DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.toroa_budgets ENABLE ROW LEVEL SECURITY;

-- 7. toroa_meal_plans
CREATE TABLE IF NOT EXISTS public.toroa_meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.toroa_families(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  meals JSONB DEFAULT '[]'::jsonb,
  shopping_list JSONB DEFAULT '[]'::jsonb,
  estimated_cost DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.toroa_meal_plans ENABLE ROW LEVEL SECURITY;

-- 8. toroa_calendar_events
CREATE TABLE IF NOT EXISTS public.toroa_calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.toroa_families(id) ON DELETE CASCADE,
  member_id UUID REFERENCES public.toroa_members(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME,
  end_time TIME,
  location TEXT,
  category TEXT NOT NULL DEFAULT 'other',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.toroa_calendar_events ENABLE ROW LEVEL SECURITY;

-- 9. toroa_homework
CREATE TABLE IF NOT EXISTS public.toroa_homework (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.toroa_families(id) ON DELETE CASCADE,
  child_id UUID REFERENCES public.toroa_children(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  subject TEXT,
  due_date DATE,
  due_time TIME,
  description TEXT,
  estimated_hours DECIMAL(4,1),
  status TEXT NOT NULL DEFAULT 'assigned',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.toroa_homework ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_toroa_members_family ON public.toroa_members(family_id);
CREATE INDEX IF NOT EXISTS idx_toroa_children_family ON public.toroa_children(family_id);
CREATE INDEX IF NOT EXISTS idx_toroa_conv_family ON public.toroa_conversations(family_id);
CREATE INDEX IF NOT EXISTS idx_toroa_conv_phone ON public.toroa_conversations(phone);
CREATE INDEX IF NOT EXISTS idx_toroa_newsletters_family ON public.toroa_newsletters(family_id);
CREATE INDEX IF NOT EXISTS idx_toroa_budgets_family ON public.toroa_budgets(family_id);
CREATE INDEX IF NOT EXISTS idx_toroa_meals_family ON public.toroa_meal_plans(family_id);
CREATE INDEX IF NOT EXISTS idx_toroa_calendar_family ON public.toroa_calendar_events(family_id);
CREATE INDEX IF NOT EXISTS idx_toroa_homework_family ON public.toroa_homework(family_id);
CREATE INDEX IF NOT EXISTS idx_toroa_families_phone ON public.toroa_families(primary_phone);

-- RLS Policies — service role access for edge functions
CREATE POLICY "Service role full access" ON public.toroa_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON public.toroa_children FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON public.toroa_conversations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON public.toroa_newsletters FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON public.toroa_budgets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON public.toroa_meal_plans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON public.toroa_calendar_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON public.toroa_homework FOR ALL USING (true) WITH CHECK (true);
