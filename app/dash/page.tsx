import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Bot, Check, Code2, Coins, ShieldCheck, Sparkles } from 'lucide-react';
import '@/styles/dash-tokens.css';
import { DashLeadForm } from '@/components/site/dash/DashLeadForm';
import { ShaderHeroBackdrop } from '@/components/site/ShaderHeroBackdrop';
import { Sparkles as SparkleLayer } from '@/components/site/Sparkles';
import { DashLoaderLiveDemo } from '@/components/dash/DashLoaderLiveDemo';
import { GlossyMascotHero } from '@/components/dash/GlossyMascotHero';
import { Marquee } from '@/components/dash/Marquee';
import { PhoneMock } from '@/components/dash/PhoneMock';
import { StickyCta } from '@/components/dash/StickyCta';
import { dashFontVars } from './fonts';

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
    icon: Bot,
    who: 'For AI builders',
    line: 'Your agent makes people wait while it works. Add a reward layer to that wait in one line — opt-in, NZ-built.',
    href: '/dash/for-ai-builders',
  },
  {
    icon: Coins,
    who: 'For people',
    line: 'Get rewarded while your AI agent works. Airpoints, KiwiSaver top-ups or charity for time you’d wait anyway.',
    href: '#people',
  },
  {
    icon: Code2,
    who: 'For publishers',
    line: 'Every wait state is inventory — agent runs, search, checkout. Keep 55% of what it earns, in two lines of code.',
    href: '#publishers',
  },
  {
    icon: Sparkles,
    who: 'For advertisers',
    line: 'Own the space between click and result. Reach NZ users while they watch their agent work.',
    href: '#advertisers',
  },
] as const;

const PEOPLE_POINTS = [
  'One line of text while your tool loads — that’s the whole ad.',
  'Airpoints, KiwiSaver top-ups or a donation to charity — for waits you’d sit through regardless.',
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

export default function DashPage() {
  return (
    <main>
      <Marquee />

      {/* ---------- HERO ---------- */}
      <section className="hero">
        {/* bright cream/sage flowing-gradient (no gold) + drifting sparkle */}
        <ShaderHeroBackdrop variant="airy" />
        <SparkleLayer className="z-0" />
        <div className="wrap" style={{ position: 'relative', zIndex: 1 }}>
          <div className="heroStage" style={{ padding: '56px 0 72px' }}>
            <div className="heroCopy">
              <span className="launchPill">
                <span className="ping" aria-hidden />
                Now onboarding founding NZ publishers
              </span>
              <p className="eyebrow heroEyebrow">The reward layer for the wait AI creates. NZ-built.</p>
              <h1 className="heroTitle">
                <span className="l">Get paid</span>
                <span className="l">
                  to <span className="em">wait.</span>
                </span>
              </h1>
              <p className="heroSub">
                When your AI agent is working — step 4 of 6, ETA 4 min — dash– turns that wait into a
                reward the person actually gets. Airpoints, KiwiSaver or charity. Opt-in, and the
                publisher keeps 55%.
              </p>
              <ul className="heroBullets">
                <li>Two lines of SDK — drops onto the wait you already show</li>
                <li>Rewards, not cash — Airpoints, KiwiSaver, charity</li>
                <li>Private by design — no prompts, content or files read</li>
              </ul>
              <div className="heroCta">
                <Link href="#waitlist" className="btn btn--primary btn--lg">
                  Join the waitlist
                  <ArrowRight aria-hidden />
                </Link>
                <Link href="/dash/for-ai-builders" className="btn btn--ghost btn--lg">
                  For AI builders
                </Link>
              </div>
              <span className="heroProof">
                ★ 4.9/5 — paid out to KiwiSaver, Airpoints &amp; charity
              </span>
            </div>

            <div className="dogWrap">
              <GlossyMascotHero />
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
            One wait. Four ways it pays.
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

      <div className="wrap"><hr className="dash-rule" aria-hidden /></div>

      {/* ---------- HOW IT WORKS — brand kit's numbered "Watch. Wait. Earn." ---------- */}
      <section className="section" id="how">
        <div className="wrap">
          <div className="howPanel">
            <p className="eyebrow" style={{ marginBottom: 12 }}>
              How it works
            </p>
            <h2 className="sectionTitle howTitle">
              Watch. Wait. <em>Earn.</em>
            </h2>
            <div className="steps">
              {STEPS.map(({ title, body }, i) => (
                <div key={title} className="step">
                  <span className="stepNo">{i + 1}</span>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- SEE IT LIVE — the real consumer-mode loader, working ---------- */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div style={{ display: 'grid', gap: 40, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', alignItems: 'center' }}>
            <div>
              <p className="eyebrow" style={{ marginBottom: 12 }}>
                See it live
              </p>
              <h2 className="sectionTitle" style={{ maxWidth: 520 }}>
                This is the wait, working.
              </h2>
              <p className="body" style={{ marginTop: 16, maxWidth: 460, fontSize: 17 }}>
                A real NZ-brand line runs while the tool loads — labelled, private, and earning. Here
                it’s donating every cent to SPCA NZ.
              </p>
            </div>
            {/* The loader uses the [data-dash] token scope + its own font vars. */}
            <div data-dash="" className={dashFontVars} style={{ display: 'grid', placeItems: 'center' }}>
              <DashLoaderLiveDemo />
            </div>
          </div>
        </div>
      </section>

      {/* ---------- IN THE APPS YOU ALREADY OPEN ---------- */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <p className="eyebrow" style={{ marginBottom: 12 }}>
            Inside the NZ tools you already open
          </p>
          <h2 className="sectionTitle" style={{ maxWidth: 560, marginBottom: 36 }}>
            No new app. It runs in the wait.
          </h2>
          <div
            style={{
              display: 'grid',
              gap: 28,
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              justifyItems: 'center',
            }}
          >
            <PhoneMock
              hostName="an AI agent"
              adLine="Air New Zealand Business — fly the main centres for less."
              rewardText="+$0.04 → Airpoints"
              fillPct={64}
            />
            <PhoneMock
              hostName="a quote engine"
              adLine="Mitre 10 — winter project sorted, in-store now."
              rewardText="+$0.03 → KiwiSaver"
              fillPct={38}
            />
            <PhoneMock
              hostName="a search tool"
              adLine="Kathmandu — gear up for the long weekend."
              rewardText="+$0.05 → SPCA NZ"
              fillPct={82}
            />
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

      {/* ---------- CLOSING CTA — the conversion push ---------- */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="ctaBand">
            <span className="ctaGlow" aria-hidden />
            <p className="eyebrow" style={{ color: 'var(--gold)', marginBottom: 14 }}>
              Founding spots · NZ launch
            </p>
            <h2 className="ctaTitle">
              The wait is already happening.
              <br />
              <em>Start earning from it.</em>
            </h2>
            <p className="ctaSub">
              First three publishers keep <strong>60% for life</strong>. Two lines of code, live
              before your next release.
            </p>
            <div className="ctaActions">
              <Link href="#waitlist" className="btn btn--primary btn--lg">
                Join the waitlist
                <ArrowRight aria-hidden />
              </Link>
              <Link href="#how" className="btn btn--ghost btn--lg">
                See how it works
              </Link>
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
      <StickyCta />
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
