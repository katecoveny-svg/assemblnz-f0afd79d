-- Hybrid-services billable-unit primitives.
-- Spec: voyage-hybrid-services.md §5 item 5 — Assembl charges per *seat*
-- today; hybrid-service operators bill their downstream clients per *client*
-- per *month* on a cadence. These two tables let the platform model that
-- without changing how Assembl itself is billed.
--
--   client_seats   — the operator's downstream client roster: one row per
--                    family / household / learner / patient / SME the
--                    operator services. Has a cadence and a unit price the
--                    operator collects from them (independent of what the
--                    operator pays Assembl).
--
--   cadence_runs   — append-only log of every scheduled touchpoint
--                    (weekly check-in, monthly review, quarterly evidence
--                    pack). Acts as the billable-unit ledger and the
--                    operator's cadence dashboard source of truth.
--
-- Idempotent. Safe to re-run.

-- ─────────────────────────────────────────────────────────────────────────────
-- client_seats
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.client_seats (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null,             -- the operator's Assembl tenant
  operator_id     uuid not null,             -- the operator user (creator)

  -- The downstream client. Identity is whatever the operator models —
  -- a household name, a learner email, a family code. Display name is what
  -- the operator sees in their dashboard.
  external_ref    text,                      -- operator-side ID, may be null
  display_name    text not null,

  -- Archetype the seat is being delivered under. Free text so a workflow
  -- template can register new archetypes without a migration.
  archetype       text not null,             -- e.g. 'co_parenting', 'finance_navigator'

  -- Cadence. ISO 8601 duration (P1W, P1M, P3M). The cadence_runs scheduler
  -- reads this to decide when the next touchpoint is due.
  cadence         text not null default 'P1M',
  next_run_at     timestamptz,

  -- What the operator charges the client.  Independent of Assembl pricing.
  unit_price_nzd  numeric(10,2),
  billing_status  text not null default 'active'
                    check (billing_status in ('active','paused','cancelled')),

  -- Light metadata blob — escalation defaults, preferred channel, etc.
  metadata        jsonb not null default '{}'::jsonb,

  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  constraint client_seats_tenant_ref_unique unique (tenant_id, external_ref)
);

create index if not exists client_seats_tenant_active_idx
  on public.client_seats (tenant_id, is_active);

create index if not exists client_seats_operator_idx
  on public.client_seats (operator_id, is_active);

create index if not exists client_seats_next_run_idx
  on public.client_seats (next_run_at)
  where is_active and billing_status = 'active';

comment on table public.client_seats is
  'Operator-side roster of downstream clients (families, learners, ' ||
  'households, SMEs). One row per billable subscription the operator ' ||
  'runs on top of Assembl.';

-- ─────────────────────────────────────────────────────────────────────────────
-- cadence_runs
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.cadence_runs (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null,
  seat_id         uuid not null references public.client_seats(id) on delete cascade,

  -- What ran. Free text aligned to the workflow template (e.g.
  -- 'weekly_check_in', 'monthly_posture_pack', 'quarterly_review').
  run_kind        text not null,

  scheduled_at    timestamptz not null,
  started_at      timestamptz,
  completed_at    timestamptz,

  status          text not null default 'scheduled'
                    check (status in ('scheduled','in_progress','completed','skipped','failed')),

  -- Evidence pack pointer. The operator's tier dictates whether the run
  -- produces an evidence pack (compliance docs, posture summary, court-
  -- ready bundle) — when it does, evidence_pack_id is the FK to evidence_packs.
  evidence_pack_id uuid,

  -- Outputs counted against the tenant's Assembl Subscribe quota.
  outputs_count   integer not null default 0,

  -- Free-form payload — the workflow template decides what lives here
  -- (check-in summary, expense ledger delta, flagged escalations).
  payload         jsonb not null default '{}'::jsonb,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists cadence_runs_seat_scheduled_idx
  on public.cadence_runs (seat_id, scheduled_at desc);

create index if not exists cadence_runs_tenant_status_idx
  on public.cadence_runs (tenant_id, status, scheduled_at desc);

create index if not exists cadence_runs_pending_idx
  on public.cadence_runs (scheduled_at)
  where status = 'scheduled';

comment on table public.cadence_runs is
  'Append-only log of every scheduled cadence touchpoint per client_seat. ' ||
  'Billable-unit ledger for the operator and Subscribe-quota source for ' ||
  'the Assembl tenant.';

-- ─────────────────────────────────────────────────────────────────────────────
-- Touch triggers
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.client_seats_touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end;
$$;

drop trigger if exists client_seats_touch_updated_at on public.client_seats;
create trigger client_seats_touch_updated_at
  before update on public.client_seats
  for each row execute function public.client_seats_touch_updated_at();

create or replace function public.cadence_runs_touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end;
$$;

drop trigger if exists cadence_runs_touch_updated_at on public.cadence_runs;
create trigger cadence_runs_touch_updated_at
  before update on public.cadence_runs
  for each row execute function public.cadence_runs_touch_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS — same posture as escalation_policies (deny by default; attach
-- policies only if user_roles exists).
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.client_seats enable row level security;
alter table public.cadence_runs enable row level security;

do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'user_roles'
  ) then
    drop policy if exists client_seats_select on public.client_seats;
    create policy client_seats_select on public.client_seats
      for select using (
        exists (
          select 1 from public.user_roles ur
          where ur.user_id = auth.uid()
            and ur.tenant_id = client_seats.tenant_id
        )
      );

    drop policy if exists client_seats_write on public.client_seats;
    create policy client_seats_write on public.client_seats
      for all using (
        exists (
          select 1 from public.user_roles ur
          where ur.user_id = auth.uid()
            and ur.tenant_id = client_seats.tenant_id
            and ur.role in ('admin','operator')
        )
      );

    drop policy if exists cadence_runs_select on public.cadence_runs;
    create policy cadence_runs_select on public.cadence_runs
      for select using (
        exists (
          select 1 from public.user_roles ur
          where ur.user_id = auth.uid()
            and ur.tenant_id = cadence_runs.tenant_id
        )
      );
  else
    raise notice
      'user_roles table not present — client_seats / cadence_runs RLS left ' ||
      'deny-by-default. Wire user_roles, then re-run.';
  end if;
end $$;
