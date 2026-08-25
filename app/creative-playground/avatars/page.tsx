import type { Metadata } from 'next';
import Link from 'next/link';
import { AgentAvatar } from '@/components/agents/AgentAvatar';
import { PUBLIC_MARKETPLACE_AGENTS } from '@/lib/marketplace/agents';

export const metadata: Metadata = {
  title: 'agent avatars — assembl',
  description:
    'Deterministic 3D avatars for every current assembl marketplace agent. Slug-hashed to a stable shape and palette so the same agent always looks the same.',
};

// Pull the live marketplace roster — the same list the /agents grid renders.
// Anything new that lands in lib/marketplace/agents.ts shows up here on the
// next build without a code change.
const AGENTS = PUBLIC_MARKETPLACE_AGENTS
  .map((a) => ({ slug: a.slug, name: a.name }))
  .sort((a, b) => a.slug.localeCompare(b.slug));

// The "assembl" meta-agent used on the homepage + build-an-agent surfaces,
// prepended so it shows first.
const HERO = { slug: 'assembl', name: 'assembl' };

export default function AgentAvatarsPage() {
  return (
    <main className="min-h-screen bg-[color:var(--assembl-paper)] text-[color:var(--text-primary)]">
      <header className="mx-auto max-w-[1180px] px-5 pt-8 md:px-10 md:pt-14">
        <p className="font-mono text-[12px] uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">
          assembl <span className="mx-1.5 text-[color:var(--assembl-gold-thread)]">·</span> studios · agent avatars
        </p>
        <h1 className="mt-4 font-display text-[42px] font-light lowercase leading-[0.95] tracking-[-0.005em] md:text-[64px]">
          one avatar per agent.
        </h1>
        <p className="mt-4 max-w-[640px] text-[15px] leading-[1.55] text-[color:var(--text-secondary)] md:text-[17px]">
          Every current marketplace slug hashes to a stable chrome shape and
          palette, so the same agent always renders the same avatar. Curated
          overrides for the flagship agents; everything else auto-derives.
          Reads the live roster from{' '}
          <code className="rounded bg-[color:var(--assembl-cloud)]/50 px-1 py-0.5 text-[color:var(--text-primary)]">
            lib/marketplace/agents.ts
          </code>{' '}
          — new agents show up here on the next build.
        </p>
        <p className="mt-3 font-mono text-[12px] uppercase tracking-[0.16em] text-[color:var(--text-secondary)]">
          <Link href="/creative-playground" className="underline decoration-[color:var(--assembl-cloud)] underline-offset-4 hover:decoration-[color:var(--text-primary)]">
            ← back to the playground
          </Link>
        </p>
      </header>

      {/* Hero — the assembl agent itself */}
      <section className="mx-auto max-w-[1180px] px-5 pt-10 md:px-10">
        <div className="rounded-[3px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] p-6">
          <div className="flex flex-wrap items-center gap-6">
            <AgentAvatar slug={HERO.slug} size={144} />
            <div className="flex flex-col gap-1">
              <div className="font-mono text-[12px] uppercase tracking-[0.2em] text-[color:var(--text-secondary)]">
                homepage · build-an-agent · meta
              </div>
              <div className="font-display text-[26px] font-light lowercase leading-none text-[color:var(--text-primary)]">
                {HERO.name}.
              </div>
              <div className="mt-1 font-mono text-[12px] tracking-[0.06em] text-[color:var(--text-secondary)]">
                one primitive, shared across every surface
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-5 pb-16 pt-10 md:px-10 md:pb-24">
        <div className="mb-4 font-mono text-[12px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
          current marketplace · {AGENTS.length} agents
        </div>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {AGENTS.map((agent) => (
            <div key={agent.slug} className="flex flex-col items-center gap-3">
              <AgentAvatar slug={agent.slug} size={112} />
              <div className="text-center">
                <div className="font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--text-primary)]">
                  {agent.slug}
                </div>
                <div className="mt-0.5 font-mono text-[12px] tracking-[0.04em] text-[color:var(--text-secondary)]">
                  {agent.name}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="mx-auto max-w-[1180px] px-5 pb-10 text-[12px] font-mono uppercase tracking-[0.2em] text-[color:var(--text-secondary)] md:px-10">
        <div className="border-t border-[color:var(--assembl-cloud)] pt-6">
          drop &lt;AgentAvatar slug=&quot;pai&quot; size={96} /&gt; anywhere; no props beyond slug required
        </div>
      </footer>
    </main>
  );
}
