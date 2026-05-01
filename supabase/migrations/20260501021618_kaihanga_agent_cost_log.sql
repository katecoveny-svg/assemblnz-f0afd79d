-- =============================================================================
-- 20260501021618_kaihanga_agent_cost_log.sql
-- agent_cost_log — per-tenant, per-agent cost tracking
-- =============================================================================
-- Powers per-customer gross-margin analysis, usage caps, billing
-- reconciliation, and Command Center observability. Every LLM call routed
-- through supabase/functions/_shared/llm-call.ts writes one row when meta
-- is provided on LlmCallOptions.
--
-- Added: 1 May 2026 by Kaihanga (PR 1 of migration-prep)
-- Idempotent — safe to re-run.
-- =============================================================================

create table if not exists public.agent_cost_log (
  id          uuid          primary key default gen_random_uuid(),
  tenant_id   uuid          not null,
  agent_code  text          not null,
  model       text          not null,
  tokens_in   integer       not null default 0,
  tokens_out  integer       not null default 0,
  cost_nzd    numeric(12,6) not null default 0,
  latency_ms  integer,
  request_id  uuid,
  parent_request_id uuid,
  status      text          not null default 'completed',
  error_code  text,
  created_at  timestamptz   not null default now(),
  constraint agent_cost_log_status_chk check (status in ('completed','error','timeout','cancelled'))
);

create index if not exists idx_acl_tenant_time on public.agent_cost_log (tenant_id, created_at desc);
create index if not exists idx_acl_agent_time  on public.agent_cost_log (agent_code, created_at desc);
create index if not exists idx_acl_request     on public.agent_cost_log (request_id);
create index if not exists idx_acl_status_partial on public.agent_cost_log (status, created_at desc) where status <> 'completed';

alter table public.agent_cost_log enable row level security;

drop policy if exists acl_tenant_read on public.agent_cost_log;
create policy acl_tenant_read on public.agent_cost_log
  for select using (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

drop policy if exists acl_service_insert on public.agent_cost_log;
create policy acl_service_insert on public.agent_cost_log
  for insert with check (true);

drop policy if exists acl_service_read_all on public.agent_cost_log;
create policy acl_service_read_all on public.agent_cost_log
  for select to service_role using (true);

revoke update, delete on public.agent_cost_log from public, authenticated, anon;

create or replace view public.agent_cost_daily as
select
  date_trunc('day', created_at)::date as day,
  tenant_id, agent_code, model,
  count(*) as run_count,
  sum(tokens_in) as tokens_in_total,
  sum(tokens_out) as tokens_out_total,
  sum(cost_nzd) as cost_nzd_total,
  avg(latency_ms)::int as avg_latency_ms,
  count(*) filter (where status <> 'completed') as error_count
from public.agent_cost_log
group by 1, 2, 3, 4;

create or replace view public.agent_cost_monthly_per_tenant as
select
  date_trunc('month', created_at)::date as month,
  tenant_id,
  count(*) as run_count,
  sum(cost_nzd) as cost_nzd_total,
  count(distinct agent_code) as agents_used,
  count(distinct model) as models_used
from public.agent_cost_log
group by 1, 2
order by month desc, cost_nzd_total desc;

create or replace function public.check_tenant_usage_cap(
  p_tenant_id uuid,
  p_monthly_cap_nzd numeric default 250
) returns table (
  current_month_spend numeric,
  cap_remaining numeric,
  is_over_cap boolean
) as $$
  select
    coalesce(sum(cost_nzd), 0) as current_month_spend,
    p_monthly_cap_nzd - coalesce(sum(cost_nzd), 0) as cap_remaining,
    coalesce(sum(cost_nzd), 0) >= p_monthly_cap_nzd as is_over_cap
  from public.agent_cost_log
  where tenant_id = p_tenant_id
    and created_at >= date_trunc('month', now());
$$ language sql stable security definer;

revoke all on function public.check_tenant_usage_cap(uuid, numeric) from public;
grant execute on function public.check_tenant_usage_cap(uuid, numeric) to service_role;
