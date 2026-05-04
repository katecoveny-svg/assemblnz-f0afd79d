-- ════════════════════════════════════════════════════════════════════
-- ATA Demo · Tier 1 BIM infrastructure (additive, idempotent)
-- ════════════════════════════════════════════════════════════════════
-- Brief:  cmorswvj502bt06adftd0eqgc · section 3 (PR-A)
-- Spec:   cmorq8c2v006007ad9ew8ita0 · section 6
-- Author: Kaihanga <kaihanga@assembl.local>
-- Scope:  3 new tables (bim_models, bim_overlays, project_schedule)
--         + indexes + RLS + tenant-scoped read / service-role write
-- ════════════════════════════════════════════════════════════════════
-- Domain disclaimer (TA-3): This is an AI-assisted BIM coordination
-- output. Final dimensional and compliance verification rests with the
-- project architect, engineer, and BIM manager. Final consent
-- determination rests with the relevant Building Consent Authority.
-- ════════════════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────────────────────────
-- Table: bim_models
-- One row per source-document → glb conversion.
-- ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bim_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  tenant_id uuid NOT NULL,
  source_tier text NOT NULL CHECK (source_tier IN (
    'tier1_structify',
    'tier2_speckle',
    'tier2_ifc',
    'tier2_revit_gltf'
  )),
  source_url text,
  glb_url text,
  geo_json_url text,
  element_count integer,
  tolerance_mm integer NOT NULL DEFAULT 25,
  processing_status text NOT NULL DEFAULT 'pending' CHECK (processing_status IN (
    'pending',
    'processing',
    'complete',
    'failed',
    'tikanga_halt'
  )),
  warnings jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS bim_models_project_id_idx
  ON public.bim_models(project_id);

CREATE INDEX IF NOT EXISTS bim_models_tenant_id_idx
  ON public.bim_models(tenant_id);

-- ────────────────────────────────────────────────────────────────────
-- Table: bim_overlays
-- Compliance / tikanga / safety / as-built flags mapped to elements.
-- ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bim_overlays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bim_model_id uuid NOT NULL REFERENCES public.bim_models(id) ON DELETE CASCADE,
  project_id uuid NOT NULL,
  overlay_type text NOT NULL CHECK (overlay_type IN (
    'compliance',
    'tikanga',
    'safety',
    'as_built_deviation'
  )),
  element_id text NOT NULL,
  severity text NOT NULL CHECK (severity IN (
    'passing',
    'review',
    'non_compliant',
    'halt'
  )),
  citation text,
  citation_edition text,
  evidence_pack_ref text,
  has_personal_information boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS bim_overlays_bim_model_id_idx
  ON public.bim_overlays(bim_model_id);

CREATE INDEX IF NOT EXISTS bim_overlays_project_id_idx
  ON public.bim_overlays(project_id);

CREATE INDEX IF NOT EXISTS bim_overlays_severity_active_idx
  ON public.bim_overlays(severity)
  WHERE severity IN ('non_compliant', 'halt');

-- ────────────────────────────────────────────────────────────────────
-- Table: project_schedule
-- 4D programme data feeding xeokit CameraPathAnimation.
-- ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.project_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  task_id text NOT NULL,
  task_name text NOT NULL,
  element_ids text[] NOT NULL DEFAULT '{}',
  start_date date NOT NULL,
  end_date date NOT NULL,
  predecessor_task_ids text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT project_schedule_project_task_unique UNIQUE (project_id, task_id)
);

CREATE INDEX IF NOT EXISTS project_schedule_project_id_idx
  ON public.project_schedule(project_id);

-- ────────────────────────────────────────────────────────────────────
-- updated_at trigger function (shared, IF NOT EXISTS safe pattern)
-- ────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS bim_models_set_updated_at ON public.bim_models;
CREATE TRIGGER bim_models_set_updated_at
  BEFORE UPDATE ON public.bim_models
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS project_schedule_set_updated_at ON public.project_schedule;
CREATE TRIGGER project_schedule_set_updated_at
  BEFORE UPDATE ON public.project_schedule
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ────────────────────────────────────────────────────────────────────
-- Row Level Security
-- Tenant-scoped read for authenticated users via tenant_members.
-- service_role retains full read/write for Edge Function paths.
-- ────────────────────────────────────────────────────────────────────
ALTER TABLE public.bim_models      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bim_overlays    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_schedule ENABLE ROW LEVEL SECURITY;

-- bim_models policies
DROP POLICY IF EXISTS bim_models_tenant_read ON public.bim_models;
CREATE POLICY bim_models_tenant_read
  ON public.bim_models
  FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id
      FROM public.tenant_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS bim_models_service_write ON public.bim_models;
CREATE POLICY bim_models_service_write
  ON public.bim_models
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- bim_overlays policies
DROP POLICY IF EXISTS bim_overlays_tenant_read ON public.bim_overlays;
CREATE POLICY bim_overlays_tenant_read
  ON public.bim_overlays
  FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT project_id
      FROM public.bim_models
      WHERE tenant_id IN (
        SELECT tenant_id
        FROM public.tenant_members
        WHERE user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS bim_overlays_service_write ON public.bim_overlays;
CREATE POLICY bim_overlays_service_write
  ON public.bim_overlays
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- project_schedule policies
DROP POLICY IF EXISTS project_schedule_tenant_read ON public.project_schedule;
CREATE POLICY project_schedule_tenant_read
  ON public.project_schedule
  FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT project_id
      FROM public.bim_models
      WHERE tenant_id IN (
        SELECT tenant_id
        FROM public.tenant_members
        WHERE user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS project_schedule_service_write ON public.project_schedule;
CREATE POLICY project_schedule_service_write
  ON public.project_schedule
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ════════════════════════════════════════════════════════════════════
-- End of migration. Apply via SUPABASE_BETA_RUN_SQL_QUERY post-merge
-- (repo has no migration CI; pattern is: merge PR-A → run SQL → verify
-- 3 tables + 6 policies present → provision Storage bucket via
-- Composio → smoke-test ata-bim function OPTIONS).
-- ════════════════════════════════════════════════════════════════════
