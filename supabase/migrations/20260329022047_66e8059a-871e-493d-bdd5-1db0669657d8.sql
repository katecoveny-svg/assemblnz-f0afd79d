
-- Add channel column to agent_sms_messages
ALTER TABLE agent_sms_messages ADD COLUMN IF NOT EXISTS channel text NOT NULL DEFAULT 'sms';

-- Add WhatsApp-specific columns to agent_sms_messages
ALTER TABLE agent_sms_messages ADD COLUMN IF NOT EXISTS whatsapp_message_id text;
ALTER TABLE agent_sms_messages ADD COLUMN IF NOT EXISTS media_url text;
ALTER TABLE agent_sms_messages ADD COLUMN IF NOT EXISTS media_type text;
ALTER TABLE agent_sms_messages ADD COLUMN IF NOT EXISTS media_caption text;
ALTER TABLE agent_sms_messages ADD COLUMN IF NOT EXISTS image_description text;
ALTER TABLE agent_sms_messages ADD COLUMN IF NOT EXISTS whatsapp_status text;

-- Add channel column to agent_sms_config
ALTER TABLE agent_sms_config ADD COLUMN IF NOT EXISTS channel text NOT NULL DEFAULT 'sms';

-- Create whatsapp_templates table
CREATE TABLE IF NOT EXISTS whatsapp_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  template_name text NOT NULL UNIQUE,
  category text NOT NULL DEFAULT 'utility',
  language_code text NOT NULL DEFAULT 'en',
  body_text text NOT NULL,
  footer_text text,
  variables jsonb,
  whatsapp_template_id text,
  status text NOT NULL DEFAULT 'pending',
  approval_notes text,
  admin_only boolean NOT NULL DEFAULT false
);

ALTER TABLE whatsapp_templates ENABLE ROW LEVEL SECURITY;

-- Admin-only policies using has_role function
CREATE POLICY "Admins can manage whatsapp templates" ON whatsapp_templates
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create indexes for channel filtering
CREATE INDEX IF NOT EXISTS idx_agent_sms_messages_channel ON agent_sms_messages(channel);
CREATE INDEX IF NOT EXISTS idx_agent_sms_messages_whatsapp_id ON agent_sms_messages(whatsapp_message_id);
CREATE INDEX IF NOT EXISTS idx_agent_sms_config_channel ON agent_sms_config(channel);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE agent_sms_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE agent_sms_config;
