/**
 * GET /api/os/inbox/connect/[provider]?tenant=…   provider ∈ { gmail, outlook }
 *
 * Step 1 of "Connect your inbox" for OS tenants (Phase 4) — the tenant-
 * facing generalisation of the family flow. Redirects the operator to the
 * provider's consent screen with READ-ONLY mail scope and offline access so
 * the exchange returns a refresh token. `state` carries the tenant plus an
 * HMAC signature (DEMO_INVITE_SECRET) so the callback can trust it.
 *
 * Gated: the caller must present the demo basic-auth header or the signed
 * invite cookie (same defence-in-depth as genome edits), and the tenant
 * must be on the connectable allowlist. Draft-only posture unchanged —
 * read scope only; the sync never replies, pays or sends.
 */
import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import { INVITE_COOKIE, getInviteSecret, sha256Hex } from '@/lib/demo-invites/crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const OPS_PATH = '/customers/auckland-dog-trainer/ops?tab=connections';
const CONNECTABLE_TENANTS = new Set(['auckland-dog-trainer', 'assembl']);

const GMAIL_SCOPE = 'https://www.googleapis.com/auth/gmail.readonly';
const OUTLOOK_SCOPE = 'https://graph.microsoft.com/Mail.Read offline_access';

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

  // Operator gate — same posture as genome edits.
  const h = await headers();
  const jar = await cookies();
  const authorised =
    (h.get('authorization') ?? '').startsWith('Basic ') || Boolean(jar.get(INVITE_COOKIE)?.value);
  if (!authorised) {
    return NextResponse.redirect(`${opsUrl}&connect=not-authorised`);
  }

  const tenant = url.searchParams.get('tenant') ?? '';
  if (!CONNECTABLE_TENANTS.has(tenant)) {
    return NextResponse.redirect(`${opsUrl}&connect=unknown-tenant`);
  }

  const secret = getInviteSecret();
  if (!secret) {
    return NextResponse.redirect(`${opsUrl}&connect=needs-setup`);
  }
  const sig = (await sha256Hex(`os-inbox:${tenant}:${secret}`)).slice(0, 24);
  const state = `${tenant}.${sig}`;

  const clientId =
    provider === 'gmail'
      ? process.env.GMAIL_OAUTH_CLIENT_ID || process.env.GOOGLE_OAUTH_CLIENT_ID || process.env.GOOGLE_CLIENT_ID
      : process.env.MS_OAUTH_CLIENT_ID;
  if (!clientId) {
    return NextResponse.redirect(`${opsUrl}&connect=needs-setup&provider=${provider}`);
  }

  const redirectUri = `${REGISTERED_REDIRECT_ORIGIN}/api/os/inbox/callback/${provider}`;

  const consentUrl =
    provider === 'gmail'
      ? `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
          client_id: clientId,
          redirect_uri: redirectUri,
          response_type: 'code',
          scope: GMAIL_SCOPE,
          access_type: 'offline',
          prompt: 'consent',
          state,
        })}`
      : `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${new URLSearchParams({
          client_id: clientId,
          redirect_uri: redirectUri,
          response_type: 'code',
          scope: OUTLOOK_SCOPE,
          prompt: 'consent',
          state,
        })}`;

  return NextResponse.redirect(consentUrl);
}
