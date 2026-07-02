import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase/service';
import { PWA_TENANTS } from '@/lib/pwa/tenants';

/**
 * Store a web-push subscription for a pilot workspace PWA.
 *
 * POST { tenantSlug, subscription: PushSubscriptionJSON, userLabel? }
 *
 * Service-role upsert keyed on the endpoint (RLS allows no client writes).
 * Tenant slugs are allowlisted to the PWA-enabled pilots, so this can't be
 * used to stuff arbitrary rows. Nothing sensitive is stored — endpoint +
 * encryption keys only, exactly what the push service hands the browser.
 */

export async function POST(req: Request) {
  let parsed: {
    tenantSlug?: string;
    userLabel?: string;
    subscription?: { endpoint?: string; keys?: { p256dh?: string; auth?: string } };
  };
  try {
    parsed = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid JSON' }, { status: 400 });
  }

  const tenantSlug = String(parsed.tenantSlug ?? '');
  if (!PWA_TENANTS[tenantSlug]) {
    return NextResponse.json({ error: 'unknown tenant' }, { status: 400 });
  }

  const sub = parsed.subscription;
  const endpoint = sub?.endpoint;
  const p256dh = sub?.keys?.p256dh;
  const auth = sub?.keys?.auth;
  if (!endpoint || !p256dh || !auth || !endpoint.startsWith('https://')) {
    return NextResponse.json({ error: 'invalid subscription' }, { status: 400 });
  }

  const userLabel = parsed.userLabel ? String(parsed.userLabel).slice(0, 120) : null;

  try {
    const supabase = getServiceClient();
    const { error } = await supabase
      .from('pwa_push_subscriptions')
      .upsert(
        { tenant_slug: tenantSlug, endpoint, p256dh, auth, user_label: userLabel },
        { onConflict: 'endpoint' },
      );
    if (error) {
      return NextResponse.json({ error: 'store failed' }, { status: 500 });
    }
  } catch {
    // Service creds not configured (local dev) — acknowledge without storing
    // so the UI flow can still be exercised.
    return NextResponse.json({ ok: true, stored: false });
  }

  return NextResponse.json({ ok: true, stored: true });
}
