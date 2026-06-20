import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check, Code2, Coins, ShieldCheck, Sparkles } from 'lucide-react';
import { DashLeadForm } from '@/components/site/dash/DashLeadForm';
import { ShaderHeroBackdrop } from '@/components/site/ShaderHeroBackdrop';

export const metadata: Metadata = {
  title: 'dash. by assembl — get paid to wait',
  description:
    'Every NZ tool has a wait. dash. makes it earn. Your spinner is inventory — and publishers keep 55%.',
  alternates: { canonical: '/dash' },
  openGraph: {
    title: 'dash. by assembl — get paid to wait',
    description: 'Every NZ tool has a wait. dash. makes it earn. Your spinner is inventory.',
    type: 'website',
    siteName: 'dash. by assembl',
    url: 'https://assembl.co.nz/dash',
    locale: 'en_NZ',
    images: [
      {
        url: 'https://assembl.co.nz/images/dash/og-image.png',
        width: 1200,
        height: 630,
        alt: 'dash. by assembl — get paid to wait',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'dash. by assembl — get paid to wait',
    description: 'Every NZ tool has a wait. dash. makes it earn. Your spinner is inventory.',
    images: ['https://assembl.co.nz/images/dash/og-image.png'],
  },
};

// The three audiences, said plainly — shown as a row right under the hero so
// it's instantly obvious who dash. is for.
const AUDIENCES = [
  {
    icon: Coins,
    who: 'For people',
    line: 'Get paid to wait. Points, cash or perks for seconds you’d spend waiting anyway.',
    href: '#people',
  },
  {
    icon: Code2,
    who: 'For publishers',
    line: 'Your wait state is ad space. Keep 55% of what it earns, in two lines of code.',
    href: '#publishers',
  },
  {
    icon: Sparkles,
    who: 'For advertisers',
    line: 'Own the space between click and result. Reach NZ users while they watch the screen.',
    href: '#advertisers',
  },
] as const;

const PEOPLE_POINTS = [
  'One line of text while your tool loads — that’s the whole ad.',
  'Points, cash or perks for waits you’d sit through regardless.',
  'No new app and no sign-up: it runs inside the NZ tools you already open.',
  'Private by design — no prompts, content or files are read.',
];

const PUBLISHER_POINTS = [
  'Keep 55% of every dollar the wait earns. 60% for the first three publishers.',
  'Two lines of code. It drops in wherever you already show a spinner.',
  'No prompts, content, files or code read — the privacy terms are in writing.',
  'Empty auction? Your own line runs instead. Never a blank.',
];

const ADVERTISER_POINTS = [
  'NZ users on NZ-licensed software, reached mid-task.',
  'Text only — no video, no pop-up, no cookies. One line.',
  'Second-price auction: you pay one cent above the next bid, never more.',
  'NZ-only inventory. No gambling, alcohol or weapons.',
];

const STEPS = [
  {
    icon: Code2,
    title: 'You click',
    body: 'You use an NZ tool the way you always do. It works, and you wait the second it takes to load.',
  },
  {
    icon: Sparkles,
    title: 'A line runs in the wait',
    body: 'One line of text shows while the tool loads. No video, no pop-up, nothing to close.',
  },
  {
    icon: Coins,
    title: 'Everyone earns',
    body: 'You take the reward, the publisher keeps 55%, the brand lands its line. The second was always there — dash. makes it pay.',
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
        {/* live flowing-gradient + gold-thread mesh, matching assembl.co.nz */}
        <ShaderHeroBackdrop />
        <div className="wrap" style={{ position: 'relative', zIndex: 1 }}>
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
                Every NZ tool has a wait. dash. pays it out — to the people who watch, the publishers
                who host it, and the brands that bid for the second.
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
                Hosted in AWS Sydney
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

      {/* ---------- WHO IT'S FOR ---------- */}
      <section className="section" id="who" style={{ paddingBottom: 0 }}>
        <div className="wrap">
          <p className="eyebrow" style={{ marginBottom: 12 }}>
            Who it’s for
          </p>
          <h2 className="sectionTitle" style={{ maxWidth: 620 }}>
            One second. Three ways it pays.
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 20,
              marginTop: 40,
            }}
          >
            {AUDIENCES.map(({ icon: Icon, who, line, href }) => (
              <Link key={who} href={href} className="card card--hover" style={{ textDecoration: 'none' }}>
                <span className="icon-badge" style={{ marginBottom: 18 }}>
                  <Icon aria-hidden />
                </span>
                <h3 className="serif" style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>
                  {who}
                </h3>
                <p className="body" style={{ fontSize: 15.5, color: 'var(--muted)' }}>
                  {line}
                </p>
              </Link>
            ))}
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
            How dash. works.
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
              id="people"
              eyebrow="For people"
              heading="Watch. Wait. Earn."
              lead="Get rewarded for the moments you already spend waiting."
              points={PEOPLE_POINTS}
            />
            <TwoSide
              id="publishers"
              eyebrow="For publishers"
              heading="Your wait state is ad space."
              lead="Your tool thinks. Your user waits. That wait is worth money — and most of it goes to you."
              points={PUBLISHER_POINTS}
            />
            <TwoSide
              id="advertisers"
              eyebrow="For advertisers"
              heading="Own the space between click and result."
              lead="Run smarter campaigns. Reach high-intent NZ users in the one second they’re actually watching."
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
                The promise, in writing
              </h3>
              <p className="body" style={{ fontSize: 15.5 }}>
                The SDK sends us three things: your publisher ID, the screen type, a rough topic tag.
                That’s it. It can’t read prompts, content, code or files. It never sees a user. It
                never stores a raw IP. Privacy Act 2020 native — and assembl stands behind every line
                of it.
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
              <h2 className="sectionTitle">Sign up.</h2>
              <p className="body" style={{ marginTop: 16, fontSize: 16 }}>
                Are you a publisher with a tool that has a wait state, or a NZ brand that wants to
                reach people inside one? Pick one. We reply within two working days.
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
