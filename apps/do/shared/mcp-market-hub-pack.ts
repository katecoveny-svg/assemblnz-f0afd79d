/**
 * MCP Market Hub — discovery / registry / toolkit packing for Assembl DO.
 *
 * Product: https://mcpmarket.com/hub (directory mcpmarket.com · app app.mcpmarket.com)
 * Kate clarification: Hub is NOT an action-execution gateway like Composio / Zapier / Treg.
 * Fit: browse catalog → bundle toolkits → attach toolkit / allowlist to a DO.
 * Execution still runs through Composio / Zapier / Treg (or NZ Live / Pipedream) after attach.
 *
 * No public Hub catalog API is documented for Assembl to call yet.
 * Honest states only — never invent live Hub catalog rows or sync success.
 */

export type McpMarketHubToolId =
  | 'browse_catalog'
  | 'search_catalog'
  | 'attach_toolkit'
  | 'list_attached_toolkits';

export type McpMarketHubAttachedToolkit = {
  /** Hub toolkit slug or share id (e.g. acme/customer-success). */
  toolkitId: string;
  /** Optional human label from the Hub UI. */
  label: string;
  /** When the operator attached it in Assembl (local record only until Hub API exists). */
  attachedAt: string;
  /** Always local_draft until a real Hub sync API is wired. */
  syncState: 'local_draft' | 'synced';
  sourceUrl?: string;
};

export const MCP_MARKET_HUB = {
  id: 'mcp_market_hub' as const,
  label: 'MCP Market Hub',
  fit: 'Discovery + curated toolkit packing — browse catalog, version skills/MCPs, bundle toolkits, attach an allowlist to a DO. Not an execute gateway.',
  hubUrl: 'https://mcpmarket.com/hub',
  appUrl: 'https://app.mcpmarket.com',
  directoryUrl: 'https://mcpmarket.com',
  docsPath: 'docs/do-templates/DO-MCP-MARKET-HUB.md',
  /** Optional future key — product has not published a stable public REST catalog for Assembl. */
  envKeys: ['MCP_MARKET_HUB_API_KEY'] as const,
  connectHint:
    'Open https://mcpmarket.com/hub (or app.mcpmarket.com). Create/version skills + MCPs, bundle a toolkit, then attach the toolkit id/URL on /do/connections. Set MCP_MARKET_HUB_API_KEY only when Hub publishes a documented API — until then Assembl stays on documented connect + local attach drafts (no fake live calls).',
} as const;

/** Nearby lookalikes Kate asked us to note — not the product she named. */
export const MCP_MARKET_HUB_LOOKALIKES = [
  {
    name: 'MCP360',
    url: 'https://mcp360.com',
    note: 'Universal MCP execute / gateway style — closer to Composio than to Hub’s registry + toolkit packing.',
  },
  {
    name: 'Glama',
    url: 'https://glama.ai/mcp',
    note: 'MCP marketplace + gateway hybrid. Useful catalogue reference; not the Hub attach model Kate named.',
  },
] as const;

/**
 * Four-layer DO tool stack (Kate):
 * 1. Discovery / pack — MCP Market Hub
 * 2. Execution providers — Composio · Zapier · Treg
 * 3. First-party OAuth — Pipedream (Gmail)
 * 4. Domain toolkits — NZ Live (and future packs)
 */
export const DO_TOOL_STACK_LAYERS = [
  {
    layer: 1,
    id: 'discovery',
    label: 'Discovery + toolkit packing',
    providers: ['mcp_market_hub'],
    role: 'Browse catalog, version skills/MCPs, bundle toolkits, attach allowlist to a DO.',
  },
  {
    layer: 2,
    id: 'execution',
    label: 'Execution providers',
    providers: ['composio', 'zapier', 'treg'],
    role: 'Run allowlisted tools with receipts. Composio primary · Zapier long-tail · Treg pay-per-call data.',
  },
  {
    layer: 3,
    id: 'first_party_oauth',
    label: 'First-party OAuth',
    providers: ['pipedream'],
    role: 'Existing Connect (Gmail) — complementary, not the marketplace answer.',
  },
  {
    layer: 4,
    id: 'domain_toolkits',
    label: 'Domain toolkits',
    providers: ['nz_live'],
    role: 'Curated public/open data packs (Aotearoa NZ Live) with honest live|needs_key|stub.',
  },
] as const;

export type McpMarketHubAllowlistSeed = {
  toolId: McpMarketHubToolId;
  label: string;
  purpose: string;
  sideEffect: 'none' | 'draft';
  approvalRequired: boolean;
};

export const MCP_MARKET_HUB_ALLOWLIST_SEEDS: readonly McpMarketHubAllowlistSeed[] = [
  {
    toolId: 'browse_catalog',
    label: 'Browse Hub catalog',
    purpose: 'Open/browse MCP Market Hub catalog entries when a documented API exists; otherwise returns the connect path.',
    sideEffect: 'none',
    approvalRequired: false,
  },
  {
    toolId: 'search_catalog',
    label: 'Search Hub catalog',
    purpose: 'Search Hub skills/MCPs/toolkits by query when API-keyed; otherwise honest not_configured + connect URL.',
    sideEffect: 'none',
    approvalRequired: false,
  },
  {
    toolId: 'attach_toolkit',
    label: 'Attach Hub toolkit to DO',
    purpose: 'Record a Hub toolkit id/URL against this DO as a local_draft allowlist attach. Does not fake live Hub sync.',
    sideEffect: 'draft',
    approvalRequired: true,
  },
  {
    toolId: 'list_attached_toolkits',
    label: 'List attached Hub toolkits',
    purpose: 'Show toolkits attached to this DO (local draft records until Hub API sync exists).',
    sideEffect: 'none',
    approvalRequired: false,
  },
] as const;

export function mcpMarketHubAllowlistEntries(): Array<{
  provider: 'mcp_market_hub';
  toolId: string;
  label: string;
  purpose: string;
  sideEffect: 'none' | 'draft';
  approvalRequired: boolean;
  required: boolean;
}> {
  return MCP_MARKET_HUB_ALLOWLIST_SEEDS.map((seed) => ({
    provider: 'mcp_market_hub' as const,
    toolId: seed.toolId,
    label: seed.label,
    purpose: seed.purpose,
    sideEffect: seed.sideEffect,
    approvalRequired: seed.approvalRequired,
    required: false,
  }));
}
