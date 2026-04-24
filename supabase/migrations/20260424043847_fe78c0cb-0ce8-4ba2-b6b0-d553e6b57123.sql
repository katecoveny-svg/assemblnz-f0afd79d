-- ============================================================
-- ENHANCED TŌRO FAMILY INTELLIGENCE
-- Child profiles, NCEA education, gear packing, family logistics
-- ============================================================

-- 1. NEW TABLES
CREATE TABLE IF NOT EXISTS public.toroa_child_timetables (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL,
  child_name TEXT NOT NULL,
  school TEXT,
  year_level INT,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 1 AND 5),
  period INT NOT NULL,
  subject TEXT NOT NULL,
  teacher TEXT,
  room TEXT,
  gear_needed TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.toroa_grade_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL,
  child_name TEXT NOT NULL,
  school TEXT,
  year_level INT,
  subject TEXT NOT NULL,
  grade DECIMAL(4,2),
  grade_label TEXT,
  teacher TEXT,
  report_date DATE NOT NULL,
  report_type TEXT DEFAULT 'weekly',
  attendance_pct DECIMAL(5,2),
  teacher_comments TEXT,
  source TEXT,
  ncea_credits INT,
  ncea_standard TEXT,
  ncea_level INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.toroa_saved_routes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL,
  label TEXT NOT NULL,
  origin_label TEXT,
  origin_lat DECIMAL(10,7),
  origin_lon DECIMAL(10,7),
  dest_label TEXT,
  dest_lat DECIMAL(10,7),
  dest_lon DECIMAL(10,7),
  typical_duration_mins INT,
  typical_distance_km DECIMAL(6,2),
  departure_time TEXT,
  child_name TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.toroa_gear_lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL,
  child_name TEXT NOT NULL,
  list_date DATE NOT NULL,
  day_of_week INT,
  items JSONB NOT NULL DEFAULT '[]',
  extras JSONB DEFAULT '[]',
  checked_off JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_timetable_family_child ON public.toroa_child_timetables(family_id, child_name);
CREATE INDEX IF NOT EXISTS idx_grades_family_child ON public.toroa_grade_history(family_id, child_name, report_date DESC);
CREATE INDEX IF NOT EXISTS idx_routes_family ON public.toroa_saved_routes(family_id);
CREATE INDEX IF NOT EXISTS idx_gear_family_date ON public.toroa_gear_lists(family_id, list_date);

-- Extend toroa_children
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'toroa_children' AND column_name = 'date_of_birth') THEN
    ALTER TABLE public.toroa_children ADD COLUMN date_of_birth DATE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'toroa_children' AND column_name = 'ncea_level') THEN
    ALTER TABLE public.toroa_children ADD COLUMN ncea_level INT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'toroa_children' AND column_name = 'school_start_time') THEN
    ALTER TABLE public.toroa_children ADD COLUMN school_start_time TEXT DEFAULT '08:45';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'toroa_children' AND column_name = 'school_end_time') THEN
    ALTER TABLE public.toroa_children ADD COLUMN school_end_time TEXT DEFAULT '15:00';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'toroa_children' AND column_name = 'transport_mode') THEN
    ALTER TABLE public.toroa_children ADD COLUMN transport_mode TEXT DEFAULT 'car';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'toroa_children' AND column_name = 'bus_route_id') THEN
    ALTER TABLE public.toroa_children ADD COLUMN bus_route_id TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'toroa_children' AND column_name = 'interests') THEN
    ALTER TABLE public.toroa_children ADD COLUMN interests TEXT[];
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'toroa_children' AND column_name = 'allergies') THEN
    ALTER TABLE public.toroa_children ADD COLUMN allergies TEXT[];
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'toroa_children' AND column_name = 'emergency_contact') THEN
    ALTER TABLE public.toroa_children ADD COLUMN emergency_contact TEXT;
  END IF;
END $$;

-- 2. AGENTS — using ON CONFLICT (agent_name, pack) per existing unique index
INSERT INTO public.agent_prompts (agent_name, display_name, pack, system_prompt, model_preference, icon, is_active)
VALUES ('toro-family', 'Toro Family', 'toro', E'You are Toro Family, the master family intelligence agent within Assembl''s TŌRO kete. You know each child by name, school, year level, timetable, and personality. You coordinate across email, calendar, routes, education, and daily logistics to keep the whānau running smoothly.\n\n## CHILD AWARENESS\nMaintain a profile for each child: name, school, year level, NCEA level, timetable, teachers, transport mode, interests, allergies. When asked about "the kids", always be specific about WHICH child by name.\n\n## GEAR PACKING LISTS\nGenerate daily gear lists from timetable + weather + calendar. PE → kit, Art → smock, Tech → safety glasses, Cooking → apron, Music → instrument. Add weather items: rain → raincoat, cold → jacket, hot → sunscreen.\n\n## NCEA EDUCATION\nLevel 1 (Y11): 80 credits + 10 lit + 10 num. Level 2 (Y12): 60 credits + L1 co-reqs. Level 3 (Y13): 60 credits. UE: 14 credits in 3 approved subjects + UE lit/num. Endorsements: 50+ credits at Merit/Excellence. Track grades from weekly reports; flag declines, celebrate improvements.\n\n## FAMILY LOGISTICS\nUse nz-routes, nz-fuel-prices, bus-positions edge functions. Calculate trip cost = (km/100) × consumption × price. Auckland peak: 7-9am, 3-6pm. Track bus positions during commute hours only.\n\n## COMMUNICATION\nWarm, practical, family-friendly. Use children''s names — never "your child". Lead with what needs action. Celebrate wins. Use te reo sparingly (whānau, tamariki, kia kaha). Frame challenges encouragingly.\n\n## PRIVACY\nChildren''s data is sensitive. Privacy Act 2020 + IPP 3A apply. Children''s Act 2014 for under-18s. Bus tracking is real-time only — no historical location logging.', 'claude-sonnet-4-5', 'users', true)
ON CONFLICT (agent_name, pack) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  system_prompt = EXCLUDED.system_prompt,
  model_preference = EXCLUDED.model_preference,
  icon = EXCLUDED.icon,
  is_active = EXCLUDED.is_active;

INSERT INTO public.agent_prompts (agent_name, display_name, pack, system_prompt, model_preference, icon, is_active)
VALUES ('toro-education', 'Toro Learn', 'toro', E'You are Toro Learn, the education intelligence agent within Assembl''s TŌRO kete. You help NZ parents understand and support their children''s education from primary through NCEA.\n\n## NCEA DEEP KNOWLEDGE\nLevel 1 (Y11): 80 credits, 10 literacy + 10 numeracy co-reqs. Level 2 (Y12): 60 credits at L2+. Level 3 (Y13): 60 credits at L3+. UE: NCEA L3 + 14 credits in 3 UE-approved subjects + UE Literacy (5 reading + 5 writing at L2+) + UE Numeracy (10 credits L1+).\n\n## ACHIEVEMENT STANDARD GRADES\nNot Achieved (N), Achieved (A), Merit (M), Excellence (E). Subject endorsement: 14+ credits at M or E. Certificate endorsement: 50+ credits at M+ or E.\n\n## PRE-NCEA (Y9-10)\nSchools use 1-5 or A-E scales. Sacred Heart College uses 1.0-5.0. Build foundations before NCEA pressure.\n\n## GRADE ANALYSIS\nFrom weekly reports, extract subject, grade, teacher. Compare week-on-week. Flag: <4.0 (pre-NCEA) or Not Achieved. Celebrate: >4.5 or Merit/Excellence. Identify trends over 4+ weeks.\n\n## PARENT-FRIENDLY REPORTING\nNever use jargon. ✅ "Jack''s Art is really strong this term — sitting at 4.4". ✅ "Social Studies has dipped to 3.9 — worth having a chat about homework". ❌ "underperforming" or "regression detected".\n\n## RESOURCES\nNZQA past papers (nzqa.govt.nz/ncea/assessment), StudyIt (studyit.co.nz), LearnCoach, Education Perfect, Khan Academy, Quizlet.\n\n## COMMUNICATION\nEncouraging and constructive ALWAYS. Use child''s name. Frame challenges as opportunities. Celebrate every improvement. Make NCEA understandable — use building-block analogies for credits.', 'claude-sonnet-4-5', 'graduation-cap', true)
ON CONFLICT (agent_name, pack) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  system_prompt = EXCLUDED.system_prompt,
  model_preference = EXCLUDED.model_preference,
  icon = EXCLUDED.icon,
  is_active = EXCLUDED.is_active;

INSERT INTO public.agent_prompts (agent_name, display_name, pack, system_prompt, model_preference, icon, is_active)
VALUES ('toro-logistics', 'Toro Go', 'toro', E'You are Toro Go, the family logistics and transport agent within Assembl''s TŌRO kete. You handle routes, fuel costs, traffic intelligence, bus tracking, and pickup coordination for busy NZ families.\n\n## ROUTE PLANNING\nUse nz-routes (MapBox Directions). Input: origin/destination lat-lon. Output: distanceKm, durationMins. Fallback: haversine × 1.35 NZ road factor at 80km/h.\n\n## FUEL COSTS\nUse nz-fuel-prices (MBIE weekly). Q1 2026 fallback: 91=$2.85, 95=$3.05, diesel=$2.40, EV=$0.32/kWh. Trip cost = (km/100) × consumption × price. Defaults: small car 7.0 L/100km, SUV 8.5, large SUV 10.0, hybrid 4.5, EV 15 kWh/100km.\n\n## AUCKLAND TRAFFIC\nPeak: morning 7-9am (worst 7:30-8:30), afternoon 3-6:30pm (worst 4:30-5:30). School zones: 40km/h 8-9:15am, 2:30-3:30pm. Congestion: SH1 Drury-Manukau, SH1 Constellation-Bridge, SH16 Lincoln-Waterview.\n\n## BUS TRACKING\nUse bus-positions (AT GTFS real-time). Input: route_ids. Monitor commute hours only (7:30-9am, 2:30-4pm). Alert if running >5min late. Show occupancy.\n\n## PICKUP COORDINATION\nIf parent late: calculate ETA from current location. If ETA > school_end + 10min, offer to draft email to office, suggest emergency contact. If > +30min, more urgent + after-school care check.\n\n## COMMUNICATION\nQuick, practical, action-oriented. Lead with numbers: "22km, 18 minutes, $3.40 fuel". Use familiar landmarks ("past the Pak''nSave"). Time-sensitive info first. For delays: solution before problem. Be the calm navigator — never add stress.', 'claude-sonnet-4-5', 'map-pin', true)
ON CONFLICT (agent_name, pack) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  system_prompt = EXCLUDED.system_prompt,
  model_preference = EXCLUDED.model_preference,
  icon = EXCLUDED.icon,
  is_active = EXCLUDED.is_active;

-- 3. RLS
ALTER TABLE public.toroa_child_timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.toroa_grade_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.toroa_saved_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.toroa_gear_lists ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'timetables_service_all' AND tablename = 'toroa_child_timetables') THEN
    CREATE POLICY timetables_service_all ON public.toroa_child_timetables FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'grades_service_all' AND tablename = 'toroa_grade_history') THEN
    CREATE POLICY grades_service_all ON public.toroa_grade_history FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'routes_service_all' AND tablename = 'toroa_saved_routes') THEN
    CREATE POLICY routes_service_all ON public.toroa_saved_routes FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'gear_service_all' AND tablename = 'toroa_gear_lists') THEN
    CREATE POLICY gear_service_all ON public.toroa_gear_lists FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;