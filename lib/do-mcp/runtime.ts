import 'server-only';

import {
  isAllowlisted,
  sideEffectNeedsApproval,
  type DoMcpAllowlistEntry,
  type DoMcpProviderId,
  type DoMcpToolReceipt,
} from '@/apps/do/shared/do-mcp-gateway';
import { composioExecuteTool, composioListTools } from './composio';
import { providerConfigured } from './providers';
import { listNzLiveToolStatuses, runNzLiveTool } from './nz-live';
import { tregCallEndpoint, tregCatalogSearch } from './treg';
import { zapierMcpExecute } from './zapier';

export type DoMcpCallInput = {
  provider: DoMcpProviderId;
  toolId: string;
  arguments?: Record<string, unknown>;
  allowlist: readonly DoMcpAllowlistEntry[];
  ownerExternalId: string | null;
  /** Caller confirms human approval for approvalRequired tools. */
  approved?: boolean;
};

function receipt(
  partial: Omit<DoMcpToolReceipt, 'id' | 'at'> & { id?: string },
): DoMcpToolReceipt {
  return {
    id: partial.id ?? crypto.randomUUID(),
    at: new Date().toISOString(),
    provider: partial.provider,
    toolId: partial.toolId,
    ownerExternalId: partial.ownerExternalId,
    status: partial.status,
    summary: partial.summary,
    detail: partial.detail,
  };
}

/**
 * Invoke an allowlisted DO MCP tool. Never invents success when unconfigured.
 */
export async function callDoMcpTool(input: DoMcpCallInput): Promise<DoMcpToolReceipt> {
  const entry = isAllowlisted(input.allowlist, input.provider, input.toolId);
  if (!entry) {
    return receipt({
      provider: input.provider,
      toolId: input.toolId,
      ownerExternalId: input.ownerExternalId,
      status: 'denied_not_allowlisted',
      summary: 'Tool is not on this DO’s MCP allowlist.',
    });
  }

  if (sideEffectNeedsApproval(entry) && !input.approved) {
    return receipt({
      provider: input.provider,
      toolId: input.toolId,
      ownerExternalId: input.ownerExternalId,
      status: 'denied_approval_required',
      summary: `${entry.label} needs owner approval before running (${entry.sideEffect}).`,
      detail: { sideEffect: entry.sideEffect },
    });
  }

  if (input.provider === 'treg' && input.toolId === 'catalog_search') {
    const q = typeof input.arguments?.q === 'string' ? input.arguments.q : '';
    const result = await tregCatalogSearch(q);
    if (!result.ok) {
      return receipt({
        provider: 'treg',
        toolId: input.toolId,
        ownerExternalId: input.ownerExternalId,
        status: 'error',
        summary: result.error,
      });
    }
    return receipt({
      provider: 'treg',
      toolId: input.toolId,
      ownerExternalId: input.ownerExternalId,
      status: 'ok',
      summary: 'Treg catalog search completed (public, no spend).',
      detail: { results: result.results },
    });
  }

  if (!providerConfigured(input.provider)) {
    return receipt({
      provider: input.provider,
      toolId: input.toolId,
      ownerExternalId: input.ownerExternalId,
      status: 'not_configured',
      summary: `${input.provider} is not configured in this environment.`,
    });
  }

  if (input.provider === 'composio') {
    if (!input.ownerExternalId) {
      return receipt({
        provider: 'composio',
        toolId: input.toolId,
        ownerExternalId: null,
        status: 'error',
        summary: 'Sign in to run Composio tools as a DO owner.',
      });
    }
    const result = await composioExecuteTool({
      toolSlug: input.toolId,
      userId: input.ownerExternalId,
      arguments: input.arguments,
    });
    if (!result.ok) {
      return receipt({
        provider: 'composio',
        toolId: input.toolId,
        ownerExternalId: input.ownerExternalId,
        status: 'error',
        summary: result.error,
      });
    }
    return receipt({
      provider: 'composio',
      toolId: input.toolId,
      ownerExternalId: input.ownerExternalId,
      status: 'ok',
      summary: `Composio ran ${entry.label}.`,
      detail: result.detail,
    });
  }

  if (input.provider === 'zapier') {
    const result = await zapierMcpExecute({
      toolName: input.toolId,
      arguments: input.arguments,
    });
    return receipt({
      provider: 'zapier',
      toolId: input.toolId,
      ownerExternalId: input.ownerExternalId,
      status: 'not_implemented',
      summary: result.error,
    });
  }

  if (input.provider === 'treg') {
    const result = await tregCallEndpoint({
      endpointId: input.toolId,
      method: input.arguments?.method === 'POST' ? 'POST' : 'GET',
      body: typeof input.arguments?.body === 'object' && input.arguments.body
        ? (input.arguments.body as Record<string, unknown>)
        : undefined,
    });
    if (!result.ok) {
      return receipt({
        provider: 'treg',
        toolId: input.toolId,
        ownerExternalId: input.ownerExternalId,
        status: 'error',
        summary: result.error,
      });
    }
    return receipt({
      provider: 'treg',
      toolId: input.toolId,
      ownerExternalId: input.ownerExternalId,
      status: 'ok',
      summary: `Treg called ${input.toolId} (pay-per-call).`,
      detail: result.detail,
    });
  }

  if (input.provider === 'nz_live') {
    const result = await runNzLiveTool(input.toolId, input.arguments ?? {});
    if (!result.ok) {
      return receipt({
        provider: 'nz_live',
        toolId: input.toolId,
        ownerExternalId: input.ownerExternalId,
        status: result.statusHint === 'stub' || result.statusHint === 'needs_key'
          ? 'not_configured'
          : 'error',
        summary: result.error,
      });
    }
    return receipt({
      provider: 'nz_live',
      toolId: input.toolId,
      ownerExternalId: input.ownerExternalId,
      status: 'ok',
      summary: `NZ Live ran ${entry.label}.`,
      detail: result.detail,
    });
  }

  // Pipedream stays on /api/do/connections + runConnectorAction — not this MCP path.
  return receipt({
    provider: 'pipedream',
    toolId: input.toolId,
    ownerExternalId: input.ownerExternalId,
    status: 'not_implemented',
    summary: 'Pipedream actions run via Connect mapped actions (/do/connections), not the MCP gateway call path.',
  });
}

export async function listSpikeComposioTools() {
  return composioListTools({ query: 'hackernews', limit: 10 });
}

export { listNzLiveToolStatuses };
