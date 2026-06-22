import Link from 'next/link';
import { ArrowRight, CheckCircle2, MessageCircle, ShieldCheck, Workflow } from 'lucide-react';
import { type Agent, CAPABILITY_LABELS, PHASE_LABELS } from '@/lib/agents';
import { getKete } from '@/lib/kete';
import { WORKFLOW_STARTERS, workflowById } from '@/lib/chat/workflows';
import { AgentDemoPanel } from './AgentDemoPanel';

/**
 * The original kete-fleet agent detail page. Preserved verbatim and rendered as
 * the fallback when a `/agents/[slug]` request does not match a marketplace
 * agent — keeps existing fleet deep links (e.g. /agents/gateway, links from the
 * command palette and /app/chat) working through the marketplace pivot.
 */
export function FleetAgentDetail({ agent, workflowParam }: { agent: Agent; workflowParam?: string }) {
  const kete = getKete(agent.kete);
  const phase = agent.phase ? PHASE_LABELS[agent.phase] : 'Specialist';
  const workflow = workflowById(agent.kete, workflowParam);
  const workflowOptions = WORKFLOW_STARTERS[agent.kete] ?? [];
  const demoWorkflow = workflow ?? workflowOptions[0] ?? null;
  const chatHref = `/app/chat?kete=${encodeURIComponent(kete.slug)}&agent=${encodeURIComponent(agent.slug)}${
    workflow ? `&workflow=${encodeURIComponent(workflow.id)}` : ''
  }`;

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
              <Link href={chatHref} className="cta-primary inline-flex h-12 items-center gap-2 px-6">
                Demo in chat <MessageCircle className="h-4 w-4" aria-hidden />
              </Link>
              <Link href="/pilot-sprint" className="btn-ghost inline-flex h-12 items-center gap-2 px-6">
                Use in a pilot <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>

          <aside className="glass-card p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
              {workflow ? 'Shared workflow' : 'Demo status'}
            </p>
            {workflow ? (
              <div className="mt-5">
                <div className="rounded-[8px] bg-[color:var(--assembl-paper)] p-4">
                  <div className="flex items-center gap-2">
                    <Workflow className="h-4 w-4 text-[color:var(--assembl-pounamu)]" aria-hidden />
                    <h2 className="font-display text-2xl font-light">{workflow.title}</h2>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-body)]">
                    {workflow.outcome}
                  </p>
                  <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
                    Evidence pack
                  </p>
                  <p className="mt-1 text-sm text-[color:var(--text-primary)]">{workflow.evidencePack}</p>
                  <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
                    Reviewer
                  </p>
                  <p className="mt-1 text-sm text-[color:var(--text-primary)]">{workflow.reviewerRole}</p>
                </div>
              </div>
            ) : (
              <div className="mt-5 grid gap-3">
                <StatusRow title="Chat handoff" body="Open this specialist in its kete chat to draft from a real task." />
                <StatusRow title="Human review" body="All outputs are positioned as drafts for named reviewer sign-off." />
              </div>
            )}
          </aside>
        </div>
      </section>

      <section className="px-6 py-10 md:px-10 md:py-14">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-3">
          <Panel title="Role" body={agent.role} />
          <Panel title="Phase" body={phase} />
          <Panel title="Status" body={agent.status ?? 'live'} />
        </div>

        <AgentDemoPanel
          agentSlug={agent.slug}
          agentName={agent.name}
          keteName={kete.name}
          keteAccent={kete.accent}
          workflowId={demoWorkflow?.id ?? null}
          workflowTitle={demoWorkflow?.title ?? null}
          starterPrompt={
            demoWorkflow?.starterPrompt ??
            `Ask ${agent.name} to assess one realistic ${kete.industry.toLowerCase()} workflow. Return the likely agent handoff, missing evidence, relevant New Zealand legislation, and the named human review gate.`
          }
          evidencePack={demoWorkflow?.evidencePack ?? null}
          reviewerRole={demoWorkflow?.reviewerRole ?? null}
        />

        <div className="mx-auto mt-8 grid max-w-7xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="glass-card p-6">
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

          <section className="glass-card p-6">
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

        {workflowOptions.length > 0 ? (
          <section className="glass-card mx-auto mt-8 max-w-7xl p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[color:var(--text-secondary)]">
                  Premade workflows
                </p>
                <h2 className="mt-2 font-display text-4xl font-light">Client-shareable starting points.</h2>
              </div>
              <Link href={chatHref} className="btn-ghost inline-flex h-11 items-center gap-2 px-5">
                Open in chat <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {workflowOptions.map((option) => (
                <Link
                  key={option.id}
                  href={`/agents/${agent.slug}?workflow=${encodeURIComponent(option.id)}`}
                  className={[
                    'rounded-[8px] border p-4 transition-colors',
                    workflow?.id === option.id
                      ? 'border-[rgba(35,33,31,0.24)] bg-[rgba(43,107,87,0.08)]'
                      : 'border-[rgba(35,33,31,0.10)] bg-white/60 hover:bg-[rgba(35,33,31,0.04)]',
                  ].join(' ')}
                >
                  <p className="font-display text-2xl font-light text-[color:var(--text-primary)]">
                    {option.title}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-[color:var(--text-body)]">
                    {option.clientUse}
                  </p>
                  <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--text-secondary)]">
                    {option.agentSequence.join(' → ')}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </section>
    </main>
  );
}

function Panel({ title, body }: { title: string; body: string }) {
  return (
    <div className="glass-card p-5">
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
