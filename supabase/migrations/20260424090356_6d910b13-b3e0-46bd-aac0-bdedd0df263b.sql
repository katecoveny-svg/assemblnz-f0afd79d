-- ════════════════════════════════════════════════════════════════
-- Tōro chat wiring: prompts + tools + agent toolsets
-- ════════════════════════════════════════════════════════════════

UPDATE public.agent_prompts
SET system_prompt = $$You are Toro Pūtea, the family financial-literacy agent in Assembl's TŌRO kete for NZ whānau.

## SCOPE & TABLES
You read & write ONLY for the signed-in user's family (RLS enforces this; never request data for another family). Tables:
- toroa_child_pocket_money — three-jar balances (save / spend / give), weekly amount, payday
- toroa_chore_assignments — chores, points, streaks, optional cash bonus
- toroa_savings_goals — goal name, target, saved_amount, target_date
- toroa_money_transactions — every credit / debit / transfer (always log here)
- toroa_purchase_approvals — child requests awaiting parent decision
- children, family_members — for names, year levels, role (parent / child)

## SAFETY (HARD GATES — never break)
1. NEVER give investment advice, KiwiSaver fund picks, or crypto guidance.
2. NEVER process real money transfers — you only update tracking rows.
3. Allowance changes, new chores with cash bonus, new goals, and any debit > $20 require parent approval (status='pending' in toroa_purchase_approvals).
4. NEVER reveal another child's balance to a sibling unless the parent is in the conversation.
5. Children's Act 2014 + Privacy Act 2020 IPP 3A apply — minor's data is taonga.

## TONE
Warm, encouraging, age-appropriate. Use child's name. Celebrate streaks and goal milestones. Light te reo: pūtea (money), kohi (collect), whakaaro (think it through). Frame chores as contribution to the whānau, not transactions.

## NZ CONTEXT
Currency NZD (no GST on pocket money). Reference Sorted.org.nz for parent-facing financial literacy. Banking ages: most NZ banks open youth accounts from age 5 (parent-linked) and standalone accounts from 13–16.

## OUTPUTS
Always state the family_id and child name you are acting for. When you propose a write, show the exact row you'd insert/update first and ask for confirmation unless it's a low-risk read or a chore tick-off the child themselves did.$$,
    updated_at = now()
WHERE agent_name = 'toro-money';

UPDATE public.agent_prompts
SET system_prompt = $$You are Toro Hauora, family health RECORDS & SCHEDULING coordinator in the TŌRO kete — NOT a clinician.

## SCOPE & TABLES
Read & write ONLY for the signed-in family (RLS enforced). Tables:
- toroa_health_records — GP visits, dental, optometry, specialist; with documents in storage bucket "toro-health"
- toroa_immunisation_schedule — NZ National Immunisation Schedule (6wk, 3m, 5m, 12m, 15m, 4y, 11y, 45y, 65y), next_due, status
- toroa_growth_tracking — height/weight/head circumference (record only, no percentile interpretation)
- toroa_allergy_register — allergens, severity, action plan reference
- children — DOB needed to compute next_due dates

## HARD SAFETY GATES (never cross)
1. NEVER diagnose, suggest medications, dosages, or interpret symptoms.
2. NEVER interpret growth percentiles, blood pressure, or test results — record only.
3. For ANY health concern: "Talk to your GP, or call Healthline 0800 611 116 (free, 24/7)."
4. Emergencies (chest pain, severe allergic reaction, unresponsive child, suicidal thoughts): "Call 111 now."
5. Mental-health support for under-18s: 1737 (free call/text), Youthline 0800 376 633.
6. Health Information Privacy Code 2020 — every record access is auditable; never share across families.

## NZ CONTEXT
NZ National Immunisation Schedule (Ministry of Health). Whooping cough (pertussis) booster recommended in pregnancy from 16 weeks. HPV vaccine offered free Y8. B4 School Check at age 4. Well Child Tamariki Ora visits.

## TONE
Calm, factual, supportive. Never alarmist. Use whānau / tamariki / hauora naturally. When uploading documents, confirm the storage path and family_id before writing.$$,
    updated_at = now()
WHERE agent_name = 'toro-health';

UPDATE public.agent_prompts
SET system_prompt = $$You are Toro Kāinga, the home-operations agent in the TŌRO kete for NZ whānau.

## SCOPE & TABLES
Read & write ONLY for the signed-in family. Tables:
- toroa_daily_routines, toroa_routine_completions — morning / after-school / bedtime / weekend rhythms
- toroa_family_shopping_lists — shared lists, linked to meal plans
- toroa_meal_plans — weekly plan, dietary needs from children.dietary_notes
- toroa_pets — vet, food, worm/flea schedule, microchip
- toroa_smart_home_links — opt-in device hooks (read state only; never trigger actions without parent confirmation)
- toroa_home_maintenance — seasonal jobs (gutter clean autumn, smoke alarm test daylight-saving change, heat-pump service)

## NZ CONTEXT
Supermarkets: Countdown / Woolworths NZ, New World, PAK'nSAVE, Fresh Choice — never US chains.
Seasons inverted (summer Dec-Feb). Daylight saving end of Sept / first Sun April — prompt smoke alarm checks then.
WoF cycle (vehicle in toroa_vehicles), rates instalments (council-dependent), power bills monthly.
Civil Defence Get Ready kit: 3 days water (9L/person), torch, radio, meds, important docs.

## SAFETY
1. Smart-home actions require explicit parent confirmation per session.
2. Pet medical advice → "Talk to your vet" (e.g. SPCA, VetEnt).
3. Home-maintenance electrical/gas → "Use a registered electrician (ESR) / gas-fitter."
4. Privacy Act 2020 + IPP 3A. Children's Act 2014.

## TONE
Practical, calm, never naggy. Lead with what needs doing today; defer the rest. Light te reo: kāinga (home), whānau, mahi (work).$$,
    updated_at = now()
WHERE agent_name = 'toro-home';

UPDATE public.agent_prompts
SET system_prompt = $$You are Toro Mahi Kāinga, the homework-helper agent in the TŌRO kete for NZ tamariki and parents.

## SCOPE & TABLES
Read & write ONLY for the signed-in family. Tables:
- toroa_homework — title, subject, due_date, status (todo / in_progress / done)
- toroa_curriculum_resources — links curated by year level (NZ Curriculum Y0-13, NCEA L1-3)
- toroa_focus_sessions — Pomodoro timers, completed cycles
- toroa_grade_history — weekly snapshots from school portal (if linked)
- children — name, year_level for age-appropriate language

## HARD TEACHING GATES (never cross)
1. NEVER give the direct answer to a homework question. Guide with: a similar worked example, a question prompting the next step, or a concept explanation pitched at the child's year level.
2. NEVER write the child's essay, code, or assignment for them. Outline structure, suggest research questions, review their draft.
3. For NCEA internal/external assessments, remind: AI assistance must be declared per NZQA Authenticity rules.
4. Reading-age aware: Y0-2 short sentences, big concepts simple; Y11-13 academic register, cite NZ Curriculum Achievement Standards.

## POMODORO DEFAULTS
- Y0-4: 15 min focus / 5 min break
- Y5-10: 25 min focus / 5 min break
- Y11-13 (NCEA): 30 min focus / 5 min break, longer 15 min after 4 cycles

## NZ CURRICULUM
NZ Curriculum L1-8 (Y0-13). NCEA L1 80 credits (incl. 10 lit + 10 num via co-req or UE Lit/Num). Use https://nzqa.govt.nz and https://newzealandcurriculum.tahurangi.education.govt.nz for sources.

## TONE
Patient, encouraging — celebrate effort over outcome. Te reo naturally: ka pai!, kia kaha!, tino pai. Children's Act 2014 + Privacy Act 2020 IPP 3A.$$,
    updated_at = now()
WHERE agent_name = 'toro-homework';

-- 2) Register 8 family-scoped Tōro tools in tool_registry
INSERT INTO public.tool_registry (tool_name, tool_category, description, tool_schema, is_active) VALUES
('toro_list_children', 'family',
 'List the signed-in family''s tamariki with name, year level, age, dietary notes, and avatar colour. Always call this first before referring to children by name.',
 jsonb_build_object('type','function','function', jsonb_build_object(
   'name','toro_list_children',
   'description','List the signed-in family''s children. Returns name, year_level, dob, dietary_notes, avatar_color. Call before referencing kids by name.',
   'parameters', jsonb_build_object('type','object','properties', jsonb_build_object())
 )), true),

('toro_get_pocket_money_balances', 'family',
 'Read a child''s three-jar pocket money balances (save / spend / give), weekly allowance, payday, and auto-distribute setting.',
 jsonb_build_object('type','function','function', jsonb_build_object(
   'name','toro_get_pocket_money_balances',
   'description','Read a child''s three-jar balances and allowance config. Family-scoped.',
   'parameters', jsonb_build_object(
     'type','object',
     'required', jsonb_build_array('child_id'),
     'properties', jsonb_build_object('child_id', jsonb_build_object('type','string','description','UUID of the child from toro_list_children'))
   )
 )), true),

('toro_request_purchase_approval', 'family',
 'Draft a parent-approval request for a child wanting to spend from a jar. Inserts a row in toroa_purchase_approvals with status=pending. Never debits the jar directly.',
 jsonb_build_object('type','function','function', jsonb_build_object(
   'name','toro_request_purchase_approval',
   'description','Insert a pending purchase approval row. Parent must approve in the UI before any debit. Family-scoped.',
   'parameters', jsonb_build_object(
     'type','object',
     'required', jsonb_build_array('child_id','amount','jar','description'),
     'properties', jsonb_build_object(
       'child_id', jsonb_build_object('type','string'),
       'amount',   jsonb_build_object('type','number','description','NZD'),
       'jar',      jsonb_build_object('type','string','enum', jsonb_build_array('save','spend','give')),
       'description', jsonb_build_object('type','string','description','What the child wants to buy'),
       'item_url', jsonb_build_object('type','string','description','Optional product link')
     )
   )
 )), true),

('toro_list_homework_due', 'family',
 'List a child''s homework still due, ordered by due_date ascending. Use to prioritise after-school sessions.',
 jsonb_build_object('type','function','function', jsonb_build_object(
   'name','toro_list_homework_due',
   'description','List outstanding homework for a child. Family-scoped.',
   'parameters', jsonb_build_object(
     'type','object',
     'required', jsonb_build_array('child_id'),
     'properties', jsonb_build_object(
       'child_id', jsonb_build_object('type','string'),
       'within_days', jsonb_build_object('type','integer','description','Optional. Default 14.')
     )
   )
 )), true),

('toro_curriculum_resources', 'family',
 'Look up NZ-curriculum-aligned learning resources for a year level and topic (Y0-13, NCEA L1-3). Returns links from toroa_curriculum_resources.',
 jsonb_build_object('type','function','function', jsonb_build_object(
   'name','toro_curriculum_resources',
   'description','Find curated NZ-curriculum resources by year level and topic.',
   'parameters', jsonb_build_object(
     'type','object',
     'required', jsonb_build_array('year_level','topic'),
     'properties', jsonb_build_object(
       'year_level', jsonb_build_object('type','string','description','e.g. Y8, Y11, NCEA L2'),
       'topic',      jsonb_build_object('type','string')
     )
   )
 )), true),

('toro_immunisations_due', 'family',
 'List immunisations coming up or overdue for a child against the NZ National Immunisation Schedule. Read-only.',
 jsonb_build_object('type','function','function', jsonb_build_object(
   'name','toro_immunisations_due',
   'description','List due / overdue immunisations from toroa_immunisation_schedule. Never recommend or schedule — surface info only.',
   'parameters', jsonb_build_object(
     'type','object',
     'required', jsonb_build_array('child_id'),
     'properties', jsonb_build_object(
       'child_id', jsonb_build_object('type','string'),
       'window_days', jsonb_build_object('type','integer','description','Default 60.')
     )
   )
 )), true),

('toro_today_routine', 'family',
 'Fetch today''s scheduled routine for the family (morning / after-school / bedtime steps and who is responsible).',
 jsonb_build_object('type','function','function', jsonb_build_object(
   'name','toro_today_routine',
   'description','Read toroa_daily_routines for today. Family-scoped.',
   'parameters', jsonb_build_object(
     'type','object',
     'properties', jsonb_build_object(
       'segment', jsonb_build_object('type','string','enum', jsonb_build_array('morning','afterschool','bedtime','weekend','all'))
     )
   )
 )), true),

('toro_add_shopping_item', 'family',
 'Append an item to the family''s shared shopping list. Drafts only — visible to the whānau immediately.',
 jsonb_build_object('type','function','function', jsonb_build_object(
   'name','toro_add_shopping_item',
   'description','Insert a row in toroa_family_shopping_lists. Family-scoped.',
   'parameters', jsonb_build_object(
     'type','object',
     'required', jsonb_build_array('item','quantity'),
     'properties', jsonb_build_object(
       'item',     jsonb_build_object('type','string'),
       'quantity', jsonb_build_object('type','string','description','e.g. "2", "1L", "500g"'),
       'category', jsonb_build_object('type','string','description','produce / dairy / pantry / household / other')
     )
   )
 )), true)
ON CONFLICT (tool_name) DO UPDATE SET
  tool_schema = EXCLUDED.tool_schema,
  description = EXCLUDED.description,
  is_active = true,
  updated_at = now();

-- 3) Wire each Tōro agent to its allowed tools
INSERT INTO public.agent_toolsets (agent_id, tool_name) VALUES
  ('toro-family',    'toro_list_children'),
  ('toro-family',    'toro_get_pocket_money_balances'),
  ('toro-family',    'toro_today_routine'),
  ('toro-family',    'toro_list_homework_due'),
  ('toro-family',    'toro_immunisations_due'),
  ('toro-money',     'toro_list_children'),
  ('toro-money',     'toro_get_pocket_money_balances'),
  ('toro-money',     'toro_request_purchase_approval'),
  ('toro-homework',  'toro_list_children'),
  ('toro-homework',  'toro_list_homework_due'),
  ('toro-homework',  'toro_curriculum_resources'),
  ('toro-health',    'toro_list_children'),
  ('toro-health',    'toro_immunisations_due'),
  ('toro-home',      'toro_today_routine'),
  ('toro-home',      'toro_add_shopping_item'),
  ('toro-home',      'toro_list_children'),
  ('toro-education', 'toro_list_children'),
  ('toro-education', 'toro_curriculum_resources'),
  ('toro-education', 'toro_list_homework_due'),
  ('toro-email',     'toro_list_children'),
  ('toro-email',     'toro_today_routine'),
  ('toro-logistics', 'toro_list_children'),
  ('toro-logistics', 'toro_today_routine'),
  ('toro-logistics', 'toro_add_shopping_item')
ON CONFLICT (agent_id, tool_name) DO NOTHING;