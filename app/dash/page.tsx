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
import { ArrowRight, Check, Code2, Coins, ShieldCheck, Sparkles } from 'lucide-react';
import { DashLeadForm } from '@/components/site/dash/DashLeadForm';

export const metadata: Metadata = {
  title: 'dash. by assembl — get paid to wait',
  description:
    'Every NZ tool has a wait. dash. makes it earn. Your spinner is inventory — and publishers keep 55%.',
  alternates: { canonical: '/dash' },
  openGraph: {
    title: 'dash. by assembl — get paid to wait',
    description:
      'Every NZ tool has a wait. dash. makes it earn. Your spinner is inventory — and publishers keep 55%.',
    title: 'Dash by assembl — get paid to wait',
    description: 'The in-product attention network for Aotearoa. Stretch the value, not the wait.',
    type: 'website',
    siteName: 'Dash by assembl',
    url: 'https://assembl.co.nz/dash',
    locale: 'en_NZ',
    images: [
      {
        url: 'https://assembl.co.nz/images/dash/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Dash by assembl — get paid to wait',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dash by assembl — get paid to wait',
    description: 'The in-product attention network for Aotearoa. Stretch the value, not the wait.',
    images: ['https://assembl.co.nz/images/dash/og-image.png'],
  },
};

const PUBLISHER_POINTS = [
  'Keep 55% of every dollar the wait earns. 60% if you’re one of our first three.',
  'Two lines of code. Drops in anywhere you’ve got a spinner.',
  'No prompts read. No content read. No files, no code. The promise is in writing — Kate Hudson’s name is on it.',
  'If the auction’s empty, your own line shows. Never a blank.',
];

const ADVERTISER_POINTS = [
  'NZ professionals, waiting on their tool. The one moment they’re not scrolling past.',
  'One calm line of text in the wait. No video. No pop-up. No cookie chase.',
  'NZ-only. Real people, really watching. You never overpay.',
  'No gambling. No alcohol. No weapons. Ever.',
  'Reach NZ business decision-makers mid-task, paying attention — not scrolling past a banner.',
  'One calm, brand-safe line of text in the wait state. No video, no pop-up, no cookie chase.',
  'Reach NZ decision-makers mid-task, paying attention — not scrolling past a banner.',
  'One calm, brand-safe line of text in the wait. No video, no pop-up, no cookie chase.',
  'NZ-only inventory, verified human attention, second-price auction so you never overpay.',
  'Brand-safety controls on by default: no gambling, alcohol or weapons inventory, ever.',
];

const STEPS = [
  {
    icon: Code2,
    title: 'Drop in two lines',
    body: 'Two lines in your loading state. We send back one quiet line. Or nothing — then your own line shows.',
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
    body: 'Two lines in your loading state. We return one quiet line of NZ-brand text — or nothing, and your own fallback shows.',
  },
  {
    icon: Sparkles,
    title: 'An auction runs in the wait',
    body: 'Live NZ campaigns bid for that one second. Best fit wins. Nobody overpays.',
  },
  {
    icon: Coins,
    title: 'You earn while they wait',
    body: '55% of the money, every month, straight to your bank. The seconds already exist. dash. makes them earn.',
  },
] as const;

/** The dachshund mark (lifted from the kit's dash-dog.svg) whose segmented body
 *  doubles as the loader — forest segments fill left→right on a ~5.4s loop, then
 *  reset. Pure CSS via the .dseg class in dash-kit.css; static at 50% under
 *  prefers-reduced-motion. */
function DashDog() {
  return (
    <svg
      className="dogSvg"
      viewBox="0 0 1040 470"
      role="img"
      aria-label="the dash dachshund — its body fills as it waits"
    >
      <defs>
        <clipPath id="dashBodyClip">
          <rect x="185" y="206" width="548" height="128" rx="22" />
        </clipPath>
      </defs>
      <ellipse cx="560" cy="432" rx="372" ry="20" fill="#1a2a1c" opacity="0.06" />
      <path d="M206 250 C 158 252 128 228 120 190" stroke="#A6BA9E" strokeWidth="26" strokeLinecap="round" />
      <rect x="214" y="298" width="48" height="118" rx="22" fill="#A6BA9E" />
      <rect x="650" y="298" width="48" height="118" rx="22" fill="#A6BA9E" />
      <rect x="185" y="206" width="548" height="128" rx="22" fill="#A6BA9E" />
      {/* body loader segments (forest), clipped to the rounded body */}
      <g clipPath="url(#dashBodyClip)">
        <rect className="dseg" x="185" y="206" width="187" height="128" />
        <rect className="dseg" x="380" y="206" width="72" height="128" />
        <rect className="dseg" x="460" y="206" width="72" height="128" />
        <rect className="dseg" x="540" y="206" width="72" height="128" />
        <rect className="dseg" x="620" y="206" width="113" height="128" />
      </g>
      {/* division grooves sit above the fill */}
      <g fill="#8DA382">
        <rect x="372" y="206" width="8" height="128" />
        <rect x="452" y="206" width="8" height="128" />
        <rect x="532" y="206" width="8" height="128" />
        <rect x="612" y="206" width="8" height="128" />
      </g>
      <rect x="712" y="156" width="150" height="178" rx="52" fill="#A6BA9E" />
      <rect x="842" y="214" width="156" height="84" rx="34" fill="#A6BA9E" />
      <path
        d="M768 166 C 732 168 714 204 718 250 C 720 290 740 320 776 322 C 812 320 822 290 822 248 C 822 202 804 166 768 166 Z"
        fill="#A6BA9E"
        stroke="#F2EFE6"
        strokeWidth="7"
      />
      <rect x="962" y="222" width="38" height="48" rx="19" fill="#14301A" />
      <circle cx="838" cy="200" r="13" fill="#14301A" />
    </svg>
  );
}

export default function DashPage() {
  return (
    <main>
      {/* ---------- HERO ---------- */}
      <section className="hero">
        <div className="wrap">
          <div className="heroStage" style={{ padding: '56px 0 72px' }}>
            <div className="heroCopy">
              <p className="eyebrow heroEyebrow">An ad network that lives in the wait. NZ-only.</p>
              <h1 className="heroTitle">
                <span className="l">Get paid</span>
                <span className="l">
                  to <span className="em">wait.</span>
                </span>
              </h1>
              <p className="heroSub">
                Every NZ tool has a wait. dash. makes it earn. Most of the money goes to you.
              </p>
              <div className="heroCta">
                <Link href="#waitlist" className="btn btn--primary btn--lg">
                  Join the waitlist
                  <ArrowRight aria-hidden />
                </Link>
                <Link href="#how" className="btn btn--ghost btn--lg">
                  How it works
                </Link>
              </div>
              <p className="trust heroTrust">
                <span className="dot" />
                Private by design
                <span className="dot" />
                Your data stays in NZ
                <span className="dot" />
                No prompts read
              </p>
            </div>

            <div className="dogWrap">
              <span className="dogHalo" aria-hidden />
              <div className="dogFloat">
                <DashDog />
              </div>
            </div>
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
      {/* ---------- HOW IT WORKS ---------- */}
      <section className="section" id="how">
        <div className="wrap">
          <p className="eyebrow" style={{ marginBottom: 12 }}>
            How it works
          </p>
          <h2 className="sectionTitle" style={{ maxWidth: 620 }}>
            Watch. Wait. Earn.
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 20,
              marginTop: 40,
            }}
          >
            {STEPS.map(({ icon: Icon, title, body }) => (
              <article key={title} className="card card--hover">
                <span className="icon-badge" style={{ marginBottom: 18 }}>
                  <Icon aria-hidden />
                </span>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- PUBLISHERS / ADVERTISERS ---------- */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div
            style={{
              display: 'grid',
              gap: 48,
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            }}
          >
            <TwoSide
              id="publishers"
              eyebrow="For publishers"
              heading="Your spinner is inventory."
              lead="Your tool thinks. Your user waits. That wait is worth money. Most of it goes to you."
              points={PUBLISHER_POINTS}
            />
            <TwoSide
              id="advertisers"
              eyebrow="For advertisers"
              heading="The one second they’re actually watching."
              lead="Not a banner they scroll past. One line, in the second they’re waiting on their tool — and watching it."
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
      {/* ---------- TRUST ---------- */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: 18, maxWidth: 760 }}>
            <span className="icon-badge" style={{ flex: 'none' }}>
              <ShieldCheck aria-hidden />
            </span>
            <div>
              <h3 className="serif" style={{ fontSize: 24, marginBottom: 8, fontWeight: 600 }}>
                The promise, in writing
              </h3>
              <p className="body" style={{ fontSize: 15.5 }}>
                The SDK sends us three things: who you are, what kind of screen it is, a rough topic.
                That’s all. It can’t read your prompts, your content, your code or your files. It
                never sees a user. No raw IP is ever stored. Built to the Privacy Act 2020. Kate
                Hudson’s name is on that promise.
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
      {/* ---------- WAITLIST ---------- */}
      <section className="section" id="waitlist" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div
            className="waitlistGrid"
            style={{
              display: 'grid',
              gap: 48,
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              alignItems: 'start',
            }}
          >
            <div style={{ maxWidth: 420 }}>
              <p className="eyebrow" style={{ marginBottom: 12 }}>
                Join the waitlist
              </p>
              <h2 className="sectionTitle">Two ways in.</h2>
              <p className="body" style={{ marginTop: 16, fontSize: 16 }}>
                Got a tool with a wait? Or want to reach the people inside one? Tell us which.
                We&rsquo;ll take it from there.
              </p>
              <p className="pill pill--gold" style={{ marginTop: 24 }}>
                Publishers keep 55%. 60% for the first three.
              </p>
            </div>
            <DashLeadForm />
          </div>
        </div>
      </section>
    </main>
  );
}

function TwoSide({
  id,
  eyebrow,
  heading,
  lead,
  points,
}: {
  id: string;
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
    <div id={id} style={{ scrollMarginTop: 90 }}>
      <p className="eyebrow" style={{ marginBottom: 12 }}>
        {eyebrow}
      </p>
      <h2 className="sectionTitle" style={{ fontSize: 'clamp(28px, 3.2vw, 38px)' }}>
        {heading}
      </h2>
      <p className="lead" style={{ marginTop: 16, color: 'var(--muted)' }}>
        {lead}
      </p>
      <ul style={{ listStyle: 'none', marginTop: 26, display: 'grid', gap: 14 }}>
        {points.map((p) => (
          <li key={p} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <Check size={18} strokeWidth={2} color="var(--gold)" style={{ flex: 'none', marginTop: 3 }} aria-hidden />
            <span className="body" style={{ fontSize: 15.5, color: 'var(--fg)' }}>
              {p}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
