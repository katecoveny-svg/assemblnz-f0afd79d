/**
 * GET /api/family/inbox/callback/[provider]   provider ∈ { gmail, outlook }
 *
 * Step 2 of "Connect your inbox". The provider redirects here after Kate
 * authorises. We exchange the `code` for tokens, then store ONLY the refresh
 * token (+ the connected email, for display/audit) into public.family_inbox_tokens
 * via the service client, keyed by (hub, provider). family-inbox-sync reads that
 * row and mints access tokens per run.
 *
 * Fail-soft: every error path bounces back to the ops console with a ?connect=…
 * note rather than showing a stack trace. We NEVER log the tokens.
 *
 * Draft-only posture is unchanged — read-only mail scope, nothing is ever sent.
 */
import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const OPS_PATH = '/customers/family/ops';

function originOf(req: Request): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL || process.env.APP_URL;
  if (configured) return configured.replace(/\/$/, '');
  return new URL(req.url).origin;
}

export async function GET(req: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  const origin = originOf(req);
  const opsUrl = `${origin}${OPS_PATH}`;
  const url = new URL(req.url);

  if (provider !== 'gmail' && provider !== 'outlook') {
    return NextResponse.redirect(`${opsUrl}?connect=unknown-provider`);
  }

  // The user denied consent or the provider returned an error.
  const oauthError = url.searchParams.get('error');
  if (oauthError) {
    return NextResponse.redirect(`${opsUrl}?connect=denied&provider=${provider}`);
  }

  const code = url.searchParams.get('code');
  const hub = url.searchParams.get('state') || 'demo';
  if (!code) {
    return NextResponse.redirect(`${opsUrl}?connect=no-code&provider=${provider}`);
  }

  const redirectUri = `${origin}/api/family/inbox/callback/${provider}`;

  const clientId =
    provider === 'gmail'
      ? process.env.GMAIL_OAUTH_CLIENT_ID || process.env.GOOGLE_OAUTH_CLIENT_ID || process.env.GOOGLE_CLIENT_ID
      : process.env.MS_OAUTH_CLIENT_ID;
  const clientSecret =
    provider === 'gmail'
      ? process.env.GMAIL_OAUTH_CLIENT_SECRET || process.env.GOOGLE_OAUTH_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET
      : process.env.MS_OAUTH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${opsUrl}?connect=needs-setup&provider=${provider}`);
  }

  // ── Exchange the code for tokens ──────────────────────────────────────────
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
    // Microsoft wants the scope echoed on the token request.
    if (provider === 'outlook') {
      body.scope = 'https://graph.microsoft.com/Mail.Read offline_access';
    }

    const resp = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(body).toString(),
    });

    if (!resp.ok) {
      // Never log the response body — it can echo the code. Status only.
      console.error(`[family-inbox connect] ${provider} token exchange failed:`, resp.status);
      return NextResponse.redirect(`${opsUrl}?connect=exchange-failed&provider=${provider}`);
    }

    const tokens = await resp.json();
    refreshToken = tokens.refresh_token ?? null;
    accessToken = tokens.access_token ?? null;
  } catch {
    // Do not surface the exception (may carry request detail). Fail soft.
    console.error(`[family-inbox connect] ${provider} token exchange exception`);
    return NextResponse.redirect(`${opsUrl}?connect=exchange-error&provider=${provider}`);
  }

  if (!refreshToken) {
    // Google only returns a refresh token when prompt=consent + access_type=offline
    // (and only the first time unless re-consented). We force those, so this
    // usually means a re-auth without consent — ask them to try once more.
    return NextResponse.redirect(`${opsUrl}?connect=no-refresh-token&provider=${provider}`);
  }

  // ── Best-effort: capture the mailbox address for display/audit (not a token) ─
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
    // email is cosmetic — ignore failures.
  }

  // ── Store ONLY the refresh token (service-role; RLS bypass) ───────────────
  try {
    const sb = getServiceClient();
    const { error } = await sb.from('family_inbox_tokens').upsert(
      {
        hub,
        provider,
        refresh_token: refreshToken,
        email,
        connected_at: new Date().toISOString(),
      },
      { onConflict: 'hub,provider' },
    );
    if (error) {
      console.error(`[family-inbox connect] ${provider} token store failed:`, error.message);
      return NextResponse.redirect(`${opsUrl}?connect=store-failed&provider=${provider}`);
    }
  } catch (e) {
    console.error(`[family-inbox connect] ${provider} token store exception:`, (e as Error).message);
    return NextResponse.redirect(`${opsUrl}?connect=store-error&provider=${provider}`);
  }

  return NextResponse.redirect(`${opsUrl}?connected=${provider}`);
}
