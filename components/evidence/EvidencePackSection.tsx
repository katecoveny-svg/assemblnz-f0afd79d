/**
 * EvidencePackSection — renders one canonical section of an evidence pack.
 * Spec: voyage-evidence-craft.md §3 + lib/evidence/pack-spec.ts
 *
 * Body is a typed `Block[]` so we never accept free HTML. Every block
 * kind has a deterministic render that respects the seven invariants:
 * cream paper, charcoal ink (#23211F), Cormorant for display, Inter for
 * body, IBM Plex Mono for metadata, te reo Māori equal weight to en.
 */

import type { Section, Block } from '@/lib/evidence/pack-spec';

interface SectionProps {
  section: Section;
  index: number;
}

export function EvidencePackSection({ section, index }: SectionProps) {
  const sectionNumber = String(index + 1).padStart(2, '0');

  return (
    <section
      data-section-id={section.id}
      className="relative px-12 py-10"
      style={{
        fontFamily: "'Inter', system-ui, sans-serif",
        color: '#23211F',
        breakInside: 'avoid',
      }}
    >
      {/* Section header — number hangs into the outer margin */}
      <header className="relative">
        <span
          aria-hidden
          className="absolute -left-10 top-2"
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '0.75rem',
            color: '#8E8A82',
            letterSpacing: '0.18em',
          }}
        >
          {sectionNumber}
        </span>
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
          {section.title.mi}
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
          {section.title.en}
        </p>

        <div
          className="mt-5 h-px"
          style={{ background: 'rgba(199,155,31, 0.45)' }}
        />
      </header>

      {/* Body */}
      <div className="mt-7 space-y-5">
        {section.body.map((block, i) => (
          <BlockRenderer key={i} block={block} />
        ))}
      </div>

      {/* Drafted-by attribution */}
      <p
        className="mt-8"
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '0.75rem',
          color: '#8E8A82',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
        }}
      >
        drafted by · {section.draftedBy}
      </p>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Block renderer — one branch per kind
// ─────────────────────────────────────────────────────────────────────────────

function BlockRenderer({ block }: { block: Block }) {
  switch (block.kind) {
    case 'paragraph':
      return (
        <p
          style={{
            fontSize: '0.95rem',
            lineHeight: 1.7,
            color: '#23211F',
          }}
        >
          {block.text}
          {block.cites && block.cites.length > 0 && (
            <CitationMarks cites={block.cites} />
          )}
        </p>
      );

    case 'list':
      return (
        <ul className="space-y-2 pl-1">
          {block.items.map((item, i) => (
            <li
              key={i}
              className="relative pl-5"
              style={{
                fontSize: '0.95rem',
                lineHeight: 1.7,
                color: '#23211F',
              }}
            >
              <span
                aria-hidden
                className="absolute left-0 top-3 h-1 w-1 rounded-full"
                style={{ background: '#3A3832' }}
              />
              {item}
            </li>
          ))}
          {block.cites && block.cites.length > 0 && (
            <li className="list-none pl-5">
              <CitationMarks cites={block.cites} />
            </li>
          )}
        </ul>
      );

    case 'pullQuote':
      return (
        <blockquote
          className="my-4 border-l-2 pl-6"
          style={{ borderColor: '#3A3832' }}
        >
          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 300,
              fontSize: '1.4rem',
              lineHeight: 1.4,
              color: '#23211F',
              fontStyle: 'italic',
            }}
          >
            “{block.text}”
          </p>
          {block.attributedTo && (
            <cite
              className="mt-3 block"
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '0.75rem',
                color: '#5C5852',
                fontStyle: 'normal',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
              }}
            >
              — {block.attributedTo}
            </cite>
          )}
        </blockquote>
      );

    case 'callout': {
      const palette = {
        pounamu: { bg: 'rgba(58,56,50, 0.06)', border: '#3A3832', ink: '#23211F' },
        draft: { bg: 'rgba(163, 59, 44, 0.06)', border: '#A33B2C', ink: '#23211F' },
        sealed: { bg: 'rgba(217, 188, 122, 0.10)', border: '#D9BC7A', ink: '#23211F' },
      }[block.tone];
      return (
        <div
          className="rounded-[4px] px-5 py-4"
          style={{
            background: palette.bg,
            border: `1px solid ${palette.border}`,
            color: palette.ink,
            fontSize: '0.9rem',
            lineHeight: 1.65,
          }}
        >
          {block.text}
        </div>
      );
    }

    case 'table':
      return (
        <figure>
          <table
            className="w-full"
            style={{
              borderCollapse: 'collapse',
              fontSize: '0.85rem',
              color: '#23211F',
            }}
          >
            <thead>
              <tr>
                {block.columns.map((c, i) => (
                  <th
                    key={i}
                    className="px-3 py-2 text-left"
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: '0.75rem',
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color: '#5C5852',
                      fontWeight: 500,
                      borderBottom: '1px solid rgba(35,33,31,0.20)',
                    }}
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((r, i) => (
                <tr key={i}>
                  {r.map((cell, j) => (
                    <td
                      key={j}
                      className="px-3 py-2 align-top"
                      style={{
                        borderBottom: '1px solid rgba(35,33,31,0.08)',
                        lineHeight: 1.6,
                      }}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {block.caption && (
            <figcaption
              className="mt-2"
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '0.75rem',
                color: '#8E8A82',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
              }}
            >
              {block.caption}
            </figcaption>
          )}
        </figure>
      );

    case 'signature':
      return (
        <div
          className="mt-6 flex items-baseline justify-between border-t pt-4"
          style={{ borderColor: 'rgba(35,33,31,0.15)' }}
        >
          <div>
            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 400,
                fontSize: '1.4rem',
                color: '#23211F',
                fontStyle: 'italic',
              }}
            >
              {block.signedBy}
            </p>
            <p
              className="mt-1"
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '0.75rem',
                color: '#8E8A82',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
              }}
            >
              signed · {block.signedAt}
            </p>
          </div>
        </div>
      );
  }
}

function CitationMarks({ cites }: { cites: number[] }) {
  return (
    <sup
      className="ml-1"
      style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: '0.65em',
        color: '#3A3832',
        fontWeight: 500,
      }}
    >
      {cites.map((n, i) => (
        <span key={n}>
          {i > 0 && ', '}
          {n}
        </span>
      ))}
    </sup>
  );
}
