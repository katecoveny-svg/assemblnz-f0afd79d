import type { Metadata } from 'next';
import Link from 'next/link';
import { LoginForm } from './login-form';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to assembl admin.',
  robots: { index: false, follow: false },
};

// Keeps the auth form per-request; protected app routes handle redirects.
export const dynamic = 'force-dynamic';

type SearchParams = { redirect?: string; sent?: string; error?: string };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const redirectTo = typeof sp.redirect === 'string' ? sp.redirect : '/app';

  const envConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );

  return (
    <main className="relative flex min-h-[calc(100vh-72px)] items-center justify-center bg-[color:var(--assembl-paper)] px-6 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(58,56,50, 0.08) 0%, transparent 60%)',
        }}
      />
      <div className="w-full max-w-md">
        <div className="glass-card p-8 sm:p-10">
          <div className="text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[color:var(--dash-gold,#C79B1F)]">
              Welcome back
            </p>
            <h1
              className="mt-4 font-display leading-[0.95] tracking-tight text-[color:var(--text-primary)]"
              style={{ fontWeight: 500, fontSize: 'clamp(2.25rem, 5vw, 3rem)' }}
            >
              Sign in.
            </h1>
            <p className="mx-auto mt-3 max-w-xs text-base leading-relaxed text-[color:var(--text-body)]">
              A magic link, or your password. Whichever is quicker for you.
            </p>
          </div>

          <div className="mt-8">
            {!envConfigured ? (
              <div className="rounded-[14px] border border-[rgba(172,88,56,0.30)] bg-[rgba(172,88,56,0.06)] p-5">
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--assembl-clay)]">
                  Configuration missing
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[color:var(--text-body)]">
                  <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
                  <code className="font-mono">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> are not set. Set
                  them in the Vercel project env (and <code className="font-mono">.env.local</code>{' '}
                  for local dev) — see <code className="font-mono">.env.local.example</code>.
                </p>
              </div>
            ) : (
              <LoginForm
                redirectTo={redirectTo}
                sent={sp.sent === '1'}
                errorMsg={typeof sp.error === 'string' ? sp.error : null}
              />
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-[color:var(--text-secondary)]">
          New here?{' '}
          <Link
            href="/pilot-sprint"
            className="font-medium text-[color:var(--text-primary)] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--dash-canary,#FFD42A)] focus-visible:ring-offset-2"
          >
            Book a pilot to get an account →
          </Link>
        </p>
      </div>
    </main>
  );
}
