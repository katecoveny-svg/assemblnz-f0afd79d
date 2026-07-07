-- SPARK generated tools — the draft-only queue behind the /spark
-- build-your-own-tool surface (ASM-042 App Builder).
--
-- Every tool SPARK generates lands here as 'draft'. Tool pages render a visible
-- draft ribbon until an operator approves the row in /admin/approvals. Nothing in
-- this table auto-publishes — approval is a deliberate human step, and no external
-- dispatch happens here at all (the generated tool is just stored HTML).
--
-- Self-healing: idempotent so a re-apply on top of an existing table is a no-op.

create table if not exists public.spark_tools (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  title        text not null,
  summary      text not null,
  kind         text not null default 'tool',
  prompt       text not null,
  html         text not null,
  status       text not null default 'draft' check (status in ('draft', 'approved', 'rejected')),
  requested_by text,
  reviewer     text,
  review_note  text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- RLS on, no client policies: reads/writes go through the service role in server
-- code only — same locked posture as the rest of the runtime.
alter table public.spark_tools enable row level security;

create index if not exists spark_tools_status_created_idx
  on public.spark_tools (status, created_at desc);
