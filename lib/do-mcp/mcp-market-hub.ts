import 'server-only';

import {
  MCP_MARKET_HUB,
  MCP_MARKET_HUB_LOOKALIKES,
  type McpMarketHubAttachedToolkit,
  type McpMarketHubToolId,
} from '@/apps/do/shared/mcp-market-hub-pack';

export type McpMarketHubResult =
  | { ok: true; detail: Record<string, unknown> }
  | { ok: false; error: string; statusHint: 'not_configured' | 'stub' | 'error' };

/** Process-local attach drafts — never claim Hub cloud sync without an API. */
const attachedByOwner = new Map<string, McpMarketHubAttachedToolkit[]>();

export function mcpMarketHubConfigured(): boolean {
  return Boolean(process.env.MCP_MARKET_HUB_API_KEY?.trim());
}

function connectDetail(extra?: Record<string, unknown>): Record<string, unknown> {
  return {
    hubUrl: MCP_MARKET_HUB.hubUrl,
    appUrl: MCP_MARKET_HUB.appUrl,
    directoryUrl: MCP_MARKET_HUB.directoryUrl,
    connectHint: MCP_MARKET_HUB.connectHint,
    lookalikes: MCP_MARKET_HUB_LOOKALIKES,
    publicCatalogApi: 'not_documented',
    ...extra,
  };
}

/**
 * Hub has no Assembl-documented public catalog API yet.
 * Even with MCP_MARKET_HUB_API_KEY set we refuse to invent HTTP shapes —
 * return stub until a real client is implemented against published docs.
 */
export async function hubBrowseCatalog(_args?: Record<string, unknown>): Promise<McpMarketHubResult> {
  if (!mcpMarketHubConfigured()) {
    return {
      ok: false,
      statusHint: 'not_configured',
      error:
        'MCP Market Hub catalog browse is not live here. Open https://mcpmarket.com/hub to browse, then attach a toolkit id on /do/connections. Set MCP_MARKET_HUB_API_KEY only when Hub publishes a documented API — Assembl will not invent catalog rows.',
    };
  }
  return {
    ok: false,
    statusHint: 'stub',
    error:
      'MCP_MARKET_HUB_API_KEY is set, but Assembl has no published Hub REST client yet. Browse at https://mcpmarket.com/hub — no fake live catalog calls.',
  };
}

export async function hubSearchCatalog(args?: Record<string, unknown>): Promise<McpMarketHubResult> {
  const q = typeof args?.q === 'string' ? args.q.trim() : '';
  if (!mcpMarketHubConfigured()) {
    return {
      ok: false,
      statusHint: 'not_configured',
      error: q
        ? `Hub search for “${q}” is not live — no public catalog API wired. Search at ${MCP_MARKET_HUB.directoryUrl} / ${MCP_MARKET_HUB.hubUrl}.`
        : `Hub search is not live — no public catalog API wired. Use ${MCP_MARKET_HUB.hubUrl}.`,
    };
  }
  return {
    ok: false,
    statusHint: 'stub',
    error:
      'MCP_MARKET_HUB_API_KEY is set, but Hub search HTTP is not implemented against published docs. No fake results.',
  };
}

export async function hubAttachToolkit(input: {
  ownerExternalId: string | null;
  arguments?: Record<string, unknown>;
}): Promise<McpMarketHubResult> {
  const toolkitId =
    typeof input.arguments?.toolkitId === 'string' ? input.arguments.toolkitId.trim() : '';
  const label =
    typeof input.arguments?.label === 'string' && input.arguments.label.trim()
      ? input.arguments.label.trim()
      : toolkitId;
  const sourceUrl =
    typeof input.arguments?.sourceUrl === 'string' ? input.arguments.sourceUrl.trim() : undefined;

  if (!toolkitId) {
    return {
      ok: false,
      statusHint: 'error',
      error: 'attach_toolkit requires arguments.toolkitId (Hub toolkit slug or share id).',
    };
  }

  if (!input.ownerExternalId) {
    return {
      ok: false,
      statusHint: 'error',
      error: 'Sign in to attach a Hub toolkit to your DO.',
    };
  }

  const record: McpMarketHubAttachedToolkit = {
    toolkitId,
    label,
    attachedAt: new Date().toISOString(),
    syncState: 'local_draft',
    sourceUrl: sourceUrl || `${MCP_MARKET_HUB.hubUrl}`,
  };

  const key = input.ownerExternalId;
  const existing = attachedByOwner.get(key) ?? [];
  const next = [...existing.filter((t) => t.toolkitId !== toolkitId), record];
  attachedByOwner.set(key, next);

  return {
    ok: true,
    detail: connectDetail({
      attached: record,
      note:
        'Local draft attach only. Hub cloud sync / plugin install is not claimed. Execution of tools inside the toolkit still requires Composio/Zapier/Treg/NZ Live after those tools are allowlisted.',
      attachedCount: next.length,
      hubApiConfigured: mcpMarketHubConfigured(),
    }),
  };
}

export async function hubListAttachedToolkits(input: {
  ownerExternalId: string | null;
}): Promise<McpMarketHubResult> {
  const list = input.ownerExternalId
    ? (attachedByOwner.get(input.ownerExternalId) ?? [])
    : [];
  return {
    ok: true,
    detail: connectDetail({
      attached: list,
      signedIn: Boolean(input.ownerExternalId),
      note: list.length
        ? 'Showing local_draft attaches for this DO owner. Not Hub cloud state.'
        : 'No Hub toolkits attached yet. Paste a toolkit id from mcpmarket.com/hub to attach as local_draft.',
    }),
  };
}

export async function runMcpMarketHubTool(
  toolId: string,
  args: Record<string, unknown>,
  ownerExternalId: string | null,
): Promise<McpMarketHubResult> {
  const id = toolId as McpMarketHubToolId;
  switch (id) {
    case 'browse_catalog':
      return hubBrowseCatalog(args);
    case 'search_catalog':
      return hubSearchCatalog(args);
    case 'attach_toolkit':
      return hubAttachToolkit({ ownerExternalId, arguments: args });
    case 'list_attached_toolkits':
      return hubListAttachedToolkits({ ownerExternalId });
    default:
      return {
        ok: false,
        statusHint: 'error',
        error: `Unknown MCP Market Hub tool: ${toolId}`,
      };
  }
}

export function hubProviderNote(): string {
  if (mcpMarketHubConfigured()) {
    return 'MCP_MARKET_HUB_API_KEY present — catalog HTTP still stub until Hub publishes a documented client contract. Attach toolkit UI works as local_draft only.';
  }
  return 'Not configured for live Hub API. Browse at mcpmarket.com/hub; attach toolkit ids as local_draft on /do/connections. No fake catalog calls.';
}
