/**
 * EvidencePackCover — the reference implementation of voyage-evidence-craft.md §2.1.
 *
 * This is the quality bar. The cover does one thing. No tagline, no QR
 * code, no "powered by". Wordmark · kete line · bilingual title · subject ·
 * dateline · soft-gold seal. Nothing else.
 *
 * Every future cover renders through this component. Do not duplicate.
 * Do not add props that break the seven invariants in §2 of the craft doc.
 */

import type { EvidencePack } from '@/lib/evidence/pack-spec';

interface EvidencePackCoverProps {
  pack: EvidencePack;
  /**
   * Render mode. 'screen' is what the user sees in-app or in a web preview;
   * 'print' adds the Pearl noise overlay and tightens type metrics for
   * A4 at 120gsm. The hash and status badge survive both.
   */
  mode?: 'screen' | 'print';
}

const KETE_LABELS: Record<string, { en: string; sub: string }> = {
  waihanga: { en: 'Construction', sub: 'evidence pack' },
  manaaki: { en: 'Hospitality', sub: 'evidence pack' },
  pikau: { en: 'Freight & Customs', sub: 'evidence pack' },
  arataki: { en: 'Automotive', sub: 'evidence pack' },
  auaha: { en: 'Creative', sub: 'evidence pack' },
  hoko: { en: 'Retail', sub: 'evidence pack' },
  ako: { en: 'Education', sub: 'evidence pack' },
  toro: { en: 'Family', sub: 'evidence pack' },
};

const KETE_DISPLAY: Record<string, string> = {
  waihanga: 'Waihanga',
  manaaki: 'Manaaki',
  pikau: 'Pīkau',
  arataki: 'Arataki',
  auaha: 'Auaha',
  hoko: 'Hoko',
  ako: 'Ako',
  toro: 'Tōro',
};

function formatNzst(iso: string): string {
  const d = new Date(iso);
  const fmt = new Intl.DateTimeFormat('en-NZ', {
    timeZone: 'Pacific/Auckland',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return fmt.format(d) + ' NZST';
}

export function EvidencePackCover({ pack, mode = 'screen' }: EvidencePackCoverProps) {
  const isDraft = pack.status === 'draft';
  const keteMeta = KETE_LABELS[pack.kete] ?? { en: '', sub: 'evidence pack' };
  const keteDisplay = KETE_DISPLAY[pack.kete] ?? pack.kete;

  return (
    <article
      data-testid="evidence-pack-cover"
      data-status={pack.status}
      data-mode={mode}
      className="relative isolate mx-auto aspect-[210/297] w-full max-w-[640px] overflow-hidden"
      style={{
        background: '#FAF7F2',
        color: '#23211F',
        fontFamily: "'Inter', system-ui, sans-serif",
        boxShadow:
          mode === 'print'
            ? 'none'
            : '0 28px 80px rgba(35,33,31,0.10), 0 2px 12px rgba(35,33,31,0.06)',
      }}
    >
      {/* Pearl noise overlay — 2% opacity above the wordmark zone only.
          The cover earns its silence; the wordmark sits on clean paper. */}
      {mode === 'print' && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-[28%] bottom-0"
          style={{
            opacity: 0.02,
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><filter id='n'><feTurbulence baseFrequency='0.9'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.5'/></svg>\")",
          }}
        />
      )}

      {/* Draft watermark — present until sealed. Cannot be CSS-toggled off
          via prop; only flips when pack.status changes. */}
      {isDraft && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          style={{ opacity: 0.22 }}
        >
          <span
            className="select-none"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 700,
              fontSize: 'clamp(8rem, 28vw, 18rem)',
              color: '#A33B2C',
              transform: 'rotate(-22deg)',
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}
          >
            DRAFT
          </span>
        </div>
      )}

      {/* Top — wordmark + kete line */}
      <header className="relative px-12 pt-14">
        <p
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 600,
            fontSize: 'clamp(2.4rem, 6vw, 3.4rem)',
            letterSpacing: 0,
            lineHeight: 1,
          }}
        >
          assembl
        </p>
        <p
          className="mt-3"
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontWeight: 500,
            fontSize: '0.72rem',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#5C5852',
          }}
        >
          {keteDisplay} · {keteMeta.en} · {keteMeta.sub}
        </p>
      </header>

      {/* Middle — bilingual title + subject. The hero of the cover. */}
      <section className="relative mt-[18vh] px-12">
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 300,
            fontSize: 'clamp(2.2rem, 5.4vw, 3.4rem)',
            lineHeight: 1.05,
            letterSpacing: '-0.01em',
            color: '#23211F',
            margin: 0,
          }}
        >
          <span style={{ display: 'block' }}>{pack.title.mi}</span>
          <span
            style={{
              display: 'block',
              fontWeight: 400,
              marginTop: '0.25rem',
              color: '#23211F',
            }}
          >
            {pack.title.en}
          </span>
        </h1>

        <p
          className="mt-10"
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontWeight: 500,
            fontSize: '0.78rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#5C5852',
          }}
        >
          {pack.subject.label}
        </p>
      </section>

      {/* Foot — dateline left, soft-gold seal right, hash dead-bottom in mono */}
      <footer className="absolute inset-x-0 bottom-0 px-12 pb-12">
        <div className="flex items-end justify-between">
          <div>
            <p
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontWeight: 500,
                fontSize: '0.7rem',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: '#5C5852',
              }}
            >
              Issued · {formatNzst(pack.issuedAt)}
            </p>
            {pack.reviewer && (
              <p
                className="mt-2"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 400,
                  fontSize: '1.05rem',
                  color: '#23211F',
                }}
              >
                {pack.reviewer.name}
                <span style={{ color: '#8E8A82' }}> · {pack.reviewer.role}</span>
              </p>
            )}
          </div>

          {/* The seal — 12mm sparkle device. Single instance on the cover. */}
          <SealMark sealed={!isDraft} />
        </div>

        {/* Hash line — small mono, separate row, never crowds the dateline. */}
        <p
          className="mt-8"
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontWeight: 500,
            fontSize: '0.62rem',
            letterSpacing: '0.14em',
            color: '#8E8A82',
            wordBreak: 'break-all',
          }}
        >
          {!isDraft && pack.hashChain.sealedAt ? (
            <>
              hash · {shortHash(pack.hashChain.thisHash)} · prev{' '}
              {shortHash(pack.hashChain.prevHash)} · sealed{' '}
              {formatNzst(pack.hashChain.sealedAt)}
            </>
          ) : (
            <>draft · not sealed · verifier inactive</>
          )}
        </p>
      </footer>
    </article>
  );
}

function SealMark({ sealed }: { sealed: boolean }) {
  // The Pearl sparkle — 12mm device, soft gold when sealed, muted while draft.
  const fill = sealed ? '#D9BC7A' : '#C4BBA8';
  return (
    <svg
      viewBox="0 0 48 48"
      width="48"
      height="48"
      aria-hidden
      style={{ display: 'block' }}
    >
      <g fill={fill}>
        {/* Four-pointed star */}
        <path d="M24 2 L26.5 21.5 L46 24 L26.5 26.5 L24 46 L21.5 26.5 L2 24 L21.5 21.5 Z" />
        {/* Inner dot for weight */}
        <circle cx="24" cy="24" r="1.6" fill="#FAF7F2" />
      </g>
      {sealed && (
        <circle
          cx="24"
          cy="24"
          r="22"
          fill="none"
          stroke="#2B6B57"
          strokeWidth="0.6"
        />
      )}
    </svg>
  );
}

function shortHash(hash: string): string {
  if (!hash || hash.length < 12) return hash || '';
  return `${hash.slice(0, 6)}…${hash.slice(-4)}`;
}
