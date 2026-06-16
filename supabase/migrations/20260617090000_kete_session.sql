-- Voice agent call sessions — one row per inbound call to the Manaaki DID.
--
-- A "kete session" is the lifecycle record of a single phone call handled by
-- the Aroha voice agent: when it started/ended, which ElevenLabs agent and
-- demo customer it belonged to, the Twilio call SID, and pointers to the
-- transcript + recording once ElevenLabs fires its post-call webhook.
--
-- `status` walks: ringing -> in_progress -> completed | transferred |
-- voicemail | failed. `notes` is the free-text bucket the capture_message
-- voicemail-fallback tool writes into. Recording/transcript URIs stay null
-- until the post-call webhook finalises the row.

BEGIN;

CREATE TABLE IF NOT EXISTS public.kete_session (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  call_sid text NOT NULL UNIQUE,
  agent_id text NOT NULL,
  customer_id text NOT NULL,
  caller_number text,
  status text NOT NULL DEFAULT 'ringing'
    CHECK (status IN ('ringing', 'in_progress', 'completed', 'transferred', 'voicemail', 'failed')),
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  transcript_uri text,
  recording_uri text,
  notes text,
  -- Append-only log of every server tool Aroha invoked on the call. Folded
  -- into the Mana Receipt payload at finalize time.
  tool_calls jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS kete_session_customer_idx
  ON public.kete_session (customer_id, started_at DESC);

CREATE INDEX IF NOT EXISTS kete_session_status_idx
  ON public.kete_session (status, started_at DESC);

-- RLS: voice telephony runs entirely server-side via the service role
-- (edge functions + Next.js admin reads). No anon access.
ALTER TABLE public.kete_session ENABLE ROW LEVEL SECURITY;

COMMIT;

-- Verification:
-- INSERT INTO public.kete_session (call_sid, agent_id, customer_id)
--   VALUES ('CA_test', 'aroha.manaaki@demo', 'whetu');
-- SELECT call_sid, status, started_at FROM public.kete_session ORDER BY started_at DESC;
