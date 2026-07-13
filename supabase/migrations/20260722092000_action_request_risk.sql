-- Risk class on agent action requests (Agentic OS Phase 1,
-- docs/AGENTIC-OS-ARCHITECTURE.md §B.6).
--
-- Every existing request kind (email_draft, webhook, connector_action) is
-- an external action, so the backfill default is 'high'. Classification
-- for new requests lives in lib/os/policy.ts.

alter table public.agent_action_requests
  add column if not exists risk text not null default 'high';

do $$ begin
  alter table public.agent_action_requests
    add constraint agent_action_requests_risk_check
    check (risk in ('low', 'medium', 'high'));
exception
  when duplicate_object then null;
end $$;
