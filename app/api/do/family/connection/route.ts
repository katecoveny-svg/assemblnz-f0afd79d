import { accountOwner, connectDoGmail, disconnectDoGmail, listConnectedAccounts, pipedreamConfigured } from '@/lib/connectors/pipedream';
import { doOwner, privateDoHeaders as headers, sameDoOrigin } from '@/apps/do/services/owner';
const configured = () => pipedreamConfigured() && Boolean(process.env.DO_GMAIL_OAUTH_APP_ID);
export const dynamic = 'force-dynamic';
export async function GET() {
  const owner = await doOwner();
  if (!configured()) return Response.json({ configured: false, signedIn: Boolean(owner), connected: false }, { headers });
  if (!owner) return Response.json({ configured: true, signedIn: false, connected: false }, { headers });
  try {
    const accounts = await listConnectedAccounts(owner.externalId);
    return Response.json({ configured: true, signedIn: true, connected: accounts.some(a => accountOwner(a) === owner.externalId && a.app?.name_slug === 'gmail' && a.healthy === true) }, { headers });
  } catch { return Response.json({ message: 'Gmail connection status could not be checked.' }, { status: 503, headers }); }
}
export async function POST(req: Request) {
  if (!sameDoOrigin(req)) return Response.json({ message: 'Open DO to connect Gmail.' }, { status: 403, headers });
  const owner = await doOwner();
  if (!owner) return Response.json({ message: 'Sign in to your own DO account first.' }, { status: 401, headers });
  if (!configured()) return Response.json({ message: 'The Gmail service needs its read-access connection configured by assembl.' }, { status: 503, headers });
  try { return Response.json({ url: await connectDoGmail(owner.externalId) }, { headers }); }
  catch { return Response.json({ message: 'The Gmail connection could not be opened. Try again later.' }, { status: 503, headers }); }
}
export async function DELETE(req: Request) {
  if (!sameDoOrigin(req)) return Response.json({ message: 'Open DO to disconnect Gmail.' }, { status: 403, headers });
  const owner = await doOwner();
  if (!owner) return Response.json({ message: 'Sign in first.' }, { status: 401, headers });
  try { await disconnectDoGmail(owner.externalId); return Response.json({ disconnected: true }, { headers }); }
  catch { return Response.json({ message: 'The connection could not be removed. You can revoke assembl access in your Google account.' }, { status: 503, headers }); }
}
