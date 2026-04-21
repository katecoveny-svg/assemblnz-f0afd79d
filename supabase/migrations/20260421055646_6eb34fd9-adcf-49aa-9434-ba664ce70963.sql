-- 1. Insert the Manaaki → Auaha thank-you template (skip if it already exists)
INSERT INTO public.workflow_templates (id, name, description, trigger_agent, trigger_event, steps, is_active, is_system, relevant_acts)
SELECT
  gen_random_uuid(),
  'Manaaki Booking → Auaha Thank-You Draft',
  'When a new booking is recorded by Manaaki, Auaha drafts a personalised thank-you note for human approval.',
  'MANAAKI',
  'booking_created',
  '[
    {"step":1,"agent":"AURA","action":"capture_booking_context"},
    {"step":2,"agent":"MUSE","action":"draft_thank_you_message"},
    {"step":3,"agent":"HUMAN","action":"review_and_approve"}
  ]'::jsonb,
  true,
  true,
  ARRAY['Privacy Act 2020','Unsolicited Electronic Messages Act 2007']
WHERE NOT EXISTS (
  SELECT 1 FROM public.workflow_templates
  WHERE name = 'Manaaki Booking → Auaha Thank-You Draft'
);

-- 2. Trigger function: queue a draft execution whenever a Manaaki booking record lands
CREATE OR REPLACE FUNCTION public.queue_manaaki_thank_you_draft()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_template_id UUID;
BEGIN
  -- Only fire on booking-style records
  IF NEW.workflow_type NOT IN ('booking', 'booking_created', 'guest_arrival') THEN
    RETURN NEW;
  END IF;

  SELECT id INTO v_template_id
  FROM public.workflow_templates
  WHERE name = 'Manaaki Booking → Auaha Thank-You Draft'
  LIMIT 1;

  IF v_template_id IS NULL THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.workflow_executions (
    workflow_id, user_id, status, current_step, steps_log, started_at
  ) VALUES (
    v_template_id,
    NEW.user_id,
    'pending_approval',
    2,
    jsonb_build_array(
      jsonb_build_object(
        'step', 1,
        'agent', 'AURA',
        'action', 'capture_booking_context',
        'status', 'completed',
        'source_record_id', NEW.id,
        'source_workflow_type', NEW.workflow_type,
        'guest_name', NEW.payload->>'guest_name',
        'venue_ref', NEW.venue_ref,
        'completed_at', now()
      ),
      jsonb_build_object(
        'step', 2,
        'agent', 'MUSE',
        'action', 'draft_thank_you_message',
        'status', 'draft_ready',
        'draft', 'Kia ora ' || COALESCE(NEW.payload->>'guest_name', 'manuhiri') ||
                ' — ngā mihi nui for staying with us. We hope your visit was warm and your time with us memorable. Please come back and see us soon. Ngā mihi, the team.',
        'created_at', now()
      )
    ),
    now()
  );

  RETURN NEW;
END;
$$;

-- 3. Attach the trigger
DROP TRIGGER IF EXISTS trg_manaaki_booking_thank_you ON public.manaaki_workflow_records;
CREATE TRIGGER trg_manaaki_booking_thank_you
  AFTER INSERT ON public.manaaki_workflow_records
  FOR EACH ROW
  EXECUTE FUNCTION public.queue_manaaki_thank_you_draft();