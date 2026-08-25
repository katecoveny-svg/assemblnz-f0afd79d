import { LULA_BRAND, type LulaVenue } from '@/lib/customers/lula-inn/brand';
import type { Traffic } from '@/lib/customers/lula-inn/demo-data';
import { DemoTag } from './marks';

const B = LULA_BRAND;

export function Container({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 24px', ...style }}>
      {children}
    </div>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: 'var(--lula-mono), monospace',
        fontSize: 12,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: B.coral,
        marginBottom: 12,
      }}
    >
      {children}
    </div>
  );
}

export function DisplayHeading({
  children,
  size = 38,
  color = B.ocean,
  style,
}: {
  children: React.ReactNode;
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}) {
  return (
    <h1
      style={{
        fontFamily: 'var(--lula-display), Georgia, serif',
        fontWeight: 600,
        fontSize: size,
        lineHeight: 1.08,
        letterSpacing: '-0.01em',
        color,
        margin: 0,
        ...style,
      }}
    >
      {children}
    </h1>
  );
}

/** Standard page header used at the top of every module. */
export function PageHeader({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
}) {
  return (
    <div style={{ marginBottom: 26 }}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <DisplayHeading size={40}>{title}</DisplayHeading>
      {intro ? (
        <p
          style={{
            fontFamily: 'var(--lula-body), system-ui, sans-serif',
            fontSize: 16,
            lineHeight: 1.6,
            color: B.inkSoft,
            maxWidth: 720,
            margin: '14px 0 0',
          }}
        >
          {intro}
        </p>
      ) : null}
    </div>
  );
}

export function Card({
  children,
  style,
  pad = 22,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  pad?: number;
}) {
  return (
    <div
      style={{
        background: B.cream,
        borderRadius: 18,
        padding: pad,
        border: `1px solid ${B.line}`,
        boxShadow: '0 8px 26px rgba(14,77,74,0.06)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** Section wrapper with a heading, optional demo tag, and a card grid. */
export function Section({
  title,
  basis,
  demo = true,
  children,
  style,
}: {
  title: string;
  basis?: string;
  demo?: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <section style={{ marginBottom: 34, ...style }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
          marginBottom: 14,
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--lula-display), Georgia, serif',
            fontWeight: 600,
            fontSize: 22,
            color: B.ocean,
            margin: 0,
          }}
        >
          {title}
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {basis ? (
            <span
              style={{
                fontFamily: 'var(--lula-mono), monospace',
                fontSize: 12,
                letterSpacing: '0.08em',
                color: B.brassDark,
                textTransform: 'uppercase',
              }}
            >
              {basis}
            </span>
          ) : null}
          {demo ? <DemoTag /> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

export function Stat({
  value,
  label,
  tone = 'ink',
}: {
  value: string;
  label: string;
  tone?: 'ink' | 'coral' | 'green' | 'amber' | 'red';
}) {
  const color =
    tone === 'coral' ? B.coral : tone === 'green' ? B.green : tone === 'amber' ? B.amber : tone === 'red' ? B.red : B.ocean;
  return (
    <div>
      <div
        style={{
          fontFamily: 'var(--lula-display), Georgia, serif',
          fontWeight: 600,
          fontSize: 32,
          letterSpacing: '-0.01em',
          color,
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1.05,
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 12.5, lineHeight: 1.4, color: B.inkSoft, marginTop: 5, maxWidth: 220 }}>
        {label}
      </div>
    </div>
  );
}

const TRAFFIC_COLORS: Record<Traffic, { dot: string; bg: string; text: string }> = {
  green: { dot: LULA_BRAND.green, bg: LULA_BRAND.greenBg, text: '#1c5637' },
  amber: { dot: LULA_BRAND.amber, bg: LULA_BRAND.amberBg, text: '#7c5610' },
  red: { dot: LULA_BRAND.red, bg: LULA_BRAND.redBg, text: '#8c271b' },
};

export function StatusDot({ status }: { status: Traffic }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 10,
        height: 10,
        borderRadius: 999,
        background: TRAFFIC_COLORS[status].dot,
        flexShrink: 0,
      }}
    />
  );
}

export function Pill({
  children,
  status,
  tone,
}: {
  children: React.ReactNode;
  status?: Traffic;
  tone?: { bg: string; text: string };
}) {
  const c = status ? TRAFFIC_COLORS[status] : null;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '3px 10px',
        borderRadius: 999,
        background: tone?.bg ?? c?.bg ?? B.sand,
        color: tone?.text ?? c?.text ?? B.inkSoft,
        fontFamily: 'var(--lula-body), system-ui, sans-serif',
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  );
}

/** Lightweight data table used across modules. */
export function Table({
  columns,
  rows,
}: {
  columns: { key: string; label: string; align?: 'left' | 'right' | 'center'; width?: string }[];
  rows: Record<string, React.ReactNode>[];
}) {
  return (
    <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontFamily: 'var(--lula-body), system-ui, sans-serif',
          fontSize: 13.5,
          minWidth: 480,
        }}
      >
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                style={{
                  textAlign: c.align ?? 'left',
                  padding: '9px 12px',
                  borderBottom: `1.5px solid ${B.line}`,
                  fontFamily: 'var(--lula-mono), monospace',
                  fontSize: 12,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: B.inkSoft,
                  fontWeight: 700,
                  width: c.width,
                  whiteSpace: 'nowrap',
                }}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{ background: i % 2 ? 'rgba(244,237,225,0.5)' : 'transparent' }}>
              {columns.map((c) => (
                <td
                  key={c.key}
                  style={{
                    textAlign: c.align ?? 'left',
                    padding: '10px 12px',
                    borderBottom: `1px solid ${B.line}`,
                    color: B.ink,
                    verticalAlign: 'middle',
                    fontVariantNumeric: c.align === 'right' ? 'tabular-nums' : undefined,
                  }}
                >
                  {r[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Grid({
  min = 240,
  gap = 16,
  children,
  style,
}: {
  min?: number;
  gap?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(${min}px, 1fr))`,
        gap,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** Venue-scope chip row shown on group-aware modules (finance, staff). */
export function VenueScope({ venues, active }: { venues: LulaVenue[]; active: string }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
      {venues.map((v) => {
        const on = v.slug === active;
        return (
          <span
            key={v.slug}
            style={{
              padding: '6px 13px',
              borderRadius: 999,
              fontFamily: 'var(--lula-body), system-ui, sans-serif',
              fontSize: 12.5,
              fontWeight: on ? 700 : 500,
              background: on ? B.ocean : B.white,
              color: on ? B.cream : B.inkSoft,
              border: `1px solid ${on ? B.ocean : B.line}`,
            }}
          >
            {v.name}
            {v.isPilot ? ' · pilot' : ''}
          </span>
        );
      })}
    </div>
  );
}

/** Money formatter — NZD, no cents unless asked. */
export function nzd(n: number, cents = false): string {
  return new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: 'NZD',
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0,
  }).format(n);
}
