import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  DO_MCP_FLOW_SUMMARY,
  DO_MCP_PROVIDERS,
  DO_MCP_SPIKE_ALLOWLIST,
  HOUSEHOLD_FLOOR_MCP_ALLOWLIST,
  isAllowlisted,
  sideEffectNeedsApproval,
} from './do-mcp-gateway';

describe('DO MCP gateway schema', () => {
  it('registers composio, zapier, treg, and pipedream providers', () => {
    expect(DO_MCP_PROVIDERS.map((p) => p.id)).toEqual([
      'composio',
      'zapier',
      'treg',
      'pipedream',
    ]);
    expect(DO_MCP_FLOW_SUMMARY[0]).toMatch(/Cursor/);
  });

  it('ships a Composio spike allowlist with drafts gated', () => {
    const draft = DO_MCP_SPIKE_ALLOWLIST.find((t) => t.toolId === 'GMAIL_CREATE_EMAIL_DRAFT');
    expect(draft?.approvalRequired).toBe(true);
    expect(sideEffectNeedsApproval(draft!)).toBe(true);
    expect(isAllowlisted(DO_MCP_SPIKE_ALLOWLIST, 'composio', 'HACKERNEWS_GET_USER')?.sideEffect).toBe('none');
  });

  it('declares optional HF MCP tools without secrets', () => {
    expect(HOUSEHOLD_FLOOR_MCP_ALLOWLIST.some((t) => t.provider === 'composio')).toBe(true);
    expect(HOUSEHOLD_FLOOR_MCP_ALLOWLIST.some((t) => t.provider === 'treg')).toBe(true);
    expect(JSON.stringify(HOUSEHOLD_FLOOR_MCP_ALLOWLIST)).not.toMatch(/api[_-]?key|secret|token/i);
  });
});

vi.mock('@/lib/do-mcp/composio', () => ({
  composioExecuteTool: vi.fn(async () => ({ ok: false, error: 'COMPOSIO_API_KEY is not configured' })),
  composioListTools: vi.fn(async () => ({ ok: false, error: 'COMPOSIO_API_KEY is not configured' })),
}));

vi.mock('@/lib/connectors/pipedream', () => ({
  pipedreamConfigured: () => false,
}));

describe('DO MCP runtime honesty', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns not_configured when Composio env is missing', async () => {
    const { callDoMcpTool } = await import('@/lib/do-mcp/runtime');
    const receipt = await callDoMcpTool({
      provider: 'composio',
      toolId: 'HACKERNEWS_GET_USER',
      allowlist: DO_MCP_SPIKE_ALLOWLIST,
      ownerExternalId: 'do:user:aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    });
    expect(receipt.status).toBe('not_configured');
  });

  it('denies tools outside the allowlist', async () => {
    const { callDoMcpTool } = await import('@/lib/do-mcp/runtime');
    const receipt = await callDoMcpTool({
      provider: 'composio',
      toolId: 'GMAIL_SEND_EMAIL',
      allowlist: DO_MCP_SPIKE_ALLOWLIST,
      ownerExternalId: 'do:user:aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    });
    expect(receipt.status).toBe('denied_not_allowlisted');
  });

  it('requires approval for draft Gmail tool', async () => {
    const { callDoMcpTool } = await import('@/lib/do-mcp/runtime');
    const receipt = await callDoMcpTool({
      provider: 'composio',
      toolId: 'GMAIL_CREATE_EMAIL_DRAFT',
      allowlist: DO_MCP_SPIKE_ALLOWLIST,
      ownerExternalId: 'do:user:aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      approved: false,
    });
    expect(receipt.status).toBe('denied_approval_required');
  });
});
