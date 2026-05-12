-- Tōro · agentmail-inbound: extend toro_drafts for email-sourced drafts.
--
-- Background (2026-05-13):
-- The Term Planner agent (kete=toro, agent=term-planner, registered
-- scaffolded by Kaihanga on 2026-05-12) needs an inbound path for school
-- newsletters that a whānau forwards to `term-<whanau-id>@toro.nz`. The
-- forwarded email flows through an AgentMail relay → POSTs an HMAC-signed
-- webhook to supabase/functions/agentmail-inbound → produces a draft in
-- public.toro_drafts with status='pending_approval', plus a typed array of
-- extracted actions (calendar, payment, gear, permission, transition) and a
-- Mana Receipt for the trust trail.
--
-- This migration:
--   1. Relaxes the chatwoot_* NOT NULL constraints (now nullable for the
--      agentmail source path; still enforced for chatwoot rows via CHECK).
--   2. Adds `source` discriminator: 'chatwoot' | 'agentmail'. Defaults
--      'chatwoot' so existing rows backfill cleanly.
--   3. Adds `source_metadata jsonb` for source-shaped fields (whanau_id,
--      agentmail_message_id, from, to, subject, attachment_count, parse
--      status, etc.).
--   4. Adds `retention_class text` ('standard' | 'sensitive' | 'kids_data')
--      to drive the photo/30-day deletion policy and to keep IPP 3A audit
--      trails legible.
--   5. Adds `extracted_actions jsonb` — array of typed event rows. Schema
--      shape documented in supabase/functions/_shared/notice-parser.ts.
--   6. Enforces invariants per source via CHECK constraints:
--        - source='chatwoot' rows must have all three chatwoot_* fields
--        - source='agentmail' rows must have whanau_id + agentmail_message_id
--          inside source_metadata
--   7. Dedup index for AgentMail: one draft per (whanau, agentmail_message_id).
--
-- Hard rules (Plugin Canon §1):
--   - No auto-send. status='pending_approval' is the only landing status.
--   - No kid data in training. The retention_class='kids_data' rows are
--     not exportable to model-training stores; enforced at the application
--     layer via lib/toro/retention.ts (separate PR).
--
-- Idempotent: every change guarded — safe to re-run.

begin;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Relax chatwoot_* NOT NULL constraints.
--
-- Existing rows were 100% chatwoot-sourced, so dropping NOT NULL is safe —
-- no row's chatwoot_* values change. The CHECK constraint added in step 6
-- re-imposes "if source='chatwoot' then chatwoot_* present".
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.toro_drafts
  alter column chatwoot_account_id      drop not null,
  alter column chatwoot_inbox_id        drop not null,
  alter column chatwoot_conversation_id drop not null;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2–5. New columns. All guarded with `if not exists` to stay idempotent.
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.toro_drafts
  add column if not exists source text not null default 'chatwoot',
  add column if not exists source_metadata  jsonb not null default '{}'::jsonb,
  add column if not exists retention_class  text  not null default 'standard',
  add column if not exists extracted_actions jsonb not null default '[]'::jsonb;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. Source enum + invariants. CHECK constraints are dropped+recreated so
-- the migration can re-run cleanly (Postgres has no `ADD CONSTRAINT IF NOT
-- EXISTS`).
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.toro_drafts
  drop constraint if exists toro_drafts_source_check;

alter table public.toro_drafts
  add constraint toro_drafts_source_check
  check (source in ('chatwoot', 'agentmail'));

alter table public.toro_drafts
  drop constraint if exists toro_drafts_retention_class_check;

alter table public.toro_drafts
  add constraint toro_drafts_retention_class_check
  check (retention_class in ('standard', 'sensitive', 'kids_data'));

-- Per-source invariants.
alter table public.toro_drafts
  drop constraint if exists toro_drafts_source_invariants;

alter table public.toro_drafts
  add constraint toro_drafts_source_invariants
  check (
    (source = 'chatwoot'
      and chatwoot_account_id      is not null
      and chatwoot_inbox_id        is not null
      and chatwoot_conversation_id is not null)
    or
    (source = 'agentmail'
      and source_metadata ? 'whanau_id'
      and source_metadata ? 'agentmail_message_id')
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. Dedup index for AgentMail webhook redeliveries. One draft per (whanau,
-- agentmail_message_id). Partial so it never touches chatwoot rows.
--
-- The agentmail relay can redeliver on transient 5xx — the edge function
-- pre-checks this index AND falls back to a 23505 race handler.
-- ─────────────────────────────────────────────────────────────────────────────

create unique index if not exists
  idx_toro_drafts_agentmail_dedup
  on public.toro_drafts (
    (source_metadata->>'whanau_id'),
    (source_metadata->>'agentmail_message_id')
  )
  where source = 'agentmail';

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. Annotations — surface intent to anyone reading the schema cold.
-- ─────────────────────────────────────────────────────────────────────────────

comment on column public.toro_drafts.source is
  'Where this draft was created from. ''chatwoot'' (Chatwoot inbox webhook, '
  'original path) or ''agentmail'' (forwarded school comms via '
  'term-<whanau-id>@toro.nz). Drives which fields are populated; enforced '
  'by toro_drafts_source_invariants.';

comment on column public.toro_drafts.source_metadata is
  'Source-shaped fields. For source=''agentmail'' keys include: whanau_id '
  '(uuid), agentmail_message_id (string), from (rfc5322 address), to '
  '(string), subject (string), received_at (iso8601), attachment_count '
  '(int), pdf_extraction (string|null), parse_status (''parsed'' | '
  '''parse_failed'' | ''parse_partial''), parse_error (string|null). For '
  'source=''chatwoot'' this is empty in v1.';

comment on column public.toro_drafts.retention_class is
  'Drives data lifecycle. ''standard'' = 90-day retention; ''sensitive'' '
  '= flagged for whānau-only review (school medical letters etc.); '
  '''kids_data'' = excluded from any export to model-training stores '
  '(enforced at the application layer in lib/toro/retention.ts).';

comment on column public.toro_drafts.extracted_actions is
  'Array of typed actions extracted by the notice parser. Each entry has '
  '{ "type": "event.calendar"|"event.payment"|"event.gear"|'
  '"event.permission"|"event.transition", "kid_name": str|null, '
  '"...fields per type": ... }. Spec: '
  '_shared/notice-parser.ts. Used by the Term Planner UI to render the '
  'parent-facing draft card.';

commit;
