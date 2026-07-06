-- Family Inbox Sync — the always-on reader behind the Family OS demo.
--
-- The family-inbox-sync edge function runs every 15 minutes, reads new family
-- email (school newsletters, sports notices, bills, event invites) and turns
-- each one into PROPOSED family_items + a per-run digest. It is DRAFT-ONLY —
-- it never replies, RSVPs, pays or sends. A named adult approves everything in
-- the ops console before it becomes a real handoff.
--
-- This migration adds:
--   1. family_inbox_seen  — the dedupe ledger (one row per provider message-id)
--   2. family_inbox_runs  — a per-run summary (counts + category breakdown)
--   3. a 15-minute pg_cron schedule that invokes the function
--
-- Both tables use the same posture as public.family_items: RLS enabled with NO
-- policies, so only the service role (the edge function) reads/writes them.
--
-- Fresh-apply safe: every statement is idempotent and guarded.

-- ── 1. Dedupe ledger ───────────────────────────────────────────────────────
-- Before processing a message the function checks this table for its provider
-- message-id; if present it skips, otherwise it records it. This is the fix for
-- the "same message re-processed every day" bug — we never trust the unread
-- flag alone (a message can be re-read across runs, or marked unread again).
create table if not exists public.family_inbox_seen (
  message_id text primary key,
  provider   text,
  hub        text not null default 'demo',
  category   text,
  subject    text,
  seen_at    timestamptz not null default now()
);

comment on table public.family_inbox_seen is
  'Dedupe ledger for family-inbox-sync: one row per provider message-id already processed, so a message is never turned into family_items twice. Service-role only (RLS, no policies).';

alter table public.family_inbox_seen enable row level security;

-- ── 2. Run summary ─────────────────────────────────────────────────────────
-- One row per scheduled (or manually-triggered) run: what provider, whether it
-- was a dry run, how many messages scanned, how many items proposed, and the
-- per-category breakdown. Feeds the ops console's "always-on" status strip.
create table if not exists public.family_inbox_runs (
  id            uuid primary key default gen_random_uuid(),
  ran_at        timestamptz not null default now(),
  provider      text,
  dry_run       boolean not null default false,
  scanned       int default 0,
  created_items int default 0,
  categories    jsonb default '{}'::jsonb
);

comment on table public.family_inbox_runs is
  'Per-run summary for family-inbox-sync: provider, dry_run flag, scanned/created counts, category breakdown. Service-role only (RLS, no policies).';

create index if not exists family_inbox_runs_ran_at_idx on public.family_inbox_runs (ran_at desc);

alter table public.family_inbox_runs enable row level security;

-- ── 3. 15-minute cron ──────────────────────────────────────────────────────
-- Uses the repo's canonical, working cron mechanism: pg_cron + the
-- public.invoke_edge_function(path, body) helper (added in
-- 20260516120200_business_pulse_cron_vault.sql), which pulls the project URL +
-- service-role key from Supabase Vault. This is the fixed pattern — the older
-- current_setting('app.settings.*') GUC pattern was never wired on this
-- project and inserted null URLs, so we deliberately do NOT use it.
--
-- Until the vault secrets 'supabase_url' and 'service_role_key' exist, the
-- helper is a silent no-op (no error, no traffic) — the same as if cron were
-- off. Those secrets already exist in prod (set for business-pulse /
-- morning-briefing), so this schedule goes live on its next tick.
--
-- The function itself runs in DRY MODE (writes nothing) until an inbox
-- provider + OAuth creds are set as function secrets — see
-- docs/FAMILY-INBOX-ECHO-SETUP.md. So it is safe to schedule now.
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.unschedule('family-inbox-sync-15min')
      where exists (select 1 from cron.job where jobname = 'family-inbox-sync-15min');

    perform cron.schedule(
      'family-inbox-sync-15min',
      '*/15 * * * *',
      $cmd$ select public.invoke_edge_function('family-inbox-sync', '{"scheduled":true}'::jsonb); $cmd$
    );

    raise notice 'family-inbox-sync cron registered (every 15 minutes)';
  else
    raise notice 'pg_cron not enabled — schedule family-inbox-sync every 15 min via the Supabase dashboard';
  end if;
exception when others then
  raise notice 'family-inbox-sync cron registration skipped: %', sqlerrm;
end;
$$;
