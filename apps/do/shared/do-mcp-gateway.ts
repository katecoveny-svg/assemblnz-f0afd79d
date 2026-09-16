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
 * Providers (layered fit):
 *   composio  — primary app toolbox (~1000 apps, managed OAuth)
 *   zapier    — long-tail / Zap-style (~9000) when Composio lacks coverage
 *   treg      — pay-per-call data APIs (SEO/SERP/enrichment) — not OAuth linking
 *   pipedream — first-party Connect (Gmail) already wired; complementary
 */

export type DoMcpProviderId = 'composio' | 'zapier' | 'treg' | 'pipedream';

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
] as const;

/** Spike allowlist — safe demo tools for Composio-first runtime. */
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
] as const;

/** Optional MCP tools declared on public Household Floor (no live tokens). */
export const HOUSEHOLD_FLOOR_MCP_ALLOWLIST: readonly DoMcpAllowlistEntry[] = [
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
  'DO declares mcpAllowlist (provider + toolId + sideEffect + approval)',
  'Provider env configured (COMPOSIO_API_KEY / ZAPIER_MCP_TOKEN / TREG_TOKEN / PIPEDREAM_*)',
  'Owner connects where required (Composio OAuth, Zapier apps, Treg prepaid)',
  'Runtime calls only allowlisted tools via /api/do/mcp — receipt on every call',
  'Drafts-only / approval for write and spend side effects',
] as const;
