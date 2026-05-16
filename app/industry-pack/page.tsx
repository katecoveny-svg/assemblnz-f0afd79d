import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PackPicker, type PackOption } from './PackPicker';
import { agentsForKete } from '@/lib/agents';
import { INDUSTRY_KETES, type KeteSlug } from '@/lib/kete';
import { KETE_DETAIL, type IndustryKeteDetail } from '@/lib/kete-detail';
import { PipelineStickyScroll } from '@/components/site/PipelineStickyScroll';
import { TeReo } from '@/components/site/TeReo';

export const metadata: Metadata = {
  title: {
    absolute: 'assembl — mahi that earns its proof',
  },
  description:
    'NZ$5,000 a month. Six to eight specialist agents sequenced into one operating loop for NZ operators.',
};

type IndustryKeteSlug = Exclude<KeteSlug, 'toro'>;

const ADD_ONS = [
  {
    title: 'Extra compliance layer',
    price: '$X/mo',
    body: "Add a specific Act, regulation, or industry standard to your agents' grounding. We ingest the source, hash it, and cite it.",
  },
  {
    title: 'Gamified team adoption',
    price: '$X/mo',
    body: 'Leaderboards, streaks, weekly briefings tuned for team-wide uptake. Adoption is the hardest part of specialist-agent work. Make it fun.',
  },
  {
    title: 'Custom voice training',
    price: '$X/mo',
    body: "Train your outreach agent on your real emails, your real tone. Your customers won't hear a machine.",
  },
  {
    title: 'Multi-site or multi-team',
    price: '$X/mo per location',
    body: 'Each location gets its own workspace, its own evidence packs. Roll-up reporting at the parent level.',
  },
  {
    title: 'Dedicated support hours',
    price: '$X/mo',
    body: 'Direct access to our team, weekday business hours, two-hour SLA.',
  },
  {
    title: 'On-call incident response',
    price: '$X/mo',
    body: "Pager + human on call. For consents, customs, food-safety emergencies that can't wait until morning.",
  },
] as const;

const HOW_IT_WORKS = [
  "Pick your kete. We've pre-configured the fleet.",
  'Sign in, wire your email + Stripe + calendar. Two weeks to live.',
  'Approve every draft. Nothing ships without your tick.',
] as const;

function buildPackOptions(): PackOption[] {
  return INDUSTRY_KETES.map((kete) => {
    const slug = kete.slug as IndustryKeteSlug;
    const detail = KETE_DETAIL[slug] as IndustryKeteDetail;
    const registryAgents = agentsForKete(slug).map((agent) => agent.name);
    const placeholderAgents = detail.placeholderAgents.map((agent) => agent.name);
    const agents =
      registryAgents.length > 0
        ? registryAgents
        : placeholderAgents.length > 0
          ? placeholderAgents
          : ['Pilot fleet configured during onboarding'];

    return {
      slug,
      name: kete.name,
      industry: kete.industry,
      accent: kete.accent,
      agents,
      workflow:
        detail.typicalWorkflows[0] ??
        detail.workflows[0]?.name ??
        'One live workflow, scoped during the Pilot Sprint.',
    };
  });
}

function SectionHeader({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body?: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="font-mono text-eyebrow uppercase text-[color:var(--text-secondary)]">
        {eyebrow}
      </p>
      <h2 className="mt-5 font-display text-display-lg font-light text-[color:var(--text-primary)]">
        {title}
      </h2>
      {body && <p className="mt-6 text-body-lg text-[color:var(--text-body)]">{body}</p>}
    </div>
  );
}

export default function IndustryPackPage() {
  const packOptions = buildPackOptions();

  return (
    <main className="bg-[color:var(--assembl-paper)] text-[color:var(--text-primary)]">
      <section className="relative overflow-hidden border-b border-[rgba(35,33,31,0.08)]">
        <div className="absolute inset-x-0 top-0 h-px bg-[color:var(--assembl-gold-thread)]" />
        <div className="container grid min-h-[calc(100vh-76px)] items-center gap-12 py-20 lg:grid-cols-[minmax(0,1fr)_minmax(360px,520px)] lg:py-24">
          <div>
            <p className="font-mono text-eyebrow uppercase text-[color:var(--text-secondary)]">
              assembl · Industry Pack
            </p>
            <h1 className="mt-7 max-w-[10ch] font-display text-display-xl font-light text-[color:var(--text-primary)]">
              <TeReo title="work">Mahi</TeReo> that earns its proof.
            </h1>
            <p className="mt-8 max-w-2xl text-body-lg text-[color:var(--text-body)] md:text-xl">
              NZ$5,000 a month. Six to eight specialist agents, sequenced into one operating loop
              — find work, quote it, run it, close the books. No usage limits. No setup fee. Cancel
              any time.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link href="/pilot-sprint" className="cta-primary inline-flex h-12 items-center justify-center px-8">
                Book a Pilot Sprint
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
              <a href="#pack-details" className="btn-ghost inline-flex h-12 items-center justify-center px-8">
                See what&apos;s in the pack
              </a>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-[520px]">
            <div className="absolute inset-8 rounded-full bg-[color:var(--assembl-pounamu-paper)] blur-3xl" />
            <Image
              src="/img/kete/home-vessel-pounamu.jpg"
              alt=""
              width={1200}
              height={900}
              priority
              className="relative max-h-[80vh] w-full object-contain"
              sizes="(min-width: 1024px) 520px, 90vw"
            />
          </div>
        </div>
      </section>

      <PipelineStickyScroll />

      <section id="pack-details" className="border-y border-[rgba(212,168,83,0.36)] py-24 lg:py-32">
        <div className="container">
          <SectionHeader
            eyebrow="What's in a pack"
            title="Pick the kete. The fleet arrives already sequenced."
            body="Each Industry Pack starts with one kete and one operating loop. You can switch kete any time."
          />
          <div className="mt-12">
            <PackPicker packs={packOptions} />
          </div>
        </div>
      </section>

      <section className="py-24 lg:py-32">
        <div className="container">
          <SectionHeader
            eyebrow="Add-ons"
            title="Layer on what your business actually needs."
            body="Add-ons sit on top of the flat $5K. Toggle any combination, cancel any time."
          />
          <div className="mt-12 grid gap-px border border-[rgba(212,168,83,0.30)] bg-[rgba(212,168,83,0.30)] md:grid-cols-2 lg:grid-cols-3">
            {ADD_ONS.map((addon) => (
              <article key={addon.title} className="bg-[color:var(--assembl-paper)] p-7">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-display text-3xl font-light leading-none">{addon.title}</h3>
                  <span className="whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--assembl-pounamu)]">
                    {addon.price}
                  </span>
                </div>
                <p className="mt-5 text-sm leading-relaxed text-[color:var(--text-body)]">{addon.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 lg:py-32">
        <div className="container">
          <SectionHeader eyebrow="How it works" title="Three steps. Then the loop runs." />
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {HOW_IT_WORKS.map((step, index) => (
              <article key={step} className="border border-[rgba(35,33,31,0.10)] bg-white/45 p-7">
                <p className="font-mono text-eyebrow uppercase text-[color:var(--assembl-pounamu)]">
                  {String(index + 1).padStart(2, '0')}
                </p>
                <p className="mt-8 text-body-lg text-[color:var(--text-primary)]">{step}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[rgba(212,168,83,0.36)] py-24 lg:py-32">
        <div className="container grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="font-mono text-eyebrow uppercase text-[color:var(--text-secondary)]">
              REAL OPERATORS, REAL FLEETS
            </p>
            <h2 className="mt-5 font-display text-display-lg font-light">
              One person can run a business with the right agents.
            </h2>
          </div>
          <p className="text-lg leading-[1.8] text-[color:var(--text-body)]">
            A solo lawn-care operator in rural New Hampshire runs 9 agents to manage his whole
            business — finding leads, satellite-rating property complexity, drafting outreach in his
            voice, clustering jobs into routes, watching insurance compliance, monitoring margins.
            Built in two weeks, no engineering team. That&apos;s the model we&apos;ve packaged for
            NZ operators.
          </p>
        </div>
      </section>

      <section className="py-24 md:py-36">
        <div className="container text-center">
          <p className="mx-auto max-w-4xl font-display text-display-xl font-light text-[color:var(--text-primary)]">
            Start with a Pilot Sprint.
          </p>
          <p className="mx-auto mt-8 max-w-2xl text-body-lg text-[color:var(--text-body)]">
            Two weeks. One workflow. One evidence pack. If your team hasn&apos;t saved real time by
            week two, we refund the pilot. Then you decide whether to go monthly.
          </p>
          <div className="mt-10">
            <Link href="/pilot-sprint" className="cta-primary inline-flex h-12 items-center justify-center px-8">
              Book a Pilot Sprint
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
