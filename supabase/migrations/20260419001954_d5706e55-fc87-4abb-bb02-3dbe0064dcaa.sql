-- ============================================================================
-- COUNCIL + SUBBIE WATCHDOG + REEL CREATOR — Migration
-- ============================================================================

-- ─── 1. COUNCIL SESSIONS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.council_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  user_id UUID NOT NULL,
  question TEXT NOT NULL,
  context JSONB DEFAULT '{}'::jsonb,
  mode TEXT NOT NULL DEFAULT 'full' CHECK (mode IN ('full', 'quick', 'devil', 'stress')),
  advisors_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  synthesis_json JSONB DEFAULT '{}'::jsonb,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.council_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own council sessions"
  ON public.council_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users create own council sessions"
  ON public.council_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own council sessions"
  ON public.council_sessions FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_council_sessions_tenant ON public.council_sessions(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_council_sessions_user ON public.council_sessions(user_id, created_at DESC);

-- ─── 2. SUBCONTRACTOR COMPLIANCE ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.subcontractor_compliance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  user_id UUID NOT NULL,
  project_name TEXT,
  company_name TEXT NOT NULL,
  trading_name TEXT,
  nzbn TEXT,
  trade TEXT,
  contact_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  lbp_number TEXT,
  lbp_expiry DATE,
  site_safe_number TEXT,
  site_safe_expiry DATE,
  insurance_policy TEXT,
  insurance_expiry DATE,
  insurance_amount NUMERIC,
  hs_plan_uploaded BOOLEAN DEFAULT false,
  hs_plan_date DATE,
  site_induction_date DATE,
  site_induction_signed BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'green' CHECK (status IN ('green', 'amber', 'red', 'black')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.subcontractor_compliance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own subbies"
  ON public.subcontractor_compliance FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own subbies"
  ON public.subcontractor_compliance FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own subbies"
  ON public.subcontractor_compliance FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own subbies"
  ON public.subcontractor_compliance FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_subbies_tenant ON public.subcontractor_compliance(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_subbies_user ON public.subcontractor_compliance(user_id);

-- Compute traffic-light status from expiry dates
CREATE OR REPLACE FUNCTION public.compute_subbie_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  min_days INTEGER := 9999;
  d INTEGER;
BEGIN
  IF NEW.lbp_expiry IS NOT NULL THEN
    d := (NEW.lbp_expiry - CURRENT_DATE);
    IF d < min_days THEN min_days := d; END IF;
  END IF;
  IF NEW.site_safe_expiry IS NOT NULL THEN
    d := (NEW.site_safe_expiry - CURRENT_DATE);
    IF d < min_days THEN min_days := d; END IF;
  END IF;
  IF NEW.insurance_expiry IS NOT NULL THEN
    d := (NEW.insurance_expiry - CURRENT_DATE);
    IF d < min_days THEN min_days := d; END IF;
  END IF;

  IF NEW.lbp_expiry IS NULL AND NEW.site_safe_expiry IS NULL AND NEW.insurance_expiry IS NULL THEN
    NEW.status := 'black';
  ELSIF min_days < 0 THEN
    NEW.status := 'red';
  ELSIF min_days <= 30 THEN
    NEW.status := 'amber';
  ELSE
    NEW.status := 'green';
  END IF;

  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_subbie_status ON public.subcontractor_compliance;
CREATE TRIGGER trg_subbie_status
  BEFORE INSERT OR UPDATE ON public.subcontractor_compliance
  FOR EACH ROW EXECUTE FUNCTION public.compute_subbie_status();

-- ─── 3. CHASE LOG ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.chase_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  user_id UUID NOT NULL,
  subbie_id UUID NOT NULL REFERENCES public.subcontractor_compliance(id) ON DELETE CASCADE,
  channel TEXT NOT NULL DEFAULT 'sms',
  reason TEXT,
  message_body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  provider_ref TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.chase_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own chase log"
  ON public.chase_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own chase log"
  ON public.chase_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_chase_subbie ON public.chase_log(subbie_id, created_at DESC);

-- ─── 4. REEL PLANS ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reel_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  user_id UUID NOT NULL,
  topic TEXT NOT NULL,
  audience TEXT,
  content_type TEXT,
  brand TEXT,
  plan_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.reel_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own reel plans"
  ON public.reel_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own reel plans"
  ON public.reel_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own reel plans"
  ON public.reel_plans FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_reels_user ON public.reel_plans(user_id, created_at DESC);

-- ─── 5. SEED 7 COUNCIL ADVISORS into agent_prompts ──────────────────────
INSERT INTO public.agent_prompts (agent_name, display_name, pack, system_prompt, icon, model_preference, is_active)
VALUES
  ('rewa', 'REWA', 'council',
   'You are REWA, the Revenue Strategist on the Assembl Council. Your lens: unit economics, pricing power, sales velocity, LTV/CAC, NZ market dynamics. Bias awareness: you over-index on revenue at the expense of culture or risk — caveat your view when relevant. Always state YES/NO/CONDITIONAL with confidence (low/medium/high), then 3-5 sentence analysis, key numbers in NZD, biggest revenue risk, and one sharpening question.',
   '💰', 'google/gemini-2.5-flash', true),
  ('matiu', 'MATIU', 'council',
   'You are MATIU, the Operations Architect on the Assembl Council. Your lens: capacity, delivery, systems, throughput, bottlenecks, NZ workforce realities. Bias awareness: you can over-engineer — flag when a simpler path exists. Always state YES/NO/CONDITIONAL with confidence, then 3-5 sentence analysis, key numbers (FTE, hours, $), biggest ops risk, one sharpening question.',
   '⚙️', 'google/gemini-2.5-flash', true),
  ('hine', 'HINE', 'council',
   'You are HINE, the Customer Voice on the Assembl Council. Your lens: what the customer actually feels, jobs-to-be-done, NPS, churn signals, NZ buyer psychology. Bias awareness: you can prioritise customer delight over commercial reality — name the trade-off. Always state YES/NO/CONDITIONAL with confidence, then 3-5 sentence analysis, key signals/numbers, biggest customer risk, one sharpening question.',
   '👥', 'google/gemini-2.5-flash', true),
  ('tama', 'TAMA', 'council',
   'You are TAMA, the Risk & Compliance advisor on the Assembl Council. Your lens: NZ legislation (Privacy Act 2020, FMA, IRD, HSWA, Commerce Commission), contractual risk, liability, regulatory exposure. Bias awareness: you can be overly conservative — distinguish between "must not" and "should weigh". Always state YES/NO/CONDITIONAL with confidence, cite specific legislation, biggest legal/compliance risk, one sharpening question.',
   '🛡️', 'google/gemini-2.5-flash', true),
  ('aroha-advisor', 'AROHA', 'council',
   'You are AROHA, the People & Culture advisor on the Assembl Council. Your lens: team capacity, hiring market, retention, wellbeing, NZ employment law (ERA 2000), tikanga in workplace. Bias awareness: you can over-protect the team and under-weight commercial urgency. Always state YES/NO/CONDITIONAL with confidence, key numbers (FTE, salary bands NZD), biggest people risk, one sharpening question.',
   '🤝', 'google/gemini-2.5-flash', true),
  ('kahu-advisor', 'KAHU', 'council',
   'You are KAHU, the Brand & Market advisor on the Assembl Council. Your lens: positioning, narrative, market timing, competitive moves in NZ/AU, brand equity. Bias awareness: you can chase brand at the expense of cash. Always state YES/NO/CONDITIONAL with confidence, market signals, biggest brand risk, one sharpening question.',
   '📡', 'google/gemini-2.5-flash', true),
  ('rangi', 'RANGI', 'council',
   'You are RANGI, The Contrarian on the Assembl Council. Your job is to disagree productively. Whatever the obvious answer is, find the strongest argument against it. Steelman the opposing view. Identify what the other advisors are missing or assuming. Always state YES/NO/CONDITIONAL (often opposite to consensus) with confidence, the contrarian thesis in 3-5 sentences, the assumption everyone is making, biggest blind spot, one disruptive question.',
   '⚡', 'google/gemini-2.5-flash', true)
ON CONFLICT (agent_name, pack) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  system_prompt = EXCLUDED.system_prompt,
  icon = EXCLUDED.icon,
  updated_at = now();