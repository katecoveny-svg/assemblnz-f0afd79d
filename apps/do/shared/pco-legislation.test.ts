import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DO_MCP_SPIKE_ALLOWLIST } from '@/apps/do/shared/do-mcp-gateway';
import { pcoLegislationLooksLive } from '@/apps/do/shared/nz-live-pack';

describe('pcoLegislationLooksLive', () => {
  it('accepts PCO provider + result envelopes', () => {
    expect(
      pcoLegislationLooksLive({
        action: 'legislation_search',
        data: {
          provider: 'Parliamentary Counsel Office',
          api: 'New Zealand Legislation API v0',
          result: { results: [{ title: 'Privacy Act 2020' }] },
        },
      }),
    ).toBe(true);
  });

  it('rejects fallback search-URL-only responses', () => {
    expect(
      pcoLegislationLooksLive({
        data: {
          query: 'x',
          search_url: 'https://www.legislation.govt.nz/search?search=x',
          note: 'PCO_API_KEY is not configured or the PCO API did not return JSON.',
        },
      }),
    ).toBe(false);
  });

  it('never treats empty payloads as live', () => {
    expect(pcoLegislationLooksLive(null)).toBe(false);
    expect(pcoLegislationLooksLive({})).toBe(false);
  });
});

describe('PCO legislation DO runtime', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('calls mcp-nz-govt without requiring a Next.js PCO_API_KEY mirror', async () => {
    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({
          source: 'mcp-nz-govt',
          action: 'legislation_search',
          data: {
            provider: 'Parliamentary Counsel Office',
            api: 'New Zealand Legislation API v0',
            query: 'Privacy Act',
            result: { results: [{ title: 'Privacy Act 2020' }] },
            search_url: 'https://api.legislation.govt.nz/v0/works/?search_term=Privacy+Act',
          },
          timestamp: new Date().toISOString(),
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon');

    const { callDoMcpTool } = await import('@/lib/do-mcp/runtime');
    const receipt = await callDoMcpTool({
      provider: 'nz_live',
      toolId: 'pco_legislation',
      allowlist: DO_MCP_SPIKE_ALLOWLIST,
      ownerExternalId: 'do:user:dddddddd-dddd-dddd-dddd-dddddddddddd',
      arguments: { query: 'Privacy Act' },
    });

    expect(receipt.status).toBe('ok');
    expect(JSON.stringify(receipt)).not.toMatch(/PCO_API_KEY=\S+|X-Api-Key/i);
    expect(fetchMock).toHaveBeenCalled();
    const first = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(String(first[0])).toContain('/functions/v1/mcp-nz-govt');
    const body = JSON.parse(String(first[1]?.body ?? '{}')) as { action?: string; query?: string };
    expect(body.action).toBe('legislation_search');
    expect(body.query).toBe('Privacy Act');
  });

  it('returns needs_key when edge responds with the unconfigured fallback', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            source: 'mcp-nz-govt',
            action: 'legislation_search',
            data: {
              query: 'x',
              search_url: 'https://www.legislation.govt.nz/search?search=x',
              note: 'PCO_API_KEY is not configured or the PCO API did not return JSON.',
            },
          }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        ),
      ),
    );
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon');

    const { callDoMcpTool } = await import('@/lib/do-mcp/runtime');
    const receipt = await callDoMcpTool({
      provider: 'nz_live',
      toolId: 'pco_legislation',
      allowlist: DO_MCP_SPIKE_ALLOWLIST,
      ownerExternalId: null,
      arguments: { query: 'x' },
    });
    expect(receipt.status).toBe('not_configured');
    expect(receipt.summary).toMatch(/PCO_API_KEY/);
    expect(receipt.summary).not.toMatch(/sk-|Bearer /);
  });
});
