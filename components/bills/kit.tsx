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
        : '0 10px 40px -18px rgba(26,25,24,0.12)';
  return (
    <div
      className={`relative rounded-2xl ${pad ? 'p-5 sm:p-6' : ''} ${hover ? 'transition duration-300 hover:-translate-y-0.5' : ''} ${className}`}
      style={{
        background: '#FFFFFF',
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
        className="text-2xl font-semibold tracking-tight sm:text-[30px]"
        style={{ fontFamily: "var(--font-bills-display), system-ui, sans-serif", color: 'var(--b-ink)', letterSpacing: '0.01em' }}
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
    <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.14em]" style={{ color: 'var(--b-faint)' }}>
      {children}
    </p>
  );
}

const CATEGORY_TINT: Record<string, { bg: string; fg: string }> = {
  Electricity: { bg: 'rgba(36,11,33,0.10)', fg: '#240B21' },
  Broadband: { bg: 'rgba(74,107,140,0.15)', fg: '#4A6B8C' },
  Insurance: { bg: 'rgba(122,95,168,0.16)', fg: '#7A5FA8' },
  Council: { bg: 'rgba(145,106,112,0.15)', fg: '#7A555B' },
  Subscriptions: { bg: 'rgba(142,47,58,0.16)', fg: '#8E2F3A' },
  Mobile: { bg: 'rgba(101,74,78,0.14)', fg: '#654A4E' },
  Gas: { bg: 'rgba(138,107,78,0.16)', fg: '#8A6B4E' },
  KiwiSaver: { bg: 'rgba(47,107,79,0.15)', fg: '#2F6B4F' },
  ACC: { bg: 'rgba(145,106,112,0.15)', fg: '#7A555B' },
};

export function CategoryTag({ category }: { category: string }) {
  const t = CATEGORY_TINT[category] ?? { bg: 'rgba(26,25,24,0.06)', fg: 'var(--b-muted)' };
  return (
    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-semibold" style={{ background: t.bg, color: t.fg }}>
      {category}
    </span>
  );
}

export function SourceBadge({ source }: { source: string }) {
  return (
    <span className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[12px] font-medium" style={{ background: 'rgba(26,25,24,0.05)', color: 'var(--b-faint)' }}>
      {source}
    </span>
  );
}

export function TrendChip({ trend, note }: { trend?: 'up' | 'down' | 'flat'; note?: string }) {
  if (!trend) return null;
  const map = {
    up: { Icon: ArrowUpRight, color: '#8E2F3A', bg: 'rgba(142,47,58,0.16)' },
    down: { Icon: ArrowDownRight, color: '#2F6B4F', bg: 'rgba(47,107,79,0.16)' },
    flat: { Icon: Minus, color: 'var(--b-faint)', bg: 'rgba(26,25,24,0.05)' },
  }[trend];
  const { Icon } = map;
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-medium" style={{ background: map.bg, color: map.color }}>
      <Icon size={12} />
      {note ?? (trend === 'flat' ? 'Steady' : trend === 'up' ? 'Up' : 'Down')}
    </span>
  );
}

export function Cite({ children }: { children: ReactNode }) {
  return (
    <span className="text-[12px]" style={{ color: 'var(--b-faint)' }}>
      {children}
    </span>
  );
}
