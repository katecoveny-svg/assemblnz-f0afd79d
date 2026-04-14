
CREATE TABLE public.kete_channel_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  kete_code text NOT NULL,
  sms_enabled boolean NOT NULL DEFAULT true,
  whatsapp_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, kete_code)
);

ALTER TABLE public.kete_channel_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own kete channel config"
  ON public.kete_channel_config FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own kete channel config"
  ON public.kete_channel_config FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own kete channel config"
  ON public.kete_channel_config FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);
