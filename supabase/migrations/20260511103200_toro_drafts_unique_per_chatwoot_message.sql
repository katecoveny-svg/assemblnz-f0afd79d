-- Adds partial unique index on toro_drafts to prevent duplicate drafts.
--
-- Problem solved (2026-05-11 NZST): account-level Chatwoot webhook 16392 AND
-- per-inbox webhook on 108583 both POST chatwoot-webhook for the same
-- message_created event. Without uniqueness, every inbound Hudson message
-- creates two drafts.
--
-- Also defends against Chatwoot retries (fires on 5xx, will become real once
-- WhatsApp Twilio adds traffic and the function PR ships).
--
-- Partial: only enforced when chatwoot_message_id is not null. Synthetic
-- drafts created from the Toro UI directly (no Chatwoot source) remain
-- unconstrained.
--
-- Already applied to assembl-prod 2026-05-11 ~10:32 NZST via
-- SUPABASE_APPLY_A_MIGRATION (Composio). This file commits the canonical
-- form to repo so fresh clones / disaster recovery / preview projects
-- reproduce the same state.
--
-- Author: Kaihanga, 2026-05-11.

create unique index if not exists toro_drafts_unique_chatwoot_message
  on public.toro_drafts (chatwoot_account_id, chatwoot_inbox_id, chatwoot_message_id)
  where chatwoot_message_id is not null;
