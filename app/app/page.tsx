import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowRight, MessageCircle } from 'lucide-react';
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
 * We never render a 404 here. The fallback admin stub below is only shown
 * when both the tenant lookup AND the chat redirect fail (env edge case).
 */
export default async function AdminLandingPage() {
  // Middleware should already have bounced unauthenticated users back to
  // /login, but belt-and-braces — re-check on the server. If env vars are
  // missing we degrade to /login, which renders the configuration-missing
  // state explicitly.
  const envConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
  if (!envConfigured) {
    redirect('/login?redirect=/app');
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
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
      .eq('user_id', data.user.id)
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

  // eslint-disable-next-line @typescript-eslint/no-unreachable-code-after-redirect
  return (
    <main className="min-h-screen bg-[color:var(--assembl-paper)] px-6 py-16 md:py-24">
      <div className="mx-auto max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
          assembl · admin
        </p>
        <h1
          className="mt-4 font-display leading-[0.95] tracking-tight text-[color:var(--text-primary)]"
          style={{ fontWeight: 300, fontSize: 'clamp(2.4rem, 6vw, 4rem)' }}
        >
          Tēnā koe,{' '}
          <em className="not-italic text-gradient-hero">{data.user.email}</em>.
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-[color:var(--text-body)]">
          You&apos;re signed in.
        </p>

        <div className="mt-10 flex flex-col items-start gap-3 sm:flex-row">
          <Link
            href="/app/chat"
            className="cta-primary inline-flex h-12 items-center px-7 text-sm md:text-base"
          >
            Talk to an agent
            <MessageCircle className="ml-2 h-4 w-4" aria-hidden />
          </Link>
          <Link
            href="/dashboard/vessel-studio"
            className="btn-ghost inline-flex h-12 items-center px-7 text-sm md:text-base"
          >
            Open vessel studio
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
          </Link>
          <form action="/auth/sign-out" method="post">
            <button
              type="submit"
              className="btn-ghost inline-flex h-12 items-center px-7 text-sm md:text-base"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
