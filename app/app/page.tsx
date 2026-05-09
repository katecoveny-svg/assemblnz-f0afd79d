import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Admin',
  description: 'assembl admin landing.',
  robots: { index: false, follow: false },
};

// Reads the Supabase session per-request — never prerender.
export const dynamic = 'force-dynamic';

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
          You&apos;re signed in. This admin landing is a minimal stub — Mana
          Receipts, audit log views, and operator tools land here in
          subsequent PRs.
        </p>

        <div className="mt-10 flex flex-col items-start gap-3 sm:flex-row">
          <Link
            href="/dashboard/vessel-studio"
            className="cta-primary inline-flex h-12 items-center px-7 text-sm md:text-base"
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
