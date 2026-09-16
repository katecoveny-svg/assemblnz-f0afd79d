# MCP Market Hub (DO discovery / toolkit packing)

**Status:** schema + honest stubs — 16 September 2026 NZ  
**Product Kate named:** [MCP Market Hub](https://mcpmarket.com/hub) (directory [mcpmarket.com](https://mcpmarket.com) · app [app.mcpmarket.com](https://app.mcpmarket.com))

## What Hub is

Create, version, and sync **agent skills + MCP tools**. Browse the catalog, deploy custom MCPs, bundle into **toolkits**, install/sync to MCP clients via plugin.

It is a **registry / toolkit hub** — not primarily an action-execution gateway.

## Fit in Assembl DO (four layers)

| Layer | Provider(s) | Role |
|---|---|---|
| **1. Discovery + pack** | **MCP Market Hub** (`mcp_market_hub`) | Browse catalog, attach a toolkit / allowlist to a DO |
| **2. Execution** | Composio · Zapier · Treg | Run allowlisted tools with receipts |
| **3. First-party OAuth** | Pipedream Connect | Existing Gmail / assembl-owned Connect |
| **4. Domain toolkits** | NZ Live | Curated public/open data packs |

Execution providers are **unchanged**. Hub sits upstream: discover → pack → attach → then execute through Composio/Zapier/Treg (or NZ Live / Pipedream where those fit).

## Honest stubs (no fake live Hub calls)

No public Hub catalog REST API is documented for Assembl to call yet.

| Tool | Behaviour today |
|---|---|
| `browse_catalog` | `not_configured` / `not_implemented` + connect URLs — **never invents catalog rows** |
| `search_catalog` | Same honesty for query search |
| `attach_toolkit` | Records a toolkit id/URL as **`local_draft`** on the signed-in DO owner (approval required). Does **not** claim Hub cloud sync |
| `list_attached_toolkits` | Lists local drafts only |

Optional env: `MCP_MARKET_HUB_API_KEY` — reserved for when Hub publishes a documented client contract. Even with the key set, catalog HTTP stays stub until that client exists.

## Connect path

1. Open https://mcpmarket.com/hub (or https://app.mcpmarket.com)
2. Create/version skills + MCPs; bundle a toolkit
3. On `/do/connections#mcp-gateway` → **Attach Hub toolkit**, paste toolkit id/URL
4. Assembl stores `local_draft` — then allowlist concrete execute tools via Composio/Zapier/Treg as usual

## Nearby lookalikes (not what Kate named)

| Product | Note |
|---|---|
| **MCP360** | Universal execute / gateway style — closer to Composio than Hub’s registry + toolkit packing |
| **Glama** | Marketplace + gateway hybrid — useful catalogue reference; not the Hub attach model |

## Code

- Pack: `apps/do/shared/mcp-market-hub-pack.ts`
- Runtime: `lib/do-mcp/mcp-market-hub.ts`
- Provider id: `mcp_market_hub` on `DO_MCP_PROVIDERS`
- Docs sibling: `docs/do-templates/DO-MCP-GATEWAY.md`
