import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { SetPasswordForm } from './set-password-form';

export const metadata: Metadata = {
  title: 'Security',
  description: 'Set a password for your assembl account.',
  robots: { index: false, follow: false },
};

// Reads the Supabase session per-request — never prerender.
export const dynamic = 'force-dynamic';

export default async function AccountSecurityPage() {
  const envConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );

  if (!envConfigured) {
    redirect('/login?redirect=/account/security');
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/account/security');
  }

  return (
    <main className="relative flex min-h-[70vh] items-center justify-center bg-[color:var(--assembl-paper)] px-6 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(255,212,42, 0.10) 0%, transparent 60%)',
        }}
      />
      <div className="w-full max-w-md">
        <div className="glass-card p-8 sm:p-10">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[color:var(--dash-gold,#C79B1F)]">
              Account · Security
            </p>
            <h1
              className="mt-4 font-display leading-[0.95] tracking-tight text-[color:var(--text-primary)]"
              style={{ fontWeight: 500, fontSize: 'clamp(2rem, 5vw, 2.75rem)' }}
            >
              Set a password.
            </h1>
            <p className="mt-3 text-base leading-relaxed text-[color:var(--text-body)]">
              Add a password and you can sign in instantly with your email — no waiting for a magic
              link. The magic link still works whenever you prefer it.
            </p>
            <p className="mt-3 text-sm text-[color:var(--text-secondary)]">
              Signed in as{' '}
              <span className="font-mono text-[color:var(--text-primary)]">{user.email}</span>
            </p>
          </div>

          <div className="mt-8">
            <SetPasswordForm hasPassword={false} />
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-[color:var(--text-secondary)]">
          <Link
            href="/app"
            className="font-medium text-[color:var(--text-primary)] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--dash-canary,#FFD42A)] focus-visible:ring-offset-2"
          >
            ← Back to your dashboard
          </Link>
        </p>
      </div>
    </main>
  );
}
