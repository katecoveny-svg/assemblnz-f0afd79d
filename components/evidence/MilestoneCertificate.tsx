/**
 * MilestoneCertificate — the "we noticed you" artefact.
 * Spec: voyage-surprise-moments.md §G.4.
 *
 * A single-page A4 certificate that ships when an operator hits a meaningful
 * milestone (50 clients, 100 packs sealed, a full year). No CTA. Just the
 * wordmark, the milestone, the date, and the hash. Print-quality.
 *
 * Lives separately from EvidencePack on purpose — a certificate is not an
 * evidence pack. It has no sections, no citations, no draft state. It is
 * either issued or it does not exist. But it carries the same hash-chain
 * stamp so the issuance is verifiable.
 */

export interface MilestoneCertificate {
  id: string;
  tenantId: string;
  recipient: { name: string; role?: string };
  /** Plain text — "100 evidence packs sealed", "one year on assembl". */
  milestone: string;
  /** Te reo equivalent / context line. */
  milestoneMi?: string;
  /** Detail one-liner — "from 4 May 2025 to 4 May 2026". */
  context?: string;
  /** ISO 8601 in NZST. */
  issuedAt: string;
  hash: string;
  prevHash?: string;
  verifierUrl: string;
}

interface CertificateProps {
  certificate: MilestoneCertificate;
}

function shortHash(hash: string): string {
  if (!hash) return '—';
  if (hash.length < 12) return hash;
  return `${hash.slice(0, 6)}…${hash.slice(-4)}`;
}

function formatNzst(iso: string): string {
  return (
    new Intl.DateTimeFormat('en-NZ', {
      timeZone: 'Pacific/Auckland',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(iso)) + ' NZST'
  );
}

export function MilestoneCertificate({ certificate }: CertificateProps) {
  return (
    <article
      data-testid="milestone-certificate"
      className="pack-page relative mx-auto"
      style={{
        width: 'min(640px, 100vw - 32px)',
        aspectRatio: '210 / 297',
        background: '#FAF7F2',
        padding: '64px 56px',
        boxShadow: '0 28px 80px rgba(35,33,31,.10), 0 2px 12px rgba(35,33,31,.06)',
        overflow: 'hidden',
      }}
    >
      {/* Top — wordmark only */}
      <header className="text-center">
        <p
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 600,
            fontSize: '3rem',
            margin: 0,
            lineHeight: 1,
          }}
        >
          assembl
        </p>
      </header>

      {/* Centre — the milestone, hero size */}
      <section
        className="absolute left-12 right-12"
        style={{ top: '38%', textAlign: 'center' }}
      >
        <p
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '0.7rem',
            color: '#5C5852',
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
          }}
        >
          Tāmata · Milestone
        </p>

        {certificate.milestoneMi && (
          <p
            className="mt-8"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 300,
              fontSize: 'clamp(1.4rem, 3vw, 1.8rem)',
              color: '#5C5852',
              fontStyle: 'italic',
              margin: '24px 0 0',
            }}
          >
            {certificate.milestoneMi}
          </p>
        )}

        <h1
          className="mt-4"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 300,
            fontSize: 'clamp(2.4rem, 5vw, 3.4rem)',
            lineHeight: 1.05,
            letterSpacing: '-0.01em',
            margin: '12px 0 0',
          }}
        >
          {certificate.milestone}
        </h1>

        {certificate.context && (
          <p
            className="mt-6"
            style={{
              fontSize: '0.95rem',
              color: '#5C5852',
              lineHeight: 1.6,
              margin: '24px 0 0',
            }}
          >
            {certificate.context}
          </p>
        )}
      </section>

      {/* Recipient line — italic, restrained */}
      <section
        className="absolute left-12 right-12"
        style={{ top: '70%', textAlign: 'center' }}
      >
        <p
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '0.65rem',
            color: '#8E8A82',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
          }}
        >
          for
        </p>
        <p
          className="mt-3"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: 'italic',
            fontSize: 'clamp(1.4rem, 2.5vw, 1.8rem)',
            color: '#23211F',
            margin: '12px 0 0',
          }}
        >
          {certificate.recipient.name}
        </p>
        {certificate.recipient.role && (
          <p
            className="mt-1"
            style={{
              fontSize: '0.9rem',
              color: '#8E8A82',
              margin: '4px 0 0',
            }}
          >
            {certificate.recipient.role}
          </p>
        )}
      </section>

      {/* Foot — date + seal + hash */}
      <footer
        className="absolute"
        style={{ inset: 'auto 56px 64px 56px', textAlign: 'center' }}
      >
        <div className="flex items-center justify-center gap-4">
          <svg viewBox="0 0 48 48" width="56" height="56" aria-hidden="true">
            <g fill="#D9BC7A">
              <path d="M24 2 L26.5 21.5 L46 24 L26.5 26.5 L24 46 L21.5 26.5 L2 24 L21.5 21.5 Z" />
              <circle cx="24" cy="24" r="1.6" fill="#FAF7F2" />
            </g>
            <circle
              cx="24"
              cy="24"
              r="22"
              fill="none"
              stroke="#2B6B57"
              strokeWidth="0.6"
            />
          </svg>
        </div>
        <p
          className="mt-4"
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '0.7rem',
            color: '#5C5852',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
          }}
        >
          Issued · {formatNzst(certificate.issuedAt)}
        </p>
        <p
          className="mt-6"
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '0.58rem',
            color: '#8E8A82',
            letterSpacing: '0.14em',
            wordBreak: 'break-all',
          }}
        >
          hash · {shortHash(certificate.hash)}
          {certificate.prevHash && (
            <> · prev {shortHash(certificate.prevHash)}</>
          )}
        </p>
        <p
          className="mt-1"
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '0.55rem',
            color: '#8E8A82',
            letterSpacing: '0.12em',
            wordBreak: 'break-all',
          }}
        >
          {certificate.verifierUrl}
        </p>
      </footer>
    </article>
  );
}
