import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { LoginForm } from './login-form';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to assembl admin.',
  robots: { index: false, follow: false },
};

// Reads the Supabase session per-request — never prerender.
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

  // If the user already has a session, send them straight through.
  if (envConfigured) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      redirect(redirectTo);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-[color:var(--assembl-paper)] px-6 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(43, 107, 87, 0.08) 0%, transparent 60%)',
        }}
      />
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
            assembl · admin
          </p>
          <h1
            className="mt-4 font-display leading-[0.95] tracking-tight text-[color:var(--text-primary)]"
            style={{ fontWeight: 300, fontSize: 'clamp(2rem, 5vw, 3rem)' }}
          >
            Sign in.
          </h1>
          <p className="mt-3 text-sm text-[color:var(--text-body)]">
            We send a magic link to your inbox. No passwords.
          </p>
        </div>

        {!envConfigured ? (
          <div className="rounded-card border border-[rgba(35,33,31,0.10)] bg-white/55 p-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
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
    </main>
  );
}
