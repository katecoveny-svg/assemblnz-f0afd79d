/**
 * Dashboard widget registry
 *
 * The single source of truth for which widgets exist on the platform,
 * which dashboard section they live in, where they get their data from,
 * and what the viewer must be entitled to.
 *
 * Add new widgets here — never inline `fetch` / `supabase.from()` in a
 * widget component. Use the `useWidgetData` hook so scope checks and
 * the data-source contract are enforced uniformly.
 */

import type { DashboardSection, WidgetConfig } from "./widget-types";

// ──────────────────────────────────────────────────────────────────────
// Platform-wide widgets (cross-kete: morning briefing, status, etc.)
// ──────────────────────────────────────────────────────────────────────

const PLATFORM_WIDGETS: WidgetConfig[] = [
  {
    id: "weather-auckland",
    title: "Weather — Auckland",
    description: "Live conditions for trip and venue planning.",
    section: "platform",
    dataSource: {
      kind: "dashboard_feed",
      feedSource: "weather",
      params: { city: "Auckland" },
    },
    scope: { requires: "public" },
    refresh: { mode: "interval", seconds: 600 },
    emptyState: "Weather feed temporarily unavailable.",
    tags: ["weather", "ops"],
  },
  {
    id: "fuel-prices-nz",
    title: "NZ fuel prices",
    description: "National retail averages — 91, 95, diesel.",
    section: "platform",
    dataSource: { kind: "dashboard_feed", feedSource: "fuel_prices" },
    scope: { requires: "public" },
    refresh: { mode: "interval", seconds: 3600 },
    tags: ["fuel", "ops"],
  },
  {
    id: "compliance-updates-recent",
    title: "Compliance — last 14 days",
    description: "Verified regulatory changes from NZ regulators.",
    section: "platform",
    dataSource: {
      kind: "dashboard_feed",
      feedSource: "compliance_updates",
      params: { since_days: 14, limit: 10 },
    },
    scope: { requires: "public" },
    refresh: { mode: "interval", seconds: 1800 },
    tags: ["compliance", "regulatory"],
  },
];

// ──────────────────────────────────────────────────────────────────────
// MANAAKI — Hospitality
// ──────────────────────────────────────────────────────────────────────

const MANAAKI_WIDGETS: WidgetConfig[] = [
  {
    id: "manaaki-kb-sources",
    title: "Hospitality knowledge sources",
    description: "Active regulatory + industry sources powering Manaaki.",
    section: "manaaki",
    dataSource: {
      kind: "dashboard_feed",
      feedSource: "kb_sources",
      params: { kete: "manaaki", limit: 12 },
    },
    scope: { requires: "starter", toolsets: ["manaaki_core"] },
    refresh: { mode: "interval", seconds: 3600 },
    tags: ["knowledge"],
  },
  {
    id: "manaaki-compliance-hospitality",
    title: "Food & hospitality compliance",
    description: "Recent changes affecting restaurants, cafés, accommodation.",
    section: "manaaki",
    dataSource: {
      kind: "dashboard_feed",
      feedSource: "compliance_updates",
      params: { industry: "hospitality", since_days: 30, limit: 8 },
    },
    scope: { requires: "starter", toolsets: ["manaaki_core"] },
    refresh: { mode: "interval", seconds: 1800 },
    tags: ["compliance", "food-act"],
  },
];

// ──────────────────────────────────────────────────────────────────────
// WAIHANGA — Construction
// ──────────────────────────────────────────────────────────────────────

const WAIHANGA_WIDGETS: WidgetConfig[] = [
  {
    id: "waihanga-kb-sources",
    title: "Construction knowledge sources",
    section: "waihanga",
    dataSource: {
      kind: "dashboard_feed",
      feedSource: "kb_sources",
      params: { kete: "waihanga", limit: 12 },
    },
    scope: { requires: "starter", toolsets: ["waihanga_core"] },
    refresh: { mode: "interval", seconds: 3600 },
    tags: ["knowledge"],
  },
  {
    id: "waihanga-compliance-construction",
    title: "Building & H&S compliance",
    description: "Building Act, HSWA, LBP changes — last 30 days.",
    section: "waihanga",
    dataSource: {
      kind: "dashboard_feed",
      feedSource: "compliance_updates",
      params: { industry: "construction", since_days: 30, limit: 8 },
    },
    scope: { requires: "starter", toolsets: ["waihanga_core"] },
    refresh: { mode: "interval", seconds: 1800 },
    tags: ["compliance", "hswa"],
  },
  {
    id: "waihanga-subbie-status",
    title: "Subcontractor status",
    description: "LBP / Site Safe / insurance — RAG board.",
    section: "waihanga",
    dataSource: {
      kind: "table",
      table: "subbies",
      select: "id, name, status, lbp_expiry, site_safe_expiry, insurance_expiry",
      orderBy: { column: "status", ascending: true },
      limit: 50,
    },
    scope: { requires: "pro", toolsets: ["waihanga_core"], pii: true },
    refresh: { mode: "realtime", channel: "subbies" },
    tags: ["compliance", "ops"],
  },
];

// ──────────────────────────────────────────────────────────────────────
// ARATAKI — Automotive & Fleet
// ──────────────────────────────────────────────────────────────────────

const ARATAKI_WIDGETS: WidgetConfig[] = [
  {
    id: "arataki-fuel-prices",
    title: "Fuel oracle",
    description: "Current NZ fuel benchmarks — feeds VehicleEconomy.",
    section: "arataki",
    dataSource: { kind: "dashboard_feed", feedSource: "fuel_prices" },
    scope: { requires: "starter", toolsets: ["arataki_core"] },
    refresh: { mode: "interval", seconds: 3600 },
    tags: ["fuel"],
  },
  {
    id: "arataki-compliance-transport",
    title: "Transport compliance",
    description: "RUC, WoF, driver licensing changes.",
    section: "arataki",
    dataSource: {
      kind: "dashboard_feed",
      feedSource: "compliance_updates",
      params: { industry: "transport", since_days: 30, limit: 8 },
    },
    scope: { requires: "starter", toolsets: ["arataki_core"] },
    refresh: { mode: "interval", seconds: 1800 },
    tags: ["compliance"],
  },
  {
    id: "arataki-route-weather",
    title: "Route weather — Auckland",
    description: "Used by route intelligence to flag delays.",
    section: "arataki",
    dataSource: {
      kind: "dashboard_feed",
      feedSource: "weather",
      params: { city: "Auckland" },
    },
    scope: { requires: "starter", toolsets: ["arataki_core"] },
    refresh: { mode: "interval", seconds: 600 },
    tags: ["weather", "routing"],
  },
];

// ──────────────────────────────────────────────────────────────────────
// AUAHA — Creative & Marketing
// ──────────────────────────────────────────────────────────────────────

const AUAHA_WIDGETS: WidgetConfig[] = [
  {
    id: "auaha-kb-sources",
    title: "Creative + marketing sources",
    section: "auaha",
    dataSource: {
      kind: "dashboard_feed",
      feedSource: "kb_sources",
      params: { kete: "auaha", limit: 12 },
    },
    scope: { requires: "starter", toolsets: ["auaha_core"] },
    refresh: { mode: "interval", seconds: 3600 },
    tags: ["knowledge"],
  },
  {
    id: "auaha-compliance-marketing",
    title: "Fair Trading / advertising compliance",
    section: "auaha",
    dataSource: {
      kind: "dashboard_feed",
      feedSource: "compliance_updates",
      params: { industry: "marketing", since_days: 30, limit: 6 },
    },
    scope: { requires: "starter", toolsets: ["auaha_core"] },
    refresh: { mode: "interval", seconds: 1800 },
    tags: ["compliance", "fair-trading"],
  },
];

// ──────────────────────────────────────────────────────────────────────
// PIKAU — Freight & Customs
// ──────────────────────────────────────────────────────────────────────

const PIKAU_WIDGETS: WidgetConfig[] = [
  {
    id: "pikau-kb-sources",
    title: "Freight & customs sources",
    section: "pikau",
    dataSource: {
      kind: "dashboard_feed",
      feedSource: "kb_sources",
      params: { kete: "pikau", limit: 12 },
    },
    scope: { requires: "starter", toolsets: ["pikau_core"] },
    refresh: { mode: "interval", seconds: 3600 },
    tags: ["knowledge"],
  },
  {
    id: "pikau-compliance-customs",
    title: "Customs & biosecurity changes",
    section: "pikau",
    dataSource: {
      kind: "dashboard_feed",
      feedSource: "compliance_updates",
      params: { industry: "logistics", since_days: 30, limit: 8 },
    },
    scope: { requires: "starter", toolsets: ["pikau_core"] },
    refresh: { mode: "interval", seconds: 1800 },
    tags: ["compliance", "customs"],
  },
];

// ──────────────────────────────────────────────────────────────────────
// Sections
// ──────────────────────────────────────────────────────────────────────

export const DASHBOARD_SECTIONS: DashboardSection[] = [
  {
    id: "platform",
    title: "Platform",
    description: "Cross-kete signals — weather, fuel, compliance.",
    defaultScope: { requires: "public" },
    widgets: PLATFORM_WIDGETS,
  },
  {
    id: "manaaki",
    title: "Manaaki — Hospitality",
    defaultScope: { requires: "starter", toolsets: ["manaaki_core"] },
    widgets: MANAAKI_WIDGETS,
  },
  {
    id: "waihanga",
    title: "Waihanga — Construction",
    defaultScope: { requires: "starter", toolsets: ["waihanga_core"] },
    widgets: WAIHANGA_WIDGETS,
  },
  {
    id: "auaha",
    title: "Auaha — Creative & Marketing",
    defaultScope: { requires: "starter", toolsets: ["auaha_core"] },
    widgets: AUAHA_WIDGETS,
  },
  {
    id: "arataki",
    title: "Arataki — Automotive & Fleet",
    defaultScope: { requires: "starter", toolsets: ["arataki_core"] },
    widgets: ARATAKI_WIDGETS,
  },
  {
    id: "pikau",
    title: "Pikau — Freight & Customs",
    defaultScope: { requires: "starter", toolsets: ["pikau_core"] },
    widgets: PIKAU_WIDGETS,
  },
];

/** Flat lookup of every registered widget by id. */
export const WIDGET_INDEX: Record<string, WidgetConfig> = Object.fromEntries(
  DASHBOARD_SECTIONS.flatMap((s) => s.widgets).map((w) => [w.id, w]),
);

export function getWidget(id: string): WidgetConfig | undefined {
  return WIDGET_INDEX[id];
}

export function getSection(id: DashboardSection["id"]): DashboardSection | undefined {
  return DASHBOARD_SECTIONS.find((s) => s.id === id);
}

/** Widgets visible at the given role — used to gate rendering up front. */
export function widgetsForRole(role: import("./widget-types").WidgetRole): WidgetConfig[] {
  const order: import("./widget-types").WidgetRole[] = [
    "public",
    "free",
    "starter",
    "pro",
    "business",
    "admin",
  ];
  const viewerRank = order.indexOf(role);
  return Object.values(WIDGET_INDEX).filter((w) => order.indexOf(w.scope.requires) <= viewerRank);
}
