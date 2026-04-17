
ALTER TABLE public.messaging_conversations
  ADD COLUMN IF NOT EXISTS consent_status text NOT NULL DEFAULT 'opted_in',
  ADD COLUMN IF NOT EXISTS opt_out_at timestamptz,
  ADD COLUMN IF NOT EXISTS opted_out_keyword text,
  ADD COLUMN IF NOT EXISTS first_contact_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS identification_sent boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_messaging_conversations_consent
  ON public.messaging_conversations (phone_number, consent_status);

CREATE OR REPLACE FUNCTION public.validate_consent_status()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.consent_status NOT IN ('opted_in', 'opted_out', 'pending') THEN
    RAISE EXCEPTION 'consent_status must be opted_in, opted_out, or pending';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_messaging_consent_status ON public.messaging_conversations;
CREATE TRIGGER trg_messaging_consent_status
  BEFORE INSERT OR UPDATE ON public.messaging_conversations
  FOR EACH ROW EXECUTE FUNCTION public.validate_consent_status();
