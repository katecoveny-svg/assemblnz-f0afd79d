/**
 * DO MCP gateway — multi-provider tool layer for Assembl DOs.
 *
 * Cursor / IDE MCP plugins do NOT flow into customer DOs.
 * A DO only gets tools when:
 *   1. The DO declares an allowlist (AgentSpec.mcpAllowlist / template)
 *   2. The provider is configured in env
 *   3. The owner connects / consents where the provider requires it
 *   4. Runtime calls go through this gateway with a receipt
 *   5. Side-effecting tools stay drafts-only or approval-gated
 *
 * Four-layer stack (Kate):
 *   1. mcp_market_hub — discovery + curated toolkit packing (not execute)
 *   2. composio / zapier / treg — execution providers
 *   3. pipedream — first-party OAuth (Gmail)
 *   4. nz_live — domain toolkit (Aotearoa public/open data)
 */

import { mcpMarketHubAllowlistEntries } from './mcp-market-hub-pack';
import { nzLiveAllowlistEntries } from './nz-live-pack';

export type DoMcpProviderId =
  | 'composio'
  | 'zapier'
  | 'treg'
  | 'pipedream'
  | 'nz_live'
  | 'mcp_market_hub';

export type DoMcpSideEffect = 'none' | 'draft' | 'write' | 'spend';

/** Declared on a DO / template — never embed provider secrets. */
export type DoMcpAllowlistEntry = {
  provider: DoMcpProviderId;
  /** Provider tool / endpoint id (e.g. GMAIL_FETCH_EMAILS, catalog_search). */
  toolId: string;
  label: string;
  purpose: string;
  sideEffect: DoMcpSideEffect;
  /** Write/spend always true; draft may be true for owner review. */
  approvalRequired: boolean;
  required?: boolean;
};

export type DoMcpProviderMeta = {
  id: DoMcpProviderId;
  label: string;
  fit: string;
  /** Env vars required for live calls (documented; never invent values). */
  envKeys: readonly string[];
  connectHint: string;
  docsUrl: string;
};

export const DO_MCP_PROVIDERS: readonly DoMcpProviderMeta[] = [
  {
    id: 'mcp_market_hub',
    label: 'MCP Market Hub',
    fit: 'Discovery + curated toolkit packing (mcpmarket.com/hub) — browse catalog, version skills/MCPs, bundle toolkits, attach allowlist to a DO. Not an execute gateway.',
    envKeys: ['MCP_MARKET_HUB_API_KEY'],
    connectHint:
      'Open https://mcpmarket.com/hub (or app.mcpmarket.com). Bundle a toolkit, then attach the toolkit id/URL on /do/connections. No public Hub catalog API is wired yet — Assembl will not invent live Hub calls.',
    docsUrl: '/docs/do-templates/DO-MCP-MARKET-HUB.md',
  },
  {
    id: 'composio',
    label: 'Composio',
    fit: 'Primary DO app toolbox — Gmail/Calendar/Sheets/Slack/CRM-style actions with managed OAuth (~1000 apps). Default for “connect my tools.”',
    envKeys: ['COMPOSIO_API_KEY'],
    connectHint: 'Set COMPOSIO_API_KEY (project API key). Owner accounts connect through Composio-managed OAuth / Connect Link.',
    docsUrl: 'https://docs.composio.dev/docs/sessions-via-mcp',
  },
  {
    id: 'zapier',
    label: 'Zapier MCP',
    fit: 'Long-tail / obscure apps and Zap-style automations when Composio does not cover them (~9000).',
    envKeys: ['ZAPIER_MCP_TOKEN'],
    connectHint: 'Create a Zapier MCP server, generate a connection token, set ZAPIER_MCP_TOKEN. Endpoint: https://mcp.zapier.com/api/v1/connect',
    docsUrl: 'https://docs.zapier.com/mcp/get-started/authentication',
  },
  {
    id: 'treg',
    label: 'Treg',
    fit: 'Pay-per-call data APIs (SEO, SERP, enrichment, scraping) — not OAuth account linking.',
    envKeys: ['TREG_TOKEN'],
    connectHint: 'Set TREG_TOKEN (Bearer). Catalog search is public; live /call/{endpoint} requires the token and prepaid balance.',
    docsUrl: 'https://treg.to/docs',
  },
  {
    id: 'pipedream',
    label: 'Pipedream Connect',
    fit: 'First-party OAuth she already set (Gmail) and assembl-owned Connect paths. Complementary to MCP — not the marketplace answer.',
    envKeys: ['PIPEDREAM_CLIENT_ID', 'PIPEDREAM_CLIENT_SECRET', 'PIPEDREAM_PROJECT_ID'],
    connectHint: 'Existing /do/connections + DO_GMAIL_OAUTH_APP_ID path. Prefer Composio/Zapier for new marketplace tools.',
    docsUrl: '/docs/PIPEDREAM-CONNECT-SETUP.md',
  },
  {
    id: 'nz_live',
    label: 'NZ Live',
    fit: 'Aotearoa public data toolkit — Auckland Transport, weather, NZBN, GeoNet, Parliament, Beehive, fuel. Reuses Assembl edge functions.',
    envKeys: ['AT_API_KEY', 'NZBN_API_KEY', 'PCO_API_KEY', 'NEWSAPI_KEY'],
    connectHint: 'Keyless tools (GeoNet, Open-Meteo weather, fuel, Beehive RSS) are live. PCO legislation is live when Supabase edge has PCO_API_KEY (same single secret as adapter-pco — not a second path). Set AT_API_KEY / NZBN_API_KEY / NEWSAPI_KEY for other keyed tools. Waka Kotahi traffic is stub.',
    docsUrl: '/docs/do-templates/DO-NZ-LIVE.md',
  },
] as const;

/** Spike allowlist — safe demo tools for Composio-first runtime + NZ Live. */
export const DO_MCP_SPIKE_ALLOWLIST: readonly DoMcpAllowlistEntry[] = [
  {
    provider: 'composio',
    toolId: 'HACKERNEWS_GET_USER',
    label: 'Hacker News user lookup',
    purpose: 'Composio spike read tool (no customer OAuth required).',
    sideEffect: 'none',
    approvalRequired: false,
    required: false,
  },
  {
    provider: 'composio',
    toolId: 'GMAIL_FETCH_EMAILS',
    label: 'Fetch Gmail messages',
    purpose: 'Read chosen mail via Composio once the owner connects Gmail.',
    sideEffect: 'none',
    approvalRequired: false,
    required: false,
  },
  {
    provider: 'composio',
    toolId: 'GMAIL_CREATE_EMAIL_DRAFT',
    label: 'Create Gmail draft',
    purpose: 'Create an unsent draft — never auto-send.',
    sideEffect: 'draft',
    approvalRequired: true,
    required: false,
  },
  ...nzLiveAllowlistEntries(),
  ...mcpMarketHubAllowlistEntries(),
] as const;

/** Optional MCP tools declared on public Household Floor (no live tokens). */
export const HOUSEHOLD_FLOOR_MCP_ALLOWLIST: readonly DoMcpAllowlistEntry[] = [
  {
    provider: 'mcp_market_hub',
    toolId: 'attach_toolkit',
    label: 'Attach Hub toolkit',
    purpose: 'Optional: attach a curated MCP Market Hub toolkit id to this DO (local_draft until Hub API exists).',
    sideEffect: 'draft',
    approvalRequired: true,
    required: false,
  },
  {
    provider: 'composio',
    toolId: 'GMAIL_FETCH_EMAILS',
    label: 'School mail (Composio)',
    purpose: 'Optional read of chosen school mail once Composio + Gmail are connected.',
    sideEffect: 'none',
    approvalRequired: false,
    required: false,
  },
  {
    provider: 'treg',
    toolId: 'catalog_search',
    label: 'Data catalog search (Treg)',
    purpose: 'Find pay-per-call enrichment endpoints when a DO needs bought data (not account linking).',
    sideEffect: 'none',
    approvalRequired: false,
    required: false,
  },
  {
    provider: 'nz_live',
    toolId: 'at_bus_positions',
    label: 'AT buses (NZ Live)',
    purpose: 'Optional Auckland Transport realtime for the BUS seat — needs AT_API_KEY.',
    sideEffect: 'none',
    approvalRequired: false,
    required: false,
  },
  {
    provider: 'nz_live',
    toolId: 'nz_weather_forecast',
    label: 'NZ weather (NZ Live)',
    purpose: 'Optional Open-Meteo forecast for the WEATHER seat.',
    sideEffect: 'none',
    approvalRequired: false,
    required: false,
  },
  {
    provider: 'nz_live',
    toolId: 'geonet_quakes',
    label: 'GeoNet quakes (NZ Live)',
    purpose: 'Optional hazard awareness — public GeoNet API.',
    sideEffect: 'none',
    approvalRequired: false,
    required: false,
  },
  {
    provider: 'nz_live',
    toolId: 'pco_legislation',
    label: 'PCO legislation (NZ Live)',
    purpose: 'Optional Privacy Act / legislation search via mcp-nz-govt — live when Supabase edge has PCO_API_KEY (same key as adapter-pco).',
    sideEffect: 'none',
    approvalRequired: false,
    required: false,
  },
] as const;

export type DoMcpToolReceipt = {
  id: string;
  provider: DoMcpProviderId;
  toolId: string;
  ownerExternalId: string | null;
  status:
    | 'ok'
    | 'denied_not_allowlisted'
    | 'denied_approval_required'
    | 'not_configured'
    | 'not_implemented'
    | 'error';
  at: string;
  summary: string;
  /** Scrubbed detail — never secrets. */
  detail?: Record<string, unknown>;
};

export function providerMeta(id: DoMcpProviderId): DoMcpProviderMeta | undefined {
  return DO_MCP_PROVIDERS.find((p) => p.id === id);
}

export function isAllowlisted(
  allowlist: readonly DoMcpAllowlistEntry[],
  provider: DoMcpProviderId,
  toolId: string,
): DoMcpAllowlistEntry | undefined {
  return allowlist.find(
    (entry) => entry.provider === provider && entry.toolId === toolId,
  );
}

export function sideEffectNeedsApproval(entry: DoMcpAllowlistEntry): boolean {
  if (entry.approvalRequired) return true;
  return entry.sideEffect === 'write' || entry.sideEffect === 'spend';
}

export const DO_MCP_FLOW_SUMMARY = [
  'Cursor / Grok Bot MCP plugins ≠ DO MCP — they do not flow into customer DOs',
  'Four layers: Hub discovery/pack → Composio/Zapier/Treg execute → Pipedream OAuth → NZ Live domain packs',
  'DO declares mcpAllowlist (provider + toolId + sideEffect + approval)',
  'Provider env configured (COMPOSIO_API_KEY / ZAPIER_MCP_TOKEN / TREG_TOKEN / PIPEDREAM_* / MCP_MARKET_HUB_API_KEY)',
  'Owner connects where required (Hub toolkit attach, Composio OAuth, Zapier apps, Treg prepaid)',
  'Runtime calls only allowlisted tools via /api/do/mcp — receipt on every call',
  'Drafts-only / approval for write and spend side effects',
] as const;
