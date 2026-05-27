import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { WorkflowCard } from './WorkflowCard';
import { allWorkflows, featuredWorkflowSlugs } from '@/lib/workflows';

export function MarketplaceStrip() {
  const featured = featuredWorkflowSlugs.flatMap((slug) => {
    const workflow = allWorkflows.find((item) => item.slug === slug);
    return workflow ? [workflow] : [];
  });

  return (
    <div id="marketplace" className="mx-auto max-w-[1500px]">
      <div className="max-w-4xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--assembl-pounamu)]">
          WORKFLOW PREVIEW
        </p>
        <h2 className="mt-4 font-display text-[clamp(3rem,7vw,5.8rem)] font-normal italic leading-tight">
          Try a repeatable job.
        </h2>
        <p className="mt-5 max-w-[720px] text-[17px] leading-[1.6] text-[color:var(--text-body)] md:text-base">
          Open a workflow, run the sample, and see what a reviewed output looks like before you turn it into a private tool for your team.
        </p>
      </div>
      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {featured.map((workflow) => (
          <WorkflowCard key={workflow.slug} workflow={workflow} compact />
        ))}
      </div>
      <Link
        href="/workflows"
        className="mt-8 inline-flex h-12 items-center rounded-full border border-[rgba(43,107,87,0.22)] bg-[linear-gradient(180deg,rgba(255,255,255,0.80),rgba(232,239,233,0.62))] px-6 font-medium text-[#103F35] shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_16px_42px_rgba(43,107,87,0.12)] transition hover:-translate-y-0.5 hover:border-[rgba(43,107,87,0.38)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_22px_56px_rgba(43,107,87,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Browse all workflows <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
      </Link>
    </div>
  );
}
