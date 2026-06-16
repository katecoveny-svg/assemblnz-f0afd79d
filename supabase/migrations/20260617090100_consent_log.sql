-- On-call consent capture — the recording-notice exchange, verbatim.
--
-- IPP 3 (Privacy Act 2020) requires that we tell the caller we are recording
-- and why. Aroha's opening line includes the recording notice; the
-- capture_consent tool writes one row here per consent prompt, storing the
-- exact words spoken back ("yes" / "no" / anything ambiguous) so the Mana
-- Receipt can prove informed consent — or prove the caller declined, in which
-- case the call is warm-transferred and nothing is recorded.
--
-- `captured_method`: 'speech' (transcribed reply) | 'dtmf' (keypad) |
-- 'inferred' (agent restated and caller confirmed).

BEGIN;

CREATE TABLE IF NOT EXISTS public.consent_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  call_sid text NOT NULL REFERENCES public.kete_session (call_sid) ON DELETE CASCADE,
  ts timestamptz NOT NULL DEFAULT now(),
  prompt_text text NOT NULL,
  response_text text NOT NULL,
  consent_granted boolean NOT NULL,
  captured_method text NOT NULL DEFAULT 'speech'
    CHECK (captured_method IN ('speech', 'dtmf', 'inferred')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS consent_log_call_idx
  ON public.consent_log (call_sid, ts);

-- RLS: written by edge functions via service role only.
ALTER TABLE public.consent_log ENABLE ROW LEVEL SECURITY;

COMMIT;

-- Verification:
-- INSERT INTO public.consent_log (call_sid, prompt_text, response_text, consent_granted)
--   VALUES ('CA_test', 'Kia ora, I record calls to confirm your booking — is that OK?', 'yeah that''s fine', true);
-- SELECT call_sid, consent_granted, response_text FROM public.consent_log;
