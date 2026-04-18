ALTER TABLE public.messaging_conversations
  ADD COLUMN IF NOT EXISTS awaiting_kete_pick boolean NOT NULL DEFAULT false;