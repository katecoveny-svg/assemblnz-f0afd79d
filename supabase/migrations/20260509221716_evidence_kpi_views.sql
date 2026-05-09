-- Evidence ledger KPI summary — materialised view powering /app/admin/metrics.
-- Spec: outputs/IMPLEMENTATION-PLAN-VERTICAL-AI-STRATEGY-2026-05-09.md (§7).
--
-- Six "brutally simple" KPIs as a single wide row (refreshed on demand):
--   1. time_to_first_completed_case_minutes — median, last 30 days
--   2. citation_coverage_pct                — % of high-risk outputs with ≥1 citation
--   3. approval_coverage_pct                — % of high-risk actions with approval row (target 100%)
--   4. action_reversal_rate_pct             — % of agent outputs reversed by human within 7 days
--   5. cycle_time_reduction_pct             — vs baseline (NULL until baseline captured)
--   6. nrr_by_cohort_pct                    — placeholder (NULL until billing rolls in)
--
-- Schema-first scaffold: depends on assembl_audit_log (Day 7) and
-- mana_receipts (Day 7.5). Both ship after this PR. If either table is
-- missing the view definition still installs but yields all-NULL rows so
-- the dashboard renders an empty state instead of erroring.
--
-- Idempotent.

create or replace function public.kpi_evidence_summary_compute()
returns table (
  computed_at                            timestamptz,
  time_to_first_completed_case_minutes   numeric,
  citation_coverage_pct                  numeric,
  approval_coverage_pct                  numeric,
  action_reversal_rate_pct               numeric,
  cycle_time_reduction_pct               numeric,
  nrr_by_cohort_pct                      numeric,
  high_risk_outputs_total                bigint,
  high_risk_outputs_with_citation        bigint,
  high_risk_actions_total                bigint,
  high_risk_actions_with_approval        bigint,
  agent_outputs_last_30d                 bigint,
  agent_outputs_reversed_within_7d       bigint
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  has_audit boolean := exists (
    select 1 from information_schema.tables
    where table_schema='public' and table_name='assembl_audit_log'
  );
  has_receipts boolean := exists (
    select 1 from information_schema.tables
    where table_schema='public' and table_name='mana_receipts'
  );
begin
  if not has_audit then
    return query select
      now() as computed_at,
      null::numeric, null::numeric, null::numeric,
      null::numeric, null::numeric, null::numeric,
      0::bigint, 0::bigint, 0::bigint, 0::bigint, 0::bigint, 0::bigint;
    return;
  end if;

  -- Note: column names below are educated guesses against the as-yet-unshipped
  -- assembl_audit_log schema (Day 7). When that table lands, revisit and
  -- align: action_class, risk_class, approval_status, reversed_at, etc.
  return query
  with audit as (
    select * from public.assembl_audit_log
  ),
  high_risk as (
    select * from audit
    where coalesce(audit.risk_class, '') in ('high', 'critical')
  ),
  outputs_30d as (
    select * from audit
    where audit.created_at >= now() - interval '30 days'
      and coalesce(audit.event_type, '') = 'agent_output'
  ),
  citation_join as (
    select hr.id,
           exists (
             select 1 from public.mana_receipts r
             where has_receipts
               and r.audit_log_id = hr.id
               and jsonb_array_length(coalesce(r.citations, '[]'::jsonb)) > 0
           ) as has_citation
    from high_risk hr
  ),
  reversed as (
    select count(*) filter (
      where coalesce(audit.reversed_at, null) is not null
        and audit.reversed_at <= audit.created_at + interval '7 days'
    ) as reversed_n,
    count(*) as total_n
    from outputs_30d audit
  ),
  first_case as (
    select percentile_cont(0.5) within group (
      order by extract(epoch from (
        coalesce(audit.completed_at, audit.created_at) - audit.created_at
      )) / 60.0
    ) as median_minutes
    from audit
    where audit.created_at >= now() - interval '30 days'
      and coalesce(audit.event_type, '') = 'case_completed'
  )
  select
    now() as computed_at,
    (select median_minutes from first_case)                          as time_to_first_completed_case_minutes,
    case when (select count(*) from citation_join) = 0 then null
         else round(
           100.0 * (select count(*) from citation_join where has_citation)::numeric
           / (select count(*) from citation_join)::numeric, 1)
    end                                                              as citation_coverage_pct,
    case when (select count(*) from high_risk) = 0 then null
         else round(
           100.0 * (select count(*) from high_risk
                    where coalesce(approval_status, '') = 'approved')::numeric
           / (select count(*) from high_risk)::numeric, 1)
    end                                                              as approval_coverage_pct,
    case when (select total_n from reversed) = 0 then null
         else round(
           100.0 * (select reversed_n from reversed)::numeric
           / (select total_n from reversed)::numeric, 1)
    end                                                              as action_reversal_rate_pct,
    null::numeric                                                    as cycle_time_reduction_pct,
    null::numeric                                                    as nrr_by_cohort_pct,
    (select count(*) from citation_join)                             as high_risk_outputs_total,
    (select count(*) from citation_join where has_citation)          as high_risk_outputs_with_citation,
    (select count(*) from high_risk)                                 as high_risk_actions_total,
    (select count(*) from high_risk
       where coalesce(approval_status, '') = 'approved')             as high_risk_actions_with_approval,
    (select count(*) from outputs_30d)                               as agent_outputs_last_30d,
    (select reversed_n from reversed)                                as agent_outputs_reversed_within_7d;

exception when undefined_column then
  -- Schema differs from expected — surface zeros so the dashboard renders.
  return query select
    now() as computed_at,
    null::numeric, null::numeric, null::numeric,
    null::numeric, null::numeric, null::numeric,
    0::bigint, 0::bigint, 0::bigint, 0::bigint, 0::bigint, 0::bigint;
end;
$$;

drop materialized view if exists public.kpi_evidence_summary;
create materialized view public.kpi_evidence_summary as
  select * from public.kpi_evidence_summary_compute();

create unique index if not exists kpi_evidence_summary_uniq_idx
  on public.kpi_evidence_summary (computed_at);

-- Manual-refresh wrapper used by the /app/admin/metrics "Refresh" button.
-- Concurrency-safe form requires the unique index above.
create or replace function public.refresh_kpi_evidence_summary()
returns timestamptz
language plpgsql
security definer
set search_path = public
as $$
declare
  ts timestamptz;
begin
  refresh materialized view concurrently public.kpi_evidence_summary;
  select max(computed_at) into ts from public.kpi_evidence_summary;
  return coalesce(ts, now());
exception when feature_not_supported then
  -- First refresh after a fresh create cannot be CONCURRENT.
  refresh materialized view public.kpi_evidence_summary;
  select max(computed_at) into ts from public.kpi_evidence_summary;
  return coalesce(ts, now());
end;
$$;

grant select on public.kpi_evidence_summary to authenticated;
grant execute on function public.refresh_kpi_evidence_summary() to authenticated;
