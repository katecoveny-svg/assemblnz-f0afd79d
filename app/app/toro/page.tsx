import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { resolveTenantSlugForUser } from '@/lib/toro/resolve-tenant';

export const dynamic = 'force-dynamic';

export default async function ToroStartPage() {
  const envConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
  if (!envConfigured) {
    return <ToroSignedOutStart reason="Configuration is not available in this environment." />;
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return <ToroSignedOutStart />;
  }

  const slug = await resolveTenantSlugForUser(supabase, userData.user.id);
  if (!slug) {
    redirect('/app/chat');
  }

  redirect(`/app/toro/${slug}`);
}

function ToroSignedOutStart({ reason }: { reason?: string }) {
  return (
    <main className="flex min-h-screen items-center bg-[color:var(--assembl-paper)] px-6 py-16">
      <section className="mx-auto grid w-full max-w-5xl gap-10 md:grid-cols-[1fr_0.85fr] md:items-center">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[color:var(--assembl-gold-thread)]">
            Tōro
          </p>
          <h1
            className="mt-4 font-display leading-[0.98] text-[color:var(--text-primary)]"
            style={{ fontWeight: 300, fontSize: 'clamp(3rem, 8vw, 5.6rem)' }}
          >
            your family&apos;s quiet assistant
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-[color:var(--text-body)]">
            Read notices, prepare drafts, remember routines, and keep the receipts.
            Sign in to open your whānau workspace.
          </p>
          {reason ? (
            <p className="mt-4 max-w-xl rounded-[4px] border border-[color:var(--assembl-cloud)] bg-white px-4 py-3 text-sm text-[color:var(--text-secondary)]">
              {reason}
            </p>
          ) : null}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/login?redirect=/app/toro"
              className="cta-primary inline-flex h-12 items-center px-7 text-sm"
            >
              Sign in to Tōro
            </Link>
            <Link
              href="/app/chat?kete=toro&agent=TORO"
              className="btn-ghost inline-flex h-12 items-center px-7 text-sm"
            >
              Talk to Tōro
            </Link>
          </div>
        </div>
        <div className="rounded-[6px] border border-[color:var(--assembl-cloud)] bg-white p-6">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
            installed app
          </p>
          <ul className="mt-5 space-y-3 text-sm leading-relaxed text-[color:var(--text-body)]">
            <li>Opens directly to your Tōro workspace.</li>
            <li>Runs as a standalone app from the home screen.</li>
            <li>Keeps the app shell scoped to Tōro only.</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
