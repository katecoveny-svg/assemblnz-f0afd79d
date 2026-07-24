import { EDR_BRAND } from '@/lib/customers/everyday-rewards/config';

export function Container({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 24px', ...style }}>
      {children}
    </div>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: 'var(--edr-mono), monospace',
        fontSize: 10.5,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: EDR_BRAND.orange,
        marginBottom: 14,
      }}
    >
      {children}
    </div>
  );
}

export function DisplayHeading({
  children,
  size = 40,
  color = EDR_BRAND.navy,
  style,
}: {
  children: React.ReactNode;
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}) {
  return (
    <h2
      style={{
        fontFamily: 'var(--edr-display), Georgia, serif',
        fontWeight: 500,
        fontSize: size,
        lineHeight: 1.08,
        letterSpacing: '-0.01em',
        color,
        margin: 0,
        ...style,
      }}
    >
      {children}
    </h2>
  );
}

export function Card({
  children,
  style,
  className,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        background: EDR_BRAND.white,
        borderRadius: 20,
        padding: 24,
        boxShadow: '0 10px 34px rgba(34,48,60,0.07)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Stat({
  value,
  label,
  accent = false,
}: {
  value: string;
  label: string;
  accent?: boolean;
}) {
  return (
    <div>
      <div
        style={{
          fontFamily: 'var(--edr-body), Roboto, sans-serif',
          fontWeight: 700,
          fontSize: 34,
          letterSpacing: '-0.02em',
          color: accent ? EDR_BRAND.orange : EDR_BRAND.navy,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 13,
          lineHeight: 1.4,
          color: EDR_BRAND.greyMid,
          marginTop: 4,
          maxWidth: 220,
        }}
      >
        {label}
      </div>
    </div>
  );
}

export function OrangeButton({
  children,
  href,
  onClick,
  secondary = false,
  type = 'button',
}: {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  secondary?: boolean;
  type?: 'button' | 'submit';
}) {
  const style: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '13px 22px',
    borderRadius: 12,
    fontFamily: 'var(--edr-body), Roboto, sans-serif',
    fontWeight: 700,
    fontSize: 15,
    letterSpacing: '0.01em',
    textDecoration: 'none',
    cursor: 'pointer',
    border: secondary ? `2px solid ${EDR_BRAND.orange}` : '2px solid transparent',
    background: secondary ? EDR_BRAND.white : EDR_BRAND.orange,
    color: secondary ? EDR_BRAND.orange : EDR_BRAND.white,
    boxShadow: secondary ? 'none' : '0 6px 14px rgba(198,81,0,0.30)',
  };
  if (href) {
    return (
      <a href={href} style={style}>
        {children}
      </a>
    );
  }
  return (
    <button type={type} onClick={onClick} style={style}>
      {children}
    </button>
  );
}
