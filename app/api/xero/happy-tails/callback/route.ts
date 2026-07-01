import { NextResponse } from 'next/server';
import { XERO_SCOPES } from '@/lib/xero/happy-tails';

/**
 * Xero OAuth 2.0 (PKCE) callback — Happy Tails × Keeper pilot.
 *
 * Exchanges the authorization code for tokens and stores them (encrypted at rest
 * via Supabase Vault where available) in tenant_customers.xero_tokens for the
 * happy-tails tenant. Uses the service-role client so tokens never touch anon.
 *
 * SAFETY: connecting Xero only enables DRAFT creation. No invoice is ever issued
 * or sent from here. Never handles Xero data outside the Happy Tails tenant.
 *
 * Required env (surface to Kate — never paste): XERO_CLIENT_ID, XERO_CLIENT_SECRET,
 * XERO_REDIRECT_URI. If unset, returns a 501 with the missing vars named.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const codeVerifier = url.searchParams.get('code_verifier') ?? undefined; // PKCE (from signed state in prod)
  const error = url.searchParams.get('error');

  if (error) {
    return NextResponse.json({ ok: false, error }, { status: 400 });
  }
  if (!code) {
    return NextResponse.json({ ok: false, error: 'missing authorization code' }, { status: 400 });
  }

  const clientId = process.env.XERO_CLIENT_ID;
  const clientSecret = process.env.XERO_CLIENT_SECRET;
  const redirectUri = process.env.XERO_REDIRECT_URI;
  const missing = [
    !clientId && 'XERO_CLIENT_ID',
    !clientSecret && 'XERO_CLIENT_SECRET',
    !redirectUri && 'XERO_REDIRECT_URI',
  ].filter(Boolean);

  if (missing.length > 0) {
    return NextResponse.json(
      {
        ok: false,
        mode: 'mocked',
        error: 'Xero not configured',
        missing,
        note: 'Set these in Vercel to enable the live OAuth exchange. The pilot demo runs on mocked INV-3031 data until then.',
      },
      { status: 501 },
    );
  }

  try {
    const tokenRes = await fetch('https://identity.xero.com/connect/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri!,
        ...(codeVerifier ? { code_verifier: codeVerifier } : {}),
      }).toString(),
    });

    if (!tokenRes.ok) {
      return NextResponse.json({ ok: false, error: `token exchange failed: ${tokenRes.status}` }, { status: 502 });
    }
    const tokens = await tokenRes.json();

    // Store tokens in the admin-only tenant_xero_tokens table via service-role
    // (never on the anon-readable tenant_customers registry).
    const { getServiceClient } = await import('@/lib/supabase/service');
    const supabase = getServiceClient();
    await supabase
      .from('tenant_xero_tokens')
      .upsert({ tenant_slug: 'happy-tails', tokens, updated_at: new Date().toISOString() });

    return NextResponse.redirect(new URL('/customers/happy-tails/keeper/invoicing', req.url));
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

/** Report the scopes this pilot requests, without exposing secrets. */
export function scopes() {
  return XERO_SCOPES;
}
