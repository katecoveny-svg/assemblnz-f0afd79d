'use client';

import * as React from 'react';
import Link from 'next/link';
import { PatternBackdrop } from '@/components/pattern-studio/PatternBackdrop';
import {
  GENOME_SECTION_LABELS,
  type GenomeFact,
  type GenomeSection,
} from '@/lib/customers/auckland-dog-trainer/genome';
import { PublicGenomeDemo } from './PublicGenomeDemo';

const INK = '#313c42';
const MUTED = '#68766f';
const TEAL = '#3f7373';
const HAIRLINE = 'rgba(49, 60, 66, 0.12)';

const SECTION_ORDER = Object.keys(GENOME_SECTION_LABELS) as GenomeSection[];

/**
 * /genome — assembl's OWN Business Genome first (live from the database:
 * the facts this site, its ad studio and its operating loop actually read),
 * with the fictional sample-business sandbox one tap away for safe play.
 */
export function GenomeShowcase({
  assemblFacts,
  assemblLive,
  sampleFacts,
  sampleLive,
}: {
  assemblFacts: GenomeFact[];
  assemblLive: boolean;
  sampleFacts: GenomeFact[];
  sampleLive: boolean;
}) {
  const [view, setView] = React.useState<'assembl' | 'sample'>('assembl');

  if (view === 'sample') {
    return (
      <div>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            padding: '12px clamp(20px, 5vw, 40px)',
            borderBottom: `1px solid ${HAIRLINE}`,
            background: '#fbfaf6',
            fontFamily: 'var(--font-body), Inter, system-ui, sans-serif',
          }}
        >
          <p style={{ margin: 0, color: MUTED, fontSize: 13 }}>
            Sample business — details fictional. Edits stay in your session.
          </p>
          <button
            type="button"
            onClick={() => setView('assembl')}
            style={{
              border: 'none',
              background: 'transparent',
              color: TEAL,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            ← Back to assembl&rsquo;s genome
          </button>
        </div>
        <PublicGenomeDemo facts={sampleFacts} live={sampleLive} />
      </div>
    );
  }

  const bySection = SECTION_ORDER.map((section) => ({
    section,
    facts: assemblFacts.filter((f) => f.section === section && f.readBy.length > 0),
  })).filter((g) => g.facts.length > 0);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#fff',
        color: INK,
        fontFamily: 'var(--font-body), Inter, system-ui, sans-serif',
      }}
    >
      {/* Hero — few words, live proof. */}
      <section style={{ position: 'relative', overflow: 'hidden', borderBottom: `1px solid ${HAIRLINE}` }}>
        <PatternBackdrop
          className="absolute inset-0"
          mode="halftone"
          colorRole="accent"
          opacity={0.24}
          speed={0.5}
          lazyMount={false}
        />
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            margin: '0 auto',
            maxWidth: 1100,
            padding: '68px clamp(20px, 5vw, 40px) 56px',
          }}
        >
          <p style={{ margin: 0, color: '#8b7447', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
            assembl&rsquo;s own Business Genome
          </p>
          <h1
            style={{
              margin: '16px 0 0',
              maxWidth: 760,
              fontFamily: 'var(--font-display), Georgia, serif',
              fontSize: 'clamp(40px, 7vw, 76px)',
              fontWeight: 400,
              lineHeight: 0.96,
              letterSpacing: '-0.035em',
            }}
          >
            assembl runs on its own genome.
          </h1>
          <p style={{ margin: '20px 0 0', maxWidth: 540, color: MUTED, fontSize: 16, lineHeight: 1.65 }}>
            The facts below run this business — the website, the ad studio and the
            operating loop all read them. Your install works the same way.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginTop: 26 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '7px 14px',
                borderRadius: 999,
                border: `1px solid ${HAIRLINE}`,
                background: 'rgba(255,255,255,0.9)',
                color: TEAL,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              <span
                aria-hidden
                style={{ width: 8, height: 8, borderRadius: '50%', background: assemblLive ? '#3f7373' : '#b8964f' }}
              />
              {assemblLive ? 'live from the database' : 'static mirror'}
            </span>
            <span style={{ color: MUTED, fontSize: 13 }}>
              {assemblFacts.filter((f) => f.readBy.length > 0).length} owner-confirmed facts
            </span>
          </div>
        </div>
      </section>

      {/* The facts — grouped, scannable, no walls of text. */}
      <section style={{ margin: '0 auto', maxWidth: 1100, padding: '48px clamp(20px, 5vw, 40px) 24px' }}>
        <div style={{ display: 'grid', gap: 28 }}>
          {bySection.map(({ section, facts }) => (
            <div key={section}>
              <h2
                style={{
                  margin: 0,
                  color: MUTED,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                }}
              >
                {GENOME_SECTION_LABELS[section]}
              </h2>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: 14,
                  marginTop: 12,
                }}
              >
                {facts.map((fact) => (
                  <article
                    key={fact.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                      padding: '18px 20px',
                      border: `1px solid ${HAIRLINE}`,
                      borderRadius: 16,
                      background: '#fff',
                    }}
                  >
                    <p style={{ margin: 0, color: TEAL, fontSize: 12, fontWeight: 700 }}>{fact.label}</p>
                    <p style={{ margin: 0, color: INK, fontSize: 14, lineHeight: 1.55 }}>{fact.value}</p>
                    {fact.readBy.length > 0 && (
                      <p style={{ margin: 'auto 0 0', color: MUTED, fontSize: 11, lineHeight: 1.5 }}>
                        read by {fact.readBy.join(' · ')}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Two next steps — play with a sample, or see the OS screen. */}
      <section style={{ margin: '0 auto', maxWidth: 1100, padding: '28px clamp(20px, 5vw, 40px) 80px' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 14,
            borderTop: `1px solid ${HAIRLINE}`,
            paddingTop: 30,
          }}
        >
          <button
            type="button"
            onClick={() => setView('sample')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '14px 24px',
              borderRadius: 999,
              border: 'none',
              background: INK,
              color: '#fff',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Try it on a sample business →
          </button>
          <Link
            href="/os"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '14px 24px',
              borderRadius: 999,
              border: `1px solid ${HAIRLINE}`,
              color: INK,
              fontSize: 14,
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            See the OS on the sample business
          </Link>
          <Link href="/pilot-sprint" style={{ color: TEAL, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
            Install yours →
          </Link>
        </div>
      </section>
    </div>
  );
}
