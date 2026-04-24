-- Tōro: open up authenticated-user RLS for child-scoped tables so
-- AddChildModal, EditChildModal, TimetableGrid, GearListChecklist work in-browser.
-- All access is gated through public.is_family_member(auth.uid(), family_id)
-- which is a SECURITY DEFINER helper that already exists.

-- ── toroa_children ───────────────────────────────────────────────
ALTER TABLE public.toroa_children ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Family members can view children" ON public.toroa_children;
CREATE POLICY "Family members can view children"
ON public.toroa_children FOR SELECT
TO authenticated
USING (public.is_family_member(auth.uid(), family_id));

DROP POLICY IF EXISTS "Family members can insert children" ON public.toroa_children;
CREATE POLICY "Family members can insert children"
ON public.toroa_children FOR INSERT
TO authenticated
WITH CHECK (public.is_family_member(auth.uid(), family_id));

DROP POLICY IF EXISTS "Family members can update children" ON public.toroa_children;
CREATE POLICY "Family members can update children"
ON public.toroa_children FOR UPDATE
TO authenticated
USING (public.is_family_member(auth.uid(), family_id))
WITH CHECK (public.is_family_member(auth.uid(), family_id));

DROP POLICY IF EXISTS "Family members can delete children" ON public.toroa_children;
CREATE POLICY "Family members can delete children"
ON public.toroa_children FOR DELETE
TO authenticated
USING (public.is_family_member(auth.uid(), family_id));

-- ── toroa_child_timetables ───────────────────────────────────────
ALTER TABLE public.toroa_child_timetables ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Family members can view timetables" ON public.toroa_child_timetables;
CREATE POLICY "Family members can view timetables"
ON public.toroa_child_timetables FOR SELECT
TO authenticated
USING (public.is_family_member(auth.uid(), family_id));

DROP POLICY IF EXISTS "Family members can insert timetables" ON public.toroa_child_timetables;
CREATE POLICY "Family members can insert timetables"
ON public.toroa_child_timetables FOR INSERT
TO authenticated
WITH CHECK (public.is_family_member(auth.uid(), family_id));

DROP POLICY IF EXISTS "Family members can update timetables" ON public.toroa_child_timetables;
CREATE POLICY "Family members can update timetables"
ON public.toroa_child_timetables FOR UPDATE
TO authenticated
USING (public.is_family_member(auth.uid(), family_id))
WITH CHECK (public.is_family_member(auth.uid(), family_id));

DROP POLICY IF EXISTS "Family members can delete timetables" ON public.toroa_child_timetables;
CREATE POLICY "Family members can delete timetables"
ON public.toroa_child_timetables FOR DELETE
TO authenticated
USING (public.is_family_member(auth.uid(), family_id));

-- ── toroa_gear_lists ─────────────────────────────────────────────
ALTER TABLE public.toroa_gear_lists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Family members can view gear lists" ON public.toroa_gear_lists;
CREATE POLICY "Family members can view gear lists"
ON public.toroa_gear_lists FOR SELECT
TO authenticated
USING (public.is_family_member(auth.uid(), family_id));

DROP POLICY IF EXISTS "Family members can insert gear lists" ON public.toroa_gear_lists;
CREATE POLICY "Family members can insert gear lists"
ON public.toroa_gear_lists FOR INSERT
TO authenticated
WITH CHECK (public.is_family_member(auth.uid(), family_id));

DROP POLICY IF EXISTS "Family members can update gear lists" ON public.toroa_gear_lists;
CREATE POLICY "Family members can update gear lists"
ON public.toroa_gear_lists FOR UPDATE
TO authenticated
USING (public.is_family_member(auth.uid(), family_id))
WITH CHECK (public.is_family_member(auth.uid(), family_id));

DROP POLICY IF EXISTS "Family members can delete gear lists" ON public.toroa_gear_lists;
CREATE POLICY "Family members can delete gear lists"
ON public.toroa_gear_lists FOR DELETE
TO authenticated
USING (public.is_family_member(auth.uid(), family_id));

-- ── Helpful indexes for the dashboard queries ────────────────────
CREATE INDEX IF NOT EXISTS toroa_email_flags_user_status_idx
  ON public.toroa_email_flags (user_id, status);

CREATE INDEX IF NOT EXISTS toroa_school_reports_user_idx
  ON public.toroa_school_reports (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS toroa_children_family_idx
  ON public.toroa_children (family_id);

CREATE INDEX IF NOT EXISTS toroa_child_timetables_family_idx
  ON public.toroa_child_timetables (family_id);

CREATE INDEX IF NOT EXISTS toroa_gear_lists_family_idx
  ON public.toroa_gear_lists (family_id);