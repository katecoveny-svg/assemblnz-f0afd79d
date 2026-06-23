/**
 * VerifierBadge — small embeddable proof-of-seal.
 *
 * For email signatures, lawyer letterhead PDFs, BCA correspondence, Slack
 * pasted into a conversation, and the "verified" chip in the in-product
 * pack drawer. Three sizes:
 *
 *   - 'inline'   — single-line, fits in a paragraph (height ~16px)
 *   - 'compact'  — small block, fits in an email signature (~52px tall)
 *   - 'card'     — fuller block for a contract footer (~120px tall)
 *
 * Designed to be safe to render anywhere — no Tailwind classes, no
 * external fonts (falls back to system serif if Cormorant isn't loaded).
 *
 * Spec: voyage-surprise-moments.md §G.4 / the "verifier as identity" arc
 * of voyage-evidence-craft.md.
 */

export interface VerifierBadgeProps {
  /** The pack hash this badge attests to. */
  hash: string;
  /** The previous pack's hash (chain link). Optional. */
  prevHash?: string;
  /** Public verifier URL — usually '/evidence/verify/' + hash. */
  verifierUrl: string;
  /** ISO 8601 sealed-at. Used in 'compact' and 'card' variants. */
  sealedAt?: string;
  /** Optional reviewer name for the 'card' variant only. */
  reviewer?: string;
  /** Layout variant. Defaults to 'compact'. */
  variant?: 'inline' | 'compact' | 'card';
}

function shortHash(hash: string): string {
  if (!hash) return '—';
  if (hash.length < 12) return hash;
  return `${hash.slice(0, 6)}…${hash.slice(-4)}`;
}

function formatNzst(iso: string | undefined): string {
  if (!iso) return '';
  return (
    new Intl.DateTimeFormat('en-NZ', {
      timeZone: 'Pacific/Auckland',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(iso)) + ' NZST'
  );
}

const C = {
  paper: '#FFF7EC',
  ink: '#23211F',
  inkSecondary: '#5C5852',
  inkTertiary: '#8E8A82',
  pounamu: '#3A3832',
  softGold: '#D9BC7A',
};

function Mark({ size = 12 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      aria-hidden
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
    >
      <g fill={C.softGold}>
        <path d="M24 2 L26.5 21.5 L46 24 L26.5 26.5 L24 46 L21.5 26.5 L2 24 L21.5 21.5 Z" />
        <circle cx="24" cy="24" r="1.6" fill={C.paper} />
      </g>
      <circle
        cx="24"
        cy="24"
        r="22"
        fill="none"
        stroke={C.pounamu}
        strokeWidth="0.6"
      />
    </svg>
  );
}

export function VerifierBadge(props: VerifierBadgeProps) {
  const variant = props.variant ?? 'compact';
  if (variant === 'inline') return <InlineBadge {...props} />;
  if (variant === 'card') return <CardBadge {...props} />;
  return <CompactBadge {...props} />;
}

function InlineBadge({ hash, verifierUrl }: VerifierBadgeProps) {
  return (
    <a
      href={verifierUrl}
      target="_blank"
      rel="noreferrer"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
        fontSize: '0.72rem',
        color: C.pounamu,
        textDecoration: 'none',
        letterSpacing: '0.04em',
        whiteSpace: 'nowrap',
      }}
    >
      <Mark size={11} />
      <span style={{ color: C.inkSecondary }}>verified ·</span>
      <span>{shortHash(hash)}</span>
    </a>
  );
}

function CompactBadge({
  hash,
  prevHash,
  verifierUrl,
  sealedAt,
}: VerifierBadgeProps) {
  return (
    <a
      href={verifierUrl}
      target="_blank"
      rel="noreferrer"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 12,
        padding: '8px 14px',
        background: C.paper,
        border: `1px solid ${C.pounamu}33`,
        borderRadius: 4,
        textDecoration: 'none',
        color: C.ink,
        maxWidth: 360,
      }}
    >
      <Mark size={20} />
      <div style={{ minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontWeight: 500,
            fontSize: '0.92rem',
            lineHeight: 1.1,
            color: C.ink,
          }}
        >
          Sealed by <span style={{ color: C.pounamu }}>assembl</span>
        </p>
        <p
          style={{
            margin: '2px 0 0',
            fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
            fontSize: '0.62rem',
            color: C.inkTertiary,
            letterSpacing: '0.08em',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {shortHash(hash)}
          {prevHash ? ` · prev ${shortHash(prevHash)}` : ''}
          {sealedAt ? ` · ${formatNzst(sealedAt)}` : ''}
        </p>
      </div>
    </a>
  );
}

function CardBadge({
  hash,
  prevHash,
  verifierUrl,
  sealedAt,
  reviewer,
}: VerifierBadgeProps) {
  return (
    <a
      href={verifierUrl}
      target="_blank"
      rel="noreferrer"
      style={{
        display: 'block',
        padding: '16px 20px',
        background: C.paper,
        border: `1px solid ${C.pounamu}33`,
        borderLeft: `3px solid ${C.pounamu}`,
        borderRadius: 4,
        textDecoration: 'none',
        color: C.ink,
        maxWidth: 480,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Mark size={20} />
        <p
          style={{
            margin: 0,
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '0.68rem',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: C.pounamu,
          }}
        >
          Sealed · verified at assembl
        </p>
      </div>

      <dl
        style={{
          margin: '14px 0 0',
          display: 'grid',
          gridTemplateColumns: '78px 1fr',
          gap: '4px 12px',
        }}
      >
        <Term>hash</Term>
        <Val mono>{hash}</Val>
        {prevHash && (
          <>
            <Term>prev</Term>
            <Val mono>{prevHash}</Val>
          </>
        )}
        {sealedAt && (
          <>
            <Term>sealed</Term>
            <Val mono>{formatNzst(sealedAt)}</Val>
          </>
        )}
        {reviewer && (
          <>
            <Term>reviewer</Term>
            <Val>{reviewer}</Val>
          </>
        )}
      </dl>

      <p
        style={{
          margin: '14px 0 0',
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '0.6rem',
          color: C.inkTertiary,
          letterSpacing: '0.08em',
          wordBreak: 'break-all',
        }}
      >
        {verifierUrl}
      </p>
    </a>
  );
}

function Term({ children }: { children: React.ReactNode }) {
  return (
    <dt
      style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: '0.6rem',
        color: C.inkTertiary,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
      }}
    >
      {children}
    </dt>
  );
}

function Val({ children, mono }: { children: React.ReactNode; mono?: boolean }) {
  return (
    <dd
      style={{
        margin: 0,
        fontFamily: mono
          ? "'IBM Plex Mono', monospace"
          : "'Inter', system-ui, sans-serif",
        fontSize: '0.72rem',
        color: C.ink,
        wordBreak: 'break-all',
      }}
    >
      {children}
    </dd>
  );
}
