
-- Add staleness tracking to agent_knowledge_base
ALTER TABLE public.agent_knowledge_base 
  ADD COLUMN IF NOT EXISTS is_stale boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS stale_reason text;

-- Add requires_human_review and change_detail to compliance_updates
ALTER TABLE public.compliance_updates
  ADD COLUMN IF NOT EXISTS requires_human_review boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS change_detail jsonb DEFAULT '{}';

-- Enable extensions for cron scheduling
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
