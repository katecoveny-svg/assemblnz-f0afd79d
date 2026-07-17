import type { Metadata } from 'next';
import Link from 'next/link';
import { palette, typography } from '@assembl/canvas/tokens';
import { MicroLabel } from '@assembl/canvas';
import { HeroArt } from '@/components/v2/HeroArt';
import styles from '@/components/v2/v2.module.css';

export const metadata: Metadata = {
  title: 'assembl — how it works',
  description:
    'assembl understands one workflow, prepares the repetitive work, and keeps a person in control.',
  alternates: { canonical: '/how-it-works' },
};

const STEPS = [
  {
    n: '01',
    label: 'understand',
    title: 'we learn one workflow.',
    body: 'We capture the facts, rules, people and tools behind one repetitive piece of work.',
  },
  {
    n: '02',
    label: 'prepare',
    title: 'agents prepare the work.',
    body: 'Replies, follow-ups, briefs and documents arrive as drafts using the same approved facts.',
  },
  {
    n: '03',
    label: 'approve',
    title: 'your team stays in control.',
    body: 'A person reviews important work before anything is sent, published, booked or charged.',
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
            <MicroLabel>understand · prepare · approve</MicroLabel>
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
            Start with one repetitive job. assembl prepares it using your business rules,
            and your team decides what happens next.
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
            <span style={{ color: palette.ink, fontWeight: 600 }}>Built in Aotearoa.</span> Start
            with the demo, then use a pilot to prove one workflow with your own rules.
          </p>
          <Link href="/genome" className={styles.navCta} style={{ padding: '11px 22px' }}>
            try the live demo
            <span aria-hidden style={{ color: palette.accentGold, fontSize: 15, lineHeight: 1 }}>
              •
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
