# LiveWidget component library

Unified, themed dashboard widgets that fetch from the public
`dashboard-feed` edge function (and other configured sources) via
`useWidgetData`. Every widget shares one visual frame so dashboards
across kete feel coherent.

## Quick start

```tsx
import { LiveWidget, LiveWidgetSection } from "@/components/live-widgets";

// Render every widget registered for a section
<LiveWidgetSection section="manaaki" viewerRole="starter" enabledToolsets={["manaaki_core"]} />

// Or render one widget by id
<LiveWidget widgetId="weather-auckland" />
```

## What you get

- **Themed frame** — kete accent strip, subtitle, soft glass surface,
  Mārama palette only.
- **State handling** — loading / error / empty / forbidden are baked
  into `LiveWidgetShell`. Renderers only describe data, never UI states.
- **Scope-aware** — viewer role + MCP toolsets are checked before the
  fetch fires. Locked widgets show a clear "Requires X" message.
- **Refresh policy** — driven by `widget.refresh` (`interval` /
  `realtime` / `static`). The shell shows the cadence in the footer
  and a manual refresh button.

## Architecture

```
LiveWidgetSection            ← renders all widgets for a kete
└── LiveWidget               ← dispatcher per widgetId
    ├── useWidgetData        ← fetch + scope gate (hooks/)
    └── LiveWidgetShell      ← unified frame
        └── renderers/*      ← one body per data shape
            ├── LiveWeatherBody
            ├── LiveFuelBody
            ├── LiveComplianceBody
            ├── LiveKbSourcesBody
            └── LiveTableBody
```

## Adding a new widget

1. Register it in `src/config/dashboard-widgets.ts` (see
   `src/config/README.md`).
2. If it uses an existing data source kind (weather / fuel /
   compliance / kb_sources / table) — done. The dispatcher picks the
   matching renderer automatically.
3. If it needs a brand-new visual, add a body component under
   `renderers/` and extend the `LiveWidget` switch.

## Theming

Each kete has a locked accent in `kete-accents.ts` (matches Brand
Guidelines v1.0). Don't hardcode colours in widget bodies — read from
the section accent or use the semantic tokens
(`--background`, `--foreground`, `--primary`, `--muted`).

## What widgets must NOT do

- Call `fetch` / `supabase.from()` / `supabase.functions.invoke()`
  directly. Always go through `useWidgetData`.
- Render their own loading spinner or error toast — the shell does it.
- Hardcode hex colours. Use kete accents or design tokens.
- Read PII via `dashboard_feed` (it's publicly cached). Use a
  dedicated edge function and mark `scope.pii: true`.
