// ============================================================================
// Assembl MCP Server v2 — toolset configuration
// ----------------------------------------------------------------------------
// Mirrors the Salesforce Headless 360 toolset model:
//   --toolsets=manaaki,core   →  only those toolsets' tools are exposed.
// Aligned with mcp_toolsets table (migration 20260422062940 renamed
// `hangarau` → `pikau`).
// ============================================================================

export type ToolsetSlug =
  | "manaaki"
  | "waihanga"
  | "auaha"
  | "pakihi"
  | "pikau"
  | "white_label"
  | "core";

export interface ToolsetConfig {
  slug: ToolsetSlug;
  displayName: string;
  description: string;
  industryPack: string;
}

export const TOOLSETS: Record<ToolsetSlug, ToolsetConfig> = {
  manaaki: {
    slug: "manaaki",
    displayName: "Manaaki (Hospitality)",
    description: "Bookings, food safety, alcohol licensing.",
    industryPack: "hospitality",
  },
  waihanga: {
    slug: "waihanga",
    displayName: "Waihanga (Construction)",
    description: "Site safety, payment claims, EOTs.",
    industryPack: "construction",
  },
  auaha: {
    slug: "auaha",
    displayName: "Auaha (Creative)",
    description: "Brand scans, campaigns, social calendars.",
    industryPack: "creative",
  },
  pakihi: {
    slug: "pakihi",
    displayName: "Pakihi (Business)",
    description: "Pipeline, invoicing, hire workflows.",
    industryPack: "business",
  },
  pikau: {
    slug: "pikau",
    displayName: "Pikau (Logistics & Trade)",
    description: "Customs declarations, MPI biosecurity, freight tracking, AIS vessel data.",
    industryPack: "logistics",
  },
  white_label: {
    slug: "white_label",
    displayName: "White Label (Industry Suite)",
    description: "Branded tenant deployments and custom workflow packs.",
    industryPack: "white_label",
  },
  core: {
    slug: "core",
    displayName: "Core (All Tiers)",
    description: "Routing, tikanga checks, compliance.",
    industryPack: "core",
  },
};

export function parseToolsetsFlag(raw: string | null | undefined): ToolsetSlug[] {
  if (!raw) return ["core"];
  const parts = raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter((s): s is ToolsetSlug => s in TOOLSETS);
  // Always include `core` — it carries IHO routing + tikanga checks.
  return Array.from(new Set<ToolsetSlug>(["core", ...parts]));
}
