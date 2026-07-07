import type { ReactNode } from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export function money(n: number): string {
  return `$${n.toLocaleString('en-NZ', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;
}

/**
 * Glass panel — the base surface. A translucent fill over the cosmic backdrop
 * with a hairline border and a faint top-edge highlight. `glow` adds a coloured
 * halo; `hover` lifts on hover.
 */
export function Card({
  children,
  className = '',
  pad = true,
  glow,
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  pad?: boolean;
  glow?: 'teal' | 'coral' | 'gold';
  hover?: boolean;
}) {
  const shadow =
    glow === 'teal'
      ? 'var(--b-glow-teal)'
      : glow === 'coral'
        ? 'var(--b-glow-coral)'
        : '0 10px 40px -18px rgba(0,0,0,0.6)';
  return (
    <div
      className={`relative rounded-2xl ${pad ? 'p-5 sm:p-6' : ''} ${hover ? 'transition duration-300 hover:-translate-y-0.5' : ''} ${className}`}
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
        border: '1px solid var(--b-line)',
        boxShadow: shadow,
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
    >
      {children}
    </div>
  );
}

export function PageHeading({ title, lead }: { title: string; lead?: string }) {
  return (
    <div className="mb-6">
      <h1
        className="text-2xl font-extrabold tracking-tight sm:text-[30px]"
        style={{ fontFamily: 'var(--font-bills-display)', color: 'var(--b-ink)', letterSpacing: '-0.01em' }}
      >
        {title}
      </h1>
      {lead && (
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed" style={{ color: 'var(--b-muted)' }}>
          {lead}
        </p>
      )}
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: 'var(--b-faint)' }}>
      {children}
    </p>
  );
}

const CATEGORY_TINT: Record<string, { bg: string; fg: string }> = {
  Electricity: { bg: 'rgba(90,173,160,0.15)', fg: '#7FCFC0' },
  Broadband: { bg: 'rgba(127,178,200,0.15)', fg: '#9FCBDE' },
  Insurance: { bg: 'rgba(169,139,214,0.16)', fg: '#C3AAE6' },
  Council: { bg: 'rgba(233,196,106,0.15)', fg: '#EACB78' },
  Subscriptions: { bg: 'rgba(242,130,94,0.16)', fg: '#F5A184' },
  Mobile: { bg: 'rgba(111,207,151,0.15)', fg: '#8FD9AE' },
  Gas: { bg: 'rgba(192,161,106,0.16)', fg: '#D4B87E' },
  KiwiSaver: { bg: 'rgba(90,173,160,0.15)', fg: '#7FCFC0' },
  ACC: { bg: 'rgba(233,196,106,0.15)', fg: '#EACB78' },
};

export function CategoryTag({ category }: { category: string }) {
  const t = CATEGORY_TINT[category] ?? { bg: 'rgba(255,255,255,0.08)', fg: 'var(--b-muted)' };
  return (
    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ background: t.bg, color: t.fg }}>
      {category}
    </span>
  );
}

export function SourceBadge({ source }: { source: string }) {
  return (
    <span className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--b-faint)' }}>
      {source}
    </span>
  );
}

export function TrendChip({ trend, note }: { trend?: 'up' | 'down' | 'flat'; note?: string }) {
  if (!trend) return null;
  const map = {
    up: { Icon: ArrowUpRight, color: '#F5A184', bg: 'rgba(242,130,94,0.16)' },
    down: { Icon: ArrowDownRight, color: '#7FCFC0', bg: 'rgba(90,173,160,0.16)' },
    flat: { Icon: Minus, color: 'var(--b-faint)', bg: 'rgba(255,255,255,0.06)' },
  }[trend];
  const { Icon } = map;
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ background: map.bg, color: map.color }}>
      <Icon size={12} />
      {note ?? (trend === 'flat' ? 'Steady' : trend === 'up' ? 'Up' : 'Down')}
    </span>
  );
}

export function Cite({ children }: { children: ReactNode }) {
  return (
    <span className="text-[11px]" style={{ color: 'var(--b-faint)' }}>
      {children}
    </span>
  );
}
