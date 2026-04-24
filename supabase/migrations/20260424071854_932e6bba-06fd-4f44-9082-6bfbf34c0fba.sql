-- WAVE 1: MONEY & CHORES
CREATE TABLE IF NOT EXISTS public.toroa_child_pocket_money (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.toroa_families(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES public.toroa_children(id) ON DELETE CASCADE,
  weekly_amount DECIMAL(8,2) DEFAULT 15.00,
  save_percent INT DEFAULT 33 CHECK (save_percent BETWEEN 0 AND 100),
  spend_percent INT DEFAULT 34 CHECK (spend_percent BETWEEN 0 AND 100),
  give_percent INT DEFAULT 33 CHECK (give_percent BETWEEN 0 AND 100),
  save_balance DECIMAL(10,2) DEFAULT 0,
  spend_balance DECIMAL(10,2) DEFAULT 0,
  give_balance DECIMAL(10,2) DEFAULT 0,
  payday TEXT DEFAULT 'friday',
  auto_distribute BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(family_id, child_id)
);
ALTER TABLE public.toroa_child_pocket_money ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_toroa_pocket_money_family ON public.toroa_child_pocket_money(family_id);
CREATE INDEX IF NOT EXISTS idx_toroa_pocket_money_child ON public.toroa_child_pocket_money(child_id);
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='toroa_child_pocket_money' AND policyname='service_full_access') THEN CREATE POLICY "service_full_access" ON public.toroa_child_pocket_money FOR ALL USING (true) WITH CHECK (true); END IF; END $$;

CREATE TABLE IF NOT EXISTS public.toroa_chore_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.toroa_families(id) ON DELETE CASCADE,
  child_id UUID REFERENCES public.toroa_children(id) ON DELETE CASCADE,
  chore_name TEXT NOT NULL,
  description TEXT,
  points INT DEFAULT 10,
  bonus_amount DECIMAL(6,2) DEFAULT 0,
  frequency TEXT DEFAULT 'daily' CHECK (frequency IN ('daily','weekly','one-off','weekdays','weekends')),
  due_day TEXT,
  due_time TIME,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','done','verified','skipped','overdue')),
  completed_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id),
  streak_count INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  total_completions INT DEFAULT 0,
  icon TEXT DEFAULT 'sparkles',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
ALTER TABLE public.toroa_chore_assignments ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_toroa_chores_family ON public.toroa_chore_assignments(family_id);
CREATE INDEX IF NOT EXISTS idx_toroa_chores_child ON public.toroa_chore_assignments(child_id);
CREATE INDEX IF NOT EXISTS idx_toroa_chores_status ON public.toroa_chore_assignments(status) WHERE deleted_at IS NULL;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='toroa_chore_assignments' AND policyname='service_full_access') THEN CREATE POLICY "service_full_access" ON public.toroa_chore_assignments FOR ALL USING (true) WITH CHECK (true); END IF; END $$;

CREATE TABLE IF NOT EXISTS public.toroa_savings_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.toroa_families(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES public.toroa_children(id) ON DELETE CASCADE,
  goal_name TEXT NOT NULL,
  target_amount DECIMAL(10,2) NOT NULL,
  saved_amount DECIMAL(10,2) DEFAULT 0,
  target_date DATE,
  photo_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','achieved','cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  achieved_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);
ALTER TABLE public.toroa_savings_goals ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_toroa_savings_child ON public.toroa_savings_goals(child_id);
CREATE INDEX IF NOT EXISTS idx_toroa_savings_family ON public.toroa_savings_goals(family_id);
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='toroa_savings_goals' AND policyname='service_full_access') THEN CREATE POLICY "service_full_access" ON public.toroa_savings_goals FOR ALL USING (true) WITH CHECK (true); END IF; END $$;

CREATE TABLE IF NOT EXISTS public.toroa_money_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.toroa_families(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES public.toroa_children(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  jar TEXT NOT NULL CHECK (jar IN ('save','spend','give')),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('allowance','chore_bonus','gift','spend','donation','goal_transfer','adjustment')),
  description TEXT,
  chore_id UUID REFERENCES public.toroa_chore_assignments(id),
  goal_id UUID REFERENCES public.toroa_savings_goals(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.toroa_money_transactions ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_toroa_money_tx_child ON public.toroa_money_transactions(child_id);
CREATE INDEX IF NOT EXISTS idx_toroa_money_tx_family ON public.toroa_money_transactions(family_id);
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='toroa_money_transactions' AND policyname='service_full_access') THEN CREATE POLICY "service_full_access" ON public.toroa_money_transactions FOR ALL USING (true) WITH CHECK (true); END IF; END $$;

-- WAVE 2: HOMEWORK (extends existing toroa_homework)
ALTER TABLE public.toroa_homework
  ADD COLUMN IF NOT EXISTS child_id UUID REFERENCES public.toroa_children(id),
  ADD COLUMN IF NOT EXISTS year_level INT,
  ADD COLUMN IF NOT EXISTS curriculum_area TEXT,
  ADD COLUMN IF NOT EXISTS curriculum_strand TEXT,
  ADD COLUMN IF NOT EXISTS ncea_standard TEXT,
  ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS time_spent_minutes INT,
  ADD COLUMN IF NOT EXISTS ai_help_used BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS parent_notes TEXT;
CREATE INDEX IF NOT EXISTS idx_toroa_homework_child ON public.toroa_homework(child_id);

CREATE TABLE IF NOT EXISTS public.toroa_curriculum_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year_level INT NOT NULL CHECK (year_level BETWEEN 0 AND 13),
  curriculum_area TEXT NOT NULL,
  curriculum_strand TEXT,
  resource_name TEXT NOT NULL,
  resource_url TEXT,
  resource_type TEXT CHECK (resource_type IN ('video','worksheet','game','practice','nzqa_paper','interactive','textbook','app')),
  provider TEXT,
  ncea_standard TEXT,
  is_free BOOLEAN DEFAULT TRUE,
  quality_rating INT DEFAULT 3 CHECK (quality_rating BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.toroa_curriculum_resources ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_toroa_curriculum_year ON public.toroa_curriculum_resources(year_level);
CREATE INDEX IF NOT EXISTS idx_toroa_curriculum_area ON public.toroa_curriculum_resources(curriculum_area);
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='toroa_curriculum_resources' AND policyname='service_full_access') THEN CREATE POLICY "service_full_access" ON public.toroa_curriculum_resources FOR ALL USING (true) WITH CHECK (true); END IF; END $$;

CREATE TABLE IF NOT EXISTS public.toroa_focus_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.toroa_families(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES public.toroa_children(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  homework_id UUID REFERENCES public.toroa_homework(id),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  planned_minutes INT DEFAULT 25,
  actual_minutes INT,
  focus_rating INT CHECK (focus_rating BETWEEN 1 AND 5),
  distraction_count INT DEFAULT 0,
  points_earned INT DEFAULT 0,
  session_type TEXT DEFAULT 'pomodoro' CHECK (session_type IN ('pomodoro','free','timed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.toroa_focus_sessions ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_toroa_focus_child ON public.toroa_focus_sessions(child_id);
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='toroa_focus_sessions' AND policyname='service_full_access') THEN CREATE POLICY "service_full_access" ON public.toroa_focus_sessions FOR ALL USING (true) WITH CHECK (true); END IF; END $$;

-- WAVE 3: HEALTH
CREATE TABLE IF NOT EXISTS public.toroa_health_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.toroa_families(id) ON DELETE CASCADE,
  member_name TEXT NOT NULL,
  child_id UUID REFERENCES public.toroa_children(id),
  record_type TEXT NOT NULL CHECK (record_type IN ('immunisation','checkup','dental','optical','allergy','condition','surgery','growth','mental_health','ent','physio','other')),
  title TEXT NOT NULL,
  provider TEXT, clinic TEXT, record_date DATE, next_due DATE,
  reminder_days_before INT DEFAULT 7, notes TEXT, document_url TEXT,
  is_minor_record BOOLEAN DEFAULT FALSE, is_confidential BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ
);
ALTER TABLE public.toroa_health_records ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_toroa_health_family ON public.toroa_health_records(family_id);
CREATE INDEX IF NOT EXISTS idx_toroa_health_child ON public.toroa_health_records(child_id);
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='toroa_health_records' AND policyname='service_full_access') THEN CREATE POLICY "service_full_access" ON public.toroa_health_records FOR ALL USING (true) WITH CHECK (true); END IF; END $$;

CREATE TABLE IF NOT EXISTS public.toroa_immunisation_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.toroa_families(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES public.toroa_children(id) ON DELETE CASCADE,
  vaccine_name TEXT NOT NULL, vaccine_code TEXT, scheduled_age TEXT,
  scheduled_date DATE, administered_date DATE, administered_by TEXT, clinic TEXT, batch_number TEXT,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming','done','overdue','declined','catch_up')),
  nz_schedule_ref TEXT, side_effects_noted TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.toroa_immunisation_schedule ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_toroa_immunisation_child ON public.toroa_immunisation_schedule(child_id);
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='toroa_immunisation_schedule' AND policyname='service_full_access') THEN CREATE POLICY "service_full_access" ON public.toroa_immunisation_schedule FOR ALL USING (true) WITH CHECK (true); END IF; END $$;

CREATE TABLE IF NOT EXISTS public.toroa_growth_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.toroa_families(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES public.toroa_children(id) ON DELETE CASCADE,
  measured_date DATE NOT NULL,
  height_cm DECIMAL(5,1), weight_kg DECIMAL(5,1), bmi DECIMAL(4,1),
  percentile_height INT CHECK (percentile_height BETWEEN 0 AND 100),
  percentile_weight INT CHECK (percentile_weight BETWEEN 0 AND 100),
  head_circumference_cm DECIMAL(4,1), measured_by TEXT, notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.toroa_growth_tracking ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_toroa_growth_child ON public.toroa_growth_tracking(child_id);
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='toroa_growth_tracking' AND policyname='service_full_access') THEN CREATE POLICY "service_full_access" ON public.toroa_growth_tracking FOR ALL USING (true) WITH CHECK (true); END IF; END $$;

CREATE TABLE IF NOT EXISTS public.toroa_allergy_register (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.toroa_families(id) ON DELETE CASCADE,
  child_id UUID REFERENCES public.toroa_children(id),
  member_name TEXT NOT NULL, allergen TEXT NOT NULL,
  severity TEXT DEFAULT 'moderate' CHECK (severity IN ('mild','moderate','severe','anaphylaxis')),
  reaction_description TEXT, treatment TEXT,
  epipen_required BOOLEAN DEFAULT FALSE, epipen_location TEXT,
  school_notified BOOLEAN DEFAULT FALSE, school_notified_date DATE,
  diagnosed_by TEXT, diagnosed_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ
);
ALTER TABLE public.toroa_allergy_register ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_toroa_allergy_child ON public.toroa_allergy_register(child_id);
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='toroa_allergy_register' AND policyname='service_full_access') THEN CREATE POLICY "service_full_access" ON public.toroa_allergy_register FOR ALL USING (true) WITH CHECK (true); END IF; END $$;

-- WAVE 4: ROUTINES & SHOPPING
CREATE TABLE IF NOT EXISTS public.toroa_daily_routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.toroa_families(id) ON DELETE CASCADE,
  child_id UUID REFERENCES public.toroa_children(id),
  routine_name TEXT NOT NULL,
  routine_type TEXT NOT NULL CHECK (routine_type IN ('morning','afterschool','bedtime','weekend','custom')),
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  active_days TEXT[] DEFAULT '{mon,tue,wed,thu,fri}',
  start_time TIME, estimated_minutes INT, reward_points INT DEFAULT 5, is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.toroa_daily_routines ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_toroa_routines_family ON public.toroa_daily_routines(family_id);
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='toroa_daily_routines' AND policyname='service_full_access') THEN CREATE POLICY "service_full_access" ON public.toroa_daily_routines FOR ALL USING (true) WITH CHECK (true); END IF; END $$;

CREATE TABLE IF NOT EXISTS public.toroa_routine_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id UUID NOT NULL REFERENCES public.toroa_daily_routines(id) ON DELETE CASCADE,
  child_id UUID REFERENCES public.toroa_children(id),
  completion_date DATE NOT NULL,
  steps_completed JSONB DEFAULT '[]'::jsonb,
  completion_percent INT DEFAULT 0 CHECK (completion_percent BETWEEN 0 AND 100),
  time_taken_minutes INT, points_earned INT DEFAULT 0, parent_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(routine_id, child_id, completion_date)
);
ALTER TABLE public.toroa_routine_completions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='toroa_routine_completions' AND policyname='service_full_access') THEN CREATE POLICY "service_full_access" ON public.toroa_routine_completions FOR ALL USING (true) WITH CHECK (true); END IF; END $$;

CREATE TABLE IF NOT EXISTS public.toroa_family_shopping_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.toroa_families(id) ON DELETE CASCADE,
  list_name TEXT DEFAULT 'Groceries',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  linked_meal_plan_id UUID, store_preference TEXT, estimated_cost DECIMAL(8,2),
  status TEXT DEFAULT 'active' CHECK (status IN ('active','shopping','completed','archived')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.toroa_family_shopping_lists ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='toroa_family_shopping_lists' AND policyname='service_full_access') THEN CREATE POLICY "service_full_access" ON public.toroa_family_shopping_lists FOR ALL USING (true) WITH CHECK (true); END IF; END $$;

-- WAVE 5: LOCATION & SAFETY
ALTER TABLE public.toroa_family_locations
  ADD COLUMN IF NOT EXISTS is_live_sharing BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS sharing_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS geofence_radius_m INT DEFAULT 200,
  ADD COLUMN IF NOT EXISTS geofence_label TEXT,
  ADD COLUMN IF NOT EXISTS notify_on_arrival BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS notify_on_departure BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_safe_zone BOOLEAN DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS public.toroa_geofence_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.toroa_families(id) ON DELETE CASCADE,
  member_name TEXT NOT NULL,
  child_id UUID REFERENCES public.toroa_children(id),
  location_id UUID REFERENCES public.toroa_family_locations(id),
  event_type TEXT NOT NULL CHECK (event_type IN ('arrived','departed')),
  location_label TEXT, latitude DECIMAL(10,7), longitude DECIMAL(10,7),
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notified BOOLEAN DEFAULT FALSE, notification_sent_at TIMESTAMPTZ
);
ALTER TABLE public.toroa_geofence_events ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_toroa_geofence_family ON public.toroa_geofence_events(family_id);
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='toroa_geofence_events' AND policyname='service_full_access') THEN CREATE POLICY "service_full_access" ON public.toroa_geofence_events FOR ALL USING (true) WITH CHECK (true); END IF; END $$;

-- WAVE 6: TRIPS
CREATE TABLE IF NOT EXISTS public.toroa_family_trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.toroa_families(id) ON DELETE CASCADE,
  trip_name TEXT NOT NULL, destination TEXT, region TEXT,
  start_date DATE, end_date DATE,
  budget DECIMAL(10,2), spent DECIMAL(10,2) DEFAULT 0,
  packing_list JSONB DEFAULT '[]'::jsonb, itinerary JSONB DEFAULT '[]'::jsonb,
  documents JSONB DEFAULT '[]'::jsonb, accommodation JSONB DEFAULT '{}'::jsonb,
  transport JSONB DEFAULT '{}'::jsonb, notes TEXT,
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning','booked','active','completed','cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ
);
ALTER TABLE public.toroa_family_trips ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_toroa_trips_family ON public.toroa_family_trips(family_id);
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='toroa_family_trips' AND policyname='service_full_access') THEN CREATE POLICY "service_full_access" ON public.toroa_family_trips FOR ALL USING (true) WITH CHECK (true); END IF; END $$;

-- WAVE 7: WEEKLY SNAPSHOTS
CREATE TABLE IF NOT EXISTS public.toroa_weekly_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.toroa_families(id) ON DELETE CASCADE,
  week_starting DATE NOT NULL,
  highlights JSONB DEFAULT '[]'::jsonb, challenges JSONB DEFAULT '[]'::jsonb, gratitude JSONB DEFAULT '[]'::jsonb,
  chores_completed INT DEFAULT 0, homework_minutes INT DEFAULT 0, focus_sessions INT DEFAULT 0,
  routines_completed INT DEFAULT 0, money_earned DECIMAL(8,2) DEFAULT 0,
  photo_urls TEXT[] DEFAULT '{}', generated_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(family_id, week_starting)
);
ALTER TABLE public.toroa_weekly_snapshots ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='toroa_weekly_snapshots' AND policyname='service_full_access') THEN CREATE POLICY "service_full_access" ON public.toroa_weekly_snapshots FOR ALL USING (true) WITH CHECK (true); END IF; END $$;

-- AGENT PROMPTS — conflict on (agent_name, pack)
INSERT INTO public.agent_prompts (agent_name, display_name, pack, system_prompt, model_preference, icon, is_active)
VALUES ('toro-money', 'Toro Pūtea', 'TORO', E'You are Toro Pūtea, the family financial literacy agent within the TŌRO kete. You manage pocket money (three-jars Save/Spend/Give), gamified chores with streaks, savings goals, and age-appropriate financial education for NZ families. Tables: toroa_child_pocket_money, toroa_chore_assignments, toroa_savings_goals, toroa_money_transactions. Parent approval required for allowance changes, large withdrawals, goal creation. NEVER give investment advice, NEVER process real transfers — tracking only. Privacy Act 2020 + IPP 3A. Children''s Act 2014.', 'claude-sonnet-4-5', 'piggy-bank', true)
ON CONFLICT (agent_name, pack) DO UPDATE SET display_name=EXCLUDED.display_name, system_prompt=EXCLUDED.system_prompt, model_preference=EXCLUDED.model_preference, icon=EXCLUDED.icon, is_active=EXCLUDED.is_active;

INSERT INTO public.agent_prompts (agent_name, display_name, pack, system_prompt, model_preference, icon, is_active)
VALUES ('toro-homework', 'Toro Mahi Kāinga', 'TORO', E'You are Toro Mahi Kāinga, the homework helper in the TŌRO kete. NZ-curriculum-aware (Y0-13, NCEA L1-3, UE). NEVER give direct answers — guide with questions, similar examples, and concept explanations at age-appropriate level. Pomodoro focus mode (25/5; Y0-4 15/5; Y11-13 30/5). Tables: toroa_homework, toroa_curriculum_resources, toroa_focus_sessions, toroa_children, toroa_grade_history. Patient, encouraging tone — celebrate effort. Use te reo naturally ("Ka pai!", "Kia kaha!"). Privacy Act 2020 + IPP 3A. Children''s Act 2014.', 'claude-sonnet-4-5', 'book-open', true)
ON CONFLICT (agent_name, pack) DO UPDATE SET display_name=EXCLUDED.display_name, system_prompt=EXCLUDED.system_prompt, model_preference=EXCLUDED.model_preference, icon=EXCLUDED.icon, is_active=EXCLUDED.is_active;

INSERT INTO public.agent_prompts (agent_name, display_name, pack, system_prompt, model_preference, icon, is_active)
VALUES ('toro-health', 'Toro Hauora', 'TORO', E'You are Toro Hauora, family health RECORDS and SCHEDULING coordinator — NOT a medical advisor. HARD GATE: NEVER diagnose, recommend treatments, interpret symptoms, suggest medications/dosage, or interpret percentiles beyond factual recording. For health concerns: "Talk to your GP or call Healthline on 0800 611 116." Emergencies: "Call 111." Tables: toroa_health_records, toroa_immunisation_schedule, toroa_growth_tracking, toroa_allergy_register, toroa_children. NZ National Immunisation Schedule. Health Information Privacy Code 2020. Children''s Act 2014. CONFIDENTIAL — never cross-family. Parent-only for minor records. Audit every access.', 'claude-sonnet-4-5', 'heart-pulse', true)
ON CONFLICT (agent_name, pack) DO UPDATE SET display_name=EXCLUDED.display_name, system_prompt=EXCLUDED.system_prompt, model_preference=EXCLUDED.model_preference, icon=EXCLUDED.icon, is_active=EXCLUDED.is_active;

INSERT INTO public.agent_prompts (agent_name, display_name, pack, system_prompt, model_preference, icon, is_active)
VALUES ('toro-home', 'Toro Kāinga', 'TORO', E'You are Toro Kāinga, the home operations agent. Daily routines (morning, after-school, bedtime, weekend), shared shopping lists linked to meal plans, pantry awareness, home maintenance reminders (NZ seasons), pet care, Civil Defence emergency kit. Tables: toroa_daily_routines, toroa_routine_completions, toroa_family_shopping_lists, toroa_meal_plans, toroa_pets, toroa_smart_home_links. NZ supermarkets (Countdown, New World, PAK''nSAVE). WoF/rego cycle. Practical, organised, never naggy. Privacy Act 2020 + IPP 3A. Children''s Act 2014.', 'claude-sonnet-4-5', 'home', true)
ON CONFLICT (agent_name, pack) DO UPDATE SET display_name=EXCLUDED.display_name, system_prompt=EXCLUDED.system_prompt, model_preference=EXCLUDED.model_preference, icon=EXCLUDED.icon, is_active=EXCLUDED.is_active;

-- Enhanced agents (append-only, idempotent)
UPDATE public.agent_prompts
SET system_prompt = system_prompt || E'\n\n## ENHANCED CAPABILITIES (April 2026 Upgrade)\nLOCATION: query toroa_family_locations + toroa_geofence_events for arrivals/departures and pickup coordination. Opt-in sharing only.\nTRIPS: create toroa_family_trips entries with auto-packing lists, budget tracking, NZ destinations (DOC campsites, holiday parks), passport/insurance checklist.\nJOURNAL: weekly toroa_weekly_snapshots (highlights, chores, homework time, gratitude). "This time last year" memories in morning briefings.'
WHERE agent_name = 'toro-family' AND system_prompt NOT LIKE '%ENHANCED CAPABILITIES (April 2026 Upgrade)%';

UPDATE public.agent_prompts
SET system_prompt = system_prompt || E'\n\n## ENHANCED CAPABILITIES (April 2026 Upgrade)\nHOMEWORK INTEGRATION: cross-reference toro-homework via toroa_homework + toroa_focus_sessions. Flag low completion + dropping grades.\nCURRICULUM RESOURCES: auto-link from toroa_curriculum_resources by year/subject — Tāhūrangi (Y0-10), Education Perfect (Y9-10 Maths), StudyIt + LearnCoach + No Brain Too Small + NZQA past papers (NCEA).\nWEEKLY PARENT REPORT: combine grades + homework + focus time. Flag concerns, celebrate wins.'
WHERE agent_name = 'toro-education' AND system_prompt NOT LIKE '%ENHANCED CAPABILITIES (April 2026 Upgrade)%';

UPDATE public.agent_prompts
SET system_prompt = system_prompt || E'\n\n## ENHANCED CAPABILITIES (April 2026 Upgrade)\nTRIP PLANNING: toroa_family_trips with route planning (nz-routes/MapBox), fuel cost (nz-fuel-prices/MBIE), multi-stop, EV charging awareness.\nGEOFENCE: monitor toroa_geofence_events for school arrival/departure, "Is [child] at school yet?" checks, late pickup alerts.'
WHERE agent_name = 'toro-logistics' AND system_prompt NOT LIKE '%ENHANCED CAPABILITIES (April 2026 Upgrade)%';

-- SEED: NZ curriculum resources
INSERT INTO public.toroa_curriculum_resources (year_level, curriculum_area, resource_name, resource_url, resource_type, provider, is_free) VALUES
(0, 'Mathematics', 'Khan Academy Kids', 'https://learn.khanacademy.org', 'interactive', 'Khan Academy', true),
(1, 'Mathematics', 'Education Perfect Maths', 'https://www.educationperfect.com', 'interactive', 'Education Perfect', false),
(1, 'English', 'Epic! - Free Books for Kids', 'https://www.getepic.com', 'interactive', 'Epic!', true),
(1, 'Te Reo Māori', 'Kupu App', 'https://kupu.maori.nz', 'app', 'Spark NZ', true),
(1, 'Te Reo Māori', 'Māori Dictionary', 'https://maoridictionary.co.nz', 'interactive', 'Te Aka', true),
(7, 'Mathematics', 'Education Perfect Maths', 'https://www.educationperfect.com', 'interactive', 'Education Perfect', false),
(7, 'Science', 'Science Learning Hub', 'https://www.sciencelearn.org.nz', 'interactive', 'University of Waikato', true),
(7, 'English', 'NZ Digital Library', 'https://natlib.govt.nz', 'interactive', 'National Library', true),
(9, 'Mathematics', 'Education Perfect Y9-10 Maths', 'https://www.educationperfect.com', 'interactive', 'Education Perfect', false),
(9, 'Mathematics', 'Tāhūrangi Maths', 'https://tahurangi.education.govt.nz', 'interactive', 'Ministry of Education', true),
(9, 'Science', 'e-asTTle Practice', 'https://e-asttle.tki.org.nz', 'practice', 'Ministry of Education', true),
(10, 'Mathematics', 'Education Perfect Y9-10 Maths', 'https://www.educationperfect.com', 'interactive', 'Education Perfect', false),
(11, 'Mathematics', 'StudyIt Maths', 'https://studyit.org.nz/subjects/maths', 'practice', 'StudyIt', true),
(11, 'Mathematics', 'NZQA Past Papers - Maths', 'https://www.nzqa.govt.nz/ncea/assessment/search.do', 'nzqa_paper', 'NZQA', true),
(11, 'English', 'StudyIt English', 'https://studyit.org.nz/subjects/english', 'practice', 'StudyIt', true),
(11, 'Science', 'No Brain Too Small - Science', 'https://www.nobraintoosmal.co.nz', 'practice', 'No Brain Too Small', true),
(11, 'Science', 'LearnCoach Science', 'https://www.learncoach.co.nz', 'video', 'LearnCoach', false),
(12, 'Mathematics', 'StudyIt Maths L2', 'https://studyit.org.nz/subjects/maths', 'practice', 'StudyIt', true),
(12, 'Mathematics', 'NZQA Past Papers - Maths L2', 'https://www.nzqa.govt.nz/ncea/assessment/search.do', 'nzqa_paper', 'NZQA', true),
(12, 'English', 'StudyIt English L2', 'https://studyit.org.nz/subjects/english', 'practice', 'StudyIt', true),
(12, 'Science', 'No Brain Too Small - L2 Science', 'https://www.nobraintoosmal.co.nz', 'practice', 'No Brain Too Small', true),
(12, 'Science', 'LearnCoach L2', 'https://www.learncoach.co.nz', 'video', 'LearnCoach', false),
(13, 'Mathematics', 'StudyIt Maths L3', 'https://studyit.org.nz/subjects/maths', 'practice', 'StudyIt', true),
(13, 'Mathematics', 'NZQA Past Papers - Maths L3', 'https://www.nzqa.govt.nz/ncea/assessment/search.do', 'nzqa_paper', 'NZQA', true),
(13, 'Science', 'No Brain Too Small - L3 Science', 'https://www.nobraintoosmal.co.nz', 'practice', 'No Brain Too Small', true),
(13, 'Science', 'LearnCoach L3', 'https://www.learncoach.co.nz', 'video', 'LearnCoach', false),
(13, 'English', 'StudyIt English L3', 'https://studyit.org.nz/subjects/english', 'practice', 'StudyIt', true);

-- SEED: NZ Immunisation template
CREATE TABLE IF NOT EXISTS public.toroa_nz_immunisation_template (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vaccine_name TEXT NOT NULL, vaccine_code TEXT,
  scheduled_age TEXT NOT NULL, age_months INT NOT NULL,
  dose_number INT DEFAULT 1, notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.toroa_nz_immunisation_template ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='toroa_nz_immunisation_template' AND policyname='service_full_access') THEN CREATE POLICY "service_full_access" ON public.toroa_nz_immunisation_template FOR ALL USING (true) WITH CHECK (true); END IF; END $$;

INSERT INTO public.toroa_nz_immunisation_template (vaccine_name, vaccine_code, scheduled_age, age_months, dose_number, notes) VALUES
('DTaP-IPV-HepB/Hib', 'INFANRIX-HEXA', '6 weeks', 1, 1, 'Diphtheria, Tetanus, Pertussis, Polio, Hepatitis B, Hib'),
('PCV13', 'PREVENAR 13', '6 weeks', 1, 1, 'Pneumococcal conjugate'),
('Rotavirus', 'ROTARIX', '6 weeks', 1, 1, 'Oral vaccine'),
('DTaP-IPV-HepB/Hib', 'INFANRIX-HEXA', '3 months', 3, 2, 'Dose 2'),
('Rotavirus', 'ROTARIX', '3 months', 3, 2, 'Dose 2 — oral'),
('DTaP-IPV-HepB/Hib', 'INFANRIX-HEXA', '5 months', 5, 3, 'Dose 3'),
('PCV13', 'PREVENAR 13', '5 months', 5, 2, 'Dose 2'),
('MMR', 'PRIORIX', '12 months', 12, 1, 'Measles, Mumps, Rubella — dose 1'),
('PCV13', 'PREVENAR 13', '12 months', 12, 3, 'Dose 3 (booster)'),
('Hib', 'HIBERIX', '12 months', 12, 1, 'Hib booster'),
('Varicella', 'VARILRIX', '15 months', 15, 1, 'Chickenpox'),
('DTaP-IPV', 'INFANRIX-IPV', '4 years', 48, 1, 'Booster'),
('MMR', 'PRIORIX', '4 years', 48, 2, 'Measles, Mumps, Rubella — dose 2'),
('HPV', 'GARDASIL 9', '11-12 years', 132, 1, 'HPV — dose 1'),
('Tdap', 'BOOSTRIX', '11-12 years', 132, 1, 'Tetanus, Diphtheria, Pertussis booster'),
('HPV', 'GARDASIL 9', '11-12 years', 138, 2, 'HPV — dose 2 (6 months after dose 1)');