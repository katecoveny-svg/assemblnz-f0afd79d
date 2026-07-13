-- Tasks + evidence — the operating core (Agentic OS Phase 1,
-- docs/AGENTIC-OS-ARCHITECTURE.md §B.7/§B.9).
--
-- A task is a first-class piece of work with visible execution states.
-- Evidence is what proves a task actually happened. Both are tenant-keyed,
-- RLS deny-all, service-role access only via lib/os/*.

create table if not exists public.os_tasks (
  id uuid primary key default gen_random_uuid(),
  tenant text not null,
  title text not null,
  description text,
  initiated_by text not null default 'system',      -- user:<id> | agent:<slug> | system:<origin>
  assigned_agent text,                              -- agent slug from the registry
  status text not null default 'proposed',
  priority text not null default 'normal',
  risk text,                                        -- low | medium | high (lib/os/policy.ts)
  due_at timestamptz,
  linked jsonb not null default '{}'::jsonb,        -- enquiry id, genome fact ids, customer email…
  plan jsonb,                                       -- orchestrator's plan for the task
  action_request_id uuid,                           -- agent_action_requests row when approval is needed
  model text,                                       -- model that did the work
  cost_nzd numeric(10, 4),
  outcome text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$ begin
  alter table public.os_tasks
    add constraint os_tasks_status_check
    check (status in (
      'proposed', 'awaiting_context', 'awaiting_approval', 'ready',
      'running', 'blocked', 'completed', 'failed', 'cancelled',
      'requires_review'
    ));
exception
  when duplicate_object then null;
end $$;

do $$ begin
  alter table public.os_tasks
    add constraint os_tasks_risk_check
    check (risk is null or risk in ('low', 'medium', 'high'));
exception
  when duplicate_object then null;
end $$;

alter table public.os_tasks enable row level security;

create index if not exists os_tasks_tenant_created_idx
  on public.os_tasks (tenant, created_at desc);
create index if not exists os_tasks_tenant_status_idx
  on public.os_tasks (tenant, status);

-- Activity log: every state change and notable step, append-only.
create table if not exists public.os_task_events (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.os_tasks (id) on delete cascade,
  kind text not null,                               -- created | status | plan | note | approval | dispatch | error
  detail jsonb not null default '{}'::jsonb,
  at timestamptz not null default now()
);

alter table public.os_task_events enable row level security;

create index if not exists os_task_events_task_idx
  on public.os_task_events (task_id, at);

-- Evidence: what proves the work happened. One task may carry several
-- evidence records (draft text, approval, dispatch result, model call).
create table if not exists public.os_evidence (
  id uuid primary key default gen_random_uuid(),
  tenant text not null,
  task_id uuid references public.os_tasks (id) on delete set null,
  kind text not null,                               -- draft | approval | dispatch | model_call | record_change | note
  summary text not null,
  refs jsonb not null default '{}'::jsonb,          -- ids/links into other ledgers (mana_receipts, action requests…)
  before_state jsonb,
  after_state jsonb,
  approved_by text,
  created_at timestamptz not null default now()
);

alter table public.os_evidence enable row level security;

create index if not exists os_evidence_tenant_created_idx
  on public.os_evidence (tenant, created_at desc);
create index if not exists os_evidence_task_idx
  on public.os_evidence (task_id, created_at);
