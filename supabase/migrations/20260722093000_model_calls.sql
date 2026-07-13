-- One model-call ledger (Agentic OS Phase 2,
-- docs/AGENTIC-OS-ARCHITECTURE.md §B.4, brief §6).
--
-- Every LLM call made through lib/ai/router.ts lands here: provider, model,
-- latency, token usage, outcome, and what it fell back from — one place to
-- answer "which model ran, how long, at what cost", superseding the
-- fragmented agent_cost_log / model_fallback_events / agent_analytics view
-- over time. RLS deny-all, service-role writes only, fail-soft.

create table if not exists public.model_calls (
  id uuid primary key default gen_random_uuid(),
  tenant text,
  agent text,
  task_id uuid,
  provider text not null,
  model text not null,
  fallback_from text,
  latency_ms integer,
  tokens_in integer,
  tokens_out integer,
  cost_nzd numeric(10, 6),
  ok boolean not null default true,
  error text,
  created_at timestamptz not null default now()
);

alter table public.model_calls enable row level security;

create index if not exists model_calls_tenant_created_idx
  on public.model_calls (tenant, created_at desc);
create index if not exists model_calls_task_idx
  on public.model_calls (task_id);
