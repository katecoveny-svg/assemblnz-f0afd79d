
-- Close any duplicates first (keep most recent active per phone+channel)
UPDATE public.messaging_conversations m
SET status = 'closed'
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY phone_number, channel ORDER BY updated_at DESC) AS rn
    FROM public.messaging_conversations
    WHERE status = 'active'
  ) sub
  WHERE rn > 1
);

-- Partial unique index: only one active row per (phone, channel)
CREATE UNIQUE INDEX IF NOT EXISTS uq_messaging_conv_active_phone_channel
  ON public.messaging_conversations (phone_number, channel)
  WHERE status = 'active';
