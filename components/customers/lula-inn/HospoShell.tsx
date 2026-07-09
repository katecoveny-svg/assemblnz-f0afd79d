import Link from 'next/link';
import { LULA_BRAND, LULA_TENANT } from '@/lib/customers/lula-inn/brand';
import { LulaMark, ConceptBadge, CrossBrandLockup } from './marks';
import { HospoNav } from './HospoNav';
import { OsMotionField } from '@/components/ops/shared/OsMotion';

const B = LULA_BRAND;
const BASE = '/customers/lula-inn/hospo';
const PATTERN = '/brand/lula-inn/pattern-service.svg';

/**
 * The standalone Lula Inn ops chrome. Global assembl chrome is suppressed on
 * `/customers/*` (see site-header/site-footer), so this shell provides the whole
 * frame: concept strip, warm top bar, Lula mark, concept badge, module nav, and
 * the honest cross-brand footer lockup.
 */
export function HospoShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        overflow: 'hidden',
        background: B.sand,
        fontFamily: 'var(--lula-body), system-ui, sans-serif',
        color: B.ink,
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${PATTERN})`,
          backgroundRepeat: 'repeat',
          backgroundSize: '360px auto',
          opacity: 0.07,
          pointerEvents: 'none',
        }}
      />
      <OsMotionField accent={B.brass} secondary={B.coral} />
      {/* concept strip */}
      <div
        style={{
          position: 'relative',
          background: B.ocean,
          color: 'rgba(251,246,236,0.86)',
          fontFamily: 'var(--lula-mono), monospace',
          fontSize: 10,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          textAlign: 'center',
          padding: '6px 16px',
        }}
      >
        Concept workspace · not an active Star Group partnership · shared in confidence
      </div>

      {/* top bar */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          background: B.cream,
          borderBottom: `1px solid ${B.line}`,
        }}
      >
        <div
          style={{
            maxWidth: 1160,
            margin: '0 auto',
            padding: '13px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            flexWrap: 'wrap',
          }}
        >
          <Link href={`${BASE}/today`} style={{ display: 'flex', alignItems: 'center', gap: 11, textDecoration: 'none' }}>
            <LulaMark size={38} />
            <span style={{ lineHeight: 1.08 }}>
              <span
                style={{
                  display: 'block',
                  fontFamily: 'var(--lula-display), Georgia, serif',
                  fontWeight: 600,
                  fontSize: 18,
                  color: B.ocean,
                }}
              >
                The Lula Inn
              </span>
              <span
                style={{
                  display: 'block',
                  fontFamily: 'var(--lula-mono), monospace',
                  fontSize: 9,
                  letterSpacing: '0.13em',
                  textTransform: 'uppercase',
                  color: B.inkSoft,
                  marginTop: 2,
                }}
              >
                ops · a star group venue × assembl
              </span>
            </span>
          </Link>
          <div style={{ flex: 1 }} />
          <ConceptBadge />
        </div>
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 20px 11px', overflowX: 'auto' }}>
          <HospoNav />
        </div>
      </header>

      <main style={{ position: 'relative', padding: '30px 0 12px' }}>{children}</main>

      {/* footer lockup */}
      <footer style={{ background: B.cream, borderTop: `1px solid ${B.line}`, marginTop: 40 }}>
        <div
          style={{
            maxWidth: 1160,
            margin: '0 auto',
            padding: '30px 24px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 24,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <CrossBrandLockup />
          <p style={{ maxWidth: 520, fontSize: 12.5, lineHeight: 1.6, color: B.inkSoft, margin: 0 }}>
            Concept pitch prepared for {LULA_TENANT.contactName} — {LULA_TENANT.address}. All
            marks are stylised placeholders — no real Star Group or Lula Inn logos are used.
            No real staff, revenue, rosters or menu items appear here; every figure is
            demonstration data. Booking, POS and Xero/MYOB integrations are scaffolded only.
          </p>
        </div>
      </footer>
    </div>
  );
}
