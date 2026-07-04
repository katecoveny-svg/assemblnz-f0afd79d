import type { CSSProperties, ReactNode } from 'react';
import Link from 'next/link';

/**
 * Admin UI kit — the locked canon brand applied to the operator hub.
 *
 * Cormorant Garamond headlines · Lato body · Space Mono labels/numerals ·
 * champagne-gold highlights · cream cards on a paper canvas. Fonts are loaded in
 * app/admin/layout.tsx and exposed as the --admin-* CSS variables; these
 * primitives reference them inline so headings beat the global Fraunces rule
 * without touching globals.css.
 *
 * Everything here is presentational and server-component-safe (no hooks).
 */

// Locked palette (CANON-LOCKED-2026-06-23)
export const C = {
  gold: '#BFA37A',
  goldDeep: '#8A6B4E',
  goldEyebrow: '#BFA37A',
  pale: '#FFF1C2',
  ink: '#3A3832',
  body: '#56544B',
  muted: '#8A8678',
  paper: '#FFFFFF',
  cream: '#FFF7EC',
  hairline: '#EFEADC',
  canvas: '#FBF8F1',
  ok: '#3A7D6E',
  warn: '#C98A1B',
  bad: '#B5533A',
} as const;

// The site root (CANON-LOCKED-2026-06-23) already exposes these tokens:
// --font-display = Cormorant Garamond, --font-body = Lato, --font-mono = Space Mono.
export const DISPLAY = 'var(--font-display), "Cormorant Garamond", Georgia, serif';
export const BODY = 'var(--font-body), Lato, system-ui, sans-serif';
export const MONO = 'var(--font-mono), "Space Mono", ui-monospace, monospace';

// ── Eyebrow (Space Mono, tracked, gold) ──────────────────────────────────────
export function Eyebrow({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        fontFamily: MONO,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: C.goldEyebrow,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── Page header: eyebrow + Cormorant H1 + lede ───────────────────────────────
export function PageHeader({
  eyebrow,
  title,
  lede,
  actions,
}: {
  eyebrow: string;
  title: string;
  lede?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: 16,
        flexWrap: 'wrap',
        marginBottom: 28,
      }}
    >
      <div>
        <Eyebrow style={{ marginBottom: 10 }}>{eyebrow}</Eyebrow>
        <h1
          style={{
            fontFamily: DISPLAY,
            fontWeight: 600,
            fontSize: 44,
            lineHeight: 1.02,
            letterSpacing: '-0.02em',
            color: C.ink,
            margin: 0,
          }}
        >
          {title}
        </h1>
        {lede && (
          <p style={{ fontFamily: BODY, color: C.body, fontSize: 15.5, margin: '10px 0 0', maxWidth: 620 }}>
            {lede}
          </p>
        )}
      </div>
      {actions && <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>{actions}</div>}
    </header>
  );
}

// ── Section heading (Cormorant) ──────────────────────────────────────────────
export function SectionTitle({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <h2
      style={{
        fontFamily: DISPLAY,
        fontWeight: 600,
        fontSize: 26,
        letterSpacing: '-0.01em',
        color: C.ink,
        margin: '38px 0 16px',
        ...style,
      }}
    >
      {children}
    </h2>
  );
}

// ── Card ─────────────────────────────────────────────────────────────────────
export function Card({
  children,
  style,
  tone = 'paper',
}: {
  children: ReactNode;
  style?: CSSProperties;
  tone?: 'paper' | 'cream';
}) {
  return (
    <div
      style={{
        background: tone === 'cream' ? C.cream : C.paper,
        border: `1px solid ${C.hairline}`,
        borderRadius: 18,
        boxShadow: '0 16px 40px rgba(180,150,40,.07)',
        padding: 22,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── Stat card (Space Mono numeral) ───────────────────────────────────────────
export function StatCard({
  label,
  value,
  hint,
  href,
  tone,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  href?: string;
  tone?: 'ok' | 'warn' | 'bad';
}) {
  const accent = tone === 'ok' ? C.ok : tone === 'warn' ? C.warn : tone === 'bad' ? C.bad : C.ink;
  const inner = (
    <Card
      style={{
        padding: '18px 20px',
        height: '100%',
        transition: 'transform .15s ease, box-shadow .15s ease',
      }}
    >
      <div
        style={{
          fontFamily: MONO,
          fontSize: 10.5,
          fontWeight: 700,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: C.muted,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: MONO,
          fontSize: 34,
          fontWeight: 700,
          color: accent,
          lineHeight: 1.1,
          margin: '8px 0 0',
        }}
      >
        {value}
      </div>
      {hint && (
        <div style={{ fontFamily: BODY, fontSize: 13, color: C.body, marginTop: 6 }}>{hint}</div>
      )}
    </Card>
  );
  if (href) {
    return (
      <Link href={href} style={{ textDecoration: 'none', display: 'block' }}>
        {inner}
      </Link>
    );
  }
  return inner;
}

export function Grid({ min = 220, gap = 14, children }: { min?: number; gap?: number; children: ReactNode }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, minmax(${min}px, 1fr))`,
        gap,
      }}
    >
      {children}
    </div>
  );
}

// ── Pill / status badge ──────────────────────────────────────────────────────
const TONE_PILL: Record<string, { bg: string; fg: string }> = {
  ok: { bg: 'rgba(58,125,110,.12)', fg: C.ok },
  warn: { bg: 'rgba(201,138,27,.14)', fg: C.warn },
  bad: { bg: 'rgba(181,83,58,.12)', fg: C.bad },
  gold: { bg: 'rgba(191,163,122,.25)', fg: '#8A6B4E' },
  neutral: { bg: C.cream, fg: C.body },
};

export function Pill({
  children,
  tone = 'neutral',
  style,
}: {
  children: ReactNode;
  tone?: keyof typeof TONE_PILL;
  style?: CSSProperties;
}) {
  const t = TONE_PILL[tone] ?? TONE_PILL.neutral;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        background: t.bg,
        color: t.fg,
        fontFamily: MONO,
        fontSize: 10.5,
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        padding: '4px 10px',
        borderRadius: 999,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {children}
    </span>
  );
}

// ── Table ────────────────────────────────────────────────────────────────────
export function Table({ head, children }: { head: ReactNode[]; children: ReactNode }) {
  return (
    <div
      style={{
        overflowX: 'auto',
        background: C.paper,
        border: `1px solid ${C.hairline}`,
        borderRadius: 16,
        boxShadow: '0 16px 40px rgba(180,150,40,.06)',
      }}
    >
      <table style={{ borderCollapse: 'collapse', width: '100%', fontFamily: BODY, fontSize: 14 }}>
        <thead>
          <tr>
            {head.map((h, i) => (
              <th
                key={i}
                style={{
                  textAlign: 'left',
                  padding: '12px 16px',
                  borderBottom: `1px solid ${C.hairline}`,
                  fontFamily: MONO,
                  fontSize: 10.5,
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: C.muted,
                  whiteSpace: 'nowrap',
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export const td: CSSProperties = {
  padding: '12px 16px',
  borderBottom: `1px solid ${C.hairline}`,
  color: C.ink,
  verticalAlign: 'middle',
};

export function Empty({ children }: { children: ReactNode }) {
  return (
    <Card
      tone="cream"
      style={{
        textAlign: 'center',
        padding: '36px 24px',
        fontFamily: BODY,
        color: C.body,
        fontSize: 14.5,
      }}
    >
      {children}
    </Card>
  );
}

// ── Buttons / links ──────────────────────────────────────────────────────────
export function GoldButton({
  children,
  type = 'submit',
  style,
}: {
  children: ReactNode;
  type?: 'submit' | 'button';
  style?: CSSProperties;
}) {
  return (
    <button
      type={type}
      style={{
        fontFamily: BODY,
        fontWeight: 700,
        fontSize: 14,
        color: C.ink,
        background: C.gold,
        border: 'none',
        borderRadius: 999,
        padding: '9px 18px',
        cursor: 'pointer',
        boxShadow: '0 6px 16px rgba(191, 163, 122,.32)',
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export function LinkPill({ href, children, external }: { href: string; children: ReactNode; external?: boolean }) {
  const style: CSSProperties = {
    fontFamily: BODY,
    fontWeight: 700,
    fontSize: 13.5,
    color: C.ink,
    background: C.paper,
    border: `1.5px solid ${C.ink}`,
    borderRadius: 999,
    padding: '7px 15px',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    whiteSpace: 'nowrap',
  };
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" style={style}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} style={style}>
      {children}
    </Link>
  );
}

export function nzDate(iso: string | null | undefined, withTime = true): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-NZ', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  });
}
