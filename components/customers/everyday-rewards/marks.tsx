import { EDR_BRAND } from '@/lib/customers/everyday-rewards/config';

/**
 * Everyday Rewards r-leaf mark — a STYLISED silhouette, never the real
 * proprietary artwork. White lowercase "r" with a small leaf notch inside a
 * rounded orange tile. See brand-notes.md "Logo mark".
 */
export function RLeafMark({ size = 40 }: { size?: number }) {
  const r = Math.round(size * 0.25);
  return (
    <span
      aria-label="Everyday Rewards mark (concept placeholder)"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        background: EDR_BRAND.orange,
        borderRadius: r,
        position: 'relative',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          color: EDR_BRAND.white,
          fontFamily: 'var(--edr-body), Roboto, sans-serif',
          fontWeight: 700,
          fontSize: size * 0.62,
          lineHeight: 1,
          marginTop: size * 0.08,
        }}
      >
        r
      </span>
      <span
        style={{
          position: 'absolute',
          top: size * 0.2,
          right: size * 0.24,
          width: size * 0.16,
          height: size * 0.16,
          background: EDR_BRAND.leaf,
          borderRadius: '0 50% 0 50%',
          transform: 'rotate(-45deg)',
        }}
      />
    </span>
  );
}

/** "concept · pending" badge — mandatory on every EDR-branded surface. */
export function ConceptBadge() {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '5px 11px',
        borderRadius: 999,
        border: `1px solid ${EDR_BRAND.orange}`,
        background: EDR_BRAND.orangeLight,
        color: EDR_BRAND.orangeDark,
        fontFamily: 'var(--edr-mono), monospace',
        fontSize: 10,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        fontWeight: 700,
        whiteSpace: 'nowrap',
      }}
    >
      concept · pending
    </span>
  );
}

/** Bottom-right watermark on every mockup surface. */
export function Watermark({
  onDark = false,
  text = 'concept · assembl × everyday rewards',
}: {
  onDark?: boolean;
  text?: string;
}) {
  return (
    <span
      style={{
        position: 'absolute',
        bottom: 14,
        right: 16,
        fontFamily: 'var(--edr-mono), monospace',
        fontSize: 8,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        color: onDark ? 'rgba(255,255,255,0.7)' : 'rgba(58,71,78,0.5)',
        pointerEvents: 'none',
      }}
    >
      {text}
    </span>
  );
}

/**
 * Cross-brand lockup: assembl × everyday rewards, thin canary-gold divider,
 * wordlock beneath. Follows the Air NZ v2 lockup rule from brand-notes.md.
 */
export function CrossBrandLockup() {
  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span
          style={{
            fontFamily: 'var(--edr-display), Georgia, serif',
            fontWeight: 600,
            fontSize: 22,
            color: EDR_BRAND.assemblCharcoal,
            letterSpacing: '-0.01em',
          }}
        >
          assembl
        </span>
        <span
          style={{
            width: 1,
            height: 24,
            background: EDR_BRAND.gold,
            opacity: 0.5,
          }}
        />
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <RLeafMark size={22} />
          <span
            style={{
              fontFamily: 'var(--edr-body), Roboto, sans-serif',
              fontWeight: 700,
              fontSize: 15,
              color: EDR_BRAND.orange,
              lineHeight: 1.05,
            }}
          >
            everyday
            <br />
            rewards
          </span>
        </span>
      </div>
      <span
        style={{
          fontFamily: 'var(--edr-mono), monospace',
          fontSize: 9,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: '#8A8678',
        }}
      >
        assembl × everyday rewards
      </span>
    </div>
  );
}

/**
 * The wait-state trolley mascot — three frames (idle / filling / rolling),
 * redrawn in the Everyday Rewards orange system. Ported from the v2 pack.
 */
export function TrolleyMascot({
  frame = 'idle',
  width = 200,
}: {
  frame?: 'idle' | 'filling' | 'rolling';
  width?: number;
}) {
  const O = EDR_BRAND.orange;
  const OD = EDR_BRAND.orangeDark;
  const N = EDR_BRAND.navy;
  return (
    <svg
      viewBox="0 0 250 170"
      width={width}
      height={width * 0.68}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`Everyday Rewards trolley — ${frame}`}
    >
      {frame === 'rolling' ? (
        <path
          d="M78 150 Q135 158 194 150"
          stroke="#e5e5e5"
          strokeWidth="1.5"
          strokeDasharray="3 3"
          fill="none"
        />
      ) : (
        <line
          x1="20"
          y1="150"
          x2="230"
          y2="150"
          stroke="#e5e5e5"
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />
      )}
      {/* basket */}
      <path d="M60 70 L210 70 L192 138 L78 138 Z" fill={O} stroke={OD} strokeWidth="2" />
      <line x1="62" y1="90" x2="208" y2="90" stroke="#fff" strokeWidth="1.5" opacity=".4" />
      <line x1="64" y1="110" x2="206" y2="110" stroke="#fff" strokeWidth="1.5" opacity=".4" />
      <line x1="66" y1="130" x2="204" y2="130" stroke="#fff" strokeWidth="1.5" opacity=".4" />
      {/* smile */}
      <path
        d="M114 118 Q135 128 156 118"
        stroke="#fff"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity=".85"
      />
      {/* handle */}
      <path d="M38 48 L60 70 M38 48 L28 48" stroke={N} strokeWidth="5" strokeLinecap="round" fill="none" />
      <circle cx="28" cy="48" r="5" fill={N} />
      {/* wheels */}
      <line x1="78" y1="138" x2="88" y2="150" stroke={N} strokeWidth="4" strokeLinecap="round" />
      <line x1="192" y1="138" x2="184" y2="150" stroke={N} strokeWidth="4" strokeLinecap="round" />
      <circle cx="88" cy="150" r="7" fill={N} />
      <circle cx="184" cy="150" r="7" fill={N} />

      {frame === 'idle' && (
        <>
          {/* r-leaf tag hanging off the basket */}
          <rect x="196" y="66" width="20" height="20" rx="5" fill={O} stroke={OD} strokeWidth="1.5" />
          <text x="206" y="81" textAnchor="middle" fontFamily="Roboto,sans-serif" fontSize="12" fontWeight="700" fill="#fff">
            r
          </text>
          <circle cx="212" cy="70" r="2.4" fill={EDR_BRAND.leaf} />
        </>
      )}

      {frame === 'filling' && (
        <>
          <rect x="80" y="42" width="46" height="24" rx="12" fill="#fff" stroke={O} strokeWidth="2" />
          <text x="103" y="59" textAnchor="middle" fontFamily="Roboto,sans-serif" fontSize="12" fontWeight="700" fill={O}>
            +12 pts
          </text>
          {/* gift box */}
          <rect x="132" y="40" width="30" height="28" fill={O} stroke={OD} strokeWidth="1.5" rx="3" />
          <line x1="147" y1="40" x2="147" y2="68" stroke="#fff" strokeWidth="2" />
          <line x1="132" y1="53" x2="162" y2="53" stroke="#fff" strokeWidth="2" />
          {/* envelope */}
          <rect x="168" y="44" width="30" height="22" fill="#fff" stroke={O} strokeWidth="2" rx="2" />
          <path d="M168 44 L183 56 L198 44" stroke={O} strokeWidth="1.5" fill="none" />
          {/* motion ticks */}
          <line x1="108" y1="32" x2="108" y2="40" stroke="#bbb" strokeWidth="2" strokeLinecap="round" />
          <line x1="147" y1="30" x2="147" y2="38" stroke="#bbb" strokeWidth="2" strokeLinecap="round" />
          <line x1="183" y1="34" x2="183" y2="42" stroke="#bbb" strokeWidth="2" strokeLinecap="round" />
        </>
      )}

      {frame === 'rolling' && (
        <>
          <line x1="44" y1="82" x2="24" y2="82" stroke="#cfd6da" strokeWidth="3" strokeLinecap="round" />
          <line x1="46" y1="96" x2="20" y2="96" stroke="#cfd6da" strokeWidth="3" strokeLinecap="round" />
          <line x1="44" y1="110" x2="26" y2="110" stroke="#cfd6da" strokeWidth="3" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}
