-- Reasoning + outcome ledger.
-- Spec: voyage-hybrid-services.md §7 follow-up — the single highest-leverage
-- investment is binding every reasoning trace to a real-world outcome event.
-- Frontier model labs set the reasoning ceiling; this ledger is the dataset
-- that lets Assembl train its own judgement layer on top of any model,
-- indefinitely.
--
-- Tables
-- ------
--   reasoning_traces   — one row per model invocation. Captures the question,
--                        the visible draft, the extended-thinking trace, the
--                        agent + model + tier, and the hash-chain stamp from
--                        the SIGNAL audit log.
--   outcome_events     — append-only log of real-world outcomes (BCA accept,
--                        Customs accept, FCP pass, court directions met,
--                        client signed, escalation resolved). Bound to one
--                        or more reasoning_traces by trace_id refs.
--   reasoning_outcomes — materialised join view: trace → draft → outcome.
--                        This is the dataset for eval, regression detection,
--                        and (eventually) reinforcement training of
--                        Assembl's own judgement layer.
--
-- Idempotent. Safe to re-run.

-- ─────────────────────────────────────────────────────────────────────────────
-- reasoning_traces
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.reasoning_traces (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null,
  agent_id        text not null,              -- 'manaaki', 'arai', 'iho-router', …
  model_id        text not null,              -- 'claude-3-5-sonnet-latest', 'gemini-2.5-pro', …
  tier            smallint,                   -- Mana Trust Layer tier (1–4)

  -- The prompt envelope. Stored as JSONB so we can record:
  --   { "system": "...", "messages": [...], "tools": [...] }
  -- PII-masked already (Kahu has run by the time this insert lands).
  request         jsonb not null,

  -- The visible response (what the user / queue sees).
  draft           text,

  -- Extended thinking trace. Stored as text because the format varies by
  -- provider (Anthropic interleaved blocks vs Gemini thought summaries).
  -- Optional — not every model exposes it.
  thinking        text,

  -- Tool-call audit (what tools the agent invoked while reasoning).
  tool_calls      jsonb not null default '[]'::jsonb,

  -- Counts. We log them rather than recompute so we can answer "how much
  -- thinking did this draft take" without a re-tokenise pass.
  input_tokens    integer,
  output_tokens   integer,
  thinking_tokens integer,

  -- Latency / cost — for the eval harness.
  latency_ms      integer,
  cost_nzd        numeric(10,5),

  -- Confidence signals. The judge layer writes here on every eval pass.
  self_critique   text,
  quality_score   numeric(3,2),               -- 0.00–1.00
  flagged         boolean not null default false,
  flag_reason     text,

  -- Hash-chain stamp (mirrors signal-security.logWithHashChain).
  prev_hash       text,
  this_hash       text,

  -- Cross-references to other Mana Trust Layer artefacts.
  conversation_id uuid,
  audit_log_id    uuid,
  evidence_pack_id uuid,
  escalation_event_id uuid,

  created_at      timestamptz not null default now()
);

create index if not exists reasoning_traces_tenant_created_idx
  on public.reasoning_traces (tenant_id, created_at desc);

create index if not exists reasoning_traces_agent_model_idx
  on public.reasoning_traces (agent_id, model_id, created_at desc);

create index if not exists reasoning_traces_quality_idx
  on public.reasoning_traces (tenant_id, quality_score)
  where flagged or quality_score is not null;

comment on table public.reasoning_traces is
  'Per-tenant ledger of every model invocation: request, draft, thinking trace, tool calls, confidence signals, and hash-chain stamp. Source dataset for the eval harness and Assembl''s own judgement layer.';

-- ─────────────────────────────────────────────────────────────────────────────
-- outcome_events
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.outcome_events (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null,

  -- Real-world classification. Free text against an aspirational enum so
  -- new kete can register new outcome kinds without a migration.
  --   'bca_accept' | 'bca_reject' | 'customs_accept' | 'customs_query' |
  --   'fcp_pass' | 'fcp_fail' | 'client_signed' | 'client_disputed' |
  --   'court_direction_met' | 'court_direction_breached' |
  --   'escalation_acknowledged' | 'escalation_resolved' |
  --   'invoice_paid' | 'invoice_overdue' | 'lead_converted' | 'lead_lost' |
  --   'subscription_renewed' | 'subscription_churned' | …
  kind            text not null,
  result          text not null check (result in ('positive','neutral','negative')),

  -- Subject. Free text so it can be a client_id, a project_id, a case_id.
  subject_ref     text,
  subject_kind    text,                       -- 'client_seat', 'project', 'case', 'invoice'

  -- The reasoning trace(s) that produced the artefact this outcome judges.
  -- Many-to-one is common (one outcome can validate a chain of drafts).
  trace_ids       uuid[] not null default array[]::uuid[],

  -- Free-form structured detail (BCA reference number, court order ID,
  -- Stripe payment intent, etc.).
  payload         jsonb not null default '{}'::jsonb,

  -- Source: how Assembl learned about it.
  --   'webhook'   — external system pushed (Stripe, TNZ, Trade Single Window)
  --   'operator'  — human marked it in the dashboard
  --   'agent'     — an Assembl agent observed it (e.g. inbox scrape)
  --   'inferred'  — derived (e.g. silence-equals-accept after N days)
  source          text not null check (source in ('webhook','operator','agent','inferred')),

  observed_at     timestamptz not null default now(),
  created_at      timestamptz not null default now()
);

create index if not exists outcome_events_tenant_kind_idx
  on public.outcome_events (tenant_id, kind, observed_at desc);

create index if not exists outcome_events_subject_idx
  on public.outcome_events (tenant_id, subject_kind, subject_ref, observed_at desc);

create index if not exists outcome_events_trace_ids_gin
  on public.outcome_events using gin (trace_ids);

comment on table public.outcome_events is
  'Append-only log of real-world outcomes (BCA accepts, Customs accepts, client signed, court directions met). Bound to reasoning_traces by trace_ids. The "did Assembl actually help" ledger.';

-- ─────────────────────────────────────────────────────────────────────────────
-- View: reasoning_outcomes
-- ─────────────────────────────────────────────────────────────────────────────
-- Flat read model for the eval harness. One row per (trace, outcome) pair.
-- A trace with no matching outcome appears with outcome columns null —
-- useful for "how many drafts produced no measurable outcome yet."

create or replace view public.reasoning_outcomes as
select
  t.id              as trace_id,
  t.tenant_id,
  t.agent_id,
  t.model_id,
  t.tier,
  t.quality_score,
  t.flagged,
  t.input_tokens,
  t.output_tokens,
  t.thinking_tokens,
  t.latency_ms,
  t.cost_nzd,
  t.created_at      as trace_created_at,
  o.id              as outcome_id,
  o.kind            as outcome_kind,
  o.result          as outcome_result,
  o.subject_ref,
  o.subject_kind,
  o.source          as outcome_source,
  o.observed_at     as outcome_observed_at,
  (o.observed_at - t.created_at) as time_to_outcome
from public.reasoning_traces t
left join public.outcome_events o
  on t.id = any(o.trace_ids)
  and t.tenant_id = o.tenant_id;

comment on view public.reasoning_outcomes is
  'Flat trace-to-outcome join. The eval harness reads this to compute per-agent / per-model accuracy, regression deltas, and the time-to-outcome distribution.';

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS — deny-by-default; service_role bypasses for the
-- reasoning-trace-ingest function and outcome-event webhooks.
-- Tenant-scoped read policies attach in a follow-up migration once the
-- canonical tenant model on user_roles (or tenants_members) is finalised.
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.reasoning_traces enable row level security;
alter table public.outcome_events   enable row level security;
