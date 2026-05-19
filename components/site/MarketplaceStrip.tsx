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
          MARKETPLACE PREVIEW
        </p>
        <h2 className="mt-4 font-display text-[clamp(3rem,7vw,5.8rem)] font-normal italic leading-tight">
          A workflow for every kind of admin.
        </h2>
        <p className="mt-5 max-w-[720px] text-[17px] leading-[1.6] text-[color:var(--text-body)] md:text-base">
          27 pre-made workflows. Nine live now. Browse them all in the marketplace.
        </p>
      </div>
      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {featured.map((workflow) => (
          <WorkflowCard key={workflow.slug} workflow={workflow} compact />
        ))}
      </div>
      <Link
        href="/workflows"
        className="mt-8 inline-flex h-12 items-center rounded-full bg-[color:var(--assembl-pounamu)] px-6 font-medium text-[#FAF7F2]"
      >
        See all 27 workflows <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
      </Link>
    </div>
  );
}
