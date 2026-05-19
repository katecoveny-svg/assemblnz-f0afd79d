import type { Metadata } from 'next';
import { MarketplaceClient } from '@/components/site/MarketplaceClient';
import { KETES, type KeteSlug } from '@/lib/kete';
import { allWorkflows } from '@/lib/workflows';

export const metadata: Metadata = {
  title: 'Workflow marketplace',
  description:
    'Pre-made assembl workflows for admin-heavy work: install with a link, a line of code, or open in your dashboard.',
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

  return (
    <section className="relative overflow-hidden bg-[color:var(--assembl-paper)] px-6 py-20 md:px-12 md:py-28">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_12%,rgba(43,107,87,0.12),transparent_34%),radial-gradient(circle_at_82%_8%,rgba(212,168,83,0.14),transparent_30%)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-[1280px]">
        <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--assembl-pounamu)]">
          KETE WORKFLOW MARKETPLACE
        </p>
        <h1 className="mt-5 max-w-5xl font-display text-[clamp(3.6rem,8vw,7.8rem)] font-light italic leading-none">
          Pre-made workflows. One-click install.
        </h1>
        <p className="mt-6 max-w-3xl text-[17px] leading-[1.65] text-[color:var(--text-body)] md:text-xl">
          Every workflow on this page is a real job a New Zealand team is already
          doing manually today. Install one with a link, a line of code, or open
          it in your dashboard.
        </p>
        <MarketplaceClient workflows={allWorkflows} initialKete={initialKete} />
      </div>
    </section>
  );
}
