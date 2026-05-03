# Dashboard widget configuration

Single source of truth for which widgets exist on the platform, where
their data comes from, and what entitlements a viewer needs to see them.

## Files

- **`widget-types.ts`** — types only. Imported by both client widgets and
  edge functions (no React deps).
- **`dashboard-widgets.ts`** — the registry. Add new widgets here.
- **`../hooks/useWidgetData.ts`** — the only sanctioned way to fetch a
  widget's data on the client.

## The contract

Every widget declares four things:

| Field | Purpose |
| --- | --- |
| `section` | Which dashboard kete / cross-platform group it lives in. |
| `dataSource` | Where the data comes from (see below). |
| `scope` | `requires` role + optional `toolsets` + `pii` flag. |
| `refresh` | `static` \| `interval` \| `realtime`. |

### Data source kinds

- **`dashboard_feed`** — public read-only `/functions/v1/dashboard-feed`
  aggregator. Whitelisted: `weather`, `fuel_prices`, `compliance_updates`,
  `kb_sources`. Use this for anything that is safe to cache at the edge
  and doesn't read PII.
- **`edge_function`** — direct call to a named Supabase edge function.
  Auth depends on the function's `verify_jwt`.
- **`table`** — direct Supabase select. RLS must allow the configured
  `requires` role for every row returned.
- **`agent_tool`** — the same data source the `/chat` agent uses via a
  tool call (mirrors `LIVE_DATA_TOOLS` in `supabase/functions/_shared/
  tool-executor.ts`). Tools that aren't on the dashboard-feed whitelist
  must be exposed via a dedicated edge function — never inline in the
  client.
- **`static`** — purely client-side (config-driven, no fetch).

### Scope rules

- `scope.requires` is the **minimum** role that can view. Order:
  `public < free < starter < pro < business < admin`.
- `scope.toolsets` lists MCP toolset codes (e.g. `"manaaki_core"`) that
  must be enabled on the org. `admin` bypasses this.
- `scope.pii: true` marks widgets that read user-private data — these
  must NEVER use `dashboard_feed` (which is publicly cached) and must
  NEVER appear on unauthenticated pages.

## Adding a widget

1. Pick the section in `dashboard-widgets.ts` (or add a new one).
2. Append a `WidgetConfig` object.
3. If you need a brand-new data source (e.g. a new agent tool), expose
   it through the public `dashboard-feed` whitelist (for non-PII
   read-only data) or a dedicated edge function (for everything else).
   Do not bypass `useWidgetData`.

## Example

```ts
{
  id: "manaaki-compliance-hospitality",
  title: "Food & hospitality compliance",
  section: "manaaki",
  dataSource: {
    kind: "dashboard_feed",
    feedSource: "compliance_updates",
    params: { industry: "hospitality", since_days: 30, limit: 8 },
  },
  scope: { requires: "starter", toolsets: ["manaaki_core"] },
  refresh: { mode: "interval", seconds: 1800 },
}
```

## Mapping back to agent tools

| Widget data source | Agent tool (LIVE_DATA_TOOLS) | Edge function |
| --- | --- | --- |
| `dashboard_feed:weather` | `get_nz_weather` | `iot-weather` |
| `dashboard_feed:fuel_prices` | `get_nz_fuel_prices` | `nz-fuel-prices` |
| `dashboard_feed:compliance_updates` | `get_compliance_updates` | (table read) |
| `dashboard_feed:kb_sources` | `search_knowledge_base` (catalogue side) | (table read) |

PII / mutating tools (`recall_memory`, `send_sms`, `get_iot_signal`,
`get_nz_route`) intentionally have no widget — they require user input
or write actions and don't belong on a feed.
