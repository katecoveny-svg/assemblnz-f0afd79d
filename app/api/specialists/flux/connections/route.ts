import { createClient } from '@/lib/supabase/server';
import { createConnectLink, listConnectedAccounts, pipedreamConfigured, withAppFilter } from '@/lib/connectors/pipedream';

const headers = { 'Cache-Control': 'private, no-store', Vary: 'Cookie' };
async function owner() {
  try { const db = await createClient(); const { data, error } = await db.auth.getUser(); return !error && data.user && !data.user.is_anonymous ? `tenant:flux-${data.user.id}` : null; } catch { return null; }
}
export async function GET() {
  const id = await owner(); if (!id) return Response.json({ error: 'Sign in to see your business connections.' }, { status: 401, headers });
  if (!pipedreamConfigured()) return Response.json({ configured: false, connections: [] }, { headers });
  try { const accounts = await listConnectedAccounts(id); return Response.json({ configured: true, connections: accounts.map(a => ({ app: a.app?.name_slug, name: a.app?.name, healthy: a.healthy === true })) }, { headers }); }
  catch { return Response.json({ error: 'Connection status could not be checked.' }, { status: 503, headers }); }
}
export async function POST(req: Request) {
  if (req.headers.get('origin') !== new URL(req.url).origin) return Response.json({ error: 'Open Flux to connect.' }, { status: 403, headers });
  const id = await owner(); if (!id) return Response.json({ error: 'Sign in before connecting a business account.' }, { status: 401, headers });
  if (!pipedreamConfigured()) return Response.json({ error: 'Connector setup is needed. You can export your pipeline as CSV now.' }, { status: 503, headers });
  try { const link = await createConnectLink(id); return Response.json({ url: withAppFilter(link.connect_link_url, 'hubspot') }, { headers }); }
  catch { return Response.json({ error: 'A secure connection link could not be created.' }, { status: 503, headers }); }
}
