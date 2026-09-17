import { searchPublicKnowledge, PUBLIC_KNOWLEDGE_VERSION } from '@/lib/pursuit/public-knowledge';
import { countPublicTool } from '@/lib/pursuit/public-store';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const headers = { 'Cache-Control': 'no-store' };
const tools = [{ name: 'search_assembl_public_knowledge', description: 'Search published Assembl product knowledge for Pursuit, DO, Studio and customer journeys. Free, read-only. Does not search private clients, company registers or the web. Results include canonical URLs and knowledge version.', inputSchema: { type: 'object', properties: { query: { type: 'string', minLength: 2, maxLength: 300 }, limit: { type: 'integer', minimum: 1, maximum: 6 } }, required: ['query'], additionalProperties: false }, annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false } }];
export function GET() { return new Response(null, { status: 405, headers: { ...headers, Allow: 'POST' } }); }
export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) return new Response('Origin not allowed', { status: 403, headers });
  if (!(request.headers.get('content-type') ?? '').includes('application/json')) return new Response('JSON required', { status: 415, headers });
  let id: string | number | null = null;
  try {
    const reader = request.body?.getReader(); if (!reader) throw new Error('empty');
    const parts: Uint8Array[] = []; let size = 0;
    while (true) { const { done, value } = await reader.read(); if (done) break; size += value.length; if (size > 4096) { await reader.cancel(); return new Response('Request too large', { status: 413, headers }); } parts.push(value); }
    const payload = JSON.parse(Buffer.concat(parts).toString('utf8'));
    if (!payload || Array.isArray(payload) || payload.jsonrpc !== '2.0' || typeof payload.method !== 'string') throw new Error('invalid');
    if (typeof payload.id === 'string' || typeof payload.id === 'number') id = payload.id;
    if (payload.method === 'notifications/initialized' && id === null) return new Response(null, { status: 202, headers });
    if (id === null) throw new Error('missing_id');
    const ok = (result: unknown) => Response.json({ jsonrpc: '2.0', id, result }, { headers });
    if (payload.method === 'initialize') { await countPublicTool('mcp_initialize'); return ok({ protocolVersion: '2025-11-25', capabilities: { tools: {} }, serverInfo: { name: 'assembl-public-knowledge', version: '1.0.0' }, instructions: 'Published public Assembl knowledge only. No private records. Current tool availability is documented at /tools/agents.' }); }
    if (payload.method === 'ping') return ok({});
    if (payload.method === 'tools/list') { await countPublicTool('mcp_tools_list'); return ok({ tools }); }
    if (payload.method === 'tools/call' && payload.params?.name === tools[0].name) {
      const args = payload.params.arguments;
      if (!args || typeof args.query !== 'string' || args.query.trim().length < 2 || args.query.length > 300 || Object.keys(args).some(k => !['query','limit'].includes(k)) || (args.limit !== undefined && (!Number.isInteger(args.limit) || args.limit < 1 || args.limit > 6))) return ok({ isError: true, content: [{ type: 'text', text: 'Provide a query of 2–300 characters and an optional limit from 1 to 6.' }] });
      const result = { scope: 'owned_public', version: PUBLIC_KNOWLEDGE_VERSION, records: searchPublicKnowledge(args.query, args.limit ?? 4), privateKnowledge: false, paid: false };
      await countPublicTool('mcp_knowledge_search');
      return ok({ content: [{ type: 'text', text: JSON.stringify(result) }], structuredContent: result, isError: false });
    }
    return Response.json({ jsonrpc: '2.0', id, error: { code: -32601, message: 'Method or tool not supported' } }, { headers });
  } catch { return Response.json({ jsonrpc: '2.0', id, error: { code: -32600, message: 'Invalid request' } }, { status: 400, headers }); }
}
