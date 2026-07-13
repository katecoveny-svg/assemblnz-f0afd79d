/**
 * GET /api/os/inbox/callback/[provider]   provider ∈ { gmail, outlook }
 *
 * Step 2 of "Connect your inbox" for OS tenants. Verifies the HMAC-signed
 * `state` (tenant + signature — a forged or unsigned state is rejected, so
 * nobody can attach an arbitrary mailbox to a tenant), exchanges the code,
 * and stores ONLY the refresh token (+ mailbox address for display) into
 * os_inbox_tokens keyed by (tenant, provider). os-inbox-sync reads that row
 * every 15 minutes and the operating loop does the rest.
 *
 * Fail-soft: every error path bounces to the Connections tab with a note.
 * Tokens are never logged.
 */
import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase/service';
import { getInviteSecret, sha256Hex, timingSafeEqualStr } from '@/lib/demo-invites/crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const OPS_PATH = '/customers/auckland-dog-trainer/ops?tab=connections';
const CONNECTABLE_TENANTS = new Set(['auckland-dog-trainer', 'assembl']);

const REGISTERED_REDIRECT_ORIGIN = (
  process.env.OS_INBOX_REDIRECT_ORIGIN ||
  process.env.FAMILY_INBOX_REDIRECT_ORIGIN ||
  'https://demo.assembl.co.nz'
).replace(/\/$/, '');

export async function GET(req: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  const url = new URL(req.url);
  const opsUrl = `${url.origin}${OPS_PATH}`;

  if (provider !== 'gmail' && provider !== 'outlook') {
    return NextResponse.redirect(`${opsUrl}&connect=unknown-provider`);
  }
  if (url.searchParams.get('error')) {
    return NextResponse.redirect(`${opsUrl}&connect=denied&provider=${provider}`);
  }

  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state') ?? '';
  if (!code) {
    return NextResponse.redirect(`${opsUrl}&connect=no-code&provider=${provider}`);
  }

  // Verify the signed state — tenant.signature, HMAC over the tenant.
  const [tenant, sig] = state.split('.');
  const secret = getInviteSecret();
  if (!tenant || !sig || !secret || !CONNECTABLE_TENANTS.has(tenant)) {
    return NextResponse.redirect(`${opsUrl}&connect=bad-state`);
  }
  const expected = (await sha256Hex(`os-inbox:${tenant}:${secret}`)).slice(0, 24);
  if (!timingSafeEqualStr(sig, expected)) {
    return NextResponse.redirect(`${opsUrl}&connect=bad-state`);
  }

  const clientId =
    provider === 'gmail'
      ? process.env.GMAIL_OAUTH_CLIENT_ID || process.env.GOOGLE_OAUTH_CLIENT_ID || process.env.GOOGLE_CLIENT_ID
      : process.env.MS_OAUTH_CLIENT_ID;
  const clientSecret =
    provider === 'gmail'
      ? process.env.GMAIL_OAUTH_CLIENT_SECRET || process.env.GOOGLE_OAUTH_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET
      : process.env.MS_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${opsUrl}&connect=needs-setup&provider=${provider}`);
  }

  const redirectUri = `${REGISTERED_REDIRECT_ORIGIN}/api/os/inbox/callback/${provider}`;

  let refreshToken: string | null = null;
  let accessToken: string | null = null;
  try {
    const tokenEndpoint =
      provider === 'gmail'
        ? 'https://oauth2.googleapis.com/token'
        : 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
    const body: Record<string, string> = {
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    };
    if (provider === 'outlook') {
      body.scope = 'https://graph.microsoft.com/Mail.Read offline_access';
    }
    const resp = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(body).toString(),
    });
    if (!resp.ok) {
      console.error(`[os-inbox connect] ${provider} token exchange failed:`, resp.status);
      return NextResponse.redirect(`${opsUrl}&connect=exchange-failed&provider=${provider}`);
    }
    const tokens = await resp.json();
    refreshToken = tokens.refresh_token ?? null;
    accessToken = tokens.access_token ?? null;
  } catch {
    console.error(`[os-inbox connect] ${provider} token exchange exception`);
    return NextResponse.redirect(`${opsUrl}&connect=exchange-error&provider=${provider}`);
  }

  if (!refreshToken) {
    return NextResponse.redirect(`${opsUrl}&connect=no-refresh-token&provider=${provider}`);
  }

  // Mailbox address for display/audit only — never a token.
  let email: string | null = null;
  try {
    if (accessToken) {
      if (provider === 'gmail') {
        const r = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (r.ok) email = (await r.json()).email ?? null;
      } else {
        const r = await fetch('https://graph.microsoft.com/v1.0/me?$select=mail,userPrincipalName', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (r.ok) {
          const me = await r.json();
          email = me.mail ?? me.userPrincipalName ?? null;
        }
      }
    }
  } catch {
    /* display-only — connection still succeeds */
  }

  try {
    const supabase = getServiceClient();
    const { error } = await supabase
      .from('os_inbox_tokens')
      .upsert(
        { tenant, provider, refresh_token: refreshToken, email },
        { onConflict: 'tenant,provider' },
      );
    if (error) {
      return NextResponse.redirect(`${opsUrl}&connect=store-failed&provider=${provider}`);
    }
  } catch {
    return NextResponse.redirect(`${opsUrl}&connect=store-error&provider=${provider}`);
  }

  return NextResponse.redirect(`${opsUrl}&connect=done&provider=${provider}`);
}
