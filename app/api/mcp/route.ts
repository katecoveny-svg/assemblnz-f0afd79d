import { createMcpHandler } from '@modelcontextprotocol/server';
import { authenticateMcpRequest } from '@/lib/mcp/auth';
import { createEnquiryMcpServer } from '@/lib/mcp/enquiries';
import { EnquiryError, requireEnquiryOwner } from '@/apps/do/enquiries/service';
import { readDoJson } from '@/apps/do/shared/http';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;
const resourceMetadata = 'https://www.assembl.co.nz/.well-known/oauth-protected-resource/api/mcp';
export async function POST(request: Request) {
  const allowedHosts = ['www.assembl.co.nz', 'assembl.co.nz', process.env.VERCEL_URL, ...(process.env.NODE_ENV !== 'production' ? ['localhost', '127.0.0.1'] : [])];
  const url = new URL(request.url);
  const origin = request.headers.get('origin');
  if (!allowedHosts.includes(url.hostname) || (origin && !['https://chatgpt.com', 'https://www.assembl.co.nz', 'https://assembl.co.nz', ...(process.env.NODE_ENV !== 'production' ? [url.origin] : [])].includes(origin)))
    return Response.json({ error: 'origin_not_allowed' }, { status: 403 });
  const auth = await authenticateMcpRequest(request);
  if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status, headers: { 'Cache-Control': 'no-store', 'WWW-Authenticate': `Bearer resource_metadata="${resourceMetadata}", scope="email profile"` } });
  if (auth.principal.authMode !== 'oauth') return Response.json({ error: 'user_oauth_required' }, { status: 403 });
  try {
    await requireEnquiryOwner(auth.principal.userId);
    // Enquiry access is independently revocable even if another MCP membership
    // remains active. Never silently fall back to a broader workspace grant.
    const { getServiceClient } = await import('@/lib/supabase/service');
    const membership = await getServiceClient().from('mcp_tenant_memberships').select('permissions').eq('user_id', auth.principal.userId).eq('tenant', `do-enquiries:${auth.principal.userId}`).eq('status', 'active').maybeSingle();
    if (membership.error || !membership.data) return Response.json({ error: 'Enable enquiry plugin access on /do/enquiries first.' }, { status: 403 });
    let body: unknown;
    try { body = await readDoJson(request, 32_000); } catch { return Response.json({ error: 'invalid_request' }, { status: 400 }); }
    const granted: string[] = membership.data.permissions;
    const permissions = auth.principal.permissions.filter(p => granted.includes(p));
    const handler = createMcpHandler(() => createEnquiryMcpServer({ ...auth.principal, permissions }), { responseMode: 'json', maxSubscriptions: 0 });
    try {
      const response = await handler.fetch(new Request(request.url, { method: 'POST', headers: request.headers, body: JSON.stringify(body) }));
      const bytes = await response.arrayBuffer();
      const headers = new Headers(response.headers); headers.set('Cache-Control', 'private, no-store');
      return new Response(bytes, { status: response.status, headers });
    } finally { await handler.close(); }
  } catch (error) {
    return Response.json({ error: error instanceof EnquiryError ? error.message : 'mcp_unavailable' }, { status: error instanceof EnquiryError ? error.status : 503 });
  }
}
export async function GET() {
  return Response.json({ error: 'Use authenticated MCP POST requests.' }, { status: 405, headers: { Allow: 'POST', 'Cache-Control': 'no-store', 'WWW-Authenticate': `Bearer resource_metadata="${resourceMetadata}"` } });
}
