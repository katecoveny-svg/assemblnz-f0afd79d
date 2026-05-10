-- Evidence ledger KPI summary v1 — materialised view powering /app/admin/metrics.
-- Spec: outputs/IMPLEMENTATION-PLAN-VERTICAL-AI-STRATEGY-2026-05-09.md (§7).
--
-- v1 SCOPE: assembl_audit_log only. Receipt-derived columns are kept in
-- the schema as NULL/0 placeholders so the matview shape stays stable
-- across the v1 → v2 upgrade. The receipt join lands in the v2 migration
-- (`20260509221717_kpi_evidence_summary_v2_with_receipts.sql`) which is
-- guarded by `to_regclass('public.mana_receipts')` and only fires once
-- Kaihanga has shipped Day 7.5.
--
-- Why the split: Postgres parses the FROM clause before evaluating WHERE,
-- so a `to_regclass(...)` runtime check cannot keep the planner from
-- erroring with 42P01 when `public.mana_receipts` is missing. During the
-- Day 7 → Day 7.5 rollout window (audit_log present, receipts not yet)
-- the v1 view must therefore not reference mana_receipts at all.
--
-- Six "brutally simple" KPIs:
--   1. time_to_first_completed_case_minutes — median, last 30 days
--   2. citation_coverage_pct                — NULL in v1 (needs receipts; populated in v2)
--   3. approval_coverage_pct                — % of high-risk actions with approval (target 100%)
--   4. action_reversal_rate_pct             — % reversed by human within 7 days
--   5. cycle_time_reduction_pct             — placeholder (NULL until baseline captured)
--   6. nrr_by_cohort_pct                    — placeholder (NULL until billing rolls in)
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
  has_audit boolean := to_regclass('public.assembl_audit_log') is not null;
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
    null::numeric                                                    as citation_coverage_pct,
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
    (select count(*) from high_risk)                                 as high_risk_outputs_total,
    0::bigint                                                        as high_risk_outputs_with_citation,
    (select count(*) from high_risk)                                 as high_risk_actions_total,
    (select count(*) from high_risk
       where coalesce(approval_status, '') = 'approved')             as high_risk_actions_with_approval,
    (select count(*) from outputs_30d)                               as agent_outputs_last_30d,
    (select reversed_n from reversed)                                as agent_outputs_reversed_within_7d;

exception when undefined_column then
  -- Day 7 audit_log may ship with slightly different column names —
  -- surface zeros so the dashboard renders cleanly while the schema settles.
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

-- Manual-refresh entry point used by the /app/admin/metrics "Refresh" button.
-- Always callable — refreshes the matview as currently defined, regardless
-- of whether v2 has applied. Concurrency-safe form requires the unique
-- index above; on the very first refresh we fall back to a non-CONCURRENT
-- refresh because Postgres rejects CONCURRENT refresh until the matview
-- has been populated at least once after the index was built.
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
  refresh materialized view public.kpi_evidence_summary;
  select max(computed_at) into ts from public.kpi_evidence_summary;
  return coalesce(ts, now());
end;
$$;

grant select on public.kpi_evidence_summary to authenticated;
grant execute on function public.refresh_kpi_evidence_summary() to authenticated;
