-- Connector actions (PR 4) — third action kind for agent_action_requests.
--
-- 'connector_action' rows carry a business action to run against a customer's
-- OWN connected account through the connector layer (Pipedream Connect behind
-- lib/connectors/pipedream.ts). Same contract as the other kinds: pending →
-- named-operator decision on /admin/approvals → dispatch only with
-- ACTION_DISPATCH_ENABLED=true AND the connector configured. Idempotent.

alter table public.agent_action_requests
  drop constraint if exists agent_action_requests_kind_check;
alter table public.agent_action_requests
  add constraint agent_action_requests_kind_check
  check (kind in ('email_draft', 'webhook', 'connector_action'));
