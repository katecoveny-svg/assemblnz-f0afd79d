import type { Metadata } from 'next';
import { StartSignupForm } from './start-signup-form';
import { INDUSTRY_KETES, type KeteSlug } from '@/lib/kete';

export const metadata: Metadata = {
  title: 'Start signup',
  description: 'Create your assembl account, choose a pack, and start Stripe checkout.',
  robots: { index: false, follow: false },
};

type SearchParams = { kete?: string };

export default async function StartSignupPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const initialKete = INDUSTRY_KETES.some((kete) => kete.slug === params.kete)
    ? (params.kete as KeteSlug)
    : 'waihanga';

  return (
    <main className="min-h-screen bg-[color:var(--assembl-paper)] px-5 py-10 text-[color:var(--text-primary)] md:px-10 md:py-14">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">
            assembl Industry Pack
          </p>
          <h1 className="mt-4 font-display text-[clamp(3rem,7vw,5.8rem)] font-light leading-[0.9]">
            Start your tenant.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-[color:var(--text-body)] md:text-lg">
            Create the operator account, confirm the business slug, choose the
            first kete, then checkout for NZ$3,500/mo + GST.
          </p>
        </div>
        <div className="mt-10">
          <StartSignupForm initialKete={initialKete} />
        </div>
      </div>
    </main>
  );
}
