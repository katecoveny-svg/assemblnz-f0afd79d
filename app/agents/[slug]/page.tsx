import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, CheckCircle2, MessageCircle, ShieldCheck } from 'lucide-react';
import { agentBySlug, AGENTS, CAPABILITY_LABELS, PHASE_LABELS } from '@/lib/agents';
import { getKete } from '@/lib/kete';

export function generateStaticParams() {
  return AGENTS.map((agent) => ({ slug: agent.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const agent = agentBySlug(slug);
  if (!agent) return {};
  const kete = getKete(agent.kete);

  return {
    title: `${agent.name} — ${kete.name} agent`,
    description: agent.oneLiner,
  };
}

export default async function AgentDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const agent = agentBySlug(slug);
  if (!agent) notFound();

  const kete = getKete(agent.kete);
  const phase = agent.phase ? PHASE_LABELS[agent.phase] : 'Specialist';

  return (
    <main className="min-h-screen bg-[color:var(--assembl-paper)] text-[color:var(--text-primary)]">
      <section className="border-b border-[rgba(35,33,31,0.10)] px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.78fr] lg:items-end">
          <div>
            <Link
              href={`/kete/${kete.slug}`}
              className="font-mono text-[11px] uppercase tracking-[0.24em] text-[color:var(--text-secondary)] transition hover:text-[color:var(--text-primary)]"
            >
              {kete.name} · {kete.industry}
            </Link>
            <h1 className="mt-5 font-display text-[clamp(4rem,10vw,8rem)] font-light leading-[0.85]">
              {agent.name}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[color:var(--text-body)] md:text-xl">
              {agent.oneLiner}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={`/app/chat?agent=${agent.slug}`} className="cta-primary inline-flex h-12 items-center gap-2 px-6">
                Demo in chat <MessageCircle className="h-4 w-4" aria-hidden />
              </Link>
              <Link href="/pilot-sprint" className="btn-ghost inline-flex h-12 items-center gap-2 px-6">
                Use in a pilot <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>

          <aside className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/65 p-5 shadow-[0_18px_56px_rgba(35,33,31,0.08)]">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
              Demo status
            </p>
            <div className="mt-5 grid gap-3">
              <StatusRow title="Public page" body="Live. This route now resolves to a real agent page." />
              <StatusRow title="Chat handoff" body="Available after sign-in through the assembl chat surface." />
              <StatusRow title="Human review" body="All outputs are positioned as drafts for named reviewer sign-off." />
            </div>
          </aside>
        </div>
      </section>

      <section className="px-6 py-10 md:px-10 md:py-14">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-3">
          <Panel title="Role" body={agent.role} />
          <Panel title="Phase" body={phase} />
          <Panel title="Status" body={agent.status ?? 'live'} />
        </div>

        <div className="mx-auto mt-8 grid max-w-7xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/55 p-6">
            <h2 className="font-display text-4xl font-light">What this specialist does.</h2>
            <p className="mt-5 text-base leading-relaxed text-[color:var(--text-body)]">
              {agent.expertise ?? agent.oneLiner}
            </p>
            {agent.ambientBrief ? (
              <p className="mt-5 rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-[color:var(--assembl-paper)] p-4 text-sm leading-relaxed text-[color:var(--text-body)]">
                {agent.ambientBrief}
              </p>
            ) : null}
          </section>

          <section className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/55 p-6">
            <h2 className="font-display text-4xl font-light">Proof inputs.</h2>
            <div className="mt-5 space-y-5">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--text-secondary)]">
                  Legislation / standards
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {agent.legislation.map((law) => (
                    <span key={law} className="rounded-full border border-[rgba(35,33,31,0.12)] bg-white/70 px-3 py-1 text-xs">
                      § {law}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--text-secondary)]">
                  Capabilities
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {agent.capabilities.map((capability) => (
                    <span key={capability} className="rounded-full bg-[color:var(--assembl-pounamu-paper)] px-3 py-1 text-xs text-[color:var(--assembl-pounamu)]">
                      {CAPABILITY_LABELS[capability]}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function Panel({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/55 p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--text-secondary)]">{title}</p>
      <p className="mt-3 font-display text-3xl font-light capitalize">{body}</p>
    </div>
  );
}

function StatusRow({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex gap-3 rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-[color:var(--assembl-paper)] p-3">
      {title === 'Human review' ? (
        <ShieldCheck className="mt-0.5 h-4 w-4 text-[color:var(--assembl-pounamu)]" aria-hidden />
      ) : (
        <CheckCircle2 className="mt-0.5 h-4 w-4 text-[color:var(--assembl-pounamu)]" aria-hidden />
      )}
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-1 text-xs leading-relaxed text-[color:var(--text-secondary)]">{body}</p>
      </div>
    </div>
  );
}
