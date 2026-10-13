import { describe, expect, it, vi } from 'vitest';
import { PUBLIC_KNOWLEDGE, searchPublicKnowledge } from './public-knowledge';
import { GET } from '@/app/api/knowledge/search/route';
import { POST } from '@/app/api/knowledge/mcp/route';
import sitemap from '@/app/sitemap';
import { NextRequest, NextResponse } from 'next/server';
import { middleware } from '@/middleware';
vi.mock('@/lib/supabase/middleware', () => ({ updateSession: vi.fn(async () => NextResponse.next()) }));
import { metadata as agentsMetadata } from '@/app/tools/agents/page';
import { metadata as mcpMetadata } from '@/app/docs/mcp/page';

vi.mock('@/lib/pursuit/public-store', () => ({ countPublicTool: vi.fn().mockResolvedValue(false) }));
vi.mock('@/lib/public-nz/server', () => ({ retrieveVerifiedPublicNzKnowledge: vi.fn().mockResolvedValue({ discovery: [], verification: [] }) }));

const ids = (query: string, limit?: number) => searchPublicKnowledge(query, limit).map(record => record.id);
const rpc = (method: string, params?: unknown) => POST(new Request('https://www.assembl.co.nz/api/knowledge/mcp', {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
}));

describe('bounded public DO discovery', () => {
  it.each(['DO', 'do', 'Do', 'dO', ' DO ', '(DO)'])('finds only the product for %s', query => {
    expect(ids(query)).toEqual(['do']);
  });
  it.each(['a', 'in', 'to', 'of', 'on', 'is', 'an', 'by', 'xx', 'AI', 'NZ', 'd o', 'dodo'])('ignores unrelated short tokens and does not split %s into DO', query => {
    expect(ids(query)).toEqual([]);
  });
  it('retains longer search ranking and ignores short stopwords', () => {
    expect(ids('pursuit')[0]).toBe('pursuit');
    expect(ids('studio demonstrator pitch')[0]).toBe('studio');
    expect(ids('to be in studio')).toEqual(ids('studio'));
    expect(ids('DO bounded')[0]).toBe('do');
  });
  it('retains term and result bounds and public provenance', () => {
    expect(ids(`${Array.from({length: 30}, (_, i) => `zz${String.fromCharCode(97 + Math.floor(i / 26), 97 + i % 26)}`).join(' ')} DO`)).toEqual([]);
    expect(ids('public work customer research permission', 100).length).toBeLessThanOrEqual(6);
    expect(ids('studio demonstrator pitch', 1)).toHaveLength(1);
    for (const record of searchPublicKnowledge('DO')) {
      expect(record.scope).toBe('owned_public');
      expect(PUBLIC_KNOWLEDGE.some(source => source.id === record.id)).toBe(true);
      expect(record.url).toBe('https://www.assembl.co.nz/do');
    }
  });
  it('serves DO through the public HTTP handler with external dependencies mocked', async () => {
    const response = await GET(new Request('https://www.assembl.co.nz/api/knowledge/search?q=do'));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ privateKnowledge: false, paid: false, records: [{ id: 'do', scope: 'owned_public' }] });
    expect((await GET(new Request('https://www.assembl.co.nz/api/knowledge/search?q=d'))).status).toBe(400);
  });
  it('exercises public MCP initialize, listing and bounded search without account access', async () => {
    expect(await (await rpc('initialize')).json()).toMatchObject({ result: { serverInfo: { name: 'assembl-public-knowledge' } } });
    const listing = await (await rpc('tools/list')).json();
    expect(listing.result.tools).toHaveLength(1);
    expect(listing.result.tools[0].annotations.readOnlyHint).toBe(true);
    for (const query of ['DO', 'do', 'Do']) {
      const body = await (await rpc('tools/call', { name: 'search_assembl_public_knowledge', arguments: { query, limit: 1 } })).json();
      expect(body.result.structuredContent).toMatchObject({ privateKnowledge: false, paid: false, records: [{ id: 'do' }] });
      expect(JSON.parse(body.result.content[0].text)).toEqual(body.result.structuredContent);
    }
    const invalid = await (await rpc('tools/call', { name: 'search_assembl_public_knowledge', arguments: { query: 'DO', limit: 7 } })).json();
    expect(invalid.result.isError).toBe(true);
  });
});

describe('public documentation discovery metadata', () => {
  it('serves the documentation and sitemap routes on public hosts', async () => {
    for (const host of ['assembl.co.nz', 'www.assembl.co.nz']) {
      for (const path of ['/tools/agents', '/docs/mcp', '/sitemap.xml']) {
        const response = await middleware(new NextRequest(`https://${host}${path}`, { headers: { host } }));
        expect(response.headers.get('x-middleware-rewrite')).toBeNull();
        expect(response.headers.get('location')).toBeNull();
      }

    }
  });
  it('includes both canonical public documentation routes exactly once', () => {
    const urls = sitemap().map(entry => entry.url);
    for (const [path, metadata] of [['/tools/agents', agentsMetadata], ['/docs/mcp', mcpMetadata]] as const) {
      const url = `https://www.assembl.co.nz${path}`;
      expect(urls.filter(value => value === url)).toHaveLength(1);
      expect(metadata.alternates?.canonical).toBe(url);
    }
    expect(urls.some(url => /\/(demo|clients|vault|enquiries|api)(\/|$)/.test(new URL(url).pathname))).toBe(false);
  });
});
