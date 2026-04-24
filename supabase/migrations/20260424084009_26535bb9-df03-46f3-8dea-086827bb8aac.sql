-- Tōro Homework: enable family-member access to homework + focus session tables
-- so the /toro/homework page can read/write under the authenticated user's JWT.

-- ── toroa_homework ───────────────────────────────────────────────
ALTER TABLE public.toroa_homework ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Family members can view homework" ON public.toroa_homework;
CREATE POLICY "Family members can view homework"
ON public.toroa_homework FOR SELECT
TO authenticated
USING (public.is_family_member(auth.uid(), family_id));

DROP POLICY IF EXISTS "Family members can insert homework" ON public.toroa_homework;
CREATE POLICY "Family members can insert homework"
ON public.toroa_homework FOR INSERT
TO authenticated
WITH CHECK (public.is_family_member(auth.uid(), family_id));

DROP POLICY IF EXISTS "Family members can update homework" ON public.toroa_homework;
CREATE POLICY "Family members can update homework"
ON public.toroa_homework FOR UPDATE
TO authenticated
USING (public.is_family_member(auth.uid(), family_id))
WITH CHECK (public.is_family_member(auth.uid(), family_id));

DROP POLICY IF EXISTS "Family members can delete homework" ON public.toroa_homework;
CREATE POLICY "Family members can delete homework"
ON public.toroa_homework FOR DELETE
TO authenticated
USING (public.is_family_member(auth.uid(), family_id));

-- ── toroa_focus_sessions (Pomodoro) ──────────────────────────────
ALTER TABLE public.toroa_focus_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Family members can view focus sessions" ON public.toroa_focus_sessions;
CREATE POLICY "Family members can view focus sessions"
ON public.toroa_focus_sessions FOR SELECT
TO authenticated
USING (public.is_family_member(auth.uid(), family_id));

DROP POLICY IF EXISTS "Family members can insert focus sessions" ON public.toroa_focus_sessions;
CREATE POLICY "Family members can insert focus sessions"
ON public.toroa_focus_sessions FOR INSERT
TO authenticated
WITH CHECK (public.is_family_member(auth.uid(), family_id));

DROP POLICY IF EXISTS "Family members can update focus sessions" ON public.toroa_focus_sessions;
CREATE POLICY "Family members can update focus sessions"
ON public.toroa_focus_sessions FOR UPDATE
TO authenticated
USING (public.is_family_member(auth.uid(), family_id))
WITH CHECK (public.is_family_member(auth.uid(), family_id));

-- Performance indexes
CREATE INDEX IF NOT EXISTS toroa_homework_family_due_idx
  ON public.toroa_homework (family_id, due_date);
CREATE INDEX IF NOT EXISTS toroa_homework_child_status_idx
  ON public.toroa_homework (child_id, status);
CREATE INDEX IF NOT EXISTS toroa_focus_sessions_child_started_idx
  ON public.toroa_focus_sessions (child_id, started_at DESC);
CREATE INDEX IF NOT EXISTS toroa_focus_sessions_family_started_idx
  ON public.toroa_focus_sessions (family_id, started_at DESC);