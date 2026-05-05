-- ════════════════════════════════════════════════════════════════════
-- ATA Demo · PR-B seed data · Project 1 + Project 2
-- ════════════════════════════════════════════════════════════════════
-- Brief:  doc cmorswvj502bt06adftd0eqgc · section 4 (PR-B)
-- Spec:   doc cmorq8c2v006007ad9ew8ita0 · sections 5–6
-- Geom:   doc cmoru0lo602xm07ad9q1ezpln · sections 5–6
-- Author: Kaihanga <kaihanga@assembl.local>
-- Scope:  2 bim_models rows + 17 bim_overlays rows (14 P1 + 3 P2 halt)
--         + 47 project_schedule rows (11-week construction programme)
-- ════════════════════════════════════════════════════════════════════
-- Domain disclaimer (TA-3): This is an AI-assisted BIM coordination
-- output. Final dimensional and compliance verification rests with the
-- project architect, engineer, and BIM manager. Final consent
-- determination rests with the relevant Building Consent Authority.
-- ════════════════════════════════════════════════════════════════════
-- Idempotency: every INSERT uses ON CONFLICT (id) DO UPDATE so the
-- migration is safe to re-run. UUIDs are deterministic (uuid5 on a
-- fixed namespace) so re-runs produce byte-identical SQL.
-- ════════════════════════════════════════════════════════════════════
-- IPP 1 minimisation: this migration carries NO PII. Project 1 is a
-- generic 2-bed prefab pattern; Project 1 demo address is the
-- synthetic '14 Edmonton Rd Henderson' (verified non-existent). No
-- owner names, no architect / engineer / consultant individual names,
-- no council file references, no source date stamps.
-- ════════════════════════════════════════════════════════════════════

-- ── bim_models ─────────────────────────────────────────────────────

INSERT INTO public.bim_models (
  id, project_id, tenant_id,
  source_tier, source_url, glb_url,
  element_count, tolerance_mm, processing_status, warnings
) VALUES (
  'e004cbc0-88e0-5a47-9412-e84456036738',
  '2ef80c6c-0975-54e0-adc2-1506ef469229',
  '00000000-0000-0000-0000-000000000001',
  'tier1_structify',
  'bpy-generated:doc-cmoru0lo602xm07ad9q1ezpln',
  'bim-models/2ef80c6c-0975-54e0-adc2-1506ef469229/model.glb',
  47,
  25,
  'complete',
  '[]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  project_id = EXCLUDED.project_id,
  tenant_id = EXCLUDED.tenant_id,
  source_tier = EXCLUDED.source_tier,
  source_url = EXCLUDED.source_url,
  glb_url = EXCLUDED.glb_url,
  element_count = EXCLUDED.element_count,
  tolerance_mm = EXCLUDED.tolerance_mm,
  processing_status = EXCLUDED.processing_status,
  warnings = EXCLUDED.warnings,
  updated_at = now();

INSERT INTO public.bim_models (
  id, project_id, tenant_id,
  source_tier, source_url, glb_url,
  element_count, tolerance_mm, processing_status, warnings
) VALUES (
  'b6ce365e-7156-5c7b-925b-599ecb7cd582',
  '7dee0a31-f3f0-5928-b021-ec477d5cf6d8',
  '00000000-0000-0000-0000-000000000001',
  'tier1_structify',
  NULL,
  NULL,
  NULL,
  25,
  'tikanga_halt',
  '[{"code":"tikanga_halt","message":"Project halted at tikanga screening; geometry build deferred until mana whenua / Heritage NZ path is open."}]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  project_id = EXCLUDED.project_id,
  tenant_id = EXCLUDED.tenant_id,
  source_tier = EXCLUDED.source_tier,
  source_url = EXCLUDED.source_url,
  glb_url = EXCLUDED.glb_url,
  element_count = EXCLUDED.element_count,
  tolerance_mm = EXCLUDED.tolerance_mm,
  processing_status = EXCLUDED.processing_status,
  warnings = EXCLUDED.warnings,
  updated_at = now();

-- ── bim_overlays · Project 1 (14 rows) ─────────────────────────────

INSERT INTO public.bim_overlays (
  id, bim_model_id, project_id, overlay_type, element_id,
  severity, citation, citation_edition, has_personal_information, notes
) VALUES (
  '3fad9ecf-1cf9-5742-ac90-de92316e4d18',
  'e004cbc0-88e0-5a47-9412-e84456036738',
  '2ef80c6c-0975-54e0-adc2-1506ef469229',
  'compliance',
  'door_bathroom',
  'non_compliant',
  'NZBC D1.3.4',
  'Building Code 2025',
  false,
  'Door clear opening 760mm; accessible route requires 810mm minimum. Detected on Blender bpy element door_bathroom.'
) ON CONFLICT (id) DO UPDATE SET
  bim_model_id = EXCLUDED.bim_model_id,
  project_id = EXCLUDED.project_id,
  overlay_type = EXCLUDED.overlay_type,
  element_id = EXCLUDED.element_id,
  severity = EXCLUDED.severity,
  citation = EXCLUDED.citation,
  citation_edition = EXCLUDED.citation_edition,
  notes = EXCLUDED.notes;

INSERT INTO public.bim_overlays (
  id, bim_model_id, project_id, overlay_type, element_id,
  severity, citation, citation_edition, has_personal_information, notes
) VALUES (
  '7b2d2fee-b6a6-57d2-873d-fc7457dab214',
  'e004cbc0-88e0-5a47-9412-e84456036738',
  '2ef80c6c-0975-54e0-adc2-1506ef469229',
  'compliance',
  'deck_north',
  'non_compliant',
  'Building Code F4.3.4',
  'Building Code 2025',
  false,
  'Deck 1100mm above grade at NE corner with no balustrade modelled. F4.3.4 requires 1000mm balustrade where fall risk exceeds 1m.'
) ON CONFLICT (id) DO UPDATE SET
  bim_model_id = EXCLUDED.bim_model_id,
  project_id = EXCLUDED.project_id,
  overlay_type = EXCLUDED.overlay_type,
  element_id = EXCLUDED.element_id,
  severity = EXCLUDED.severity,
  citation = EXCLUDED.citation,
  citation_edition = EXCLUDED.citation_edition,
  notes = EXCLUDED.notes;

INSERT INTO public.bim_overlays (
  id, bim_model_id, project_id, overlay_type, element_id,
  severity, citation, citation_edition, has_personal_information, notes
) VALUES (
  'ae27001b-2765-5ca4-8d8b-93b937c67503',
  'e004cbc0-88e0-5a47-9412-e84456036738',
  '2ef80c6c-0975-54e0-adc2-1506ef469229',
  'compliance',
  'fixture_hot_water_cylinder',
  'non_compliant',
  'Building Product Specifications',
  'BPS 1st edition (28 July 2025)',
  false,
  'Specified product carries no Product Technical Statement. BPS-required for hot water cylinders since 28 July 2025.'
) ON CONFLICT (id) DO UPDATE SET
  bim_model_id = EXCLUDED.bim_model_id,
  project_id = EXCLUDED.project_id,
  overlay_type = EXCLUDED.overlay_type,
  element_id = EXCLUDED.element_id,
  severity = EXCLUDED.severity,
  citation = EXCLUDED.citation,
  citation_edition = EXCLUDED.citation_edition,
  notes = EXCLUDED.notes;

INSERT INTO public.bim_overlays (
  id, bim_model_id, project_id, overlay_type, element_id,
  severity, citation, citation_edition, has_personal_information, notes
) VALUES (
  '0166c219-78dd-5425-b357-acbce3afb55a',
  'e004cbc0-88e0-5a47-9412-e84456036738',
  '2ef80c6c-0975-54e0-adc2-1506ef469229',
  'compliance',
  'wall_external_north',
  'review',
  'E2/AS1',
  'Building Code 2025',
  false,
  'Vertical timber cladding cavity batten detail not specified at junctions; review at pre-line.'
) ON CONFLICT (id) DO UPDATE SET
  bim_model_id = EXCLUDED.bim_model_id,
  project_id = EXCLUDED.project_id,
  overlay_type = EXCLUDED.overlay_type,
  element_id = EXCLUDED.element_id,
  severity = EXCLUDED.severity,
  citation = EXCLUDED.citation,
  citation_edition = EXCLUDED.citation_edition,
  notes = EXCLUDED.notes;

INSERT INTO public.bim_overlays (
  id, bim_model_id, project_id, overlay_type, element_id,
  severity, citation, citation_edition, has_personal_information, notes
) VALUES (
  '61a9da6e-66ec-5aa2-af65-6528f8a86259',
  'e004cbc0-88e0-5a47-9412-e84456036738',
  '2ef80c6c-0975-54e0-adc2-1506ef469229',
  'compliance',
  'fixture_bath_shower',
  'review',
  'E3/AS1',
  'Building Code 2025',
  false,
  'Internal moisture mechanical extraction rate not yet calculated; confirm fan capacity meets E3/AS1 6.3.'
) ON CONFLICT (id) DO UPDATE SET
  bim_model_id = EXCLUDED.bim_model_id,
  project_id = EXCLUDED.project_id,
  overlay_type = EXCLUDED.overlay_type,
  element_id = EXCLUDED.element_id,
  severity = EXCLUDED.severity,
  citation = EXCLUDED.citation,
  citation_edition = EXCLUDED.citation_edition,
  notes = EXCLUDED.notes;

INSERT INTO public.bim_overlays (
  id, bim_model_id, project_id, overlay_type, element_id,
  severity, citation, citation_edition, has_personal_information, notes
) VALUES (
  '0c397ce3-7fa4-50de-8e74-db11829e89fb',
  'e004cbc0-88e0-5a47-9412-e84456036738',
  '2ef80c6c-0975-54e0-adc2-1506ef469229',
  'compliance',
  'window_bedroom1_north',
  'review',
  'G4/AS1',
  'Building Code 2025',
  false,
  'Ventilation opening calculation not provided; review against G4/AS1 minimum 5% of floor area for habitable rooms.'
) ON CONFLICT (id) DO UPDATE SET
  bim_model_id = EXCLUDED.bim_model_id,
  project_id = EXCLUDED.project_id,
  overlay_type = EXCLUDED.overlay_type,
  element_id = EXCLUDED.element_id,
  severity = EXCLUDED.severity,
  citation = EXCLUDED.citation,
  citation_edition = EXCLUDED.citation_edition,
  notes = EXCLUDED.notes;

INSERT INTO public.bim_overlays (
  id, bim_model_id, project_id, overlay_type, element_id,
  severity, citation, citation_edition, has_personal_information, notes
) VALUES (
  'e10334fc-46ac-541a-a3a9-6ef8f54f1342',
  'e004cbc0-88e0-5a47-9412-e84456036738',
  '2ef80c6c-0975-54e0-adc2-1506ef469229',
  'compliance',
  'roof_gable_north',
  'review',
  'H1/AS1',
  'Building Code 2025',
  false,
  'Insulation R-value not specified on documentation; H1/AS1 climate zone 1 minimum R6.6 ceiling.'
) ON CONFLICT (id) DO UPDATE SET
  bim_model_id = EXCLUDED.bim_model_id,
  project_id = EXCLUDED.project_id,
  overlay_type = EXCLUDED.overlay_type,
  element_id = EXCLUDED.element_id,
  severity = EXCLUDED.severity,
  citation = EXCLUDED.citation,
  citation_edition = EXCLUDED.citation_edition,
  notes = EXCLUDED.notes;

INSERT INTO public.bim_overlays (
  id, bim_model_id, project_id, overlay_type, element_id,
  severity, citation, citation_edition, has_personal_information, notes
) VALUES (
  'f91df730-00e9-5518-a4f0-140f72eded6c',
  'e004cbc0-88e0-5a47-9412-e84456036738',
  '2ef80c6c-0975-54e0-adc2-1506ef469229',
  'compliance',
  'deck_south',
  'review',
  'B2/AS1',
  'Building Code 2025',
  false,
  'Timber decking treatment level not specified; B2/AS1 requires H3.2 minimum for in-ground or H4 if in contact with ground.'
) ON CONFLICT (id) DO UPDATE SET
  bim_model_id = EXCLUDED.bim_model_id,
  project_id = EXCLUDED.project_id,
  overlay_type = EXCLUDED.overlay_type,
  element_id = EXCLUDED.element_id,
  severity = EXCLUDED.severity,
  citation = EXCLUDED.citation,
  citation_edition = EXCLUDED.citation_edition,
  notes = EXCLUDED.notes;

INSERT INTO public.bim_overlays (
  id, bim_model_id, project_id, overlay_type, element_id,
  severity, citation, citation_edition, has_personal_information, notes
) VALUES (
  '8f225e92-4227-5af8-9472-c66e1fd5bd50',
  'e004cbc0-88e0-5a47-9412-e84456036738',
  '2ef80c6c-0975-54e0-adc2-1506ef469229',
  'compliance',
  'ceiling_main',
  'review',
  'F2/AS1',
  'Building Code 2025',
  false,
  'Internal lining specification gap on ceiling extent and fixings; review against F2/AS1.'
) ON CONFLICT (id) DO UPDATE SET
  bim_model_id = EXCLUDED.bim_model_id,
  project_id = EXCLUDED.project_id,
  overlay_type = EXCLUDED.overlay_type,
  element_id = EXCLUDED.element_id,
  severity = EXCLUDED.severity,
  citation = EXCLUDED.citation,
  citation_edition = EXCLUDED.citation_edition,
  notes = EXCLUDED.notes;

INSERT INTO public.bim_overlays (
  id, bim_model_id, project_id, overlay_type, element_id,
  severity, citation, citation_edition, has_personal_information, notes
) VALUES (
  '4394dfaa-3fb3-50e5-9a2d-4549db69d1c5',
  'e004cbc0-88e0-5a47-9412-e84456036738',
  '2ef80c6c-0975-54e0-adc2-1506ef469229',
  'compliance',
  'floor_subframe',
  'passing',
  'NZS 3604:2011',
  'NZS 3604:2011',
  false,
  'Light timber frame envelope passes NZS 3604:2011 — single storey, member sizes within tabulated spans.'
) ON CONFLICT (id) DO UPDATE SET
  bim_model_id = EXCLUDED.bim_model_id,
  project_id = EXCLUDED.project_id,
  overlay_type = EXCLUDED.overlay_type,
  element_id = EXCLUDED.element_id,
  severity = EXCLUDED.severity,
  citation = EXCLUDED.citation,
  citation_edition = EXCLUDED.citation_edition,
  notes = EXCLUDED.notes;

INSERT INTO public.bim_overlays (
  id, bim_model_id, project_id, overlay_type, element_id,
  severity, citation, citation_edition, has_personal_information, notes
) VALUES (
  '8f6c4ee3-c35d-55ec-af5e-ae82e0cf0089',
  'e004cbc0-88e0-5a47-9412-e84456036738',
  '2ef80c6c-0975-54e0-adc2-1506ef469229',
  'compliance',
  'wall_external_south',
  'passing',
  'C/AS2',
  'Building Code 2025',
  false,
  'Fire envelope passes C/AS2 — single-storey detached residential <100m2, low fire risk.'
) ON CONFLICT (id) DO UPDATE SET
  bim_model_id = EXCLUDED.bim_model_id,
  project_id = EXCLUDED.project_id,
  overlay_type = EXCLUDED.overlay_type,
  element_id = EXCLUDED.element_id,
  severity = EXCLUDED.severity,
  citation = EXCLUDED.citation,
  citation_edition = EXCLUDED.citation_edition,
  notes = EXCLUDED.notes;

INSERT INTO public.bim_overlays (
  id, bim_model_id, project_id, overlay_type, element_id,
  severity, citation, citation_edition, has_personal_information, notes
) VALUES (
  'f69ccb56-fc7e-5c02-88bf-a576b37bc9ab',
  'e004cbc0-88e0-5a47-9412-e84456036738',
  '2ef80c6c-0975-54e0-adc2-1506ef469229',
  'compliance',
  'pile_se',
  'passing',
  'E1/AS1',
  'Building Code 2025',
  false,
  'Surface water passes E1/AS1 — site falls toward existing stormwater connection; no impoundment indicated.'
) ON CONFLICT (id) DO UPDATE SET
  bim_model_id = EXCLUDED.bim_model_id,
  project_id = EXCLUDED.project_id,
  overlay_type = EXCLUDED.overlay_type,
  element_id = EXCLUDED.element_id,
  severity = EXCLUDED.severity,
  citation = EXCLUDED.citation,
  citation_edition = EXCLUDED.citation_edition,
  notes = EXCLUDED.notes;

INSERT INTO public.bim_overlays (
  id, bim_model_id, project_id, overlay_type, element_id,
  severity, citation, citation_edition, has_personal_information, notes
) VALUES (
  'e1f6ee0e-9b4b-5d28-bdcf-aee6d6d547f0',
  'e004cbc0-88e0-5a47-9412-e84456036738',
  '2ef80c6c-0975-54e0-adc2-1506ef469229',
  'compliance',
  'door_main_entry',
  'passing',
  'NZBC D1.3.3',
  'Building Code 2025',
  false,
  'Main entry door clear opening 813mm passes D1.3.3 minimum 760mm; route also passes D1.3.4 accessible 810mm.'
) ON CONFLICT (id) DO UPDATE SET
  bim_model_id = EXCLUDED.bim_model_id,
  project_id = EXCLUDED.project_id,
  overlay_type = EXCLUDED.overlay_type,
  element_id = EXCLUDED.element_id,
  severity = EXCLUDED.severity,
  citation = EXCLUDED.citation,
  citation_edition = EXCLUDED.citation_edition,
  notes = EXCLUDED.notes;

INSERT INTO public.bim_overlays (
  id, bim_model_id, project_id, overlay_type, element_id,
  severity, citation, citation_edition, has_personal_information, notes
) VALUES (
  '174c1aa7-1452-5d5c-b254-b544c3c7a256',
  'e004cbc0-88e0-5a47-9412-e84456036738',
  '2ef80c6c-0975-54e0-adc2-1506ef469229',
  'compliance',
  'window_bedroom2_north',
  'passing',
  'F4',
  'Building Code 2025',
  false,
  'F4 falling envelope passes — single-storey, FFL less than 1m above grade at this corner; balustrade not required.'
) ON CONFLICT (id) DO UPDATE SET
  bim_model_id = EXCLUDED.bim_model_id,
  project_id = EXCLUDED.project_id,
  overlay_type = EXCLUDED.overlay_type,
  element_id = EXCLUDED.element_id,
  severity = EXCLUDED.severity,
  citation = EXCLUDED.citation,
  citation_edition = EXCLUDED.citation_edition,
  notes = EXCLUDED.notes;

-- ── bim_overlays · Project 2 (3 tikanga halts) ─────────────────────

INSERT INTO public.bim_overlays (
  id, bim_model_id, project_id, overlay_type, element_id,
  severity, citation, citation_edition, has_personal_information, notes
) VALUES (
  '8e1975ba-3296-5e1a-975f-48b3989ddbb5',
  'b6ce365e-7156-5c7b-925b-599ecb7cd582',
  '7dee0a31-f3f0-5928-b021-ec477d5cf6d8',
  'tikanga',
  'project_2_site',
  'halt',
  'AUP Henderson Valley heritage area overlay',
  'Auckland Unitary Plan',
  false,
  'Site falls within Henderson Valley heritage character overlay. Resource consent requires heritage assessment and may require iwi consultation.'
) ON CONFLICT (id) DO UPDATE SET
  bim_model_id = EXCLUDED.bim_model_id,
  project_id = EXCLUDED.project_id,
  overlay_type = EXCLUDED.overlay_type,
  element_id = EXCLUDED.element_id,
  severity = EXCLUDED.severity,
  citation = EXCLUDED.citation,
  citation_edition = EXCLUDED.citation_edition,
  notes = EXCLUDED.notes;

INSERT INTO public.bim_overlays (
  id, bim_model_id, project_id, overlay_type, element_id,
  severity, citation, citation_edition, has_personal_information, notes
) VALUES (
  '7841d1fc-d26c-5e6d-8cb2-fc032879912b',
  'b6ce365e-7156-5c7b-925b-599ecb7cd582',
  '7dee0a31-f3f0-5928-b021-ec477d5cf6d8',
  'tikanga',
  'project_2_site',
  'halt',
  'HNZPT 2014 s 42',
  'Heritage New Zealand Pouhere Taonga Act 2014',
  false,
  'NZAA archaeological alert layer adjacent. Section 42 archaeological authority may be required prior to any earthworks.'
) ON CONFLICT (id) DO UPDATE SET
  bim_model_id = EXCLUDED.bim_model_id,
  project_id = EXCLUDED.project_id,
  overlay_type = EXCLUDED.overlay_type,
  element_id = EXCLUDED.element_id,
  severity = EXCLUDED.severity,
  citation = EXCLUDED.citation,
  citation_edition = EXCLUDED.citation_edition,
  notes = EXCLUDED.notes;

INSERT INTO public.bim_overlays (
  id, bim_model_id, project_id, overlay_type, element_id,
  severity, citation, citation_edition, has_personal_information, notes
) VALUES (
  '695e5459-dde4-58e8-95bd-e0e77258dc50',
  'b6ce365e-7156-5c7b-925b-599ecb7cd582',
  '7dee0a31-f3f0-5928-b021-ec477d5cf6d8',
  'tikanga',
  'project_2_site',
  'halt',
  'Te Tiriti o Waitangi engagement',
  'assembl tikanga framework v1',
  false,
  'Mana whenua engagement required before geometry build proceeds. Customer disclosure is human-paced via the LBP after consultation path is open.'
) ON CONFLICT (id) DO UPDATE SET
  bim_model_id = EXCLUDED.bim_model_id,
  project_id = EXCLUDED.project_id,
  overlay_type = EXCLUDED.overlay_type,
  element_id = EXCLUDED.element_id,
  severity = EXCLUDED.severity,
  citation = EXCLUDED.citation,
  citation_edition = EXCLUDED.citation_edition,
  notes = EXCLUDED.notes;

-- ── project_schedule · Project 1 (47 tasks · 11-week programme) ───

INSERT INTO public.project_schedule (
  id, project_id, task_id, task_name, element_ids,
  start_date, end_date, predecessor_task_ids
) VALUES (
  '6b296b74-5d7f-5ca1-befa-abdc5ab2f1cd',
  '2ef80c6c-0975-54e0-adc2-1506ef469229',
  'w1-t1',
  'Site mobilisation and access',
  '{}'::text[],
  '2026-06-01',
  '2026-06-01',
  '{}'::text[]
) ON CONFLICT (project_id, task_id) DO UPDATE SET
  task_name = EXCLUDED.task_name,
  element_ids = EXCLUDED.element_ids,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  predecessor_task_ids = EXCLUDED.predecessor_task_ids,
  updated_at = now();

INSERT INTO public.project_schedule (
  id, project_id, task_id, task_name, element_ids,
  start_date, end_date, predecessor_task_ids
) VALUES (
  'b7477966-1569-55cd-af0a-b2e6fbdb28ef',
  '2ef80c6c-0975-54e0-adc2-1506ef469229',
  'w1-t2',
  'Site clearance and excavation',
  '{}'::text[],
  '2026-06-02',
  '2026-06-03',
  '{"w1-t1"}'::text[]
) ON CONFLICT (project_id, task_id) DO UPDATE SET
  task_name = EXCLUDED.task_name,
  element_ids = EXCLUDED.element_ids,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  predecessor_task_ids = EXCLUDED.predecessor_task_ids,
  updated_at = now();

INSERT INTO public.project_schedule (
  id, project_id, task_id, task_name, element_ids,
  start_date, end_date, predecessor_task_ids
) VALUES (
  '3e9cfee2-e7de-5a0c-ba85-db61a8b7b780',
  '2ef80c6c-0975-54e0-adc2-1506ef469229',
  'w1-t3',
  'Pile setting — north corners',
  '{"pile_nw","pile_ne"}'::text[],
  '2026-06-04',
  '2026-06-04',
  '{"w1-t2"}'::text[]
) ON CONFLICT (project_id, task_id) DO UPDATE SET
  task_name = EXCLUDED.task_name,
  element_ids = EXCLUDED.element_ids,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  predecessor_task_ids = EXCLUDED.predecessor_task_ids,
  updated_at = now();

INSERT INTO public.project_schedule (
  id, project_id, task_id, task_name, element_ids,
  start_date, end_date, predecessor_task_ids
) VALUES (
  'ae59ec1c-a343-5fba-920e-ae8a1b7807cc',
  '2ef80c6c-0975-54e0-adc2-1506ef469229',
  'w1-t4',
  'Pile setting — south corners',
  '{"pile_sw","pile_se"}'::text[],
  '2026-06-05',
  '2026-06-05',
  '{"w1-t3"}'::text[]
) ON CONFLICT (project_id, task_id) DO UPDATE SET
  task_name = EXCLUDED.task_name,
  element_ids = EXCLUDED.element_ids,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  predecessor_task_ids = EXCLUDED.predecessor_task_ids,
  updated_at = now();

INSERT INTO public.project_schedule (
  id, project_id, task_id, task_name, element_ids,
  start_date, end_date, predecessor_task_ids
) VALUES (
  'cb23b2ef-cc51-5bdd-9416-397356db54c8',
  '2ef80c6c-0975-54e0-adc2-1506ef469229',
  'w1-t5',
  'Pile setting — mid spans',
  '{"pile_mid_n","pile_mid_s"}'::text[],
  '2026-06-05',
  '2026-06-05',
  '{"w1-t3"}'::text[]
) ON CONFLICT (project_id, task_id) DO UPDATE SET
  task_name = EXCLUDED.task_name,
  element_ids = EXCLUDED.element_ids,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  predecessor_task_ids = EXCLUDED.predecessor_task_ids,
  updated_at = now();

INSERT INTO public.project_schedule (
  id, project_id, task_id, task_name, element_ids,
  start_date, end_date, predecessor_task_ids
) VALUES (
  'e05e352b-1f2a-5f65-9ce2-3ac1d69c0c61',
  '2ef80c6c-0975-54e0-adc2-1506ef469229',
  'w2-t1',
  'Bearers and joists install',
  '{"floor_subframe"}'::text[],
  '2026-06-08',
  '2026-06-10',
  '{"w1-t5"}'::text[]
) ON CONFLICT (project_id, task_id) DO UPDATE SET
  task_name = EXCLUDED.task_name,
  element_ids = EXCLUDED.element_ids,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  predecessor_task_ids = EXCLUDED.predecessor_task_ids,
  updated_at = now();

INSERT INTO public.project_schedule (
  id, project_id, task_id, task_name, element_ids,
  start_date, end_date, predecessor_task_ids
) VALUES (
  'b8b73f34-e436-54a7-8ca4-e208a8efc779',
  '2ef80c6c-0975-54e0-adc2-1506ef469229',
  'w2-t2',
  'Subfloor service rough-in',
  '{"floor_subframe"}'::text[],
  '2026-06-10',
  '2026-06-11',
  '{"w2-t1"}'::text[]
) ON CONFLICT (project_id, task_id) DO UPDATE SET
  task_name = EXCLUDED.task_name,
  element_ids = EXCLUDED.element_ids,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  predecessor_task_ids = EXCLUDED.predecessor_task_ids,
  updated_at = now();

INSERT INTO public.project_schedule (
  id, project_id, task_id, task_name, element_ids,
  start_date, end_date, predecessor_task_ids
) VALUES (
  '3686060c-42b0-5b81-a88b-2d695886b6c8',
  '2ef80c6c-0975-54e0-adc2-1506ef469229',
  'w2-t3',
  'Subfloor compliance inspection',
  '{"floor_subframe"}'::text[],
  '2026-06-12',
  '2026-06-12',
  '{"w2-t2"}'::text[]
) ON CONFLICT (project_id, task_id) DO UPDATE SET
  task_name = EXCLUDED.task_name,
  element_ids = EXCLUDED.element_ids,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  predecessor_task_ids = EXCLUDED.predecessor_task_ids,
  updated_at = now();

INSERT INTO public.project_schedule (
  id, project_id, task_id, task_name, element_ids,
  start_date, end_date, predecessor_task_ids
) VALUES (
  '90b575d1-70d4-5003-8b40-bd4843c7e4ba',
  '2ef80c6c-0975-54e0-adc2-1506ef469229',
  'w2-t4',
  'Subfloor sign-off',
  '{"floor_subframe"}'::text[],
  '2026-06-12',
  '2026-06-12',
  '{"w2-t3"}'::text[]
) ON CONFLICT (project_id, task_id) DO UPDATE SET
  task_name = EXCLUDED.task_name,
  element_ids = EXCLUDED.element_ids,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  predecessor_task_ids = EXCLUDED.predecessor_task_ids,
  updated_at = now();

INSERT INTO public.project_schedule (
  id, project_id, task_id, task_name, element_ids,
  start_date, end_date, predecessor_task_ids
) VALUES (
  '22f2f11b-65ca-5c2f-bb2d-d616cad83ebb',
  '2ef80c6c-0975-54e0-adc2-1506ef469229',
  'w3-t1',
  'Floor slab setout and boxing',
  '{"floor_slab"}'::text[],
  '2026-06-15',
  '2026-06-16',
  '{"w2-t4"}'::text[]
) ON CONFLICT (project_id, task_id) DO UPDATE SET
  task_name = EXCLUDED.task_name,
  element_ids = EXCLUDED.element_ids,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  predecessor_task_ids = EXCLUDED.predecessor_task_ids,
  updated_at = now();

INSERT INTO public.project_schedule (
  id, project_id, task_id, task_name, element_ids,
  start_date, end_date, predecessor_task_ids
) VALUES (
  'ccc56d1a-b04f-5e09-926a-cd0e72a3ea5c',
  '2ef80c6c-0975-54e0-adc2-1506ef469229',
  'w3-t2',
  'Floor slab pour',
  '{"floor_slab"}'::text[],
  '2026-06-17',
  '2026-06-17',
  '{"w3-t1"}'::text[]
) ON CONFLICT (project_id, task_id) DO UPDATE SET
  task_name = EXCLUDED.task_name,
  element_ids = EXCLUDED.element_ids,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  predecessor_task_ids = EXCLUDED.predecessor_task_ids,
  updated_at = now();

INSERT INTO public.project_schedule (
  id, project_id, task_id, task_name, element_ids,
  start_date, end_date, predecessor_task_ids
) VALUES (
  '70b05c3d-0860-5ef0-b43a-6b95d74c0749',
  '2ef80c6c-0975-54e0-adc2-1506ef469229',
  'w3-t3',
  'Floor slab cure and inspection',
  '{"floor_slab"}'::text[],
  '2026-06-18',
  '2026-06-19',
  '{"w3-t2"}'::text[]
) ON CONFLICT (project_id, task_id) DO UPDATE SET
  task_name = EXCLUDED.task_name,
  element_ids = EXCLUDED.element_ids,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  predecessor_task_ids = EXCLUDED.predecessor_task_ids,
  updated_at = now();

INSERT INTO public.project_schedule (
  id, project_id, task_id, task_name, element_ids,
  start_date, end_date, predecessor_task_ids
) VALUES (
  '82eba2b0-656e-5ea7-8e4c-0216713c1803',
  '2ef80c6c-0975-54e0-adc2-1506ef469229',
  'w3-t4',
  'Wall framing setout',
  '{"floor_slab"}'::text[],
  '2026-06-19',
  '2026-06-19',
  '{"w3-t3"}'::text[]
) ON CONFLICT (project_id, task_id) DO UPDATE SET
  task_name = EXCLUDED.task_name,
  element_ids = EXCLUDED.element_ids,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  predecessor_task_ids = EXCLUDED.predecessor_task_ids,
  updated_at = now();

INSERT INTO public.project_schedule (
  id, project_id, task_id, task_name, element_ids,
  start_date, end_date, predecessor_task_ids
) VALUES (
  'c32782c0-105d-5e77-bf98-54e6ff850894',
  '2ef80c6c-0975-54e0-adc2-1506ef469229',
  'w4-t1',
  'External wall framing — south',
  '{"wall_external_south"}'::text[],
  '2026-06-22',
  '2026-06-23',
  '{"w3-t4"}'::text[]
) ON CONFLICT (project_id, task_id) DO UPDATE SET
  task_name = EXCLUDED.task_name,
  element_ids = EXCLUDED.element_ids,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  predecessor_task_ids = EXCLUDED.predecessor_task_ids,
  updated_at = now();

INSERT INTO public.project_schedule (
  id, project_id, task_id, task_name, element_ids,
  start_date, end_date, predecessor_task_ids
) VALUES (
  '173b2d34-3d41-52ff-a049-85383b45f941',
  '2ef80c6c-0975-54e0-adc2-1506ef469229',
  'w4-t2',
  'External wall framing — north',
  '{"wall_external_north"}'::text[],
  '2026-06-23',
  '2026-06-24',
  '{"w4-t1"}'::text[]
) ON CONFLICT (project_id, task_id) DO UPDATE SET
  task_name = EXCLUDED.task_name,
  element_ids = EXCLUDED.element_ids,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  predecessor_task_ids = EXCLUDED.predecessor_task_ids,
  updated_at = now();

INSERT INTO public.project_schedule (
  id, project_id, task_id, task_name, element_ids,
  start_date, end_date, predecessor_task_ids
) VALUES (
  'd9148eba-337d-5cf1-8143-9698c6cb0f18',
  '2ef80c6c-0975-54e0-adc2-1506ef469229',
  'w4-t3',
  'External wall framing — east and west',
  '{"wall_external_east","wall_external_west"}'::text[],
  '2026-06-24',
  '2026-06-25',
  '{"w4-t2"}'::text[]
) ON CONFLICT (project_id, task_id) DO UPDATE SET
  task_name = EXCLUDED.task_name,
  element_ids = EXCLUDED.element_ids,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  predecessor_task_ids = EXCLUDED.predecessor_task_ids,
  updated_at = now();

INSERT INTO public.project_schedule (
  id, project_id, task_id, task_name, element_ids,
  start_date, end_date, predecessor_task_ids
) VALUES (
  '5d72cb76-edd9-5fe3-a109-40d47c696cfb',
  '2ef80c6c-0975-54e0-adc2-1506ef469229',
  'w4-t4',
  'Internal wall framing — north zones',
  '{"wall_internal_bedroom1_lounge","wall_internal_bedroom2_lounge"}'::text[],
  '2026-06-25',
  '2026-06-26',
  '{"w4-t3"}'::text[]
) ON CONFLICT (project_id, task_id) DO UPDATE SET
  task_name = EXCLUDED.task_name,
  element_ids = EXCLUDED.element_ids,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  predecessor_task_ids = EXCLUDED.predecessor_task_ids,
  updated_at = now();

INSERT INTO public.project_schedule (
  id, project_id, task_id, task_name, element_ids,
  start_date, end_date, predecessor_task_ids
) VALUES (
  '16864a35-742c-5056-937b-77b631bc1a94',
  '2ef80c6c-0975-54e0-adc2-1506ef469229',
  'w4-t5',
  'Internal wall framing — south zones',
  '{"wall_internal_bedroom1_bath","wall_internal_bedroom2_kitchen","wall_internal_bath_dining","wall_internal_kitchen_dining"}'::text[],
  '2026-06-26',
  '2026-06-26',
  '{"w4-t4"}'::text[]
) ON CONFLICT (project_id, task_id) DO UPDATE SET
  task_name = EXCLUDED.task_name,
  element_ids = EXCLUDED.element_ids,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  predecessor_task_ids = EXCLUDED.predecessor_task_ids,
  updated_at = now();

INSERT INTO public.project_schedule (
  id, project_id, task_id, task_name, element_ids,
  start_date, end_date, predecessor_task_ids
) VALUES (
  'a6b0b3e7-87c0-5945-bb9f-abedd142a297',
  '2ef80c6c-0975-54e0-adc2-1506ef469229',
  'w5-t1',
  'Pre-line compliance inspection',
  '{"wall_external_north","wall_external_south","wall_external_east","wall_external_west"}'::text[],
  '2026-06-29',
  '2026-06-29',
  '{"w4-t5"}'::text[]
) ON CONFLICT (project_id, task_id) DO UPDATE SET
  task_name = EXCLUDED.task_name,
  element_ids = EXCLUDED.element_ids,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  predecessor_task_ids = EXCLUDED.predecessor_task_ids,
  updated_at = now();

INSERT INTO public.project_schedule (
  id, project_id, task_id, task_name, element_ids,
  start_date, end_date, predecessor_task_ids
) VALUES (
  '534cb5b1-f39c-5004-8fb4-0e1be2235809',
  '2ef80c6c-0975-54e0-adc2-1506ef469229',
  'w5-t2',
  'Roof gable framing — south',
  '{"roof_gable_south"}'::text[],
  '2026-06-30',
  '2026-07-01',
  '{"w5-t1"}'::text[]
) ON CONFLICT (project_id, task_id) DO UPDATE SET
  task_name = EXCLUDED.task_name,
  element_ids = EXCLUDED.element_ids,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  predecessor_task_ids = EXCLUDED.predecessor_task_ids,
  updated_at = now();

INSERT INTO public.project_schedule (
  id, project_id, task_id, task_name, element_ids,
  start_date, end_date, predecessor_task_ids
) VALUES (
  '25fa0883-3451-56b8-9cfd-34c171df47e6',
  '2ef80c6c-0975-54e0-adc2-1506ef469229',
  'w5-t3',
  'Roof gable framing — north',
  '{"roof_gable_north"}'::text[],
  '2026-07-01',
  '2026-07-02',
  '{"w5-t2"}'::text[]
) ON CONFLICT (project_id, task_id) DO UPDATE SET
  task_name = EXCLUDED.task_name,
  element_ids = EXCLUDED.element_ids,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  predecessor_task_ids = EXCLUDED.predecessor_task_ids,
  updated_at = now();

INSERT INTO public.project_schedule (
  id, project_id, task_id, task_name, element_ids,
  start_date, end_date, predecessor_task_ids
) VALUES (
  '2cad44b3-611a-5425-80d7-0d3e77c27c9e',
  '2ef80c6c-0975-54e0-adc2-1506ef469229',
  'w5-t4',
  'Roof ridge install',
  '{"roof_ridge"}'::text[],
  '2026-07-02',
  '2026-07-03',
  '{"w5-t3"}'::text[]
) ON CONFLICT (project_id, task_id) DO UPDATE SET
  task_name = EXCLUDED.task_name,
  element_ids = EXCLUDED.element_ids,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  predecessor_task_ids = EXCLUDED.predecessor_task_ids,
  updated_at = now();

INSERT INTO public.project_schedule (
  id, project_id, task_id, task_name, element_ids,
  start_date, end_date, predecessor_task_ids
) VALUES (
  '309e786d-457e-5fce-8b30-a1053afa68de',
  '2ef80c6c-0975-54e0-adc2-1506ef469229',
  'w6-t1',
  'Roof fascia install',
  '{"roof_fascia_north","roof_fascia_south","roof_fascia_east","roof_fascia_west"}'::text[],
  '2026-07-06',
  '2026-07-07',
  '{"w5-t4"}'::text[]
) ON CONFLICT (project_id, task_id) DO UPDATE SET
  task_name = EXCLUDED.task_name,
  element_ids = EXCLUDED.element_ids,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  predecessor_task_ids = EXCLUDED.predecessor_task_ids,
  updated_at = now();

INSERT INTO public.project_schedule (
  id, project_id, task_id, task_name, element_ids,
  start_date, end_date, predecessor_task_ids
) VALUES (
  'f1c7e575-abb5-5a08-ba72-a9a76d684141',
  '2ef80c6c-0975-54e0-adc2-1506ef469229',
  'w6-t2',
  'Roof underlay install',
  '{"roof_gable_north","roof_gable_south"}'::text[],
  '2026-07-07',
  '2026-07-08',
  '{"w6-t1"}'::text[]
) ON CONFLICT (project_id, task_id) DO UPDATE SET
  task_name = EXCLUDED.task_name,
  element_ids = EXCLUDED.element_ids,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  predecessor_task_ids = EXCLUDED.predecessor_task_ids,
  updated_at = now();

INSERT INTO public.project_schedule (
  id, project_id, task_id, task_name, element_ids,
  start_date, end_date, predecessor_task_ids
) VALUES (
  '9417e85d-a119-5ce0-8999-bb81b2577d27',
  '2ef80c6c-0975-54e0-adc2-1506ef469229',
  'w6-t3',
  'Roof metal sheeting install',
  '{"roof_gable_north","roof_gable_south"}'::text[],
  '2026-07-08',
  '2026-07-09',
  '{"w6-t2"}'::text[]
) ON CONFLICT (project_id, task_id) DO UPDATE SET
  task_name = EXCLUDED.task_name,
  element_ids = EXCLUDED.element_ids,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  predecessor_task_ids = EXCLUDED.predecessor_task_ids,
  updated_at = now();

INSERT INTO public.project_schedule (
  id, project_id, task_id, task_name, element_ids,
  start_date, end_date, predecessor_task_ids
) VALUES (
  'b234a201-1256-5c04-8f9a-0bfdc94de35a',
  '2ef80c6c-0975-54e0-adc2-1506ef469229',
  'w6-t4',
  'Roof close-in compliance inspection',
  '{"roof_gable_north","roof_gable_south","roof_ridge"}'::text[],
  '2026-07-10',
  '2026-07-10',
  '{"w6-t3"}'::text[]
) ON CONFLICT (project_id, task_id) DO UPDATE SET
  task_name = EXCLUDED.task_name,
  element_ids = EXCLUDED.element_ids,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  predecessor_task_ids = EXCLUDED.predecessor_task_ids,
  updated_at = now();

INSERT INTO public.project_schedule (
  id, project_id, task_id, task_name, element_ids,
  start_date, end_date, predecessor_task_ids
) VALUES (
  'f60e5afb-1149-55d7-ad8e-06a77d174e50',
  '2ef80c6c-0975-54e0-adc2-1506ef469229',
  'w7-t1',
  'External wall building wrap',
  '{"wall_external_north","wall_external_south","wall_external_east","wall_external_west"}'::text[],
  '2026-07-13',
  '2026-07-14',
  '{"w6-t4"}'::text[]
) ON CONFLICT (project_id, task_id) DO UPDATE SET
  task_name = EXCLUDED.task_name,
  element_ids = EXCLUDED.element_ids,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  predecessor_task_ids = EXCLUDED.predecessor_task_ids,
  updated_at = now();

INSERT INTO public.project_schedule (
  id, project_id, task_id, task_name, element_ids,
  start_date, end_date, predecessor_task_ids
) VALUES (
  'e55091fe-cc1e-5340-a73d-0951aea132c8',
  '2ef80c6c-0975-54e0-adc2-1506ef469229',
  'w7-t2',
  'Vertical timber cladding — south',
  '{"wall_external_south"}'::text[],
  '2026-07-14',
  '2026-07-15',
  '{"w7-t1"}'::text[]
) ON CONFLICT (project_id, task_id) DO UPDATE SET
  task_name = EXCLUDED.task_name,
  element_ids = EXCLUDED.element_ids,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  predecessor_task_ids = EXCLUDED.predecessor_task_ids,
  updated_at = now();

INSERT INTO public.project_schedule (
  id, project_id, task_id, task_name, element_ids,
  start_date, end_date, predecessor_task_ids
) VALUES (
  '2ff101b8-a97a-53c6-9982-f87e6c101401',
  '2ef80c6c-0975-54e0-adc2-1506ef469229',
  'w7-t3',
  'Vertical timber cladding — north',
  '{"wall_external_north"}'::text[],
  '2026-07-15',
  '2026-07-16',
  '{"w7-t2"}'::text[]
) ON CONFLICT (project_id, task_id) DO UPDATE SET
  task_name = EXCLUDED.task_name,
  element_ids = EXCLUDED.element_ids,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  predecessor_task_ids = EXCLUDED.predecessor_task_ids,
  updated_at = now();

INSERT INTO public.project_schedule (
  id, project_id, task_id, task_name, element_ids,
  start_date, end_date, predecessor_task_ids
) VALUES (
  'a6c77c0f-fa1b-52df-bca9-653b0edeb5a3',
  '2ef80c6c-0975-54e0-adc2-1506ef469229',
  'w7-t4',
  'Vertical timber cladding — east and west',
  '{"wall_external_east","wall_external_west"}'::text[],
  '2026-07-16',
  '2026-07-17',
  '{"w7-t3"}'::text[]
) ON CONFLICT (project_id, task_id) DO UPDATE SET
  task_name = EXCLUDED.task_name,
  element_ids = EXCLUDED.element_ids,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  predecessor_task_ids = EXCLUDED.predecessor_task_ids,
  updated_at = now();

INSERT INTO public.project_schedule (
  id, project_id, task_id, task_name, element_ids,
  start_date, end_date, predecessor_task_ids
) VALUES (
  'c98c620d-3ad7-507f-b147-b95da15ccb87',
  '2ef80c6c-0975-54e0-adc2-1506ef469229',
  'w8-t1',
  'Window install — north face',
  '{"window_lounge_north","window_bedroom1_north","window_bedroom2_north"}'::text[],
  '2026-07-20',
  '2026-07-21',
  '{"w7-t4"}'::text[]
) ON CONFLICT (project_id, task_id) DO UPDATE SET
  task_name = EXCLUDED.task_name,
  element_ids = EXCLUDED.element_ids,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  predecessor_task_ids = EXCLUDED.predecessor_task_ids,
  updated_at = now();

INSERT INTO public.project_schedule (
  id, project_id, task_id, task_name, element_ids,
  start_date, end_date, predecessor_task_ids
) VALUES (
  'ea534ebe-c8af-5b14-8687-a4d793ba769d',
  '2ef80c6c-0975-54e0-adc2-1506ef469229',
  'w8-t2',
  'Window install — south face',
  '{"window_dining_south","window_kitchen_south"}'::text[],
  '2026-07-21',
  '2026-07-22',
  '{"w8-t1"}'::text[]
) ON CONFLICT (project_id, task_id) DO UPDATE SET
  task_name = EXCLUDED.task_name,
  element_ids = EXCLUDED.element_ids,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  predecessor_task_ids = EXCLUDED.predecessor_task_ids,
  updated_at = now();

INSERT INTO public.project_schedule (
  id, project_id, task_id, task_name, element_ids,
  start_date, end_date, predecessor_task_ids
) VALUES (
  '2767ea2d-eff7-589b-83ce-3ddfaeb27ff9',
  '2ef80c6c-0975-54e0-adc2-1506ef469229',
  'w8-t3',
  'Window install — east and west',
  '{"window_bedroom1_west","window_bath_west","window_bedroom2_east"}'::text[],
  '2026-07-22',
  '2026-07-23',
  '{"w8-t2"}'::text[]
) ON CONFLICT (project_id, task_id) DO UPDATE SET
  task_name = EXCLUDED.task_name,
  element_ids = EXCLUDED.element_ids,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  predecessor_task_ids = EXCLUDED.predecessor_task_ids,
  updated_at = now();

INSERT INTO public.project_schedule (
  id, project_id, task_id, task_name, element_ids,
  start_date, end_date, predecessor_task_ids
) VALUES (
  '050de641-cdea-5329-afd6-e2fe1d571a3b',
  '2ef80c6c-0975-54e0-adc2-1506ef469229',
  'w8-t4',
  'External door install — main entry',
  '{"door_main_entry"}'::text[],
  '2026-07-23',
  '2026-07-23',
  '{"w8-t3"}'::text[]
) ON CONFLICT (project_id, task_id) DO UPDATE SET
  task_name = EXCLUDED.task_name,
  element_ids = EXCLUDED.element_ids,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  predecessor_task_ids = EXCLUDED.predecessor_task_ids,
  updated_at = now();

INSERT INTO public.project_schedule (
  id, project_id, task_id, task_name, element_ids,
  start_date, end_date, predecessor_task_ids
) VALUES (
  '293161e4-b29a-5aee-aeb2-5804ab75d48d',
  '2ef80c6c-0975-54e0-adc2-1506ef469229',
  'w8-t5',
  'External door install — dining slider',
  '{"door_dining_slider"}'::text[],
  '2026-07-24',
  '2026-07-24',
  '{"w8-t4"}'::text[]
) ON CONFLICT (project_id, task_id) DO UPDATE SET
  task_name = EXCLUDED.task_name,
  element_ids = EXCLUDED.element_ids,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  predecessor_task_ids = EXCLUDED.predecessor_task_ids,
  updated_at = now();

INSERT INTO public.project_schedule (
  id, project_id, task_id, task_name, element_ids,
  start_date, end_date, predecessor_task_ids
) VALUES (
  '26b57129-03ba-55e4-ba76-dd88287580e5',
  '2ef80c6c-0975-54e0-adc2-1506ef469229',
  'w9-t1',
  'Insulation install — walls and ceiling',
  '{"ceiling_main","wall_external_north","wall_external_south","wall_external_east","wall_external_west"}'::text[],
  '2026-07-27',
  '2026-07-28',
  '{"w8-t5"}'::text[]
) ON CONFLICT (project_id, task_id) DO UPDATE SET
  task_name = EXCLUDED.task_name,
  element_ids = EXCLUDED.element_ids,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  predecessor_task_ids = EXCLUDED.predecessor_task_ids,
  updated_at = now();

INSERT INTO public.project_schedule (
  id, project_id, task_id, task_name, element_ids,
  start_date, end_date, predecessor_task_ids
) VALUES (
  '61ce8a7e-d641-5cb0-b5f9-ed0895b0e40a',
  '2ef80c6c-0975-54e0-adc2-1506ef469229',
  'w9-t2',
  'Plasterboard linings install',
  '{"wall_internal_bedroom1_lounge","wall_internal_bedroom2_lounge","wall_internal_bedroom1_bath","wall_internal_bedroom2_kitchen","wall_internal_bath_dining","wall_internal_kitchen_dining"}'::text[],
  '2026-07-28',
  '2026-07-29',
  '{"w9-t1"}'::text[]
) ON CONFLICT (project_id, task_id) DO UPDATE SET
  task_name = EXCLUDED.task_name,
  element_ids = EXCLUDED.element_ids,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  predecessor_task_ids = EXCLUDED.predecessor_task_ids,
  updated_at = now();

INSERT INTO public.project_schedule (
  id, project_id, task_id, task_name, element_ids,
  start_date, end_date, predecessor_task_ids
) VALUES (
  '907dde01-7699-5143-a482-6a6fda1ca79f',
  '2ef80c6c-0975-54e0-adc2-1506ef469229',
  'w9-t3',
  'Ceiling install',
  '{"ceiling_main"}'::text[],
  '2026-07-29',
  '2026-07-30',
  '{"w9-t2"}'::text[]
) ON CONFLICT (project_id, task_id) DO UPDATE SET
  task_name = EXCLUDED.task_name,
  element_ids = EXCLUDED.element_ids,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  predecessor_task_ids = EXCLUDED.predecessor_task_ids,
  updated_at = now();

INSERT INTO public.project_schedule (
  id, project_id, task_id, task_name, element_ids,
  start_date, end_date, predecessor_task_ids
) VALUES (
  '5cafb379-82ea-52aa-a0a4-763ed8e6d2ca',
  '2ef80c6c-0975-54e0-adc2-1506ef469229',
  'w9-t4',
  'Stopping and finishing',
  '{"ceiling_main"}'::text[],
  '2026-07-30',
  '2026-07-31',
  '{"w9-t3"}'::text[]
) ON CONFLICT (project_id, task_id) DO UPDATE SET
  task_name = EXCLUDED.task_name,
  element_ids = EXCLUDED.element_ids,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  predecessor_task_ids = EXCLUDED.predecessor_task_ids,
  updated_at = now();

INSERT INTO public.project_schedule (
  id, project_id, task_id, task_name, element_ids,
  start_date, end_date, predecessor_task_ids
) VALUES (
  'b03570ef-a73e-5306-9dd8-781afd4c4c80',
  '2ef80c6c-0975-54e0-adc2-1506ef469229',
  'w10-t1',
  'Internal doors install',
  '{"door_bathroom","door_bedroom1","door_bedroom2"}'::text[],
  '2026-08-03',
  '2026-08-04',
  '{"w9-t4"}'::text[]
) ON CONFLICT (project_id, task_id) DO UPDATE SET
  task_name = EXCLUDED.task_name,
  element_ids = EXCLUDED.element_ids,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  predecessor_task_ids = EXCLUDED.predecessor_task_ids,
  updated_at = now();

INSERT INTO public.project_schedule (
  id, project_id, task_id, task_name, element_ids,
  start_date, end_date, predecessor_task_ids
) VALUES (
  '2e2d334f-0ac6-57ba-b686-66558096f147',
  '2ef80c6c-0975-54e0-adc2-1506ef469229',
  'w10-t2',
  'Bathroom fixtures install',
  '{"fixture_bath_toilet","fixture_bath_shower","fixture_bath_basin"}'::text[],
  '2026-08-04',
  '2026-08-05',
  '{"w10-t1"}'::text[]
) ON CONFLICT (project_id, task_id) DO UPDATE SET
  task_name = EXCLUDED.task_name,
  element_ids = EXCLUDED.element_ids,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  predecessor_task_ids = EXCLUDED.predecessor_task_ids,
  updated_at = now();

INSERT INTO public.project_schedule (
  id, project_id, task_id, task_name, element_ids,
  start_date, end_date, predecessor_task_ids
) VALUES (
  '2ca79f66-ccd4-5aeb-b227-fc8f6447b80d',
  '2ef80c6c-0975-54e0-adc2-1506ef469229',
  'w10-t3',
  'Kitchen fixtures install',
  '{"fixture_kitchen_bench","fixture_kitchen_sink"}'::text[],
  '2026-08-05',
  '2026-08-06',
  '{"w10-t2"}'::text[]
) ON CONFLICT (project_id, task_id) DO UPDATE SET
  task_name = EXCLUDED.task_name,
  element_ids = EXCLUDED.element_ids,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  predecessor_task_ids = EXCLUDED.predecessor_task_ids,
  updated_at = now();

INSERT INTO public.project_schedule (
  id, project_id, task_id, task_name, element_ids,
  start_date, end_date, predecessor_task_ids
) VALUES (
  '47edaf93-5200-506f-b3b6-2ecae82a4c6b',
  '2ef80c6c-0975-54e0-adc2-1506ef469229',
  'w10-t4',
  'Hot water cylinder install',
  '{"fixture_hot_water_cylinder"}'::text[],
  '2026-08-06',
  '2026-08-06',
  '{"w10-t3"}'::text[]
) ON CONFLICT (project_id, task_id) DO UPDATE SET
  task_name = EXCLUDED.task_name,
  element_ids = EXCLUDED.element_ids,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  predecessor_task_ids = EXCLUDED.predecessor_task_ids,
  updated_at = now();

INSERT INTO public.project_schedule (
  id, project_id, task_id, task_name, element_ids,
  start_date, end_date, predecessor_task_ids
) VALUES (
  '9a19169b-3055-55ac-8956-d331fcb866da',
  '2ef80c6c-0975-54e0-adc2-1506ef469229',
  'w10-t5',
  'Plumbing connection and pressure test',
  '{"fixture_hot_water_cylinder","fixture_bath_shower","fixture_bath_basin","fixture_kitchen_sink"}'::text[],
  '2026-08-07',
  '2026-08-07',
  '{"w10-t4"}'::text[]
) ON CONFLICT (project_id, task_id) DO UPDATE SET
  task_name = EXCLUDED.task_name,
  element_ids = EXCLUDED.element_ids,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  predecessor_task_ids = EXCLUDED.predecessor_task_ids,
  updated_at = now();

INSERT INTO public.project_schedule (
  id, project_id, task_id, task_name, element_ids,
  start_date, end_date, predecessor_task_ids
) VALUES (
  'a78843c8-2112-5da5-80df-0381f14ab66c',
  '2ef80c6c-0975-54e0-adc2-1506ef469229',
  'w11-t1',
  'Deck construction — south entry',
  '{"deck_south"}'::text[],
  '2026-08-10',
  '2026-08-11',
  '{"w10-t5"}'::text[]
) ON CONFLICT (project_id, task_id) DO UPDATE SET
  task_name = EXCLUDED.task_name,
  element_ids = EXCLUDED.element_ids,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  predecessor_task_ids = EXCLUDED.predecessor_task_ids,
  updated_at = now();

INSERT INTO public.project_schedule (
  id, project_id, task_id, task_name, element_ids,
  start_date, end_date, predecessor_task_ids
) VALUES (
  '65458cdc-6652-5b3b-bd7b-36e4f8e5023d',
  '2ef80c6c-0975-54e0-adc2-1506ef469229',
  'w11-t2',
  'Deck construction — north',
  '{"deck_north"}'::text[],
  '2026-08-11',
  '2026-08-13',
  '{"w11-t1"}'::text[]
) ON CONFLICT (project_id, task_id) DO UPDATE SET
  task_name = EXCLUDED.task_name,
  element_ids = EXCLUDED.element_ids,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  predecessor_task_ids = EXCLUDED.predecessor_task_ids,
  updated_at = now();

INSERT INTO public.project_schedule (
  id, project_id, task_id, task_name, element_ids,
  start_date, end_date, predecessor_task_ids
) VALUES (
  'c9d3b026-c7de-57a5-bdb1-7348c0712b80',
  '2ef80c6c-0975-54e0-adc2-1506ef469229',
  'w11-t3',
  'Final finishes and handover',
  '{}'::text[],
  '2026-08-13',
  '2026-08-14',
  '{"w11-t2"}'::text[]
) ON CONFLICT (project_id, task_id) DO UPDATE SET
  task_name = EXCLUDED.task_name,
  element_ids = EXCLUDED.element_ids,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  predecessor_task_ids = EXCLUDED.predecessor_task_ids,
  updated_at = now();

-- ════════════════════════════════════════════════════════════════════
-- End of seed migration. Apply via SUPABASE_BETA_RUN_SQL_QUERY post-merge.
--
-- Verification queries (post-apply):
--   SELECT count(*) FROM public.bim_models;       -- expect 2
--   SELECT count(*) FROM public.bim_overlays;     -- expect 17
--   SELECT count(*) FROM public.project_schedule; -- expect 47
--   SELECT severity, count(*) FROM public.bim_overlays
--     WHERE project_id = '2ef80c6c-0975-54e0-adc2-1506ef469229'
--     GROUP BY severity;                          -- expect 3 non_compliant, 6 review, 5 passing
--   SELECT count(*) FROM public.bim_overlays
--     WHERE project_id = '7dee0a31-f3f0-5928-b021-ec477d5cf6d8'
--     AND severity = 'halt';                      -- expect 3
--
-- Storage assets (uploaded out-of-band post-Kate-drop):
--   bim-models/2ef80c6c-0975-54e0-adc2-1506ef469229/model.glb              (~53 KB Draco-compressed glb)
--   bim-models/demo-assets/hero-variant-1.png             (wide cinematic, south-east)
--   bim-models/demo-assets/hero-variant-2-north-deck.png  (north garden, F4 truthful)
--   bim-models/demo-assets/hero-variant-3-south-entry.png (south entry close-in)
--   bim-models/2ef80c6c-0975-54e0-adc2-1506ef469229/flythrough-silent.mp4  (90s, render in PR-B follow-up)
--   bim-models/2ef80c6c-0975-54e0-adc2-1506ef469229/flythrough.mp4         (narrated, AUAHA delivers)
-- ════════════════════════════════════════════════════════════════════
