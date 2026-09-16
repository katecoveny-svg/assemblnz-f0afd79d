# DO MCP gateway

**Status:** shipped slice — 16 September 2026 NZ  
**Product decision (Kate):** Layer **Composio + Zapier + Treg** where each fits. Pipedream Connect stays complementary for first-party OAuth (Gmail).

## Cursor MCP ≠ DO MCP

Cursor / Grok Bot / IDE MCP plugins **do not** flow into customer DOs. Assembl DO had no MCP runtime for DO tools until this gateway. A DO only gets tools when:

1. The DO declares `mcpAllowlist` (provider + toolId + sideEffect + approval)
2. Provider env is configured
3. Owner connects where the provider requires it
4. Runtime calls `/api/do/mcp` with a **receipt**
5. Draft / write / spend tools stay approval-gated

## Provider fit

| Provider | Fit | Env |
|---|---|---|
| **Composio** | Primary DO app toolbox (~1000 apps, managed OAuth). Default for “connect my tools.” | `COMPOSIO_API_KEY` |
| **Zapier MCP** | Long-tail / obscure apps (~9000) when Composio lacks coverage | `ZAPIER_MCP_TOKEN` |
| **Treg** | Pay-per-call data (SEO/SERP/enrichment/scraping) — **not** OAuth linking | `TREG_TOKEN` (catalog search is public) |
| **Pipedream Connect** | First-party Gmail / assembl-owned Connect paths | `PIPEDREAM_*` + `DO_GMAIL_OAUTH_APP_ID` |
| **NZ Live** | Aotearoa public/open data toolkit | Per-tool live / needs_key / stub — see `DO-NZ-LIVE.md` |

## How a DO gets tools

```
declare mcpAllowlist on AgentSpec / Household Floor
        ↓
configure provider env (honest setup_needed / stub when missing)
        ↓
owner connects (Composio OAuth · Zapier apps · Treg prepaid)
        ↓
POST /api/do/mcp { provider, toolId, arguments, approved? }
        ↓
receipt (ok | denied_* | not_configured | not_implemented | error)
```

## Ship slice (tonight)

- Schema: `apps/do/shared/do-mcp-gateway.ts`
- Runtime: `lib/do-mcp/*` — Composio list/execute spike; Zapier stub; Treg catalog + gated call; Pipedream status bridge
- API: `GET/POST /api/do/mcp`
- UI: `/do/connections#mcp-gateway` + Household Floor Connectors → MCP allowlist cards
- HF public template still shareable; optional MCP tools declared without tokens

## Honest states

| State | Meaning |
|---|---|
| setup_needed / stub | Provider env missing — **no fake live access** |
| ready | Env present; calls may still fail if owner has not connected the app |
| denied_not_allowlisted | Tool not on this DO’s allowlist |
| denied_approval_required | Side-effecting tool needs `approved: true` |
| not_implemented | Zapier execute / Pipedream-via-MCP path not wired yet |

## Related

- `docs/do-templates/DO-CONNECTORS.md` — Pipedream first-party path
- `docs/PIPEDREAM-CONNECT-SETUP.md`
- `docs/CONNECTOR-BAKEOFF-2026-07-05.md` — historical Pipedream-first; MCP slot reserved — now filled by this gateway
- Composio sessions/MCP: https://docs.composio.dev/docs/sessions-via-mcp
- Zapier MCP auth: https://docs.zapier.com/mcp/get-started/authentication
- Treg: https://treg.to/docs
