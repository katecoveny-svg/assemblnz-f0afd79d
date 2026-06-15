import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, MessageCircle } from 'lucide-react';
import catalog from '@/public/agents-catalog.json';

export const metadata: Metadata = {
  title: 'Pick your crew — assembl agents',
  description:
    'Browse the assembl fleet grouped by kete and open any live specialist in its kete chat. Every reply stays a draft for human review.',
  openGraph: {
    title: 'Pick your crew — assembl agents',
    description: 'Browse the fleet by kete and open a live specialist in its kete chat.',
  },
};

type CatalogAgent = (typeof catalog)['ketes'][number]['agents'][number];
type CatalogKete = (typeof catalog)['ketes'][number];

// Industry kete first, then the whānau kete (Tōro), each in catalog order.
function orderedKetes(): CatalogKete[] {
  const industry = catalog.ketes.filter((kete) => kete.type === 'industry');
  const whanau = catalog.ketes.filter((kete) => kete.type !== 'industry');
  return [...industry, ...whanau];
}

export default function PickYourCrewPage() {
  const ketes = orderedKetes();

  return (
    <main className="min-h-screen bg-[color:var(--assembl-paper)] px-5 py-12 text-[color:var(--text-primary)] md:px-10 md:py-16">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/agents"
          className="inline-flex items-center gap-2 rounded-sm font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)] transition hover:text-[color:var(--assembl-pounamu)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          All agents
        </Link>

        <header className="mt-8 max-w-3xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[color:var(--assembl-pounamu)]">
            Pick your crew
          </p>
          <h1 className="mt-4 font-display text-[clamp(3rem,7vw,6rem)] font-light leading-[0.9]">
            Choose a specialist. Open its kete chat.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-[color:var(--text-body)]">
            The fleet, grouped by kete. {catalog.liveAgents} live specialists across{' '}
            {catalog.totalKete} kete. Open any one in its kete chat — every reply is a
            draft, held for a named person to review.
          </p>
        </header>

        <div className="mt-12 space-y-14">
          {ketes.map((kete) => (
            <section key={kete.slug} aria-labelledby={`kete-${kete.slug}`}>
              <div
                className="flex flex-wrap items-baseline justify-between gap-3 border-b pb-3"
                style={{ borderColor: `${kete.accent}33` }}
              >
                <div className="flex items-baseline gap-3">
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ backgroundColor: kete.accent }}
                    aria-hidden
                  />
                  <h2 id={`kete-${kete.slug}`} className="font-display text-3xl font-light">
                    {kete.name}
                  </h2>
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
                    {kete.industry}
                  </span>
                </div>
                <Link
                  href={`/c/${kete.slug}`}
                  className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] transition hover:opacity-80"
                  style={{ color: kete.accent }}
                >
                  Open {kete.name} chat
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {kete.agents.map((agent) => (
                  <AgentCard key={agent.slug} agent={agent} accent={kete.accent} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}

function AgentCard({ agent, accent }: { agent: CatalogAgent; accent: string }) {
  const cardStyle = { '--agent-accent': accent } as CSSProperties;

  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-display text-xl font-light">{agent.name}</h3>
        {agent.status === 'live' ? (
          <span className="rounded-full border border-[rgba(43,107,87,0.24)] bg-[#E8EFE9] px-2.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.14em] text-[#2B6B57]">
            live
          </span>
        ) : (
          <span className="rounded-full border border-[rgba(35,33,31,0.14)] px-2.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.14em] text-[color:var(--text-secondary)]">
            draft
          </span>
        )}
      </div>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--text-secondary)]">
        {agent.role}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-body)]">{agent.oneLiner}</p>
      {agent.status === 'live' && agent.chatHref ? (
        <span className="mt-4 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--agent-accent)]">
          <MessageCircle className="h-3.5 w-3.5" aria-hidden />
          Open chat
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </span>
      ) : (
        <span className="mt-4 inline-flex items-center font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--text-secondary)]">
          Coming soon
        </span>
      )}
    </>
  );

  const baseClass =
    'block rounded-[12px] border border-[rgba(35,33,31,0.1)] bg-white/62 p-5 shadow-[0_14px_44px_rgba(35,33,31,0.05)]';

  if (agent.status === 'live' && agent.chatHref) {
    return (
      <Link
        href={agent.chatHref}
        style={cardStyle}
        className={`${baseClass} transition duration-300 hover:-translate-y-1 hover:border-[color:var(--agent-accent)] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--agent-accent)] focus-visible:ring-offset-2`}
      >
        {body}
      </Link>
    );
  }

  return (
    <div style={cardStyle} className={`${baseClass} opacity-75`}>
      {body}
    </div>
  );
}
