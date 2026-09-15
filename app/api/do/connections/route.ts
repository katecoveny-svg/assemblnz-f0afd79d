import { DO_CAPABILITY_CATALOGUE, CONNECTABLE_DO_APPS } from '@/apps/do/shared/capability-catalogue';
import { doOwner, privateDoHeaders as headers, sameDoOrigin } from '@/apps/do/services/owner';
import {
  accountOwner,
  connectDoGmail,
  createConnectLink,
  listConnectedAccounts,
  pipedreamConfigured,
  withAppFilter,
} from '@/lib/connectors/pipedream';

export const dynamic = 'force-dynamic';

export async function GET() {
  const owner = await doOwner();
  if (!owner) return Response.json({ signedIn: false, configured: pipedreamConfigured(), capabilities: DO_CAPABILITY_CATALOGUE, accounts: [] }, { headers });
  const accounts = await listConnectedAccounts(owner.externalId).catch(() => []);
  return Response.json({
    signedIn: true,
    configured: pipedreamConfigured(),
    capabilities: DO_CAPABILITY_CATALOGUE,
    accounts: accounts
      .filter((account) => accountOwner(account) === owner.externalId)
      .map((account) => ({ app: account.app?.name_slug ?? 'unknown', label: account.app?.name ?? account.name ?? 'Connected account', healthy: account.healthy === true })),
  }, { headers });
}

export async function POST(request: Request) {
  if (!sameDoOrigin(request)) return Response.json({ message: 'Open DO to connect a tool.' }, { status: 403, headers });
  const owner = await doOwner();
  if (!owner) return Response.json({ message: 'Sign in to your DO account before connecting tools.' }, { status: 401, headers });
  if (!pipedreamConfigured()) return Response.json({ message: 'Connections are not configured in this environment yet.' }, { status: 503, headers });

  const body = await request.json().catch(() => null) as { app?: unknown } | null;
  const app = typeof body?.app === 'string' ? body.app.trim() : '';
  if (!CONNECTABLE_DO_APPS.has(app)) return Response.json({ message: 'That connector is not enabled for DO yet.' }, { status: 400, headers });

  try {
    if (app === 'gmail') return Response.json({ url: await connectDoGmail(owner.externalId) }, { headers });
    const link = await createConnectLink(owner.externalId);
    return Response.json({ url: withAppFilter(link.connect_link_url, app) }, { headers });
  } catch {
    return Response.json({ message: 'The connection flow could not be opened. Try again shortly.' }, { status: 503, headers });
  }
}
