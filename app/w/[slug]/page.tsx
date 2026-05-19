import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { WorkflowRunner } from '@/components/site/WorkflowRunner';
import { allWorkflows, getWorkflow } from '@/lib/workflows';

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
    title: `${workflow.title} runner`,
    robots: { index: false, follow: false },
  };
}

export default async function StandaloneWorkflowPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const workflow = getWorkflow(slug);
  if (!workflow) notFound();

  return (
    <section className="min-h-screen bg-[color:var(--assembl-paper)] px-5 py-6 md:px-8">
      <header className="mx-auto flex max-w-[920px] items-center justify-between gap-4">
        <Link
          href="/"
          className="font-display text-3xl font-normal lowercase leading-none text-[color:var(--text-primary)]"
        >
          assembl
        </Link>
        <Link
          href={`/workflows/${workflow.slug}`}
          className="inline-flex items-center gap-2 text-sm text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"
        >
          View workflow details <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </header>
      <main className="mx-auto mt-8 max-w-[920px]">
        <div className="mb-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-[color:var(--assembl-pounamu)]">
            Shared workflow
          </p>
          <h1 className="mt-3 font-display text-[clamp(3rem,8vw,5.8rem)] font-light italic leading-none">
            {workflow.title}
          </h1>
          <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-[color:var(--text-body)]">
            {workflow.description}
          </p>
        </div>
        <WorkflowRunner workflow={workflow} minimal />
      </main>
      <footer className="mx-auto mt-10 max-w-[920px] border-t border-[rgba(35,33,31,0.10)] py-5 text-sm text-[color:var(--text-secondary)]">
        <Link href="/">Powered by assembl</Link>
      </footer>
    </section>
  );
}
