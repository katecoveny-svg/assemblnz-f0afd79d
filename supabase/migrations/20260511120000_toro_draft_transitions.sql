-- Tōro approval-tray state machine — audit table + extended status enum.
-- Spec: outputs/TORO-V0.1-ARCHITECTURE-SPEC-2026-05-11.md §4.4 (LangGraph-style).
-- Hard rule §8.22: every toro_drafts.status change writes a toro_draft_transitions row.
-- Idempotent: safe to re-run; check constraint is dropped+recreated, table guarded.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. New states: 'reviewing', 'send_failed', 'expired'.
--    Existing 'failed' rows migrated to 'send_failed' before constraint swap.
--    All eight states from §4.4 land in the new check.
-- ─────────────────────────────────────────────────────────────────────────────

update public.toro_drafts
   set status = 'send_failed'
 where status = 'failed';

alter table public.toro_drafts
  drop constraint if exists toro_drafts_status_check;

alter table public.toro_drafts
  add constraint toro_drafts_status_check
  check (status in (
    'pending_approval',
    'reviewing',
    'approved',
    'edited_then_approved',
    'rejected',
    'sent',
    'send_failed',
    'expired'
  ));

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Transitions audit table.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.toro_draft_transitions (
  id              uuid primary key default gen_random_uuid(),
  draft_id        uuid not null references public.toro_drafts(id) on delete cascade,
  tenant_id       uuid not null,
  from_state      text,
  to_state        text not null,
  transitioned_by uuid references auth.users(id),
  transitioned_at timestamptz not null default now(),
  reason          text,
  metadata        jsonb not null default '{}'::jsonb
);

create index if not exists idx_toro_draft_transitions_draft
  on public.toro_draft_transitions (draft_id, transitioned_at desc);

create index if not exists idx_toro_draft_transitions_tenant
  on public.toro_draft_transitions (tenant_id, transitioned_at desc);

alter table public.toro_draft_transitions enable row level security;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. RLS — SELECT for tenant members; INSERT/UPDATE/DELETE refused to clients.
--    All writes happen via server actions running with the user's JWT; the
--    state machine inserts each row in the same transaction as the draft
--    UPDATE so the audit chain is unbreakable. No client-side row writes.
-- ─────────────────────────────────────────────────────────────────────────────

do $$ begin
  if not exists (
    select 1 from pg_policies
     where schemaname = 'public' and tablename = 'toro_draft_transitions'
       and policyname = 'tenant members read draft transitions'
  ) then
    create policy "tenant members read draft transitions"
      on public.toro_draft_transitions
      for select
      using (public.is_tenant_member(tenant_id));
  end if;
end $$;

-- Deliberately NO insert / update / delete policy. Clients cannot write
-- to this table directly. Server actions write via the service role
-- (when needed) or via the user's JWT inside the same transaction as the
-- draft status update — both paths are out of scope for the client-side
-- RLS gate. If a future feature needs client-side inserts, it must add a
-- policy with `with check (public.is_tenant_member(tenant_id) and
-- transitioned_by = auth.uid())`.

grant select on public.toro_draft_transitions to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Sanity comment.
-- ─────────────────────────────────────────────────────────────────────────────

comment on table public.toro_draft_transitions is
  'Audit chain for Tōro draft state machine (spec §4.4). Every status ' ||
  'change on toro_drafts writes one row here. Read-only via RLS for ' ||
  'tenant members; writes happen in the same transaction as the parent ' ||
  'draft update from lib/toro/state-machine.ts.';
