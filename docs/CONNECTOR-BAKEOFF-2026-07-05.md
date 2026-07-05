# Connector layer bake-off — Pipedream Connect vs Composio vs n8n

2026-07-05 · Written alongside PR 3 (the first real action path). The connector
abstraction in `lib/marketplace/agent-connectors.ts` was designed so ONE of
these can sit behind it without reshaping the product. Nothing is integrated
yet; this is the decision doc for PR 4.

## What we need it to do

1. **Per-customer connected accounts.** A pilot customer connects THEIR
   Xero/Google/CRM once; our agents then request actions against those
   accounts. We never hold raw customer credentials.
2. **Human approval stays ours.** The `agent_action_requests` gate (PR 3) is
   the contract: the connector only ever executes an action an operator
   approved. The layer must be callable per-action from our server, not an
   always-on automation running on its own schedule.
3. **NZ Privacy Act posture.** IPP 3A disclosure, clear data-flow story, and
   ideally a self-host path if a customer (council, health) requires onshore.
4. **Agent-shaped.** Tool schemas an LLM can call cleanly; MCP compatibility
   is where this is all heading.
5. **Pilot economics.** Costs that scale from 1 customer, not a platform fee.

## The three

### Pipedream Connect
- **Model:** embedded connected-accounts API — managed OAuth for ~2,700 apps;
  our server triggers actions against a customer's connected account by API.
- **Fits us:** exactly the "customer connects their tools during a pilot"
  shape; per-account pricing scales from one pilot; actions are
  server-invoked (our approval gate stays in charge); mature infra.
- **Against:** US-hosted SaaS (no self-host); another vendor in the data
  path — needs a clean IPP 3A disclosure line per connected app.

### Composio
- **Model:** agent-native tool platform — hundreds of apps exposed as
  LLM-callable tools with auth handled per "entity" (our customer), strong
  MCP alignment.
- **Fits us:** closest philosophically to agent tool-calling; entity-scoped
  auth maps to tenants; MCP direction matches where our runtime is going.
- **Against:** youngest of the three; pricing and enterprise posture less
  proven; same offshore-SaaS caveat; smaller catalogue than Pipedream where
  NZ-specific apps are concerned (Xero coverage exists in both).

### n8n
- **Model:** workflow engine, self-hostable; we'd run it (or n8n cloud) and
  expose flows as webhooks our dispatcher calls.
- **Fits us:** self-host = genuine onshore data-residency story — the only
  one of the three that can live in Sydney/NZ infra we control; webhook
  invocation slots straight into the PR 3 dispatcher unchanged.
- **Against:** we build and operate every flow (per-app OAuth apps become our
  problem); it's automation-shaped, not connected-accounts-shaped — more
  work per customer app; fair-code licence, fine for our use.

## Recommendation

**Start with Pipedream Connect behind the abstraction; keep n8n as the
sovereignty fallback; watch Composio.**

- PR 4: put Pipedream Connect behind `provider: 'pipedream_connect'` for the
  two actions pilots actually ask for first (create lead → their CRM, add row
  → their sheet). The PR 3 approval gate calls it only after a human yes.
- The `webhook` action (already dispatchable in PR 3) doubles as the n8n
  bridge — any customer who needs onshore-only can be served today by a
  self-hosted n8n receiving our approved webhooks. No new code.
- Revisit Composio when MCP tool-serving becomes the runtime's native path —
  the abstraction's `provider: 'mcp'` slot is reserved for exactly that.

Decision owner: Kate. Nothing above commits spend; Pipedream Connect has a
free dev tier for the PR 4 spike.
