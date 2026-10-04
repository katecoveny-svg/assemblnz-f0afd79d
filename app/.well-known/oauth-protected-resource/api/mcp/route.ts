export const dynamic = 'force-dynamic';
export async function GET() {
  const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabase) return Response.json({ error: 'oauth_not_configured' }, { status: 503 });
  return Response.json({
    resource: 'https://www.assembl.co.nz/api/mcp',
    authorization_servers: [`${supabase.replace(/\/$/, '')}/auth/v1`],
    scopes_supported: ['email', 'profile'], bearer_methods_supported: ['header'],
    resource_documentation: 'https://www.assembl.co.nz/docs/mcp',
  }, { headers: { 'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': '*' } });
}
