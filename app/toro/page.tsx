import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Eyebrow } from '@/components/site/Eyebrow';
import { SectionReveal } from '@/components/SectionReveal';

export const metadata: Metadata = {
  title: 'Tōro — the family assistant',
  description:
    'Tōro reads the school newsletters, the notices, and the messy household notes, then drafts the reply, the calendar entry, and the plan. You give the nod. $29 a month for your whole whānau.',
  openGraph: {
    title: 'Tōro — the family assistant',
    description:
      'Less of the evening on school admin. More whānau. $29 a month, cancel any time.',
    images: [{ url: '/img/brand/toro-by-assembl-banner-1.png' }],
  },
};

// Whānau-first cards. No "compliance" or "evidence pack" language here — this is
// family life, not an audit trail.
const FEATURES = [
  {
    name: 'Term Planner',
    pitch: 'Forward the school newsletter. Get the term, sorted.',
    body: 'Drop in the newsletter, the assembly note, or the permission slip. Tōro pulls the dates into your calendar and drafts the reply — you just give it the nod. Kindo, Hero, Seesaw, and plain-email schools all fit.',
    badge: 'Live now',
  },
  {
    name: 'Family Budget',
    pitch: 'Pocket money and chores, without the nagging.',
    body: 'Set a chore, the kids send a photo, you approve. Money can split across save, spend, and give — so the good habits show up in the numbers, not just the lecture. One ledger per household.',
    badge: 'Live now',
  },
  {
    name: 'Holiday Ideas',
    pitch: 'Two weeks of school holidays, planned in ten minutes.',
    body: 'Local programmes, council activities, and rainy-day backups for your region — a week the whole whānau can agree on, with booking deadlines surfaced before they pass.',
    badge: 'Coming soon · Q3 2026',
  },
] as const;

export default function ToroPage() {
  return (
    <main className="bg-[color:var(--assembl-paper)] text-[color:var(--text-primary)]">
      {/* Hero — warm, whānau-first. Tōro sub-brand banner, not vessel imagery. */}
      <section className="overflow-hidden py-20 lg:py-28">
        <div className="container">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <SectionReveal>
              <Eyebrow label="Tōro · for whānau" accent="var(--assembl-gold)" />
              <h1 className="mt-6 font-display text-display-xl font-light">
                Less of the evening on <em className="not-italic text-[color:var(--assembl-pounamu)]">school admin.</em>
              </h1>
              <p className="mt-8 max-w-xl text-body-lg text-[color:var(--text-body)]">
                Tōro reads the school newsletters, the notices, and the messy household notes — then
                drafts the reply, the calendar entry, and the plan. One shared memory for everyone who
                runs the house: the timetable, the pick-up roster, the dietary list — asked once,
                remembered for whoever asks next, in English or te reo Māori. You give the nod.
              </p>
              <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <Link href="/start" className="cta-primary inline-flex h-12 items-center px-7">
                  Start Tōro · $29/month
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Link>
                <span className="font-mono text-[12px] uppercase tracking-[0.12em] text-[color:var(--text-secondary)]">
                  $29 + GST / month · cancel any time
                </span>
              </div>
            </SectionReveal>
            <SectionReveal delay={0.05}>
              <div className="overflow-hidden rounded-[24px] border border-[rgba(157,140,125,0.2)] bg-white/40">
                <img
                  src="/img/brand/toro-by-assembl-banner-1.png"
                  alt="Tōro by assembl — the family assistant"
                  width={1200}
                  height={900}
                  className="h-full w-full object-cover"
                />
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* Three things Tōro does */}
      <section className="border-t border-[rgba(35,33,31,0.08)] py-20 lg:py-28">
        <div className="container">
          <SectionReveal>
            <Eyebrow label="What Tōro does" accent="var(--assembl-pounamu)" />
            <h2 className="mt-5 max-w-2xl font-display text-display-lg font-light">
              Three things off your plate, <em className="not-italic text-[color:var(--assembl-pounamu)]">every week.</em>
            </h2>
          </SectionReveal>
          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            {FEATURES.map((feature, index) => (
              <SectionReveal key={feature.name} delay={index * 0.05}>
                <article className="glass-card h-full p-7">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-display text-display-md font-light">{feature.name}</h3>
                    <span className="rounded-full bg-[rgba(43,107,87,0.08)] px-2.5 py-1 font-mono text-[12px] uppercase tracking-[0.12em] text-[color:var(--assembl-pounamu)]">
                      {feature.badge}
                    </span>
                  </div>
                  <p className="mt-4 text-body-md font-medium text-[color:var(--text-primary)]">
                    {feature.pitch}
                  </p>
                  <p className="mt-3 text-body-md text-[color:var(--text-body)]">{feature.body}</p>
                </article>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Trust + price + CTA */}
      <section className="border-t border-[rgba(212,168,83,0.36)] py-20 lg:py-28">
        <div className="container">
          <SectionReveal>
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-body-lg text-[color:var(--text-body)]">
                <span className="font-medium text-[color:var(--text-primary)]">Kid-safe by default.</span>{' '}
                Tōro is scoped to your family — no public profile, no surfacing of children&rsquo;s
                details, no upsells in the conversation. Nothing sends until a parent gives the nod.
              </p>
              <p className="mt-8 font-display text-display-md font-light">$29 + GST / month</p>
              <div className="mt-8 flex justify-center">
                <Link href="/start" className="cta-primary inline-flex h-12 items-center px-7">
                  Start Tōro
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Link>
              </div>
              <p className="mt-10 text-body-sm text-[color:var(--text-secondary)]">
                Running a business?{' '}
                <Link
                  href="/pricing"
                  className="rounded-sm font-medium text-[color:var(--assembl-pounamu)] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)] focus-visible:ring-offset-2"
                >
                  See kete packs
                </Link>
              </p>
            </div>
          </SectionReveal>
        </div>
      </section>
    </main>
  );
}
