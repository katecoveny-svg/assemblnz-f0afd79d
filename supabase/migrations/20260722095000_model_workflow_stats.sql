-- Measured model performance on real Assembl workflows (routing brief,
-- 2026-07-13). Written by scripts/run-os-evals.ts; read by the Model &
-- Capability Router (lib/os/routing-live.ts). Routing decisions must rest
-- on these measurements, never on published benchmarks alone.
-- RLS deny-all; service-role only.

create table if not exists public.model_workflow_stats (
  id uuid primary key default gen_random_uuid(),
  model text not null,
  provider text not null,
  workflow text not null,
  cases integer not null,
  accuracy numeric(4, 3) not null,          -- 0..1 across the workflow's checks
  tool_success numeric(4, 3),               -- 0..1 on tool-choice cases
  hallucination_rate numeric(4, 3),         -- 0..1, lower is better
  avg_latency_ms integer,
  avg_cost_nzd numeric(10, 6),
  run_at timestamptz not null default now()
);

alter table public.model_workflow_stats enable row level security;

create index if not exists model_workflow_stats_workflow_idx
  on public.model_workflow_stats (workflow, model, run_at desc);
