import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check, Code2, Coins, ShieldCheck, Sparkles } from 'lucide-react';
import { DashLeadForm } from '@/components/site/dash/DashLeadForm';

export const metadata: Metadata = {
  title: 'dash. by assembl — get paid to wait',
  description:
    'The in-product attention network for Aotearoa. We turn the wait inside every NZ digital service into time worth spending — and revenue worth sharing. Publishers keep 55%.',
  alternates: { canonical: '/dash' },
  openGraph: {
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
  'Keep 55% of every dollar your wait states earn — 60% for our first anchor publishers.',
  'Two lines of code. The SDK is under 5KB and drops into any web, Electron or CLI surface.',
  'We never read your prompts, content, code, files or user data. That promise is in writing.',
  'Fail-open by design: if the auction is empty, your own loading line shows. Never a blank.',
];

const ADVERTISER_POINTS = [
  'Reach NZ decision-makers mid-task, paying attention — not scrolling past a banner.',
  'One calm, brand-safe line of text in the wait. No video, no pop-up, no cookie chase.',
  'NZ-only inventory, verified human attention, second-price auction so you never overpay.',
  'Brand-safety controls on by default: no gambling, alcohol or weapons inventory, ever.',
];

const STEPS = [
  {
    icon: Code2,
    title: 'Publishers install the SDK',
    body: 'Two lines in your loading state. We return one quiet line of NZ-brand text — or nothing, and your own fallback shows.',
  },
  {
    icon: Sparkles,
    title: 'A second-price auction runs',
    body: 'Per impression, against live NZ campaigns, filtered by surface, budget and brand-safety. The best fit wins, and pays fairly.',
  },
  {
    icon: Coins,
    title: 'You earn while they wait',
    body: '55% of net revenue, paid monthly through Stripe Connect. The seconds already exist — dash. makes them earn.',
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
              <p className="eyebrow heroEyebrow">The in-product attention network for Aotearoa</p>
              <h1 className="heroTitle">
                <span className="l">Get paid</span>
                <span className="l">
                  to <span className="em">wait.</span>
                </span>
              </h1>
              <p className="heroSub">
                We turn the wait inside every NZ digital service into time worth spending — and
                revenue worth sharing.
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
                NZ data residency
                <span className="dot" />
                Enterprise grade
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
              lead="Every time your tool thinks, your user waits. That wait is worth money — and you keep the majority of it."
              points={PUBLISHER_POINTS}
            />
            <TwoSide
              id="advertisers"
              eyebrow="For advertisers"
              heading="The most attentive moment in NZ media."
              lead="Not a banner anyone can ignore. One line, in the exact moment an NZ professional is mid-task and paying attention."
              points={ADVERTISER_POINTS}
            />
          </div>
        </div>
      </section>

      {/* ---------- TRUST ---------- */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: 18, maxWidth: 760 }}>
            <span className="icon-badge" style={{ flex: 'none' }}>
              <ShieldCheck aria-hidden />
            </span>
            <div>
              <h3 className="serif" style={{ fontSize: 24, marginBottom: 8, fontWeight: 600 }}>
                The trust contract
              </h3>
              <p className="body" style={{ fontSize: 15.5 }}>
                The SDK sends us only your publisher id, the surface, and a coarse context tag. It
                never reads — and has no way to read — prompts, content, code, files or user data.
                Privacy Act 2020 native. No raw IP is ever stored. Kate Hudson is the named,
                accountable owner of that promise.
              </p>
            </div>
          </div>
        </div>
      </section>

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
                Run a tool with a wait state, or want to reach the people inside one. Tell us which,
                and we&rsquo;ll take it from there.
              </p>
              <p className="pill pill--gold" style={{ marginTop: 24 }}>
                Publishers keep 55% — 60% for the first three anchors
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
