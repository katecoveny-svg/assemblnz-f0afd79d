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
| PCO legislation | needs_key (`PCO_API_KEY`) | `mcp-nz-govt` / `adapter-pco` |
| NZ fuel prices | **live** | `nz-fuel-prices` (MBIE; fallback labelled) |

## Env vars

Set on **Supabase edge secrets** (and optionally mirror in `.env.local` for status UI):

- `AT_API_KEY`
- `NZBN_API_KEY`
- `PCO_API_KEY`
- `NEWSAPI_KEY`
- `METSERVICE_API_KEY` (future alerts)
- `MAPBOX_TOKEN` / `VITE_MAPBOX_TOKEN` (routes — adjacent, not traffic)

Keyless tools do not need these.

## Call path

```
POST /api/do/mcp
{ "provider": "nz_live", "toolId": "geonet_quakes", "arguments": {} }
→ receipt
```

Household Floor optionally allowlists AT buses, NZ weather, GeoNet.

## Honesty

Never invent live AT or NZTA traffic. Open-Meteo weather is labelled as such. Stub tools return `not_configured` / error receipts.

## Related

- `apps/do/shared/nz-live-pack.ts`
- `lib/do-mcp/nz-live.ts`
- `docs/do-templates/DO-MCP-GATEWAY.md`
