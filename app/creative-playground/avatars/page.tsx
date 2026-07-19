import type { Metadata } from 'next';
import Link from 'next/link';
import { AgentAvatar } from '@/components/agents/AgentAvatar';

export const metadata: Metadata = {
  title: 'agent avatars — assembl',
  description:
    'Deterministic 3D avatars for every assembl agent. Slug-hashed to a stable shape and palette so the same agent always looks the same.',
};

// A representative cross-section — anything else hashes to a sensible default.
const AGENT_SLUGS = [
  'keeper', 'kaiako', 'pai', 'arai', 'ata', 'atlas', 'aroha', 'rawa',
  'kaupapa', 'whakaee', 'dash', 'auaha', 'echo', 'hui', 'aria', 'pack',
  'franklin', 'aironaut', 'mana', 'toro',
  // A few slugs with no curated override — pure hash-derived look:
  'pikau', 'waihanga', 'manaaki', 'matauranga', 'hoko', 'ako',
];

export default function AgentAvatarsPage() {
  return (
    <main className="min-h-screen bg-[color:var(--assembl-paper)] text-[color:var(--text-primary)]">
      <header className="mx-auto max-w-[1180px] px-5 pt-8 md:px-10 md:pt-14">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">
          assembl <span className="mx-1.5 text-[color:var(--assembl-gold-thread)]">·</span> studios · agent avatars
        </p>
        <h1 className="mt-4 font-display text-[42px] font-light lowercase leading-[0.95] tracking-[-0.005em] md:text-[64px]">
          one avatar per agent.
        </h1>
        <p className="mt-4 max-w-[560px] text-[15px] leading-[1.55] text-[color:var(--text-secondary)] md:text-[17px]">
          Every agent slug hashes to a stable chrome shape and palette, so the
          same agent always renders the same avatar. Curated overrides for
          the flagship agents; everything else auto-derives.
        </p>
        <p className="mt-3 max-w-[560px] font-mono text-[10.5px] uppercase tracking-[0.16em] text-[color:var(--text-secondary)]">
          <Link href="/creative-playground" className="underline decoration-[color:var(--assembl-cloud)] underline-offset-4 hover:decoration-[color:var(--text-primary)]">
            ← back to the playground
          </Link>
        </p>
      </header>

      <section className="mx-auto max-w-[1180px] px-5 pb-16 pt-10 md:px-10 md:pb-24">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {AGENT_SLUGS.map((slug) => (
            <div key={slug} className="flex flex-col items-center gap-3">
              <AgentAvatar slug={slug} size={128} />
              <div className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-[color:var(--text-primary)]">
                {slug}
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="mx-auto max-w-[1180px] px-5 pb-10 text-[10.5px] font-mono uppercase tracking-[0.2em] text-[color:var(--text-secondary)] md:px-10">
        <div className="border-t border-[color:var(--assembl-cloud)] pt-6">
          drop &lt;AgentAvatar slug=&quot;pai&quot; size={96} /&gt; anywhere; no props beyond slug required
        </div>
      </footer>
    </main>
  );
}
