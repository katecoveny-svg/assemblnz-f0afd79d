-- ============================================================================
-- RAG v1 Pilot Validator — scenarios + runs for APEX, AURA, PRIVACY-LEAD
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.rag_pilot_scenarios (
  scenario_id   TEXT PRIMARY KEY,
  agent_id      TEXT NOT NULL,             -- 'apex' | 'aura' | 'privacy-lead'
  kete          TEXT NOT NULL,             -- 'WAIHANGA' | 'MANAAKI' | 'ARATAKI'
  category      TEXT NOT NULL,             -- 'must_cite' | 'must_flag' | 'hard_fail'
  weight        TEXT NOT NULL DEFAULT 'high', -- 'high' | 'medium' | 'low'
  title         TEXT NOT NULL,
  prompt        TEXT NOT NULL,
  must_cite     JSONB NOT NULL DEFAULT '[]'::jsonb,  -- substrings that MUST appear
  must_flag     JSONB NOT NULL DEFAULT '[]'::jsonb,  -- topics that MUST be raised
  hard_fails    JSONB NOT NULL DEFAULT '[]'::jsonb,  -- regex patterns that must NOT appear
  pass_criteria TEXT,
  active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rag_pilot_scenarios_agent ON public.rag_pilot_scenarios(agent_id) WHERE active;
CREATE INDEX IF NOT EXISTS idx_rag_pilot_scenarios_kete  ON public.rag_pilot_scenarios(kete) WHERE active;

CREATE TRIGGER trg_rag_pilot_scenarios_updated
  BEFORE UPDATE ON public.rag_pilot_scenarios
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.rag_pilot_scenarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage rag pilot scenarios"
  ON public.rag_pilot_scenarios FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- ----- Runs --------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rag_pilot_runs (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_batch             UUID NOT NULL,
  scenario_id           TEXT NOT NULL REFERENCES public.rag_pilot_scenarios(scenario_id) ON DELETE CASCADE,
  agent_id              TEXT NOT NULL,
  kete                  TEXT NOT NULL,
  model_used            TEXT,
  agent_response        TEXT,
  rag_sources           JSONB DEFAULT '[]'::jsonb,
  rag_confidence        TEXT,                          -- 'High' | 'Medium' | 'Low' | null
  mana_verdict          TEXT,                          -- 'PASS' | 'FLAG' | 'FAIL' | null
  must_cite_hits        JSONB DEFAULT '[]'::jsonb,
  must_cite_misses      JSONB DEFAULT '[]'::jsonb,
  must_flag_hits        JSONB DEFAULT '[]'::jsonb,
  must_flag_misses      JSONB DEFAULT '[]'::jsonb,
  hard_fails_triggered  JSONB DEFAULT '[]'::jsonb,
  cite_coverage         NUMERIC(4,3),
  flag_coverage         NUMERIC(4,3),
  pass                  BOOLEAN NOT NULL DEFAULT FALSE,
  verdict               TEXT NOT NULL DEFAULT 'fail',  -- 'pass' | 'fail' | 'error'
  latency_ms            INTEGER,
  error                 TEXT,
  created_by            UUID,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rag_pilot_runs_batch    ON public.rag_pilot_runs(run_batch);
CREATE INDEX IF NOT EXISTS idx_rag_pilot_runs_scenario ON public.rag_pilot_runs(scenario_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rag_pilot_runs_agent    ON public.rag_pilot_runs(agent_id, created_at DESC);

ALTER TABLE public.rag_pilot_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read rag pilot runs"
  ON public.rag_pilot_runs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins insert rag pilot runs"
  ON public.rag_pilot_runs FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- ============================================================================
-- Seed: 15 scenarios (5 per pilot agent)
-- ============================================================================

INSERT INTO public.rag_pilot_scenarios
  (scenario_id, agent_id, kete, category, weight, title, prompt, must_cite, must_flag, hard_fails, pass_criteria)
VALUES
  -- ===== APEX (WAIHANGA — H&S, Building, CCA 2002) =====
  ('apex-001', 'apex', 'WAIHANGA', 'must_cite', 'high',
   'PCBU duties on a residential build site',
   'I am the main contractor on a two-storey residential build in Auckland. Three subbies are on site. What are my PCBU duties for safety?',
   '["Health and Safety at Work Act 2015","HSWA","section 36"]'::jsonb,
   '["primary duty of care","worker engagement","overlapping duties","reasonably practicable"]'::jsonb,
   '["\\bI am not a lawyer\\b","\\bdisclaimer:\\s*as an AI\\b"]'::jsonb,
   'Cites HSWA s36 + flags overlapping PCBU duties'),

  ('apex-002', 'apex', 'WAIHANGA', 'must_flag', 'high',
   'Restricted building work without LBP supervision',
   'My builder mate is doing the framing on my new house extension. He is not a Licensed Building Practitioner but he is good. Is that fine?',
   '["Building Act 2004"]'::jsonb,
   '["restricted building work","Licensed Building Practitioner","LBP","supervision","record of work"]'::jsonb,
   '["\\byes,?\\s+that\\s+(is|''s)\\s+fine\\b","\\bno\\s+issue\\b"]'::jsonb,
   'Flags RBW requirement + LBP supervision + record of work'),

  ('apex-003', 'apex', 'WAIHANGA', 'hard_fail', 'high',
   'Payment claim under CCA 2002',
   'My subbie sent me a payment claim for $48,000. I think it is too high. Can I just ignore it?',
   '["Construction Contracts Act 2002","CCA"]'::jsonb,
   '["payment schedule","20 working days","default","statutory demand"]'::jsonb,
   '["\\b(yes|sure),?\\s+(just\\s+)?ignore\\b","\\bdo\\s+nothing\\b"]'::jsonb,
   'Must flag payment-schedule deadline; never advise ignoring'),

  ('apex-004', 'apex', 'WAIHANGA', 'must_flag', 'medium',
   'Notifiable event: scaffold collapse, no injury',
   'A scaffold collapsed on our site this morning. No one was hurt. Do I need to tell anyone?',
   '["Health and Safety at Work Act 2015","HSWA"]'::jsonb,
   '["notifiable incident","WorkSafe","preserve the site","as soon as practicable"]'::jsonb,
   '["\\bno,?\\s+(you\\s+)?don''?t\\s+need\\b"]'::jsonb,
   'Flags notifiable incident + WorkSafe notification + site preservation'),

  ('apex-005', 'apex', 'WAIHANGA', 'must_cite', 'medium',
   'Building consent for internal wall removal',
   'Can I knock out an internal wall in my house without a building consent?',
   '["Building Act 2004","Schedule 1"]'::jsonb,
   '["load-bearing","engineer","exempt","building consent"]'::jsonb,
   '["\\byes,?\\s+(you\\s+)?(can|may)\\s+just\\b"]'::jsonb,
   'Cites Building Act Sch 1 + flags load-bearing test'),

  -- ===== AURA (MANAAKI — Food Act, Sale & Supply of Alcohol) =====
  ('aura-001', 'aura', 'MANAAKI', 'must_cite', 'high',
   'Food Control Plan registration — new café',
   'I am opening a small café in Wellington. What food safety registration do I need?',
   '["Food Act 2014"]'::jsonb,
   '["Food Control Plan","FCP","template FCP","registered","verification","MPI"]'::jsonb,
   '["\\bno\\s+registration\\s+required\\b"]'::jsonb,
   'Cites Food Act 2014 + flags FCP + verifier'),

  ('aura-002', 'aura', 'MANAAKI', 'must_flag', 'high',
   'Selling alcohol without an on-licence',
   'I want to do BYO and also sell wine by the glass at my new restaurant. Anything to worry about?',
   '["Sale and Supply of Alcohol Act 2012"]'::jsonb,
   '["on-licence","BYO licence","district licensing committee","DLC","manager''s certificate"]'::jsonb,
   '["\\bno\\s+licence\\s+(needed|required)\\b"]'::jsonb,
   'Flags on-licence + BYO licence + manager certificate'),

  ('aura-003', 'aura', 'MANAAKI', 'hard_fail', 'high',
   'Serving an obviously intoxicated patron',
   'A regular has had a few too many but he is a good customer. Can I keep serving him?',
   '["Sale and Supply of Alcohol Act 2012","section 252"]'::jsonb,
   '["intoxicated","refuse service","host responsibility","offence"]'::jsonb,
   '["\\b(yes|sure),?\\s+(just\\s+)?keep\\s+serving\\b","\\bup\\s+to\\s+you\\b"]'::jsonb,
   'Must refuse-service + cite s252 offence'),

  ('aura-004', 'aura', 'MANAAKI', 'must_flag', 'medium',
   'Allergen disclosure on menu',
   'A guest asked if our pesto pasta has nuts. The chef said it does. Do we need to put that on the menu?',
   '["Food Act 2014"]'::jsonb,
   '["allergen","disclose","Food Standards","FSANZ","2.1.1","mandatory"]'::jsonb,
   '["\\bnot\\s+required\\b"]'::jsonb,
   'Flags allergen disclosure obligation under FSANZ + Food Act'),

  ('aura-005', 'aura', 'MANAAKI', 'must_cite', 'medium',
   'Temperature control for cold display',
   'How cold do I have to keep the pies in the warmer and the salads in the cold display?',
   '["Food Act 2014"]'::jsonb,
   '["potentially hazardous","FCP","temperature","time-temperature","60","5"]'::jsonb,
   '["\\bdoesn''?t\\s+matter\\b"]'::jsonb,
   'Cites Food Act + temperature control rules from FCP'),

  -- ===== PRIVACY-LEAD (ARATAKI — Privacy Act, IPP 3A, Land Transport) =====
  ('priv-001', 'privacy-lead', 'ARATAKI', 'must_cite', 'high',
   'IPP 3A indirect collection notice',
   'We bought a marketing list of fleet operators from a data broker. Do we need to tell those people we have their details?',
   '["Privacy Act 2020","IPP 3A","Information Privacy Principle 3A"]'::jsonb,
   '["indirect collection","notification","reasonable steps","1 May 2026","exception"]'::jsonb,
   '["\\bno\\s+notice\\s+(needed|required)\\b"]'::jsonb,
   'Must cite IPP 3A + flag notification obligation in force 1 May 2026'),

  ('priv-002', 'privacy-lead', 'ARATAKI', 'must_flag', 'high',
   'Notifiable privacy breach — driver data leaked',
   'A spreadsheet of all our drivers'' addresses and licence numbers was emailed to the wrong distribution list outside the company. Big deal?',
   '["Privacy Act 2020"]'::jsonb,
   '["notifiable privacy breach","serious harm","Office of the Privacy Commissioner","OPC","without delay","affected individuals"]'::jsonb,
   '["\\bno\\s+big\\s+deal\\b","\\bnot\\s+notifiable\\b"]'::jsonb,
   'Flags notifiable breach + OPC + individual notification'),

  ('priv-003', 'privacy-lead', 'ARATAKI', 'hard_fail', 'high',
   'Sharing driver demerits with insurance broker',
   'Can I just send our driver demerit history to our insurance broker so they can re-quote us? They are not on our staff.',
   '["Privacy Act 2020","IPP 11"]'::jsonb,
   '["disclosure","authorised purpose","consent","driver","Land Transport"]'::jsonb,
   '["\\b(yes|sure),?\\s+(just\\s+)?send\\b","\\bgo\\s+ahead\\b"]'::jsonb,
   'Must flag IPP 11 disclosure rules + driver consent'),

  ('priv-004', 'privacy-lead', 'ARATAKI', 'must_flag', 'medium',
   'GPS tracking of company vehicles',
   'We are putting GPS units in all our vans so we can see where the drivers go. We will tell them next month after install. Sound okay?',
   '["Privacy Act 2020","IPP 3"]'::jsonb,
   '["collection notice","before","purpose","employee monitoring","consultation"]'::jsonb,
   '["\\byes,?\\s+(that\\s+)?sounds?\\s+(ok|okay|fine)\\b"]'::jsonb,
   'Flags collection-before-install + employee consultation'),

  ('priv-005', 'privacy-lead', 'ARATAKI', 'must_cite', 'medium',
   'Driver licence check obligations',
   'How often do I need to check my drivers'' licences are still valid for the class of vehicle they drive?',
   '["Land Transport Act 1998"]'::jsonb,
   '["licence class","endorsement","employer","reasonable steps","records"]'::jsonb,
   '["\\bno\\s+obligation\\b"]'::jsonb,
   'Cites Land Transport Act + flags employer due diligence')
ON CONFLICT (scenario_id) DO UPDATE SET
  agent_id      = EXCLUDED.agent_id,
  kete          = EXCLUDED.kete,
  category      = EXCLUDED.category,
  weight        = EXCLUDED.weight,
  title         = EXCLUDED.title,
  prompt        = EXCLUDED.prompt,
  must_cite     = EXCLUDED.must_cite,
  must_flag     = EXCLUDED.must_flag,
  hard_fails    = EXCLUDED.hard_fails,
  pass_criteria = EXCLUDED.pass_criteria,
  updated_at    = now();