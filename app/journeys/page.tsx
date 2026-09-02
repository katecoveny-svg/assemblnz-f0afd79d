import type { Metadata } from 'next';
import Link from 'next/link';
import { InMemoryJourneyRepository } from '@/lib/journey/repository';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Agentic customer journeys · assembl',
  description:
    'assembl creates agentic customer journeys that understand what people need, complete the work around them and prove the experience is improving.',
  robots: { index: false, follow: false },
};

export default async function JourneysIndex() {
  // List every seed journey regardless of tenant for the concept surface.
  const repo = new InMemoryJourneyRepository();
  const journeys = await repo.listJourneys('everyday-assembled');

  return (
    <main
      style={{
        minHeight: '100dvh',
        background: '#fff',
        color: 'var(--a-text, #252d31)',
        fontFamily: 'var(--font-body, system-ui, sans-serif)',
        padding: 'clamp(2rem, 6vw, 5rem) clamp(1rem, 5vw, 2rem)',
      }}
    >
      <div style={{ maxWidth: 780, margin: '0 auto' }}>
        <p
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.75rem',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--a-accent, #3f7373)',
            margin: '0 0 0.75rem',
          }}
        >
          assembl · agentic customer journeys
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-display, Georgia, serif)',
            fontSize: 'clamp(2rem, 5vw, 3.2rem)',
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            margin: '0 0 1rem',
          }}
        >
          Find the friction. Assemble the journey. Prove the result.
        </h1>
        <p style={{ fontSize: '1.05rem', lineHeight: 1.6, color: 'var(--a-text-dim, #556)', maxWidth: '58ch' }}>
          One reusable journey object powers the composer, the runtime, the customer interface and
          the Proof dashboard. Below is the first reference journey — the same architecture carries
          to energy, airlines, trades and more.
        </p>

        <div style={{ display: 'grid', gap: '1rem', marginTop: '2.5rem' }}>
          {journeys.map((j) => (
            <Link
              key={j.id}
              href={`/journeys/${j.id}`}
              style={{
                display: 'block',
                border: '1px solid rgba(49,60,66,0.12)',
                borderRadius: 20,
                padding: '1.5rem 1.75rem',
                textDecoration: 'none',
                color: 'inherit',
                background: 'linear-gradient(180deg, #fff, #f7f9f8)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <h2
                  style={{
                    fontFamily: 'var(--font-display, Georgia, serif)',
                    fontSize: '1.5rem',
                    margin: 0,
                  }}
                >
                  {j.name}
                </h2>
                <span
                  style={{
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '0.75rem',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: 'var(--a-gold, #b8964f)',
                    alignSelf: 'center',
                  }}
                >
                  {j.status}
                </span>
              </div>
              <p style={{ margin: '0.6rem 0 0', color: 'var(--a-text-dim, #556)', lineHeight: 1.55 }}>
                {j.description}
              </p>
            </Link>
          ))}
        </div>

        <p
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.75rem',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--a-text-faint, #889)',
            marginTop: '3rem',
          }}
        >
          sample journeys — details fictional · everything simulated
        </p>
      </div>
    </main>
  );
}
