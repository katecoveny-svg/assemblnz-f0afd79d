import { authenticateMcpRequest } from '@/lib/mcp/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const auth = await authenticateMcpRequest(request);
  if (!auth.ok) {
    return Response.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  return Response.json({
    ok: true,
    workspace: auth.principal.tenant,
    permissions: auth.principal.permissions,
    clientId: auth.principal.clientId,
    authMode: auth.principal.authMode,
  });
}
