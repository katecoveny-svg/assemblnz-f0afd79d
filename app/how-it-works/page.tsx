import type { Metadata } from 'next';
import Link from 'next/link';
import { palette, typography } from '@assembl/canvas/tokens';
import { MicroLabel } from '@assembl/canvas';
import { HeroArt } from '@/components/v2/HeroArt';
import styles from '@/components/v2/v2.module.css';

export const metadata: Metadata = {
  title: 'assembl — how it works',
  description:
    'install a living site — website, crm, bookings, knowledge, and agents on one source of truth. agents draft the work inside it, a person signs off, and the proof shows the journey.',
  alternates: { canonical: '/how-it-works' },
};

const STEPS = [
  {
    n: '01',
    label: 'read signals',
    title: 'agents draft it.',
    body: 'bring a job your team does by hand — an rfi, an allergen report, a customs entry. the agent for that work writes the first draft in seconds, citing the current rules for your industry.',
  },
  {
    n: '02',
    label: 'route work',
    title: 'you review and sign off.',
    body: 'the draft lands with a named person who accepts, edits, or rejects it. nothing sends, publishes, or gets lodged without that sign-off.',
  },
  {
    n: '03',
    label: 'move to proof',
    title: 'you get the evidence pack.',
    body: 'every signed output carries its receipt: the sources used, what changed in review, and who approved it. one file, dated and filed, ready when someone asks.',
  },
] as const;

export default function HowItWorksPage() {
  const body: React.CSSProperties = {
    fontFamily: typography.body.fontFamily,
    fontSize: 15,
    lineHeight: typography.body.lineHeight,
    color: palette.bodyGrey,
  };

  return (
    <div className={styles.page}>
      {/* ── hero — paper white + the signed-off particulate landscape ── */}
      <section className={styles.hero}>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 640 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span aria-hidden style={{ color: palette.accentGold, fontSize: 12, lineHeight: 1 }}>
              •
            </span>
            <MicroLabel>install · run · improve every morning</MicroLabel>
          </div>
          <h1
            className={styles.h1}
            style={{ marginTop: 22, fontSize: 'clamp(2.2rem, 4vw, 3.6rem)' }}
          >
            how assembl works
            <span aria-hidden style={{ color: palette.accentGold }}>
              .
            </span>
          </h1>
          <p style={{ ...body, marginTop: 24, maxWidth: 420 }}>
            You install a Living Site — one source of truth running your website, CRM,
            bookings, and agents. The agents draft the work inside it, a person signs it
            off, and the proof shows the journey.
          </p>
        </div>
        <div className={styles.heroArt}>
          <HeroArt seed={20260702} />
        </div>
      </section>

      {/* ── the three steps ──────────────────────────────────────────── */}
      <section className={styles.section} style={{ paddingTop: 24 }}>
        <div className={styles.inner}>
          <div className={styles.cardGrid}>
            {STEPS.map((step) => (
              <article key={step.n} className={`${styles.cardLink} rise`}>
                <div
                  style={{
                    height: '100%',
                    padding: '26px 24px',
                    background: '#fff',
                    border: `1px solid ${palette.hairline}`,
                    borderRadius: 14,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      aria-hidden
                      style={{ color: palette.accentGold, fontSize: 11, lineHeight: 1 }}
                    >
                      •
                    </span>
                    <MicroLabel>
                      {step.n} · {step.label}
                    </MicroLabel>
                  </div>
                  <h2
                    className={styles.h1}
                    style={{ marginTop: 16, fontSize: '1.6rem', lineHeight: 1.15 }}
                  >
                    {step.title}
                  </h2>
                  <p style={{ ...body, marginTop: 14 }}>{step.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── the four-line brand story ────────────────────────────────── */}
      <section className={styles.section} style={{ paddingTop: 28, paddingBottom: 28 }}>
        <div className={`${styles.inner} rise`} style={{ textAlign: 'center' }}>
          <div
            className={styles.h1}
            style={{
              fontSize: 'clamp(1.35rem, 2.6vw, 2rem)',
              lineHeight: 1.55,
              fontWeight: 400,
            }}
          >
            the user sets the destination.
            <br />
            the agents read the signals.
            <br />
            the system finds a path.
            <br />
            the proof — receipts and mana — show the journey
            <span aria-hidden style={{ color: palette.accentGold }}>
              .
            </span>
          </div>
        </div>
      </section>

      {/* ── built for nz + cta ───────────────────────────────────────── */}
      <section className={styles.section} style={{ paddingTop: 8, paddingBottom: 56 }}>
        <div
          className={`${styles.inner} rise`}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 20,
            borderTop: `1px solid ${palette.hairline}`,
            paddingTop: 36,
          }}
        >
          <p style={{ ...body, maxWidth: 480 }}>
            <span style={{ color: palette.ink, fontWeight: 600 }}>Built in Aotearoa.</span> Agents
            cite current NZ legislation, council and sector rules from the start.
          </p>
          <Link href="/agents" className={styles.navCta} style={{ padding: '11px 22px' }}>
            explore marketplace
            <span aria-hidden style={{ color: palette.accentGold, fontSize: 15, lineHeight: 1 }}>
              •
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
