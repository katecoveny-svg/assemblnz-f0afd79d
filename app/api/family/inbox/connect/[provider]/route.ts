/**
 * GET /api/family/inbox/connect/[provider]   provider ∈ { gmail, outlook }
 *
 * Step 1 of "Connect your inbox" for Family OS. Redirects Kate's browser to the
 * Google (or Microsoft) OAuth consent screen with the read-only mail scope and
 * `access_type=offline&prompt=consent` so the token exchange returns a REFRESH
 * token. `state` carries the family hub so the callback knows where to store it.
 *
 * The redirect_uri points back at /api/family/inbox/callback/[provider] on this
 * same origin — that must be registered as an authorised redirect URI in the
 * provider's OAuth app (see docs/FAMILY-INBOX-ECHO-SETUP.md).
 *
 * If the client-id env is missing, we DON'T show a broken consent page — we
 * bounce back to the ops console with ?connect=needs-setup so the button just
 * says "not wired yet" rather than erroring.
 *
 * Draft-only posture is unchanged: this only grants READ access to mail. The
 * sync never replies, RSVPs, pays or sends.
 */
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const HUB = 'demo'; // matches app/customers/family/ops/actions.ts
const OPS_PATH = '/customers/family/ops';

const GMAIL_SCOPE = 'https://www.googleapis.com/auth/gmail.readonly';
const OUTLOOK_SCOPE = 'https://graph.microsoft.com/Mail.Read offline_access';

function originOf(req: Request): string {
  // Prefer an explicit configured site URL (stable across proxies), else the
  // request origin. Both callback registration and this must agree.
  const configured = process.env.NEXT_PUBLIC_SITE_URL || process.env.APP_URL;
  if (configured) return configured.replace(/\/$/, '');
  return new URL(req.url).origin;
}

export async function GET(req: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  const origin = originOf(req);
  const opsUrl = `${origin}${OPS_PATH}`;

  if (provider !== 'gmail' && provider !== 'outlook') {
    return NextResponse.redirect(`${opsUrl}?connect=unknown-provider`);
  }

  // Reuse the exact client-id env the sync's token-minting already expects, so
  // the same OAuth app issues the refresh token the sync later refreshes.
  const clientId =
    provider === 'gmail'
      ? process.env.GMAIL_OAUTH_CLIENT_ID || process.env.GOOGLE_OAUTH_CLIENT_ID || process.env.GOOGLE_CLIENT_ID
      : process.env.MS_OAUTH_CLIENT_ID;

  if (!clientId) {
    // No consent page without a client id — send them back with an honest note.
    return NextResponse.redirect(`${opsUrl}?connect=needs-setup`);
  }

  const redirectUri = `${origin}/api/family/inbox/callback/${provider}`;

  let authUrl: string;
  if (provider === 'gmail') {
    const p = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: GMAIL_SCOPE,
      access_type: 'offline',
      prompt: 'consent',
      include_granted_scopes: 'true',
      state: HUB,
    });
    authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${p.toString()}`;
  } else {
    const p = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: OUTLOOK_SCOPE,
      response_mode: 'query',
      prompt: 'consent',
      state: HUB,
    });
    authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${p.toString()}`;
  }

  return NextResponse.redirect(authUrl);
}
