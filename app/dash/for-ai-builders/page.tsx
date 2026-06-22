import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import '@/styles/dash-tokens.css';
import { AgentWorkingHero } from '@/components/dash/AgentWorkingHero';
import { CodeSnippet } from '@/components/dash/CodeSnippet';
import { StatCallout } from '@/components/dash/StatCallout';

export const metadata: Metadata = {
  title: 'dash– for AI builders — add a reward layer to your agent in one line',
  description:
    'Your AI agent makes people wait while it works. dash– turns that wait into a reward your users actually get — Airpoints, KiwiSaver, charity. Opt-in, white-label, NZ-built, Assembl-governed.',
  alternates: { canonical: '/dash/for-ai-builders' },
};

const INSTALL = `import { dash } from '@assembl/dash-sdk';

dash.init({ publisherId: 'your-agent' });

// when your agent starts a long task:
const ad = await dash.show({ surface: 'agent_working' });`;

const ENABLERS = [
  {
    tier: 'Host #0',
    name: 'Assembl’s own agents',
    line: 'Every “agent is working” screen on Iho / HAPAI is a Dash surface we control. We prove the loop here first — no cold start.',
  },
  {
    tier: 'Tier 1 — enablers',
    name: 'Ambit, Datacom',
    line: 'One integration with an enabler inherits all their downstream agent waits — Warehouse, Vector, Tower, One NZ. Highest leverage.',
  },
  {
    tier: 'Tier 2 — big surfaces',
    name: 'Xero (JAX), Yabble, Ideally',
    line: 'Genuine multi-minute generative waits, large audiences. Land one, then open the self-serve SDK to the long tail.',
  },
] as const;

export default function DashForAiBuildersPage() {
  return (
    <main>
      {/* HERO */}
      <section className="section">
        <div className="wrap">
          <div
            style={{
              display: 'grid',
              gap: 40,
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              alignItems: 'center',
            }}
          >
            <div>
              <p className="eyebrow" style={{ marginBottom: 12 }}>
                For AI builders
              </p>
              <h1 className="display" style={{ fontSize: 'clamp(2.6rem, 7vw, 4.6rem)' }}>
                Reward the time your{' '}
                <span style={{ background: 'linear-gradient(transparent 58%, var(--hivis) 58%)', padding: '0 0.08em' }}>
                  agent
                </span>{' '}
                spends working.
              </h1>
              <p className="lead" style={{ marginTop: 18, maxWidth: 540 }}>
                Your agent makes people wait while it runs. dash– turns that wait into a reward they
                actually get — Airpoints, KiwiSaver, charity — in one line. Opt-in, white-label,
                Assembl-governed.
              </p>
              <div className="heroCta" style={{ marginTop: 28 }}>
                <Link href="/dash#waitlist" className="btn btn--primary btn--lg">
                  Add it to your agent <ArrowRight aria-hidden />
                </Link>
                <Link href="/dash/rewards" className="btn btn--ghost btn--lg">
                  See the rewards
                </Link>
              </div>
            </div>
            <div style={{ display: 'grid', placeItems: 'center' }}>
              <AgentWorkingHero />
            </div>
          </div>
        </div>
      </section>

      {/* ONE LINE */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div
            style={{
              display: 'grid',
              gap: 36,
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              alignItems: 'center',
            }}
          >
            <div>
              <p className="eyebrow" style={{ marginBottom: 12 }}>
                Two lines, not a project
              </p>
              <h2 className="sectionTitle" style={{ maxWidth: 460 }}>
                Drop it on your “working” state.
              </h2>
              <p className="body" style={{ marginTop: 14, color: 'var(--muted)', maxWidth: 460 }}>
                Point Dash at the screen you already show while the agent runs. It returns one
                sponsored line + a reward chip, credits the user for genuine view time, and never
                reads prompts, content, files or code.
              </p>
            </div>
            <CodeSnippet code={INSTALL} label="dash.show() — agent_working" />
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div
            style={{
              display: 'grid',
              gap: 16,
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            }}
          >
            <StatCallout value="55%" label="Publishers keep" dark />
            <StatCallout value="2" label="Lines of code" />
            <StatCallout value="0" label="Prompts / files read" />
          </div>
        </div>
      </section>

      {/* WHITE-LABEL */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <p className="eyebrow" style={{ marginBottom: 12 }}>
            White-label, first-class
          </p>
          <h2 className="sectionTitle" style={{ maxWidth: 560, marginBottom: 18 }}>
            Your agents. Your logo. Our reward layer.
          </h2>
          <p className="body" style={{ maxWidth: 560, color: 'var(--muted)', fontSize: 17 }}>
            Run dash– in your own UI and wordmark — the wait still pays your users, and you ship a
            reward feature without building one. One integration, opt-in, NZ-built, Assembl-governed.
          </p>
        </div>
      </section>

      {/* ENABLER SEQUENCE */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <p className="eyebrow" style={{ marginBottom: 12 }}>
            How we roll out
          </p>
          <h2 className="sectionTitle" style={{ maxWidth: 560, marginBottom: 28 }}>
            One integration, many waits.
          </h2>
          <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
            {ENABLERS.map(({ tier, name, line }) => (
              <div key={name} className="card" style={{ padding: 24 }}>
                <span
                  className="eyebrow"
                  style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 10 }}
                >
                  {tier}
                </span>
                <h3 className="serif" style={{ fontSize: 21, fontWeight: 600, marginBottom: 8 }}>
                  {name}
                </h3>
                <p className="body" style={{ fontSize: 15, color: 'var(--muted)' }}>
                  {line}
                </p>
              </div>
            ))}
          </div>
          <div className="heroCta" style={{ marginTop: 36 }}>
            <Link href="/dash#waitlist" className="btn btn--primary btn--lg">
              Join the waitlist <ArrowRight aria-hidden />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
