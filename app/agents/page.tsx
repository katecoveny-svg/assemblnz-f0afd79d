import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, MessageCircle, Radio, ShieldCheck } from 'lucide-react';
import { KETES, type Kete, type KeteSlug } from '@/lib/kete';
import { agentsForKete, groupedAgentsByPhase } from '@/lib/agents';
import { CHAT_KETES, type ChatAgent } from '@/lib/chat/registry';

export const metadata: Metadata = {
  title: 'Agents',
  description:
    'See which assembl agents are live, which kete they belong to, and where to talk to one.',
};

const KETE_STAGE: Record<KeteSlug, string> = {
  waihanga: 'Live',
  manaaki: 'Pilot',
  pikau: 'Live',
  arataki: 'Pilot',
  auaha: 'Pilot',
  ako: 'Pilot',
  matauranga: 'Greenfield / pilot',
  hoko: 'Mothballed',
  toro: 'Live',
};

const KETE_SUMMARY: Record<KeteSlug, string> = {
  waihanga: 'Construction consent, safety, quality, BIM, materials, and handover work.',
  manaaki: 'Food safety, liquor licensing, guest operations, and shift evidence.',
  pikau: 'Customs entries, HS classification, broker records, and freight documents.',
  arataki: 'Workshop, dealer, fleet, WoF, CoF, CGA, and IPP 3A workflows.',
  auaha: 'Campaign, brand, rights, and creative operations records.',
  ako: 'ECE licensing, Te Whāriki, ratios, kaiako, ERO, and tamariki safety.',
  matauranga: 'Secondary-school operator workflows: NCEA, reporting, and board prep.',
  hoko: 'Retail and consumer-protection workflows; held until the kete reopens.',
  toro: 'Whānau navigator: Term Planner, Kid Money, Holiday Ideas, and parent approval.',
};

export default function AgentsPage() {
  const chatByKete = new Map(CHAT_KETES.map((kete) => [kete.slug, kete.agents]));
  const crossPack = CHAT_KETES.find((kete) => kete.slug === 'cross-pack');

  return (
    <main className="min-h-screen bg-[color:var(--assembl-paper)] text-[color:var(--text-primary)]">
      <section className="border-b border-[rgba(35,33,31,0.08)] bg-[linear-gradient(180deg,#FAF7F2_0%,#F1ECE4_100%)] px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[minmax(0,0.9fr)_minmax(360px,0.55fr)]">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">
              Agents / kete / what works now
            </p>
            <h1 className="mt-5 max-w-3xl font-display text-[clamp(2.6rem,7vw,6.4rem)] font-light leading-[0.92]">
              Speak to the right specialist.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-[color:var(--text-body)] md:text-lg">
              Pick a kete, choose an agent, ask the first question. A reply is a draft,
              not a final action. Your team reviews before anything leaves.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/app/chat"
                className="cta-primary inline-flex h-12 items-center justify-center px-7 text-sm md:text-base"
              >
                Talk to an agent
                <MessageCircle className="ml-2 h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/app/admin"
                className="btn-ghost inline-flex h-12 items-center justify-center px-7 text-sm md:text-base"
              >
                Open admin
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>

          <aside className="rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-white/60 p-5 shadow-[0_12px_40px_rgba(35,33,31,0.08)]">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[color:var(--text-secondary)]">
              Current product truth
            </p>
            <div className="mt-5 grid gap-3">
              <TruthRow icon={MessageCircle} title="Chat is live" body="/app/chat routes through Iho to selected specialists." />
              <TruthRow icon={ShieldCheck} title="Evidence is the product" body="Outputs are drafts until reviewed and recorded." />
              <TruthRow icon={Radio} title="Admin shows the system" body="Agent status, drafts, routing logs, and evidence metrics live behind sign-in." />
            </div>
          </aside>
        </div>
      </section>

      <section className="px-6 py-10 md:px-10 md:py-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[color:var(--text-secondary)]">
                Kete catalogue
              </p>
              <h2 className="mt-2 font-display text-4xl font-light leading-none">
                Nine entry points.
              </h2>
            </div>
            <Link
              href="/kete"
              className="inline-flex items-center font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--assembl-pounamu)]"
            >
              See kete pages
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Link>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {KETES.map((kete) => (
              <KeteAgentCard
                key={kete.slug}
                kete={kete}
                chatAgents={chatByKete.get(kete.slug) ?? []}
              />
            ))}
          </div>
        </div>
      </section>

      {crossPack ? (
        <section className="border-t border-[rgba(35,33,31,0.08)] bg-[color:var(--assembl-cloud)] px-6 py-10 md:px-10 md:py-14">
          <div className="mx-auto max-w-7xl">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[color:var(--text-secondary)]">
              Cross-pack specialists
            </p>
            <h2 className="mt-2 font-display text-4xl font-light leading-none">
              Useful when you do not know where to start.
            </h2>
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {crossPack.agents.map((agent) => (
                <AgentChatCard
                  key={agent.agentId}
                  agent={agent}
                  keteSlug={crossPack.slug}
                  accent={crossPack.accent}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}

function KeteAgentCard({
  kete,
  chatAgents,
}: {
  kete: Kete;
  chatAgents: ChatAgent[];
}) {
  const registryAgents = agentsForKete(kete.slug);
  const registryGroups = groupedAgentsByPhase(registryAgents);
  const stage = KETE_STAGE[kete.slug];
  const canChat = chatAgents.length > 0;

  return (
    <article
      className="flex min-h-[360px] flex-col rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-white/60 p-5 shadow-[0_10px_32px_rgba(35,33,31,0.06)]"
      style={{ '--kete-accent': kete.accent } as CSSProperties}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--kete-accent)]">
            {kete.industry}
          </p>
          <h3 className="mt-2 font-display text-4xl font-light leading-none">{kete.name}</h3>
        </div>
        <span className="rounded-full border border-[rgba(35,33,31,0.12)] bg-[rgba(250,247,242,0.8)] px-3 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-[color:var(--text-secondary)]">
          {stage}
        </span>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-[color:var(--text-body)]">
        {KETE_SUMMARY[kete.slug]}
      </p>

      <div className="mt-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--text-secondary)]">
          Chat-ready agents
        </p>
        {canChat ? (
          <div className="mt-3 grid gap-2">
            {chatAgents.map((agent) => (
              <AgentChatCard
                key={agent.agentId}
                agent={agent}
                keteSlug={kete.slug}
                accent={kete.accent}
                compact
              />
            ))}
          </div>
        ) : (
          <p className="mt-3 rounded-[8px] border border-dashed border-[rgba(35,33,31,0.16)] bg-[rgba(250,247,242,0.6)] p-3 text-sm leading-relaxed text-[color:var(--text-secondary)]">
            Not exposed in chat yet. Use Pilot Sprint for this kete.
          </p>
        )}
      </div>

      <div className="mt-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--text-secondary)]">
          Backend registry
        </p>
        <div className="mt-3 space-y-3">
          {registryGroups.length > 0 ? (
            registryGroups.map((group) => (
              <div key={group.phase}>
                <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.16em] text-[color:var(--text-secondary)]">
                  {group.label}
                </p>
                <div className="flex flex-wrap gap-2">
                  {group.agents.map((agent) => (
                    <span
                      key={agent.slug}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(35,33,31,0.12)] bg-[rgba(250,247,242,0.72)] px-3 py-1 text-xs text-[color:var(--text-body)]"
                    >
                      {agent.name}
                      {agent.status === 'draft' ? (
                        <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-[color:var(--assembl-gold-thread)]">
                          Draft
                        </span>
                      ) : null}
                    </span>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <span className="text-sm text-[color:var(--text-secondary)]">No public registry row yet.</span>
          )}
        </div>
      </div>

      <div className="mt-auto pt-5">
        <Link
          href={`/kete/${kete.slug}`}
          className="inline-flex items-center font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--kete-accent)]"
        >
          Open kete page
          <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
        </Link>
      </div>
    </article>
  );
}

function AgentChatCard({
  agent,
  keteSlug,
  accent,
  compact = false,
}: {
  agent: ChatAgent;
  keteSlug: string;
  accent: string;
  compact?: boolean;
}) {
  return (
    <Link
      href={`/app/chat?kete=${encodeURIComponent(keteSlug)}&agent=${encodeURIComponent(agent.agentId)}`}
      className="group flex gap-3 rounded-[8px] border border-[rgba(35,33,31,0.1)] bg-[rgba(250,247,242,0.75)] p-3 transition-colors hover:bg-white"
      style={{ '--agent-accent': accent } as CSSProperties}
    >
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--agent-accent)] text-[color:var(--assembl-paper)]">
        <MessageCircle className="h-4 w-4" aria-hidden />
      </span>
      <span>
        <span className="flex items-center gap-2">
          <span className="font-display text-xl font-light leading-none text-[color:var(--text-primary)]">
            {agent.name}
          </span>
          <CheckCircle2 className="h-3.5 w-3.5 text-[color:var(--agent-accent)]" aria-hidden />
        </span>
        <span className="mt-1 block text-xs leading-relaxed text-[color:var(--text-secondary)]">
          {agent.role}
        </span>
        {!compact && agent.blurb ? (
          <span className="mt-2 block text-sm leading-relaxed text-[color:var(--text-body)]">
            {agent.blurb}
          </span>
        ) : null}
      </span>
    </Link>
  );
}

function TruthRow({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof MessageCircle;
  title: string;
  body: string;
}) {
  return (
    <div className="flex gap-3 border-l border-[rgba(212,168,83,0.8)] pl-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--assembl-pounamu)]" aria-hidden />
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--assembl-pounamu)]">
          {title}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-[color:var(--text-secondary)]">
          {body}
        </p>
      </div>
    </div>
  );
}
