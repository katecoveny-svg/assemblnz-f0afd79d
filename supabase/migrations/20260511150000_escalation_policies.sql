-- Hybrid-services escalation-policy primitive.
-- Spec: voyage-hybrid-services.md §6 — the single architectural gap to close
-- before the Operator-as-platform tier can credibly serve mental-health,
-- finance, co-parenting, and care-coordination operators.
--
-- Model
-- -----
--   escalation_policies      — per-tenant rules: when AI sees X in client Y at
--                              severity Z, route to human role within SLA.
--   escalation_events        — append-only log of every fire; integrity-stamped
--                              and idempotent on (policy_id, trigger_hash).
--
-- The Tā layer of the Mana Trust Layer reads escalation_policies during
-- in-flight stamping; when a signal matches, it writes an escalation_events
-- row and blocks downstream automated action until ack'd. The
-- `escalation-policy-check` edge function is the read/evaluate path; this
-- migration is the schema.
--
-- Idempotent. Safe to re-run.

-- ─────────────────────────────────────────────────────────────────────────────
-- escalation_policies
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.escalation_policies (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null,
  name            text not null,
  description     text,

  -- What to look for. JSON shape:
  --   { "kind": "keyword"    , "patterns": ["suicide", "harm myself"], "case_insensitive": true }
  --   { "kind": "drift"      , "metric": "missed_handovers_30d", "gte": 2 }
  --   { "kind": "amount"     , "field": "expense.amount_nzd", "gte": 500 }
  --   { "kind": "regex"      , "pattern": "\\bIRD\\b.*owed", "flags": "i" }
  --   { "kind": "tone"       , "score_gte": 0.85, "label": "coercive" }
  trigger         jsonb not null,

  severity        smallint not null check (severity between 1 and 5),

  -- Who handles it. Free text role label resolved by the operator
  -- (e.g. 'navigator', 'clinician', 'lawyer_for_child', 'supervisor').
  route_to_role   text not null,

  -- Service-level objective in seconds. 0 = synchronous block.
  sla_seconds     integer not null default 3600,

  -- Side effects.
  block_automation boolean not null default true,
  notify_channels  text[] not null default array['dashboard'],

  -- Lifecycle.
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  created_by      uuid,

  -- Defensive: a tenant can have many policies but names must be unique
  -- within tenant to keep dashboards readable.
  constraint escalation_policies_tenant_name_unique unique (tenant_id, name)
);

create index if not exists escalation_policies_tenant_active_idx
  on public.escalation_policies (tenant_id, is_active);

comment on table public.escalation_policies is
  'Hybrid-services escalation rules. Evaluated by the Tā layer in-flight; ' ||
  'firings recorded in escalation_events.';

-- ─────────────────────────────────────────────────────────────────────────────
-- escalation_events
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.escalation_events (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null,
  policy_id       uuid not null references public.escalation_policies(id) on delete restrict,

  -- Subject. client_id is the hybrid-service operator's client (family,
  -- learner, patient, household). Free-form because every operator models
  -- 'client' differently — the operator's own table holds the canonical row.
  client_id       text not null,

  -- What fired.
  severity        smallint not null check (severity between 1 and 5),
  matched_signal  jsonb not null,
  source_message_id uuid,

  -- Idempotency key: a stable hash over (policy_id, client_id, trigger_window,
  -- matched_content). Same signal in the same window must not fire twice.
  trigger_hash    text not null,

  -- Status machine: pending → acknowledged → resolved | dismissed.
  status          text not null default 'pending'
                    check (status in ('pending','acknowledged','resolved','dismissed')),
  acknowledged_at timestamptz,
  acknowledged_by uuid,
  resolved_at     timestamptz,
  resolved_by     uuid,
  resolution_note text,

  -- Mana Trust Layer integration. Set when an automated action is blocked;
  -- unblocked when status moves to acknowledged or resolved.
  blocked_at      timestamptz,
  unblocked_at    timestamptz,

  -- Hash-chain stamp. Written by signal-security.logWithHashChain so the
  -- escalation log is itself court-admissible — non-trivial for the
  -- co-parenting and mental-health archetypes.
  prev_hash       text,
  this_hash       text,

  created_at      timestamptz not null default now(),

  constraint escalation_events_policy_trigger_unique unique (policy_id, trigger_hash)
);

create index if not exists escalation_events_tenant_client_idx
  on public.escalation_events (tenant_id, client_id, created_at desc);

create index if not exists escalation_events_status_idx
  on public.escalation_events (tenant_id, status, severity desc, created_at desc);

comment on table public.escalation_events is
  'Append-only firings of escalation_policies. Idempotent on (policy_id, ' ||
  'trigger_hash). Integrity is preserved via the SIGNAL hash-chain stamp.';

-- ─────────────────────────────────────────────────────────────────────────────
-- updated_at trigger for escalation_policies
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.escalation_policies_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists escalation_policies_touch_updated_at on public.escalation_policies;
create trigger escalation_policies_touch_updated_at
  before update on public.escalation_policies
  for each row execute function public.escalation_policies_touch_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- Row-level security
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.escalation_policies enable row level security;
alter table public.escalation_events   enable row level security;

-- Policy: tenant members can read their tenant's policies and events.
-- The exact role check goes through the has_role RPC, but until that's
-- wired we fall back to comparing the JWT 'sub' claim to tenant_id rows the
-- caller is a member of via user_roles. This block assumes user_roles
-- exists; if not, the RLS stays restrictive (deny by default) until you
-- wire it.

do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'user_roles'
  ) then
    -- Read
    drop policy if exists escalation_policies_select on public.escalation_policies;
    create policy escalation_policies_select on public.escalation_policies
      for select using (
        exists (
          select 1 from public.user_roles ur
          where ur.user_id = auth.uid()
            and ur.tenant_id = escalation_policies.tenant_id
        )
      );

    drop policy if exists escalation_events_select on public.escalation_events;
    create policy escalation_events_select on public.escalation_events
      for select using (
        exists (
          select 1 from public.user_roles ur
          where ur.user_id = auth.uid()
            and ur.tenant_id = escalation_events.tenant_id
        )
      );

    -- Insert / update on policies: admins of the tenant only.
    drop policy if exists escalation_policies_admin_write on public.escalation_policies;
    create policy escalation_policies_admin_write on public.escalation_policies
      for all using (
        exists (
          select 1 from public.user_roles ur
          where ur.user_id = auth.uid()
            and ur.tenant_id = escalation_policies.tenant_id
            and ur.role = 'admin'
        )
      );

    -- Events are written by the edge function via service_role; service_role
    -- bypasses RLS, so we leave write policies off here. Acks/resolves go
    -- through a dedicated RPC.
  else
    raise notice
      'user_roles table not present — escalation_* RLS left deny-by-default. '
      'Wire user_roles, then re-run this migration to attach policies.';
  end if;
end $$;
