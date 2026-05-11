import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Admin',
  description: 'assembl admin landing.',
  robots: { index: false, follow: false },
};

// Reads the Supabase session per-request — never prerender.
export const dynamic = 'force-dynamic';

/**
 * /app — the post-sign-in landing page.
 *
 * Redirect logic (per chat-with-agents brief 2026-05-11):
 *   • Not signed in            → /login?redirect=/app
 *   • Signed in with a tenant  → /app/toro/[slug] (the tenant dashboard)
 *   • Signed in, no tenant     → /app/chat (so they can at least START talking)
 *
 * We never render a 404 here, and we never render the old admin stub — every
 * code path calls `redirect()` (which returns `never`) so this component has
 * no return-value branch to maintain.
 */
export default async function AdminLandingPage(): Promise<never> {
  // Middleware should already have bounced unauthenticated users back to
  // /login, but belt-and-braces — re-check on the server. If env vars are
  // missing we degrade to /login, which renders the configuration-missing
  // state explicitly.
  const envConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
  if (!envConfigured) {
    redirect('/login?redirect=/app');
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) {
    redirect('/login?redirect=/app');
  }

  // Look up the user's tenant. If they have one, send them to the tenant
  // dashboard (/app/toro/[slug]). If they don't — or if the lookup fails
  // — we send them to /app/chat so they can start talking right away.
  //
  // Try `platform_org_members` first (the canonical membership table used by
  // the iho-router edge function). Fall back gracefully if that table or
  // those columns don't exist in this environment.
  let tenantSlug: string | null = null;
  try {
    const { data: membership } = await supabase
      .from('platform_org_members')
      .select('tenant_id, tenants:tenant_id ( slug )')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle();
    // The Supabase relational shape comes back as `tenants` — try a few
    // possible shapes defensively.
    const t = membership as unknown as
      | { tenants?: { slug?: string } | { slug?: string }[] }
      | null;
    if (t?.tenants) {
      if (Array.isArray(t.tenants)) tenantSlug = t.tenants[0]?.slug ?? null;
      else tenantSlug = t.tenants.slug ?? null;
    }
  } catch {
    // ignore — fall through to chat
  }

  if (tenantSlug) {
    redirect(`/app/toro/${tenantSlug}`);
  }

  // No tenant yet — send them to the chat surface so they can talk to an
  // agent rather than land on a stub page.
  redirect('/app/chat');
}
