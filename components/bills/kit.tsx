import type { ReactNode } from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { BILLS } from '@/app/bills/theme';

export function money(n: number): string {
  return `$${n.toLocaleString('en-NZ', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;
}

/** A warm-paper card — the base surface for every panel. */
export function Card({
  children,
  className = '',
  pad = true,
}: {
  children: ReactNode;
  className?: string;
  pad?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl ${pad ? 'p-5 sm:p-6' : ''} ${className}`}
      style={{ background: 'var(--b-surface)', border: '1px solid var(--b-line)' }}
    >
      {children}
    </div>
  );
}

export function PageHeading({ title, lead }: { title: string; lead?: string }) {
  return (
    <div className="mb-6">
      <h1
        className="text-2xl font-bold tracking-tight sm:text-[28px]"
        style={{ fontFamily: 'var(--font-bills-display)', color: 'var(--b-ink)' }}
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
    <p className="mb-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--b-faint)' }}>
      {children}
    </p>
  );
}

const CATEGORY_TINT: Record<string, { bg: string; fg: string }> = {
  Electricity: { bg: BILLS.tealSoft, fg: BILLS.tealDeep },
  Broadband: { bg: '#EDF1F5', fg: '#4A6478' },
  Insurance: { bg: '#F3EEF1', fg: '#7A5468' },
  Council: { bg: BILLS.ochreSoft, fg: BILLS.ochre },
  Subscriptions: { bg: BILLS.coralSoft, fg: BILLS.coralDeep },
  Mobile: { bg: '#EEF2EE', fg: '#4C6350' },
  Gas: { bg: '#F1EFE7', fg: '#7A7444' },
  KiwiSaver: { bg: BILLS.tealSoft, fg: BILLS.tealDeep },
  ACC: { bg: BILLS.ochreSoft, fg: BILLS.ochre },
};

export function CategoryTag({ category }: { category: string }) {
  const t = CATEGORY_TINT[category] ?? { bg: BILLS.surfaceAlt, fg: BILLS.muted };
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
      style={{ background: t.bg, color: t.fg }}
    >
      {category}
    </span>
  );
}

export function SourceBadge({ source }: { source: string }) {
  return (
    <span
      className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium"
      style={{ background: 'var(--b-surface-alt)', color: 'var(--b-faint)' }}
    >
      {source}
    </span>
  );
}

export function TrendChip({ trend, note }: { trend?: 'up' | 'down' | 'flat'; note?: string }) {
  if (!trend) return null;
  const map = {
    up: { Icon: ArrowUpRight, color: BILLS.coralDeep, bg: BILLS.coralSoft },
    down: { Icon: ArrowDownRight, color: BILLS.tealDeep, bg: BILLS.tealSoft },
    flat: { Icon: Minus, color: BILLS.faint, bg: BILLS.surfaceAlt },
  }[trend];
  const { Icon } = map;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
      style={{ background: map.bg, color: map.color }}
    >
      <Icon size={12} />
      {note ?? (trend === 'flat' ? 'Steady' : trend === 'up' ? 'Up' : 'Down')}
    </span>
  );
}

/** A cited claim — small stat + source, used to ground positioning. */
export function Cite({ children }: { children: ReactNode }) {
  return (
    <span className="text-[11px]" style={{ color: 'var(--b-faint)' }}>
      {children}
    </span>
  );
}
