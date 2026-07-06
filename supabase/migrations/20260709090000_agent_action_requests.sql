-- Agent action requests — the first real action path (PR 3).
--
-- An agent in chat can now REQUEST a business action (an email draft, a
-- webhook post). The request lands here as 'pending'; nothing leaves the
-- building until a named operator approves it on /admin/approvals. Even then,
-- actual dispatch is gated behind ACTION_DISPATCH_ENABLED (off by default),
-- so approving records the human decision without yet sending anything —
-- the draft-mode contract holds end to end.
--
-- RLS enabled with NO policies: service-role only, same posture as
-- demo_invites — the chat route (after its own metering) and the admin
-- server actions (after ensureAdmin()) are the only code paths that touch it.

create table if not exists public.agent_action_requests (
  id uuid primary key default gen_random_uuid(),
  agent_slug text not null,
  -- who asked: 'user:<uuid>' for signed-in chat, 'anon:<device-id>' otherwise
  requested_by text not null,
  kind text not null check (kind in ('email_draft', 'webhook')),
  -- email_draft: { to?, subject, body, reason }
  -- webhook:     { url, payload, reason }
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'dispatched', 'rejected', 'failed')),
  reviewer text,
  review_note text,
  decided_at timestamptz,
  dispatch_result jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists agent_action_requests_status_idx
  on public.agent_action_requests (status, created_at desc);
create index if not exists agent_action_requests_agent_idx
  on public.agent_action_requests (agent_slug, created_at desc);

alter table public.agent_action_requests enable row level security;
