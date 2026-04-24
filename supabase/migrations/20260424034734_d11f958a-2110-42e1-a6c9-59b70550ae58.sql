-- TŌRO email flags table for family email watch
CREATE TABLE IF NOT EXISTS public.toroa_email_flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  family_id UUID,
  thread_id TEXT,
  message_id TEXT,
  sender TEXT NOT NULL,
  sender_email TEXT,
  subject TEXT NOT NULL,
  snippet TEXT,
  category TEXT NOT NULL DEFAULT 'school',
  action_required BOOLEAN NOT NULL DEFAULT false,
  action_description TEXT,
  due_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'new',
  source_link TEXT,
  received_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_toroa_email_flags_user ON public.toroa_email_flags(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_toroa_email_flags_category ON public.toroa_email_flags(user_id, category);
CREATE INDEX IF NOT EXISTS idx_toroa_email_flags_action ON public.toroa_email_flags(user_id, action_required, due_date);

ALTER TABLE public.toroa_email_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their own email flags"
  ON public.toroa_email_flags FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert their own email flags"
  ON public.toroa_email_flags FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update their own email flags"
  ON public.toroa_email_flags FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete their own email flags"
  ON public.toroa_email_flags FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER trg_toroa_email_flags_updated
  BEFORE UPDATE ON public.toroa_email_flags
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- TŌRO school reports table
CREATE TABLE IF NOT EXISTS public.toroa_school_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  family_id UUID,
  student_name TEXT NOT NULL,
  school_name TEXT,
  subject TEXT NOT NULL,
  grade TEXT NOT NULL,
  grade_numeric NUMERIC(5,2),
  previous_grade TEXT,
  trend TEXT DEFAULT 'stable',
  teacher TEXT,
  report_date DATE NOT NULL DEFAULT CURRENT_DATE,
  attendance_pct NUMERIC(5,2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_toroa_school_reports_user ON public.toroa_school_reports(user_id, report_date DESC);
CREATE INDEX IF NOT EXISTS idx_toroa_school_reports_student ON public.toroa_school_reports(user_id, student_name);

ALTER TABLE public.toroa_school_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their own school reports"
  ON public.toroa_school_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert their own school reports"
  ON public.toroa_school_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update their own school reports"
  ON public.toroa_school_reports FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete their own school reports"
  ON public.toroa_school_reports FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER trg_toroa_school_reports_updated
  BEFORE UPDATE ON public.toroa_school_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- HUI meeting notes
CREATE TABLE IF NOT EXISTS public.meeting_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  meeting_id TEXT,
  calendar_event_id TEXT,
  title TEXT NOT NULL,
  meeting_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  attendees JSONB NOT NULL DEFAULT '[]'::jsonb,
  transcript_id TEXT,
  transcript_text TEXT,
  notes_md TEXT,
  decisions JSONB NOT NULL DEFAULT '[]'::jsonb,
  action_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  highlights JSONB NOT NULL DEFAULT '[]'::jsonb,
  parking_lot JSONB NOT NULL DEFAULT '[]'::jsonb,
  kete_tag TEXT,
  drive_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_meeting_notes_user ON public.meeting_notes(user_id, meeting_date DESC);
CREATE INDEX IF NOT EXISTS idx_meeting_notes_calendar ON public.meeting_notes(user_id, calendar_event_id);

ALTER TABLE public.meeting_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their own meeting notes"
  ON public.meeting_notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert their own meeting notes"
  ON public.meeting_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update their own meeting notes"
  ON public.meeting_notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete their own meeting notes"
  ON public.meeting_notes FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER trg_meeting_notes_updated
  BEFORE UPDATE ON public.meeting_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- HUI meeting action items
CREATE TABLE IF NOT EXISTS public.meeting_action_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  meeting_note_id UUID REFERENCES public.meeting_notes(id) ON DELETE CASCADE,
  assignee TEXT,
  description TEXT NOT NULL,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'open',
  priority TEXT DEFAULT 'medium',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_meeting_action_items_user ON public.meeting_action_items(user_id, status, due_date);
CREATE INDEX IF NOT EXISTS idx_meeting_action_items_meeting ON public.meeting_action_items(meeting_note_id);

ALTER TABLE public.meeting_action_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their own action items"
  ON public.meeting_action_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert their own action items"
  ON public.meeting_action_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update their own action items"
  ON public.meeting_action_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete their own action items"
  ON public.meeting_action_items FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER trg_meeting_action_items_updated
  BEFORE UPDATE ON public.meeting_action_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
