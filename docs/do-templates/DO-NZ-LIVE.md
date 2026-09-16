# NZ Live — DO toolkit

**Status:** shipped basics — 16 September 2026 NZ  
**Provider id:** `nz_live` on the DO MCP gateway  
**Product:** named toolkit on `/do/connections` — per-tool `live` | `needs_key` | `stub`

## Basics Kate asked for

| Tool | Status | Wiring |
|---|---|---|
| Auckland Transport bus positions | needs_key (`AT_API_KEY`) | `supabase/functions/bus-positions` → api.at.govt.nz |
| NZ weather forecast | **live** | `nz-weather` → Open-Meteo (labelled; not MetService official API) |
| NZ marine weather | **live** | `marine-weather` → Open-Meteo marine |
| MetService alerts | **stub** | pending `METSERVICE_API_KEY` / official API |
| NZBN search | needs_key (`NZBN_API_KEY`) | `mcp-nz-govt` `nzbn_search` |
| Waka Kotahi traffic | **stub** | docs only — [use our data](https://www.nzta.govt.nz/about-us/about-this-site/use-our-data/) |
| GeoNet quakes / news | **live** | `api.geonet.org.nz` direct |
| Parliament bills | **live** | bills.parliament.nz search API |
| Beehive releases | **live** | beehive.govt.nz RSS |
| NZ news RSS | **live** | `mcp-news` `rss_feed` |
| NZ news search | needs_key (`NEWSAPI_KEY`) | `mcp-news` search |
| **PCO legislation** | **live** when `PCO_API_KEY` is on Supabase edge | DO: `mcp-nz-govt` `legislation_search` · KB ingest: `adapter-pco` — **same single secret** |
| NZ fuel prices | **live** | `nz-fuel-prices` (MBIE; fallback labelled) |

## PCO legislation (Kate confirmed)

Kate already holds a **PCO_API_KEY** (requested June; emailed by PCO). Legislation is already pulling live through the edge.

- **Single key path:** Supabase edge secret `PCO_API_KEY` — used by both `mcp-nz-govt` (interactive DO search) and `adapter-pco` (Knowledge Brain ingest).
- **Do not invent a second key path** or mirror requirement for Next.js. Status UI probes the edge envelope (provider + result) when Next.js does not mirror the secret.
- **Never log the raw secret.** If rotation or paste is needed, use a secure channel only.
- DO tool id: `pco_legislation` → `POST /functions/v1/mcp-nz-govt` `{ "action": "legislation_search", "query": "…" }`

## Env vars

Set on **Supabase edge secrets** (mirror into `.env.local` only when you want Next.js-local status without probing):

- `AT_API_KEY`
- `NZBN_API_KEY`
- `PCO_API_KEY` — **edge secret; DO + adapter-pco**
- `NEWSAPI_KEY`
- `METSERVICE_API_KEY` (future alerts)
- `MAPBOX_TOKEN` / `VITE_MAPBOX_TOKEN` (routes — adjacent, not traffic)

Keyless tools do not need these.

## Call path

```
POST /api/do/mcp
{ "provider": "nz_live", "toolId": "pco_legislation", "arguments": { "query": "Privacy Act" } }
→ receipt
```

Household Floor optionally allowlists AT buses, NZ weather, GeoNet, and PCO legislation.

## Honesty

Never invent live AT or NZTA traffic. Open-Meteo weather is labelled as such. Stub tools return `not_configured` / error receipts. PCO live status requires a real PCO provider+result envelope — fallback search-URL-only responses stay `needs_key`.

## Related

- `apps/do/shared/nz-live-pack.ts`
- `lib/do-mcp/nz-live.ts`
- `supabase/functions/mcp-nz-govt/index.ts`
- `supabase/functions/adapter-pco/index.ts`
- `docs/do-templates/DO-MCP-GATEWAY.md`
