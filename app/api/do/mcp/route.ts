import {
  DO_MCP_SPIKE_ALLOWLIST,
  HOUSEHOLD_FLOOR_MCP_ALLOWLIST,
  type DoMcpAllowlistEntry,
  type DoMcpProviderId,
} from '@/apps/do/shared/do-mcp-gateway';
import { doOwner, privateDoHeaders as headers, sameDoOrigin } from '@/apps/do/services/owner';
import {
  callDoMcpTool,
  composioListTools,
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

  return Response.json({
    signedIn: Boolean(owner),
    cursorMcpNote:
      'Cursor / IDE MCP plugins do not flow into customer DOs. Tools must be declared on the DO allowlist and run through this gateway.',
    flow: [
      'declare mcpAllowlist on DO',
      'configure provider env',
      'owner connects where required',
      'call via /api/do/mcp with receipt',
      'approval for draft/write/spend',
    ],
    providers,
    allowlist,
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
