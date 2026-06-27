import type { Metadata } from 'next';
import Link from 'next/link';
import { FillDogLoader } from '@/components/dash/FillDogLoader';
import { DashWaitlistForm } from './DashWaitlistForm';
import './birdie.css';

/**
 * /dash — the Birdie Direction marketing home.
 *
 * A faithful build of the design handoff ("Dash - Birdie Direction.dc.html"):
 * hero with the floaty dachshund + earning chip, the flagship "wait is the
 * canvas" fill-the-dog demo, three audience doors, the reward ladder, and the
 * big "Sit. Stay. Get paid." CTA. Chrome (marquee + nav + footer) lives in
 * layout.tsx. Motion/hover/responsive rules live in birdie.css.
 *
 * Palette is locked: white + canary (#FFD42A) + charcoal text (#3a3832).
 * No black, no green. See docs/dash-design-system.md.
 */

export const metadata: Metadata = {
  title: 'dash. by assembl — get paid for the wait',
  description:
    'While your AI agent works, Dash turns the wait into a reward you keep — charity at launch, with KiwiSaver, Airpoints and more rolling out as partners come on. Opt-in, NZ-built, Assembl-governed.',
  // Relative urls/images resolve against the dash layout metadataBase (www host).
  alternates: { canonical: '/dash' },
  openGraph: {
    title: 'dash — Get paid for the wait.',
    description: 'The reward layer for the agentic wait, by assembl.',
    type: 'website',
    siteName: 'dash. by assembl',
    url: '/dash',
    locale: 'en_NZ',
    images: [
      {
        url: '/images/dash/og-image.png',
        width: 1200,
        height: 630,
        alt: 'dash — Get paid for the wait.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'dash — Get paid for the wait.',
    description: 'The reward layer for the agentic wait, by assembl.',
    images: ['/images/dash/og-image.png'],
  },
};

const MASCOT = '/dash/mascot-dog.png';

export default function DashPage() {
  return (
    <div style={{ background: '#FFFFFF', color: '#3a3832' }}>
      {/* ---------------- HERO ---------------- */}
      <div
        className="bd-hero bd-section"
        style={{
          maxWidth: 1500,
          margin: '0 auto',
          padding: '64px 72px 116px',
          display: 'flex',
          gap: 40,
          alignItems: 'center',
        }}
      >
        {/* copy */}
        <div className="bd-hero-copy" style={{ flex: 'none', width: 392 }}>
          <div
            className="bd-mono"
            style={{
              fontSize: 12,
              letterSpacing: '.18em',
              textTransform: 'uppercase',
              color: '#c79b1f',
              marginBottom: 26,
            }}
          >
            A reward layer for the wait
          </div>
          <h1
            className="bd-hero-title"
            style={{
              margin: 0,
              fontWeight: 900,
              fontSize: 70,
              lineHeight: 0.92,
              letterSpacing: '-.04em',
              color: '#3a3832',
            }}
          >
            Get paid
            <br />
            to wait.
          </h1>
          <p
            style={{
              margin: '28px 0 36px',
              fontSize: 18,
              lineHeight: 1.62,
              color: '#56544b',
              maxWidth: 408,
            }}
          >
            Your app makes people wait while it works. Dash turns that wait into a reward they
            keep — charity at launch, with KiwiSaver, Airpoints and more rolling out as partners
            come on. One line of code to add. You keep 55%.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <Link
              href="#waitlist"
              className="bd-cta-primary"
              style={{
                background: '#FFD42A',
                color: '#3a3832',
                padding: '17px 32px',
                borderRadius: 99,
                fontWeight: 700,
                fontSize: 17,
                textDecoration: 'none',
                boxShadow: '0 8px 26px rgba(255,212,42,.5)',
              }}
            >
              Join the waitlist
            </Link>
            <Link
              href="#flagship"
              className="bd-textlink"
              style={{ fontSize: 15, fontWeight: 600, color: '#46443c' }}
            >
              See how it works →
            </Link>
          </div>
          <div style={{ marginTop: 46, display: 'flex', gap: 40 }}>
            <Stat value="1 line" label="to install" />
            <Stat value="55%" label="you keep" />
            <Stat value="NZ" label="data stays here" />
          </div>

          {/* Pre-launch waitlist capture — the one actionable thing on the page. */}
          <div style={{ marginTop: 40 }}>
            <DashWaitlistForm />
          </div>
        </div>

        {/* mascot stage */}
        <div
          style={{
            flex: 1,
            position: 'relative',
            minHeight: 520,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'visible',
          }}
        >
          <div
            className="bd-glow"
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 440,
              height: 440,
              borderRadius: '50%',
              transform: 'translate(-50%,-50%)',
              background:
                'radial-gradient(circle,rgba(255,212,42,.3),rgba(255,212,42,0) 62%)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '72%',
              width: 330,
              height: 80,
              borderRadius: '50%',
              transform: 'translateX(-50%)',
              background: 'radial-gradient(circle at 50% 36%,#FFFFFF,#F4EFE4 72%)',
              boxShadow: '0 26px 46px rgba(190,160,40,.12)',
            }}
          />
          <span
            className="bd-spark"
            style={{
              position: 'absolute',
              right: 46,
              top: 54,
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#FFD42A',
            }}
          />
          <span
            className="bd-spark--2"
            style={{
              position: 'absolute',
              right: 120,
              top: 24,
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: '#FFD42A',
            }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={MASCOT}
            alt="Dash — the dachshund mascot"
            className="bd-floaty"
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: 470,
              height: 'auto',
              filter: 'drop-shadow(0 28px 30px rgba(180,150,40,.22))',
            }}
          />

          {/* earning chip */}
          <div
            style={{
              position: 'absolute',
              left: 6,
              bottom: 30,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: '#fff',
              border: '1px solid #F0EBDD',
              padding: '11px 18px',
              borderRadius: 99,
              boxShadow: '0 12px 28px rgba(180,150,40,.16)',
            }}
          >
            <span className="bd-mono" style={{ fontSize: 12, color: '#9a988e' }}>
              earning
            </span>
            <span
              className="bd-mono bd-tick"
              style={{ fontSize: 13, fontWeight: 700, color: '#c0890d' }}
            >
              + $0.14
            </span>
          </div>
        </div>
      </div>

      {/* ---------------- FLAGSHIP: the wait is the canvas ---------------- */}
      <div
        id="flagship"
        className="bd-section"
        style={{ maxWidth: 1180, margin: '0 auto', padding: '40px 72px 130px', scrollMarginTop: 90 }}
      >
        <div className="bd-reveal" style={{ textAlign: 'center', marginBottom: 56 }}>
          <div
            className="bd-mono"
            style={{
              fontSize: 12,
              letterSpacing: '.18em',
              textTransform: 'uppercase',
              color: '#c79b1f',
              marginBottom: 14,
            }}
          >
            What people see
          </div>
          <h2
            className="bd-h2"
            style={{ margin: 0, fontWeight: 700, fontSize: 48, letterSpacing: '-.035em', color: '#3a3832' }}
          >
            A line, a loader, a payout.
          </h2>
          <p
            style={{
              margin: '18px auto 0',
              fontSize: 17,
              lineHeight: 1.6,
              color: '#56544b',
              maxWidth: 480,
            }}
          >
            Dash shows one sponsored line and a loader under your agent&apos;s status. The longer it
            runs, the more they bank. When it finishes, they see exactly what they earned.
          </p>
        </div>

        <div
          className="bd-demo-card bd-reveal"
          style={{
            maxWidth: 700,
            margin: '0 auto',
            background: '#fff',
            border: '1px solid #EFEADC',
            borderRadius: 26,
            padding: '24px 34px 24px 18px',
            boxShadow: '0 26px 64px rgba(180,150,40,.12)',
            display: 'flex',
            gap: 18,
            alignItems: 'center',
          }}
        >
          {/* fill-the-dog — the dachshund IS the loader. Routed through the
              shared FillDogLoader component (the working dog-as-loading-bar from
              the loader build) rather than re-inlining the mascot twice here. */}
          <div className="bd-demo-dog bd-floaty--demo" style={{ flex: 'none', width: 288 }}>
            <FillDogLoader />
          </div>

          {/* status */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 8 }}>
              <div
                className="bd-dot"
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: '50%',
                  background: '#FFD42A',
                  boxShadow: '0 0 0 4px rgba(255,212,42,.22)',
                }}
              />
              <div style={{ fontWeight: 700, fontSize: 17, color: '#3a3832' }}>
                Your agent is working
              </div>
            </div>
            <div className="bd-mono" style={{ fontSize: 12, color: '#9a988e', marginBottom: 20 }}>
              step 4 of 6 · ETA 4 min · value banking in his belly
            </div>
            <div
              style={{
                borderTop: '1px solid #EFEADC',
                paddingTop: 16,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 14,
              }}
            >
              <div style={{ textAlign: 'left' }}>
                <div
                  className="bd-mono"
                  style={{
                    fontSize: 10,
                    letterSpacing: '.14em',
                    textTransform: 'uppercase',
                    color: '#bdb592',
                    marginBottom: 5,
                  }}
                >
                  sponsored · while you wait
                </div>
                <div style={{ fontSize: 13, color: '#56544b' }}>
                  Whittaker&apos;s — a little something for the wait.
                </div>
              </div>
              <div
                className="bd-mono bd-countpop"
                style={{
                  flex: 'none',
                  background: '#FFD42A',
                  color: '#3a3832',
                  fontWeight: 700,
                  fontSize: 13,
                  padding: '8px 15px',
                  borderRadius: 99,
                  boxShadow: '0 6px 18px rgba(255,212,42,.45)',
                }}
              >
                + $0.14
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- AUDIENCE DOORS ---------------- */}
      <div className="bd-section" style={{ maxWidth: 1300, margin: '0 auto', padding: '0 72px 130px' }}>
        <div className="bd-reveal" style={{ textAlign: 'center', marginBottom: 56 }}>
          <div
            className="bd-mono"
            style={{
              fontSize: 12,
              letterSpacing: '.18em',
              textTransform: 'uppercase',
              color: '#c79b1f',
              marginBottom: 14,
            }}
          >
            Three ways in
          </div>
          <h2
            className="bd-h2"
            style={{ margin: 0, fontWeight: 700, fontSize: 48, letterSpacing: '-.035em', color: '#3a3832' }}
          >
            One wait. Everyone wins.
          </h2>
        </div>
        <div
          className="bd-doors bd-reveal"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}
        >
          {/* AI builders — canary */}
          <Link
            href="/dash/for-ai-builders"
            className="bd-door"
            style={{
              background: '#FFD42A',
              borderRadius: 28,
              padding: 34,
              minHeight: 240,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              textDecoration: 'none',
            }}
          >
            <div className="bd-mono" style={{ fontSize: 12, color: '#7a6b00' }}>
              01 / AI builders
            </div>
            <div>
              <div
                style={{ fontWeight: 700, fontSize: 25, color: '#3a3832', marginBottom: 10, lineHeight: 1.05 }}
              >
                Add a reward layer in one line.
              </div>
              <div className="bd-mono" style={{ fontSize: 14, color: '#5a5208' }}>
                dash.show()
              </div>
            </div>
          </Link>

          {/* Hosts — white */}
          <div
            className="bd-door"
            style={{
              background: '#fff',
              border: '1px solid #EFEADC',
              borderRadius: 28,
              padding: 34,
              minHeight: 240,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div className="bd-mono" style={{ fontSize: 12, color: '#bdb592' }}>
              02 / Hosts
            </div>
            <div>
              <div
                style={{ fontWeight: 700, fontSize: 25, color: '#3a3832', marginBottom: 10, lineHeight: 1.05 }}
              >
                Make your loading screen pay.
              </div>
              <div style={{ fontSize: 14, color: '#6a675c' }}>
                Keep a revenue share. White-label ready.
              </div>
            </div>
          </div>

          {/* Advertisers — white */}
          <div
            className="bd-door"
            style={{
              background: '#fff',
              border: '1px solid #EFEADC',
              borderRadius: 28,
              padding: 34,
              minHeight: 240,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div className="bd-mono" style={{ fontSize: 12, color: '#bdb592' }}>
              03 / Advertisers
            </div>
            <div>
              <div
                style={{ fontWeight: 700, fontSize: 25, color: '#3a3832', marginBottom: 10, lineHeight: 1.05 }}
              >
                Buy NZ&apos;s most-viewed five seconds.
              </div>
              <div style={{ fontSize: 14, color: '#6a675c' }}>
                One sponsor per slot. Brand-safe, opt-in.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- REWARD LADDER ---------------- */}
      <div
        id="rewards"
        className="bd-section"
        style={{ maxWidth: 1300, margin: '0 auto', padding: '0 72px 130px', textAlign: 'center', scrollMarginTop: 90 }}
      >
        <h2
          className="bd-h2 bd-reveal"
          style={{
            margin: '0 0 14px',
            fontWeight: 700,
            fontSize: 48,
            letterSpacing: '-.035em',
            color: '#3a3832',
          }}
        >
          Pick where the money goes.
        </h2>
        <p style={{ margin: '0 0 32px', fontSize: 17, color: '#56544b' }}>
          One tap to choose. Switch any time.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
          {/* Charity is the live default at launch (SPCA NZ). */}
          <span
            style={{
              background: '#FFD42A',
              borderRadius: 99,
              padding: '15px 28px',
              fontWeight: 700,
              fontSize: 15,
              color: '#3a3832',
            }}
          >
            Charity · live
          </span>
          {/* Every other rail is an unsigned partner integration — labelled
              "planned" so we never present a third-party reward (KiwiSaver,
              Airpoints, etc.) as already available. Fair Trading Act 1986. */}
          {['KiwiSaver', 'Airpoints', 'Everyday Rewards', 'Power bill', 'Cash'].map((r) => (
            <span
              key={r}
              className="bd-chip"
              style={{
                background: '#fff',
                border: '1.5px dashed #D6CEB8',
                borderRadius: 99,
                padding: '15px 28px',
                fontWeight: 700,
                fontSize: 15,
                color: '#a89f80',
              }}
            >
              {r} · planned
            </span>
          ))}
        </div>
        <p style={{ margin: '28px auto 0', maxWidth: 560, fontSize: 14.5, lineHeight: 1.6, color: '#8a887e' }}>
          Charity payouts live at launch. Cash and rewards roll out as partner integrations land —
          each one subject to partner availability.
        </p>
      </div>

      {/* ---------------- BIG CTA ---------------- */}
      <div className="bd-section" style={{ maxWidth: 1300, margin: '0 auto', padding: '0 72px 130px' }}>
        <div
          className="bd-reveal"
          style={{
            position: 'relative',
            background: 'radial-gradient(120% 150% at 50% -10%,#FFE27A,#FFD42A)',
            borderRadius: 40,
            padding: 18,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'repeating-linear-gradient(90deg,rgba(58,56,50,.05) 0 24px,transparent 24px 42px)',
            }}
          />
          <div
            className="bd-cta-inner"
            style={{
              position: 'relative',
              background: 'rgba(255,255,255,.5)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,.7)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,.9),0 30px 70px rgba(180,150,40,.28)',
              borderRadius: 30,
              padding: '78px 56px',
              textAlign: 'center',
            }}
          >
            <h2
              className="bd-cta-h2"
              style={{
                margin: '0 0 14px',
                fontWeight: 700,
                fontSize: 62,
                letterSpacing: '-.04em',
                color: '#3a3832',
              }}
            >
              Sit. Stay. Get paid.
            </h2>
            <p
              className="bd-mono"
              style={{ margin: '0 0 36px', fontSize: 13, letterSpacing: '.06em', color: '#7a6b1f' }}
            >
              OPT-IN · NZ-BUILT · ASSEMBL-GOVERNED
            </p>
            <Link
              href="#waitlist"
              className="bd-cta-dark"
              style={{
                background: '#3a3832',
                color: '#FFD42A',
                padding: '18px 38px',
                borderRadius: 99,
                fontWeight: 700,
                fontSize: 18,
                display: 'inline-block',
                textDecoration: 'none',
                boxShadow: '0 12px 30px rgba(58,56,50,.3)',
              }}
            >
              Join the waitlist →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: 24, color: '#3a3832' }}>{value}</div>
      <div style={{ fontSize: 13, color: '#8a887e' }}>{label}</div>
    </div>
  );
}
