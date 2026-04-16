-- Allow per-channel SMS/WhatsApp config per agent per user
ALTER TABLE public.agent_sms_config
  DROP CONSTRAINT IF EXISTS agent_sms_config_user_id_agent_id_key;

ALTER TABLE public.agent_sms_config
  ADD CONSTRAINT agent_sms_config_user_agent_channel_key
  UNIQUE (user_id, agent_id, channel);