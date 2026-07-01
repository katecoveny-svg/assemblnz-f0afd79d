import { EDR_BRAND } from '@/lib/customers/everyday-rewards/config';
import { Watermark } from './marks';

/**
 * A phone-shaped frame for app mockups. Provides the status bar, screen
 * background, home indicator and the mandatory concept watermark.
 */
export function PhoneFrame({
  children,
  background = EDR_BRAND.white,
  statusOnDark = false,
  width = 340,
  balance,
}: {
  children: React.ReactNode;
  background?: string;
  statusOnDark?: boolean;
  width?: number;
  /** Optional points balance shown in a header pill. */
  balance?: number;
}) {
  const fg = statusOnDark ? EDR_BRAND.white : EDR_BRAND.navy;
  return (
    <div
      style={{
        width,
        borderRadius: 40,
        background,
        border: `1px solid ${EDR_BRAND.greyLight}`,
        boxShadow: '0 30px 70px rgba(34,48,60,0.22)',
        overflow: 'hidden',
        position: 'relative',
        paddingBottom: 26,
      }}
    >
      {/* status bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 24px 4px',
          fontFamily: 'var(--edr-body), Roboto, sans-serif',
          fontWeight: 700,
          fontSize: 14,
          color: fg,
        }}
      >
        <span>9:41</span>
        <span style={{ fontSize: 12, opacity: 0.9 }}>●●●●● 5G · 84%</span>
      </div>
      {typeof balance === 'number' ? (
        <div
          style={{
            textAlign: 'right',
            padding: '0 24px 4px',
            fontFamily: 'var(--edr-mono), monospace',
            fontSize: 10,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: statusOnDark ? 'rgba(255,255,255,0.75)' : EDR_BRAND.greyMid,
          }}
        >
          points balance
          <strong
            style={{
              display: 'block',
              fontFamily: 'var(--edr-body), Roboto, sans-serif',
              fontSize: 20,
              fontWeight: 700,
              color: fg,
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '-0.01em',
              textTransform: 'none',
            }}
          >
            {balance.toLocaleString('en-NZ')}
          </strong>
        </div>
      ) : null}
      {children}
      {/* home indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: 10,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 120,
          height: 5,
          borderRadius: 3,
          background: statusOnDark ? 'rgba(255,255,255,0.55)' : 'rgba(34,48,60,0.35)',
        }}
      />
      <Watermark onDark={statusOnDark} />
    </div>
  );
}
