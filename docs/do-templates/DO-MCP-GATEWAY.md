# DO MCP gateway

**Status:** shipped slice — 16 September 2026 NZ  
**Product decision (Kate):** Four-layer DO tool stack — **MCP Market Hub** (discovery/pack) + **Composio / Zapier / Treg** (execute) + **Pipedream** (first-party OAuth) + **NZ Live** (domain toolkit). Cursor MCP ≠ DO MCP.

## Cursor MCP ≠ DO MCP

Cursor / Grok Bot / IDE MCP plugins **do not** flow into customer DOs. Assembl DO had no MCP runtime for DO tools until this gateway. A DO only gets tools when:

1. The DO declares `mcpAllowlist` (provider + toolId + sideEffect + approval)
2. Provider env is configured (where required)
3. Owner connects where the provider requires it
4. Runtime calls `/api/do/mcp` with a **receipt**
5. Draft / write / spend tools stay approval-gated

## Four-layer stack

| Layer | Provider | Fit | Env |
|---|---|---|---|
| **1. Discovery + pack** | **MCP Market Hub** | Browse catalog, version skills/MCPs, bundle toolkits, attach allowlist to a DO — **not** execute | `MCP_MARKET_HUB_API_KEY` (optional; catalog HTTP stub until Hub publishes API docs) |
| **2. Execution** | **Composio** | Primary DO app toolbox (~1000 apps, managed OAuth) | `COMPOSIO_API_KEY` |
| **2. Execution** | **Zapier MCP** | Long-tail / obscure apps (~9000) when Composio lacks coverage | `ZAPIER_MCP_TOKEN` |
| **2. Execution** | **Treg** | Pay-per-call data (SEO/SERP/enrichment) — **not** OAuth linking | `TREG_TOKEN` (catalog search is public) |
| **3. First-party OAuth** | **Pipedream Connect** | First-party Gmail / assembl-owned Connect paths | `PIPEDREAM_*` + `DO_GMAIL_OAUTH_APP_ID` |
| **4. Domain toolkit** | **NZ Live** | Aotearoa public/open data | Per-tool live / needs_key / stub — see `DO-NZ-LIVE.md` |

Hub detail + lookalikes (MCP360, Glama): `docs/do-templates/DO-MCP-MARKET-HUB.md`

## How a DO gets tools

```
optional: discover / pack toolkit on MCP Market Hub
        ↓
declare mcpAllowlist on AgentSpec / Household Floor
        ↓
configure provider env (honest setup_needed / stub when missing)
        ↓
owner connects (Hub toolkit attach · Composio OAuth · Zapier apps · Treg prepaid)
        ↓
POST /api/do/mcp { provider, toolId, arguments, approved? }
        ↓
receipt (ok | denied_* | not_configured | not_implemented | error)
```

## Ship slice

- Schema: `apps/do/shared/do-mcp-gateway.ts` + `mcp-market-hub-pack.ts`
- Runtime: `lib/do-mcp/*` — Composio list/execute spike; Zapier stub; Treg catalog + gated call; Hub browse/search stub + attach local_draft; Pipedream status bridge; NZ Live
- API: `GET/POST /api/do/mcp`
- UI: `/do/connections#mcp-gateway` — providers, Hub attach form, NZ Live cards, spike allowlist
- HF public template still shareable; optional MCP tools declared without tokens

## Honest states

| State | Meaning |
|---|---|
| setup_needed / stub | Provider env missing or Hub catalog HTTP not wired — **no fake live access** |
| ready | Env present; calls may still fail if owner has not connected the app |
| denied_not_allowlisted | Tool not on this DO’s allowlist |
| denied_approval_required | Side-effecting tool needs `approved: true` |
| not_implemented | Zapier execute / Pipedream-via-MCP / Hub catalog HTTP not wired yet |
| local_draft (Hub) | Toolkit id attached in Assembl only — not claimed as Hub cloud sync |

## Related

- `docs/do-templates/DO-MCP-MARKET-HUB.md` — Hub product + lookalikes
- `docs/do-templates/DO-NZ-LIVE.md` — NZ Live toolkit
- `docs/do-templates/DO-CONNECTORS.md` — Pipedream first-party path
- `docs/PIPEDREAM-CONNECT-SETUP.md`
- `docs/CONNECTOR-BAKEOFF-2026-07-05.md` — historical Pipedream-first; MCP slot reserved — now filled by this gateway
- Composio sessions/MCP: https://docs.composio.dev/docs/sessions-via-mcp
- Zapier MCP auth: https://docs.zapier.com/mcp/get-started/authentication
- Treg: https://treg.to/docs
- MCP Market Hub: https://mcpmarket.com/hub
