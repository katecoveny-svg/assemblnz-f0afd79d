/**
 * EvidencePackClosing — the audit-statement page.
 * Spec: voyage-evidence-craft.md §2.7.
 *
 * Three blocks and only three blocks:
 *   1. The named reviewer
 *   2. The agent loadout
 *   3. The hash-chain proof block + verifier URL
 *
 * No CTA, no marketing line, no "Built with assembl." The wordmark on the
 * cover is the brand statement; this page is the audit statement.
 */

import type { EvidencePack } from '@/lib/evidence/pack-spec';

interface ClosingProps {
  pack: EvidencePack;
}

function formatNzst(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return (
    new Intl.DateTimeFormat('en-NZ', {
      timeZone: 'Pacific/Auckland',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(d) + ' NZST'
  );
}

function shortHash(hash: string | undefined): string {
  if (!hash) return '—';
  if (hash.length < 12) return hash;
  return `${hash.slice(0, 6)}…${hash.slice(-4)}`;
}

export function EvidencePackClosing({ pack }: ClosingProps) {
  return (
    <section
      className="relative px-12 py-12"
      style={{
        fontFamily: "'Inter', system-ui, sans-serif",
        color: '#23211F',
        breakInside: 'avoid',
      }}
    >
      <header>
        <p
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '0.75rem',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#5C5852',
          }}
        >
          Whakamutunga · Audit statement
        </p>
        <div
          className="mt-5 h-px"
          style={{ background: 'rgba(199,155,31, 0.45)' }}
        />
      </header>

      {/* 1 — Reviewer */}
      <div className="mt-8">
        <p
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '0.75rem',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#8E8A82',
          }}
        >
          Reviewed and approved by
        </p>
        {pack.reviewer ? (
          <>
            <p
              className="mt-2"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 400,
                fontSize: '1.8rem',
                lineHeight: 1.1,
                color: '#23211F',
              }}
            >
              {pack.reviewer.name}
            </p>
            <p
              className="mt-1"
              style={{
                fontSize: '0.95rem',
                color: '#5C5852',
              }}
            >
              {pack.reviewer.role}
              <span style={{ color: '#8E8A82' }}> · {pack.reviewer.email}</span>
            </p>
          </>
        ) : (
          <p
            className="mt-2"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: 'italic',
              color: '#A33B2C',
            }}
          >
            Not yet reviewed — pack remains in Draft.
          </p>
        )}
      </div>

      {/* 2 — Agent loadout */}
      <div className="mt-10">
        <p
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '0.75rem',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#8E8A82',
          }}
        >
          Drafted by
        </p>
        <ul className="mt-3 space-y-1">
          {pack.agentLoadout.map((a) => (
            <li
              key={a.agent}
              className="grid grid-cols-[8rem_1fr] gap-3"
              style={{
                fontSize: '0.88rem',
                lineHeight: 1.7,
                color: '#23211F',
              }}
            >
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '0.78rem',
                  color: '#3A3832',
                  letterSpacing: '0.08em',
                }}
              >
                {a.agent}
              </span>
              <span style={{ color: '#5C5852' }}>
                §{a.sectionIds.join(', §')}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* 3 — Hash chain proof */}
      <div
        className="mt-10 rounded-[4px] px-6 py-5"
        style={{
          background: pack.status === 'sealed'
            ? 'rgba(58,56,50, 0.05)'
            : 'rgba(163, 59, 44, 0.05)',
          border: `1px solid ${pack.status === 'sealed' ? 'rgba(58,56,50,0.35)' : 'rgba(163,59,44,0.30)'}`,
        }}
      >
        <p
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '0.75rem',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: pack.status === 'sealed' ? '#3A3832' : '#A33B2C',
          }}
        >
          Mōkihi · Hash chain proof
        </p>

        <dl className="mt-4 grid grid-cols-[7rem_1fr] gap-x-4 gap-y-2">
          <Term label="status" />
          <Value mono>
            {pack.status === 'sealed' ? 'sealed' : 'draft · not sealed'}
          </Value>

          <Term label="hash" />
          <Value mono breakAll>
            {pack.hashChain.thisHash || '—'}
          </Value>

          <Term label="prev" />
          <Value mono breakAll>
            {pack.hashChain.prevHash || '—'}
          </Value>

          <Term label="sealed at" />
          <Value mono>{formatNzst(pack.hashChain.sealedAt)}</Value>

          <Term label="verifier" />
          <Value mono breakAll>
            {pack.hashChain.verifierUrl || '/evidence/verify/—'}
          </Value>
        </dl>

        <p
          className="mt-5"
          style={{
            fontSize: '0.78rem',
            lineHeight: 1.6,
            color: '#5C5852',
          }}
        >
          The hash above is computed from the canonical JSON form of this
          pack and chained from the previous sealed pack for this tenant.
          Any external party can confirm integrity at the verifier URL.
          A pack that fails verification is not an Assembl pack.
        </p>
      </div>

      {/* Footer mono — page anchor */}
      <p
        className="mt-12"
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '0.75rem',
          color: '#8E8A82',
          letterSpacing: '0.14em',
          wordBreak: 'break-all',
        }}
      >
        hash · {shortHash(pack.hashChain.thisHash)} · prev{' '}
        {shortHash(pack.hashChain.prevHash)} ·{' '}
        {pack.status === 'sealed' ? `sealed ${formatNzst(pack.hashChain.sealedAt)}` : 'draft'}
      </p>
    </section>
  );
}

function Term({ label }: { label: string }) {
  return (
    <dt
      style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: '0.75rem',
        color: '#8E8A82',
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
      }}
    >
      {label}
    </dt>
  );
}

function Value({
  children,
  mono,
  breakAll,
}: {
  children: React.ReactNode;
  mono?: boolean;
  breakAll?: boolean;
}) {
  return (
    <dd
      style={{
        fontFamily: mono
          ? "'IBM Plex Mono', monospace"
          : "'Inter', system-ui, sans-serif",
        fontSize: '0.78rem',
        color: '#23211F',
        wordBreak: breakAll ? 'break-all' : 'normal',
        margin: 0,
      }}
    >
      {children}
    </dd>
  );
}
