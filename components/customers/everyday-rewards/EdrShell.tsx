import Link from 'next/link';
import { EDR_BRAND, EDR_TENANT } from '@/lib/customers/everyday-rewards/config';
import { RLeafMark, ConceptBadge, CrossBrandLockup } from './marks';
import { EdrNav } from './EdrNav';

const BASE = '/customers/everyday-rewards/dash';

/**
 * The standalone Everyday Rewards pilot chrome. Global assembl chrome is
 * suppressed on `/customers/*` (see site-header/site-footer), so this shell
 * provides the whole frame: orange top bar, r-leaf mark, concept badge, nav,
 * and the honest cross-brand footer lockup.
 */
export function EdrShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: EDR_BRAND.greyLight,
        fontFamily: 'var(--edr-body), Roboto, sans-serif',
        color: EDR_BRAND.charcoal,
      }}
    >
      {/* concept strip */}
      <div
        style={{
          background: EDR_BRAND.navy,
          color: 'rgba(255,255,255,0.82)',
          fontFamily: 'var(--edr-mono), monospace',
          fontSize: 10,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          textAlign: 'center',
          padding: '6px 16px',
        }}
      >
        Concept workspace · not an active Everyday Rewards partnership · shared in
        confidence
      </div>

      {/* top bar */}
      <header
        style={{
          background: EDR_BRAND.white,
          borderBottom: `1px solid ${EDR_BRAND.greyLight}`,
          position: 'sticky',
          top: 0,
          zIndex: 20,
        }}
      >
        <div
          style={{
            maxWidth: 1120,
            margin: '0 auto',
            padding: '14px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <Link
            href={BASE}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 11,
              textDecoration: 'none',
            }}
          >
            <RLeafMark size={38} />
            <span style={{ lineHeight: 1.05 }}>
              <span
                style={{
                  display: 'block',
                  fontFamily: 'var(--edr-body), Roboto, sans-serif',
                  fontWeight: 700,
                  fontSize: 16,
                  color: EDR_BRAND.orange,
                }}
              >
                everyday rewards
              </span>
              <span
                style={{
                  display: 'block',
                  fontFamily: 'var(--edr-mono), monospace',
                  fontSize: 9,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: EDR_BRAND.greyMid,
                  marginTop: 2,
                }}
              >
                × assembl attribution pilot
              </span>
            </span>
          </Link>
          <div style={{ flex: 1 }} />
          <ConceptBadge />
        </div>
        <div
          style={{
            maxWidth: 1120,
            margin: '0 auto',
            padding: '0 20px 12px',
          }}
        >
          <EdrNav />
        </div>
      </header>

      <main>{children}</main>

      {/* footer lockup */}
      <footer
        style={{
          background: EDR_BRAND.white,
          borderTop: `1px solid ${EDR_BRAND.greyLight}`,
          marginTop: 48,
        }}
      >
        <div
          style={{
            maxWidth: 1120,
            margin: '0 auto',
            padding: '32px 24px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 24,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <CrossBrandLockup />
          <p
            style={{
              maxWidth: 460,
              fontSize: 12.5,
              lineHeight: 1.6,
              color: EDR_BRAND.greyMid,
              margin: 0,
            }}
          >
            Concept pitch prepared for {EDR_TENANT.contactName},{' '}
            {EDR_TENANT.contactRole}. All marks are stylised placeholders — no real
            Everyday Rewards or partner logos are used. No live points are minted;
            every tally shown is a demonstration figure.
          </p>
        </div>
      </footer>
    </div>
  );
}
