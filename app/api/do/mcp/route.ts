import {
  DO_MCP_SPIKE_ALLOWLIST,
  HOUSEHOLD_FLOOR_MCP_ALLOWLIST,
  type DoMcpAllowlistEntry,
  type DoMcpProviderId,
} from '@/apps/do/shared/do-mcp-gateway';
import {
  DO_TOOL_STACK_LAYERS,
  MCP_MARKET_HUB,
  MCP_MARKET_HUB_LOOKALIKES,
} from '@/apps/do/shared/mcp-market-hub-pack';
import { doOwner, privateDoHeaders as headers, sameDoOrigin } from '@/apps/do/services/owner';
import {
  callDoMcpTool,
  composioListTools,
  hubListAttachedToolkits,
  listNzLiveNamedToolkits,
  listNzLiveToolStatuses,
  listProviderStatuses,
  tregCatalogSearch,
  zapierMcpProbe,
} from '@/lib/do-mcp';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function resolveAllowlist(scope: unknown): readonly DoMcpAllowlistEntry[] {
  if (scope === 'household') return HOUSEHOLD_FLOOR_MCP_ALLOWLIST;
  return DO_MCP_SPIKE_ALLOWLIST;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const scope = url.searchParams.get('scope');
  const allowlist = resolveAllowlist(scope);
  const owner = await doOwner();
  const providers = listProviderStatuses();

  let composioSample: Awaited<ReturnType<typeof composioListTools>> | null = null;
  const composio = providers.find((p) => p.id === 'composio');
  if (composio?.configured) {
    composioSample = await composioListTools({ query: 'gmail', limit: 8 });
  }

  let tregSample: Awaited<ReturnType<typeof tregCatalogSearch>> | null = null;
  if (url.searchParams.get('treg') === '1') {
    tregSample = await tregCatalogSearch('keyword volume', 5);
  }

  const zapier = await zapierMcpProbe();
  const nzLive = await listNzLiveToolStatuses();
  const nzLiveNamedToolkits = listNzLiveNamedToolkits();
  const hubAttached = await hubListAttachedToolkits({
    ownerExternalId: owner?.externalId ?? null,
  });

  return Response.json({
    signedIn: Boolean(owner),
    cursorMcpNote:
      'Cursor / IDE MCP plugins do not flow into customer DOs. Tools must be declared on the DO allowlist and run through this gateway.',
    portableAgentNote:
      'DO is a portable agent: floating ✦ on web/extension/Mac takes what you can see (selection/page with consent), runs Clear + prepare seats, drafts-only for send. Household Floor is the same object — not an inert Office job.',
    fourLayerStack: DO_TOOL_STACK_LAYERS,
    flow: [
      'discover/pack via MCP Market Hub (optional)',
      'declare mcpAllowlist on DO',
      'configure provider env',
      'owner connects where required',
      'call via /api/do/mcp with receipt',
      'approval for draft/write/spend',
    ],
    providers,
    allowlist,
    nzLive,
    nzLiveNamedToolkits,
    nzLiveGroceryNote:
      'Household grocery = consent browser-seat only. Do not invent supermarket APIs.',
    mcpMarketHub: {
      hubUrl: MCP_MARKET_HUB.hubUrl,
      appUrl: MCP_MARKET_HUB.appUrl,
      directoryUrl: MCP_MARKET_HUB.directoryUrl,
      connectHint: MCP_MARKET_HUB.connectHint,
      lookalikes: MCP_MARKET_HUB_LOOKALIKES,
      attached: hubAttached.ok ? hubAttached.detail.attached : [],
      publicCatalogApi: 'not_documented',
    },
    composioSample,
    tregSample,
    zapier,
  }, { headers });
}

export async function POST(request: Request) {
  if (!sameDoOrigin(request)) {
    return Response.json({ message: 'Open DO to call MCP tools.' }, { status: 403, headers });
  }
  const owner = await doOwner();
  const body = await request.json().catch(() => null) as {
    provider?: unknown;
    toolId?: unknown;
    arguments?: unknown;
    scope?: unknown;
    approved?: unknown;
  } | null;

  const provider = typeof body?.provider === 'string' ? body.provider.trim() as DoMcpProviderId : '';
  const toolId = typeof body?.toolId === 'string' ? body.toolId.trim() : '';
  if (!provider || !toolId) {
    return Response.json({ message: 'provider and toolId are required.' }, { status: 400, headers });
  }

  const allowlist = resolveAllowlist(body?.scope);
  const args =
    body?.arguments && typeof body.arguments === 'object' && !Array.isArray(body.arguments)
      ? (body.arguments as Record<string, unknown>)
      : {};

  const result = await callDoMcpTool({
    provider,
    toolId,
    arguments: args,
    allowlist,
    ownerExternalId: owner?.externalId ?? null,
    approved: body?.approved === true,
  });

  const status =
    result.status === 'ok' ? 200
      : result.status === 'denied_not_allowlisted' || result.status === 'denied_approval_required' ? 403
        : result.status === 'not_configured' || result.status === 'not_implemented' ? 503
          : 502;

  return Response.json({ receipt: result }, { status, headers });
}
