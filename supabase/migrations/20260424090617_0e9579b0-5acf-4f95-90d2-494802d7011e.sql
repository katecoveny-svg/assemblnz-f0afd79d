-- Tōro journal entries: guided journaling with prompts, mood, and parent visibility
CREATE TABLE IF NOT EXISTS public.toroa_journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES public.toroa_families(id) ON DELETE CASCADE,
  child_id uuid REFERENCES public.toroa_children(id) ON DELETE SET NULL,
  author_user_id uuid,
  author_name text,
  entry_date date NOT NULL DEFAULT CURRENT_DATE,
  mood text CHECK (mood IN ('joyful','calm','okay','tired','worried','sad','frustrated')),
  energy_level integer CHECK (energy_level BETWEEN 1 AND 5),
  gratitude text,
  highlight text,
  challenge text,
  tomorrow_focus text,
  prompt_used text,
  shared_with_parent boolean NOT NULL DEFAULT true,
  is_private boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_toroa_journal_family_date
  ON public.toroa_journal_entries (family_id, entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_toroa_journal_child
  ON public.toroa_journal_entries (child_id);

ALTER TABLE public.toroa_journal_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "journal_family_read" ON public.toroa_journal_entries;
CREATE POLICY "journal_family_read"
  ON public.toroa_journal_entries
  FOR SELECT
  TO authenticated
  USING (
    public.is_family_member(auth.uid(), family_id)
    AND (is_private = false OR author_user_id = auth.uid())
  );

DROP POLICY IF EXISTS "journal_family_insert" ON public.toroa_journal_entries;
CREATE POLICY "journal_family_insert"
  ON public.toroa_journal_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_family_member(auth.uid(), family_id));

DROP POLICY IF EXISTS "journal_owner_update" ON public.toroa_journal_entries;
CREATE POLICY "journal_owner_update"
  ON public.toroa_journal_entries
  FOR UPDATE
  TO authenticated
  USING (
    public.is_family_member(auth.uid(), family_id)
    AND (author_user_id = auth.uid() OR author_user_id IS NULL)
  );

DROP POLICY IF EXISTS "journal_owner_delete" ON public.toroa_journal_entries;
CREATE POLICY "journal_owner_delete"
  ON public.toroa_journal_entries
  FOR DELETE
  TO authenticated
  USING (
    public.is_family_member(auth.uid(), family_id)
    AND (author_user_id = auth.uid() OR author_user_id IS NULL)
  );

CREATE OR REPLACE FUNCTION public.touch_toroa_journal_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_toroa_journal_updated_at ON public.toroa_journal_entries;
CREATE TRIGGER trg_toroa_journal_updated_at
  BEFORE UPDATE ON public.toroa_journal_entries
  FOR EACH ROW EXECUTE FUNCTION public.touch_toroa_journal_updated_at();

-- Tighten RLS on toroa_daily_routines & toroa_routine_completions if still on permissive policy
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='toroa_daily_routines' AND policyname='service_full_access') THEN
    DROP POLICY "service_full_access" ON public.toroa_daily_routines;
  END IF;
END$$;

DROP POLICY IF EXISTS "routines_family_select" ON public.toroa_daily_routines;
CREATE POLICY "routines_family_select"
  ON public.toroa_daily_routines FOR SELECT TO authenticated
  USING (public.is_family_member(auth.uid(), family_id));

DROP POLICY IF EXISTS "routines_family_insert" ON public.toroa_daily_routines;
CREATE POLICY "routines_family_insert"
  ON public.toroa_daily_routines FOR INSERT TO authenticated
  WITH CHECK (public.is_family_member(auth.uid(), family_id));

DROP POLICY IF EXISTS "routines_family_update" ON public.toroa_daily_routines;
CREATE POLICY "routines_family_update"
  ON public.toroa_daily_routines FOR UPDATE TO authenticated
  USING (public.is_family_member(auth.uid(), family_id));

DROP POLICY IF EXISTS "routines_family_delete" ON public.toroa_daily_routines;
CREATE POLICY "routines_family_delete"
  ON public.toroa_daily_routines FOR DELETE TO authenticated
  USING (public.is_family_member(auth.uid(), family_id));

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='toroa_routine_completions' AND policyname='service_full_access') THEN
    DROP POLICY "service_full_access" ON public.toroa_routine_completions;
  END IF;
END$$;

DROP POLICY IF EXISTS "completions_family_select" ON public.toroa_routine_completions;
CREATE POLICY "completions_family_select"
  ON public.toroa_routine_completions FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.toroa_daily_routines r
      WHERE r.id = routine_id
        AND public.is_family_member(auth.uid(), r.family_id)
    )
  );

DROP POLICY IF EXISTS "completions_family_write" ON public.toroa_routine_completions;
CREATE POLICY "completions_family_write"
  ON public.toroa_routine_completions FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.toroa_daily_routines r
      WHERE r.id = routine_id
        AND public.is_family_member(auth.uid(), r.family_id)
    )
  );

DROP POLICY IF EXISTS "completions_family_update" ON public.toroa_routine_completions;
CREATE POLICY "completions_family_update"
  ON public.toroa_routine_completions FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.toroa_daily_routines r
      WHERE r.id = routine_id
        AND public.is_family_member(auth.uid(), r.family_id)
    )
  );

DROP POLICY IF EXISTS "completions_family_delete" ON public.toroa_routine_completions;
CREATE POLICY "completions_family_delete"
  ON public.toroa_routine_completions FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.toroa_daily_routines r
      WHERE r.id = routine_id
        AND public.is_family_member(auth.uid(), r.family_id)
    )
  );