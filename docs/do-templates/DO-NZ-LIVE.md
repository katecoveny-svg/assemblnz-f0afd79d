# NZ Live — DO toolkit

**Status:** expanded pack — 16 September 2026 NZ  
**Provider id:** `nz_live` on the DO MCP gateway  
**Product:** named toolkit on `/do/connections` — per-tool `live` | `needs_key` | `stub`

## Named toolkits (docs/UI)

| Toolkit | Fit |
|---|---|
| **Travel NZ** | AT + Waka Kotahi Traffic & Travel + Metlink / Metro Chch parity |
| **Civic Watch** | Parliament, Beehive, PCO legislation, Stats NZ portal |
| **SME Compliance** | NZBN (+ legislation-aware SME lookups) |
| **Household Floor NZ** | Floor-friendly NZ data seats. **Grocery = consent browser-seat only — no invented supermarket APIs** |
| **Property NZ** | LINZ parcels/titles context (not ownership claims) + schools directory |
| **Hazard NZ** | Civil Defence AlertHub CAP + GeoNet CAP/quakes + MetService CAP |
| **Energy & Cost** | EA EMI ICP + MBIE fuel |
| **Media Pulse** | NZ news RSS / search |

## P0 (this PR)

| Tool | Status | Wiring |
|---|---|---|
| Waka Kotahi road events | **live** | `https://trafficnz.info/service/traffic/rest/4/events/all/{n}` — no account |
| Waka Kotahi cameras | **live** | `…/cameras/all` — no account |
| Civil Defence AlertHub CAP | **live** | `https://alerthub.civildefence.govt.nz/atom/pwp` (Accept atom) |
| GeoNet CAP | **live** | `https://api.geonet.org.nz/cap/1.2/GPA1.0/feed/atom1.0/quake` |
| MetService CAP | **live** | `https://alerts.metservice.com/cap/rss` (public CAP; not commercial API) |
| Hazard CAP bundle | **live** | Unified pull of the three CAP feeds |
| Metlink transit | **stub** | City parity after AT — [open data](https://www.metlink.org.nz/about/open-data/) |
| Metro Chch transit | **stub** | City parity after AT |

## P1 (schema + stub)

| Tool | Status | Notes |
|---|---|---|
| EA EMI ICP | stub | Power retailer by address — no invented credentials |
| LINZ WFS parcels | stub | Parcels/titles context — **not ownership claims** |
| Schools directory | stub | data.govt.nz Datastore |
| Stats NZ portal | stub | Bookmark / portal URLs only |

## Already shipped

| Tool | Status | Wiring |
|---|---|---|
| Auckland Transport bus positions | needs_key (`AT_API_KEY`) | `bus-positions` |
| NZ weather / marine | **live** | Open-Meteo (labelled) |
| MetService official alerts API | **stub** | Prefer `metservice_cap` |
| NZBN search | **needs_key** (`NZBN_API_KEY`) | Honest until secret is in Supabase |
| GeoNet quakes / news | **live** | api.geonet.org.nz |
| Parliament / Beehive | **live** | public |
| PCO legislation | **live** when edge has `PCO_API_KEY` | `mcp-nz-govt` + same key as `adapter-pco` |
| NZ news RSS / search | live / needs_key | `mcp-news` |
| NZ fuel prices | **live** | `nz-fuel-prices` |

## Env vars

Set on **Supabase edge secrets** (mirror into `.env.local` only when useful):

- `AT_API_KEY`
- `NZBN_API_KEY` — may be missing; UI stays **needs_key** honestly
- `PCO_API_KEY` — edge secret; DO + adapter-pco
- `NEWSAPI_KEY`
- `METSERVICE_API_KEY` (official API stub only; CAP is keyless)

## Call examples

```
POST /api/do/mcp
{ "provider": "nz_live", "toolId": "waka_kotahi_traffic", "arguments": { "limit": 10 } }

POST /api/do/mcp
{ "provider": "nz_live", "toolId": "hazard_cap_bundle", "arguments": {} }
```

## Honesty

- Never invent live AT without `AT_API_KEY`, NZBN without `NZBN_API_KEY`, or supermarket APIs.
- Waka / CAP feeds are public and proven live in this environment.
- LINZ tools must not claim ownership.
- Grocery on Household Floor remains consent browser-seat only.

## Related

- `apps/do/shared/nz-live-pack.ts`
- `lib/do-mcp/nz-live.ts`
- `docs/do-templates/DO-MCP-GATEWAY.md`
