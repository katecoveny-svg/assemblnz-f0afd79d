import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import type { CSSProperties } from 'react';
import { WorkflowCard } from '@/components/site/WorkflowCard';
import { WorkflowRunner } from '@/components/site/WorkflowRunner';
import { getKete } from '@/lib/kete';
import { allWorkflows, getWorkflow, getWorkflowsByKete } from '@/lib/workflows';

type Params = { slug: string };

export function generateStaticParams() {
  return allWorkflows.map((workflow) => ({ slug: workflow.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const workflow = getWorkflow(slug);
  if (!workflow) return {};
  return {
    title: workflow.title,
    description: workflow.description,
  };
}

export default async function WorkflowDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const workflow = getWorkflow(slug);
  if (!workflow) notFound();

  const kete = getKete(workflow.kete);
  const related = getWorkflowsByKete(workflow.kete)
    .filter((item) => item.slug !== workflow.slug)
    .slice(0, 3);

  return (
    <section className="relative overflow-hidden bg-[color:var(--assembl-paper)] px-6 py-16 md:px-12 md:py-24">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_24%_6%,color-mix(in_srgb,var(--workflow-accent)_16%,transparent),transparent_34%),radial-gradient(circle_at_85%_12%,rgba(212,168,83,0.13),transparent_30%)]"
        style={{ '--workflow-accent': kete.accent } as CSSProperties}
        aria-hidden
      />
      <div className="relative mx-auto max-w-[1100px]" style={{ '--workflow-accent': kete.accent } as CSSProperties}>
        <nav className="flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--text-secondary)]">
          <Link href="/workflows" className="hover:text-[color:var(--text-primary)]">
            Workflows
          </Link>
          <span>/</span>
          <Link href={`/workflows?kete=${workflow.kete}`} className="hover:text-[color:var(--text-primary)]">
            {kete.name}
          </Link>
          <span>/</span>
          <span className="text-[color:var(--text-primary)]">{workflow.title}</span>
        </nav>

        <header className="mt-8">
          <span className="inline-flex rounded-full border border-[rgba(35,33,31,0.12)] bg-white/62 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--workflow-accent)]">
            {kete.name} · {kete.industry}
          </span>
          <h1 className="mt-5 max-w-4xl font-display text-[clamp(3.4rem,7vw,7rem)] font-light italic leading-none">
            {workflow.title}
          </h1>
          <p className="mt-6 max-w-3xl text-[17px] leading-[1.65] text-[color:var(--text-body)] md:text-xl">
            {workflow.description}
          </p>
          <div className="mt-5 flex flex-wrap gap-3 font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--text-secondary)]">
            <span>~{workflow.timeSavedMin} min saved per run</span>
            <span>·</span>
            <span>{workflow.priceLabel}</span>
            <span>·</span>
            <span>{workflow.runsThisMonth} runs this month</span>
          </div>
        </header>

        <div className="mt-12">
          <WorkflowRunner workflow={workflow} />
        </div>

        {related.length > 0 && (
          <section className="mt-20">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
                  Related workflows
                </p>
                <h2 className="mt-3 font-display text-5xl font-light italic leading-none">
                  More from {kete.name}.
                </h2>
              </div>
              <Link
                href={`/workflows?kete=${workflow.kete}`}
                className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--workflow-accent)]"
              >
                See all {kete.name} workflows <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </div>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {related.map((item) => (
                <WorkflowCard key={item.slug} workflow={item} compact />
              ))}
            </div>
          </section>
        )}
      </div>
    </section>
  );
}
