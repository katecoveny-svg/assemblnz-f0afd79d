import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'assembl — how it works',
  description:
    'assembl understands one workflow, prepares the repetitive work, and keeps a person in control.',
  alternates: { canonical: '/how-it-works' },
};

// Copy unchanged (Kate-approved simplified set from #915) — this rebuild is
// design only: the page moves off the warm v2/canvas tokens onto the pearl
// homepage look (white ground, ink display serif, teal/gold, pattern motion).
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

const INK = '#313c42';
const MUTED = '#68766f';
const TEAL = '#252d31';
const GOLD = '#737873';
const HAIRLINE = 'rgba(49, 60, 66, 0.12)';

export default function HowItWorksPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#fff',
        color: INK,
        fontFamily: 'var(--font-body), Inter, system-ui, sans-serif',
      }}
    >
      <section style={{ position: 'relative', overflow: 'hidden', borderBottom: `1px solid ${HAIRLINE}`, background: '#f0f0eb' }}>
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            margin: '0 auto',
            maxWidth: 1100,
            padding: '72px clamp(20px, 5vw, 40px) 64px',
          }}
        >
          <p style={{ margin: 0, color: '#8b7447', fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
            understand · prepare · approve
          </p>
          <h1
            style={{
              margin: '16px 0 0',
              fontFamily: 'var(--font-body), Inter, Arial, sans-serif',
              fontSize: 'clamp(44px, 6vw, 76px)',
              fontWeight: 620,
              lineHeight: 0.98,
              letterSpacing: '-0.035em',
              textTransform: 'uppercase',
            }}
          >
            how assembl works<span aria-hidden style={{ color: GOLD }}>.</span>
          </h1>
          <p style={{ margin: '22px 0 0', maxWidth: 520, color: MUTED, fontSize: 17, lineHeight: 1.65 }}>
            Start with one repetitive job. assembl prepares it using your business rules,
            and your team decides what happens next.
          </p>
        </div>
      </section>

      {/* The three steps. */}
      <section style={{ margin: '0 auto', maxWidth: 1100, padding: '56px clamp(20px, 5vw, 40px) 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
          {STEPS.map((step) => (
            <article
              key={step.n}
              style={{
                padding: '28px 26px',
                border: `1px solid ${HAIRLINE}`,
                borderRadius: 0,
                background: '#fafaf7',
              }}
            >
              <p style={{ margin: 0, color: TEAL, fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                {step.n} · {step.label}
              </p>
              <h2
                style={{
                  margin: '16px 0 0',
                  fontFamily: 'var(--font-display), Georgia, serif',
                  fontSize: 26,
                  fontWeight: 400,
                  lineHeight: 1.15,
                  letterSpacing: '-0.02em',
                }}
              >
                {step.title}
              </h2>
              <p style={{ margin: '14px 0 0', color: MUTED, fontSize: 15, lineHeight: 1.6 }}>{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Built in Aotearoa + CTA. */}
      <section style={{ margin: '0 auto', maxWidth: 1100, padding: '32px clamp(20px, 5vw, 40px) 72px' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 20,
            borderTop: `1px solid ${HAIRLINE}`,
            paddingTop: 36,
          }}
        >
          <p style={{ margin: 0, maxWidth: 480, color: MUTED, fontSize: 15, lineHeight: 1.6 }}>
            <span style={{ color: INK, fontWeight: 600 }}>Built in Aotearoa.</span> Start
            with the demo, then use a pilot to prove one workflow with your own rules.
          </p>
          <Link
            href="/genome"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '14px 24px',
              borderRadius: 999,
              background: INK,
              color: '#fff',
              fontSize: 14,
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            try the live demo <ArrowRight size={15} aria-hidden />
          </Link>
        </div>
      </section>
    </div>
  );
}
