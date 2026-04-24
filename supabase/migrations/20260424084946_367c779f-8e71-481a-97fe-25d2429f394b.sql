-- ============================================================
-- TŌRO HEALTH — RLS, STORAGE & WIRING
-- ============================================================
-- 1. Enable family-member CRUD on health tables
-- 2. Allow read on the NZ immunisation template (public reference data)
-- 3. Storage bucket for health documents (private, family-scoped)
-- 4. Performance indexes
-- ============================================================

-- ---- 1. RLS POLICIES — toroa_health_records ----------------
DROP POLICY IF EXISTS "Family members can view health records" ON public.toroa_health_records;
DROP POLICY IF EXISTS "Family members can insert health records" ON public.toroa_health_records;
DROP POLICY IF EXISTS "Family members can update health records" ON public.toroa_health_records;
DROP POLICY IF EXISTS "Family members can delete health records" ON public.toroa_health_records;

CREATE POLICY "Family members can view health records"
  ON public.toroa_health_records FOR SELECT
  TO authenticated
  USING (public.is_family_member(auth.uid(), family_id));

CREATE POLICY "Family members can insert health records"
  ON public.toroa_health_records FOR INSERT
  TO authenticated
  WITH CHECK (public.is_family_member(auth.uid(), family_id));

CREATE POLICY "Family members can update health records"
  ON public.toroa_health_records FOR UPDATE
  TO authenticated
  USING (public.is_family_member(auth.uid(), family_id))
  WITH CHECK (public.is_family_member(auth.uid(), family_id));

CREATE POLICY "Family members can delete health records"
  ON public.toroa_health_records FOR DELETE
  TO authenticated
  USING (public.is_family_member(auth.uid(), family_id));

-- ---- RLS POLICIES — toroa_immunisation_schedule ------------
DROP POLICY IF EXISTS "Family members can view immunisations" ON public.toroa_immunisation_schedule;
DROP POLICY IF EXISTS "Family members can insert immunisations" ON public.toroa_immunisation_schedule;
DROP POLICY IF EXISTS "Family members can update immunisations" ON public.toroa_immunisation_schedule;
DROP POLICY IF EXISTS "Family members can delete immunisations" ON public.toroa_immunisation_schedule;

CREATE POLICY "Family members can view immunisations"
  ON public.toroa_immunisation_schedule FOR SELECT
  TO authenticated
  USING (public.is_family_member(auth.uid(), family_id));

CREATE POLICY "Family members can insert immunisations"
  ON public.toroa_immunisation_schedule FOR INSERT
  TO authenticated
  WITH CHECK (public.is_family_member(auth.uid(), family_id));

CREATE POLICY "Family members can update immunisations"
  ON public.toroa_immunisation_schedule FOR UPDATE
  TO authenticated
  USING (public.is_family_member(auth.uid(), family_id))
  WITH CHECK (public.is_family_member(auth.uid(), family_id));

CREATE POLICY "Family members can delete immunisations"
  ON public.toroa_immunisation_schedule FOR DELETE
  TO authenticated
  USING (public.is_family_member(auth.uid(), family_id));

-- ---- RLS — toroa_nz_immunisation_template (read-only ref) --
DROP POLICY IF EXISTS "Authenticated users can view NZ immunisation template" ON public.toroa_nz_immunisation_template;
CREATE POLICY "Authenticated users can view NZ immunisation template"
  ON public.toroa_nz_immunisation_template FOR SELECT
  TO authenticated
  USING (true);

-- ---- 2. STORAGE BUCKET FOR HEALTH DOCUMENTS ----------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('toro-health', 'toro-health', false)
ON CONFLICT (id) DO NOTHING;

-- Path convention: {family_id}/{record_id}/{filename}
DROP POLICY IF EXISTS "Family members can read their health docs" ON storage.objects;
DROP POLICY IF EXISTS "Family members can upload health docs" ON storage.objects;
DROP POLICY IF EXISTS "Family members can update health docs" ON storage.objects;
DROP POLICY IF EXISTS "Family members can delete health docs" ON storage.objects;

CREATE POLICY "Family members can read their health docs"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'toro-health'
    AND public.is_family_member(auth.uid(), ((storage.foldername(name))[1])::uuid)
  );

CREATE POLICY "Family members can upload health docs"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'toro-health'
    AND public.is_family_member(auth.uid(), ((storage.foldername(name))[1])::uuid)
  );

CREATE POLICY "Family members can update health docs"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'toro-health'
    AND public.is_family_member(auth.uid(), ((storage.foldername(name))[1])::uuid)
  );

CREATE POLICY "Family members can delete health docs"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'toro-health'
    AND public.is_family_member(auth.uid(), ((storage.foldername(name))[1])::uuid)
  );

-- ---- 3. PERFORMANCE INDEXES --------------------------------
CREATE INDEX IF NOT EXISTS idx_toroa_health_records_family
  ON public.toroa_health_records (family_id, deleted_at);

CREATE INDEX IF NOT EXISTS idx_toroa_health_records_next_due
  ON public.toroa_health_records (family_id, next_due)
  WHERE next_due IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_toroa_health_records_child
  ON public.toroa_health_records (child_id)
  WHERE child_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_toroa_immunisation_family_child
  ON public.toroa_immunisation_schedule (family_id, child_id);

CREATE INDEX IF NOT EXISTS idx_toroa_immunisation_status
  ON public.toroa_immunisation_schedule (family_id, status, scheduled_date);

-- ---- 4. updated_at TRIGGERS --------------------------------
DROP TRIGGER IF EXISTS trg_toroa_health_records_updated_at ON public.toroa_health_records;
CREATE TRIGGER trg_toroa_health_records_updated_at
BEFORE UPDATE ON public.toroa_health_records
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_toroa_immunisation_updated_at ON public.toroa_immunisation_schedule;
CREATE TRIGGER trg_toroa_immunisation_updated_at
BEFORE UPDATE ON public.toroa_immunisation_schedule
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();