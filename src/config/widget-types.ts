/**
 * Widget configuration types
 *
 * Every dashboard widget on the platform declares (1) where its data
 * comes from and (2) what the viewer must be entitled to in order to
 * render it. Widgets are grouped into dashboard "sections" (e.g. the
 * MANAAKI ops dashboard or the platform-wide morning briefing).
 *
 * The types live in their own module so they can be imported by the
 * client (React widgets, the resolver hook) AND by edge functions
 * that emit the data without dragging UI code into the function bundle.
 */

/** Roles that can entitle a viewer to see a widget. Matches `app_role` enum. */
export type WidgetRole = "free" | "starter" | "pro" | "business" | "admin" | "public";

/**
 * Industry kete (product vertical) the widget belongs to. `platform`
 * widgets are cross-cutting (e.g. weather, fuel, system status).
 */
export type WidgetKete =
  | "platform"
  | "manaaki"
  | "waihanga"
  | "auaha"
  | "arataki"
  | "pikau"
  | "hoko"
  | "ako"
  | "toro";

/**
 * Where the widget's data physically comes from.
 *
 *  - `dashboard_feed` — the public read-only `/functions/v1/dashboard-feed`
 *     aggregator (whitelisted: weather, fuel_prices, compliance_updates,
 *     kb_sources). No auth required.
 *  - `edge_function`  — direct call to a named edge function. May require
 *     auth depending on the function's `verify_jwt`.
 *  - `table`          — direct Supabase select against a public table.
 *     Must be RLS-safe.
 *  - `agent_tool`     — the same data source the `/chat` agent uses via
 *     a tool call. The widget proxies the read-only side of that tool.
 *  - `static`         — purely client-side / config-driven (no fetch).
 */
export type WidgetDataSourceKind =
  | "dashboard_feed"
  | "edge_function"
  | "table"
  | "agent_tool"
  | "static";

export type WidgetDataSource =
  | {
      kind: "dashboard_feed";
      /** `?source=` value on /dashboard-feed. */
      feedSource: "weather" | "fuel_prices" | "compliance_updates" | "kb_sources";
      /** Optional default query params merged into the request. */
      params?: Record<string, string | number>;
    }
  | {
      kind: "edge_function";
      /** Function name under /functions/v1/. */
      functionName: string;
      method?: "GET" | "POST";
      body?: Record<string, unknown>;
      params?: Record<string, string | number>;
    }
  | {
      kind: "table";
      /** Public schema table. RLS must allow the configured `requires` roles. */
      table: string;
      /** Comma-separated select list (e.g. "id, title, created_at"). */
      select: string;
      /** Default order — column name + direction. */
      orderBy?: { column: string; ascending?: boolean };
      limit?: number;
      filter?: Record<string, string | number | boolean>;
    }
  | {
      kind: "agent_tool";
      /** Mirrors the tool name in `LIVE_DATA_TOOLS` (chat tool registry). */
      toolName:
        | "get_nz_weather"
        | "get_nz_fuel_prices"
        | "get_nz_route"
        | "search_knowledge_base"
        | "get_compliance_updates"
        | "get_iot_signal";
      /** Static args sent into the tool call. */
      args?: Record<string, unknown>;
    }
  | {
      kind: "static";
    };

/** Refresh / freshness strategy for the widget. */
export type WidgetRefresh =
  | { mode: "static" }
  | { mode: "interval"; seconds: number }
  | { mode: "realtime"; channel: string };

export interface WidgetScope {
  /**
   * Minimum role required to view. Widgets that read user-private data
   * should NOT be marked `public` — use `starter` and above.
   */
  requires: WidgetRole;
  /**
   * Optional finer-grained MCP toolset gates (matches `mcp_toolsets.code`
   * — e.g. ["manaaki_core"]). All listed toolsets must be enabled for
   * the org for the widget to render. Empty = no toolset gate.
   */
  toolsets?: string[];
  /**
   * If true, widget reads PII / per-user data and must NEVER appear in
   * public dashboards or be cached at the edge.
   */
  pii?: boolean;
}

export interface WidgetConfig {
  /** Stable widget id, kebab-case. Used for analytics + persisted layouts. */
  id: string;
  /** Human label shown on the dashboard tile. */
  title: string;
  /** Short helper copy under the title. */
  description?: string;
  /** Which dashboard section this widget belongs to. */
  section: WidgetKete;
  /** Where the data comes from. */
  dataSource: WidgetDataSource;
  /** Required entitlements to view. */
  scope: WidgetScope;
  /** How the widget keeps itself fresh. */
  refresh: WidgetRefresh;
  /** Optional fallback to render when fetch fails. */
  emptyState?: string;
  /** Optional tags (e.g. ["compliance","privacy"]) for filtering / search. */
  tags?: string[];
}

/**
 * A dashboard section groups widgets and carries section-level metadata
 * (title, kete accent, default scope). Widget-level scope wins on conflict.
 */
export interface DashboardSection {
  id: WidgetKete;
  title: string;
  description?: string;
  /** Default scope applied to widgets that don't override. */
  defaultScope: WidgetScope;
  widgets: WidgetConfig[];
}
