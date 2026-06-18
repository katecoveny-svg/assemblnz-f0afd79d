import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check, Code2, Radio, ShieldCheck, Zap } from 'lucide-react';
import { Eyebrow } from '@/components/site/Eyebrow';
import { LandscapeBand } from '@/components/site/LandscapeBand';
import { DashLeadForm } from '@/components/site/dash/DashLeadForm';

export const metadata: Metadata = {
  title: 'Dash by assembl — the ad network for NZ software’s quiet moments',
  description:
    'An ad network for the wait-state inside NZ software. Publishers earn 55% of ad revenue. Advertisers reach verified NZ B2B attention. assembl operates the network — and never reads your users’ data.',
  alternates: { canonical: '/dash' },
};

// Dash wordmark amber (locked). Distinct from the site gold-thread accent.
const DASH_AMBER = '#D9A85A';

const PUBLISHER_POINTS = [
  'Earn 55% of every ad served in your tool — 60% for our first anchor publishers.',
  'Two lines of code. The SDK is under 5KB and drops into any web, Electron or CLI surface.',
  'We never read your prompts, content, code, files or user data. That promise is in writing.',
  'Fail-open by design: if the auction is empty, your own loading line shows. Never a blank.',
];

const ADVERTISER_POINTS = [
  'Reach NZ business decision-makers mid-task, paying attention — not scrolling past a banner.',
  'One calm, brand-safe line of text in the wait state. No video, no pop-up, no cookie chase.',
  'NZ-only inventory, verified human attention, second-price auction so you never overpay.',
  'Brand-safety controls on by default: no gambling, alcohol or weapons inventory, ever.',
];

const STEPS = [
  {
    icon: Code2,
    title: 'Publishers install the SDK',
    body: 'dash.init() then dash.show() in your loading state. We send back one line of sponsored text, or nothing — your call what shows when it is nothing.',
  },
  {
    icon: Zap,
    title: 'Advertisers bid for the moment',
    body: 'A second-price auction runs per impression against live NZ campaigns, filtered by surface, budget and brand-safety rules. The best fit wins, and pays fairly.',
  },
  {
    icon: Radio,
    title: 'assembl operates the network',
    body: 'We run the auction, the fraud checks and the payouts, and we hold the trust contract. Built and run from Aotearoa, accountable to a named human.',
  },
] as const;

export default function DashPage() {
  return (
    <main className="bg-[color:var(--assembl-paper)] text-[color:var(--text-primary)]">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 lg:py-28">
        <div className="container">
          <Eyebrow label="Dash by assembl · Built in Aotearoa" accent={DASH_AMBER} />
          <h1 className="mt-6 max-w-4xl font-display text-[clamp(2.6rem,6vw,4.6rem)] font-light leading-[1.04] text-[color:var(--text-primary)]">
            Stretch the value, not the wait.
          </h1>
          <p className="mt-7 max-w-2xl text-[color:var(--text-body)] text-[clamp(1.05rem,1.6vw,1.25rem)] leading-relaxed">
            Every NZ digital service makes someone wait. Dash turns that moment into NZ ad revenue —
            one calm, brand-safe NZ-brand line in the spinner. <strong>They wait. You earn.</strong>{' '}
            Publishers keep 55%. The seconds already exist; Dash makes them earn.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              href="#get-started"
              className="inline-flex items-center gap-2 rounded-full bg-[color:var(--assembl-pounamu)] px-7 py-3.5 text-sm font-medium text-white transition-colors hover:bg-[color:var(--assembl-pounamu-deep)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)] focus-visible:ring-offset-2"
            >
              Become a publisher
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="#get-started"
              className="inline-flex items-center gap-2 rounded-full border border-[rgba(35,33,31,0.18)] px-7 py-3.5 text-sm font-medium text-[color:var(--text-primary)] transition-colors hover:border-[color:var(--assembl-pounamu)] hover:text-[color:var(--assembl-pounamu)]"
            >
              Become an advertiser
            </Link>
          </div>

          {/* DASH_HERO_IMAGE_PLACEHOLDER — Gemini-generated dog asset to drop in.
              Kate's locked visual direction: a sage-green dachshund whose long
              body is divided into loading-bar segments that fill dark as the page
              loads, with caption progression "loading." → "loading.." → "loading...".
              When the asset is supplied, drop the <Image> here and replace the
              interim spinner mock below. Don't render dog imagery before then. */}

          {/* Interim hero visual — an ad rendering in a spinner line. Swap for the
              dog asset above once Kate supplies it. */}
          <div className="mt-14 max-w-xl rounded-[12px] border border-[rgba(35,33,31,0.12)] bg-white/70 p-5 shadow-[0_24px_70px_rgba(35,33,31,0.08)]">
            <div className="flex items-center gap-3">
              <span
                className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-[color:var(--assembl-pounamu)] border-t-transparent"
                aria-hidden
              />
              <p className="text-sm text-[color:var(--text-body)]">
                Drafting your reply{' '}
                <span className="text-[color:var(--text-secondary)]">·</span>{' '}
                <span style={{ color: DASH_AMBER }}>
                  Air New Zealand Business — fly the main centres for less.
                </span>
              </p>
            </div>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
              One quiet line, in the moment people already wait
            </p>
          </div>
        </div>
      </section>

      <LandscapeBand />

      {/* For publishers / For advertisers */}
      <section className="py-20 lg:py-28">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <TwoSide
              eyebrow="For publishers"
              heading="Your spinner is inventory."
              lead="Every time your tool thinks, your user waits. That dead air is worth money — and you keep the majority of it."
              points={PUBLISHER_POINTS}
            />
            <TwoSide
              eyebrow="For advertisers"
              heading="The most attentive moment in NZ media."
              lead="Not a banner anyone can ignore. One line, in the exact moment an NZ professional is mid-task and paying attention."
              points={ADVERTISER_POINTS}
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-[rgba(35,33,31,0.08)] bg-white/40 py-20 lg:py-28">
        <div className="container">
          <div className="max-w-2xl">
            <Eyebrow label="How it works" accent={DASH_AMBER} />
            <h2 className="mt-5 font-display text-[clamp(2rem,4vw,3.2rem)] font-light leading-tight">
              Three parts. One quiet line.
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, body }) => (
              <article
                key={title}
                className="flex flex-col rounded-[10px] border border-[rgba(35,33,31,0.12)] bg-[#FAF7F2] p-6"
              >
                <span
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full"
                  style={{ backgroundColor: 'rgba(217,168,90,0.16)' }}
                >
                  <Icon className="h-5 w-5" style={{ color: DASH_AMBER }} aria-hidden />
                </span>
                <h3 className="mt-5 font-display text-xl font-normal leading-snug">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-body)]">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Trust promise */}
      <section className="py-16">
        <div className="container">
          <div className="flex max-w-3xl items-start gap-4 rounded-[12px] border border-[color:var(--assembl-pounamu)] bg-[color:var(--assembl-pounamu-paper)] p-6 md:p-8">
            <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-[color:var(--assembl-pounamu)]" aria-hidden />
            <div>
              <h2 className="font-display text-xl font-normal text-[color:var(--text-primary)]">
                The trust contract
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[color:var(--text-body)]">
                The SDK sends us only your publisher id, the surface, and a coarse context tag. It
                never reads — and has no way to read — prompts, content, code, files or user data.
                Privacy Act 2020 native. No raw IP is ever stored. Kate Hudson is the named,
                accountable owner of that promise.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Get started — lead capture */}
      <section className="pb-24 pt-4 lg:pb-32">
        <div className="container">
          <div className="grid items-start gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
            <div className="max-w-md">
              <Eyebrow label="Get started" accent={DASH_AMBER} />
              <h2 className="mt-5 font-display text-[clamp(2rem,4vw,3rem)] font-light leading-tight">
                Two ways in.
              </h2>
              <p className="mt-4 text-[color:var(--text-body)] leading-relaxed">
                Run a tool with a wait state, or want to reach the people inside one. Tell us which,
                and we will take it from there.
              </p>
              <dl className="mt-8 space-y-5">
                <div>
                  <dt className="font-mono text-[11px] uppercase tracking-[0.14em]" style={{ color: DASH_AMBER }}>
                    The split
                  </dt>
                  <dd className="mt-1 text-sm leading-relaxed text-[color:var(--text-body)]">
                    Publishers keep 55% of ad revenue — 60% as a launch incentive for our first
                    anchor publishers.
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-[11px] uppercase tracking-[0.14em]" style={{ color: DASH_AMBER }}>
                    Where it runs first
                  </dt>
                  <dd className="mt-1 text-sm leading-relaxed text-[color:var(--text-body)]">
                    On assembl&rsquo;s own tools today. We prove fill, fraud detection and reporting
                    against ourselves before we ship to anyone else.
                  </dd>
                </div>
              </dl>
            </div>

            <DashLeadForm />
          </div>

          <p className="mt-12 text-sm text-[color:var(--text-secondary)]">
            Dash by assembl is an assembl venture. Accountable owner: Kate Hudson ·{' '}
            <a href="mailto:assembl@assembl.co.nz" className="underline hover:text-[color:var(--assembl-pounamu)]">
              assembl@assembl.co.nz
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}

function TwoSide({
  eyebrow,
  heading,
  lead,
  points,
}: {
  eyebrow: string;
  heading: string;
  lead: string;
  points: readonly string[];
}) {
  return (
    <div>
      <Eyebrow label={eyebrow} accent={DASH_AMBER} />
      <h2 className="mt-5 font-display text-[clamp(1.8rem,3.4vw,2.6rem)] font-light leading-tight">
        {heading}
      </h2>
      <p className="mt-4 text-[color:var(--text-body)] leading-relaxed">{lead}</p>
      <ul className="mt-7 space-y-3.5">
        {points.map((p) => (
          <li key={p} className="flex items-start gap-3 text-sm leading-relaxed text-[color:var(--text-body)]">
            <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: DASH_AMBER }} aria-hidden />
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
