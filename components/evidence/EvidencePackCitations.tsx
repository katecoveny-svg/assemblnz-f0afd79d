/**
 * EvidencePackCitations — renders the canonical Pou taunaki section.
 *
 * Citations are first-class objects (lib/evidence/pack-spec.ts).
 * Each cite has a numbered mark, a short reference (e.g. "Building Act
 * 2004 s 14B(1)(a)"), a one-line context, and a verifiable URL.
 * Print-friendly endnote format; in-screen mode we still render the
 * URL underneath rather than as an interactive hyperlink colour.
 */

import type { Citation } from '@/lib/evidence/pack-spec';

interface CitationsProps {
  citations: Citation[];
}

export function EvidencePackCitations({ citations }: CitationsProps) {
  if (!citations.length) return null;

  return (
    <section
      className="px-12 py-10"
      style={{
        fontFamily: "'Inter', system-ui, sans-serif",
        color: '#23211F',
        breakInside: 'avoid',
      }}
    >
      <header>
        <h2
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 300,
            fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
            letterSpacing: '-0.01em',
            lineHeight: 1.1,
            margin: 0,
          }}
        >
          Pou taunaki
        </h2>
        <p
          className="mt-1"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 400,
            fontSize: 'clamp(1.1rem, 2vw, 1.4rem)',
            color: '#5C5852',
          }}
        >
          Citations
        </p>
        <div
          className="mt-5 h-px"
          style={{ background: 'rgba(212, 168, 83, 0.45)' }}
        />
      </header>

      <ol className="mt-7 space-y-4 list-none">
        {citations.map((c) => (
          <li key={c.n} className="grid grid-cols-[2rem_1fr] gap-3">
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '0.7rem',
                color: '#2B6B57',
                fontWeight: 500,
                letterSpacing: '0.12em',
                paddingTop: '0.15rem',
              }}
            >
              {String(c.n).padStart(2, '0')}
            </span>
            <div>
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 500,
                  fontSize: '1.05rem',
                  color: '#23211F',
                  lineHeight: 1.4,
                  margin: 0,
                }}
              >
                {c.ref}
              </p>
              <p
                className="mt-1"
                style={{
                  fontSize: '0.85rem',
                  lineHeight: 1.55,
                  color: '#5C5852',
                }}
              >
                {c.context}
              </p>
              {c.url && (
                <p
                  className="mt-1"
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '0.62rem',
                    color: '#8E8A82',
                    letterSpacing: '0.08em',
                    wordBreak: 'break-all',
                  }}
                >
                  {c.url}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
