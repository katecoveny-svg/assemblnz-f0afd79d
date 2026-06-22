import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Banknote,
  Heart,
  Landmark,
  Plane,
  ShoppingCart,
  Sprout,
  Zap,
} from 'lucide-react';
import '@/styles/dash-tokens.css';

export const metadata: Metadata = {
  title: 'dash– rewards — you choose where your wait goes',
  description:
    'Your dash– balance accrues while AI works, then you redeem it to a reward — Everyday Rewards, Airpoints, power-bill credit, KiwiSaver or charity. Never cash-per-wait. Cash is a later, gated tier.',
  alternates: { canonical: '/dash/rewards' },
};

// The reward ladder — non-cash rails lead (no card fees, AML-light), cash last + gated.
const LADDER = [
  {
    icon: Heart,
    name: 'Donate to charity',
    line: 'SPCA, Trees That Count, Foodbank NZ — your wait does good.',
    tag: 'Live',
  },
  {
    icon: Sprout,
    name: 'KiwiSaver / investing',
    line: 'Drip your earnings into your future (e.g. Sharesies).',
    tag: 'Live',
  },
  {
    icon: Plane,
    name: 'Airpoints',
    line: 'For Air NZ contexts — earn Airpoints Dollars as you wait.',
    tag: 'Live',
  },
  {
    icon: ShoppingCart,
    name: 'Everyday Rewards',
    line: 'Spend on groceries & fuel across Woolworths / BP.',
    tag: 'Next',
  },
  {
    icon: Zap,
    name: 'Power-bill credit',
    line: 'Money straight off your power bill, via power-company partners.',
    tag: 'Next',
  },
  {
    icon: Landmark,
    name: 'Bank perk',
    line: 'Fees or premiums reduced, via banking / insurance partners.',
    tag: 'Next',
  },
  {
    icon: Banknote,
    name: 'Cash',
    line: 'Withdraw once you pass a threshold. KYC at withdrawal; may be taxable.',
    tag: 'Coming soon',
  },
] as const;

const HOW = [
  {
    n: 1,
    title: 'It accrues',
    body: 'Every qualifying wait adds a few cents to your dash– balance, server-side. No money moves per wait — that keeps it honest and fee-free.',
  },
  {
    n: 2,
    title: 'You redeem at a threshold',
    body: 'Pick a destination from the ladder. Non-cash rewards (points, KiwiSaver, charity) route via partners with no card fees and, per NZ guidance, generally aren’t taxable.',
  },
  {
    n: 3,
    title: 'Cash is the top of the ladder',
    body: 'Cash unlocks only above a sensible minimum (NZ$10–20), batched, KYC at withdrawal. Cash may be taxable income — we’ll show a note.',
  },
] as const;

const FAQ = [
  {
    q: 'Is it really free?',
    a: 'Yes. You opt in, a single sponsored line shows while you’d be waiting anyway, and the value accrues to you. No purchase required.',
  },
  {
    q: 'Do I pay tax on it?',
    a: 'Points and non-cash rewards from activity generally aren’t taxable in NZ. Cash withdrawals may be — we show a note and link to the terms. Get your own advice if unsure.',
  },
  {
    q: 'What’s the minimum?',
    a: 'Non-cash rewards redeem from NZ$5. Cash (coming soon) unlocks higher, around NZ$10–20, batched.',
  },
  {
    q: 'How long until I see it?',
    a: 'Points and charity are the fast lane. Some partner rails settle in a weekly batch at first while integrations mature.',
  },
] as const;

export default function DashRewardsPage() {
  return (
    <main>
      <section className="section">
        <div className="wrap">
          <p className="eyebrow" style={{ marginBottom: 12 }}>
            Rewards
          </p>
          <h1 className="display" style={{ fontSize: 'clamp(2.6rem, 7vw, 4.6rem)', maxWidth: 720 }}>
            You choose where your{' '}
            <span style={{ background: 'linear-gradient(transparent 58%, var(--hivis) 58%)', padding: '0 0.08em' }}>
              wait
            </span>{' '}
            goes.
          </h1>
          <p className="lead" style={{ marginTop: 18, maxWidth: 620 }}>
            dash– pays you in rewards, not cash-per-wait. Your balance builds while AI works, then you
            send it wherever you like — give it away, grow it, or spend it.
          </p>
        </div>
      </section>

      {/* the ladder */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 18,
            }}
          >
            {LADDER.map(({ icon: Icon, name, line, tag }) => (
              <div key={name} className="card" style={{ padding: 24, position: 'relative' }}>
                <span
                  className="eyebrow"
                  style={{
                    position: 'absolute',
                    top: 18,
                    right: 18,
                    fontSize: 11,
                    color: tag === 'Live' ? 'var(--accent)' : 'var(--muted)',
                  }}
                >
                  {tag}
                </span>
                <span className="icon-badge" style={{ marginBottom: 16 }}>
                  <Icon aria-hidden />
                </span>
                <h2 className="serif" style={{ fontSize: 21, fontWeight: 600, marginBottom: 6 }}>
                  {name}
                </h2>
                <p className="body" style={{ fontSize: 15, color: 'var(--muted)' }}>
                  {line}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* honest payout explainer */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="howPanel" style={{ padding: 'clamp(28px, 5vw, 56px)' }}>
            <p className="eyebrow" style={{ marginBottom: 12 }}>
              How payout actually works
            </p>
            <h2 className="sectionTitle howTitle">Accrue. Then <em>redeem.</em></h2>
            <div className="steps">
              {HOW.map(({ n, title, body }) => (
                <div key={n} className="step">
                  <span className="stepNo">{n}</span>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </div>
              ))}
            </div>
            <p className="body" style={{ marginTop: 24, color: 'var(--muted)', maxWidth: 680 }}>
              Why not cash per wait? Card rails charge a fixed fee per transaction and need every
              recipient KYC-verified — paying a few cents per wait is impossible. So dash– is a
              ledger, not a payments firehose: it builds, you redeem.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <h2 className="sectionTitle" style={{ marginBottom: 28 }}>
            Questions, answered straight.
          </h2>
          <div style={{ display: 'grid', gap: 14, maxWidth: 760 }}>
            {FAQ.map(({ q, a }) => (
              <div key={q} className="card" style={{ padding: 22 }}>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>{q}</h3>
                <p className="body" style={{ color: 'var(--muted)' }}>
                  {a}
                </p>
              </div>
            ))}
          </div>
          <div className="heroCta" style={{ marginTop: 36 }}>
            <Link href="/dash/wallet" className="btn btn--primary btn--lg">
              See your wallet <ArrowRight aria-hidden />
            </Link>
            <Link href="/dash#waitlist" className="btn btn--ghost btn--lg">
              Join the waitlist
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
