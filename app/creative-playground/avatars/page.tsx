import type { Metadata } from 'next';
import Link from 'next/link';
import { AgentAvatar } from '@/components/agents/AgentAvatar';
import { PUBLIC_MARKETPLACE_AGENTS } from '@/lib/marketplace/agents';
import '../creative-playground.css';

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
    <main className="cp-root min-h-screen">
      <header className="mx-auto max-w-[1180px] px-5 pt-8 md:px-10 md:pt-14">
        <p className="cp-kicker">
          assembl <span className="cp-dot">·</span> studios · agent avatars
        </p>
        <h1 className="cp-h1" style={{ fontSize: 'clamp(2rem, 4.8vw, 3.6rem)' }}>
          one avatar per agent.
        </h1>
        <p className="cp-lede">
          Every current marketplace slug hashes to a stable chrome shape and palette, so the
          same agent always renders the same avatar. Curated overrides for the flagship agents;
          everything else auto-derives. Reads the live roster from{' '}
          <code className="rounded px-1 py-0.5" style={{ background: 'rgba(145,106,112,0.22)' }}>
            lib/marketplace/agents.ts
          </code>{' '}
          — new agents show up here on the next build.
        </p>
        <p className="mt-3 cp-kicker" style={{ letterSpacing: '0.16em' }}>
          <Link href="/creative-playground" className="cp-link">
            ← back to the playground
          </Link>
        </p>
      </header>

      {/* Hero — the assembl agent itself */}
      <section className="mx-auto max-w-[1180px] px-5 pt-10 md:px-10">
        <div
          className="p-6"
          style={{
            borderRadius: 14,
            border: '1px solid rgba(245,241,242,0.14)',
            background: 'rgba(36,11,33,0.55)',
          }}
        >
          <div className="flex flex-wrap items-center gap-6">
            <AgentAvatar slug={HERO.slug} size={144} />
            <div className="flex flex-col gap-1">
              <div className="cp-kicker" style={{ letterSpacing: '0.2em' }}>
                homepage · build-an-agent · meta
              </div>
              <div
                className="lowercase leading-none"
                style={{
                  fontFamily: "var(--font-display), 'Instrument Sans', system-ui, sans-serif",
                  fontWeight: 500,
                  fontSize: 26,
                  color: 'var(--cp-ink)',
                }}
              >
                {HERO.name}.
              </div>
              <div className="mt-1 cp-kicker" style={{ letterSpacing: '0.06em', textTransform: 'none' }}>
                one primitive, shared across every surface
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-5 pb-16 pt-10 md:px-10 md:pb-24">
        <div className="mb-4 cp-kicker" style={{ letterSpacing: '0.22em' }}>
          current marketplace · {AGENTS.length} agents
        </div>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {AGENTS.map((agent) => (
            <div key={agent.slug} className="flex flex-col items-center gap-3">
              <AgentAvatar slug={agent.slug} size={112} />
              <div className="text-center">
                <div className="cp-kicker" style={{ letterSpacing: '0.18em', color: 'var(--cp-ink)' }}>
                  {agent.slug}
                </div>
                <div
                  className="mt-0.5"
                  style={{
                    fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
                    fontSize: 12,
                    letterSpacing: '0.04em',
                    color: 'rgba(245,241,242,0.7)',
                  }}
                >
                  {agent.name}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="cp-foot mx-auto max-w-[1180px] px-5 pb-10 md:px-10">
        <div className="pt-6">
          drop &lt;AgentAvatar slug=&quot;pai&quot; size={96} /&gt; anywhere; no props beyond slug required
        </div>
      </footer>
    </main>
  );
}
