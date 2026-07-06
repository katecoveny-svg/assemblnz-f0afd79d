import { NextResponse } from 'next/server';
import { ensureAdmin } from '@/lib/admin/ensureAdmin';
import { createConnectLink, listConnectedAccounts, pipedreamConfigured } from '@/lib/connectors/pipedream';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/connect-link?external_user_id=agent:<slug>
 *
 * Operator-only (ensureAdmin — same gate as the hub). Mints a Pipedream
 * Connect link for a pilot customer to connect THEIR tool account, and lists
 * anything already connected under that id. This is the whole onboarding
 * surface for the spike: Kate opens this URL signed in, sends the
 * connect_link_url to the customer, done. A proper /admin/connectors page
 * can grow later if pilots want more.
 */
export async function GET(req: Request) {
  await ensureAdmin();

  if (!pipedreamConfigured()) {
    return NextResponse.json(
      {
        configured: false,
        note: 'Pipedream Connect is not configured. Set PIPEDREAM_CLIENT_ID / PIPEDREAM_CLIENT_SECRET / PIPEDREAM_PROJECT_ID (see docs/PIPEDREAM-CONNECT-SETUP.md).',
      },
      { status: 200 },
    );
  }

  const externalUserId = new URL(req.url).searchParams.get('external_user_id')?.trim();
  if (!externalUserId || !/^(agent|tenant):[a-z0-9-]+$/.test(externalUserId)) {
    return NextResponse.json(
      { error: 'pass ?external_user_id=agent:<slug> or tenant:<slug>' },
      { status: 400 },
    );
  }

  try {
    const [link, accounts] = await Promise.all([
      createConnectLink(externalUserId),
      listConnectedAccounts(externalUserId).catch(() => []),
    ]);
    return NextResponse.json({
      configured: true,
      external_user_id: externalUserId,
      connect_link_url: link.connect_link_url,
      expires_at: link.expires_at ?? null,
      connected_accounts: accounts.map((a) => ({ id: a.id, app: a.app?.name_slug ?? a.app?.name ?? null, healthy: a.healthy ?? null })),
    });
  } catch (e) {
    return NextResponse.json(
      { configured: true, error: e instanceof Error ? e.message : 'unknown' },
      { status: 502 },
    );
  }
}
