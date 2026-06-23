import type { Metadata } from 'next';
import { MarketplaceClient } from '@/components/site/MarketplaceClient';
import { KETES, type KeteSlug } from '@/lib/kete';
import { allWorkflows } from '@/lib/workflows';

export const metadata: Metadata = {
  title: 'Workflow marketplace',
  description:
    'Pre-made assembl workflows for admin-heavy work: open a workflow, run a sample, or turn it into a reviewed internal tool.',
};

export default async function WorkflowsPage({
  searchParams,
}: {
  searchParams: Promise<{ kete?: string }>;
}) {
  const { kete } = await searchParams;
  const initialKete: 'all' | KeteSlug = KETES.some((item) => item.slug === kete)
    ? (kete as KeteSlug)
    : 'all';
  const avgMinSaved = allWorkflows.length ? Math.round(allWorkflows.reduce((sum, w) => sum + w.timeSavedMin, 0) / allWorkflows.length) : 0;

  return (
    <section className="relative overflow-hidden bg-[color:var(--assembl-paper)] px-6 py-20 md:px-12 md:py-28">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_12%,rgba(58,56,50,0.12),transparent_34%),radial-gradient(circle_at_82%_8%,rgba(199,155,31,0.14),transparent_30%)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-[1280px]">
        <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--assembl-pounamu)]">
          KETE WORKFLOWS · SPECIALIST PACKS
        </p>
        <h1 className="mt-5 max-w-5xl font-display text-[clamp(3.6rem,8vw,7.8rem)] font-light leading-none">
          Pre-made workflows for real admin.
        </h1>
        <p className="mt-6 max-w-3xl text-[17px] leading-[1.65] text-[color:var(--text-body)] md:text-xl">
          Kete means basket or kit. These workflows sit inside assembl&apos;s
          specialist kete packs: construction, hospitality, freight, automotive,
          education, commerce, family operations, and more. Open one, run the
          sample, and turn the useful ones into reviewed internal tools.
        </p>
        <p className="mt-6 font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
          {allWorkflows.length} workflows · ~{avgMinSaved} min saved per run on average
        </p>
        <MarketplaceClient workflows={allWorkflows} initialKete={initialKete} />
      </div>
    </section>
  );
}
