import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  DO_MCP_FLOW_SUMMARY,
  DO_MCP_PROVIDERS,
  DO_MCP_SPIKE_ALLOWLIST,
  HOUSEHOLD_FLOOR_MCP_ALLOWLIST,
  isAllowlisted,
  sideEffectNeedsApproval,
} from './do-mcp-gateway';
import {
  DO_TOOL_STACK_LAYERS,
  MCP_MARKET_HUB,
  MCP_MARKET_HUB_LOOKALIKES,
  mcpMarketHubAllowlistEntries,
} from './mcp-market-hub-pack';

describe('DO MCP gateway schema', () => {
  it('registers four-layer providers including mcp_market_hub', () => {
    expect(DO_MCP_PROVIDERS.map((p) => p.id)).toEqual([
      'mcp_market_hub',
      'composio',
      'zapier',
      'treg',
      'pipedream',
      'nz_live',
    ]);
    expect(DO_MCP_FLOW_SUMMARY.some((line) => /Four layers/i.test(line))).toBe(true);
    expect(DO_TOOL_STACK_LAYERS).toHaveLength(4);
    expect(DO_TOOL_STACK_LAYERS[0].providers).toContain('mcp_market_hub');
    expect(DO_TOOL_STACK_LAYERS[1].providers).toEqual(['composio', 'zapier', 'treg']);
  });

  it('ships a Composio spike allowlist with drafts gated', () => {
    const draft = DO_MCP_SPIKE_ALLOWLIST.find((t) => t.toolId === 'GMAIL_CREATE_EMAIL_DRAFT');
    expect(draft?.approvalRequired).toBe(true);
    expect(sideEffectNeedsApproval(draft!)).toBe(true);
    expect(isAllowlisted(DO_MCP_SPIKE_ALLOWLIST, 'composio', 'HACKERNEWS_GET_USER')?.sideEffect).toBe('none');
  });

  it('includes Hub allowlist tools on the spike list', () => {
    expect(mcpMarketHubAllowlistEntries().map((e) => e.toolId)).toEqual([
      'browse_catalog',
      'search_catalog',
      'attach_toolkit',
      'list_attached_toolkits',
    ]);
    expect(isAllowlisted(DO_MCP_SPIKE_ALLOWLIST, 'mcp_market_hub', 'attach_toolkit')?.approvalRequired).toBe(true);
    expect(MCP_MARKET_HUB.hubUrl).toContain('mcpmarket.com/hub');
    expect(MCP_MARKET_HUB_LOOKALIKES.map((l) => l.name)).toEqual(['MCP360', 'Glama']);
  });

  it('declares optional HF MCP tools without secrets', () => {
    expect(HOUSEHOLD_FLOOR_MCP_ALLOWLIST.some((t) => t.provider === 'composio')).toBe(true);
    expect(HOUSEHOLD_FLOOR_MCP_ALLOWLIST.some((t) => t.provider === 'treg')).toBe(true);
    expect(HOUSEHOLD_FLOOR_MCP_ALLOWLIST.some((t) => t.provider === 'nz_live')).toBe(true);
    expect(HOUSEHOLD_FLOOR_MCP_ALLOWLIST.some((t) => t.provider === 'mcp_market_hub')).toBe(true);
    expect(JSON.stringify(HOUSEHOLD_FLOOR_MCP_ALLOWLIST)).not.toMatch(/client_secret|access_token|sk-[a-z0-9]/i);
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

  it('returns not_configured for Hub browse without inventing catalog rows', async () => {
    const { callDoMcpTool } = await import('@/lib/do-mcp/runtime');
    const receipt = await callDoMcpTool({
      provider: 'mcp_market_hub',
      toolId: 'browse_catalog',
      allowlist: DO_MCP_SPIKE_ALLOWLIST,
      ownerExternalId: 'do:user:aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    });
    expect(receipt.status).toBe('not_configured');
    expect(receipt.summary).toMatch(/mcpmarket\.com\/hub/i);
    expect(JSON.stringify(receipt.detail ?? {})).not.toMatch(/fake|invented/i);
  });

  it('attaches Hub toolkit as local_draft when approved', async () => {
    const { callDoMcpTool } = await import('@/lib/do-mcp/runtime');
    const receipt = await callDoMcpTool({
      provider: 'mcp_market_hub',
      toolId: 'attach_toolkit',
      allowlist: DO_MCP_SPIKE_ALLOWLIST,
      ownerExternalId: 'do:user:bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      approved: true,
      arguments: { toolkitId: 'acme/customer-success', label: 'CS kit' },
    });
    expect(receipt.status).toBe('ok');
    expect(receipt.detail?.attached).toMatchObject({
      toolkitId: 'acme/customer-success',
      syncState: 'local_draft',
    });

    const listed = await callDoMcpTool({
      provider: 'mcp_market_hub',
      toolId: 'list_attached_toolkits',
      allowlist: DO_MCP_SPIKE_ALLOWLIST,
      ownerExternalId: 'do:user:bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    });
    expect(listed.status).toBe('ok');
    expect((listed.detail?.attached as unknown[])?.length).toBeGreaterThan(0);
  });

  it('does not claim Hub catalog sync when API key is set without a client', async () => {
    vi.stubEnv('MCP_MARKET_HUB_API_KEY', 'test-key-not-a-real-secret');
    const { callDoMcpTool } = await import('@/lib/do-mcp/runtime');
    // Re-import hub module path via runtime — env is read at call time
    const receipt = await callDoMcpTool({
      provider: 'mcp_market_hub',
      toolId: 'search_catalog',
      allowlist: DO_MCP_SPIKE_ALLOWLIST,
      ownerExternalId: 'do:user:aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      arguments: { q: 'gmail' },
    });
    expect(receipt.status).toBe('not_implemented');
    expect(receipt.summary).toMatch(/no fake/i);
  });
});
