import { LULA_BRAND } from '@/lib/customers/lula-inn/brand';

/**
 * The Lula Inn mark — a STYLISED wave-in-a-porthole monogram, never real
 * proprietary Star Group / Lula artwork. Brass ring, teal water, coral sun.
 */
export function LulaMark({ size = 40 }: { size?: number }) {
  return (
    <span
      aria-label="The Lula Inn mark (concept placeholder)"
      style={{ display: 'inline-flex', flexShrink: 0 }}
    >
      <svg width={size} height={size} viewBox="0 0 48 48" role="img" aria-hidden="true">
        <circle cx="24" cy="24" r="22" fill={LULA_BRAND.ocean} stroke={LULA_BRAND.brass} strokeWidth="2" />
        <circle cx="24" cy="17" r="5" fill={LULA_BRAND.coral} />
        <path
          d="M6 30 Q13 25 20 30 T34 30 T48 30 V48 H0 V30 Q0 30 6 30Z"
          fill={LULA_BRAND.oceanMid}
          opacity="0.9"
        />
        <path
          d="M6 34 Q13 29 20 34 T34 34 T48 34"
          fill="none"
          stroke={LULA_BRAND.oceanLight}
          strokeWidth="1.6"
          opacity="0.7"
        />
      </svg>
    </span>
  );
}

/** "concept · pending" badge — mandatory on every Lula-branded surface. */
export function ConceptBadge() {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '5px 11px',
        borderRadius: 999,
        border: `1px solid ${LULA_BRAND.coral}`,
        background: LULA_BRAND.coralLight,
        color: LULA_BRAND.coralDark,
        fontFamily: 'var(--lula-mono), monospace',
        fontSize: 12,
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

/** Small "demo data" tag — sits on any panel showing invented figures. */
export function DemoTag({ label = 'demo data' }: { label?: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 8px',
        borderRadius: 999,
        background: LULA_BRAND.sand,
        border: `1px solid ${LULA_BRAND.line}`,
        color: LULA_BRAND.inkSoft,
        fontFamily: 'var(--lula-mono), monospace',
        fontSize: 12,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        fontWeight: 700,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  );
}

/** Bottom-right watermark on mockup surfaces. */
export function Watermark({
  text = 'concept · assembl × the lula inn',
}: {
  text?: string;
}) {
  return (
    <span
      style={{
        position: 'absolute',
        bottom: 12,
        right: 14,
        fontFamily: 'var(--lula-mono), monospace',
        fontSize: 12,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        color: 'rgba(34,31,26,0.32)',
        pointerEvents: 'none',
      }}
    >
      {text}
    </span>
  );
}

/**
 * Cross-brand lockup: assembl × the lula inn, thin brass divider, group note
 * beneath. Honest — stylised marks only, no real Star Group artwork.
 */
export function CrossBrandLockup() {
  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span
          style={{
            fontFamily: 'var(--lula-display), Georgia, serif',
            fontWeight: 600,
            fontSize: 22,
            color: LULA_BRAND.assemblCharcoal,
            letterSpacing: '-0.01em',
          }}
        >
          assembl
        </span>
        <span style={{ width: 1, height: 24, background: LULA_BRAND.brass, opacity: 0.6 }} />
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}>
          <LulaMark size={22} />
          <span
            style={{
              fontFamily: 'var(--lula-display), Georgia, serif',
              fontWeight: 600,
              fontSize: 16,
              color: LULA_BRAND.ocean,
              lineHeight: 1.05,
            }}
          >
            The Lula Inn
          </span>
        </span>
      </div>
      <span
        style={{
          fontFamily: 'var(--lula-mono), monospace',
          fontSize: 12,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: '#8A8678',
        }}
      >
        assembl × the lula inn · a star group venue
      </span>
    </div>
  );
}
